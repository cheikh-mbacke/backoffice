// src/components/ui/avatar.tsx
import * as React from "react";
import { cn } from "@/lib/utils";
import { User as UserIcon } from "lucide-react";
import { profilePhotosService } from "@/services/profilePhotos.service";

interface AvatarProps {
  src?: string;
  alt?: string;
  fallback?: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeClasses = {
  sm: "h-8 w-8",
  md: "h-10 w-10",
  lg: "h-12 w-12",
  xl: "h-16 w-16",
};

const iconSizeClasses = {
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-6 w-6",
  xl: "h-8 w-8",
};

export function Avatar({
  src,
  alt = "Avatar",
  fallback,
  size = "md",
  className,
}: AvatarProps) {
  const [imageError, setImageError] = React.useState(false);

  const avatarUrl = profilePhotosService.getProfilePhotoUrl(src);
  const shouldShowImage = avatarUrl && !imageError;

  return (
    <div
      className={cn(
        "relative flex shrink-0 overflow-hidden rounded-full bg-muted",
        sizeClasses[size],
        className
      )}
    >
      {shouldShowImage ? (
        <img
          src={avatarUrl}
          alt={alt}
          className="aspect-square h-full w-full object-cover"
          onError={() => setImageError(true)}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center">
          {fallback || (
            <UserIcon
              className={cn("text-muted-foreground", iconSizeClasses[size])}
            />
          )}
        </div>
      )}
    </div>
  );
}

// Composant Avatar avec initiales
interface AvatarWithInitialsProps extends Omit<AvatarProps, "fallback"> {
  name: string;
  className?: string;
}

export function AvatarWithInitials({
  name,
  size = "md",
  className,
  ...props
}: AvatarWithInitialsProps) {
  const initials = name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const textSizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
    xl: "text-lg",
  };

  return (
    <Avatar
      {...props}
      size={size}
      className={className}
      fallback={
        <span
          className={cn(
            "font-semibold text-muted-foreground",
            textSizeClasses[size]
          )}
        >
          {initials}
        </span>
      }
    />
  );
}
