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
    return "della_absensi_api_security_jwt_secret_2026_unsap";
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
    if (typeof decoded !== "object" || decoded === null) {
      throw new TokenError("Payload token tidak valid", "TOKEN_PAYLOAD_INVALID");
    }

    const payload = decoded as any;
    if (!payload.sub || !payload.nim || !payload.role) {
      throw new TokenError("Struktur klaim token tidak lengkap", "TOKEN_CLAIMS_INCOMPLETE");
    }

    return {
      sub: Number(payload.sub),
      nim: String(payload.nim),
      nama: String(payload.nama ?? ""),
      email: String(payload.email ?? ""),
      role: String(payload.role),
    };
  } catch (error: any) {
    if (error instanceof TokenError) throw error;
    if (error.name === "TokenExpiredError") {
      throw new TokenError("Token autentikasi telah kedaluwarsa. Silakan login kembali.", "TOKEN_EXPIRED");
    }
    if (error.name === "JsonWebTokenError") {
      throw new TokenError("Tanda tangan token tidak valid atau token rusak", "TOKEN_INVALID");
    }
    throw new TokenError("Gagal memverifikasi token", "TOKEN_VERIFICATION_FAILED");
  }
};

export const tokenService = {
  generateAccessToken,
  verifyAccessToken,
};

export default tokenService;

