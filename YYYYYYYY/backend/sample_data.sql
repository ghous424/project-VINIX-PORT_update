-- Data Contoh untuk Database VinixPort
-- Password: untuk semua user adalah "password123" (hashed dengan bcrypt)
-- Untuk testing, gunakan email dan password123

USE vinixport;

-- Tambahkan beberapa pengguna (termasuk mentor)
INSERT INTO users (name, email, password, title, bio, role, avatar_url) VALUES
('John Doe', 'john.doe@example.com', '$2a$10$enTzsilRZVAq9356HqxLkeQo89jdxI9Z1iFKYvmES0dLhav9882PW', 'Frontend Developer', 'Pengembang web dengan fokus pada antarmuka pengguna dan pengalaman interaktif.', 'user', 'https://randomuser.me/api/portraits/men/32.jpg'),
('Sarah Wilson', 'sarah.w@example.com', '$2a$10$enTzsilRZVAq9356HqxLkeQo89jdxI9Z1iFKYvmES0dLhav9882PW', 'UX Designer', 'Spesialis desain pengalaman pengguna dengan pendekatan berbasis data dan empati.', 'user', 'https://randomuser.me/api/portraits/women/44.jpg'),
('Michael Chen', 'michael.c@example.com', '$2a$10$enTzsilRZVAq9356HqxLkeQo89jdxI9Z1iFKYvmES0dLhav9882PW', 'Full Stack Developer', 'Pengembang dengan keahlian di backend dan frontend, suka memecahkan masalah kompleks.', 'user', 'https://randomuser.me/api/portraits/men/22.jpg'),
('Emma Rodriguez', 'emma.r@example.com', '$2a$10$enTzsilRZVAq9356HqxLkeQo89jdxI9Z1iFKYvmES0dLhav9882PW', 'Data Scientist', 'Ilmuwan data dengan fokus pada machine learning dan analisis prediktif.', 'user', 'https://randomuser.me/api/portraits/women/68.jpg'),
('Mentor Expert', 'mentor@vinixport.com', '$2a$10$enTzsilRZVAq9356HqxLkeQo89jdxI9Z1iFKYvmES0dLhav9882PW', 'Career Mentor', 'Senior industry mentor untuk VinixPort dengan lebih dari 10 tahun pengalaman.', 'mentor', 'https://i.pravatar.cc/150?u=vinix-mentor'),
('Ade Saputra', 'ade.saputra@example.com', '$2a$10$enTzsilRZVAq9356HqxLkeQo89jdxI9Z1iFKYvmES0dLhav9882PW', 'Junior Developer', 'Pemula dalam pengembangan perangkat lunak dengan semangat belajar tinggi.', 'user', 'https://randomuser.me/api/portraits/men/65.jpg');

-- Tambahkan proyek untuk beberapa pengguna
INSERT INTO projects (user_id, title, description, image_url, link, tags) VALUES
(1, 'E-commerce Dashboard', 'Dashboard interaktif untuk manajemen e-commerce dengan visualisasi data real-time.', 'https://picsum.photos/seed/project1/800/400', 'https://example.com/project1', '["React", "D3.js", "Tailwind"]'),
(1, 'Mobile Banking App', 'Aplikasi perbankan mobile dengan fokus pada keamanan dan kemudahan penggunaan.', 'https://picsum.photos/seed/project2/800/400', 'https://example.com/project2', '["React Native", "Node.js", "MongoDB"]'),
(2, 'Travel Booking Platform', 'Platform pemesanan perjalanan dengan sistem rekomendasi tempat wisata.', 'https://picsum.photos/seed/project3/800/400', 'https://example.com/project3', '["Vue.js", "Express", "PostgreSQL"]'),
(2, 'Fitness Tracker UI', 'Desain antarmuka untuk aplikasi pelacak kebugaran dengan sistem tantangan mingguan.', 'https://picsum.photos/seed/project4/800/400', 'https://example.com/project4', '["Figma", "UI/UX", "Prototyping"]'),
(3, 'Inventory Management', 'Sistem manajemen inventaris berbasis web untuk bisnis ritel.', 'https://picsum.photos/seed/project5/800/400', 'https://example.com/project5', '["Angular", "Spring Boot", "MySQL"]'),
(4, 'Predictive Analytics Tool', 'Alat analitik prediktif untuk bisnis kecil menggunakan pembelajaran mesin.', 'https://picsum.photos/seed/project6/800/400', 'https://example.com/project6', '["Python", "TensorFlow", "Flask"]');

-- Tambahkan sertifikat untuk beberapa pengguna
INSERT INTO certificates (user_id, title, issuer, date, image_url) VALUES
(1, 'React Advanced Certification', 'Meta', '2023-05-15', 'https://picsum.photos/seed/cert1/400/300'),
(1, 'UI/UX Design Professional', 'Google', '2023-02-20', 'https://picsum.photos/seed/cert2/400/300'),
(2, 'Figma Design Expert', 'Figma', '2023-07-10', 'https://picsum.photos/seed/cert3/400/300'),
(3, 'Node.js Backend Development', 'Udemy', '2023-09-05', 'https://picsum.photos/seed/cert4/400/300'),
(4, 'Machine Learning Specialization', 'Coursera', '2023-11-22', 'https://picsum.photos/seed/cert5/400/300'),
(4, 'Python for Data Science', 'IBM', '2023-04-18', 'https://picsum.photos/seed/cert6/400/300');

-- Tambahkan beberapa keterampilan untuk pengguna
INSERT INTO skills (user_id, name, level) VALUES
(1, 'React', 90),
(1, 'TypeScript', 85),
(1, 'CSS/SCSS', 95),
(1, 'UI/UX Design', 75),
(2, 'UI/UX Design', 92),
(2, 'Figma', 98),
(2, 'Prototyping', 88),
(2, 'User Research', 85),
(3, 'JavaScript', 90),
(3, 'Node.js', 88),
(3, 'Express', 85),
(3, 'MongoDB', 80),
(4, 'Python', 95),
(4, 'Machine Learning', 90),
(4, 'Data Analysis', 92),
(4, 'TensorFlow', 87);

-- Tambahkan beberapa permintaan review dari mahasiswa ke mentor
INSERT INTO review_requests (mentee_id, mentee_name, mentee_email, portfolio_url, notes, payment_amount, payment_bank, payment_account_name, payment_proof_image, payment_status, status, mentor_feedback) VALUES
(1, 'John Doe', 'john.doe@example.com', 'http://localhost:5173/#/portfolio', 'Mohon feedback khususnya untuk section dashboard UI, ingin tahu bagaimana tampilan dan fungsionalitas bisa ditingkatkan.', 150000, 'BCA', 'John Doe', 'https://example.com/payment_proof1.jpg', 'approved', 'completed', 'Portfolio bagus, dashboard UI menarik dan fungsional. Rekomendasi: tambahkan loading states dan error handling untuk pengalaman pengguna yang lebih baik.'),
(2, 'Sarah Wilson', 'sarah.w@example.com', 'http://localhost:5173/#/portfolio', 'Ingin feedback tentang desain UX untuk aplikasi travel. Apakah flow-nya sudah optimal?', 150000, 'Mandiri', 'Sarah Wilson', 'https://example.com/payment_proof2.jpg', 'approved', 'in_progress', NULL),
(3, 'Michael Chen', 'michael.c@example.com', 'http://localhost:5173/#/portfolio', 'Mohon review untuk sisi backend API inventory management. Apakah arsitekturnya scalable?', 200000, 'BNI', 'Michael Chen', 'https://example.com/payment_proof3.jpg', 'approved', 'completed', 'Backend architecture solid, penggunaan REST API bagus. Saran: tambahkan caching layer untuk performa lebih baik di traffic tinggi.'),
(4, 'Emma Rodriguez', 'emma.r@example.com', 'http://localhost:5173/#/portfolio', 'Ingin feedback tentang implementasi machine learning model dan deploymentnya.', 200000, 'BRI', 'Emma Rodriguez', 'https://example.com/payment_proof4.jpg', 'waiting_verification', 'pending', NULL);

-- Tambahkan beberapa pertanyaan assessment tambahan jika diperlukan
INSERT INTO assessment_questions (category, question) VALUES
('Soft Skills', 'Seberapa baik Anda dalam memimpin tim dalam situasi yang menantang?'),
('Digital Skills', 'Apakah Anda familiar dengan teknologi cloud seperti AWS atau GCP?'),
('Workplace Readiness', 'Seberapa adaptif Anda terhadap perubahan teknologi dan kebijakan perusahaan?');

-- Tambahkan data untuk pengguna baru
-- (Sudah ditambahkan di bagian insert users di atas)

INSERT INTO projects (user_id, title, description, image_url, link, tags) VALUES
(6, 'Personal Portfolio Website', 'Website portofolio pribadi dengan animasi modern dan responsif.', 'https://picsum.photos/seed/project7/800/400', 'https://example.com/project7', '["HTML", "CSS", "JavaScript"]');

INSERT INTO certificates (user_id, title, issuer, date, image_url) VALUES
(6, 'JavaScript Basics', 'W3Schools', '2024-03-10', 'https://picsum.photos/seed/cert7/400/300');

INSERT INTO skills (user_id, name, level) VALUES
(6, 'JavaScript', 60),
(6, 'HTML', 70),
(6, 'CSS', 65);

-- Tambahkan satu permintaan review dari pengguna baru
INSERT INTO review_requests (mentee_id, mentee_name, mentee_email, portfolio_url, notes, payment_amount, payment_bank, payment_account_name, payment_proof_image, payment_status, status, mentor_feedback) VALUES
(6, 'Ade Saputra', 'ade.saputra@example.com', 'http://localhost:5173/#/portfolio', 'Mohon review untuk portfolio pertama saya, ingin tahu bagaimana cara meningkatkannya.', 150000, 'BCA', 'Ade Saputra', 'https://example.com/payment_proof5.jpg', 'approved', 'pending', NULL);