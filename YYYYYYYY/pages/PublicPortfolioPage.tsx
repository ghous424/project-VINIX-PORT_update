import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
// Pastikan path ini sesuai dengan lokasi api.ts Anda
import { API_URL } from '../services/api'; 

// Definisi Tipe Data (Agar tidak error TypeScript)
interface Tag {
  id: string;
  name: string;
}

interface Project {
  id: number;
  title: string;
  description: string;
  image_url: string;
  link: string;
  tags: string[]; 
}

interface Certificate {
  id: number;
  title: string;
  issuer: string;
  date: string;
  image_url: string;
}

interface UserProfile {
  name: string;
  title: string;
  bio: string;
  avatar_url: string;
  email: string;
}

const PublicPortfolioPage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  
  const [user, setUser] = useState<UserProfile | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isLocked, setIsLocked] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Panggil Endpoint Backend yang sudah kita amankan
        const response = await axios.get(`${API_URL}/api/portfolio/${userId}`);
        
        const data = response.data;
        setUser(data.user);
        setProjects(data.projects);
        setCertificates(data.certificates);
      } catch (err: any) {
        console.error(err);
        if (err.response && err.response.status === 403) {
          // Tangkap error 403 (Belum Bayar)
          setIsLocked(true);
          setError(err.response.data.message);
        } else if (err.response && err.response.status === 404) {
          setError('User tidak ditemukan.');
        } else {
          setError('Gagal memuat data portofolio.');
        }
      } finally {
        setLoading(false);
      }
    };

    if (userId) fetchData();
  }, [userId]);

  // Tampilan Loading
  if (loading) return <div className="p-10 text-center">Loading Portfolio...</div>;

  // Tampilan Jika Terkunci (Belum Bayar)
  if (isLocked) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Akses Dibatasi</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button onClick={() => window.history.back()} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Kembali
          </button>
        </div>
      </div>
    );
  }

  // Tampilan Jika Error Lain
  if (error) return <div className="p-10 text-center text-red-500">{error}</div>;

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 md:px-10">
      <div className="max-w-6xl mx-auto">
        
        {/* A. HEADER PROFILE */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-10 text-center">
          <img 
            src={user.avatar_url} 
            alt={user.name} 
            className="w-32 h-32 rounded-full border-4 border-blue-500 mx-auto object-cover"
          />
          <h1 className="text-4xl font-bold mt-4 text-gray-800">{user.name}</h1>
          <p className="text-xl text-blue-600 font-medium mt-1">{user.title}</p>
          <p className="text-gray-500 mt-4 max-w-2xl mx-auto leading-relaxed">{user.bio}</p>
          
          <div className="mt-6 flex justify-center gap-4">
             <a href={`mailto:${user.email}`} className="px-4 py-2 bg-gray-100 rounded-full text-gray-700 hover:bg-gray-200 transition">
               ✉️ Hubungi Saya
             </a>
          </div>
        </div>

        {/* B. PROJECT SHOWCASE */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 border-l-4 border-blue-500 pl-4">
            Proyek Unggulan
          </h2>
          
          {projects.length === 0 ? (
            <p className="text-gray-500">Belum ada proyek yang diunggah.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {projects.map((project) => (
                <div key={project.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition duration-300">
                  <div className="h-48 overflow-hidden">
                    <img src={project.image_url} alt={project.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-2 text-gray-800">{project.title}</h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">{project.description}</p>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      {project.tags.map((tag, index) => (
                        <span key={index} className="px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded-md font-semibold">
                          {tag}
                        </span>
                      ))}
                    </div>
                    
                    <a href={project.link} target="_blank" rel="noreferrer" className="block text-center w-full py-2 border border-blue-500 text-blue-500 rounded hover:bg-blue-50 transition">
                      Lihat Detail Project
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* C. SERTIFIKAT */}
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-6 border-l-4 border-green-500 pl-4">
            Sertifikasi & Lisensi
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {certificates.map((cert) => (
               <div key={cert.id} className="flex items-center bg-white p-4 rounded-lg shadow border border-gray-100">
                 <div className="w-16 h-16 flex-shrink-0 mr-4 bg-gray-100 rounded flex items-center justify-center overflow-hidden">
                    {cert.image_url ? (
                      <img src={cert.image_url} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-2xl">📜</span>
                    )}
                 </div>
                 <div>
                   <h4 className="font-bold text-gray-800">{cert.title}</h4>
                   <p className="text-sm text-gray-500">{cert.issuer} • {cert.date}</p>
                 </div>
               </div>
             ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default PublicPortfolioPage;