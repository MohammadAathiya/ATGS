import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import Home from './pages/Home.jsx'
import About from './pages/About.jsx'
import Login from './pages/auth/Login.jsx'
import Signup from './pages/auth/Signup.jsx'
import AdminDashboard from './pages/admin/Dashboard.jsx'
import FacultyDashboard from './pages/faculty/Dashboard.jsx'
import StudentDashboard from './pages/student/Dashboard.jsx'
import NotFound from './pages/NotFound.jsx'
import RoleGuard from './components/RoleGuard.jsx'
import AdminUploads from './pages/admin/Uploads.jsx'
import AdminGenerator from './pages/admin/Generator.jsx'
import AdminConflicts from './pages/admin/Conflicts.jsx'
import AdminAnalytics from './pages/admin/Analytics.jsx'
import AdminReports from './pages/admin/Reports.jsx'
import FacultySchedule from './pages/faculty/Schedule.jsx'
import FacultyUnavailability from './pages/faculty/Unavailability.jsx'
import FacultyRequests from './pages/faculty/Requests.jsx'
import FacultyAnalytics from './pages/faculty/Analytics.jsx'
import StudentTimetable from './pages/student/Timetable.jsx'
import StudentNotifications from './pages/student/Notifications.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="about" element={<About />} />
        <Route path="auth">
          <Route path="login" element={<Login />} />
          <Route path="signup" element={<Signup />} />
        </Route>
        <Route element={<RoleGuard allow={["Admin"]} />}>
          <Route path="admin" element={<AdminDashboard />} />
          <Route path="admin/uploads" element={<AdminUploads />} />
          <Route path="admin/generator" element={<AdminGenerator />} />
          <Route path="admin/conflicts" element={<AdminConflicts />} />
          <Route path="admin/analytics" element={<AdminAnalytics />} />
          <Route path="admin/reports" element={<AdminReports />} />
        </Route>
        <Route element={<RoleGuard allow={["Faculty"]} />}>
          <Route path="faculty" element={<FacultyDashboard />} />
          <Route path="faculty/schedule" element={<FacultySchedule />} />
          <Route path="faculty/unavailability" element={<FacultyUnavailability />} />
          <Route path="faculty/requests" element={<FacultyRequests />} />
          <Route path="faculty/analytics" element={<FacultyAnalytics />} />
        </Route>
        <Route element={<RoleGuard allow={["Student"]} />}>
          <Route path="student" element={<StudentDashboard />} />
          <Route path="student/timetable" element={<StudentTimetable />} />
          <Route path="student/notifications" element={<StudentNotifications />} />
        </Route>
        <Route path="404" element={<NotFound />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Route>
    </Routes>
  )
}
