-- Schema Database untuk Aplikasi VinixPort
--
-- Database ini dirancang untuk menyimpan:
-- - Data pengguna (mahasiswa dan mentor)
-- - Proyek portofolio
-- - Sertifikat
-- - Keterampilan
-- - Permintaan review dari mahasiswa ke mentor
-- - Pertanyaan assessment



-- Tabel Users
CREATE DATABASE IF NOT EXISTS vinixport;
USE vinixport;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255), -- Tidak digunakan di mock, tapi disediakan untuk backend
    avatar_url TEXT,
    title VARCHAR(255),
    bio TEXT,
    role ENUM('user', 'mentor') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabel Projects
CREATE TABLE projects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    image_url TEXT,
    link VARCHAR(255),
    tags LONGTEXT, -- Menyimpan array tag dalam format JSON
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Tabel Certificates
CREATE TABLE certificates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    issuer VARCHAR(255),
    date DATE,
    image_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Tabel Skills
CREATE TABLE skills (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    level INT CHECK (level >= 0 AND level <= 100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Tabel Review Requests
CREATE TABLE review_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    mentee_id INT NOT NULL,
    mentee_name VARCHAR(255) NOT NULL,
    mentee_email VARCHAR(255) NOT NULL,
    portfolio_url TEXT NOT NULL,
    notes TEXT,
    payment_amount DECIMAL(10,2),
    payment_bank VARCHAR(255),
    payment_account_name VARCHAR(255),
    payment_proof_image TEXT,
    payment_status ENUM('waiting_verification', 'approved', 'rejected') DEFAULT 'waiting_verification',
    status ENUM('pending', 'in_progress', 'completed') DEFAULT 'pending',
    mentor_feedback TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (mentee_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Tabel Assessment Questions
CREATE TABLE assessment_questions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category ENUM('Soft Skills', 'Digital Skills', 'Workplace Readiness') NOT NULL,
    question TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Data awal untuk assessment questions
INSERT INTO assessment_questions (category, question) VALUES
('Soft Skills', 'Saya dapat mengomunikasikan ide saya dengan jelas kepada orang lain.'),
('Soft Skills', 'Saya mampu bekerja sama dengan anggota tim yang baru saya kenal.'),
('Soft Skills', 'Saya dapat menyelesaikan konflik dalam tim dengan cara yang baik.'),
('Soft Skills', 'Saya mampu mengatur waktu ketika memiliki banyak tugas sekalikus.'),
('Soft Skills', 'Saya dapat mengambil keputusan dengan cepat saat situasi mendesak.'),
('Digital Skills', 'Saya terbiasa menggunakan tools digital seperti Google Docs, Sheets, atau Drive.'),
('Digital Skills', 'Saya mampu mengikuti arahan tugas atau instruksi mentor yang berbentuk digital (PDF, Notion, GDrive).'),
('Digital Skills', 'Saya dapat mengorganisir file dan dokumen digital dengan rapi.'),
('Digital Skills', 'Saya mampu mencari informasi atau referensi di internet secara efektif.'),
('Digital Skills', 'Saya dapat menggunakan platform komunikasi digital (Zoom, WhatsApp Group, Slack) dengan lancar.'),
('Workplace Readiness', 'Saya biasanya menyelesaikan tugas sebelum atau tepat waktu.'),
('Workplace Readiness', 'Saya bisa menerima feedback (kritik/saran) dengan baik dan memperbaikinya.'),
('Workplace Readiness', 'Saya cepat beradaptasi ketika diberi tugas baru yang belum pernah saya lakukan.'),
('Workplace Readiness', 'Saya dapat bekerja secara mandiri tanpa harus selalu diarahkan.'),
('Workplace Readiness', 'Saya memiliki motivasi tinggi untuk mengembangkan skill baru.');

/*
Struktur Relasi Tabel:

users (1) -- (n) projects
users (1) -- (n) certificates  
users (1) -- (n) skills
users (1) -- (n) review_requests

Keterangan:
- users.id adalah foreign key di tabel projects, certificates, skills, dan review_requests
- Cascade delete diterapkan, sehingga jika user dihapus, semua data terkait juga dihapus
- Tabel assessment_questions tidak memiliki relasi karena tidak berubah-ubah
*/