import Layout from '@/components/layout/Layout';
import { getAvatarUrl } from '@/lib/utils/avatar';

const AboutUsPage = () => {
  const editorialTeam = [
    {
      id: 1,
      name: 'Sarah Mitchell',
      role: 'Editor-in-Chief',
      bio: 'Sarah brings over 15 years of experience in investigative journalism, having worked with major publications covering politics and social issues. She holds a Pulitzer Prize for her groundbreaking series on government transparency.',
      avatar: null, // Will use placeholder
    },
    {
      id: 2,
      name: 'Michael Chen',
      role: 'Senior Political Reporter',
      bio: 'Michael specializes in political analysis and election coverage. His insightful reporting has earned recognition from the National Press Foundation, and he frequently appears as a commentator on major news networks.',
      avatar: null,
    },
    {
      id: 3,
      name: 'Dr. Elena Rodriguez',
      role: 'Science & Technology Editor',
      bio: 'Elena holds a PhD in Environmental Science and translates complex scientific research into accessible journalism. She has covered major climate summits and breakthrough medical research for over a decade.',
      avatar: null,
    },
    {
      id: 4,
      name: 'James Thompson',
      role: 'Culture & Arts Critic',
      bio: 'James reviews books, films, and cultural phenomena with wit and insight. His weekly culture column has become a must-read for those seeking thoughtful commentary on contemporary arts and literature.',
      avatar: null,
    },
    {
      id: 5,
      name: 'Aisha Patel',
      role: 'International Correspondent',
      bio: 'Based in London, Aisha covers European affairs and global economic trends. She speaks four languages and has reported from over 30 countries, bringing international perspectives to domestic audiences.',
      avatar: null,
    },
    {
      id: 6,
      name: 'Robert Kim',
      role: 'Data Journalist',
      bio: 'Robert combines traditional reporting with data analysis to uncover hidden stories in statistics. His interactive visualizations have won multiple awards for excellence in digital journalism.',
      avatar: null,
    },
    {
      id: 7,
      name: 'Maria Santos',
      role: 'Community Engagement Editor',
      bio: 'Maria manages our reader engagement initiatives and oversees our fact-checking department. She is passionate about combating misinformation and building trust between news organizations and communities.',
      avatar: null,
    },
    {
      id: 8,
      name: 'David Park',
      role: 'Multimedia Producer',
      bio: 'David creates compelling video content and podcasts that complement our written journalism. His documentary work has been featured at several film festivals and journalism conferences.',
      avatar: null,
    },
  ];

  return (
    <Layout>
      <div className="container-newspaper py-12">
        <section className="mb-16">
          <h1 className="text-4xl font-serif font-bold mb-4 text-center">
            About Blog Website
          </h1>
          <div className="max-w-3xl mx-auto">
            <p className="text-lg text-center mb-8">
              Delivering thought-provoking journalism in the digital age since
              2020.
            </p>
            <div className="prose max-w-none">
              <h2 className="font-serif text-2xl font-bold mb-4">
                Our History
              </h2>
              <p>
                Founded in early 2020, Blog Website emerged from a collective
                desire to restore depth and nuance to contemporary discourse. As
                traditional print media continued to decline and social media
                algorithms pushed increasingly polarized content, our founders—a
                diverse group of journalists, academics, and technology
                experts—saw an opportunity to create something different.
              </p>

              <p className="my-4">
                What began as a small digital publication with a handful of
                contributors has grown into a thriving platform featuring voices
                from across the political spectrum, united by a commitment to
                factual accuracy, intellectual honesty, and thoughtful analysis.
              </p>

              <h2 className="font-serif text-2xl font-bold mb-4 mt-8">
                Our Mission
              </h2>
              <p>
                At Blog Website, we believe that democratic society thrives on
                informed citizens engaged in good-faith dialogue. Our mission is
                to provide readers with reporting and analysis that:
              </p>

              <ul className="list-disc pl-6 my-4">
                <li>
                  Prioritizes accuracy and context over speed and sensationalism
                </li>
                <li>
                  Examines issues from multiple perspectives with intellectual
                  honesty
                </li>
                <li>
                  Respects readers' intelligence while remaining accessible
                </li>
                <li>
                  Contributes positively to public discourse on pressing issues
                </li>
                <li>
                  Remains independent from corporate and political influence
                </li>
              </ul>

              <p>
                We strive not just to inform, but to foster deeper understanding
                of complex issues, believing that reasonable people can disagree
                on solutions while agreeing on facts.
              </p>

              <h2 className="font-serif text-2xl font-bold mb-4 mt-8">
                Our Principles
              </h2>
              <p>
                Blog Website operates according to these core journalistic
                principles:
              </p>

              <ul className="list-disc pl-6 my-4">
                <li>
                  <strong>Independence:</strong> We maintain editorial
                  independence from financial and political interests.
                </li>
                <li>
                  <strong>Accuracy:</strong> We verify information before
                  publishing and correct errors promptly and transparently.
                </li>
                <li>
                  <strong>Fairness:</strong> We present competing perspectives
                  on controversial issues and give subjects of criticism the
                  opportunity to respond.
                </li>
                <li>
                  <strong>Transparency:</strong> We disclose our methods,
                  sources (when possible), and potential conflicts of interest.
                </li>
                <li>
                  <strong>Humanity:</strong> We recognize the human impact of
                  news events and respect the dignity of all people in our
                  coverage.
                </li>
              </ul>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-3xl font-serif font-bold mb-8 text-center">
            Meet Our Team
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {editorialTeam.map((member) => (
              <div key={member.id} className="text-center">
                <img
                  src={getAvatarUrl(member.avatar, member.name)}
                  alt={member.name}
                  className="w-32 h-32 object-cover rounded-full mx-auto mb-4 border-2 border-gray-200"
                />
                <h3 className="font-serif text-xl font-bold">{member.name}</h3>
                <p className="text-newspaper-accent font-medium mb-2">
                  {member.role}
                </p>
                <p className="text-sm text-newspaper-muted mb-4">
                  {member.bio.substring(0, 120)}...
                </p>
              </div>
            ))}
          </div>

          <div className="mt-16 bg-gray-50 p-8 rounded-lg">
            <h3 className="font-serif text-2xl font-bold mb-4 text-center">
              Join Our Team
            </h3>
            <p className="text-center max-w-2xl mx-auto">
              Blog Website is always looking for talented writers, editors, and
              contributors who are passionate about quality journalism. If
              you're interested in joining our team, please send your resume and
              a brief cover letter to{' '}
              <a
                href="mailto:careers@blankpage.com"
                className="text-newspaper-accent"
              >
                careers@blankpage.com
              </a>
              .
            </p>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default AboutUsPage;
