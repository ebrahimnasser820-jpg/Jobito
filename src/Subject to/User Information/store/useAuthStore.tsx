import { create } from "zustand";

interface AuthState {
  isLoggingIn: boolean;
  login: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isLoggingIn: false,
  login: () => set({ isLoggingIn: true }),
}));