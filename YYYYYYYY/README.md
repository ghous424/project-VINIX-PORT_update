# Dokumentasi Sistem VinixPort

## Gambaran Umum
VinixPort adalah platform portofolio profesional yang memungkinkan pengguna untuk:
- Membuat dan menampilkan portofolio digital
- Mendapatkan review dari mentor profesional
- Mengelola proyek, sertifikat, dan keterampilan

## Arsitektur Sistem
Sistem ini terdiri dari dua komponen utama:
1. **Frontend**: Aplikasi React/TypeScript dengan Vite
2. **Backend**: Server Node.js/Express dengan MySQL

## Struktur Proyek
```
vinixport/
├── backend/
│   ├── schema.sql          # Skema database
│   ├── sample_data.sql     # Data contoh
│   └── server.js           # Server backend
├── frontend/ (folder utama)
│   ├── pages/              # Halaman aplikasi
│   ├── components/         # Komponen UI
│   ├── services/           # Layanan API
│   └── contexts/           # Context untuk state management
├── .env                    # Konfigurasi environment
├── BACKEND_SETUP.md        # Panduan setup backend
├── IMPORT_DATA.md          # Panduan import data
├── BACKEND_NOTES.md        # Catatan implementasi backend
└── README.md               # Dokumentasi utama
```

## Setup dan Konfigurasi

### 1. Frontend
```bash
npm install
npm run dev
```

### 2. Backend
```bash
cd backend
npm install
npm start
```

### 3. Database
Pastikan XAMPP (MySQL) berjalan, lalu:
1. Import `backend/schema.sql`
2. Import `backend/sample_data.sql` (opsional)

## Fitur Utama

### Untuk Mahasiswa:
- Membuat dan mengelola portofolio
- Menambahkan proyek, sertifikat, dan keterampilan
- Mengajukan permintaan review portofolio ke mentor
- Mendapatkan feedback dari mentor profesional

### Untuk Mentor:
- Melihat daftar permintaan review dari mahasiswa
- Memberikan feedback pada portofolio mahasiswa
- Melihat status pembayaran dan menyetujui pembayaran

## Endpoint API
- `POST /api/login` - Login pengguna
- `POST /api/register` - Registrasi pengguna
- `POST /api/mentors/login` - Login mentor
- `GET /api/portfolio/:userId` - Ambil data portofolio
- `POST/PUT/DELETE /api/projects` - Manajemen proyek
- `POST/PUT/DELETE /api/certificates` - Manajemen sertifikat
- `POST/GET/PUT /api/review-requests` - Manajemen permintaan review

## Database
Database menggunakan MySQL dengan skema sebagai berikut:
- `users`: Data pengguna (mahasiswa dan mentor)
- `projects`: Proyek portofolio
- `certificates`: Sertifikat pengguna
- `skills`: Keterampilan pengguna
- `review_requests`: Permintaan review dari mahasiswa ke mentor
- `assessment_questions`: Pertanyaan penilaian

## Kontribusi
Untuk berkontribusi pada proyek ini:
1. Fork repositori
2. Buat branch fitur baru
3. Commit perubahan Anda
4. Push ke branch
5. Buat pull request

## Lisensi
Proyek ini dilisensikan di bawah MIT License.