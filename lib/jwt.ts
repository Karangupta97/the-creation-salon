import { SignJWT, jwtVerify } from 'jose';
import { nanoid } from 'nanoid';

// Enforce JWT_SECRET in production
if (!process.env.JWT_SECRET && process.env.NODE_ENV === 'production') {
  throw new Error(
    '🚨 SECURITY ERROR: JWT_SECRET must be set in production. Generate with: openssl rand -base64 32'
  );
}

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production-min-32-chars'
);

const JWT_ALGORITHM = 'HS256';

export interface JWTPayload {
  sub: string; // user ID
  email: string;
  name: string;
  roles: string[];
  type: 'access' | 'refresh';
  jti?: string; // JWT ID for refresh tokens
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  refreshTokenJti: string;
  expiresAt: Date;
}

/**
 * Generate access token (short-lived, 15 minutes)
 */
export async function generateAccessToken(payload: Omit<JWTPayload, 'type'>): Promise<string> {
  const token = await new SignJWT({ ...payload, type: 'access' })
    .setProtectedHeader({ alg: JWT_ALGORITHM })
    .setIssuedAt()
    .setExpirationTime('15m') // Reduced from 60m for tighter security
    .setIssuer(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000')
    .setAudience('admin')
    .sign(JWT_SECRET);

  return token;
}

/**
 * Generate refresh token (long-lived, 7 days)
 */
export async function generateRefreshToken(payload: Omit<JWTPayload, 'type' | 'jti'>): Promise<{
  token: string;
  jti: string;
}> {
  const jti = nanoid();

  const token = await new SignJWT({ ...payload, type: 'refresh', jti })
    .setProtectedHeader({ alg: JWT_ALGORITHM })
    .setIssuedAt()
    .setExpirationTime('7d') // Reduced from 30d for enhanced security
    .setIssuer(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000')
    .setAudience('admin')
    .sign(JWT_SECRET);

  return { token, jti };
}

/**
 * Generate both access and refresh tokens
 */
export async function generateTokenPair(user: {
  id: string;
  email: string;
  name: string;
  roles: string[];
}): Promise<TokenPair> {
  const payload = {
    sub: user.id,
    email: user.email,
    name: user.name,
    roles: user.roles,
  };

  const accessToken = await generateAccessToken(payload);
  const { token: refreshToken, jti: refreshTokenJti } = await generateRefreshToken(payload);

  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

  return {
    accessToken,
    refreshToken,
    refreshTokenJti,
    expiresAt,
  };
}

/**
 * Verify and decode JWT token
 */
export async function verifyToken(token: string): Promise<JWTPayload> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET, {
      issuer: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      audience: 'admin',
    });

    return payload as unknown as JWTPayload;
  } catch {
    throw new Error('Invalid or expired token');
  }
}

/**
 * Verify specifically an access token
 */
export async function verifyAccessToken(token: string): Promise<JWTPayload> {
  const payload = await verifyToken(token);

  if (payload.type !== 'access') {
    throw new Error('Invalid token type');
  }

  return payload;
}

/**
 * Verify specifically a refresh token
 */
export async function verifyRefreshToken(token: string): Promise<JWTPayload> {
  const payload = await verifyToken(token);

  if (payload.type !== 'refresh') {
    throw new Error('Invalid token type');
  }

  return payload;
}
