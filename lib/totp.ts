import { authenticator } from 'otplib';
import QRCode from 'qrcode';
import { randomBytes } from 'crypto';

// Configure OTP settings
authenticator.options = {
  window: 1, // Allow 1 step before/after for time drift
};

/**
 * Generate a new TOTP secret for a user
 */
export function generateTotpSecret(): string {
  return authenticator.generateSecret();
}

/**
 * Generate TOTP URI for QR code
 */
export function generateTotpUri(email: string, secret: string): string {
  const issuer = process.env.TOTP_ISSUER || 'The Creation Beauty Salon';
  
  return authenticator.keyuri(email, issuer, secret);
}

/**
 * Generate QR code data URL for TOTP setup
 */
export async function generateTotpQrCode(email: string, secret: string): Promise<string> {
  const otpauth = generateTotpUri(email, secret);
  return await QRCode.toDataURL(otpauth);
}

/**
 * Verify TOTP token
 */
export function verifyTotpToken(token: string, secret: string): boolean {
  try {
    return authenticator.verify({ token, secret });
  } catch {
    return false;
  }
}

/**
 * Generate current TOTP token (for testing/backup codes)
 */
export function generateTotpToken(secret: string): string {
  return authenticator.generate(secret);
}

/**
 * Generate backup codes for 2FA
 */
export function generateBackupCodes(count: number = 8): string[] {
  const codes: string[] = [];
  
  for (let i = 0; i < count; i++) {
    const code = randomBytes(4).toString('hex').toUpperCase();
    codes.push(`${code.slice(0, 4)}-${code.slice(4, 8)}`);
  }
  
  return codes;
}
