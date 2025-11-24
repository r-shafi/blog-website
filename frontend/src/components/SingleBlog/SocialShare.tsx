import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import {
  Facebook,
  Link2,
  Linkedin,
  MessageCircle,
  Send,
  Share,
  Twitter,
} from 'lucide-react';
import React from 'react';

interface SocialShareProps {
  title: string;
  url: string;
}

const SocialShare: React.FC<SocialShareProps> = ({ title, url }) => {
  const { toast } = useToast();

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          url: url,
        });

        toast({
          title: 'Shared!',
          description: 'Article has been shared successfully',
        });
      } catch (error) {
        // User cancelled or error occurred
        if ((error as Error).name !== 'AbortError') {
          toast({
            title: 'Share Failed',
            description: 'Unable to share article',
            variant: 'destructive',
          });
        }
      }
    }
  };

  const handleShare = (platform: string) => {
    const encodedUrl = encodeURIComponent(url);
    const encodedTitle = encodeURIComponent(title);

    let shareUrl = '';

    switch (platform) {
      case 'Facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        break;
      case 'Twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`;
        break;
      case 'LinkedIn':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
        break;
      case 'WhatsApp':
        shareUrl = `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`;
        break;
      case 'Telegram':
        shareUrl = `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`;
        break;
      default:
        return;
    }

    // Open in new window/tab
    window.open(
      shareUrl,
      '_blank',
      'noopener,noreferrer,width=600,height=400,scrollbars=yes,resizable=yes'
    );

    console.log(`Sharing to ${platform}:`, { title, url });

    toast({
      title: 'Sharing...',
      description: `Opening ${platform} share dialog`,
    });
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      console.log('Link copied to clipboard:', url);

      toast({
        title: 'Link Copied',
        description: 'Article link has been copied to clipboard',
      });
    } catch (error) {
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = url;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      try {
        document.execCommand('copy');
        toast({
          title: 'Link Copied',
          description: 'Article link has been copied to clipboard',
        });
      } catch (fallbackError) {
        toast({
          title: 'Copy Failed',
          description: 'Unable to copy link. Please copy manually.',
          variant: 'destructive',
        });
      } finally {
        document.body.removeChild(textArea);
      }
    }
  };

  return (
    <div className="flex flex-wrap gap-3">
      {/* Native share button (appears on supported devices) */}
      {navigator.share && (
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
          onClick={handleNativeShare}
        >
          <Share size={16} />
          <span className="hidden sm:inline">Share</span>
        </Button>
      )}

      <Button
        variant="outline"
        size="sm"
        className="flex items-center gap-2 bg-[#1877F2] text-white hover:bg-[#1877F2]/90 border-none"
        onClick={() => handleShare('Facebook')}
      >
        <Facebook size={16} />
        <span className="hidden sm:inline">Facebook</span>
      </Button>

      <Button
        variant="outline"
        size="sm"
        className="flex items-center gap-2 bg-[#1DA1F2] text-white hover:bg-[#1DA1F2]/90 border-none"
        onClick={() => handleShare('Twitter')}
      >
        <Twitter size={16} />
        <span className="hidden sm:inline">Twitter</span>
      </Button>

      <Button
        variant="outline"
        size="sm"
        className="flex items-center gap-2 bg-[#0A66C2] text-white hover:bg-[#0A66C2]/90 border-none"
        onClick={() => handleShare('LinkedIn')}
      >
        <Linkedin size={16} />
        <span className="hidden sm:inline">LinkedIn</span>
      </Button>

      <Button
        variant="outline"
        size="sm"
        className="flex items-center gap-2 bg-[#25D366] text-white hover:bg-[#25D366]/90 border-none"
        onClick={() => handleShare('WhatsApp')}
      >
        <MessageCircle size={16} />
        <span className="hidden sm:inline">WhatsApp</span>
      </Button>

      <Button
        variant="outline"
        size="sm"
        className="flex items-center gap-2 bg-[#0088CC] text-white hover:bg-[#0088CC]/90 border-none"
        onClick={() => handleShare('Telegram')}
      >
        <Send size={16} />
        <span className="hidden sm:inline">Telegram</span>
      </Button>

      <Button variant="outline" size="sm" onClick={handleCopyLink}>
        <Link2 size={16} className="mr-2" />
        <span>Copy Link</span>
      </Button>
    </div>
  );
};

export default SocialShare;
