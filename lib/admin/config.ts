import crypto from "crypto"

export const ADMIN_EMAIL = "siyandam097@gmail.com"

const SALT = "f5a78c6049e91d0ca51cef7059f113c4"
const HASH = "a4aa04b17398dca04491f829c9dcbc1dd1dd9a56443aea17db262886476457fa"

export function verifyAdminPassword(password: string): boolean {
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
