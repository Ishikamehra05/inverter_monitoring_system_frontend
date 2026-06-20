export type UserPortal = "monitoring" | "service";

const TOKEN_KEY = "token";
const REFRESH_TOKEN_KEY = "refreshToken";
const PORTAL_KEY = "userPortal";
const ACCOUNT_KEY = "userAccount";
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

type AuthSession = {
  token: string | null;
  refreshToken: string | null;
  portal: UserPortal | null;
  account: string | null;
};

const canUseStorage = () => typeof window !== "undefined";

const setCookie = (name: string, value: string, maxAgeSeconds: number) => {
  if (!canUseStorage()) return;
  const isSecure = window.location.protocol === "https:";
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAgeSeconds}; samesite=lax${isSecure ? "; secure" : ""}`;
};

const clearCookie = (name: string) => {
  if (!canUseStorage()) return;
  const isSecure = window.location.protocol === "https:";
  document.cookie = `${name}=; path=/; max-age=0; samesite=lax${isSecure ? "; secure" : ""}`;
};

const decodeBase64Url = (value: string) => {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padding = normalized.length % 4;
  const base64 = normalized + (padding ? "=".repeat(4 - padding) : "");
  return atob(base64);
};

const getAccountFromToken = (token: string | null): string | null => {
  if (!token) return null;

  try {
    const [, payload] = token.split(".");
    if (!payload) return null;

    const decoded = decodeBase64Url(payload);
    const parsed = JSON.parse(decoded) as { account?: unknown };

    return typeof parsed.account === "string" ? parsed.account : null;
  } catch {
    return null;
  }
};

export const getAuthSession = (): AuthSession => {
  if (!canUseStorage()) {
    return { token: null, portal: null, account: null, refreshToken: null };
  }

  const token = localStorage.getItem(TOKEN_KEY);
  const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
  const portalRaw = localStorage.getItem(PORTAL_KEY);
  const storedAccount = localStorage.getItem(ACCOUNT_KEY);
  const portal =
    portalRaw === "monitoring" || portalRaw === "service" ? portalRaw : null;
  const account = storedAccount ?? getAccountFromToken(token);

  return { token, refreshToken, portal, account };
};

export const setAuthSession = (
  token: string,
  refreshToken: string,
  portal: UserPortal,
  account: string,
) => {
  if (!canUseStorage()) return;
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(PORTAL_KEY, portal);
  localStorage.setItem(ACCOUNT_KEY, account);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);

  setCookie(REFRESH_TOKEN_KEY, refreshToken, COOKIE_MAX_AGE_SECONDS);
  setCookie(TOKEN_KEY, token, COOKIE_MAX_AGE_SECONDS);
  setCookie(PORTAL_KEY, portal, COOKIE_MAX_AGE_SECONDS);
  setCookie(ACCOUNT_KEY, account, COOKIE_MAX_AGE_SECONDS);
};

export const clearAuthSession = () => {
  if (!canUseStorage()) return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(PORTAL_KEY);
  localStorage.removeItem(ACCOUNT_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  clearCookie(REFRESH_TOKEN_KEY);
  clearCookie(TOKEN_KEY);
  clearCookie(PORTAL_KEY);
  clearCookie(ACCOUNT_KEY);
};
