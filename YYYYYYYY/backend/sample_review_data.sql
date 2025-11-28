-- Data Permintaan Review Contoh untuk Pengujian

USE vinixport;

-- Hapus data review yang sudah ada (opsional, uncomment jika perlu)
-- DELETE FROM review_requests;

-- Tambahkan beberapa data permintaan review dari mahasiswa
INSERT INTO review_requests (mentee_id, mentee_name, mentee_email, portfolio_url, notes, payment_amount, payment_bank, payment_account_name, payment_proof_image, payment_status, status, mentor_feedback, created_at) VALUES
(1, 'John Doe', 'john.doe@example.com', 'http://localhost:5173/#/portfolio', 'Mohon feedback khususnya untuk section dashboard UI, ingin tahu bagaimana tampilan dan fungsionalitas bisa ditingkatkan.', 150000, 'BCA', 'John Doe', 'https://example.com/payment_proof1.jpg', 'approved', 'completed', 'Portfolio bagus, dashboard UI menarik dan fungsional. Rekomendasi: tambahkan loading states dan error handling untuk pengalaman pengguna yang lebih baik.', '2024-10-01 10:30:00'),
(2, 'Sarah Wilson', 'sarah.w@example.com', 'http://localhost:5173/#/portfolio', 'Ingin feedback tentang desain UX untuk aplikasi travel. Apakah flow-nya sudah optimal?', 150000, 'Mandiri', 'Sarah Wilson', 'https://example.com/payment_proof2.jpg', 'approved', 'in_progress', NULL, '2024-10-05 14:20:00'),
(3, 'Michael Chen', 'michael.c@example.com', 'http://localhost:5173/#/portfolio', 'Mohon review untuk sisi backend API inventory management. Apakah arsitekturnya scalable?', 200000, 'BNI', 'Michael Chen', 'https://example.com/payment_proof3.jpg', 'approved', 'completed', 'Backend architecture solid, penggunaan REST API bagus. Saran: tambahkan caching layer untuk performa lebih baik di traffic tinggi.', '2024-10-10 09:15:00'),
(4, 'Emma Rodriguez', 'emma.r@example.com', 'http://localhost:5173/#/portfolio', 'Ingin feedback tentang implementasi machine learning model dan deploymentnya.', 200000, 'BRI', 'Emma Rodriguez', 'https://example.com/payment_proof4.jpg', 'waiting_verification', 'pending', NULL, '2024-10-15 16:45:00'),
(6, 'Ade Saputra', 'ade.saputra@example.com', 'http://localhost:5173/#/portfolio', 'Mohon review untuk portfolio pertama saya, ingin tahu bagaimana cara meningkatkannya.', 150000, 'BCA', 'Ade Saputra', 'https://example.com/payment_proof5.jpg', 'approved', 'pending', NULL, '2024-10-20 11:30:00');

-- Verifikasi data telah masuk
SELECT 
    id,
    mentee_name,
    mentee_email,
    notes,
    payment_amount,
    payment_status,
    status,
    mentor_feedback,
    created_at
FROM review_requests
ORDER BY created_at DESC;

-- Tampilkan jumlah permintaan berdasarkan status
SELECT 
    status,
    COUNT(*) as jumlah_permintaan
FROM review_requests
GROUP BY status;