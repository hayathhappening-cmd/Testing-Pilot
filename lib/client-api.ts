"use client";

const TOKEN_KEY = "qa-copilot-token";
export const AUTH_CHANGE_EVENT = "qa-copilot-auth-change";

export function apiBaseUrl() {
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
}

export function getToken() {
  if (typeof window === "undefined") {
    return "";
  }
  return window.localStorage.getItem(TOKEN_KEY) || "";
}

export function setToken(token: string) {
  window.localStorage.setItem(TOKEN_KEY, token);
  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
}

export function clearToken() {
  window.localStorage.removeItem(TOKEN_KEY);
  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
}

export async function apiRequest<T>(path: string, init?: RequestInit) {
  const headers = new Headers(init?.headers);
  const token = getToken();

  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  if (!(init?.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${apiBaseUrl()}${path}`, {
    ...init,
    headers,
  });

  const isJson = response.headers.get("content-type")?.includes("application/json");
  const payload = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    throw new Error((payload as { error?: string })?.error || "Request failed.");
  }

  return payload as T;
}

export async function apiDownload(path: string, init?: RequestInit) {
  const headers = new Headers(init?.headers);
  const token = getToken();

  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  if (!(init?.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${apiBaseUrl()}${path}`, {
    ...init,
    headers,
  });

  if (!response.ok) {
    const isJson = response.headers.get("content-type")?.includes("application/json");
    const payload = isJson ? await response.json() : await response.text();
    throw new Error((payload as { error?: string })?.error || "Request failed.");
  }

  return response.blob();
}
