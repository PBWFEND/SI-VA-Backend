import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * IMPLEMENTASI JSON WEB TOKEN (JWT) DAN AUTHORIZATION
 * Latihan Individu Pertemuan 10 — Devaldy Dzikri (240160221050)
 */

export type UserRole = "admin" | "dosen" | "mahasiswa" | "staf";

export interface JwtHeader {
  alg: "HS256";
  typ: "JWT";
}

export interface JwtPayload {
  sub: number;
  nim: string;
  nama: string;
  email: string;
  role: UserRole;
  iat: number;
  exp: number;
}

export interface UserAccount {
  id: number;
  nim: string;
  nama: string;
  email: string;
  role: UserRole;
  passwordHash: string;
}

// Data pengguna simulasi untuk pengujian latihan.
export const MOCK_USERS: UserAccount[] = [
  {
    id: 1,
    nim: "240160221050",
    nama: "Devaldy Dzikri",
    email: "devaldy.mhs@akademik.id",
    role: "mahasiswa",
    passwordHash: "pass#mhs123",
  },
  {
    id: 2,
    nim: "198501012010121001",
    nama: "Dr. Usuf, M.Kom",
    email: "dosen@akademik.id",
    role: "dosen",
    passwordHash: "pass#dosen123",
  },
  {
    id: 3,
    nim: "199003152015031002",
    nama: "Otep",
    email: "staf.akademik@akademik.id",
    role: "staf",
    passwordHash: "pass#staf123",
  },
  {
    id: 4,
    nim: "000000000001",
    nama: "Zaky",
    email: "admin@akademik.id",
    role: "admin",
    passwordHash: "pass#admin123",
  },
];

// Secret bawaan hanya untuk simulasi latihan lokal.
// Pada penerapan nyata, isi JWT_SECRET melalui environment dan jangan commit secret.
const DEFAULT_SECRET = "devaldy_latihan_jwt_secret_local_only_2026";

export const base64UrlEncode = (value: string | Buffer): string => {
  const buffer = typeof value === "string" ? Buffer.from(value, "utf8") : value;
  return buffer.toString("base64url");
};

export const base64UrlDecode = (value: string): string => {
  return Buffer.from(value, "base64url").toString("utf8");
};

// 1. Membuat access token JWT.
export const signJwt = (
  payload: Omit<JwtPayload, "iat" | "exp">,
  secret: string = process.env.JWT_SECRET || DEFAULT_SECRET,
  expiresInSeconds = 900,
): string => {
  const header: JwtHeader = { alg: "HS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);

  const fullPayload: JwtPayload = {
    ...payload,
    iat: now,
    exp: now + expiresInSeconds,
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(fullPayload));
  const dataToSign = `${encodedHeader}.${encodedPayload}`;

  const signature = createHmac("sha256", secret).update(dataToSign).digest();
  return `${dataToSign}.${base64UrlEncode(signature)}`;
};

export interface VerifyResult {
  valid: boolean;
  payload?: JwtPayload;
  error?:
    | "TOKEN_MISSING"
    | "INVALID_FORMAT"
    | "INVALID_SIGNATURE"
    | "TOKEN_EXPIRED";
  message: string;
}

// 2. Memeriksa format, signature, isi payload, dan masa berlaku token.
export const verifyJwt = (
  token: string,
  secret: string = process.env.JWT_SECRET || DEFAULT_SECRET,
): VerifyResult => {
  if (typeof token !== "string" || token.trim() === "") {
    return {
      valid: false,
      error: "TOKEN_MISSING",
      message: "Token autentikasi tidak ditemukan",
    };
  }

  const parts = token.trim().split(".");
  if (parts.length !== 3 || parts.some((part) => part.length === 0)) {
    return {
      valid: false,
      error: "INVALID_FORMAT",
      message: "Format token tidak valid (harus 3 bagian)",
    };
  }

  const [encodedHeader, encodedPayload, encodedSignature] = parts;
  const dataToSign = `${encodedHeader}.${encodedPayload}`;

  let header: JwtHeader;
  let payload: JwtPayload;

  try {
    header = JSON.parse(base64UrlDecode(encodedHeader)) as JwtHeader;
    payload = JSON.parse(base64UrlDecode(encodedPayload)) as JwtPayload;
  } catch {
    return {
      valid: false,
      error: "INVALID_FORMAT",
      message: "Header atau payload token bukan JSON yang valid",
    };
  }

  if (header.alg !== "HS256" || header.typ !== "JWT") {
    return {
      valid: false,
      error: "INVALID_FORMAT",
      message: "Algoritma atau tipe token tidak didukung",
    };
  }

  const expectedSignature = createHmac("sha256", secret)
    .update(dataToSign)
    .digest();
  const actualSignature = Buffer.from(encodedSignature, "base64url");

  if (
    expectedSignature.length !== actualSignature.length ||
    !timingSafeEqual(expectedSignature, actualSignature)
  ) {
    return {
      valid: false,
      error: "INVALID_SIGNATURE",
      message: "Tanda tangan token (signature) tidak valid",
    };
  }

  const validRoles: UserRole[] = ["admin", "dosen", "mahasiswa", "staf"];
  if (
    typeof payload.sub !== "number" ||
    typeof payload.nim !== "string" ||
    typeof payload.nama !== "string" ||
    typeof payload.email !== "string" ||
    !validRoles.includes(payload.role) ||
    typeof payload.exp !== "number" ||
    !Number.isFinite(payload.exp)
  ) {
    return {
      valid: false,
      error: "INVALID_FORMAT",
      message: "Klaim payload token tidak lengkap atau tidak valid",
    };
  }

  const now = Math.floor(Date.now() / 1000);
  if (now >= payload.exp) {
    return {
      valid: false,
      error: "TOKEN_EXPIRED",
      message: "Token telah kedaluwarsa (expired)",
    };
  }

  return {
    valid: true,
    payload,
    message: "Token valid dan terverifikasi",
  };
};

export interface HttpRequest {
  headers: Record<string, string | undefined>;
  user?: JwtPayload;
  body?: unknown;
}

export interface HttpResponse {
  status: number;
  body: Record<string, unknown>;
}

// 3. Middleware simulasi authentication.
export const authenticate = (req: HttpRequest): HttpResponse | null => {
  const authHeader =
    req.headers["authorization"] ?? req.headers["Authorization"];

  if (!authHeader) {
    return {
      status: 401,
      body: {
        success: false,
        message: "Header Authorization tidak ditemukan",
      },
    };
  }

  if (!authHeader.startsWith("Bearer ")) {
    return {
      status: 401,
      body: {
        success: false,
        message: "Format Authorization harus 'Bearer <token>'",
      },
    };
  }

  const token = authHeader.slice("Bearer ".length).trim();
  const verifyResult = verifyJwt(token);

  if (!verifyResult.valid || !verifyResult.payload) {
    return {
      status: 401,
      body: {
        success: false,
        message: verifyResult.message,
        error: verifyResult.error,
      },
    };
  }

  req.user = verifyResult.payload;
  return null;
};

// 4. Middleware simulasi authorization berdasarkan role.
export const authorize = (allowedRoles: UserRole[]) => {
  return (req: HttpRequest): HttpResponse | null => {
    if (!req.user) {
      return {
        status: 401,
        body: {
          success: false,
          message: "Pengguna belum terautentikasi",
        },
      };
    }

    if (!allowedRoles.includes(req.user.role)) {
      return {
        status: 403,
        body: {
          success: false,
          message: `Akses ditolak: role '${req.user.role}' tidak memiliki izin untuk rute ini`,
        },
      };
    }

    return null;
  };
};

// 5. Endpoint khusus yang hanya dapat diakses oleh role staf.
export const stafDashboardEndpoint = (req: HttpRequest): HttpResponse => {
  const authError = authenticate(req);
  if (authError) return authError;

  const roleError = authorize(["staf"])(req);
  if (roleError) return roleError;

  return {
    status: 200,
    body: {
      success: true,
      message: "Selamat datang di Panel Administrasi Staf Akademik",
      data: {
        petugas: req.user?.nama,
        email: req.user?.email,
        role: req.user?.role,
        menuOperasional: [
          "Verifikasi Kelengkapan Berkas Mahasiswa",
          "Input Jadwal Perkuliahan",
          "Rekapitulasi Presensi Semester",
        ],
      },
    },
  };
};
