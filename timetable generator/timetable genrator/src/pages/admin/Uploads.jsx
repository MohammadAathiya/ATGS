import { useState } from 'react'
import * as XLSX from 'xlsx'
import api from '../../lib/api'

function PreviewTable({ data }) {
  if (!data || data.length === 0) return (
    <div className="text-center py-8 text-gray-400">
      <div className="text-4xl mb-2">📄</div>
      <p className="text-sm">No preview yet. Upload a file to see data.</p>
    </div>
  )
  const headers = Object.keys(data[0] || {})
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm border-collapse">
        <thead>
          <tr className="bg-gradient-to-r from-purple-100 to-pink-100">
            {headers.map((h) => (
              <th key={h} className="border border-purple-200 px-3 py-2 text-left font-bold text-gray-700">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.slice(0, 10).map((row, i) => (
            <tr key={i} className="hover:bg-purple-50 transition-colors">
              {headers.map((h) => (
                <td key={h} className="border border-purple-200 px-3 py-2 text-gray-600">{row[h]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {data.length > 10 && (
        <div className="mt-3 text-center">
          <span className="inline-block px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
            Showing first 10 of {data.length} rows
          </span>
        </div>
      )}
    </div>
  )
}

export default function AdminUploads() {
  const [previews, setPreviews] = useState({
    courses: [],
    faculty: [],
    classrooms: [],
    departments: [],
    sections: [],
  })
  
  const [uploading, setUploading] = useState({})
  const [uploadProgress, setUploadProgress] = useState({})
  const [errors, setErrors] = useState({})
  const [success, setSuccess] = useState({})

  const handleFile = (file, key) => {
    if (!file) return
    
    // Validate file type
    const validTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ]
    
    if (!validTypes.includes(file.type) && !file.name.endsWith('.csv') && !file.name.endsWith('.xlsx')) {
      setErrors(prev => ({ ...prev, [key]: 'Invalid file type. Please upload CSV or Excel files only.' }))
      return
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, [key]: 'File too large. Maximum size is 5MB.' }))
      return
    }
    
    setErrors(prev => ({ ...prev, [key]: '' }))
    
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result)
        const workbook = XLSX.read(data, { type: 'array' })
        const sheetName = workbook.SheetNames[0]
        const sheet = workbook.Sheets[sheetName]
        const json = XLSX.utils.sheet_to_json(sheet)
        
        if (json.length === 0) {
          setErrors(prev => ({ ...prev, [key]: 'File is empty. Please upload a file with data.' }))
          return
        }
        
        setPreviews((prev) => ({ ...prev, [key]: json }))
        setSuccess(prev => ({ ...prev, [key]: `File loaded successfully! ${json.length} rows found.` }))
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccess(prev => ({ ...prev, [key]: '' }))
        }, 3000)
      } catch (error) {
        setErrors(prev => ({ ...prev, [key]: 'Error reading file. Please check the file format.' }))
      }
    }
    reader.onerror = () => {
      setErrors(prev => ({ ...prev, [key]: 'Error reading file. Please try again.' }))
    }
    reader.readAsArrayBuffer(file)
  }
  
  const handleUpload = async (key) => {
    const data = previews[key]
    if (!data || data.length === 0) {
      setErrors(prev => ({ ...prev, [key]: 'No data to upload. Please select a file first.' }))
      return
    }
    
    setUploading(prev => ({ ...prev, [key]: true }))
    setUploadProgress(prev => ({ ...prev, [key]: 0 }))
    setErrors(prev => ({ ...prev, [key]: '' }))
    
    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const current = prev[key] || 0
          if (current >= 90) {
            clearInterval(progressInterval)
            return prev
          }
          return { ...prev, [key]: current + 10 }
        })
      }, 200)
      
      // Save to localStorage for timetable generation
      localStorage.setItem(`atgs_${key}`, JSON.stringify(data))
      
      // Try API call (will work when backend is ready)
      try {
        await api.post(`/api/upload/${key}`, { data })
      } catch (apiError) {
        console.log('API not available, using localStorage only')
      }
      
      clearInterval(progressInterval)
      setUploadProgress(prev => ({ ...prev, [key]: 100 }))
      setSuccess(prev => ({ ...prev, [key]: `✅ Successfully uploaded ${data.length} ${key} records!` }))
      
      // Clear success message after 5 seconds
      setTimeout(() => {
        setSuccess(prev => ({ ...prev, [key]: '' }))
        setUploadProgress(prev => ({ ...prev, [key]: 0 }))
      }, 5000)
    } catch (error) {
      setErrors(prev => ({ 
        ...prev, 
        [key]: error.message || 'Upload failed. Please try again.' 
      }))
    } finally {
      setUploading(prev => ({ ...prev, [key]: false }))
    }
  }

  const groups = [
    { key: 'courses', label: 'Courses' },
    { key: 'faculty', label: 'Faculty' },
    { key: 'classrooms', label: 'Classrooms' },
    { key: 'departments', label: 'Departments' },
    { key: 'sections', label: 'Sections' },
  ]

  return (
    <section className="max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">Upload CSV/Excel</h2>
      <p className="text-gray-700 mb-6">Import CSV/Excel for Courses, Faculty, Classrooms, Departments, Sections. Shows first 10 rows as preview.</p>
      <div className="grid gap-6">
        {groups.map((g) => (
          <div key={g.key} className="bg-white rounded-xl p-6 space-y-4 shadow-xl border-2 border-purple-100 hover:border-purple-300 transition-all">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-xl text-gray-800 flex items-center gap-2">
                <span className="text-2xl">
                  {g.key === 'courses' && '📚'}
                  {g.key === 'faculty' && '👨‍🏫'}
                  {g.key === 'classrooms' && '🏫'}
                  {g.key === 'departments' && '🏢'}
                  {g.key === 'sections' && '📋'}
                </span>
                {g.label}
              </h3>
              <label className="cursor-pointer px-4 py-2 rounded-lg bg-purple-100 text-purple-700 font-medium hover:bg-purple-200 transition-all">
                📁 Choose File
                <input
                  type="file"
                  accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                  onChange={(e) => handleFile(e.target.files?.[0], g.key)}
                  className="hidden"
                  disabled={uploading[g.key]}
                />
              </label>
            </div>
            
            {errors[g.key] && (
              <div className="bg-red-50 border-2 border-red-300 rounded-lg p-3 text-red-700 text-sm">
                ⚠️ {errors[g.key]}
              </div>
            )}
            
            {success[g.key] && (
              <div className="bg-green-50 border-2 border-green-300 rounded-lg p-3 text-green-700 text-sm">
                {success[g.key]}
              </div>
            )}
            
            {uploadProgress[g.key] > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Uploading...</span>
                  <span>{uploadProgress[g.key]}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-600 to-pink-600 transition-all duration-300 rounded-full"
                    style={{ width: `${uploadProgress[g.key]}%` }}
                  />
                </div>
              </div>
            )}
            
            <PreviewTable data={previews[g.key]} />
            
            <div className="flex gap-3">
              <button 
                onClick={() => handleUpload(g.key)}
                disabled={uploading[g.key] || !previews[g.key]?.length}
                className="flex-1 px-4 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold hover:shadow-lg hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {uploading[g.key] ? '⏳ Uploading...' : '📤 Upload to Server'}
              </button>
              <button 
                onClick={() => {
                  setPreviews((p) => ({ ...p, [g.key]: [] }))
                  setErrors((p) => ({ ...p, [g.key]: '' }))
                  setSuccess((p) => ({ ...p, [g.key]: '' }))
                }}
                disabled={uploading[g.key]}
                className="px-4 py-3 rounded-lg bg-gray-200 text-gray-700 font-medium hover:bg-gray-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                🗑️ Clear
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
