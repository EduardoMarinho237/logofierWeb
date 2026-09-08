"use client";

import { useEffect, useState } from "react";
import { api, type User } from "@/lib/api";
import { Avatar } from "@/components/ui/Avatar";

export function AdminUserAvatar({ user, size = "md" }: { user: User; size?: "sm" | "md" | "lg" }) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    if (!user.avatar_url) return undefined;
    let created: string | null = null;
    api
      .getUserAvatar(user.id)
      .then((blob) => {
        if (!active) return;
        created = URL.createObjectURL(blob);
        setUrl(created);
      })
      .catch(() => {
        // fallback to initials
      });
    return () => {
      active = false;
      if (created) URL.revokeObjectURL(created);
    };
  }, [user.id, user.avatar_url]);

  return <Avatar src={url} name={user.name} size={size} />;
}