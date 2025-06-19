import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Clock, CheckCircle, XCircle, MessageSquare } from 'lucide-react';

// Sample applications data
const applications = [
  {
    id: 1,
    jobTitle: "Senior React Developer",
    company: "TechCorp Inc.",
    companyLogo: "https://i.pravatar.cc/150?img=1",
    appliedDate: "2024-03-15",
    status: "In Review",
    statusIcon: <Clock className="h-4 w-4 text-amber-500" />,
    statusColor: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    nextStep: "Technical Interview scheduled for March 20, 2024",
    timeline: [
      {
        date: "2024-03-15",
        status: "Application Submitted",
        description: "Your application was received"
      },
      {
        date: "2024-03-16",
        status: "Initial Screening",
        description: "Your application is being reviewed by the hiring team"
      }
    ]
  },
  {
    id: 2,
    jobTitle: "UX Designer",
    company: "DesignHub",
    companyLogo: "https://i.pravatar.cc/150?img=2",
    appliedDate: "2024-03-10",
    status: "Accepted",
    statusIcon: <CheckCircle className="h-4 w-4 text-green-500" />,
    statusColor: "bg-green-500/10 text-green-500 border-green-500/20",
    nextStep: "Offer letter sent. Please review and sign.",
    timeline: [
      {
        date: "2024-03-10",
        status: "Application Submitted",
        description: "Your application was received"
      },
      {
        date: "2024-03-12",
        status: "Initial Interview",
        description: "Completed video interview with HR"
      },
      {
        date: "2024-03-14",
        status: "Technical Interview",
        description: "Completed design challenge and portfolio review"
      },
      {
        date: "2024-03-15",
        status: "Offer Extended",
        description: "Congratulations! You've received an offer."
      }
    ]
  },
  {
    id: 3,
    jobTitle: "Frontend Developer",
    company: "WebSolutions",
    companyLogo: "https://i.pravatar.cc/150?img=3",
    appliedDate: "2024-03-05",
    status: "Rejected",
    statusIcon: <XCircle className="h-4 w-4 text-red-500" />,
    statusColor: "bg-red-500/10 text-red-500 border-red-500/20",
    nextStep: null,
    timeline: [
      {
        date: "2024-03-05",
        status: "Application Submitted",
        description: "Your application was received"
      },
      {
        date: "2024-03-07",
        status: "Initial Screening",
        description: "Application reviewed by hiring team"
      },
      {
        date: "2024-03-08",
        status: "Application Closed",
        description: "Thank you for your interest. We've decided to move forward with other candidates."
      }
    ]
  }
];

export default function ApplicationStatus() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Applications</h1>
        <p className="text-muted-foreground">Track your job applications</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col gap-1">
              <p className="text-sm text-muted-foreground">Total Applications</p>
              <p className="text-2xl font-bold">12</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col gap-1">
              <p className="text-sm text-muted-foreground">In Review</p>
              <p className="text-2xl font-bold">5</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col gap-1">
              <p className="text-sm text-muted-foreground">Interviews</p>
              <p className="text-2xl font-bold">3</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col gap-1">
              <p className="text-sm text-muted-foreground">Offers</p>
              <p className="text-2xl font-bold">1</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Applications List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Applications</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <Tabs defaultValue="all" className="space-y-4">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="space-y-4">
              {applications.map(application => (
                <Card key={application.id}>
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <img
                          src={application.companyLogo}
                          alt={application.company}
                          className="w-12 h-12 rounded-full"
                        />
                        <div>
                          <h3 className="font-semibold">{application.jobTitle}</h3>
                          <p className="text-sm text-muted-foreground">{application.company}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="text-sm text-muted-foreground">
                          Applied: {new Date(application.appliedDate).toLocaleDateString()}
                        </div>
                        <Badge variant="outline" className={application.statusColor}>
                          <span className="flex items-center gap-1">
                            {application.statusIcon}
                            {application.status}
                          </span>
                        </Badge>
                        <Button variant="ghost" size="icon">
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    {application.nextStep && (
                      <div className="mt-4 p-4 bg-muted rounded-lg">
                        <p className="text-sm">{application.nextStep}</p>
                      </div>
                    )}
                    
                    <div className="mt-6">
                      <h4 className="text-sm font-medium mb-4">Application Timeline</h4>
                      <div className="space-y-4">
                        {application.timeline.map((event, index) => (
                          <div key={index} className="flex gap-4">
                            <div className="w-24 text-sm text-muted-foreground">
                              {new Date(event.date).toLocaleDateString()}
                            </div>
                            <div>
                              <p className="text-sm font-medium">{event.status}</p>
                              <p className="text-sm text-muted-foreground">{event.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
            
            <TabsContent value="active">
              <div className="text-center text-muted-foreground py-8">
                Filter active applications
              </div>
            </TabsContent>
            
            <TabsContent value="completed">
              <div className="text-center text-muted-foreground py-8">
                Filter completed applications
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}