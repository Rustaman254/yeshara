"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import * as api from "@/lib/api";

interface AuthState {
  investor: api.Investor | null;
  kycStatus: api.KycStatus | null;
  profile: api.KycRecord | null;
  externalUserId: string | null;
  stellarAddress: string | null;
  loading: boolean;
  refresh: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [investor, setInvestor] = useState<api.Investor | null>(null);
  const [kycStatus, setKycStatus] = useState<api.KycStatus | null>(null);
  const [profile, setProfile] = useState<api.KycRecord | null>(null);
  const [externalUserId, setExternalUserId] = useState<string | null>(null);
  const [stellarAddress, setStellarAddress] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!api.getSessionToken()) {
      setInvestor(null);
      setKycStatus(null);
      setProfile(null);
      setExternalUserId(null);
      setStellarAddress(null);
      setLoading(false);
      return;
    }
    try {
      const res = await api.me();
      setInvestor(res.investor);
      setKycStatus(res.kycStatus);
      setExternalUserId(res.externalUserId);
      setStellarAddress(res.stellarAddress ?? null);
      try {
        setProfile(await api.myKyc());
      } catch {
        setProfile(null);
      }
    } catch {
      api.clearSessionToken();
      setInvestor(null);
      setKycStatus(null);
      setProfile(null);
      setExternalUserId(null);
      setStellarAddress(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      const res = await api.login(email, password);
      api.setSessionToken(res.token);
      await refresh();
    },
    [refresh]
  );

  const signUp = useCallback(
    async (email: string, password: string, fullName: string) => {
      const res = await api.register(email, password, fullName);
      api.setSessionToken(res.token);
      await refresh();
    },
    [refresh]
  );

  const signOut = useCallback(async () => {
    try {
      await api.logout();
    } catch {
      // best-effort — clear local state regardless
    }
    api.clearSessionToken();
    setInvestor(null);
    setKycStatus(null);
    setProfile(null);
    setExternalUserId(null);
    setStellarAddress(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ investor, kycStatus, profile, externalUserId, stellarAddress, loading, refresh, signIn, signUp, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
