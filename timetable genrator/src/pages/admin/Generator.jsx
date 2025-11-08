import { useState } from 'react'
import { TimetableGenerator, validateCSVData } from '../../utils/timetableGenerator'
import { useNotifications } from '../../context/NotificationContext'
import api from '../../lib/api'

export default function AdminGenerator() {
  const [generating, setGenerating] = useState(false)
  const [result, setResult] = useState(null)
  const [progress, setProgress] = useState(0)
  const { addNotification } = useNotifications()

  const handleGenerate = async () => {
    setGenerating(true)
    setProgress(0)
    setResult(null)

    try {
      // Get uploaded data from localStorage
      const courses = JSON.parse(localStorage.getItem('atgs_courses') || '[]')
      const faculty = JSON.parse(localStorage.getItem('atgs_faculty') || '[]')
      const classrooms = JSON.parse(localStorage.getItem('atgs_classrooms') || '[]')
      const departments = JSON.parse(localStorage.getItem('atgs_departments') || '[]')
      const sections = JSON.parse(localStorage.getItem('atgs_sections') || '[]')

      setProgress(20)

      // Validate data
      if (courses.length === 0) {
        addNotification('Please upload courses data first', 'error')
        setGenerating(false)
        return
      }

      if (faculty.length === 0) {
        addNotification('Please upload faculty data first', 'error')
        setGenerating(false)
        return
      }

      if (classrooms.length === 0) {
        addNotification('Please upload classrooms data first', 'error')
        setGenerating(false)
        return
      }

      setProgress(40)

      // Try backend generation first
      let generationResult
      try {
        const { data } = await api.post('/timetable/generate', { persist: true })
        // Normalize to expected frontend shape
        const parseTime = (t) => {
          // t like '09:00' -> Date today with that time
          const [h, m] = String(t).split(':').map(Number)
          const d = new Date()
          d.setHours(h || 0, m || 0, 0, 0)
          return d
        }
        const timetable = (data.timetable || []).map((e) => ({
          ...e,
          start: parseTime(e.start),
          end: parseTime(e.end),
        }))

        generationResult = {
          success: data.success,
          timetable,
          conflicts: data.conflicts || [],
          metrics: { optimizationScore: 0, totalAttempts: 0, successfulAssignments: timetable.length },
        }
      } catch (err) {
        // Fallback to client-side generator
        const generator = new TimetableGenerator(
          courses,
          faculty,
          classrooms,
          departments,
          sections
        )
        setProgress(60)
        generationResult = generator.generate()
      }

      setProgress(70)

      // Validate timetable quality
      // If we have a client-side generator available, enrich with validation and conflicts
      try {
        const generator = new TimetableGenerator(
          courses,
          faculty,
          classrooms,
          departments,
          sections
        )
        const validation = generator.validateTimetable()
        generationResult.validation = validation
        const detailedConflicts = generator.detectConflicts(generationResult.timetable)
        generationResult.detailedConflicts = detailedConflicts
      } catch {}

      setProgress(80)

      // Save to localStorage
      localStorage.setItem('atgs_generated_timetable', JSON.stringify(generationResult.timetable))

      setProgress(90)

      setProgress(100)
      setResult(generationResult)

      if (generationResult.success) {
        addNotification(
          `✅ Timetable generated successfully! ${generationResult.timetable.length} classes scheduled.`,
          'success'
        )
      } else {
        addNotification(
          `⚠️ Timetable generated with ${generationResult.conflicts.length} conflicts. Please review.`,
          'warning'
        )
      }
    } catch (error) {
      console.error('Generation error:', error)
      addNotification('Failed to generate timetable: ' + error.message, 'error')
    } finally {
      setGenerating(false)
    }
  }

  const handleReset = () => {
    setResult(null)
    setProgress(0)
    localStorage.removeItem('atgs_generated_timetable')
    addNotification('Timetable reset successfully', 'info')
  }

  return (
    <section className="max-w-6xl mx-auto space-y-6">
      <div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
          Automated Timetable Generator
        </h2>
        <p className="text-gray-600">
          Generate conflict-free timetables automatically using uploaded CSV data
        </p>
      </div>

      {/* Data Status */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {[
          { key: 'courses', label: 'Courses', icon: '📚' },
          { key: 'faculty', label: 'Faculty', icon: '👨‍🏫' },
          { key: 'classrooms', label: 'Classrooms', icon: '🏫' },
          { key: 'departments', label: 'Departments', icon: '🏢' },
          { key: 'sections', label: 'Sections', icon: '📋' },
        ].map(item => {
          const data = JSON.parse(localStorage.getItem(`atgs_${item.key}`) || '[]')
          return (
            <div key={item.key} className="bg-white rounded-lg p-4 border-2 border-purple-100 text-center">
              <div className="text-3xl mb-2">{item.icon}</div>
              <div className="font-bold text-2xl text-purple-600">{data.length}</div>
              <div className="text-sm text-gray-600">{item.label}</div>
            </div>
          )
        })}
      </div>

      {/* Progress Bar */}
      {generating && (
        <div className="bg-white rounded-xl p-6 border-2 border-purple-100">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Generating timetable...</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-purple-600 to-pink-600 transition-all duration-300 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="flex-1 px-6 py-4 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold text-lg hover:shadow-xl hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {generating ? '⏳ Generating...' : '⚡ Generate Timetable'}
        </button>
        <button
          onClick={handleReset}
          disabled={generating}
          className="px-6 py-4 rounded-xl bg-gray-200 text-gray-700 font-bold hover:bg-gray-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          🔄 Reset
        </button>
      </div>

      {/* Results */}
      {result && (
        <div className="space-y-4">
          {/* Summary */}
          <div className="bg-white rounded-xl p-6 border-2 border-purple-100">
            <h3 className="text-xl font-bold text-gray-800 mb-4">📊 Generation Summary</h3>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-3xl font-bold text-green-600">{result.timetable.length}</div>
                <div className="text-sm text-gray-600">Classes Scheduled</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-3xl font-bold text-blue-600">
                  {new Set(result.timetable.map(t => t.faculty)).size}
                </div>
                <div className="text-sm text-gray-600">Faculty Assigned</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-3xl font-bold text-purple-600">
                  {new Set(result.timetable.map(t => t.classroom)).size}
                </div>
                <div className="text-sm text-gray-600">Rooms Used</div>
              </div>
            </div>
          </div>

          {/* Detailed Conflicts */}
          {result.detailedConflicts && result.detailedConflicts.length > 0 && (
            <div className="bg-red-50 rounded-xl p-6 border-2 border-red-200">
              <h3 className="text-xl font-bold text-red-800 mb-4">⚠️ Conflicts Detected ({result.detailedConflicts.length})</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {result.detailedConflicts.map((conflict, index) => {
                  const severityColors = {
                    high: 'bg-red-100 border-red-300 text-red-800',
                    medium: 'bg-orange-100 border-orange-300 text-orange-800',
                    low: 'bg-yellow-100 border-yellow-300 text-yellow-800'
                  }
                  const severityIcons = {
                    high: '🚨',
                    medium: '⚠️',
                    low: 'ℹ️'
                  }
                  return (
                    <div key={index} className={`p-3 rounded-lg border-2 ${severityColors[conflict.severity]}`}>
                      <div className="flex items-start gap-2">
                        <span className="text-xl">{severityIcons[conflict.severity]}</span>
                        <div className="flex-1">
                          <div className="font-bold text-sm uppercase">{conflict.type.replace('_', ' ')}</div>
                          <div className="text-sm mt-1">{conflict.message}</div>
                          {conflict.courses && (
                            <div className="text-xs mt-1 opacity-75">
                              Courses: {conflict.courses.join(', ')}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Validation Errors */}
          {result.validation && result.validation.errors.length > 0 && (
            <div className="bg-orange-50 rounded-xl p-6 border-2 border-orange-200">
              <h3 className="text-xl font-bold text-orange-800 mb-4">📋 Validation Errors ({result.validation.errors.length})</h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {result.validation.errors.map((error, index) => (
                  <div key={index} className="bg-white p-3 rounded-lg border border-orange-200">
                    <div className="font-medium text-orange-700">{error.course} - Section {error.section}</div>
                    <div className="text-sm text-orange-600">{error.message}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Validation Warnings */}
          {result.validation && result.validation.warnings.length > 0 && (
            <div className="bg-yellow-50 rounded-xl p-6 border-2 border-yellow-200">
              <h3 className="text-xl font-bold text-yellow-800 mb-4">💡 Warnings ({result.validation.warnings.length})</h3>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {result.validation.warnings.map((warning, index) => (
                  <div key={index} className="bg-white p-3 rounded-lg border border-yellow-200">
                    <div className="text-sm text-yellow-700">{warning.message}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quality Metrics */}
          {result.metrics && (
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border-2 border-blue-200">
              <h3 className="text-xl font-bold text-gray-800 mb-4">📈 Quality Metrics</h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-lg border border-blue-200">
                  <div className="text-sm text-gray-600 mb-1">Optimization Score</div>
                  <div className="text-3xl font-bold text-blue-600">{result.metrics.optimizationScore}%</div>
                  <div className="text-xs text-gray-500 mt-1">Algorithm efficiency</div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-green-200">
                  <div className="text-sm text-gray-600 mb-1">Success Rate</div>
                  <div className="text-3xl font-bold text-green-600">
                    {Math.round((result.metrics.successfulAssignments / result.metrics.totalAttempts) * 100)}%
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Assignment accuracy</div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-purple-200">
                  <div className="text-sm text-gray-600 mb-1">Total Attempts</div>
                  <div className="text-3xl font-bold text-purple-600">{result.metrics.totalAttempts}</div>
                  <div className="text-xs text-gray-500 mt-1">Scheduling iterations</div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-orange-200">
                  <div className="text-sm text-gray-600 mb-1">Successful</div>
                  <div className="text-3xl font-bold text-orange-600">{result.metrics.successfulAssignments}</div>
                  <div className="text-xs text-gray-500 mt-1">Classes scheduled</div>
                </div>
              </div>
            </div>
          )}

          {/* Quality Report */}
          {result.quality && (
            <div className="grid lg:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl p-6 border-2 border-gray-100">
                <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <span className="text-2xl">📊</span>
                  Day Balance
                </h4>
                <div className="space-y-2">
                  {Object.entries(result.quality.dayBalance.distribution).map(([day, count]) => (
                    <div key={day} className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">{day}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full" 
                            style={{ width: `${(count / result.quality.dayBalance.average) * 50}%` }}
                          />
                        </div>
                        <span className="text-sm font-bold text-gray-800 w-8">{count}</span>
                      </div>
                    </div>
                  ))}
                  <div className="pt-2 border-t">
                    <div className="text-xs text-gray-600">
                      {result.quality.dayBalance.balanced ? 
                        <span className="text-green-600 font-medium">✓ Well balanced</span> : 
                        <span className="text-orange-600 font-medium">⚠ Needs balancing</span>
                      }
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 border-2 border-gray-100">
                <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <span className="text-2xl">👥</span>
                  Faculty Workload
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Average</span>
                    <span className="text-lg font-bold text-gray-800">{result.quality.facultyWorkload.average} hrs</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Maximum</span>
                    <span className="text-lg font-bold text-orange-600">{result.quality.facultyWorkload.max} hrs</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Minimum</span>
                    <span className="text-lg font-bold text-blue-600">{result.quality.facultyWorkload.min} hrs</span>
                  </div>
                  <div className="pt-2 border-t">
                    <div className="text-xs text-gray-600">
                      {result.quality.facultyWorkload.balanced ? 
                        <span className="text-green-600 font-medium">✓ Evenly distributed</span> : 
                        <span className="text-orange-600 font-medium">⚠ Uneven distribution</span>
                      }
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 border-2 border-gray-100">
                <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <span className="text-2xl">🕐</span>
                  Time Distribution
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Morning (9-12)</span>
                    <span className="text-lg font-bold text-green-600">{result.quality.timeDistribution.morning}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Afternoon (2-5)</span>
                    <span className="text-lg font-bold text-blue-600">{result.quality.timeDistribution.afternoon}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Morning %</span>
                    <span className="text-lg font-bold text-purple-600">{result.quality.timeDistribution.morningPercentage}%</span>
                  </div>
                  <div className="pt-2 border-t">
                    <div className="text-xs text-gray-600">
                      {result.quality.timeDistribution.optimal ? 
                        <span className="text-green-600 font-medium">✓ Optimal distribution</span> : 
                        <span className="text-orange-600 font-medium">⚠ More afternoon classes</span>
                      }
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Success Message */}
          {result.success && (
            <div className="bg-green-50 rounded-xl p-6 border-2 border-green-200 text-center">
              <div className="text-5xl mb-3">✅</div>
              <h3 className="text-2xl font-bold text-green-800 mb-2">Timetable Generated Successfully!</h3>
              <p className="text-green-700">
                No conflicts detected. Optimization score: {result.metrics?.optimizationScore || 0}%. You can now view the timetable in the Faculty or Student sections.
              </p>
            </div>
          )}

          {/* Sample Preview */}
          <div className="bg-white rounded-xl p-6 border-2 border-purple-100">
            <h3 className="text-xl font-bold text-gray-800 mb-4">📅 Sample Schedule (First 10 entries)</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-gradient-to-r from-purple-100 to-pink-100">
                    <th className="border border-purple-200 px-3 py-2 text-left">Day</th>
                    <th className="border border-purple-200 px-3 py-2 text-left">Time</th>
                    <th className="border border-purple-200 px-3 py-2 text-left">Course</th>
                    <th className="border border-purple-200 px-3 py-2 text-left">Faculty</th>
                    <th className="border border-purple-200 px-3 py-2 text-left">Room</th>
                    <th className="border border-purple-200 px-3 py-2 text-left">Section</th>
                  </tr>
                </thead>
                <tbody>
                  {result.timetable.slice(0, 10).map((entry, index) => (
                    <tr key={index} className="hover:bg-purple-50">
                      <td className="border border-purple-200 px-3 py-2">{entry.day}</td>
                      <td className="border border-purple-200 px-3 py-2">
                        {entry.start.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="border border-purple-200 px-3 py-2 font-medium">{entry.courseCode}</td>
                      <td className="border border-purple-200 px-3 py-2">{entry.faculty}</td>
                      <td className="border border-purple-200 px-3 py-2">{entry.classroom}</td>
                      <td className="border border-purple-200 px-3 py-2">{entry.section}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
