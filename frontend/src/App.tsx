// Assure-toi que ce fichier est bien inclus dans le build Vite/tsconfig avec jsx: 'react-jsx'.
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from "@/components/ui/toaster";

// Layouts
import DashboardLayout from '@/layouts/DashboardLayout';
import AuthLayout from '@/layouts/AuthLayout';

// Pages
import Home from '@/pages/Home';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import CandidateDashboard from '@/pages/dashboard/CandidateDashboard';
import RecruiterDashboard from '@/pages/dashboard/RecruiterDashboard';
import JobListings from '@/pages/dashboard/JobListings';
import ApplicationStatus from '@/pages/dashboard/ApplicationStatus';
import Profile from '@/pages/dashboard/Profile';
import PostJob from '@/pages/dashboard/PostJob';
import ManageApplicants from '@/pages/dashboard/ManageApplicants';
import NotFound from '@/pages/NotFound';

// Context
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            
            {/* Auth Routes */}
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
            </Route>
            
            {/* Dashboard Routes */}
            <Route element={<DashboardLayout />}>
              {/* Candidate Routes */}
              <Route path="/dashboard/candidate" element={<CandidateDashboard />} />
              <Route path="/dashboard/jobs" element={<JobListings />} />
              <Route path="/dashboard/applications" element={<ApplicationStatus />} />
              <Route path="/dashboard/profile" element={<Profile />} />
              
              {/* Recruiter Routes */}
              <Route path="/dashboard/recruiter" element={<RecruiterDashboard />} />
              <Route path="/dashboard/post-job" element={<PostJob />} />
              <Route path="/dashboard/applicants" element={<ManageApplicants />} />
            </Route>
            
            {/* 404 Page */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;