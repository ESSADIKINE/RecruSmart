import { useEffect } from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/common/Navbar';
import Hero from '@/components/common/Hero';
import Footer from '@/components/common/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import JobCard from '@/components/dashboard/JobCard';
import { ArrowRight, CheckCircle2, Globe, Briefcase, Building2 } from 'lucide-react';

// Sample data for featured jobs
const featuredJobs = [
  {
    id: 1,
    title: "Senior React Developer",
    company: "TechCorp Inc.",
    companyLogo: "https://i.pravatar.cc/150?img=1",
    location: "San Francisco, CA (Remote)",
    salary: "$120K - $150K",
    type: "Full-time",
    status: "Featured",
    description: "We're looking for a Senior React Developer to join our dynamic team. You'll be working on cutting-edge web applications using the latest technologies.",
    skills: ["React", "TypeScript", "Node.js", "Redux"],
    postedDate: "2 days ago",
    applicants: 42
  },
  {
    id: 2,
    title: "UX/UI Designer",
    company: "DesignHub",
    companyLogo: "https://i.pravatar.cc/150?img=2",
    location: "New York, NY",
    salary: "$90K - $110K",
    type: "Full-time",
    status: "New",
    description: "Join our creative team to design beautiful, intuitive interfaces for our flagship products. Work closely with product managers and developers.",
    skills: ["Figma", "Adobe XD", "UI Design", "Prototyping"],
    postedDate: "3 days ago",
    applicants: 28
  },
  {
    id: 3,
    title: "Data Scientist",
    company: "DataMinds",
    companyLogo: "https://i.pravatar.cc/150?img=3",
    location: "Remote",
    salary: "$100K - $130K",
    type: "Full-time",
    status: "Urgent",
    description: "We're seeking an experienced Data Scientist to work on challenging problems in machine learning and AI. Join a team of brilliant minds.",
    skills: ["Python", "Machine Learning", "SQL", "Data Visualization"],
    postedDate: "1 week ago",
    applicants: 64
  }
];

// Companies data
const companies = [
  { name: "TechCorp", logo: "https://i.pravatar.cc/150?img=10" },
  { name: "DesignHub", logo: "https://i.pravatar.cc/150?img=20" },
  { name: "DataMinds", logo: "https://i.pravatar.cc/150?img=30" },
  { name: "CloudNine", logo: "https://i.pravatar.cc/150?img=40" },
  { name: "FinEdge", logo: "https://i.pravatar.cc/150?img=50" },
  { name: "GreenTech", logo: "https://i.pravatar.cc/150?img=60" },
];

export default function Home() {
  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Hero Section */}
      <Hero />
      
      {/* Featured Jobs Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-10">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeIn}
            >
              <h2 className="text-3xl font-bold">Featured Jobs</h2>
              <p className="text-muted-foreground mt-2">Explore top opportunities from leading companies</p>
            </motion.div>
            
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeIn}
            >
              <Button variant="outline" className="hidden sm:flex items-center">
                View All Jobs
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </motion.div>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featuredJobs.map((job, index) => (
              <motion.div
                key={job.id}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { 
                    opacity: 1, 
                    y: 0, 
                    transition: { 
                      duration: 0.5,
                      delay: index * 0.1
                    } 
                  }
                }}
              >
                <JobCard job={job} featured={job.status === 'Featured'} />
              </motion.div>
            ))}
          </div>
          
          <div className="mt-8 text-center">
            <Button variant="outline" className="sm:hidden">
              View All Jobs
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>
      
      {/* How It Works Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeIn}
            className="text-center max-w-2xl mx-auto mb-16"
          >
            <h2 className="text-3xl font-bold mb-4">How RecruSmart Works</h2>
            <p className="text-muted-foreground">
              Our platform simplifies the recruitment process for both employers and job seekers,
              making it easier to find the perfect match.
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Globe className="h-10 w-10 text-primary" />,
                title: "Create Your Profile",
                description: "Build your professional profile highlighting your skills, experience, and career goals."
              },
              {
                icon: <Briefcase className="h-10 w-10 text-primary" />,
                title: "Find Relevant Jobs",
                description: "Our AI matching algorithm finds the best opportunities based on your profile and preferences."
              },
              {
                icon: <Building2 className="h-10 w-10 text-primary" />,
                title: "Connect with Employers",
                description: "Apply to jobs with a single click and communicate directly with hiring managers."
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                variants={{
                  hidden: { opacity: 0, y: 30 },
                  visible: { 
                    opacity: 1, 
                    y: 0, 
                    transition: { 
                      duration: 0.5,
                      delay: index * 0.2
                    } 
                  }
                }}
              >
                <Card className="h-full border-none shadow-lg bg-card hover:shadow-xl transition-shadow duration-300">
                  <CardContent className="p-8 flex flex-col items-center text-center">
                    <div className="rounded-full p-4 bg-primary/10 mb-6">{item.icon}</div>
                    <h3 className="text-xl font-semibold mb-4">{item.title}</h3>
                    <p className="text-muted-foreground">{item.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Top Companies Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeIn}
            className="text-center max-w-2xl mx-auto mb-10"
          >
            <h2 className="text-3xl font-bold mb-4">Top Companies Hiring</h2>
            <p className="text-muted-foreground">
              Join industry leaders and fast-growing startups using RecruSmart
            </p>
          </motion.div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {companies.map((company, index) => (
              <motion.div
                key={index}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                variants={{
                  hidden: { opacity: 0, scale: 0.9 },
                  visible: { 
                    opacity: 1, 
                    scale: 1, 
                    transition: { 
                      duration: 0.3,
                      delay: index * 0.1
                    } 
                  }
                }}
              >
                <Card className="h-full hover:shadow-md transition-shadow duration-300 flex items-center justify-center p-6">
                  <img
                    src={company.logo}
                    alt={company.name}
                    className="h-12 w-12 rounded-full object-cover mx-auto"
                  />
                  <p className="mt-2 text-center font-medium">{company.name}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeIn}
            className="max-w-3xl mx-auto text-center"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Transform Your Hiring Process?</h2>
            <p className="text-primary-foreground/80 text-lg mb-8">
              Join thousands of companies and candidates making better connections with RecruSmart.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button size="lg" variant="secondary" className="text-primary">
                Post a Job Now
              </Button>
              <Button size="lg" variant="outline" className="border-primary-foreground text-primary-foreground hover:text-primary hover:bg-primary-foreground">
                Learn More
              </Button>
            </div>
            
            <div className="mt-10 flex flex-col md:flex-row justify-center gap-8">
              {[
                "93% faster hiring process",
                "75% cost reduction",
                "86% better candidate match"
              ].map((stat, index) => (
                <div key={index} className="flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5 mr-2 text-green-400" />
                  <span className="font-medium">{stat}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
}