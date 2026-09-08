"use client";

import { useEffect } from "react";

export function HeadContent() {
  useEffect(() => {
    const light = document.createElement("link");
    light.rel = "icon";
    light.href = "/favicon-light.svg";
    light.type = "image/svg+xml";
    light.sizes = "any";
    light.media = "(prefers-color-scheme: light)";
    document.head.appendChild(light);

    const dark = document.createElement("link");
    dark.rel = "icon";
    dark.href = "/favicon-dark.svg";
    dark.type = "image/svg+xml";
    dark.sizes = "any";
    dark.media = "(prefers-color-scheme: dark)";
    document.head.appendChild(dark);

    return () => {
      document.head.removeChild(light);
      document.head.removeChild(dark);
    };
  }, []);

  return null;
}
