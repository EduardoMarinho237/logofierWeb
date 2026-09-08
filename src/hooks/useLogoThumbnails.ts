"use client";

import { useEffect, useState } from "react";
import { api, type Logo } from "@/lib/api";

export function useLogoThumbnails(logos: Logo[]) {
  const [urls, setUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    const revoked: string[] = [];
    let active = true;

    async function loadAll() {
      const results = await Promise.allSettled(
        logos.map(async (logo) => {
          const blob = await api.getLogoThumbnail(logo.id);
          return { id: logo.id, url: URL.createObjectURL(blob) };
        })
      );
      if (!active) {
        results.forEach((r) => {
          if (r.status === "fulfilled") URL.revokeObjectURL(r.value.url);
        });
        return;
      }
      const map: Record<string, string> = {};
      results.forEach((r) => {
        if (r.status === "fulfilled") {
          map[r.value.id] = r.value.url;
          revoked.push(r.value.url);
        }
      });
      setUrls(map);
    }

    loadAll();

    return () => {
      active = false;
      revoked.forEach((u) => URL.revokeObjectURL(u));
    };
  }, [logos]);

  return urls;
}
