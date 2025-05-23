import { Facebook, Twitter, Linkedin, Mail, Copy, Share2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/use-language";

interface ShareAppProps {
  variant?: "button" | "icon";
  size?: "sm" | "md" | "lg";
}

export default function ShareApp({ variant = "button", size = "md" }: ShareAppProps) {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { t } = useLanguage();
  
  const appUrl = window.location.origin;
  
  // Generate direct links to various sections of the app
  const links = {
    home: appUrl,
    leaderboard: `${appUrl}/leaderboard`,
    // Add more links as needed
  };

  const handleCopyLink = (link: string) => {
    navigator.clipboard.writeText(link);
    toast({
      title: t("share.copied"),
      description: t("share.link_copied"),
    });
  };

  const handleSocialShare = (platform: string) => {
    let shareUrl = "";
    const text = t("share.message");
    
    switch (platform) {
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(appUrl)}&quote=${encodeURIComponent(text)}`;
        break;
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(appUrl)}&text=${encodeURIComponent(text)}`;
        break;
      case "linkedin":
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(appUrl)}`;
        break;
      case "email":
        shareUrl = `mailto:?subject=${encodeURIComponent(t("share.email_subject"))}&body=${encodeURIComponent(text + " " + appUrl)}`;
        break;
      default:
        return;
    }
    
    window.open(shareUrl, "_blank");
  };

  const buttonSizeClass = 
    size === "sm" ? "h-8 text-xs" : 
    size === "lg" ? "h-12 text-base" : 
    "h-10 text-sm";

  const iconSizeClass =
    size === "sm" ? "h-4 w-4" : 
    size === "lg" ? "h-6 w-6" : 
    "h-5 w-5";

  if (variant === "icon") {
    return (
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="icon" className="rounded-full">
            <Share2 className={iconSizeClass} />
          </Button>
        </DialogTrigger>
        <ShareContent
          links={links}
          handleCopyLink={handleCopyLink}
          handleSocialShare={handleSocialShare}
        />
      </Dialog>
    );
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className={`${buttonSizeClass} flex items-center gap-2`}>
          <Share2 className={iconSizeClass} />
          {t("share.share_app")}
        </Button>
      </DialogTrigger>
      <ShareContent
        links={links}
        handleCopyLink={handleCopyLink}
        handleSocialShare={handleSocialShare}
      />
    </Dialog>
  );
}

function ShareContent({ 
  links, 
  handleCopyLink, 
  handleSocialShare 
}: { 
  links: Record<string, string>; 
  handleCopyLink: (link: string) => void; 
  handleSocialShare: (platform: string) => void; 
}) {
  const { t } = useLanguage();
  
  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>{t("share.share_with_friends")}</DialogTitle>
        <DialogDescription>
          {t("share.invite_friends")}
        </DialogDescription>
      </DialogHeader>
      <div className="flex items-center space-x-2 mt-4">
        <Button 
          variant="outline" 
          size="icon" 
          className="rounded-full bg-[#1877F2] hover:bg-[#0E63CE] text-white"
          onClick={() => handleSocialShare("facebook")}
        >
          <Facebook className="h-5 w-5" />
        </Button>
        <Button 
          variant="outline" 
          size="icon" 
          className="rounded-full bg-[#1DA1F2] hover:bg-[#0C85D0] text-white"
          onClick={() => handleSocialShare("twitter")}
        >
          <Twitter className="h-5 w-5" />
        </Button>
        <Button 
          variant="outline" 
          size="icon" 
          className="rounded-full bg-[#0A66C2] hover:bg-[#084E96] text-white"
          onClick={() => handleSocialShare("linkedin")}
        >
          <Linkedin className="h-5 w-5" />
        </Button>
        <Button 
          variant="outline" 
          size="icon" 
          className="rounded-full bg-[#D44638] hover:bg-[#B23121] text-white"
          onClick={() => handleSocialShare("email")}
        >
          <Mail className="h-5 w-5" />
        </Button>
      </div>
      
      <div className="mt-6 space-y-4">
        <div className="text-sm font-medium">{t("share.or_share_link")}</div>
        
        <Card>
          <CardHeader className="py-2">
            <CardTitle className="text-sm">{t("share.homepage")}</CardTitle>
          </CardHeader>
          <CardContent className="py-2">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground truncate mr-2">
                {links.home}
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleCopyLink(links.home)}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="py-2">
            <CardTitle className="text-sm">{t("share.leaderboard")}</CardTitle>
          </CardHeader>
          <CardContent className="py-2">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground truncate mr-2">
                {links.leaderboard}
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleCopyLink(links.leaderboard)}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DialogContent>
  );
}