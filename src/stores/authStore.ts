"use client";

import { create } from "zustand";
import { api, clearAuth, getToken, type User } from "@/lib/api";

async function resolveAvatar(user: User): Promise<User> {
  if (!user.avatar_url) return user;
  try {
    const blob = await api.getAvatar();
    return { ...user, avatar_url: URL.createObjectURL(blob) };
  } catch {
    return { ...user, avatar_url: null };
  }
}

interface AuthState {
  isAuthenticated: boolean;
  isInitialising: boolean;
  user: User | null;
  checkAuth: () => void;
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  isInitialising: true,
  user: null,
  checkAuth: () => {
    const hasToken = !!getToken();
    if (!hasToken) {
      set({ isAuthenticated: false, isInitialising: false });
      return;
    }
    set({ isAuthenticated: true, isInitialising: true });
    api
      .me()
      .then(resolveAvatar)
      .then((user) => set({ user, isInitialising: false }))
      .catch(() =>
        set({ isAuthenticated: false, user: null, isInitialising: false })
      );
  },
  refreshUser: async () => {
    if (!getToken()) return;
    try {
      const user = await resolveAvatar(await api.me());
      set({ user, isAuthenticated: true, isInitialising: false });
    } catch {
      clearAuth();
      set({ user: null, isAuthenticated: false, isInitialising: false });
    }
  },
  logout: async () => {
    try {
      await api.logout();
    } finally {
      set({ isAuthenticated: false, user: null, isInitialising: false });
    }
  },
}));
