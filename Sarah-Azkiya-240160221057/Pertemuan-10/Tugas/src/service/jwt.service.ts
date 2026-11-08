import "dotenv/config";
import jwt, { type SignOptions } from "jsonwebtoken";

export interface UserJwtPayload {
  sub: number;
  id?: number;
  nama: string;
  nim: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.trim().length < 32) {
    throw new Error(
      "Konfigurasi JWT tidak valid: JWT_SECRET wajib didefinisikan pada environment dan minimal memiliki panjang 32 karakter."
    );
  }
  return secret.trim();
}

export function getJwtExpiresIn(): string {
  return process.env.JWT_EXPIRES_IN ?? "15m";
}

export function generateToken(payload: {
  sub: number;
  nama: string;
  nim: string;
  email: string;
  role: string;
}): string {
  const secret = getJwtSecret();
  const expiresIn = getJwtExpiresIn();

  const tokenPayload: UserJwtPayload = {
    sub: payload.sub,
    id: payload.sub,
    nama: payload.nama,
    nim: payload.nim,
    email: payload.email,
    role: payload.role,
  };

  const options: SignOptions = {
    expiresIn: expiresIn as unknown as NonNullable<SignOptions["expiresIn"]>,
    algorithm: "HS256",
  };

  return jwt.sign(tokenPayload, secret, options);
}

export function verifyToken(token: string): UserJwtPayload {
  const secret = getJwtSecret();
  const decoded = jwt.verify(token, secret, {
    algorithms: ["HS256"],
  });

  return decoded as unknown as UserJwtPayload;
}

export const jwtService = {
  getJwtSecret,
  getJwtExpiresIn,
  generateToken,
  verifyToken,
};

export default jwtService;

