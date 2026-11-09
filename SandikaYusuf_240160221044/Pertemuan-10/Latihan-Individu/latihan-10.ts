import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * IMPLEMENTASI STANDAR JSON WEB TOKEN (RFC 7519) & AUTHORIZATION
 * Latihan Individu Pertemuan 10 — Sandika Yusuf Permana (240160221044)
 */

export interface JwtHeader {
  alg: "HS256";
  typ: "JWT";
}

export interface JwtPayload {
  sub: number;
  nim: string;
  nama: string;
  email: string;
  role: "admin" | "dosen" | "mahasiswa" | "staf";
  iat: number;
  exp: number;
}

export interface UserAccount {
  id: number;
  nim: string;
  nama: string;
  email: string;
  role: "admin" | "dosen" | "mahasiswa" | "staf";
  passwordHash: string; // Simulasi penyimpanan hash
}

// Simulasi basis data pengguna akademik dengan role staf
export const MOCK_USERS: UserAccount[] = [
  {
    id: 1,
    nim: "240160221044",
    nama: "Sandika Yusuf Permana",
    email: "yusuf.mhs@akademik.id",
    role: "mahasiswa",
    passwordHash: "pass#mhs123",
  },
  {
    id: 2,
    nim: "198501012010121001",
    nama: "Dr. Dosen Akademik, M.Kom",
    email: "dosen@akademik.id",
    role: "dosen",
    passwordHash: "pass#dosen123",
  },
  {
    id: 3,
    nim: "199003152015031002",
    nama: "Ahmad Staff Akademik",
    email: "staf.akademik@akademik.id",
    role: "staf",
    passwordHash: "pass#staf123",
  },
  {
    id: 4,
    nim: "000000000001",
    nama: "Administrator Pusat",
    email: "admin@akademik.id",
    role: "admin",
    passwordHash: "pass#admin123",
  },
];

const DEFAULT_SECRET = "yusuf_academic_super_secret_jwt_key_2026";

// Utilitas Base64Url Encoding & Decoding
export const base64UrlEncode = (str: string | Buffer): string => {
  const buf = typeof str === "string" ? Buffer.from(str, "utf8") : str;
  return buf.toString("base64url");
};

export const base64UrlDecode = (str: string): string => {
  return Buffer.from(str, "base64url").toString("utf8");
};

// 1. Fungsi Pembuatan Access Token JWT
export const signJwt = (
  payload: Omit<JwtPayload, "iat" | "exp">,
  secret: string = process.env.JWT_SECRET || DEFAULT_SECRET,
  expiresInSeconds: number = 900 // Default 15 menit
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
  const encodedSignature = base64UrlEncode(signature);

  return `${dataToSign}.${encodedSignature}`;
};

// 2. Fungsi Verifikasi Access Token JWT
export interface VerifyResult {
  valid: boolean;
  payload?: JwtPayload;
  error?: "TOKEN_MISSING" | "INVALID_FORMAT" | "INVALID_SIGNATURE" | "TOKEN_EXPIRED";
  message: string;
}

export const verifyJwt = (
  token: string,
  secret: string = process.env.JWT_SECRET || DEFAULT_SECRET
): VerifyResult => {
  if (!token || typeof token !== "string" || token.trim() === "") {
    return { valid: false, error: "TOKEN_MISSING", message: "Token autentikasi tidak ditemukan" };
  }

  const parts = token.trim().split(".");
  if (parts.length !== 3) {
    return { valid: false, error: "INVALID_FORMAT", message: "Format token tidak valid (harus 3 bagian)" };
  }

  const [encodedHeader, encodedPayload, encodedSignature] = parts;
  const dataToSign = `${encodedHeader}.${encodedPayload}`;

  const expectedSignature = createHmac("sha256", secret).update(dataToSign).digest();
  const actualSignature = Buffer.from(encodedSignature, "base64url");

  if (expectedSignature.length !== actualSignature.length || !timingSafeEqual(expectedSignature, actualSignature)) {
    return { valid: false, error: "INVALID_SIGNATURE", message: "Tanda tangan token (signature) tidak valid" };
  }

  try {
    const payloadStr = base64UrlDecode(encodedPayload);
    const payload: JwtPayload = JSON.parse(payloadStr);

    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && now > payload.exp) {
      return { valid: false, error: "TOKEN_EXPIRED", message: "Token telah kedaluwarsa (expired)" };
    }

    return { valid: true, payload, message: "Token valid dan terverifikasi" };
  } catch {
    return { valid: false, error: "INVALID_FORMAT", message: "Payload token rusak atau bukan JSON valid" };
  }
};

// 3. Simulasi Handler Endpoint
export interface HttpRequest {
  headers: Record<string, string | undefined>;
  user?: JwtPayload;
  body?: any;
}

export interface HttpResponse {
  status: number;
  body: any;
}

// Middleware Autentikasi
export const authenticate = (req: HttpRequest): HttpResponse | null => {
  const authHeader = req.headers["authorization"] || req.headers["Authorization"];
  if (!authHeader) {
    return {
      status: 401,
      body: { success: false, message: "Header Authorization tidak ditemukan" },
    };
  }

  if (!authHeader.startsWith("Bearer ")) {
    return {
      status: 401,
      body: { success: false, message: "Format Authorization harus 'Bearer <token>'" },
    };
  }

  const token = authHeader.substring(7);
  const verifyResult = verifyJwt(token);

  if (!verifyResult.valid || !verifyResult.payload) {
    return {
      status: 401,
      body: { success: false, message: verifyResult.message, error: verifyResult.error },
    };
  }

  req.user = verifyResult.payload;
  return null; // Melanjutkan eksekusi
};

// Middleware Otorisasi Berdasarkan Role
export const authorize = (allowedRoles: string[]) => {
  return (req: HttpRequest): HttpResponse | null => {
    if (!req.user) {
      return {
        status: 401,
        body: { success: false, message: "Pengguna belum terautentikasi" },
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

    return null; // Lolos otorisasi
  };
};

// Endpoint Khusus Role Staf
export const stafDashboardEndpoint = (req: HttpRequest): HttpResponse => {
  const authErr = authenticate(req);
  if (authErr) return authErr;

  const roleErr = authorize(["staf"])(req);
  if (roleErr) return roleErr;

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

