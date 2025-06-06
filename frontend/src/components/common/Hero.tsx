import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { BriefcaseBusiness, Building, User, ArrowRight } from 'lucide-react';

export default function Hero() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.2,
        delayChildren: 0.3,
      }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.6, ease: "easeOut" } }
  };

  const buttonVariants = {
    hidden: { scale: 0.9, opacity: 0 },
    visible: { scale: 1, opacity: 1, transition: { duration: 0.5, ease: "easeOut" } }
  };

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-background to-background/90 pt-32 pb-20 md:pt-40 md:pb-32">
      {/* Background effects */}
      <div className="absolute inset-0 z-0 opacity-20">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/3 right-1/4 w-64 h-64 bg-secondary/20 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-4xl mx-auto text-center"
        >
          <motion.div variants={itemVariants}>
            <BriefcaseBusiness className="inline-block h-12 w-12 text-primary mb-6" />
          </motion.div>
          
          <motion.h1 
            variants={itemVariants}
            className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6"
          >
            The Smarter Way to <span className="text-primary">Recruit</span> and Get <span className="text-primary">Recruited</span>
          </motion.h1>
          
          <motion.p 
            variants={itemVariants}
            className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto"
          >
            Connect with top talent and opportunities through our AI-powered recruitment platform designed for the modern workforce.
          </motion.p>
          
          <motion.div 
            variants={containerVariants}
            className="flex flex-col sm:flex-row justify-center gap-4 mb-16"
          >
            <motion.div variants={buttonVariants}>
              <Button asChild size="lg" className="group">
                <Link to="/register?role=recruiter" className="flex items-center">
                  <Building className="mr-2 h-5 w-5" />
                  I'm a Recruiter
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </motion.div>
            
            <motion.div variants={buttonVariants}>
              <Button asChild variant="outline" size="lg" className="group">
                <Link to="/register?role=candidate" className="flex items-center">
                  <User className="mr-2 h-5 w-5" />
                  I'm a Candidate
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </motion.div>
          </motion.div>
          
          <motion.div 
            variants={itemVariants}
            className="flex flex-wrap justify-center gap-6"
          >
            <div className="flex items-center">
              <div className="w-12 h-12 flex items-center justify-center rounded-full bg-primary/10">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="font-medium">10,000+ Jobs</p>
                <p className="text-sm text-muted-foreground">Updated daily</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <div className="w-12 h-12 flex items-center justify-center rounded-full bg-primary/10">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="font-medium">Fast Hiring</p>
                <p className="text-sm text-muted-foreground">73% faster than average</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <div className="w-12 h-12 flex items-center justify-center rounded-full bg-primary/10">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="font-medium">5000+ Companies</p>
                <p className="text-sm text-muted-foreground">From startups to enterprises</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}