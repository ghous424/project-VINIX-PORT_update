// Skrip uji koneksi database
const mysql = require('mysql2');

// Konfigurasi dari .env
require('dotenv').config();

const db = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    database: process.env.DB_NAME || 'vinixport_db'
});

console.log('Mencoba menghubungkan ke database...');
console.log('Konfigurasi:');
console.log('- Host:', process.env.DB_HOST || 'localhost');
console.log('- User:', process.env.DB_USER || 'root');
console.log('- Database:', process.env.DB_NAME || 'vinixport_db');

db.connect((err) => {
    if (err) {
        console.error('Error connecting to database:', err);
        console.log('\nKemungkinan penyebab:');
        console.log('1. XAMPP tidak berjalan (MySQL service belum start)');
        console.log('2. Database "vinixport" belum dibuat');
        console.log('3. Username/password MySQL tidak cocok (default: root, kosong)');
        console.log('4. Port MySQL tidak standar (seharusnya 3306)');
        return;
    }
    
    console.log('✓ Terhubung ke database MySQL');
    
    // Test query ke tabel review_requests
    const query = 'SELECT COUNT(*) as count FROM review_requests';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error saat menguji tabel review_requests:', err);
            console.log('Kemungkinan tabel belum dibuat, pastikan schema.sql sudah diimport');
        } else {
            console.log('✓ Tabel review_requests dapat diakses');
            console.log('Jumlah data saat ini:', results[0].count);
        }
        
        db.end();
    });
});