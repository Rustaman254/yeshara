const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8200";

export function getSessionToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("yeshara_session");
}

export function setSessionToken(token: string) {
  localStorage.setItem("yeshara_session", token);
}

export function clearSessionToken() {
  localStorage.removeItem("yeshara_session");
}

export function getAdminToken(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem("yeshara_admin_token");
}

export function setAdminToken(token: string) {
  sessionStorage.setItem("yeshara_admin_token", token);
}

class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, init?: RequestInit, opts?: { auth?: boolean; admin?: boolean }): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (opts?.auth) {
    const token = getSessionToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }
  if (opts?.admin) {
    const token = getAdminToken();
    if (token) headers["X-Admin-Token"] = token;
  }

  const res = await fetch(`${API_BASE}${path}`, { ...init, headers: { ...headers, ...init?.headers } });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(res.status, body.error || `Request failed (${res.status})`);
  }
  return body as T;
}

// ── Types ────────────────────────────────────────────────────────────────

export interface Offering {
  id: string;
  offeringId: string;
  title: string;
  assetType: string;
  location: string;
  description: string;
  imageUrl?: string;
  totalUnits: number;
  pricePerUnit: number;
  currency: string;
  minInvestmentUnits?: number;
  expectedYieldPct?: number;
  riskLevel?: "low" | "medium" | "high" | string;
  chain: string;
  symbol?: string;
  receiptId: string;
  status: "pending_approval" | "live" | "rejected" | "closed";
  createdAt: string;
  availableUnits?: number;
  unitsSold?: number;
  fundedPct?: number;
  kesPerUnit?: number;
}

export interface OfferingDetail {
  offering: Offering;
  availableUnits?: number;
  unitsSold?: number;
  kesPerUnit?: number;
}

export type PaymentProvider = "mpesa" | "airtel";

export interface Investment {
  id: string;
  offeringId: string;
  investorId: string;
  units: number;
  amountDue: number;
  currency: string;
  status: "pending_payment" | "completed" | "cancelled" | "failed";
  txHash?: string;
  paymentRef: string;
  createdAt: string;
  confirmedAt?: string;
  paymentProvider?: PaymentProvider;
  phone?: string;
  secureId?: string;
  providerReference?: string;
  failureReason?: string;
}

export interface Investor {
  id: string;
  email: string;
  fullName: string;
  createdAt: string;
}

export type KycStatus = "unverified" | "pending" | "verified" | "rejected";

export interface KycRecord {
  status: KycStatus;
  fullName?: string;
  country?: string;
  address?: string;
  idNumber?: string;
  dateOfBirth?: string;
  rejectionReason?: string;
  submittedAt?: string;
  decidedAt?: string;
}

export interface Holding {
  offeringId: string;
  title: string;
  symbol: string;
  units: number;
  pricePerUnit: number;
  value: number;
  currency: string;
}

// ── Public ───────────────────────────────────────────────────────────────

export const listOfferings = () => request<{ offerings: Offering[]; count: number }>("/api/v1/offerings");
export const getOffering = (offeringId: string) => request<OfferingDetail>(`/api/v1/offerings/${offeringId}`);

// ── Auth ─────────────────────────────────────────────────────────────────

export const register = (email: string, password: string, fullName: string) =>
  request<{ investor: Investor; token: string }>("/api/v1/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password, fullName }),
  });

export const login = (email: string, password: string) =>
  request<{ investor: Investor; token: string }>("/api/v1/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

export const logout = () => request("/api/v1/auth/logout", { method: "POST" }, { auth: true });

export const me = () =>
  request<{ investor: Investor; kycStatus: KycStatus; externalUserId: string; stellarAddress?: string }>(
    "/api/v1/me",
    {},
    { auth: true }
  );

// ── KYC ──────────────────────────────────────────────────────────────────

export const submitKyc = (fullName: string, country: string, address: string, idNumber: string, dateOfBirth: string) =>
  request(
    "/api/v1/kyc/submit",
    { method: "POST", body: JSON.stringify({ fullName, country, address, idNumber, dateOfBirth }) },
    { auth: true }
  );

export const kycStatus = () => request<{ status: KycStatus }>("/api/v1/kyc/status", {}, { auth: true });

export const myKyc = () => request<KycRecord>("/api/v1/kyc/me", {}, { auth: true });

export const updateAddress = (address: string) =>
  request("/api/v1/kyc/address", { method: "PATCH", body: JSON.stringify({ address }) }, { auth: true });

// ── Investing ────────────────────────────────────────────────────────────

export const invest = (offeringId: string, units: number) =>
  request<{ investment: Investment; message: string }>(
    `/api/v1/offerings/${offeringId}/invest`,
    { method: "POST", body: JSON.stringify({ units }) },
    { auth: true }
  );

export const investMobileMoney = (offeringId: string, units: number, provider: PaymentProvider, phone: string) =>
  request<{ investment: Investment; kesAmount: number; message: string }>(
    `/api/v1/offerings/${offeringId}/invest/mobile-money`,
    { method: "POST", body: JSON.stringify({ units, provider, phone }) },
    { auth: true }
  );

export const getInvestmentStatus = (id: string) =>
  request<{ investment: Investment }>(`/api/v1/me/investments/${id}`, {}, { auth: true });

export const myInvestments = () => request<{ investments: Investment[] }>("/api/v1/me/investments", {}, { auth: true });
export const myPortfolio = () => request<{ holdings: Holding[]; totalValue: number }>("/api/v1/me/portfolio", {}, { auth: true });

// ── Admin ────────────────────────────────────────────────────────────────

export const adminLogin = (email: string, password: string) =>
  request<{ token: string }>("/api/v1/admin/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

export const adminListOfferings = (status?: string) =>
  request<{ offerings: Offering[] }>(`/api/v1/admin/offerings${status ? `?status=${status}` : ""}`, {}, { admin: true });

export const adminCreateOffering = (input: {
  offeringId: string;
  title: string;
  assetType: string;
  location: string;
  description: string;
  imageUrl?: string;
  totalUnits: number;
  pricePerUnit: number;
  currency: string;
  minInvestmentUnits?: number;
  expectedYieldPct?: number;
  riskLevel?: string;
}) => request<Offering>("/api/v1/admin/offerings", { method: "POST", body: JSON.stringify(input) }, { admin: true });

export const adminApproveOffering = (offeringId: string, approvedBy: string) =>
  request<{ offering: Offering; mintTxHash: string }>(
    `/api/v1/admin/offerings/${offeringId}/approve`,
    { method: "POST", body: JSON.stringify({ approvedBy }) },
    { admin: true }
  );

export const adminRejectOffering = (offeringId: string, reason: string) =>
  request(`/api/v1/admin/offerings/${offeringId}/reject`, { method: "POST", body: JSON.stringify({ reason }) }, { admin: true });

export const adminListOfferingInvestments = (offeringId: string) =>
  request<{ investments: Investment[] }>(`/api/v1/admin/offerings/${offeringId}/investments`, {}, { admin: true });

export const adminConfirmInvestment = (investmentId: string) =>
  request<{ investment: Investment }>(`/api/v1/admin/investments/${investmentId}/confirm`, { method: "POST" }, { admin: true });

export const adminListPendingKyc = () => request<{ pending: unknown[] }>("/api/v1/admin/kyc/pending", {}, { admin: true });

export const adminDecideKyc = (investorId: string, approved: boolean, decidedBy: string, reason?: string) =>
  request(
    `/api/v1/admin/kyc/${investorId}/decide`,
    { method: "POST", body: JSON.stringify({ approved, decidedBy, reason }) },
    { admin: true }
  );

export { ApiError };
