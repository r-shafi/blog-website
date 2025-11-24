import { Card, CardContent } from '@/components/ui/card';
import { getAvatarUrl } from '@/lib/utils/avatar';
import { Link } from 'react-router-dom';

interface AuthorCardProps {
  id: string;
  name: string;
  role: string;
  bio: string;
  avatar: string;
}

const AuthorCard = ({ id, name, role, bio, avatar }: AuthorCardProps) => {
  // Limit bio to a reasonable length for display in cards
  const shortBio = bio.length > 100 ? bio.substring(0, 100) + '...' : bio;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex flex-col items-center text-center">
          <img
            src={getAvatarUrl(avatar, name)}
            alt={name}
            className="w-24 h-24 rounded-full object-cover mb-4"
          />
          <h3 className="font-serif text-xl font-bold">{name}</h3>
          <p className="text-newspaper-muted text-sm mb-2">{role}</p>
          <p className="text-sm mb-4">{shortBio}</p>
          <Link
            to={`/author/${id}`}
            className="btn-secondary text-sm py-1 px-4"
          >
            View Profile
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default AuthorCard;
