import Layout from '@/components/layout/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { useEffect, useRef } from 'react';

const TermsPage = () => {
  const sections = [
    {
      id: 'introduction',
      title: 'Introduction',
      content: `
        <p>Welcome to Blog Website. These Terms and Conditions ("Terms") govern your use of our website, mobile applications, and services (collectively, the "Services"). By accessing or using our Services, you agree to be bound by these Terms. If you do not agree to these Terms, please do not use our Services.</p>
        <p>Please read these Terms carefully before using our platform. By accessing or using the Services, you acknowledge that you have read, understood, and agree to be bound by these Terms. If you are using the Services on behalf of an organization, you represent and warrant that you have the authority to bind that organization to these Terms.</p>
      `,
    },
    {
      id: 'account-registration',
      title: 'Account Registration and Security',
      content: `
        <p>To access certain features of the Services, you may need to create an account. You agree to provide accurate, current, and complete information during the registration process and to update such information to keep it accurate, current, and complete.</p>
        <p>You are responsible for safeguarding your account credentials and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account or any other breach of security. We cannot and will not be liable for any loss or damage arising from your failure to comply with these requirements.</p>
        <p>We reserve the right to disable any user account at any time in our sole discretion, including if we believe that you have violated these Terms.</p>
      `,
    },
    {
      id: 'content-guidelines',
      title: 'Content Guidelines',
      content: `
        <p>Our Services allow you to post, link, store, share, and otherwise make available certain information, text, graphics, videos, or other material ("Content"). You are responsible for the Content that you post on or through the Services, including its legality, reliability, and appropriateness.</p>
        <p>By posting Content on or through the Services, you represent and warrant that: (i) the Content is yours (you own it) or you have the right to use it and grant us the rights and license as provided in these Terms, and (ii) the posting of your Content on or through the Services does not violate the privacy rights, publicity rights, copyrights, contract rights, or any other rights of any person or entity.</p>
        <p>We reserve the right to terminate the account of any user who infringes copyrights. If you believe that your Content has been copied in a way that constitutes copyright infringement, please provide us with the following information: (i) a physical or electronic signature of the copyright owner or a person authorized to act on their behalf; (ii) identification of the copyrighted work claimed to have been infringed; (iii) identification of the material that is claimed to be infringing or to be the subject of infringing activity and that is to be removed or access to which is to be disabled, and information reasonably sufficient to permit us to locate the material; (iv) your contact information, including your address, telephone number, and an email address; (v) a statement by you that you have a good faith belief that use of the material in the manner complained of is not authorized by the copyright owner, its agent, or the law; and (vi) a statement that the information in the notification is accurate, and, under penalty of perjury, that you are authorized to act on behalf of the copyright owner.</p>
      `,
    },
    {
      id: 'intellectual-property',
      title: 'Intellectual Property Rights',
      content: `
        <p>The Services and their original content (excluding Content provided by users), features, and functionality are and will remain the exclusive property of Blog Website and its licensors. The Services are protected by copyright, trademark, and other laws of both the United States and foreign countries. Our trademarks and trade dress may not be used in connection with any product or service without the prior written consent of Blog Website.</p>
        <p>You acknowledge and agree that the Services may contain proprietary and confidential information that is protected by applicable intellectual property and other laws. You agree not to modify, rent, lease, loan, sell, distribute, or create derivative works based on the Services, in whole or in part.</p>
      `,
    },
    {
      id: 'privacy-policy',
      title: 'Privacy Policy',
      content: `
        <p>We care about data privacy and security. By using the Services, you agree to be bound by our Privacy Policy, which is incorporated into these Terms. Please review our Privacy Policy to understand our practices.</p>
        <p>We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page. You are advised to review this Privacy Policy periodically for any changes.</p>
      `,
    },
    {
      id: 'termination',
      title: 'Termination',
      content: `
        <p>We may terminate or suspend your account and bar access to the Services immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever and without limitation, including but not limited to a breach of the Terms.</p>
        <p>If you wish to terminate your account, you may simply discontinue using the Services, or notify us that you wish to delete your account.</p>
        <p>All provisions of the Terms which by their nature should survive termination shall survive termination, including, without limitation, ownership provisions, warranty disclaimers, indemnity, and limitations of liability.</p>
      `,
    },
    {
      id: 'disclaimer',
      title: 'Disclaimer',
      content: `
        <p>Your use of the Services is at your sole risk. The Services are provided on an "AS IS" and "AS AVAILABLE" basis. The Services are provided without warranties of any kind, whether express or implied, including, but not limited to, implied warranties of merchantability, fitness for a particular purpose, non-infringement, or course of performance.</p>
        <p>Blog Website, its subsidiaries, affiliates, and its licensors do not warrant that a) the Services will function uninterrupted, secure, or available at any particular time or location; b) any errors or defects will be corrected; c) the Services are free of viruses or other harmful components; or d) the results of using the Services will meet your requirements.</p>
      `,
    },
    {
      id: 'limitation-liability',
      title: 'Limitation of Liability',
      content: `
        <p>In no event shall Blog Website, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from (i) your access to or use of or inability to access or use the Services; (ii) any conduct or content of any third party on the Services; (iii) any content obtained from the Services; and (iv) unauthorized access, use, or alteration of your transmissions or content, whether based on warranty, contract, tort (including negligence), or any other legal theory, whether or not we have been informed of the possibility of such damage, and even if a remedy set forth herein is found to have failed of its essential purpose.</p>
      `,
    },
    {
      id: 'governing-law',
      title: 'Governing Law',
      content: `
        <p>These Terms shall be governed and construed in accordance with the laws of the United States, without regard to its conflict of law provisions.</p>
        <p>Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights. If any provision of these Terms is held to be invalid or unenforceable by a court, the remaining provisions of these Terms will remain in effect. These Terms constitute the entire agreement between us regarding our Services, and supersede and replace any prior agreements we might have had between us regarding the Services.</p>
      `,
    },
    {
      id: 'changes-terms',
      title: 'Changes to Terms',
      content: `
        <p>We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.</p>
        <p>By continuing to access or use our Services after any revisions become effective, you agree to be bound by the revised terms. If you do not agree to the new terms, you are no longer authorized to use the Services.</p>
      `,
    },
    {
      id: 'contact-us',
      title: 'Contact Us',
      content: `
        <p>If you have any questions about these Terms, please contact us at:</p>
        <p>Email: legal@blankpage.com</p>
        <p>Blog Website<br>123 News Street<br>Metropolis, NY 10001<br>United States</p>
      `,
    },
  ];

  // Create references for each section
  const sectionRefs = useRef<Array<HTMLElement | null>>([]);

  // Initialize the refs array
  useEffect(() => {
    sectionRefs.current = Array(sections.length).fill(null);
  }, []);

  // Scroll to section when clicking on TOC link
  const scrollToSection = (index: number) => {
    if (sectionRefs.current[index]) {
      sectionRefs.current[index]?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <Layout>
      <div className="container-newspaper py-12">
        <h1 className="text-4xl font-serif font-bold mb-8 text-center">
          Terms and Conditions
        </h1>

        <Card className="mb-8">
          <CardContent className="p-6">
            <h2 className="text-2xl font-serif font-bold mb-4">
              Table of Contents
            </h2>
            <ul className="space-y-2">
              {sections.map((section, index) => (
                <li key={section.id}>
                  <button
                    onClick={() => scrollToSection(index)}
                    className="text-newspaper-accent hover:underline text-left"
                  >
                    {section.title}
                  </button>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="prose max-w-none">
              {sections.map((section, index) => (
                <section
                  key={section.id}
                  id={section.id}
                  ref={(el) => (sectionRefs.current[index] = el)}
                  className="mb-12 scroll-mt-24"
                >
                  <h2 className="text-2xl font-serif font-bold mb-4">
                    {section.title}
                  </h2>
                  <div dangerouslySetInnerHTML={{ __html: section.content }} />
                </section>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default TermsPage;
