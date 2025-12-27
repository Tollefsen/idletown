import Image from "next/image";
import type { HTMLAttributes } from "react";
import { avatarSizes } from "../config/theme";

type AvatarSize = keyof typeof avatarSizes;

interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  name?: string;
  size?: AvatarSize;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

const imageSizes: Record<AvatarSize, number> = {
  xs: 24,
  sm: 32,
  md: 40,
  lg: 48,
  xl: 64,
};

export function Avatar({
  src,
  alt = "",
  name,
  size = "md",
  className = "",
  ...props
}: AvatarProps) {
  const sizeClasses = avatarSizes[size];
  const imageSize = imageSizes[size];

  if (src) {
    return (
      <div
        className={`relative inline-flex items-center justify-center overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700 ${sizeClasses} ${className}`}
        {...props}
      >
        <Image
          src={src}
          alt={alt || name || "Avatar"}
          width={imageSize}
          height={imageSize}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  const initials = name ? getInitials(name) : "?";

  return (
    <div
      className={`inline-flex items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-medium ${sizeClasses} ${className}`}
      title={name}
      {...props}
    >
      {initials}
    </div>
  );
}
