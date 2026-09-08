"use client";

import { useState, useRef, useEffect } from "react";
import { LogOut, Shield, ChevronDown, UserRound } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { useAuthStore } from "@/stores/authStore";
import { ProfileModal } from "./ProfileModal";
import { AdminMenuModal } from "./AdminMenuModal";

export function UserProfile() {
  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.user);
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  if (!user) return null;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2.5 rounded-2xl bg-white/60 py-1.5 pl-1.5 pr-3 shadow-md shadow-[#0e525b]/8 transition-all duration-150 hover:bg-white hover:shadow-lg hover:shadow-[#0e525b]/10 active:scale-[0.98]"
      >
        <Avatar src={user.avatar_url} name={user.name} size="sm" />
        <span className="hidden text-sm font-semibold text-[#0e525b] sm:inline">{user.name}</span>
        <ChevronDown className={`hidden h-3.5 w-3.5 text-[#0e525b]/40 transition-transform duration-200 sm:inline ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-2xl bg-white p-1.5 shadow-2xl shadow-[#0e525b]/15">
          <div className="flex items-center gap-3 px-3 py-2.5">
            <Avatar src={user.avatar_url} name={user.name} size="md" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-[#0e525b]">{user.name}</p>
              <p className="truncate text-xs text-[#0e525b]/50">{user.email}</p>
            </div>
          </div>

          <div className="my-1.5 h-px bg-[#d0d0dc]" />

          <button
            onClick={() => { setOpen(false); setProfileOpen(true); }}
            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-[#0e525b]/70 transition hover:bg-[#0e525b]/5 hover:text-[#0e525b]"
          >
            <UserRound className="h-4 w-4 text-[#2b9aa8]" />
            Meu perfil
          </button>

          {user.role === "admin" && (
            <button
              onClick={() => { setOpen(false); setAdminOpen(true); }}
              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-[#0e525b]/70 transition hover:bg-[#0e525b]/5 hover:text-[#0e525b]"
            >
              <Shield className="h-4 w-4 text-[#2b9aa8]" />
              Administrar
            </button>
          )}

          <button
            onClick={() => { setOpen(false); logout(); }}
            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-red-500/80 transition hover:bg-red-50 hover:text-red-600"
          >
            <LogOut className="h-4 w-4" />
            Sair
          </button>
        </div>
      )}

      <ProfileModal open={profileOpen} onClose={() => setProfileOpen(false)} />
      <AdminMenuModal open={adminOpen} onClose={() => setAdminOpen(false)} />
    </div>
  );
}
