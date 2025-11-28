const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '../.env' });

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors({
    origin: ["http://localhost:5173", "http://localhost:3000", "http://localhost:5174", "file://", "https://project-vinix-port-update.vercel.app", "https://vinixportupdate.netlify.app"],
    credentials: true
}));

// Limit besar agar muat gambar Base64
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));

// Database connection (KHUSUS TiDB CLOUD)
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 4000, 
    ssl: {
        rejectUnauthorized: true,
        minVersion: 'TLSv1.2'
    }
});

// Connect to database
db.connect((err) => {
    if (err) {
        console.error('Error connecting to database:', err);
        return;
    }
    console.log('Connected to MySQL database');
});

// --- HELPER FUNCTION: Get User ID from Header or Body ---
const getUserIdFromRequest = (req) => {
    // Coba ambil dari Header dulu (Prioritas Utama untuk Frontend ini)
    const headerId = req.headers['x-user-id'];
    if (headerId) return parseInt(headerId);

    // Kalau tidak ada di header, coba cari di body
    if (req.body && req.body.userId) return parseInt(req.body.userId);

    return null;
};

// --- API ROUTES ---

// 1. UPLOAD PROJECT (FIXED)
app.post('/api/projects', (req, res) => {
    const userId = getUserIdFromRequest(req);
    
    // Validasi ketat: User ID wajib ada
    if (!userId) {
        console.error("Upload Project Failed: User ID Missing");
        return res.status(401).json({ message: 'Authentication Error: User ID is missing in header or body.' });
    }

    const { title, description, imageUrl, link, tags } = req.body;
    
    // Pastikan tags berupa string JSON valid
    let tagsString = '[]';
    try {
        // Jika tags dikirim sebagai array, stringify. Jika string, pakai langsung.
        tagsString = typeof tags === 'object' ? JSON.stringify(tags) : tags || '[]';
    } catch (e) {
        console.error("Tags Error:", e);
    }

    const query = 'INSERT INTO projects (user_id, title, description, image_url, link, tags) VALUES (?, ?, ?, ?, ?, ?)';
    const values = [userId, title, description, imageUrl, link, tagsString];
    
    db.query(query, values, (err, result) => {
        if (err) {
            console.error("SQL Error (Upload Project):", err.message); 
            return res.status(500).json({ 
                message: 'Database error', 
                detail: err.message 
            });
        }
        
        res.status(201).json({
            id: result.insertId,
            message: "Project uploaded successfully"
        });
    });
});

// 2. UPLOAD CERTIFICATE (FIXED)
app.post('/api/certificates', (req, res) => {
    const userId = getUserIdFromRequest(req);

    if (!userId) {
        console.error("Upload Cert Failed: User ID Missing");
        return res.status(401).json({ message: 'User ID missing' });
    }

    const { title, issuer, date, imageUrl } = req.body;
    
    const query = 'INSERT INTO certificates (user_id, title, issuer, date, image_url) VALUES (?, ?, ?, ?, ?)';
    const values = [userId, title, issuer, date, imageUrl];
    
    db.query(query, values, (err, result) => {
        if (err) {
            console.error("SQL Error (Upload Cert):", err.message);
            return res.status(500).json({ message: 'Database error', detail: err.message });
        }
        
        res.status(201).json({ 
            success: true, 
            id: result.insertId,
            message: "Certificate uploaded successfully"
        });
    });
});

// 3. REVIEW REQUESTS / PEMBAYARAN (FIXED)
app.post('/api/review-requests', (req, res) => {
    const userId = getUserIdFromRequest(req);
    
    if (!userId) {
        return res.status(401).json({ message: 'Authentication required' });
    }

    const { menteeName, menteeEmail, portfolioUrl, notes, paymentAmount, paymentBank, paymentAccountName, paymentProofImage } = req.body;

    const query = `INSERT INTO review_requests
                   (mentee_id, mentee_name, mentee_email, portfolio_url, notes,
                    payment_amount, payment_bank, payment_account_name, payment_proof_image,
                    payment_status, status)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    const values = [userId, menteeName, menteeEmail, portfolioUrl, notes || null,
                    paymentAmount || null, paymentBank || null, paymentAccountName || null, paymentProofImage || null,
                    'waiting_verification', 'pending'];

    db.query(query, values, (err, result) => {
        if (err) {
            console.error('SQL Error (Review Request):', err.message);
            return res.status(500).json({ message: 'Database error: ' + err.message });
        }

        res.status(201).json({
            id: result.insertId,
            message: "Request submitted successfully"
        });
    });
});

// 4. PORTFOLIO DATA (READ)
app.get('/api/portfolio/:userId', (req, res) => {
    const userId = req.params.userId;

    // CEK STATUS PEMBAYARAN DULU
    const checkPaymentQuery = `
        SELECT status, payment_status 
        FROM review_requests 
        WHERE mentee_id = ? AND payment_status = 'approved' 
        LIMIT 1
    `;

    db.query(checkPaymentQuery, [userId], (err, paymentResults) => {
        if (err) return res.status(500).json({ message: 'Database error checking payment' });

        // PROTEKSI: Jika belum bayar, tolak akses
        if (paymentResults.length === 0) {
            return res.status(403).json({ 
                message: 'Akses Ditolak. User ini belum melakukan pembayaran atau belum diverifikasi.',
                locked: true
            });
        }

        // Jika Lolos, Ambil Data
        const userQuery = 'SELECT id, name, email, avatar_url, title, bio, role FROM users WHERE id = ?';
        
        db.query(userQuery, [userId], (err, userResult) => {
             if (err) return res.status(500).json({ message: 'Database error fetching user' });
             if (userResult.length === 0) return res.status(404).json({ message: 'User not found' });
             
             // Get projects
             const projectsQuery = 'SELECT * FROM projects WHERE user_id = ?';
             db.query(projectsQuery, [userId], (err, projects) => {
                if (err) return res.status(500).json({ message: 'Database error fetching projects' });
        
                const parsedProjects = projects.map(project => {
                    try {
                        const tags = project.tags ? JSON.parse(project.tags) : [];
                        return { ...project, tags };
                    } catch (e) {
                        return { ...project, tags: [] };
                    }
                });
                
                // Get certificates
                const certificatesQuery = 'SELECT * FROM certificates WHERE user_id = ?';
                db.query(certificatesQuery, [userId], (err, certificates) => {
                    if (err) return res.status(500).json({ message: 'Database error fetching certificates' });
                    
                    res.json({ 
                        user: userResult[0], 
                        projects: parsedProjects, 
                        certificates 
                    });
                });
            });
        });
    });
});

// 5. REGISTER
app.post('/api/register', (req, res) => {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
        return res.status(400).json({ message: 'Name, email, password, and role are required.' });
    }

    const checkQuery = 'SELECT * FROM users WHERE email = ?';
    db.query(checkQuery, [email], (err, results) => {
        if (err) return res.status(500).json({ message: 'Database error check' });
        if (results.length > 0) return res.status(409).json({ message: 'User already exists' });

        bcrypt.hash(password, 10, (err, hashedPassword) => {
            if (err) return res.status(500).json({ message: 'Hashing error' });

            const avatarUrl = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(name);
            const query = 'INSERT INTO users (name, email, password, title, bio, role, avatar_url) VALUES (?, ?, ?, ?, ?, ?, ?)';
            const values = [name, email, hashedPassword, 'New Member', 'Tell us about yourself...', role, avatarUrl];

            db.query(query, values, (err, result) => {
                if (err) {
                    console.error("SQL Error (Register):", err.message);
                    return res.status(500).json({ message: 'Register failed' });
                }
                res.status(201).json({ message: 'Registration successful', id: result.insertId });
            });
        });
    });
});

// 6. LOGIN
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    const query = 'SELECT * FROM users WHERE email = ?';
    
    db.query(query, [email], (err, results) => {
        if (err) return res.status(500).json({ message: 'Database error' });
        if (results.length === 0) return res.status(401).json({ message: 'Invalid credentials' });

        const user = results[0];
        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) return res.status(500).json({ message: 'Auth error' });
            if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

            res.json({
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    avatarUrl: user.avatar_url,
                    role: user.role
                }
            });
        });
    });
});

// 7. ADMIN APPROVE PAYMENT
app.put('/api/admin/approve-payment/:requestId', (req, res) => {
    const requestId = req.params.requestId;
    const query = "UPDATE review_requests SET payment_status = 'approved', status = 'completed' WHERE id = ?";

    db.query(query, [requestId], (err, result) => {
        if (err) return res.status(500).json({ message: 'Database error' });
        if (result.affectedRows === 0) return res.status(404).json({ message: 'ID not found' });
        res.json({ message: 'Payment Approved Successfully' });
    });
});

// 8. GET REVIEW REQUESTS (FOR ADMIN)
app.get('/api/review-requests', (req, res) => {
    // Seharusnya ada validasi admin disini, tapi untuk MVP kita buka dulu
    const query = `
        SELECT rr.*, u.name as menteeName, u.email as menteeEmail 
        FROM review_requests rr
        LEFT JOIN users u ON rr.mentee_id = u.id
        ORDER BY rr.created_at DESC
    `;
    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ message: 'Database error' });
        res.json(results);
    });
});

// HEALTH CHECK
app.get("/", (req, res) => {
    res.json({ status: "Success", message: "Backend Vinixport Ready 🚀", time: new Date() });
});

// DEBUG
app.get('/api/debug/status', (req, res) => {
    res.json({ status: 'OK', db: 'Connected', timestamp: new Date() });
});

module.exports = app;

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}