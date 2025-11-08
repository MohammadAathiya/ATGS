import { useState, useEffect } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import api from '../../lib/api'

export default function CalendarView({ initialEvents = [], onEventUpdate }) {
  const [events, setEvents] = useState(initialEvents.length ? initialEvents : [])
  const [loading, setLoading] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [notification, setNotification] = useState(null)

  // Fetch events from API on mount
  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    try {
      setLoading(true)
      
      // First, try to load generated timetable from localStorage
      const generatedTimetable = localStorage.getItem('atgs_generated_timetable')
      if (generatedTimetable) {
        const timetable = JSON.parse(generatedTimetable)
        // Convert string dates back to Date objects
        const eventsWithDates = timetable.map(event => ({
          ...event,
          start: new Date(event.start),
          end: new Date(event.end)
        }))
        setEvents(eventsWithDates)
        setLoading(false)
        return
      }
      
      // Try API if no local data
      try {
        const response = await api.get('/api/timetable/events')
        setEvents(response.data || [])
      } catch (apiError) {
        console.log('API not available, using sample data')
        // Use sample data if API fails
        setEvents([
          { 
            id: '1', 
            title: 'CS101 - Data Structures', 
            start: new Date(new Date().setHours(9, 0, 0)),
            end: new Date(new Date().setHours(10, 0, 0)),
            backgroundColor: '#667eea',
            extendedProps: {
              faculty: 'Dr. Smith',
              room: 'Room 101',
              section: 'A'
            }
          },
          { 
            id: '2', 
            title: 'CS102 - Algorithms', 
            start: new Date(new Date().setHours(11, 0, 0)),
            end: new Date(new Date().setHours(12, 30, 0)),
            backgroundColor: '#764ba2',
            extendedProps: {
              faculty: 'Dr. Johnson',
              room: 'Room 202',
              section: 'B'
            }
          },
        ])
      }
    } catch (error) {
      console.error('Error fetching events:', error)
    } finally {
      setLoading(false)
    }
  }

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 3000)
  }

  const handleDateSelect = (info) => {
    const title = prompt('Enter event title:')
    if (!title) return

    const newEvent = {
      id: String(Date.now()),
      title,
      start: info.start,
      end: info.end,
      allDay: info.allDay,
      backgroundColor: '#667eea',
    }

    // Save to API
    saveEvent(newEvent)
    setEvents((prev) => [...prev, newEvent])
    showNotification('Event created successfully!')
  }

  const handleEventClick = (info) => {
    setSelectedEvent(info.event)
    setShowModal(true)
  }

  const handleEventChange = async (changeInfo) => {
    const { event } = changeInfo
    
    const updatedEvent = {
      id: event.id,
      title: event.title,
      start: event.start,
      end: event.end,
      allDay: event.allDay,
    }

    try {
      // Update via API
      await api.put(`/api/timetable/events/${event.id}`, updatedEvent)
      
      setEvents((prev) => prev.map((e) => 
        e.id === event.id ? { ...e, ...updatedEvent } : e
      ))
      
      showNotification('Event updated successfully!')
      
      if (onEventUpdate) {
        onEventUpdate(updatedEvent)
      }
    } catch (error) {
      console.error('Error updating event:', error)
      showNotification('Failed to update event', 'error')
      changeInfo.revert()
    }
  }

  const saveEvent = async (event) => {
    try {
      await api.post('/api/timetable/events', event)
    } catch (error) {
      console.error('Error saving event:', error)
    }
  }

  const deleteEvent = async () => {
    if (!selectedEvent) return
    
    if (!confirm('Are you sure you want to delete this event?')) return

    try {
      await api.delete(`/api/timetable/events/${selectedEvent.id}`)
      setEvents((prev) => prev.filter((e) => e.id !== selectedEvent.id))
      showNotification('Event deleted successfully!')
      setShowModal(false)
      setSelectedEvent(null)
    } catch (error) {
      console.error('Error deleting event:', error)
      showNotification('Failed to delete event', 'error')
    }
  }

  return (
    <div className="space-y-4">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-xl animate-bounce ${
          notification.type === 'success' 
            ? 'bg-green-500 text-white' 
            : 'bg-red-500 text-white'
        }`}>
          {notification.type === 'success' ? '✅' : '⚠️'} {notification.message}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          <p className="mt-4 text-gray-600">Loading timetable...</p>
        </div>
      )}

      {/* Calendar */}
      <div className="bg-white rounded-xl shadow-xl border-2 border-purple-100 overflow-hidden">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          selectable
          editable
          droppable
          events={events}
          select={handleDateSelect}
          eventClick={handleEventClick}
          eventDrop={handleEventChange}
          eventResize={handleEventChange}
          height={700}
          slotMinTime="08:00:00"
          slotMaxTime="19:00:00"
          slotDuration="00:30:00"
          weekends={false}
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay',
          }}
          eventContent={(arg) => (
            <div className="p-1 text-xs">
              <div className="font-bold">{arg.event.title}</div>
              {arg.event.extendedProps.faculty && (
                <div className="text-white/80">👨‍🏫 {arg.event.extendedProps.faculty}</div>
              )}
              {arg.event.extendedProps.room && (
                <div className="text-white/80">🏫 {arg.event.extendedProps.room}</div>
              )}
            </div>
          )}
        />
      </div>

      {/* Event Details Modal */}
      {showModal && selectedEvent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">📅 Event Details</h3>
            <div className="space-y-3 text-gray-700">
              <div>
                <strong>Title:</strong> {selectedEvent.title}
              </div>
              <div>
                <strong>Start:</strong> {selectedEvent.start?.toLocaleString()}
              </div>
              <div>
                <strong>End:</strong> {selectedEvent.end?.toLocaleString()}
              </div>
              {selectedEvent.extendedProps?.faculty && (
                <div>
                  <strong>Faculty:</strong> {selectedEvent.extendedProps.faculty}
                </div>
              )}
              {selectedEvent.extendedProps?.room && (
                <div>
                  <strong>Room:</strong> {selectedEvent.extendedProps.room}
                </div>
              )}
              {selectedEvent.extendedProps?.section && (
                <div>
                  <strong>Section:</strong> {selectedEvent.extendedProps.section}
                </div>
              )}
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={deleteEvent}
                className="flex-1 px-4 py-2 rounded-lg bg-red-500 text-white font-bold hover:bg-red-600 transition-all"
              >
                🗑️ Delete
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 rounded-lg bg-gray-200 text-gray-700 font-bold hover:bg-gray-300 transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
