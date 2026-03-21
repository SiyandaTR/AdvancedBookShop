import crypto from "crypto"

export const ADMIN_EMAIL = "siyandam097@gmail.com"

const SALT = "f5a78c6049e91d0ca51cef7059f113c4"
const HASH = "a4aa04b17398dca04491f829c9dcbc1dd1dd9a56443aea17db262886476457fa"

export function verifyAdminPassword(password: string): boolean {
  const hash = crypto.createHmac("sha256", SALT).update(password).digest("hex")
  return hash === HASH
}

export function createAdminToken(): string {
  return crypto.randomBytes(32).toString("hex")
}

const ADMIN_TOKEN_COOKIE = "admin_token"

export function getAdminCookieName() {
  return ADMIN_TOKEN_COOKIE
}
