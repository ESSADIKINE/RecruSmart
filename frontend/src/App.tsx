// Assure-toi que ce fichier est bien inclus dans le build Vite/tsconfig avec jsx: 'react-jsx'.
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from "@/components/ui/toaster";

// Layouts
import DashboardLayout from '@/layouts/DashboardLayout';
import AuthLayout from '@/layouts/AuthLayout';

// Pages
import Home from '@/pages/public/Home';
import Login from '@/pages/public/Login';
import Register from '@/pages/public/Register';
import About from '@/pages/public/About';
import Contact from '@/pages/public/Contact';
import FAQ from '@/pages/public/FAQ';
import Otp from '@/pages/public/Otp';
import ResetPassword from '@/pages/public/ResetPassword';
import ChangePassword from '@/pages/public/ChangePassword';
import Offres from '@/pages/candidat/Offres';
import OffreDetail from '@/pages/candidat/OffreDetail';
import Postuler from '@/pages/candidat/Postuler';
import ProfilCandidat from '@/pages/candidat/ProfilCandidat';
import UploadCv from '@/pages/candidat/UploadCv';
import MesOffres from '@/pages/recruteur/MesOffres';
import OffreDetailRecruteur from '@/pages/recruteur/OffreDetailRecruteur';
import CandidatsOffre from '@/pages/recruteur/CandidatsOffre';
import EditOffre from '@/pages/recruteur/EditOffre';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import CandidateDashboard from '@/pages/admin/CandidateDashboard';
import RecruiterDashboard from '@/pages/admin/RecruiterDashboard';
import JobListings from '@/pages/admin/JobListings';
import ApplicationStatus from '@/pages/admin/ApplicationStatus';
import Profile from '@/pages/admin/Profile';
import PostJob from '@/pages/admin/PostJob';
import ManageApplicants from '@/pages/admin/ManageApplicants';
import NotFound from '@/pages/public/NotFound';

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
            
            <Route path="/accueil" element={<Home />} />
            <Route path="/a-propos" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/faq" element={<FAQ />} />

            {/* Auth Routes */}
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/inscription" element={<Register />} />
              <Route path="/otp" element={<Otp />} />
              <Route path="/password" element={<ResetPassword />} />
            </Route>
            

            <Route path="/changer-mot-de-passe" element={<ChangePassword />} />

            {/* Dashboard Routes */}
            <Route element={<DashboardLayout />}>
              {/* Candidate Routes */}
              <Route path="/offres" element={<Offres />} />
              <Route path="/offres/:id" element={<OffreDetail />} />
              <Route path="/postuler/:id" element={<Postuler />} />
              <Route path="/profil" element={<ProfilCandidat />} />
              <Route path="/upload-cv" element={<UploadCv />} />

              {/* Recruiter Routes */}
              <Route path="/mes-offres" element={<MesOffres />} />
              <Route path="/recruteur/offres/:id" element={<OffreDetailRecruteur />} />
              <Route path="/recruteur/offres/:id/candidats" element={<CandidatsOffre />} />
              <Route path="/recruteur/offres/:id/edit" element={<EditOffre />} />

              {/* Other Dashboards */}
              <Route path="/dashboard/candidate" element={<CandidateDashboard />} />
              <Route path="/dashboard/jobs" element={<JobListings />} />
              <Route path="/dashboard/applications" element={<ApplicationStatus />} />
              <Route path="/dashboard/profile" element={<Profile />} />
              
              {/* Recruiter Routes */}
              <Route path="/dashboard/recruiter" element={<RecruiterDashboard />} />
              <Route path="/dashboard/post-job" element={<PostJob />} />
              <Route path="/dashboard/applicants" element={<ManageApplicants />} />

              <Route path="/admin/dashboard" element={<AdminDashboard />} />
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