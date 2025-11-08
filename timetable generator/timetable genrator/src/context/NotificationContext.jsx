import { createContext, useContext, useState, useEffect } from 'react'
import { io } from 'socket.io-client'

const NotificationContext = createContext()

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider')
  }
  return context
}

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([])

  // Add notification
  const addNotification = (message, type = 'info', duration = 5000) => {
    const id = Date.now()
    const notification = {
      id,
      message,
      type, // 'success', 'error', 'warning', 'info'
      timestamp: new Date(),
    }

    setNotifications(prev => [...prev, notification])

    // Auto-remove after duration
    if (duration > 0) {
      setTimeout(() => {
        removeNotification(id)
      }, duration)
    }

    return id
  }

  // Remove notification
  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  // Clear all notifications
  const clearAll = () => {
    setNotifications([])
  }

  // Real-time notifications via Socket.io
  useEffect(() => {
    // Derive socket host from API base (strip trailing /api)
    const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'
    const socketBase = apiBase.replace(/\/api\/?$/, '')
    const socket = io(socketBase, { transports: ['websocket'] })

    socket.on('connect', () => {
      addNotification('Connected to notifications', 'info', 2000)
    })

    socket.on('notify', (payload) => {
      if (!payload) return
      const { message, type } = payload
      addNotification(message || 'Update received', type || 'info')
    })

    socket.on('disconnect', () => {
      addNotification('Disconnected from notifications', 'warning', 2000)
    })

    return () => {
      try { socket.close() } catch {}
    }
  }, [])

  return (
    <NotificationContext.Provider value={{ 
      notifications, 
      addNotification, 
      removeNotification, 
      clearAll 
    }}>
      {children}
      <NotificationContainer notifications={notifications} onRemove={removeNotification} />
    </NotificationContext.Provider>
  )
}

function NotificationContainer({ notifications, onRemove }) {
  if (notifications.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 max-w-md">
      {notifications.map(notification => (
        <NotificationItem 
          key={notification.id} 
          notification={notification} 
          onRemove={onRemove} 
        />
      ))}
    </div>
  )
}

function NotificationItem({ notification, onRemove }) {
  const { id, message, type } = notification

  const styles = {
    success: 'bg-green-500 border-green-600',
    error: 'bg-red-500 border-red-600',
    warning: 'bg-yellow-500 border-yellow-600',
    info: 'bg-blue-500 border-blue-600',
  }

  const icons = {
    success: '✅',
    error: '⚠️',
    warning: '⚡',
    info: 'ℹ️',
  }

  return (
    <div className={`${styles[type]} text-white px-6 py-4 rounded-lg shadow-2xl border-2 flex items-start gap-3 animate-slide-in`}>
      <span className="text-2xl">{icons[type]}</span>
      <div className="flex-1">
        <p className="font-medium">{message}</p>
        <p className="text-xs text-white/80 mt-1">
          {notification.timestamp.toLocaleTimeString()}
        </p>
      </div>
      <button
        onClick={() => onRemove(id)}
        className="text-white/80 hover:text-white transition-colors"
      >
        ✕
      </button>
    </div>
  )
}
