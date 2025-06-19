import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import JobCard from '@/components/dashboard/JobCard';
import { Search, SlidersHorizontal } from 'lucide-react';

// Sample job data
const jobs = [
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
    title: "UX/UI Designer",
    company: "DesignHub",
    companyLogo: "https://i.pravatar.cc/150?img=2",
    location: "New York, NY",
    salary: "$90K - $110K",
    type: "Full-time",
    status: "Featured",
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
  },
  {
    id: 4,
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
  }
];

export default function JobListings() {
  const [searchTerm, setSearchTerm] = useState('');
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Job Listings</h1>
        <p className="text-muted-foreground">Find your next opportunity</p>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search jobs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              <Select defaultValue="all">
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Job Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="full-time">Full Time</SelectItem>
                  <SelectItem value="part-time">Part Time</SelectItem>
                  <SelectItem value="contract">Contract</SelectItem>
                  <SelectItem value="internship">Internship</SelectItem>
                </SelectContent>
              </Select>
              <Select defaultValue="all">
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  <SelectItem value="remote">Remote</SelectItem>
                  <SelectItem value="onsite">On-site</SelectItem>
                  <SelectItem value="hybrid">Hybrid</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon">
                <SlidersHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <Card>
        <CardHeader>
          <CardTitle>Available Positions</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid gap-6">
            {jobs.map(job => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}