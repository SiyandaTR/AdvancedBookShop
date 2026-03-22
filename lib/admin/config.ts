import crypto from "crypto"

export const ADMIN_EMAIL = process.env.ADMIN_EMAIL || ""

const SALT = process.env.ADMIN_PASSWORD_SALT || ""
const HASH = process.env.ADMIN_PASSWORD_HASH || ""

export function verifyAdminPassword(password: string): boolean {
  if (!SALT || !HASH) return false
  const hash = crypto.createHmac("sha256", SALT).update(password).digest("hex")
  return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(HASH))
}

// In-memory token store. Tokens expire after 24 hours.
const adminTokens = new Map<string, number>()

export function createAdminToken(): string {
  const token = crypto.randomBytes(32).toString("hex")
  adminTokens.set(token, Date.now() + 24 * 60 * 60 * 1000)
  return token
}

export function validateAdminToken(token: string): boolean {
  const expiry = adminTokens.get(token)
  if (!expiry) return false
  if (Date.now() > expiry) {
    adminTokens.delete(token)
    return false
  }
  return true
}

export function revokeAdminToken(token: string): void {
  adminTokens.delete(token)
}

export function getAdminCookieName() {
  return "admin_token"
}
