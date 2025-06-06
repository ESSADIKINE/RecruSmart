import { Link } from 'react-router-dom';
import { BriefcaseBusiness, Mail, Phone, MapPin, Linkedin, Twitter, Facebook, Instagram } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function Footer() {
  return (
    <footer className="bg-card text-card-foreground border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center space-x-2 font-semibold text-xl">
              <BriefcaseBusiness className="h-6 w-6 text-primary" />
              <span>RecruSmart</span>
            </Link>
            <p className="text-muted-foreground">
              Connecting talent with opportunity through smart recruitment solutions.
            </p>
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">1234 Recruitment Ave, San Francisco, CA 94107</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">contact@recrusmart.com</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-medium mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="text-muted-foreground hover:text-foreground transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/jobs" className="text-muted-foreground hover:text-foreground transition-colors">
                  Browse Jobs
                </Link>
              </li>
              <li>
                <Link to="/employers" className="text-muted-foreground hover:text-foreground transition-colors">
                  For Employers
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="text-muted-foreground hover:text-foreground transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-muted-foreground hover:text-foreground transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-muted-foreground hover:text-foreground transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-lg font-medium mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/terms" className="text-muted-foreground hover:text-foreground transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/cookies" className="text-muted-foreground hover:text-foreground transition-colors">
                  Cookie Policy
                </Link>
              </li>
              <li>
                <Link to="/accessibility" className="text-muted-foreground hover:text-foreground transition-colors">
                  Accessibility
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-lg font-medium mb-4">Stay Updated</h3>
            <p className="text-muted-foreground mb-4">
              Subscribe to our newsletter for the latest job opportunities and career tips.
            </p>
            <div className="flex space-x-2">
              <Input 
                type="email" 
                placeholder="Your email" 
                className="flex-1" 
              />
              <Button type="submit">
                Subscribe
              </Button>
            </div>
            
            {/* Social Media */}
            <div className="mt-6">
              <h4 className="text-sm font-medium mb-3">Follow Us</h4>
              <div className="flex space-x-4">
                <Button variant="ghost" size="icon" asChild>
                  <a href="https://linkedin.com" target="_blank" rel="noreferrer">
                    <Linkedin className="h-5 w-5" />
                  </a>
                </Button>
                <Button variant="ghost" size="icon" asChild>
                  <a href="https://twitter.com" target="_blank" rel="noreferrer">
                    <Twitter className="h-5 w-5" />
                  </a>
                </Button>
                <Button variant="ghost" size="icon" asChild>
                  <a href="https://facebook.com" target="_blank" rel="noreferrer">
                    <Facebook className="h-5 w-5" />
                  </a>
                </Button>
                <Button variant="ghost" size="icon" asChild>
                  <a href="https://instagram.com" target="_blank" rel="noreferrer">
                    <Instagram className="h-5 w-5" />
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-border text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} RecruSmart. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}