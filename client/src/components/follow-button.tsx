import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Heart, UserPlus2, UserMinus2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/use-auth";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface FollowButtonProps {
  userId: number;
  username: string;
  initialFollowing?: boolean;
  variant?: "icon" | "button";
  size?: "sm" | "md" | "lg";
}

export default function FollowButton({ 
  userId, 
  username, 
  initialFollowing = false,
  variant = "button",
  size = "md"
}: FollowButtonProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isFollowing, setIsFollowing] = useState(initialFollowing);
  
  // Determine if this is the current user
  const isSelf = user?.id === userId;
  
  // This will be replaced with a real API call later
  const followMutation = useMutation({
    mutationFn: async ({ userId, follow }: { userId: number, follow: boolean }) => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Throw error randomly 10% of the time for testing error handling
      if (Math.random() < 0.1) {
        throw new Error("Network error");
      }
      
      return { success: true, following: follow };
    },
    onMutate: ({ follow }) => {
      // Optimistically update the UI
      setIsFollowing(follow);
    },
    onSuccess: (_, { follow }) => {
      // Update queries that might depend on following status
      queryClient.invalidateQueries({ queryKey: ["user-following"] });
      
      toast({
        title: follow ? `Following ${username}` : `Unfollowed ${username}`,
        description: follow 
          ? "You'll see their predictions in your feed" 
          : "You won't see their predictions anymore",
      });
    },
    onError: (_, { follow }) => {
      // Revert the optimistic update
      setIsFollowing(!follow);
      
      toast({
        variant: "destructive",
        title: follow ? "Failed to follow" : "Failed to unfollow",
        description: "Please try again later",
      });
    }
  });
  
  // Handle follow/unfollow action
  const toggleFollow = () => {
    if (!user) {
      // Redirect to login if not authenticated
      window.location.href = "/auth";
      return;
    }
    
    followMutation.mutate({ userId, follow: !isFollowing });
  };
  
  // Size classes based on the size prop
  const buttonSizeClass = size === "sm" ? "text-xs py-1 px-2" : size === "lg" ? "text-base py-2 px-4" : "text-sm py-1.5 px-3";
  const iconSizeClass = size === "sm" ? "h-3.5 w-3.5" : size === "lg" ? "h-5 w-5" : "h-4 w-4";
  const iconButtonSizeClass = size === "sm" ? "h-7 w-7 p-0" : size === "lg" ? "h-10 w-10 p-0" : "h-8 w-8 p-0";
  
  // If this is the current user, disable the button
  if (isSelf) {
    return null;
  }
  
  // Render icon variant
  if (variant === "icon") {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={isFollowing ? "default" : "outline"}
              size="icon"
              className={iconButtonSizeClass}
              onClick={toggleFollow}
              disabled={followMutation.isPending || isSelf}
            >
              {isFollowing ? (
                <UserMinus2 className={iconSizeClass} />
              ) : (
                <UserPlus2 className={iconSizeClass} />
              )}
              <span className="sr-only">
                {isFollowing ? "Unfollow" : "Follow"} {username}
              </span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{isFollowing ? "Unfollow" : "Follow"} {username}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
  
  // Render button variant
  return (
    <Button
      variant={isFollowing ? "default" : "outline"}
      className={buttonSizeClass}
      onClick={toggleFollow}
      disabled={followMutation.isPending || isSelf}
    >
      {isFollowing ? (
        <>
          <UserMinus2 className={`${iconSizeClass} mr-2`} />
          Unfollow
        </>
      ) : (
        <>
          <UserPlus2 className={`${iconSizeClass} mr-2`} />
          Follow
        </>
      )}
    </Button>
  );
}