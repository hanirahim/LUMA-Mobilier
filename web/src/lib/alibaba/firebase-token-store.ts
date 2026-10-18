import "server-only";
import { createCipheriv, createDecipheriv, createPrivateKey, randomBytes, sign } from "node:crypto";
import type { AlibabaTokenResponse } from "./token";

/**
 * Firebase Realtime Database REST client using a short-lived Google OAuth
 * service-account assertion. No client SDK, credential file, or dependency.
 * Only use this on trusted server routes; never return stored token data.
 */
function config() {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  const databaseUrl = process.env.FIREBASE_DATABASE_URL;
  const encryptionKey = process.env.ALIBABA_TOKEN_ENCRYPTION_KEY;
  if (!projectId || !clientEmail || !privateKey || !databaseUrl || !encryptionKey) {
    throw new Error("Firebase Alibaba secure storage is not configured");
  }
  const url = new URL(databaseUrl);
  if (url.protocol !== "https:" || url.username || url.password || url.search || url.hash ||
    url.pathname !== "/" || !url.hostname.endsWith(".firebasedatabase.app")) {
    throw new Error("Invalid Firebase Realtime Database URL");
  }
  const key = Buffer.from(encryptionKey, "base64");
  if (key.length !== 32) throw new Error("Alibaba token encryption key must be 32 bytes");
  return { projectId, clientEmail, privateKey, databaseUrl: url.origin, key };
}

function b64url(value: string | Buffer): string {
  return Buffer.from(value).toString("base64url");
}

async function firebaseAccessToken(c: ReturnType<typeof config>): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = b64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claims = b64url(JSON.stringify({
    iss: c.clientEmail,
    sub: c.clientEmail,
    aud: "https://oauth2.googleapis.com/token",
    scope: "https://www.googleapis.com/auth/firebase.database https://www.googleapis.com/auth/userinfo.email",
    iat: now,
    exp: now + 3600,
  }));
  const unsigned = header + "." + claims;
  const signature = sign("RSA-SHA256", Buffer.from(unsigned), createPrivateKey(c.privateKey));
  const assertion = unsigned + "." + signature.toString("base64url");
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion }),
    cache: "no-store",
    signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) throw new Error("Firebase service account authentication failed");
  const data: unknown = await response.json();
  if (!data || typeof data !== "object" || !("access_token" in data) ||
      typeof data.access_token !== "string") throw new Error("Invalid Google token response");
  return data.access_token;
}

/** Encrypt before storing: Firebase database admins cannot read plaintext. */
export async function saveAlibabaTokensEncrypted(
  accountId: string,
  tokens: AlibabaTokenResponse,
): Promise<void> {
  if (!/^[a-zA-Z0-9_-]{1,128}$/.test(accountId)) throw new Error("Invalid account ID");
  if (!tokens.access_token) throw new Error("Missing Alibaba access token");
  const c = config();
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", c.key, iv);
  const encrypted = Buffer.concat([cipher.update(JSON.stringify(tokens), "utf8"), cipher.final()]);
  const record = {
    version: 1,
    iv: iv.toString("base64"),
    ciphertext: encrypted.toString("base64"),
    tag: cipher.getAuthTag().toString("base64"),
    updatedAt: new Date().toISOString(),
  };
  const bearer = await firebaseAccessToken(c);
  const response = await fetch(c.databaseUrl + "/server_secrets/alibaba/" + accountId + ".json", {
    method: "PUT",
    headers: { Authorization: "Bearer " + bearer, "Content-Type": "application/json" },
    body: JSON.stringify(record),
    cache: "no-store",
    signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) throw new Error("Firebase encrypted token storage failed");
}

/** Server-only reader for later token refresh integration. */
export async function readAlibabaTokensEncrypted(accountId: string): Promise<AlibabaTokenResponse | null> {
  if (!/^[a-zA-Z0-9_-]{1,128}$/.test(accountId)) throw new Error("Invalid account ID");
  const c = config();
  const bearer = await firebaseAccessToken(c);
  const response = await fetch(c.databaseUrl + "/server_secrets/alibaba/" + accountId + ".json", {
    headers: { Authorization: "Bearer " + bearer },
    cache: "no-store",
    signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) throw new Error("Firebase encrypted token read failed");
  const record: unknown = await response.json();
  if (record === null) return null;
  if (!record || typeof record !== "object") throw new Error("Invalid encrypted token record");
  const r = record as Record<string, unknown>;
  if (r.version !== 1 || typeof r.iv !== "string" || typeof r.tag !== "string" ||
      typeof r.ciphertext !== "string") throw new Error("Invalid encrypted token record");
  const decipher = createDecipheriv("aes-256-gcm", c.key, Buffer.from(r.iv, "base64"));
  decipher.setAuthTag(Buffer.from(r.tag, "base64"));
  const clear = Buffer.concat([
    decipher.update(Buffer.from(r.ciphertext, "base64")),
    decipher.final(),
  ]).toString("utf8");
  return JSON.parse(clear) as AlibabaTokenResponse;
}


/**
 * Non-destructive server-only connectivity probe.
 * Reads a reserved diagnostic path; never reads or returns Alibaba tokens.
 * Do not expose this function through a public unauthenticated API route.
 */
export async function verifyFirebaseConnection(): Promise<boolean> {
  const c = config();
  const bearer = await firebaseAccessToken(c);
  const response = await fetch(c.databaseUrl + "/server_secrets/connection_probe.json", {
    method: "GET",
    headers: { Authorization: "Bearer " + bearer },
    cache: "no-store",
    signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) throw new Error("Firebase connectivity check failed");
  return true;
}
