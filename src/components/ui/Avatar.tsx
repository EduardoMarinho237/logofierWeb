"use client";

import { useState } from "react";
import Image from "next/image";

interface AvatarProps {
  src?: string | null;
  name: string;
  size?: "sm" | "md" | "lg";
}

const sizeMap = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
};

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0][0]?.toUpperCase() ?? "?";
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function hashColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colors = [
    "bg-[#2b9aa8]",
    "bg-[#0e525b]",
    "bg-[#3bb5c4]",
    "bg-[#1a7a85]",
    "bg-[#4ecdc4]",
    "bg-[#2c7a7b]",
  ];
  return colors[Math.abs(hash) % colors.length];
}

export function Avatar({ src, name, size = "md" }: AvatarProps) {
  const [imgError, setImgError] = useState(false);
  const showImage = src && !imgError;

  return (
    <span
      className={`relative inline-flex shrink-0 items-center justify-center rounded-full font-bold text-white shadow-md shadow-[#0e525b]/15 ${sizeMap[size]} ${hashColor(name)}`}
    >
      {showImage ? (
        <Image
          src={src}
          alt={name}
          fill
          sizes="48px"
          className="rounded-full object-cover"
          onError={() => setImgError(true)}
        />
      ) : (
        getInitials(name)
      )}
    </span>
  );
}
