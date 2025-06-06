import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  BarChart4,
  BriefcaseBusiness,
  FileText,
  Plus,
  Users,
  ArrowDownUp,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowUpRight,
  Calendar
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/context/AuthContext';

// Sample data
const jobListings = [
  {
    id: 1,
    title: 'Senior React Developer',
    datePosted: '1 week ago',
    applicants: 24,
    status: 'Active',
    statusColor: 'bg-green-500/10 text-green-500 border-green-500/20',
    views: 156
  },
  {
    id: 2,
    title: 'UX/UI Designer',
    datePosted: '3 days ago',
    applicants: 18,
    status: 'Active',
    statusColor: 'bg-green-500/10 text-green-500 border-green-500/20',
    views: 112
  },
  {
    id: 3,
    title: 'Product Manager',
    datePosted: '2 weeks ago',
    applicants: 32,
    status: 'Closed',
    statusColor: 'bg-red-500/10 text-red-500 border-red-500/20',
    views: 210
  }
];

const applicants = [
  {
    id: 1,
    name: 'Sarah Johnson',
    avatar: 'https://i.pravatar.cc/150?img=5',
    position: 'Senior React Developer',
    appliedDate: '2 days ago',
    status: 'Shortlisted',
    statusIcon: <CheckCircle className="h-4 w-4 text-green-500" />,
    statusColor: 'bg-green-500/10 text-green-500 border-green-500/20'
  },
  {
    id: 2,
    name: 'Michael Chen',
    avatar: 'https://i.pravatar.cc/150?img=6',
    position: 'UX/UI Designer',
    appliedDate: '4 days ago',
    status: 'In Review',
    statusIcon: <Clock className="h-4 w-4 text-amber-500" />,
    statusColor: 'bg-amber-500/10 text-amber-500 border-amber-500/20'
  },
  {
    id: 3,
    name: 'Emma Wilson',
    avatar: 'https://i.pravatar.cc/150?img=7',
    position: 'Senior React Developer',
    appliedDate: '1 week ago',
    status: 'Rejected',
    statusIcon: <XCircle className="h-4 w-4 text-red-500" />,
    statusColor: 'bg-red-500/10 text-red-500 border-red-500/20'
  },
  {
    id: 4,
    name: 'Daniel Garcia',
    avatar: 'https://i.pravatar.cc/150?img=8',
    position: 'Product Manager',
    appliedDate: '3 days ago',
    status: 'New',
    statusIcon: <AlertCircle className="h-4 w-4 text-blue-500" />,
    statusColor: 'bg-blue-500/10 text-blue-500 border-blue-500/20'
  }
];

// Sample upcoming events/interviews
const upcomingEvents = [
  {
    id: 1,
    title: 'Interview with Sarah Johnson',
    date: 'Today, 2:00 PM',
    type: 'Technical Interview'
  },
  {
    id: 2,
    title: 'Interview with Daniel Garcia',
    date: 'Tomorrow, 10:30 AM',
    type: 'Initial Screening'
  },
  {
    id: 3,
    title: 'Team Meeting - Hiring Plan',
    date: 'Jul 15, 9:00 AM',
    type: 'Internal Meeting'
  }
];

export default function RecruiterDashboard() {
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState('week');

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome back, {user?.name}</h1>
          <p className="text-muted-foreground">Here's an overview of your recruitment activity</p>
        </div>
        <div className="mt-4 md:mt-0">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Post New Job
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Job Listings</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">
              3 active, 5 closed
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Applicants</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">142</div>
            <p className="text-xs text-muted-foreground">
              +22 in the last week
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">New Applications</CardTitle>
            <BriefcaseBusiness className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">18</div>
            <p className="text-xs text-muted-foreground">
              Waiting for review
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Hire Rate</CardTitle>
            <BarChart4 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12%</div>
            <div className="mt-2 h-1.5 w-full rounded-full bg-secondary">
              <div className="h-1.5 rounded-full bg-primary" style={{ width: '12%' }} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content - 2 Columns on larger screens */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="space-y-6 lg:col-span-2">
          {/* Active Job Listings */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Job Listings</CardTitle>
                <CardDescription>Manage your current job postings</CardDescription>
              </div>
              <Select defaultValue="all">
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Jobs</SelectItem>
                  <SelectItem value="active">Active Only</SelectItem>
                  <SelectItem value="closed">Closed Only</SelectItem>
                </SelectContent>
              </Select>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {jobListings.map((job) => (
                  <div key={job.id} className="flex items-center justify-between border-b last:border-0 py-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate">{job.title}</h3>
                      <div className="text-sm text-muted-foreground mt-1 flex items-center gap-4">
                        <span>Posted {job.datePosted}</span>
                        <span>{job.applicants} applicants</span>
                        <span>{job.views} views</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={job.statusColor}>
                        {job.status}
                      </Badge>
                      <Button variant="ghost" size="icon">
                        <ArrowDownUp className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 text-center">
                <Button variant="outline">View All Jobs</Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Applicants */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Applicants</CardTitle>
              <CardDescription>Latest candidates who applied to your jobs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {applicants.map((applicant) => (
                  <div key={applicant.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={applicant.avatar}
                        alt={applicant.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <h3 className="font-medium">{applicant.name}</h3>
                        <div className="text-sm text-muted-foreground flex items-center gap-2">
                          <span>{applicant.position}</span>
                          <span className="text-xs">•</span>
                          <span>{applicant.appliedDate}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={applicant.statusColor}>
                        <span className="flex items-center gap-1">
                          {applicant.statusIcon}
                          {applicant.status}
                        </span>
                      </Badge>
                      <Button variant="ghost" size="sm">
                        View
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 text-center">
                <Button variant="outline">View All Applicants</Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Hiring Funnel */}
          <Card>
            <CardHeader>
              <CardTitle>Hiring Funnel</CardTitle>
              <CardDescription>Applicant status distribution</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <div className="text-sm">All Applicants</div>
                    <div className="text-sm font-medium">142</div>
                  </div>
                  <Progress value={100} className="h-2" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <div className="text-sm">Reviewed</div>
                    <div className="text-sm font-medium">124</div>
                  </div>
                  <Progress value={87} className="h-2" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <div className="text-sm">Interviewing</div>
                    <div className="text-sm font-medium">36</div>
                  </div>
                  <Progress value={25} className="h-2" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <div className="text-sm">Offer Made</div>
                    <div className="text-sm font-medium">8</div>
                  </div>
                  <Progress value={5.6} className="h-2" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <div className="text-sm">Hired</div>
                    <div className="text-sm font-medium">5</div>
                  </div>
                  <Progress value={3.5} className="h-2" />
                </div>
              </div>
              <div className="mt-4 text-center">
                <Button variant="outline" size="sm">
                  View Detailed Report
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Interviews */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Upcoming</CardTitle>
                <CardDescription>Your scheduled interviews</CardDescription>
              </div>
              <Button variant="ghost" size="icon">
                <Calendar className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingEvents.map((event) => (
                  <div key={event.id} className="border-b last:border-0 pb-3 last:pb-0">
                    <h3 className="font-medium">{event.title}</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{event.date}</span>
                    </div>
                    <div className="mt-1">
                      <Badge variant="secondary" className="text-xs">
                        {event.type}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="link" className="w-full justify-between mt-4 px-0">
                <span>View Full Calendar</span>
                <ArrowUpRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <Plus className="mr-2 h-4 w-4" />
                Post New Job
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Users className="mr-2 h-4 w-4" />
                Review Applicants
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Calendar className="mr-2 h-4 w-4" />
                Schedule Interview
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <BarChart4 className="mr-2 h-4 w-4" />
                View Analytics
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}