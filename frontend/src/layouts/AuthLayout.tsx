import { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function AuthLayout() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const navigate = useNavigate();
  
  // Redirect if already authenticated
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      if (user?.role === 'candidate') {
        navigate('/dashboard/candidate', { replace: true });
      } else if (user?.role === 'recruiter') {
        navigate('/dashboard/recruiter', { replace: true });
      }
    }
  }, [isAuthenticated, isLoading, navigate, user]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        when: "beforeChildren",
        staggerChildren: 0.1,
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/90 flex flex-col">
      <div className="container mx-auto p-4">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => navigate('/')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex-1 flex items-center justify-center p-4"
      >
        <motion.div 
          variants={itemVariants}
          className="w-full max-w-md"
        >
          <Outlet />
        </motion.div>
      </motion.div>

      <div className="container mx-auto p-4 text-center text-muted-foreground text-sm">
        <p>&copy; {new Date().getFullYear()} RecruSmart. All rights reserved.</p>
      </div>
    </div>
  );
}