import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { subscribersApi } from '@/lib/api/subscribers';
import { Facebook, Instagram, Linkedin, Twitter } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNewsletterSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    e.stopPropagation();

    const form = e.currentTarget;
    const email = new FormData(form).get('email') as string;

    if (!email || !email.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a valid email address.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await subscribersApi.subscribe(email);
      toast({
        title: 'Success!',
        description: 'Thank you for subscribing to our newsletter!',
      });
      form.reset();
    } catch (error) {
      toast({
        title: 'Subscription Failed',
        description: 'Please try again or check if you are already subscribed.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <footer className="bg-gray-100 border-t border-gray-200">
      <div className="container-newspaper py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <Link to="/" className="font-serif text-2xl font-bold mb-4 block">
              Blog Website
            </Link>
            <p className="text-gray-600 mb-6 max-w-md">
              Write your world, one page at a time.
            </p>
            <div className="flex space-x-4">
              <a
                href="#"
                className="text-gray-600 hover:text-newspaper-accent"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-gray-600 hover:text-newspaper-accent"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-gray-600 hover:text-newspaper-accent"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-gray-600 hover:text-newspaper-accent"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-serif font-bold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/"
                  className="text-gray-600 hover:text-newspaper-accent"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/blogs"
                  className="text-gray-600 hover:text-newspaper-accent"
                >
                  Blogs
                </Link>
              </li>
              <li>
                <Link
                  to="/authors"
                  className="text-gray-600 hover:text-newspaper-accent"
                >
                  Authors
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="text-gray-600 hover:text-newspaper-accent"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-gray-600 hover:text-newspaper-accent"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-serif font-bold text-lg mb-4">Newsletter</h3>
            <p className="text-gray-600 mb-4">
              Subscribe to our newsletter for the latest updates.
            </p>
            <form onSubmit={handleNewsletterSubmit} className="space-y-2">
              <Input
                type="email"
                name="email"
                placeholder="Your email address"
                required
              />
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Subscribing...' : 'Subscribe'}
              </Button>
            </form>
          </div>
        </div>

        <div className="border-t border-gray-200 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-600 mb-4 md:mb-0">
              © {new Date().getFullYear()} Blog Website. All rights reserved.
            </p>
            <div className="flex space-x-4 text-sm">
              <Link
                to="/terms"
                className="text-gray-600 hover:text-newspaper-accent"
              >
                Terms & Conditions
              </Link>
              <Link
                to="/privacy"
                className="text-gray-600 hover:text-newspaper-accent"
              >
                Privacy Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
