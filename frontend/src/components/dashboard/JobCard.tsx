import { Building, MapPin, DollarSign, Clock, Bookmark, Share2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function JobCard({ job, applied = false, featured = false }) {
  const getJobStatusColor = (status) => {
    switch (status) {
      case 'New':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'Urgent':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'Featured':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      default:
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    }
  };

  return (
    <Card className={cn(
      "overflow-hidden transition-all duration-300 hover:shadow-md",
      featured && "border-primary/30 bg-primary/5"
    )}>
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          {/* Company Logo */}
          <div className="shrink-0">
            <div className="w-14 h-14 rounded bg-secondary flex items-center justify-center overflow-hidden">
              {job.companyLogo ? (
                <img src={job.companyLogo} alt={job.company} className="object-cover w-full h-full" />
              ) : (
                <Building className="h-8 w-8 text-secondary-foreground" />
              )}
            </div>
          </div>
          
          {/* Job Details */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
              <h3 className="text-lg font-semibold truncate">{job.title}</h3>
              
              <div className="flex items-center gap-2">
                {job.status && (
                  <Badge variant="outline" className={cn("py-1", getJobStatusColor(job.status))}>
                    {job.status}
                  </Badge>
                )}
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Bookmark className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="text-muted-foreground text-sm mb-3">{job.company}</div>
            
            <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground mb-4">
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-1" />
                <span>{job.location}</span>
              </div>
              {job.salary && (
                <div className="flex items-center">
                  <DollarSign className="h-4 w-4 mr-1" />
                  <span>{job.salary}</span>
                </div>
              )}
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                <span>{job.type}</span>
              </div>
            </div>
            
            <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
              {job.description}
            </p>
            
            <div className="flex flex-wrap gap-2 mb-4">
              {job.skills.map((skill, index) => (
                <Badge key={index} variant="secondary" className="rounded-full px-3 py-1">
                  {skill}
                </Badge>
              ))}
            </div>
            
            <div className="flex items-center justify-between">
              <div className="text-xs text-muted-foreground">
                Posted {job.postedDate} • {job.applicants} applicants
              </div>
              
              <Button 
                variant={applied ? "outline" : "default"}
                className={applied ? "text-muted-foreground" : ""}
                disabled={applied}
              >
                {applied ? "Applied" : "Apply Now"}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}