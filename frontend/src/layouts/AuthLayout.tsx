import { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';

/**
 * AuthLayout
 * - Redirects authenticated users to the appropriate dashboard.
 * - Displays public auth pages (login, register, etc.) strictly centered.
 */
export default function AuthLayout() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const navigate = useNavigate();

  // ───────────────────────────────────────────────────────────
  // Redirect if already authenticated
  // ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      if (user?.role === 'candidate') {
        navigate('/dashboard/candidate', { replace: true });
      } else if (user?.role === 'recruiter') {
        navigate('/dashboard/recruiter', { replace: true });
      }
    }
  }, [isAuthenticated, isLoading, navigate, user]);

  // Motion variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { when: 'beforeChildren', staggerChildren: 0.1 },
    },
  } as const;

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  } as const;

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  return (
    <div className="relative flex flex-col min-h-screen">
      {/* ─── Centered content ──────────────────────────────── */}
      <main className="flex-grow flex items-center justify-center px-4 sm:px-8 md:px-12 lg:px-16 xl:px-24">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-md w-full mx-auto"
        >
          <motion.div variants={itemVariants} className="max-w-md w-full mx-auto">
            <Outlet />
          </motion.div>
        </motion.div>
      </main>

      {/* ─── Footer (bottom‑center) ─────────────────────────── */}
      <footer className="absolute bottom-4 inset-x-0 text-center text-muted-foreground text-sm">
        <p>&copy; {new Date().getFullYear()} RecruSmart. All rights reserved.</p>
      </footer>
    </div>
  );
}
