import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowUpRight, Bell, Check, Clock, FileText, MessageSquare, ThumbsUp } from 'lucide-react';
import JobCard from '@/components/dashboard/JobCard';
import { useAuth } from '@/context/AuthContext';

// Sample data
const recentApplications = [
  {
    id: 1,
    jobTitle: 'Senior Frontend Developer',
    company: 'TechCorp Inc.',
    status: 'In Review',
    appliedDate: '2 days ago',
    icon: <Clock className="h-4 w-4 text-amber-500" />,
    statusColor: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  },
  {
    id: 2,
    jobTitle: 'UX Designer',
    company: 'DesignHub',
    status: 'Interview',
    appliedDate: '1 week ago',
    icon: <MessageSquare className="h-4 w-4 text-blue-500" />,
    statusColor: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  },
  {
    id: 3,
    jobTitle: 'Product Manager',
    company: 'InnoTech',
    status: 'Rejected',
    appliedDate: '2 weeks ago',
    icon: <ThumbsUp className="h-4 w-4 text-red-500" />,
    statusColor: 'bg-red-500/10 text-red-500 border-red-500/20',
  },
];

const recommendedJobs = [
  {
    id: 1,
    title: "Senior React Developer",
    company: "TechCorp Inc.",
    companyLogo: "https://i.pravatar.cc/150?img=1",
    location: "San Francisco, CA (Remote)",
    salary: "$120K - $150K",
    type: "Full-time",
    status: "New",
    description: "We're looking for a Senior React Developer to join our dynamic team. You'll be working on cutting-edge web applications using the latest technologies.",
    skills: ["React", "TypeScript", "Node.js", "Redux"],
    postedDate: "2 days ago",
    applicants: 42
  },
  {
    id: 2,
    title: "Frontend Engineer",
    company: "WebSolutions",
    companyLogo: "https://i.pravatar.cc/150?img=4",
    location: "Remote",
    salary: "$100K - $130K",
    type: "Full-time",
    description: "Join our engineering team to build beautiful, responsive web applications. You'll be working with React, TypeScript, and modern frontend tools.",
    skills: ["React", "JavaScript", "CSS", "HTML"],
    postedDate: "3 days ago",
    applicants: 29
  },
];

export default function CandidateDashboard() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome back, {user?.name}</h1>
          <p className="text-muted-foreground">Here's an overview of your job search activity</p>
        </div>
        <div className="mt-4 md:mt-0 space-x-2">
          <Button variant="outline" className="mr-2">
            <FileText className="mr-2 h-4 w-4" />
            Upload Resume
          </Button>
          <Button>
            <Bell className="mr-2 h-4 w-4" />
            Job Alerts
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Applications</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M12 2v20M2 12h20" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              +3 from last month
            </p>
            <div className="mt-4 h-1 w-full rounded-full bg-secondary">
              <div className="h-1 rounded-full bg-primary" style={{ width: '40%' }} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Profile Views</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">48</div>
            <p className="text-xs text-muted-foreground">
              +12% from last week
            </p>
            <div className="mt-4 h-1 w-full rounded-full bg-secondary">
              <div className="h-1 rounded-full bg-primary" style={{ width: '65%' }} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Profile Completion</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M12 2v20M2 12h20" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">75%</div>
              <Button variant="ghost" size="sm" className="text-primary gap-1">
                Complete <ArrowUpRight className="h-3 w-3" />
              </Button>
            </div>
            <Progress value={75} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              Add work experience to improve your profile
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="activity" className="space-y-6">
        <TabsList>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="recommended">Recommended Jobs</TabsTrigger>
          <TabsTrigger value="saved">Saved Jobs</TabsTrigger>
        </TabsList>
        
        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Applications</CardTitle>
              <CardDescription>Your recent job application activity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentApplications.map((app) => (
                  <div key={app.id} className="flex items-center justify-between border-b last:border-0 pb-4 last:pb-0">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <h3 className="font-medium">{app.jobTitle}</h3>
                        <Badge variant="outline" className={`ml-2 ${app.statusColor}`}>
                          <span className="flex items-center gap-1">
                            {app.icon}
                            {app.status}
                          </span>
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground mt-1 flex items-center gap-4">
                        <span>{app.company}</span>
                        <span>Applied {app.appliedDate}</span>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      View Details
                    </Button>
                  </div>
                ))}
              </div>
              <div className="mt-4 text-center">
                <Button variant="outline">View All Applications</Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Profile Completion Tasks</CardTitle>
              <CardDescription>Complete these tasks to improve your profile</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-green-500/10 flex items-center justify-center">
                    <Check className="h-3.5 w-3.5 text-green-500" />
                  </div>
                  <span className="text-sm line-through text-muted-foreground">Add a profile photo</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-green-500/10 flex items-center justify-center">
                    <Check className="h-3.5 w-3.5 text-green-500" />
                  </div>
                  <span className="text-sm line-through text-muted-foreground">Complete basic information</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                    <div className="h-2 w-2 rounded-full bg-primary"></div>
                  </div>
                  <span className="text-sm">Add work experience (2+ entries recommended)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                    <div className="h-2 w-2 rounded-full bg-primary"></div>
                  </div>
                  <span className="text-sm">Add education details</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                    <div className="h-2 w-2 rounded-full bg-primary"></div>
                  </div>
                  <span className="text-sm">Upload your resume</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="recommended" className="space-y-4">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Jobs matching your profile</h2>
            <Button variant="outline">View all</Button>
          </div>
          
          <div className="grid gap-4">
            {recommendedJobs.map(job => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="saved" className="space-y-4">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Saved Jobs</h2>
          </div>
          
          <Card className="p-8 text-center">
            <div className="mx-auto w-14 h-14 rounded-full bg-muted flex items-center justify-center mb-4">
              <Bookmark className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">No saved jobs yet</h3>
            <p className="text-muted-foreground mb-4">Save jobs you're interested in to view them later</p>
            <Button variant="outline">Browse Jobs</Button>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}