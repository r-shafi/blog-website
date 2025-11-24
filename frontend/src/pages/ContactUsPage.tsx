import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { contactApi } from '@/lib/api/contact';
import { AxiosError } from 'axios';
import { Mail, MapPin, Phone } from 'lucide-react';
import { useState } from 'react';

interface FormErrors {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
}

const ContactUsPage = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    newsletter: false,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters long';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
    } else if (formData.subject.trim().length < 5) {
      newErrors.subject = 'Subject must be at least 5 characters long';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters long';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleNewsletter = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, newsletter: checked }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await contactApi.submit(formData);

      toast({
        title: 'Message Sent',
        description:
          response?.message ||
          "Thank you for your message. We'll get back to you soon.",
      });

      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
        newsletter: false,
      });
      setErrors({});
    } catch (error) {
      if (error instanceof AxiosError) {
        const response = error.response?.data;

        // Handle Django REST framework validation errors
        if (response && typeof response === 'object') {
          const newErrors: FormErrors = {};

          // Check for field-specific errors
          Object.keys(response).forEach((field) => {
            if (['name', 'email', 'subject', 'message'].includes(field)) {
              const fieldErrors = response[field];
              if (Array.isArray(fieldErrors) && fieldErrors.length > 0) {
                newErrors[field as keyof FormErrors] = fieldErrors[0];
              }
            }
          });

          if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            toast({
              title: 'Validation Error',
              description: 'Please check the form for errors.',
              variant: 'destructive',
            });
            return;
          }
        }

        // Handle general errors
        toast({
          title: 'Error',
          description:
            response?.message ||
            response?.detail ||
            (error.response?.status === 429
              ? 'Rate limit exceeded. Please try again later.'
              : 'Failed to send message. Please try again.'),
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Error',
          description: 'An unexpected error occurred. Please try again.',
          variant: 'destructive',
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="container-newspaper py-12">
        <h1 className="text-4xl font-serif font-bold mb-4 text-center">
          Contact Us
        </h1>
        <p className="text-center text-newspaper-muted max-w-2xl mx-auto mb-12">
          Have a question, comment, or tip? We'd love to hear from you. Fill out
          the form below or reach out directly using our contact information.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Your Name</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="John Doe"
                        className={errors.name ? 'border-red-500' : ''}
                      />
                      {errors.name && (
                        <p className="text-sm text-red-500">{errors.name}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="john.doe@example.com"
                        className={errors.email ? 'border-red-500' : ''}
                      />
                      {errors.email && (
                        <p className="text-sm text-red-500">{errors.email}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder="How can we help you?"
                      className={errors.subject ? 'border-red-500' : ''}
                    />
                    {errors.subject && (
                      <p className="text-sm text-red-500">{errors.subject}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Please provide details about your inquiry..."
                      rows={6}
                      className={errors.message ? 'border-red-500' : ''}
                    />
                    {errors.message && (
                      <p className="text-sm text-red-500">{errors.message}</p>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="newsletter"
                      checked={formData.newsletter}
                      onCheckedChange={handleNewsletter}
                    />
                    <label
                      htmlFor="newsletter"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Subscribe to our weekly newsletter
                    </label>
                  </div>

                  <Button
                    type="submit"
                    className="w-full md:w-auto"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Sending...' : 'Send Message'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardContent className="p-6">
                <h2 className="font-serif text-2xl font-bold mb-6">
                  Contact Information
                </h2>

                <div className="space-y-6">
                  <div className="flex items-start">
                    <div className="bg-gray-100 p-2 rounded mr-4">
                      <Mail className="text-newspaper-accent h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-medium mb-1">Email Us</h3>
                      <a
                        href="mailto:info@blankpage.com"
                        className="text-newspaper-muted hover:text-newspaper-accent"
                      >
                        info@blankpage.com
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="bg-gray-100 p-2 rounded mr-4">
                      <Phone className="text-newspaper-accent h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-medium mb-1">Call Us</h3>
                      <a
                        href="tel:+880 1533 628-674"
                        className="text-newspaper-muted hover:text-newspaper-accent"
                      >
                        +880 1533 628-674
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="bg-gray-100 p-2 rounded mr-4">
                      <MapPin className="text-newspaper-accent h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-medium mb-1">Visit Us</h3>
                      <p className="text-newspaper-muted">
                        Mitali #2, Subidbazar
                        <br />
                        Sylhet, 3100
                        <br />
                        Bangladesh
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-8">
                  <h3 className="font-medium mb-2">Office Hours</h3>
                  <p className="text-newspaper-muted">
                    Sunday - Thursday: 9:00 AM - 5:00 PM
                  </p>
                  <p className="text-newspaper-muted">
                    Friday - Saturday: Closed
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ContactUsPage;
