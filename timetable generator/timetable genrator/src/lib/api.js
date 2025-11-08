import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api',
})

api.interceptors.request.use((config) => {
  const raw = localStorage.getItem('atgs_token')
  if (raw) config.headers.Authorization = `Bearer ${raw}`
  return config
})

export default api
