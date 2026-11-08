/**
 * IMPLEMENTASI KEAMANAN API BACKEND
 * Latihan Individu Pertemuan 11 — Della Kartika (240160221008)
 * Studi Kasus: Sistem Informasi Absensi Mahasiswa
 */

export interface SecurityHeaders {
  "X-Content-Type-Options": "nosniff";
  "X-Frame-Options": "SAMEORIGIN";
  "X-XSS-Protection": "0";
  "Strict-Transport-Security": string;
  "Content-Security-Policy": string;
}

export const DEFAULT_SECURITY_HEADERS: SecurityHeaders = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "SAMEORIGIN",
  "X-XSS-Protection": "0",
  "Strict-Transport-Security": "max-age=15552000; includeSubDomains",
  "Content-Security-Policy": "default-src 'self'",
};

// 1. Validasi CORS Selektif
export const ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "https://absensi.unsap.ac.id",
];

export const checkCorsOrigin = (origin?: string): { allowed: boolean; originHeader?: string } => {
  if (!origin) {
    return { allowed: true }; // Request non-browser (misal cURL, server-to-server)
  }
  if (ALLOWED_ORIGINS.includes(origin.trim())) {
    return { allowed: true, originHeader: origin.trim() };
  }
  return { allowed: false };
};

// 2. Strict Rate Limiter (In-Memory sliding window)
export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

export class SimpleRateLimiter {
  private hits: Map<string, { count: number; resetTime: number }> = new Map();
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = config;
  }

  public check(ip: string): { allowed: boolean; remaining: number; retryAfterSeconds?: number } {
    const now = Date.now();
    const record = this.hits.get(ip);

    if (!record || now > record.resetTime) {
      this.hits.set(ip, { count: 1, resetTime: now + this.config.windowMs });
      return { allowed: true, remaining: this.config.maxRequests - 1 };
    }

    if (record.count >= this.config.maxRequests) {
      const retryAfter = Math.ceil((record.resetTime - now) / 1000);
      return { allowed: false, remaining: 0, retryAfterSeconds: retryAfter };
    }

    record.count += 1;
    return { allowed: true, remaining: this.config.maxRequests - record.count };
  }

  public reset(): void {
    this.hits.clear();
  }
}

// Rate limiter ketat untuk pencatatan absensi (maksimal 3 request per 10 detik dalam simulasi latihan)
export const strictPostAbsensiLimiter = new SimpleRateLimiter({
  windowMs: 10000,
  maxRequests: 3,
});

// 3. Validasi & Sanitasi Input Absensi
export const VALID_STATUS_LIST = ["HADIR", "IZIN", "SAKIT", "ALPA"] as const;
export type AbsensiStatus = (typeof VALID_STATUS_LIST)[number];

export interface AbsensiInput {
  nim: string;
  namaMahasiswa: string;
  mataKuliah: string;
  status: AbsensiStatus;
  keterangan?: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  sanitizedData?: AbsensiInput;
}

export const validateAbsensiInput = (body: any): ValidationResult => {
  const errors: string[] = [];

  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return { valid: false, errors: ["Request body harus berupa JSON object yang valid"] };
  }

  const { nim, namaMahasiswa, mataKuliah, status, keterangan } = body;

  // Validasi NIM (8-20 digit angka)
  if (typeof nim !== "string" || nim.trim() === "") {
    errors.push("Field 'nim' wajib diisi dengan teks tidak kosong");
  } else if (!/^\d{8,20}$/.test(nim.trim())) {
    errors.push("Format 'nim' harus berupa 8-20 digit angka murni");
  }

  // Validasi Nama Mahasiswa (3-100 karakter)
  if (typeof namaMahasiswa !== "string" || namaMahasiswa.trim() === "") {
    errors.push("Field 'namaMahasiswa' wajib diisi dengan teks tidak kosong");
  } else if (namaMahasiswa.trim().length < 3) {
    errors.push("Panjang 'namaMahasiswa' terlalu pendek, minimal 3 karakter");
  } else if (namaMahasiswa.trim().length > 100) {
    errors.push("Panjang 'namaMahasiswa' melebihi batas maksimal 100 karakter");
  }

  // Validasi Mata Kuliah (min 3 karakter)
  if (typeof mataKuliah !== "string" || mataKuliah.trim() === "") {
    errors.push("Field 'mataKuliah' wajib diisi dengan teks tidak kosong");
  } else if (mataKuliah.trim().length < 3) {
    errors.push("Nama 'mataKuliah' minimal 3 karakter");
  }

  // Validasi Status Absensi (HADIR, IZIN, SAKIT, ALPA)
  if (!status || typeof status !== "string") {
    errors.push("Field 'status' wajib diisi (pilihan: HADIR, IZIN, SAKIT, ALPA)");
  } else if (!VALID_STATUS_LIST.includes(status.toUpperCase() as AbsensiStatus)) {
    errors.push(`Status absensi '${status}' tidak valid. Pilihan yang sah: ${VALID_STATUS_LIST.join(", ")}`);
  }

  // Validasi Keterangan opsional (max 255 karakter)
  if (keterangan !== undefined && typeof keterangan !== "string") {
    errors.push("Field 'keterangan' harus berupa string");
  } else if (typeof keterangan === "string" && keterangan.length > 255) {
    errors.push("Panjang 'keterangan' maksimal 255 karakter");
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    errors: [],
    sanitizedData: {
      nim: String(nim).trim(),
      namaMahasiswa: String(namaMahasiswa).trim(),
      mataKuliah: String(mataKuliah).trim(),
      status: status.toUpperCase() as AbsensiStatus,
      keterangan: keterangan ? String(keterangan).trim() : undefined,
    },
  };
};

// 4. Simulasi Query Terparameterisasi (Anti-SQLi)
export interface MockAbsensiRecord {
  id: number;
  nim: string;
  namaMahasiswa: string;
  mataKuliah: string;
  status: AbsensiStatus;
  keterangan?: string;
}

export const MOCK_ABSENSI_DATABASE: MockAbsensiRecord[] = [
  { id: 1, nim: "240160221008", namaMahasiswa: "Della Kartika", mataKuliah: "Pemrograman Backend", status: "HADIR", keterangan: "Hadir tepat waktu" },
  { id: 2, nim: "240160221002", namaMahasiswa: "Nadya Zahra Aulia", mataKuliah: "Pemrograman Backend", status: "HADIR", keterangan: "Hadir tepat waktu" },
];

/**
 * Mensimulasikan query terparameterisasi Prisma:
 * `prisma.absensi.findMany({ where: { namaMahasiswa: { contains: searchQuery } } })`
 * Input pencarian dianggap murni sebagai literal string, bukan instruksi SQL.
 */
export const searchAbsensiParameterized = (searchQuery: string): MockAbsensiRecord[] => {
  // Dalam query terparameterisasi, SQLi payload seperti "' OR '1'='1" diperlakukan sebagai string harfiah
  return MOCK_ABSENSI_DATABASE.filter((rec) =>
    rec.namaMahasiswa.toLowerCase().includes(searchQuery.toLowerCase()) ||
    rec.mataKuliah.toLowerCase().includes(searchQuery.toLowerCase())
  );
};

// 5. Handler Endpoint Demonstrasi
export interface RequestContext {
  ip: string;
  headers: Record<string, string | undefined>;
  body?: any;
}

export interface ResponseContext {
  status: number;
  headers: Record<string, string>;
  body: any;
}

export const postAbsensiSecureEndpoint = (req: RequestContext): ResponseContext => {
  const responseHeaders: Record<string, string> = { ...DEFAULT_SECURITY_HEADERS };

  // Cek CORS
  const origin = req.headers["origin"] || req.headers["Origin"];
  const corsResult = checkCorsOrigin(origin);
  if (corsResult.originHeader) {
    responseHeaders["Access-Control-Allow-Origin"] = corsResult.originHeader;
  }

  // Cek Rate Limiting Ketat
  const rateLimitResult = strictPostAbsensiLimiter.check(req.ip);
  if (!rateLimitResult.allowed) {
    responseHeaders["Retry-After"] = String(rateLimitResult.retryAfterSeconds ?? 10);
    return {
      status: 429,
      headers: responseHeaders,
      body: {
        success: false,
        message: "Terlalu banyak permintaan pencatatan absensi. Silakan coba sesaat lagi.",
        retryAfterSeconds: rateLimitResult.retryAfterSeconds,
      },
    };
  }

  // Validasi Input
  const valResult = validateAbsensiInput(req.body);
  if (!valResult.valid) {
    return {
      status: 400,
      headers: responseHeaders,
      body: {
        success: false,
        message: "Validasi data absensi gagal",
        errors: valResult.errors,
      },
    };
  }

  return {
    status: 201,
    headers: responseHeaders,
    body: {
      success: true,
      message: "Data absensi mahasiswa berhasil dicatat secara aman",
      data: valResult.sanitizedData,
    },
  };
};

