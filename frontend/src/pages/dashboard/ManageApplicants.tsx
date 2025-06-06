import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, SlidersHorizontal, MessageSquare, Calendar, Star, MoreVertical } from 'lucide-react';

// Sample applicants data
const applicants = [
  {
    id: 1,
    name: "Sarah Johnson",
    avatar: "https://i.pravatar.cc/150?img=5",
    email: "sarah.j@example.com",
    position: "Senior React Developer",
    experience: "5 years",
    appliedDate: "2024-03-15",
    status: "Shortlisted",
    rating: 4.5,
    skills: ["React", "TypeScript", "Node.js"],
    statusColor: "bg-green-500/10 text-green-500 border-green-500/20"
  },
  {
    id: 2,
    name: "Michael Chen",
    avatar: "https://i.pravatar.cc/150?img=6",
    email: "michael.c@example.com",
    position: "UX Designer",
    experience: "3 years",
    appliedDate: "2024-03-14",
    status: "In Review",
    rating: 4.0,
    skills: ["Figma", "UI Design", "User Research"],
    statusColor: "bg-amber-500/10 text-amber-500 border-amber-500/20"
  },
  {
    id: 3,
    name: "Emma Wilson",
    avatar: "https://i.pravatar.cc/150?img=7",
    email: "emma.w@example.com",
    position: "Frontend Developer",
    experience: "2 years",
    appliedDate: "2024-03-13",
    status: "New",
    rating: 3.5,
    skills: ["JavaScript", "React", "CSS"],
    statusColor: "bg-blue-500/10 text-blue-500 border-blue-500/20"
  },
  {
    id: 4,
    name: "James Anderson",
    avatar: "https://i.pravatar.cc/150?img=8",
    email: "james.a@example.com",
    position: "Senior React Developer",
    experience: "7 years",
    appliedDate: "2024-03-12",
    status: "Rejected",
    rating: 3.0,
    skills: ["React", "Redux", "Node.js"],
    statusColor: "bg-red-500/10 text-red-500 border-red-500/20"
  }
];

export default function ManageApplicants() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Manage Applicants</h1>
        <p className="text-muted-foreground">Review and manage job applications</p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search applicants..." className="pl-9" />
            </div>
            <div className="flex gap-2">
              <Select defaultValue="all">
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Position" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Positions</SelectItem>
                  <SelectItem value="react">React Developer</SelectItem>
                  <SelectItem value="ux">UX Designer</SelectItem>
                  <SelectItem value="frontend">Frontend Developer</SelectItem>
                </SelectContent>
              </Select>
              <Select defaultValue="all">
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="review">In Review</SelectItem>
                  <SelectItem value="shortlisted">Shortlisted</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon">
                <SlidersHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col gap-1">
              <p className="text-sm text-muted-foreground">Total Applicants</p>
              <p className="text-2xl font-bold">248</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col gap-1">
              <p className="text-sm text-muted-foreground">New Today</p>
              <p className="text-2xl font-bold">12</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col gap-1">
              <p className="text-sm text-muted-foreground">Shortlisted</p>
              <p className="text-2xl font-bold">38</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col gap-1">
              <p className="text-sm text-muted-foreground">Interviews</p>
              <p className="text-2xl font-bold">18</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Applicants List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Applications</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <Tabs defaultValue="all" className="space-y-4">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="new">New</TabsTrigger>
              <TabsTrigger value="shortlisted">Shortlisted</TabsTrigger>
              <TabsTrigger value="rejected">Rejected</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all">
              <div className="space-y-4">
                {applicants.map((applicant) => (
                  <Card key={applicant.id}>
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <img
                            src={applicant.avatar}
                            alt={applicant.name}
                            className="w-12 h-12 rounded-full"
                          />
                          <div>
                            <h3 className="font-semibold">{applicant.name}</h3>
                            <p className="text-sm text-muted-foreground">{applicant.email}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <div className="text-sm">
                            <p className="font-medium">{applicant.position}</p>
                            <p className="text-muted-foreground">{applicant.experience} experience</p>
                          </div>
                          <Badge variant="outline" className={applicant.statusColor}>
                            {applicant.status}
                          </Badge>
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                            <span className="text-sm font-medium">{applicant.rating}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        <div className="flex flex-wrap gap-2">
                          {applicant.skills.map((skill, index) => (
                            <Badge key={index} variant="secondary">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div className="mt-4 flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">
                          Applied: {new Date(applicant.appliedDate).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm">
                            <Calendar className="h-4 w-4 mr-2" />
                            Schedule Interview
                          </Button>
                          <Button variant="outline" size="sm">
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Message
                          </Button>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="new">
              <div className="text-center text-muted-foreground py-8">
                Filter new applications
              </div>
            </TabsContent>
            
            <TabsContent value="shortlisted">
              <div className="text-center text-muted-foreground py-8">
                Filter shortlisted applications
              </div>
            </TabsContent>
            
            <TabsContent value="rejected">
              <div className="text-center text-muted-foreground py-8">
                Filter rejected applications
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}