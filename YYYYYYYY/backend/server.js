const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '../.env' });

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());

// Middleware
app.use(cors({
    origin: ["http://localhost:5173", "http://localhost:3000", "http://localhost:5174", "file://"], // Tambahkan origin untuk form HTML
    credentials: true
}));
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));

// Database connection
const db = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    database: process.env.DB_NAME || 'vinixport'
});

// Connect to database
db.connect((err) => {
    if (err) {
        console.error('Error connecting to database:', err);
        return;
    }
    console.log('Connected to MySQL database');
});

// API Routes

// User Authentication
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;

    const query = 'SELECT * FROM users WHERE email = ?';
    db.query(query, [email], (err, results) => {
        if (err) {
            console.error('Database error during login:', err);
            return res.status(500).json({ message: 'Database error' });
        }

        if (results.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const user = results[0];

        // Validate password with bcrypt
        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) {
                console.error('Error comparing passwords:', err);
                return res.status(500).json({ message: 'Authentication error' });
            }

            if (!isMatch) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }

            res.json({
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    avatarUrl: user.avatar_url,
                    title: user.title,
                    bio: user.bio,
                    role: user.role
                }
            });
        });
    });
});

// Endpoint untuk membuat user demo (untuk pengujian)
app.post('/api/admin/create-demo-user', (req, res) => {
    const { name, email, title, bio, role } = req.body;
    const defaultPassword = 'password123'; // Password default untuk user demo

    // Hash password default
    bcrypt.hash(defaultPassword, 10, (err, hashedPassword) => {
        if (err) {
            console.error('Error hashing demo password:', err);
            return res.status(500).json({ message: 'Error creating demo user' });
        }

        // Cek apakah email sudah ada
        const checkQuery = 'SELECT * FROM users WHERE email = ?';
        db.query(checkQuery, [email], (err, results) => {
            if (err) {
                console.error('Database error during user check:', err);
                return res.status(500).json({ message: 'Database error' });
            }

            if (results.length > 0) {
                return res.status(409).json({ message: 'User with this email already exists' });
            }

            // Buat user baru
            const insertQuery = 'INSERT INTO users (name, email, password, title, bio, role, avatar_url) VALUES (?, ?, ?, ?, ?, ?, ?)';
            const avatarUrl = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(name);
            const values = [name, email, hashedPassword, title || 'New Member', bio || 'Tell us about yourself...', role || 'user', avatarUrl];

            db.query(insertQuery, values, (err, result) => {
                if (err) {
                    console.error('Database error during user creation:', err);
                    return res.status(500).json({ message: 'Database error' });
                }

                res.status(201).json({
                    id: result.insertId,
                    message: 'Demo user created successfully with default password.'
                });
            });
        });
    });
});

// Endpoint untuk mendapatkan semua users
app.get('/api/admin/all-users', (req, res) => {
    const query = 'SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC';

    db.query(query, (err, results) => {
        if (err) {
            console.error('Database error during users retrieval:', err);
            return res.status(500).json({ message: 'Database error' });
        }

        res.json(results);
    });
});

app.post('/api/register', (req, res) => {
    const { name, email, password, role } = req.body;
    console.log('--- New Registration Attempt ---');
    console.log('Request Body:', req.body);

    // Basic validation
    if (!name || !email || !password || !role) {
        console.error('Registration failed: Missing name, email, password, or role.');
        return res.status(400).json({ message: 'Name, email, password, and role are required.' });
    }

    // Check if user already exists
    const checkQuery = 'SELECT * FROM users WHERE email = ?';
    db.query(checkQuery, [email], (err, results) => {
        if (err) {
            console.error('Database error during registration check:', err);
            return res.status(500).json({ message: 'Database error during user check.' });
        }

        if (results.length > 0) {
            console.warn(`Registration blocked: User with email ${email} already exists.`);
            return res.status(409).json({ message: 'User with this email already exists' });
        }

        // Hash password
        console.log('Hashing password...');
        bcrypt.hash(password, 10, (err, hashedPassword) => {
            if (err) {
                console.error('Error hashing password:', err);
                return res.status(500).json({ message: 'Error hashing password' });
            }

            console.log('Password hashed. Inserting new user into database...');
            const avatarUrl = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(name);
            const query = 'INSERT INTO users (name, email, password, title, bio, role, avatar_url) VALUES (?, ?, ?, ?, ?, ?, ?)';
            const values = [name, email, hashedPassword, 'New Member', 'Tell us about yourself...', role, avatarUrl];

            db.query(query, values, (err, result) => {
                if (err) {
                    console.error('Database error during user insertion:', err);
                    return res.status(500).json({ message: 'Database error during user insertion.' });
                }

                console.log(`User ${email} registered successfully with ID: ${result.insertId}`);
                // Return complete user data to frontend
                res.status(201).json({
                    id: result.insertId,
                    name: name,
                    email: email,
                    avatarUrl: avatarUrl,
                    title: 'New Member',
                    bio: 'Tell us about yourself...',
                    role: role,
                    message: 'Registration successful'
                });
            });
        });
    });
});

// Mentor Login
app.post('/api/mentors/login', (req, res) => {
    const { email, password } = req.body;
    console.log('Mentor login attempt with email:', email);

    // Query database untuk mencari mentor dengan email
    const query = 'SELECT * FROM users WHERE email = ? AND role = "mentor"';
    db.query(query, [email], (err, results) => {
        if (err) {
            console.error('Database error during mentor login:', err);
            return res.status(500).json({ message: 'Database error' });
        }

        console.log('Mentor found in database:', results);
        if (results.length === 0) {
            return res.status(401).json({ message: 'Invalid mentor credentials' });
        }

        const user = results[0];

        // Validate password with bcrypt
        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) {
                console.error('Error comparing passwords:', err);
                return res.status(500).json({ message: 'Authentication error' });
            }

            console.log('Password match result:', isMatch);
            if (!isMatch) {
                return res.status(401).json({ message: 'Invalid mentor credentials' });
            }

            res.json({
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    avatarUrl: user.avatar_url,
                    title: user.title,
                    bio: user.bio,
                    role: user.role
                }
            });
        });
    });
});

// Portfolio Data (DENGAN PROTEKSI PEMBAYARAN)
app.get('/api/portfolio/:userId', (req, res) => {
    const userId = req.params.userId;

    // --- [BARU] CEK STATUS PEMBAYARAN DULU ---
    const checkPaymentQuery = `
        SELECT status, payment_status 
        FROM review_requests 
        WHERE mentee_id = ? AND payment_status = 'approved' 
        LIMIT 1
    `;

    db.query(checkPaymentQuery, [userId], (err, paymentResults) => {
        if (err) return res.status(500).json({ message: 'Database error checking payment' });

        // Jika tidak ada data approved, blokir akses
        if (paymentResults.length === 0) {
            return res.status(403).json({ 
                message: 'Akses Ditolak. User ini belum melakukan pembayaran atau belum diverifikasi.',
                locked: true
            });
        }

        // --- JIKA LOLOS, LANJUT AMBIL DATA (Logika Lama) ---
        
        // Ambil data User Profile sekalian (biar lengkap)
        const userQuery = 'SELECT id, name, email, avatar_url, title, bio, role FROM users WHERE id = ?';
        
        db.query(userQuery, [userId], (err, userResult) => {
             if (err) return res.status(500).json({ message: 'Database error fetching user' });
             
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
                    
                    // Kirim semua data lengkap
                    res.json({ 
                        user: userResult[0], // Tambahan info user
                        projects: parsedProjects, 
                        certificates 
                    });
                });
            });
        });
    });
});

// Projects
app.post('/api/projects', (req, res) => {
    const { userId, title, description, imageUrl, link, tags } = req.body;
    
    const query = 'INSERT INTO projects (user_id, title, description, image_url, link, tags) VALUES (?, ?, ?, ?, ?, ?)';
    const values = [userId, title, description, imageUrl, link, JSON.stringify(tags || [])];
    
    db.query(query, values, (err, result) => {
        if (err) {
            return res.status(500).json({ message: 'Database error' });
        }
        
        const newProject = {
            id: result.insertId,
            user_id: userId,
            title,
            description,
            image_url: imageUrl,
            link,
            tags: tags || []
        };
        
        res.status(201).json(newProject);
    });
});

app.put('/api/projects/:id', (req, res) => {
    const id = req.params.id;
    const { title, description, imageUrl, link, tags } = req.body;
    
    const query = 'UPDATE projects SET title=?, description=?, image_url=?, link=?, tags=? WHERE id=?';
    const values = [title, description, imageUrl, link, JSON.stringify(tags || []), id];
    
    db.query(query, values, (err, result) => {
        if (err) {
            return res.status(500).json({ message: 'Database error' });
        }
        
        res.json({ message: 'Project updated successfully' });
    });
});

app.delete('/api/projects/:id', (req, res) => {
    const id = req.params.id;
    console.log(`--- DELETE request for project ID: ${id} ---`);
    
    const query = 'DELETE FROM projects WHERE id = ?';
    
    db.query(query, [id], (err, result) => {
        if (err) {
            console.error(`Database error during project deletion (ID: ${id}):`, err);
            return res.status(500).json({ message: 'Database error' });
        }
        
        console.log(`Project with ID: ${id} deleted successfully. Result:`, result);
        res.json({ message: 'Project deleted successfully' });
    });
});

// Certificates
app.post('/api/certificates', (req, res) => {
    const { userId, title, issuer, date, imageUrl } = req.body;
    
    const query = 'INSERT INTO certificates (user_id, title, issuer, date, image_url) VALUES (?, ?, ?, ?, ?)';
    const values = [userId, title, issuer, date, imageUrl];
    
    db.query(query, values, (err, result) => {
        if (err) {
            return res.status(500).json({ message: 'Database error' });
        }
        
        const newCertificate = {
            id: result.insertId,
            user_id: userId,
            title,
            issuer,
            date,
            image_url: imageUrl
        };
        
        res.status(201).json(newCertificate);
    });
});

app.put('/api/certificates/:id', (req, res) => {
    const id = req.params.id;
    const { title, issuer, date, imageUrl } = req.body;
    
    const query = 'UPDATE certificates SET title=?, issuer=?, date=?, image_url=? WHERE id=?';
    const values = [title, issuer, date, imageUrl, id];
    
    db.query(query, values, (err, result) => {
        if (err) {
            return res.status(500).json({ message: 'Database error' });
        }
        
        res.json({ message: 'Certificate updated successfully' });
    });
});

app.delete('/api/certificates/:id', (req, res) => {
    const id = req.params.id;
    
    const query = 'DELETE FROM certificates WHERE id = ?';
    
    db.query(query, [id], (err, result) => {
        if (err) {
            return res.status(500).json({ message: 'Database error' });
        }
        
        res.json({ message: 'Certificate deleted successfully' });
    });
});

// Middleware sederhana untuk mendapatkan user ID dari header (dalam produksi, gunakan JWT)
const getAuthenticatedUserId = (req) => {
    // Dalam implementasi nyata, kita akan memverifikasi JWT token
    // Di sini kita menggunakan header sederhana untuk keperluan demo
    const userId = req.headers['x-user-id'];
    return userId ? parseInt(userId) : null;
};

// Review Requests
app.post('/api/review-requests', (req, res) => {
    const userId = getAuthenticatedUserId(req);
    if (!userId) {
        console.log('Authentication failed: No user ID in request header');
        return res.status(401).json({ message: 'Authentication required' });
    }

    const { menteeName, menteeEmail, portfolioUrl, notes, paymentAmount, paymentBank, paymentAccountName, paymentProofImage } = req.body;

    // Validasi bahwa nama dan email cocok dengan ID pengguna
    const userCheckQuery = 'SELECT * FROM users WHERE id = ? AND email = ?';
    db.query(userCheckQuery, [userId, menteeEmail], (err, results) => {
        if (err) {
            console.error('Database error during user verification:', err);
            return res.status(500).json({ message: 'Database error: ' + err.message });
        }

        if (results.length === 0) {
            console.log(`Unauthorized access attempt: ID ${userId} with email ${menteeEmail}`);
            return res.status(403).json({ message: 'Unauthorized: User data mismatch' });
        }

        console.log(`Creating review request for user ID ${userId}, email ${menteeEmail}`);

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
                console.error('Database error during review request creation:', err);
                // Tambahkan informasi error yang lebih spesifik
                return res.status(500).json({
                    message: 'Database error: ' + err.message,
                    error: err.code,
                    sql: err.sql
                });
            }

            console.log(`Review request created successfully with ID: ${result.insertId}`);

            res.status(201).json({
                id: result.insertId,
                mentee_id: userId,
                mentee_name: menteeName,
                mentee_email: menteeEmail,
                portfolio_url: portfolioUrl,
                notes: notes || null,
                payment_amount: paymentAmount || null,
                payment_bank: paymentBank || null,
                payment_account_name: paymentAccountName || null,
                payment_proof_image: paymentProofImage || null,
                payment_status: 'waiting_verification',
                status: 'pending',
                created_at: new Date().toISOString()
            });
        });
    });
});

app.get('/api/review-requests', (req, res) => {
    const userId = getAuthenticatedUserId(req);
    if (!userId) {
        return res.status(401).json({ message: 'Authentication required' });
    }

    // Check if user is mentor
    const userCheckQuery = 'SELECT role FROM users WHERE id = ?';
    db.query(userCheckQuery, [userId], (err, results) => {
        if (err) {
            console.error('Database error during user role verification:', err);
            return res.status(500).json({ message: 'Database error' });
        }

        if (results.length === 0) {
            return res.status(403).json({ message: 'User not found' });
        }

        const userRole = results[0].role;

        let query;
        let values = [];

        if (userRole === 'mentor') {
            // Mentor bisa melihat semua permintaan review, join dengan tabel user untuk dapat data mentee
            query = `
                SELECT
                  rr.id,
                  rr.mentee_id AS menteeId,
                  u.name AS menteeName,
                  u.email AS menteeEmail,
                  rr.portfolio_url AS portfolioUrl,
                  rr.notes,
                  rr.status,
                  rr.created_at AS createdAt,
                  rr.payment_amount AS paymentAmount,
                  rr.payment_bank AS paymentBank,
                  rr.payment_account_name AS paymentAccountName,
                  rr.payment_status AS paymentStatus,
                  rr.mentor_feedback AS mentorFeedback
                FROM review_requests rr
                JOIN users u ON rr.mentee_id = u.id
                ORDER BY rr.created_at DESC
            `;
        } else {
            // Pengguna biasa hanya bisa melihat permintaan review mereka sendiri
            query = `SELECT * FROM review_requests WHERE mentee_id = ? ORDER BY created_at DESC`;
            values = [userId];
        }

        db.query(query, values, (err, results) => {
            if (err) {
                console.error('Database error during review request retrieval:', err);
                return res.status(500).json({ message: 'Database error' });
            }
            res.json(results);
        });
    });
});

app.put('/api/users/:id', (req, res) => {
    const userId = getAuthenticatedUserId(req);
    if (!userId) {
        return res.status(401).json({ message: 'Authentication required' });
    }

    const id = req.params.id;

    // Memastikan hanya pengguna yang sama yang bisa mengupdate profil
    if (userId != id) {
        return res.status(403).json({ message: 'Cannot update other user\'s profile' });
    }

    const fieldsToUpdate = {};
    if (req.body.name) fieldsToUpdate.name = req.body.name;
    if (req.body.email) fieldsToUpdate.email = req.body.email;
    if (req.body.avatarUrl) fieldsToUpdate.avatar_url = req.body.avatarUrl;
    if (req.body.title) fieldsToUpdate.title = req.body.title;
    if (req.body.bio) fieldsToUpdate.bio = req.body.bio;

    if (Object.keys(fieldsToUpdate).length === 0) {
        return res.status(400).json({ message: 'No fields to update' });
    }

    // If email is being updated, check for duplicates
    if (fieldsToUpdate.email) {
        const checkEmailQuery = 'SELECT id FROM users WHERE email = ? AND id != ?';
        db.query(checkEmailQuery, [fieldsToUpdate.email, id], (err, results) => {
            if (err) {
                console.error('Database error during email check:', err);
                return res.status(500).json({ message: 'Database error' });
            }

            if (results.length > 0) {
                return res.status(409).json({ message: 'Email already in use by another user' });
            }

            updateUser();
        });
    } else {
        updateUser();
    }

    function updateUser() {
        const setClauses = Object.keys(fieldsToUpdate).map(key => `${key} = ?`).join(', ');
        const values = [...Object.values(fieldsToUpdate), id];

        const query = `UPDATE users SET ${setClauses} WHERE id = ?`;

        db.query(query, values, (err, result) => {
            if (err) {
                console.error('Database error during user update:', err);
                return res.status(500).json({ message: 'Database error' });
            }

            res.json({ message: 'User updated successfully' });
        });
    }
});

// Endpoint untuk mengisi data langsung ke database (untuk pengujian/development)
app.post('/api/admin/add-user', (req, res) => {
    const { name, email, title, bio, role, avatar_url, password } = req.body;

    // Validasi input
    if (!name || !email) {
        return res.status(400).json({ message: 'Nama dan email wajib diisi' });
    }

    // Gunakan kata sandi yang diberikan atau kata sandi default, lalu hash
    const passwordToHash = password || 'password123'; 

    bcrypt.hash(passwordToHash, 10, (err, hashedPassword) => {
        if (err) {
            console.error('Error hashing password for admin add user:', err);
            return res.status(500).json({ message: 'Error hashing password' });
        }

        const query = `INSERT INTO users
                       (name, email, password, title, bio, role, avatar_url)
                       VALUES (?, ?, ?, ?, ?, ?, ?)`;

        const values = [
            name,
            email,
            hashedPassword, // Gunakan kata sandi yang baru di-hash
            title || 'New Member',
            bio || 'Tell us about yourself...',
            role || 'user',
            avatar_url || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(name)
        ];

        db.query(query, values, (err, result) => {
            if (err) {
                console.error('Database error during user creation:', err);
                return res.status(500).json({ message: 'Database error: ' + err.message });
            }

            res.status(201).json({
                id: result.insertId,
                message: 'User created successfully'
            });
        });
    });
});

// Endpoint untuk mengisi data review request langsung ke database
app.post('/api/admin/add-review-request', (req, res) => {
    const { mentee_id, mentee_name, mentee_email, portfolio_url, notes,
            payment_amount, payment_bank, payment_account_name, payment_proof_image,
            payment_status, status, mentor_feedback } = req.body;

    // Validasi input
    if (!mentee_id || !mentee_name || !mentee_email || !portfolio_url) {
        return res.status(400).json({ message: 'Mentee ID, name, email, dan portfolio URL wajib diisi' });
    }

    // Validasi mentee_id ada di tabel users
    const userCheckQuery = 'SELECT id FROM users WHERE id = ?';
    db.query(userCheckQuery, [mentee_id], (err, results) => {
        if (err) {
            console.error('Database error during user verification:', err);
            return res.status(500).json({ message: 'Database error' });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'Mentee ID tidak ditemukan di database' });
        }

        const query = `INSERT INTO review_requests
                       (mentee_id, mentee_name, mentee_email, portfolio_url, notes,
                        payment_amount, payment_bank, payment_account_name, payment_proof_image,
                        payment_status, status, mentor_feedback)
                       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

        const values = [
            mentee_id, mentee_name, mentee_email, portfolio_url, notes || null,
            payment_amount || null, payment_bank || null, payment_account_name || null,
            payment_proof_image || null, payment_status || 'waiting_verification',
            status || 'pending', mentor_feedback || null
        ];

        db.query(query, values, (err, result) => {
            if (err) {
                console.error('Database error during review request creation:', err);
                return res.status(500).json({ message: 'Database error: ' + err.message });
            }

            res.status(201).json({
                id: result.insertId,
                message: 'Review request created successfully'
            });
        });
    });
});

// Endpoint untuk mendapatkan semua users (untuk ditampilkan di form)
app.get('/api/admin/users', (req, res) => {
    const query = 'SELECT id, name, email, role FROM users ORDER BY created_at DESC';

    db.query(query, (err, results) => {
        if (err) {
            console.error('Database error during users retrieval:', err);
            return res.status(500).json({ message: 'Database error' });
        }

        res.json(results);
    });
});

// Endpoint debug untuk memeriksa status koneksi dan otentikasi
app.get('/api/debug/status', (req, res) => {
    const userId = getAuthenticatedUserId(req);

    res.json({
        status: 'OK',
        database: 'Connected',
        userId: userId,
        timestamp: new Date().toISOString()
    });
});

// Endpoint debug untuk melihat user ID dari header
app.get('/api/debug/auth', (req, res) => {
    const userId = getAuthenticatedUserId(req);
    const authHeader = req.headers['x-user-id'];

    res.json({
        userId: userId,
        authHeader: authHeader,
        allHeaders: req.headers,
        message: userId ? 'User authenticated' : 'No user ID in header'
    });
});

// Get approved portfolios (users who have paid and been approved)
app.get('/api/approved-portfolios', (req, res) => {
    const query = `
        SELECT DISTINCT
            u.id,
            u.name,
            u.email,
            u.avatar_url AS avatarUrl,
            u.title,
            u.bio,
            u.role,
            (SELECT COUNT(*) FROM projects WHERE user_id = u.id) AS projectCount,
            (SELECT COUNT(*) FROM certificates WHERE user_id = u.id) AS certificateCount
        FROM users u
        INNER JOIN review_requests rr ON u.id = rr.mentee_id
        WHERE rr.payment_status = 'approved'
        ORDER BY u.created_at DESC
    `;

    db.query(query, (err, users) => {
        if (err) {
            console.error('Database error during approved portfolios retrieval:', err);
            return res.status(500).json({ message: 'Database error' });
        }

        // For each user, get their latest project
        const promises = users.map(user => {
            return new Promise((resolve, reject) => {
                const projectQuery = `
                    SELECT id, title, description, image_url AS imageUrl, link, tags
                    FROM projects
                    WHERE user_id = ?
                    ORDER BY created_at DESC
                    LIMIT 1
                `;
                
                db.query(projectQuery, [user.id], (err, projects) => {
                    if (err) {
                        reject(err);
                    } else {
                        if (projects.length > 0) {
                            try {
                                const project = projects[0];
                                project.tags = project.tags ? JSON.parse(project.tags) : [];
                                user.latestProject = project;
                            } catch (e) {
                                user.latestProject = null;
                            }
                        } else {
                            user.latestProject = null;
                        }
                        resolve(user);
                    }
                });
            });
        });

        Promise.all(promises)
            .then(usersWithProjects => {
                res.json(usersWithProjects);
            })
            .catch(err => {
                console.error('Error fetching latest projects:', err);
                res.status(500).json({ message: 'Database error' });
            });
    });
});

// Ini agar saat dibuka https://link-vercel-anda.app tidak muncul 404
app.get("/", (req, res) => {
    const status = {
        status: "Success",
        message: "Backend Vinixport Berjalan dengan Baik! 🚀",
        date: new Date()
    };
    res.json(status); 
});

// --- [BARU] ADMIN: APPROVE PEMBAYARAN USER ---
app.put('/api/admin/approve-payment/:requestId', (req, res) => {
    const requestId = req.params.requestId;
    
    // Update status menjadi 'approved'
    const query = `
        UPDATE review_requests 
        SET payment_status = 'approved', status = 'completed' 
        WHERE id = ?
    `;

    db.query(query, [requestId], (err, result) => {
        if (err) {
            console.error('Error approving payment:', err);
            return res.status(500).json({ message: 'Database error' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Request ID tidak ditemukan' });
        }

        res.json({ message: 'Berhasil! User sekarang bisa mengakses fitur Portofolio Lengkap.' });
    });
});
// Export app untuk Vercel (PENTING)
module.exports = app;
// Jalankan server hanya jika file ini dijalankan langsung (bukan di-import Vercel)
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}
