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

// Admin login is a single shared-secret token, not a per-admin session —
// there's no server-side identity behind it. Storing the email the admin
// typed in at login is the only way to attribute "who did this" actions
// (approving an offering, deciding KYC, triggering a distribution) without
// prompting for a name every time.
export function getAdminEmail(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem("yeshara_admin_email");
}

export function setAdminEmail(email: string) {
  sessionStorage.setItem("yeshara_admin_email", email);
}

// Owner sessions are a separate namespace from investor sessions — same
// bearer-token shape, different localStorage key so signing into one
// doesn't clobber or get confused with the other.
export function getOwnerSessionToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("yeshara_owner_session");
}

export function setOwnerSessionToken(token: string) {
  localStorage.setItem("yeshara_owner_session", token);
}

export function clearOwnerSessionToken() {
  localStorage.removeItem("yeshara_owner_session");
}

// Staff sessions (the Manager A/B, Trustee A/B seats) — sessionStorage like
// the admin token, since these are operational logins for a shared machine
// at a desk, not something to keep signed into across browser restarts.
export function getStaffSessionToken(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem("yeshara_staff_session");
}

export function setStaffSessionToken(token: string) {
  sessionStorage.setItem("yeshara_staff_session", token);
}

export function clearStaffSessionToken() {
  sessionStorage.removeItem("yeshara_staff_session");
}

class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function request<T>(
  path: string,
  init?: RequestInit,
  opts?: { auth?: boolean; admin?: boolean; ownerAuth?: boolean; staffAuth?: boolean }
): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (opts?.auth) {
    const token = getSessionToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }
  if (opts?.admin) {
    const token = getAdminToken();
    if (token) headers["X-Admin-Token"] = token;
  }
  if (opts?.ownerAuth) {
    const token = getOwnerSessionToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }
  if (opts?.staffAuth) {
    const token = getStaffSessionToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, { ...init, headers: { ...headers, ...init?.headers } });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(res.status, body.error || `Request failed (${res.status})`);
  }
  return body as T;
}

// ── Types ────────────────────────────────────────────────────────────────

export interface Highlight {
  title: string;
  body: string;
}

export interface PerformancePeriod {
  label: string;
  startPrice: number;
  endPrice: number;
  returnPct: number;
}

export interface OfferingDocument {
  name: string;
  url: string;
}

export interface Stat {
  label: string;
  value: string;
}

export interface OfferingDetails {
  tags?: string[];
  trailingOneYearReturnPct?: number;
  expenseRatioPct?: number;
  underlyingFundExpensesPct?: number;
  subscriptionFrequency?: string;
  subscriptionDeadline?: string;
  domicile?: string;
  liquidityPool?: string;
  redemptionWindow?: string;
  tokenTransferLockup?: string;
  volatilityLevel?: "low" | "medium" | "high" | string;
  liquidityLevel?: "low" | "medium" | "high" | string;
  highlights?: Highlight[];
  performanceHistory?: PerformancePeriod[];
  documents?: OfferingDocument[];
  managerName?: string;
  managerBio?: string;
  managerStats?: Stat[];
  disclosures?: string;
}

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
  // The approval chain is four sequential, separately-authenticated seats
  // (Manager A -> Manager B -> Trustee A -> Trustee B) before an offering
  // goes live — see internal/staff and internal/offerings on the backend.
  status: "pending_manager_a" | "pending_manager_b" | "pending_trustee_a" | "pending_trustee_b" | "live" | "rejected" | "closed";
  createdAt: string;
  availableUnits?: number;
  unitsSold?: number;
  fundedPct?: number;
  kesPerUnit?: number;
  details?: OfferingDetails;
  ownerUserId?: string;
  reservedUnits?: number;
  reserveTxHash?: string;
  ownerAccountId?: string;
  mintTxHash?: string;
  mintTxUrl?: string;
  assetUrl?: string;
  managerAReviewedBy?: string;
  managerAReviewedAt?: string;
  managerBReviewedBy?: string;
  managerBReviewedAt?: string;
  trusteeAApprovedBy?: string;
  trusteeAApprovedAt?: string;
  trusteeBTokenizedBy?: string;
  trusteeBTokenizedAt?: string;
  rejectedBy?: string;
  rejectedStage?: string;
  rejectedReason?: string;
}

// STAGE_LABELS/STAGE_ORDER give the UI a human name and a fixed sequence
// for each status — the same vocabulary internal/offerings.Status uses.
export const STAGE_LABELS: Record<string, string> = {
  pending_manager_a: "Manager A review",
  pending_manager_b: "Manager B countercheck",
  pending_trustee_a: "Trustee A approval",
  pending_trustee_b: "Trustee B tokenization",
  live: "Live",
  rejected: "Rejected",
  closed: "Closed",
};

export type StaffRole = "manager_a" | "manager_b" | "trustee_a" | "trustee_b";

export const STAFF_ROLE_LABELS: Record<StaffRole, string> = {
  manager_a: "Manager A",
  manager_b: "Manager B",
  trustee_a: "Trustee A",
  trustee_b: "Trustee B",
};

export interface StaffMember {
  id: string;
  email: string;
  fullName: string;
  role: StaffRole;
  createdAt: string;
}

export interface OfferingDetail {
  offering: Offering;
  availableUnits?: number;
  unitsSold?: number;
  kesPerUnit?: number;
  fundedPct?: number;
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
  kesValue?: number;
}

export type PayoutMethod = "manual" | "mpesa_b2c" | "onchain_token";

export type DistributionStatus = "pending" | "processing" | "completed" | "partial_failure" | "funding_required";
export type EntryStatus = "pending" | "processing" | "paid" | "failed";

export interface Distribution {
  id: string;
  offeringId: string;
  periodLabel: string;
  totalAmount: number;
  currency: string;
  payoutMethod: PayoutMethod;
  payoutAssetSymbol?: string;
  status: DistributionStatus;
  createdBy: string;
  createdAt: string;
}

export interface DistributionEntry {
  id: string;
  distributionId: string;
  offeringId: string;
  investorId: string;
  units: number;
  amount: number;
  currency: string;
  payoutMethod: PayoutMethod;
  status: EntryStatus;
  paymentRef?: string;
  failureReason?: string;
  createdAt: string;
  paidAt?: string;
}

export type RedemptionStatus = "pending" | "rejected" | "approved_burned" | "paid" | "failed";

export interface RedemptionRequest {
  id: string;
  offeringId: string;
  investorId: string;
  units: number;
  payoutAmount: number;
  currency: string;
  payoutMethod: PayoutMethod;
  payoutAssetSymbol?: string;
  phone?: string;
  status: RedemptionStatus;
  burnTxHash?: string;
  paymentRef?: string;
  failureReason?: string;
  rejectionReason?: string;
  requestedAt: string;
  approvedAt?: string;
  paidAt?: string;
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
export const myPortfolio = () =>
  request<{ holdings: Holding[]; totalValue: number; totalKesValue: number }>("/api/v1/me/portfolio", {}, { auth: true });

// ── Yield & redemptions ─────────────────────────────────────────────────

export const setPayoutPhone = (phone: string) =>
  request("/api/v1/me/payout-phone", { method: "PATCH", body: JSON.stringify({ phone }) }, { auth: true });

export const myYield = () =>
  request<{ entries: DistributionEntry[]; earnedByCurrency: Record<string, number>; pendingByCurrency: Record<string, number> }>(
    "/api/v1/me/yield",
    {},
    { auth: true }
  );

export const requestRedemption = (
  offeringId: string,
  units: number,
  payoutMethod: PayoutMethod,
  opts?: { phone?: string; payoutAssetSymbol?: string }
) =>
  request<{ redemption: RedemptionRequest }>(
    `/api/v1/offerings/${offeringId}/redemptions`,
    { method: "POST", body: JSON.stringify({ units, payoutMethod, ...opts }) },
    { auth: true }
  );

export const myRedemptions = () => request<{ redemptions: RedemptionRequest[] }>("/api/v1/me/redemptions", {}, { auth: true });

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
  details?: OfferingDetails;
}) => request<Offering>("/api/v1/admin/offerings", { method: "POST", body: JSON.stringify(input) }, { admin: true });

export const adminRevalueOffering = (offeringId: string, newPricePerUnit: number, reason: string) =>
  request<{ offering: Offering }>(
    `/api/v1/admin/offerings/${offeringId}/revalue`,
    { method: "POST", body: JSON.stringify({ newPricePerUnit, reason }) },
    { admin: true }
  );

export const adminUpdateOfferingDetails = (offeringId: string, details: OfferingDetails) =>
  request<{ offering: Offering }>(
    `/api/v1/admin/offerings/${offeringId}/details`,
    { method: "PATCH", body: JSON.stringify(details) },
    { admin: true }
  );

// Delisting takes a live offering off the public marketplace — the
// on-chain asset and every investor's existing holding are untouched, only
// new discovery/investment stops. Reversible via adminRelistOffering.
export const adminDelistOffering = (offeringId: string, delistedBy: string, reason: string) =>
  request<{ offering: Offering }>(
    `/api/v1/admin/offerings/${offeringId}/delist`,
    { method: "POST", body: JSON.stringify({ delistedBy, reason }) },
    { admin: true }
  );

export const adminRelistOffering = (offeringId: string) =>
  request<{ offering: Offering }>(`/api/v1/admin/offerings/${offeringId}/relist`, { method: "POST" }, { admin: true });

// Offering approval is no longer a single admin action — it's the four-seat
// Manager A/B -> Trustee A/B chain below (see "Staff" section). An admin
// only creates the offering and provisions the four staff accounts.

export const adminCreateStaffAccount = (input: { email: string; password: string; fullName: string; role: StaffRole }) =>
  request<{ staff: StaffMember }>("/api/v1/admin/staff", { method: "POST", body: JSON.stringify(input) }, { admin: true });

export const adminListStaffAccounts = () => request<{ staff: StaffMember[] }>("/api/v1/admin/staff", {}, { admin: true });

export const adminDeleteStaffAccount = (id: string) => request(`/api/v1/admin/staff/${id}`, { method: "DELETE" }, { admin: true });

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

// ── Admin: distributions ────────────────────────────────────────────────

export const adminTriggerDistribution = (
  offeringId: string,
  input: { periodLabel: string; totalAmount: number; payoutMethod: PayoutMethod; payoutAssetSymbol?: string; createdBy: string }
) =>
  request<{
    distribution: Distribution;
    entries: DistributionEntry[];
    status?: string;
    treasuryAvailable?: number;
    required?: number;
    message?: string;
  }>(`/api/v1/admin/offerings/${offeringId}/distributions`, { method: "POST", body: JSON.stringify(input) }, { admin: true });

export const adminListOfferingDistributions = (offeringId: string) =>
  request<{ distributions: Distribution[] }>(`/api/v1/admin/offerings/${offeringId}/distributions`, {}, { admin: true });

export const adminListDistributionEntries = (distributionId: string) =>
  request<{ entries: DistributionEntry[] }>(`/api/v1/admin/distributions/${distributionId}/entries`, {}, { admin: true });

export const adminMarkDistributionEntryPaid = (entryId: string, paymentRef: string) =>
  request<{ entry: DistributionEntry }>(
    `/api/v1/admin/distributions/entries/${entryId}/mark-paid`,
    { method: "POST", body: JSON.stringify({ paymentRef }) },
    { admin: true }
  );

// ── Admin: redemptions ──────────────────────────────────────────────────

export const adminListRedemptions = (status?: string) =>
  request<{ redemptions: RedemptionRequest[] }>(`/api/v1/admin/redemptions${status ? `?status=${status}` : ""}`, {}, { admin: true });

export const adminApproveRedemption = (id: string) =>
  request<{ redemption: RedemptionRequest }>(`/api/v1/admin/redemptions/${id}/approve`, { method: "POST" }, { admin: true });

export const adminRejectRedemption = (id: string, reason: string) =>
  request(`/api/v1/admin/redemptions/${id}/reject`, { method: "POST", body: JSON.stringify({ reason }) }, { admin: true });

export const adminMarkRedemptionPaid = (id: string, paymentRef: string) =>
  request<{ redemption: RedemptionRequest }>(
    `/api/v1/admin/redemptions/${id}/mark-paid`,
    { method: "POST", body: JSON.stringify({ paymentRef }) },
    { admin: true }
  );

export const adminSetOfferingOwnerAccount = (offeringId: string, email: string) =>
  request<{ offering: Offering }>(
    `/api/v1/admin/offerings/${offeringId}/owner-account`,
    { method: "PATCH", body: JSON.stringify({ email }) },
    { admin: true }
  );

// ── Staff (Manager A/B, Trustee A/B) ────────────────────────────────────
// The four-seat approval chain an offering moves through before it goes
// live. Each seat is its own login (provisioned by an admin, see
// adminCreateStaffAccount above) — segregation of duties is enforced
// server-side (a session's role decides what it's allowed to do, not
// anything the client sends), this client just calls the one shared
// review/reject endpoint and lets the backend dispatch on the logged-in
// staff member's role.

export const staffLogin = (email: string, password: string) =>
  request<{ token: string; staff: StaffMember }>("/api/v1/staff/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

export const staffLogout = () => request("/api/v1/staff/auth/logout", { method: "POST" }, { staffAuth: true });

export const staffMe = () => request<{ staff: StaffMember }>("/api/v1/staff/me", {}, { staffAuth: true });

// staffQueue returns whatever's sitting on the logged-in seat's own desk —
// the server maps role -> status, so the client never needs to know the
// status vocabulary.
export const staffQueue = () => request<{ offerings: Offering[]; count: number }>("/api/v1/staff/offerings", {}, { staffAuth: true });

export const staffReviewOffering = (offeringId: string) =>
  request<{ offering: Offering; mintTxHash?: string; mintTxUrl?: string }>(
    `/api/v1/staff/offerings/${offeringId}/review`,
    { method: "POST" },
    { staffAuth: true }
  );

export const staffRejectOffering = (offeringId: string, reason: string) =>
  request(`/api/v1/staff/offerings/${offeringId}/reject`, { method: "POST", body: JSON.stringify({ reason }) }, { staffAuth: true });

// ── Owner accounts ───────────────────────────────────────────────────────
// The real-world owner of a tokenized asset's 20% reserve (see
// offerings.ReservedOwnerPct on the backend). Self-service signup, but an
// admin has to separately link the account to a specific offering after
// verifying real-world ownership off-platform.

export interface Owner {
  id: string;
  email: string;
  fullName: string;
  createdAt: string;
}

export interface OwnerOffering {
  offeringId: string;
  title: string;
  symbol: string;
  reservedUnits: number;
  pricePerUnit: number;
  value: number;
  currency: string;
  kesValue?: number;
}

export const ownerRegister = (email: string, password: string, fullName: string) =>
  request<{ owner: Owner; token: string }>("/api/v1/owners/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password, fullName }),
  });

export const ownerLogin = (email: string, password: string) =>
  request<{ owner: Owner; token: string }>("/api/v1/owners/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

export const ownerLogout = () => request("/api/v1/owners/auth/logout", { method: "POST" }, { ownerAuth: true });

export const ownerMe = () => request<{ owner: Owner }>("/api/v1/owners/me", {}, { ownerAuth: true });

export const ownerMyOfferings = () =>
  request<{ offerings: OwnerOffering[]; count: number }>("/api/v1/owners/me/offerings", {}, { ownerAuth: true });

export { ApiError };
