/**
 * IMPLEMENTASI KEAMANAN API BACKEND
 * Latihan Individu Pertemuan 11 — Sandika Yusuf (240160221044)
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
  "https://akademik.unsap.ac.id",
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

// Rate limiter ketat untuk pembuatan data mahasiswa (maksimal 3 request per 10 detik dalam pengujian)
export const strictPostMahasiswaLimiter = new SimpleRateLimiter({
  windowMs: 10000,
  maxRequests: 3,
});

// 3. Validasi & Sanitasi Input Mahasiswa
export interface MahasiswaInput {
  nim: string;
  nama: string;
  prodi: string;
  angkatan: number;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  sanitizedData?: MahasiswaInput;
}

export const validateMahasiswaInput = (body: any): ValidationResult => {
  const errors: string[] = [];

  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return { valid: false, errors: ["Request body harus berupa JSON object yang valid"] };
  }

  // Validasi NIM (8-20 digit angka)
  const { nim, nama, prodi, angkatan } = body;
  if (typeof nim !== "string" || nim.trim() === "") {
    errors.push("Field 'nim' wajib diisi dengan teks tidak kosong");
  } else if (!/^\d{8,20}$/.test(nim.trim())) {
    errors.push("Format 'nim' harus berupa 8-20 digit angka murni");
  }

  // Validasi Nama (panjang minimal 3 karakter, maksimal 100 karakter)
  if (typeof nama !== "string" || nama.trim() === "") {
    errors.push("Field 'nama' wajib diisi dengan teks tidak kosong");
  } else if (nama.trim().length < 3) {
    errors.push("Panjang 'nama' terlalu pendek, minimal 3 karakter");
  } else if (nama.trim().length > 100) {
    errors.push("Panjang 'nama' melebihi batas maksimal 100 karakter");
  }

  // Validasi Prodi
  if (typeof prodi !== "string" || prodi.trim() === "") {
    errors.push("Field 'prodi' wajib diisi");
  }

  // Validasi Angkatan
  const angkatanNum = Number(angkatan);
  if (!Number.isSafeInteger(angkatanNum) || angkatanNum < 2000 || angkatanNum > 2100) {
    errors.push("Field 'angkatan' harus berupa tahun integer valid antara 2000 dan 2100");
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    errors: [],
    sanitizedData: {
      nim: String(nim).trim(),
      nama: String(nama).trim(),
      prodi: String(prodi).trim(),
      angkatan: angkatanNum,
    },
  };
};

// 4. Simulasi Query Terparameterisasi (Anti-SQLi)
export interface MockMahasiswaRecord {
  id: number;
  nim: string;
  nama: string;
  prodi: string;
  angkatan: number;
}

export const MOCK_DATABASE: MockMahasiswaRecord[] = [
  { id: 1, nim: "240160221044", nama: "Sandika Yusuf Permana", prodi: "Sistem Informasi", angkatan: 2024 },
  { id: 2, nim: "240160221006", nama: "Dadika Yudiana", prodi: "Sistem Informasi", angkatan: 2024 },
];

/**
 * Mensimulasikan query terparameterisasi Prisma:
 * `prisma.mahasiswa.findMany({ where: { nama: { contains: search } } })`
 * Input pencarian dianggap murni sebagai literal string, bukan instruksi SQL.
 */
export const searchMahasiswaParameterized = (searchQuery: string): MockMahasiswaRecord[] => {
  // Dalam query terparameterisasi, SQLi payload seperti "' OR '1'='1" diperlakukan sebagai string harfiah
  return MOCK_DATABASE.filter((mhs) => mhs.nama.toLowerCase().includes(searchQuery.toLowerCase()));
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

export const postMahasiswaSecureEndpoint = (req: RequestContext): ResponseContext => {
  const responseHeaders: Record<string, string> = { ...DEFAULT_SECURITY_HEADERS };

  // Cek CORS
  const origin = req.headers["origin"] || req.headers["Origin"];
  const corsResult = checkCorsOrigin(origin);
  if (corsResult.originHeader) {
    responseHeaders["Access-Control-Allow-Origin"] = corsResult.originHeader;
  }

  // Cek Rate Limiting Ketat
  const rateLimitResult = strictPostMahasiswaLimiter.check(req.ip);
  if (!rateLimitResult.allowed) {
    responseHeaders["Retry-After"] = String(rateLimitResult.retryAfterSeconds ?? 10);
    return {
      status: 429,
      headers: responseHeaders,
      body: {
        success: false,
        message: "Terlalu banyak permintaan pembuatan mahasiswa. Silakan coba sesaat lagi.",
        retryAfterSeconds: rateLimitResult.retryAfterSeconds,
      },
    };
  }

  // Validasi Input
  const valResult = validateMahasiswaInput(req.body);
  if (!valResult.valid) {
    return {
      status: 400,
      headers: responseHeaders,
      body: {
        success: false,
        message: "Validasi data mahasiswa gagal",
        errors: valResult.errors,
      },
    };
  }

  return {
    status: 201,
    headers: responseHeaders,
    body: {
      success: true,
      message: "Data mahasiswa berhasil ditambahkan secara aman",
      data: valResult.sanitizedData,
    },
  };
};

