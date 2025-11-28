
import { User, Project, Certificate, ReviewRequest, ReviewStatus } from '../types';
import { mockUser, mockProjects, mockCertificates } from './mockData';

// --- KONFIGURASI ---
// Ubah ke TRUE jika server backend (backend/server.js) sudah berjalan.
// Ubah ke FALSE untuk menggunakan data dummy (Mode Preview) dengan LocalStorage Persistence.
const USE_BACKEND = true;
// INI BENAR (Jalan di Netlify)
export const API_URL = "https://project-vinix-port-update.vercel.app/api/auth";

// --- LOCAL STORAGE KEYS (Untuk Mode Mock) ---
const KEYS = {
    USER: 'vinix_user',
    PROJECTS: 'vinix_projects',
    CERTS: 'vinix_certificates',
    REVIEW_REQUESTS: 'vinix_review_requests',
    MENTOR_USER: 'vinix_mentor_user',
};

// Helper untuk Mock Storage
const getStorage = <T>(key: string, defaultValue: T): T => {
    const stored = localStorage.getItem(key);
    if (stored) {
        return JSON.parse(stored);
    }
    // Inisialisasi jika kosong
    localStorage.setItem(key, JSON.stringify(defaultValue));
    return defaultValue;
};

const setStorage = (key: string, data: any) => {
    localStorage.setItem(key, JSON.stringify(data));
};

// Helper untuk request Backend Asli
const request = async (endpoint: string, options?: RequestInit) => {
    try {
        // Ambil user ID dari localStorage
        const storedUser = localStorage.getItem('vinix_user');
        let userId = null;

        if (storedUser) {
            try {
                const user = JSON.parse(storedUser);
                // Jika user memiliki id, gunakan itu
                userId = user.id;
            } catch (e) {
                console.warn('Could not parse stored user:', e);
            }
        }

        const headers: any = { 'Content-Type': 'application/json' };

        // Tambahkan user ID ke header jika tersedia
        if (userId) {
            headers['x-user-id'] = userId;
            console.log('User ID found and added to header:', userId);
        } else {
            console.warn('No user ID found in localStorage');
        }

        console.log('Sending request to:', `${API_URL}${endpoint}`);
        console.log('Headers:', headers);
        console.log('Options:', options);

        const res = await fetch(`${API_URL}${endpoint}`, {
            headers,
            ...options,
        });

        console.log('Response status:', res.status);

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            console.error('API Error Response:', errorData);
            throw new Error(errorData.message || `HTTP Error: ${res.status} - ${res.statusText}`);
        }

        const responseData = await res.json();
        console.log('API Response Data:', responseData);
        return responseData;
    } catch (err) {
        console.error(`API Request Failed: ${endpoint}`, err);
        throw err;
    }
};

export const api = {
    // --- AUTH ---
    login: async (email: string, password: string) => {
        if (!USE_BACKEND) {
            // Mock Logic dengan Persistence untuk TALENT (bukan mentor)
            return new Promise<{user: User}>((resolve, reject) => {
                setTimeout(() => {
                    const currentUser = getStorage<User>(KEYS.USER, { ...mockUser, role: 'user' });
                    
                    if ((email === 'alex.doe@example.com' && password === 'password123') || email === currentUser.email) {
                        resolve({ user: currentUser });
                    } else {
                        reject(new Error('Invalid credentials (Mock)'));
                    }
                }, 800);
            });
        }
        return request('/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
    },

    // --- MENTOR AUTH (Mock only) ---
    loginMentor: async (email: string, password: string) => {
        if (!USE_BACKEND) {
            return new Promise<{user: User}>((resolve, reject) => {
                setTimeout(() => {
                    if (email === 'mentor@vinixport.com' && password === 'mentor123') {
                        const mentorUser: User = {
                            name: 'Mentor Expert',
                            email,
                            title: 'Career Mentor',
                            bio: 'Senior industry mentor for VinixPort.',
                            avatarUrl: 'https://i.pravatar.cc/150?u=vinix-mentor',
                            role: 'mentor',
                        };
                        setStorage(KEYS.MENTOR_USER, mentorUser);
                        resolve({ user: mentorUser });
                    } else {
                        reject(new Error('Invalid mentor credentials (Mock)'));
                    }
                }, 800);
            });
        }
        // Backend placeholder
        return request('/mentors/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
    },

    register: async (name: string, email: string, password: string, role: string) => {
        if (!USE_BACKEND) {
            return new Promise<void>((resolve) => {
                const newUser: User = {
                    name,
                    email,
                    title: 'New Member',
                    bio: 'Tell us about yourself...',
                    avatarUrl: 'https://ui-avatars.com/api/?name=' + name.replace(' ', '+'),
                    role: role,
                };
                setStorage(KEYS.USER, newUser);
                setTimeout(resolve, 800);
            });
        }
        return request('/register', {
            method: 'POST',
            body: JSON.stringify({ name, email, password, role }),
        });
    },

    updateProfile: async (userId: number, data: Partial<User>) => {
        if(!USE_BACKEND) {
            return new Promise<void>((resolve) => {
                const currentUser = getStorage<User>(KEYS.USER, { ...mockUser });
                const updatedUser = { ...currentUser, ...data };
                setStorage(KEYS.USER, updatedUser);
                resolve();
            });
        }
        
        return request(`/users/${userId || 1}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    },

    // --- PORTFOLIO DATA ---
    getPortfolio: async (userId: number) => {
        if (!USE_BACKEND) {
            return new Promise<{ projects: Project[], certificates: Certificate[] }>((resolve) => {
                setTimeout(() => {
                    const projects = getStorage<Project[]>(KEYS.PROJECTS, mockProjects);
                    const certificates = getStorage<Certificate[]>(KEYS.CERTS, mockCertificates);
                    resolve({ projects, certificates });
                }, 500);
            });
        }
        return request(`/portfolio/${userId}`);
    },

    addProject: async (userId: number, project: Omit<Project, 'id'>) => {
        if (!USE_BACKEND) {
            return new Promise<Project>((resolve) => {
                const projects = getStorage<Project[]>(KEYS.PROJECTS, mockProjects);
                const newProject = { ...project, id: Date.now() };
                const updatedProjects = [newProject, ...projects];
                setStorage(KEYS.PROJECTS, updatedProjects);
                resolve(newProject);
            });
        }
        return request('/projects', {
            method: 'POST',
            body: JSON.stringify({ userId, ...project }),
        });
    },

    updateProject: async (project: Project) => {
        if(!USE_BACKEND) {
            const projects = getStorage<Project[]>(KEYS.PROJECTS, mockProjects);
            const updatedProjects = projects.map(p => p.id === project.id ? project : p);
            setStorage(KEYS.PROJECTS, updatedProjects);
            return;
        }
        return request(`/projects/${project.id}`, {
            method: 'PUT',
            body: JSON.stringify(project)
        });
    },

    deleteProject: async (id: number) => {
        if (!USE_BACKEND) {
             const projects = getStorage<Project[]>(KEYS.PROJECTS, mockProjects);
             const updatedProjects = projects.filter(p => p.id !== id);
             setStorage(KEYS.PROJECTS, updatedProjects);
             return;
        }
        return request(`/projects/${id}`, { method: 'DELETE' });
    },

    addCertificate: async (userId: number, cert: Omit<Certificate, 'id'>) => {
        if (!USE_BACKEND) {
             return new Promise<Certificate>((resolve) => {
                const certs = getStorage<Certificate[]>(KEYS.CERTS, mockCertificates);
                const newCert = { ...cert, id: Date.now() };
                const updatedCerts = [newCert, ...certs];
                setStorage(KEYS.CERTS, updatedCerts);
                resolve(newCert);
            });
        }
        return request('/certificates', {
            method: 'POST',
            body: JSON.stringify({ userId, ...cert }),
        });
    },

    updateCertificate: async (cert: Certificate) => {
        if(!USE_BACKEND) {
            const certs = getStorage<Certificate[]>(KEYS.CERTS, mockCertificates);
            const updatedCerts = certs.map(c => c.id === cert.id ? cert : c);
            setStorage(KEYS.CERTS, updatedCerts);
            return;
        }
        return request(`/certificates/${cert.id}`, {
            method: 'PUT',
            body: JSON.stringify(cert)
        });
    },

    deleteCertificate: async (id: number) => {
        if (!USE_BACKEND) {
            const certs = getStorage<Certificate[]>(KEYS.CERTS, mockCertificates);
            const updatedCerts = certs.filter(c => c.id !== id);
            setStorage(KEYS.CERTS, updatedCerts);
            return;
        }
        return request(`/certificates/${id}`, { method: 'DELETE' });
    },

    // --- REVIEW REQUESTS (Mock only) ---
    createReviewRequest: async (data: {
        menteeName: string;
        menteeEmail: string;
        portfolioUrl: string;
        notes?: string;
        paymentAmount?: number;
        paymentBank?: string;
        paymentAccountName?: string;
        paymentProofImage?: string;
    }): Promise<ReviewRequest> => {
        if (!USE_BACKEND) {
            return new Promise<ReviewRequest>((resolve) => {
                const existing = getStorage<ReviewRequest[]>(KEYS.REVIEW_REQUESTS, []);
                const newRequest: ReviewRequest = {
                    id: Date.now(),
                    menteeName: data.menteeName,
                    menteeEmail: data.menteeEmail,
                    portfolioUrl: data.portfolioUrl,
                    notes: data.notes,
                    paymentAmount: data.paymentAmount,
                    paymentBank: data.paymentBank,
                    paymentAccountName: data.paymentAccountName,
                    paymentProofImage: data.paymentProofImage,
                    paymentStatus: 'waiting_verification',
                    status: 'pending',
                    createdAt: new Date().toISOString(),
                };
                setStorage(KEYS.REVIEW_REQUESTS, [newRequest, ...existing]);
                resolve(newRequest);
            });
        }

        console.log('Mengirim review request ke backend:', data);
        try {
            const result = await request('/review-requests', {
                method: 'POST',
                body: JSON.stringify(data),
            });
            console.log('Berhasil membuat review request:', result);
            return result;
        } catch (error) {
            console.error('Error saat membuat review request:', error);
            throw error;
        }
    },

    getReviewRequests: async (): Promise<ReviewRequest[]> => {
        if (!USE_BACKEND) {
            return new Promise<ReviewRequest[]>((resolve) => {
                const existing = getStorage<ReviewRequest[]>(KEYS.REVIEW_REQUESTS, []);
                resolve(existing);
            });
        }
        return request('/review-requests');
    },

    updateReviewRequestStatus: async (id: number, status: ReviewStatus, extra?: Partial<ReviewRequest>): Promise<void> => {
        if (!USE_BACKEND) {
            const existing = getStorage<ReviewRequest[]>(KEYS.REVIEW_REQUESTS, []);
            const updated = existing.map(req => req.id === id ? { ...req, status, ...extra } : req);
            setStorage(KEYS.REVIEW_REQUESTS, updated);
            return;
        }
        return request(`/review-requests/${id}`, {
            method: 'PUT',
            body: JSON.stringify({ status, ...extra }),
        });
    },
};
