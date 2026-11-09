import jwt from "jsonwebtoken";

export interface UserTokenPayload {
  sub: number;
  nim: string;
  nama: string;
  email: string;
  role: string;
}

export class TokenError extends Error {
  readonly statusCode: number = 401;
  readonly code: string;

  constructor(message: string, code: string) {
    super(message);
    this.name = "TokenError";
    this.code = code;
  }
}

const getJwtSecret = (): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.trim() === "") {
    if (process.env.NODE_ENV === "production") {
      throw new Error("FATAL: JWT_SECRET belum dikonfigurasi di environment variable");
    }
    return "zaky_academic_jwt_secret_key_super_secure_2026_unsap";
  }
  return secret.trim();
};

const getJwtExpiresIn = (): string => {
  return process.env.JWT_EXPIRES_IN?.trim() || "15m";
};

export const generateAccessToken = (payload: UserTokenPayload) => {
  const secret = getJwtSecret();
  const expiresIn = getJwtExpiresIn();

  const token = jwt.sign(payload, secret, {
    expiresIn: expiresIn as jwt.SignOptions["expiresIn"],
  });

  return {
    token,
    tokenType: "Bearer",
    expiresIn,
  };
};

export const verifyAccessToken = (token: string): UserTokenPayload => {
  if (!token || typeof token !== "string" || token.trim() === "") {
    throw new TokenError("Token autentikasi tidak ditemukan", "TOKEN_MISSING");
  }

  const secret = getJwtSecret();

  try {
    const decoded = jwt.verify(token, secret);
    return decoded as unknown as UserTokenPayload;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new TokenError("Token autentikasi telah kedaluwarsa (expired)", "TOKEN_EXPIRED");
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new TokenError("Token autentikasi tidak valid atau rusak", "TOKEN_INVALID");
    }
    throw new TokenError("Gagal memverifikasi token", "TOKEN_VERIFICATION_FAILED");
  }
};

export const tokenService = {
  generateAccessToken,
  verifyAccessToken,
};

export default tokenService;

