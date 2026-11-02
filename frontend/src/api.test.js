// Runtime validation coverage for session handling and authenticated API requests.
import { afterEach, describe, expect, it, vi } from "vitest";
import { api, clearSession, getToken, getUser, setSession } from "./api";

const storage = new Map();

function createResponse({ status = 200, body = {}, contentType = "application/json" } = {}) {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: { get: () => contentType },
    json: async () => body,
    text: async () => String(body),
  };
}

describe("frontend API and session behavior", () => {
  afterEach(() => {
    storage.clear();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("persists and clears the authenticated session", () => {
    vi.stubGlobal("localStorage", {
      getItem: (key) => storage.get(key) ?? null,
      setItem: (key, value) => storage.set(key, String(value)),
      removeItem: (key) => storage.delete(key),
    });

    setSession("token-123", { name: "Caregiver" });
    expect(getToken()).toBe("token-123");
    expect(getUser()).toEqual({ name: "Caregiver" });

    clearSession();
    expect(getToken()).toBeNull();
    expect(getUser()).toBeNull();
  });

  it("sends the stored bearer token and parses JSON responses", async () => {
    vi.stubGlobal("localStorage", {
      getItem: (key) => (key === "pc_token" ? "token-123" : null),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    });
    const fetch = vi.fn().mockResolvedValue(createResponse({ body: { ok: true } }));
    vi.stubGlobal("fetch", fetch);

    await expect(api("/api/images")).resolves.toEqual({ ok: true });
    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:8080/api/images",
      expect.objectContaining({
        headers: { Authorization: "Bearer token-123" },
      }),
    );
  });

  it("clears the session and rejects unauthorized responses", async () => {
    const removeItem = vi.fn();
    vi.stubGlobal("localStorage", {
      getItem: (key) => (key === "pc_token" ? "expired-token" : null),
      setItem: vi.fn(),
      removeItem,
    });
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        createResponse({ status: 401, body: "Unauthorized", contentType: "text/plain" }),
      ),
    );

    await expect(api("/api/images")).rejects.toThrow("Unauthorized");
    expect(removeItem).toHaveBeenCalledWith("pc_token");
    expect(removeItem).toHaveBeenCalledWith("pc_user");
  });
});
