"use client";

import { useRouter } from "next/navigation";
import { FileArchive, ImageIcon, LayoutTemplate, type LucideIcon } from "lucide-react";

interface ConfigItem {
  label: string;
  icon: LucideIcon;
  href: string;
}

const CONFIG_ITEMS: ConfigItem[] = [
  {
    label: "Logos",
    icon: ImageIcon,
    href: "/logos",
  },
  {
    label: "Presets",
    icon: LayoutTemplate,
    href: "/presets",
  },
  {
    label: "Processamentos",
    icon: FileArchive,
    href: "/processings",
  },
];

export function DashboardOptions() {
  const router = useRouter();
  const items = CONFIG_ITEMS;

  return (
    <nav className="flex shrink-0 flex-row gap-2 overflow-x-auto px-4 pt-4 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:absolute md:left-8 md:top-6 md:w-56 md:flex-col md:gap-3 md:overflow-visible md:px-0 md:pt-0 md:pb-0">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <button
            key={item.label}
            onClick={() => router.push(item.href)}
            className="flex shrink-0 items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-md shadow-[#0e525b]/5 transition-all duration-150 hover:shadow-lg hover:shadow-[#0e525b]/10 active:scale-[0.98] md:w-full md:px-5 md:py-4"
          >
            <Icon className="h-5 w-5 shrink-0 text-[#2b9aa8]" />
            <span className="text-sm font-semibold text-[#0e525b]">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}