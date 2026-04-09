export interface JwtPayload {
  id: number;
  status: string;
  is_onboarded: boolean;
  // standard claims
  exp?: number;
  iat?: number;
  sub?: string;
}

/**
 * Decodes the payload of a JWT without verifying the signature.
 * Verification is the backend's responsibility; we just need the claims.
 */
export function decodeJwt(token: string): JwtPayload {
  const parts = token.split(".");
  if (parts.length !== 3) throw new Error("Invalid JWT format.");

  // JWT uses base64url encoding — replace chars and add padding
  const base64url = parts[1];
  const base64 = base64url.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");

  const json = atob(padded);
  return JSON.parse(json) as JwtPayload;
}
