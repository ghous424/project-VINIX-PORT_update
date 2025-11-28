import React from 'react';
import { Link } from 'react-router-dom';

// --- Komponen Kecil (Atoms) ---

const SectionBadge = ({ children }: { children: React.ReactNode }) => (
  <div className="inline-flex items-center px-3 py-1 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-300 text-xs font-medium mb-6 uppercase tracking-widest shadow-[0_0_10px_rgba(59,130,246,0.2)]">
    {children}
  </div>
);

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
  <div className="group relative p-8 bg-slate-900 border border-slate-800 rounded-2xl hover:border-blue-500/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-500/10 overflow-hidden">
    {/* Hover Gradient Blob */}
    <div className="absolute -right-10 -top-10 w-32 h-32 bg-blue-600/20 rounded-full blur-3xl group-hover:bg-blue-600/30 transition-all duration-500"></div>
    
    <div className="relative z-10">
      <div className="w-14 h-14 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-white mb-3 group-hover:text-blue-400 transition-colors">{title}</h3>
      <p className="text-slate-400 leading-relaxed text-sm">{description}</p>
    </div>
  </div>
);

const AlumniCard = ({ name, title, imageUrl }: { name: string, title: string, imageUrl: string }) => (
  <div className="group relative">
    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-500"></div>
    <div className="relative bg-slate-900 border border-slate-800 p-6 rounded-2xl flex items-center space-x-4 h-full">
      <img className="w-16 h-16 rounded-full object-cover border-2 border-slate-700 group-hover:border-blue-500 transition-colors" src={imageUrl} alt={name} />
      <div>
        <h3 className="text-lg font-bold text-white group-hover:text-blue-300 transition-colors">
            {name}
        </h3>
        <p className="text-slate-400 text-sm">{title}</p>
      </div>
    </div>
  </div>
);

// --- Halaman Utama ---

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-blue-500 selection:text-white">
      
      {/* Background Grid Pattern */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/20 blur-[100px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-600/10 blur-[100px]"></div>
      </div>

      <div className="relative z-10">
        
        {/* Navbar (Mockup Sederhana) */}
       

        {/* Hero Section */}
        <section className="relative pt-20 pb-32 overflow-hidden">
          <div className="container mx-auto px-4 text-center">
            
            <SectionBadge>Platform Portofolio #1 Indonesia</SectionBadge>
            
            <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight leading-tight text-white">
              Ubah Hasil <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Pelatihanmu</span> <br className="hidden md:block" />
              Jadi Karir Global.
            </h1>
            
            <p className="text-lg md:text-xl mb-10 max-w-2xl mx-auto text-slate-400 leading-relaxed">
              Jangan biarkan sertifikatmu menumpuk. Dengan VinixPort, bangun portofolio profesional dalam hitungan menit, validasi skill, dan pikat rekruter.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                to="/register"
                className="group relative px-8 py-4 bg-blue-600 rounded-full font-bold text-white shadow-lg shadow-blue-600/30 hover:bg-blue-500 transition-all hover:-translate-y-1"
              >
                <span className="relative z-10">Buat Portofolio Gratis</span>
                <div className="absolute inset-0 -z-10 bg-blue-400 blur-lg opacity-0 group-hover:opacity-50 transition-opacity duration-200"></div>
              </Link>
              
              <button className="px-8 py-4 rounded-full font-bold text-slate-300 border border-slate-700 hover:bg-slate-800 hover:text-white transition-all">
                Lihat Demo
              </button>
            </div>

          

          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 bg-slate-950 relative">
          <div className="container mx-auto px-6">
            <div className="text-center mb-20">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Fitur Superpower</h2>
                <p className="text-slate-400 max-w-xl mx-auto">Semua alat yang kamu butuhkan untuk memamerkan karya terbaikmu.</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <FeatureCard 
                icon={<svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>}
                title="Skill Validation"
                description="Sistem asesmen otomatis yang memberikan lencana terverifikasi untuk setiap keahlian yang kamu kuasai."
              />
              <FeatureCard 
                icon={<svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>}
                title="Instant Upload"
                description="Tarik proyek langsung dari GitHub, Behance, atau upload file lokal dengan drag-and-drop super cepat."
              />
              <FeatureCard 
                icon={<svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>}
                title="Smart Analytics"
                description="Lihat siapa yang mengintip profilmu. Data real-time untuk membantumu mengoptimalkan personal branding."
              />
              <FeatureCard 
                icon={<svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>}
                title="One-Click PDF"
                description="Butuh format klasik? Generate CV ATS-friendly atau portofolio visual PDF dalam satu kali klik."
              />
            </div>
          </div>
        </section>

        {/* Alumni / Social Proof Section */}
        <section className="py-24 relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-gradient-to-b from-slate-900 to-slate-950 -z-10"></div>
            
            <div className="container mx-auto px-6">
                <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
                    <div className="max-w-2xl">
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Komunitas Juara</h2>
                        <p className="text-slate-400">Bergabunglah dengan ribuan alumni yang telah bekerja di perusahaan top dunia.</p>
                    </div>
                    <a href="#" className="text-blue-400 hover:text-blue-300 font-medium flex items-center gap-2 group">
                        Lihat semua alumni 
                        <span className="group-hover:translate-x-1 transition-transform">→</span>
                    </a>
                </div>
                
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    <AlumniCard name="Sarah Wijaya" title="Frontend @ GoTo" imageUrl="https://i.pravatar.cc/150?u=sarah" />
                    <AlumniCard name="Budi Santoso" title="Product Design @ Traveloka" imageUrl="https://i.pravatar.cc/150?u=budi" />
                    <AlumniCard name="Jessica Lee" title="Data Analyst @ Shopee" imageUrl="https://i.pravatar.cc/150?u=jessica" />
                    <AlumniCard name="Arif Pratama" title="Flutter Dev @ Freelance" imageUrl="https://i.pravatar.cc/150?u=arif" />
                </div>
            </div>
        </section>

        {/* CTA Footer */}
        <section className="py-24 relative">
            <div className="container mx-auto px-6">
                <div className="relative bg-gradient-to-br from-blue-900 to-slate-900 rounded-3xl p-10 md:p-16 text-center overflow-hidden border border-blue-800">
                    {/* Glow Effects */}
                    <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                    <div className="absolute -top-24 -left-24 w-64 h-64 bg-blue-500 rounded-full blur-[100px] opacity-30"></div>
                    
                    <div className="relative z-10">
                        <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Siap Membangun Masa Depan?</h2>
                        <p className="text-blue-200 text-lg mb-8 max-w-xl mx-auto">Mulai perjalanan karir profesionalmu hari ini. Gratis selamanya untuk fitur dasar.</p>
                        <Link
                            to="/register"
                            className="inline-block bg-white text-blue-900 font-bold rounded-full py-4 px-10 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
                        >
                            Mulai Sekarang - Gratis
                        </Link>
                        <p className="mt-6 text-sm text-slate-400">Tidak perlu kartu kredit. Batal kapan saja.</p>
                    </div>
                </div>
            </div>
        </section>

        

      </div>
    </div>
  );
};

export default LandingPage;