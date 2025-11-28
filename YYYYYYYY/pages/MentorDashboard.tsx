import React, { useMemo, useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { usePortfolio } from '../contexts/PortfolioContext';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { ReviewRequest } from '../types';

const StatCard = ({ title, value, subtext, icon, colorClass, gradient }: {title: string, value: string, subtext?: string, icon: React.ReactNode, colorClass: string, gradient: string}) => (
    <div className="relative bg-slate-900/50 border border-slate-800 p-6 rounded-2xl overflow-hidden group hover:border-blue-500/30 transition-all duration-300 hover:-translate-y-1 shadow-lg">
        {/* Background Glow */}
        <div className={`absolute top-0 right-0 w-24 h-24 ${colorClass} opacity-10 rounded-full blur-2xl -mr-10 -mt-10 transition-opacity group-hover:opacity-20`}></div>

        <div className="relative z-10 flex items-start justify-between">
            <div>
                <p className="text-sm text-slate-400 font-medium uppercase tracking-wider mb-1">{title}</p>
                <p className="text-4xl font-bold text-white tracking-tight mb-2">{value}</p>
                {subtext && <p className="text-xs text-slate-500">{subtext}</p>}
            </div>
            <div className={`p-3 rounded-xl ${gradient} text-white shadow-lg shadow-blue-900/20`}>
                {icon}
            </div>
        </div>
    </div>
);

const MentorDashboard: React.FC = () => {
    const { projects, certificates } = usePortfolio();
    const { user } = useAuth();
    const [reviewRequests, setReviewRequests] = useState<ReviewRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'pending' | 'in_progress' | 'completed'>('all');
    const [selectedUserPortfolio, setSelectedUserPortfolio] = useState<ReviewRequest | null>(null);
    const [portfolioData, setPortfolioData] = useState<any>(null);
    const [loadingPortfolio, setLoadingPortfolio] = useState(false);

    const handleApprovePayment = async (id: number) => {
        try {
            await api.updateReviewRequestStatus(id, 'in_progress', { paymentStatus: 'approved' });
            setReviewRequests(prev =>
                prev.map(req => req.id === id ? { ...req, status: 'in_progress', paymentStatus: 'approved' } : req)
            );
            alert('Pembayaran berhasil disetujui');
        } catch (error) {
            console.error('Failed to approve payment', error);
            alert('Gagal menyetujui pembayaran. Coba lagi.');
        }
    };

    const handleCompleteReview = async (id: number) => {
        const feedback = window.prompt('Masukkan feedback untuk mentee (opsional):') || '';
        try {
            await api.updateReviewRequestStatus(id, 'completed', {
                paymentStatus: 'approved',
                mentorFeedback: feedback,
            });
            setReviewRequests(prev =>
                prev.map(req => req.id === id ? { ...req, status: 'completed', paymentStatus: 'approved', mentorFeedback: feedback } : req)
            );
            alert('Review berhasil diselesaikan dan feedback telah disimpan');
        } catch (error) {
            console.error('Failed to complete review', error);
            alert('Gagal menyelesaikan review. Coba lagi.');
        }
    };

    const handleViewUserPortfolio = async (reviewRequest: ReviewRequest) => {
        setSelectedUserPortfolio(reviewRequest);
        setLoadingPortfolio(true);
        try {
            // Coba ambil data portofolio dari API
            const response = await fetch(`${window.location.origin}/api/portfolio/${reviewRequest.menteeName.toLowerCase().replace(/\s+/g, '')}`);
            if (response.ok) {
                const data = await response.json();
                setPortfolioData(data);
            } else {
                // Jika tidak ada data di API, tampilkan pesan bahwa portofolio belum diisi
                setPortfolioData(null);
            }
        } catch (error) {
            console.error('Error loading portfolio:', error);
            setPortfolioData(null);
        } finally {
            setLoadingPortfolio(false);
        }
    };

    useEffect(() => {
        // Hanya mentor yang bisa mengakses halaman ini
        if (!user || user?.role !== 'mentor') {
            // Arahkan ke halaman yang sesuai jika bukan mentor
            if (user?.role !== 'mentor') {
                window.location.href = '/analytics';
            } else {
                window.location.href = '/login';
            }
            return;
        }

        api.getReviewRequests()
            .then(requests => {
                setReviewRequests(requests);
                setLoading(false);
            })
            .catch(err => {
                console.error('Failed to load review requests', err);
                setLoading(false);
            });
    }, [user]);

    // Filter requests berdasarkan status
    const filteredRequests = useMemo(() => {
        if (filter === 'all') return reviewRequests;
        return reviewRequests.filter(req => req.status === filter);
    }, [reviewRequests, filter]);

    const totalRequests = useMemo(() => reviewRequests.length, [reviewRequests]);
    const pendingRequests = useMemo(
        () => reviewRequests.filter(r => r.status === 'pending').length,
        [reviewRequests]
    );
    const inProgressRequests = useMemo(
        () => reviewRequests.filter(r => r.status === 'in_progress').length,
        [reviewRequests]
    );
    const completedRequests = useMemo(
        () => reviewRequests.filter(r => r.status === 'completed').length,
        [reviewRequests]
    );

    const contentData = useMemo(() => [
        { name: 'Pending', value: pendingRequests, color: '#F59E0B' },
        { name: 'In Progress', value: inProgressRequests, color: '#0EA5E9' },
        { name: 'Completed', value: completedRequests, color: '#10B981' }
    ], [pendingRequests, inProgressRequests, completedRequests]);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-200">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="animate-pulse">Memuat dashboard mentor...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 font-sans selection:bg-blue-500 selection:text-white pt-28 pb-12 px-4 relative overflow-hidden">

            {/* Background Effects */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                <div className="absolute -top-[10%] -left-[10%] w-[60%] h-[60%] rounded-full bg-indigo-600/10 blur-[100px]"></div>
                <div className="absolute bottom-[10%] right-[10%] w-[40%] h-[40%] rounded-full bg-purple-600/10 blur-[80px]"></div>
            </div>

            <div className="relative z-10 container mx-auto max-w-6xl">

                <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-2">Mentor Dashboard</h1>
                        <p className="text-slate-400">Kelola permintaan review portofolio dari mahasiswa dan berikan feedback profesional.</p>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-bold uppercase tracking-wide">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                        </span>
                        Mentor Mode
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <StatCard
                        title="Total Requests"
                        value={totalRequests.toString()}
                        subtext="Permintaan review dari mahasiswa"
                        colorClass="bg-indigo-500"
                        gradient="bg-gradient-to-br from-indigo-500 to-purple-600"
                        icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7h18M3 12h18M3 17h18"></path></svg>}
                    />
                    <StatCard
                        title="Pending"
                        value={pendingRequests.toString()}
                        subtext="Menunggu tindakan Anda"
                        colorClass="bg-amber-500"
                        gradient="bg-gradient-to-br from-amber-500 to-orange-600"
                        icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M12 2a10 10 0 100 20 10 10 0 000-20z"></path></svg>}
                    />
                    <StatCard
                        title="In Progress"
                        value={inProgressRequests.toString()}
                        subtext="Sedang direview"
                        colorClass="bg-sky-500"
                        gradient="bg-gradient-to-br from-sky-500 to-cyan-600"
                        icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>}
                    />
                    <StatCard
                        title="Completed"
                        value={completedRequests.toString()}
                        subtext="Sudah diberi feedback"
                        colorClass="bg-emerald-500"
                        gradient="bg-gradient-to-br from-emerald-500 to-teal-600"
                        icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>}
                    />
                </div>

                <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl p-8 shadow-xl mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-xl font-bold text-white">Status Review</h2>
                            <p className="text-sm text-slate-500 mt-1">Distribusi status permintaan review</p>
                        </div>
                        <div className="flex gap-4 text-xs font-medium text-slate-400">
                             <div className="flex items-center gap-2">
                                 <span className="w-3 h-3 rounded-full bg-amber-500"></span> Pending
                             </div>
                             <div className="flex items-center gap-2">
                                 <span className="w-3 h-3 rounded-full bg-sky-500"></span> In Progress
                             </div>
                             <div className="flex items-center gap-2">
                                 <span className="w-3 h-3 rounded-full bg-emerald-500"></span> Completed
                             </div>
                        </div>
                    </div>

                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={contentData}
                                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                barSize={60}
                            >
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} vertical={false} />
                                <XAxis
                                    dataKey="name"
                                    stroke="#94a3b8"
                                    tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }}
                                    axisLine={false}
                                    tickLine={false}
                                    dy={10}
                                />
                                <YAxis
                                    stroke="#94a3b8"
                                    tick={{ fill: '#64748b', fontSize: 12 }}
                                    axisLine={false}
                                    tickLine={false}
                                    allowDecimals={false}
                                />
                                <Tooltip
                                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                    contentStyle={{
                                        backgroundColor: '#0f172a',
                                        borderColor: '#1e293b',
                                        borderRadius: '12px',
                                        color: '#f8fafc',
                                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)'
                                    }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Bar dataKey="value" name="Jumlah Review" radius={[8, 8, 0, 0]}>
                                    {contentData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl p-8 shadow-xl">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                        <div>
                            <h2 className="text-xl font-bold text-white">Permintaan Review Portofolio</h2>
                            <p className="text-sm text-slate-500 mt-1">Daftar mahasiswa yang ingin portofolionya direview dan menerima feedback dari Anda sebagai mentor.</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <button 
                                onClick={() => setFilter('all')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                                    filter === 'all' 
                                        ? 'bg-indigo-600 text-white' 
                                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                                }`}
                            >
                                Semua ({totalRequests})
                            </button>
                            <button 
                                onClick={() => setFilter('pending')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                                    filter === 'pending' 
                                        ? 'bg-amber-600 text-white' 
                                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                                }`}
                            >
                                Pending ({pendingRequests})
                            </button>
                            <button 
                                onClick={() => setFilter('in_progress')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                                    filter === 'in_progress' 
                                        ? 'bg-sky-600 text-white' 
                                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                                }`}
                            >
                                In Progress ({inProgressRequests})
                            </button>
                            <button 
                                onClick={() => setFilter('completed')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                                    filter === 'completed' 
                                        ? 'bg-emerald-600 text-white' 
                                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                                }`}
                            >
                                Completed ({completedRequests})
                            </button>
                        </div>
                    </div>

                    {filteredRequests.length === 0 ? (
                        <div className="text-center py-12 text-slate-500 text-sm border border-dashed border-slate-800 rounded-xl bg-slate-950/50">
                            <p className="mb-2">Belum ada permintaan review dari mahasiswa.</p>
                            <p className="text-xs text-slate-600">Mahasiswa dapat membuat permintaan dari halaman portfolio mereka.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredRequests.map((req) => (
                                <div key={req.id} className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4 hover:border-indigo-500/30 transition-colors">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center">
                                                <span className="font-semibold text-white">{req.menteeName && typeof req.menteeName === 'string' && req.menteeName.length > 0 ? req.menteeName.charAt(0) : '?'}</span>
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-white">Mahasiswa: {req.menteeName ?? 'Nama Tidak Tersedia'}</p>
                                                <p className="text-xs text-slate-400">Email: {req.menteeEmail}</p>
                                            </div>
                                        </div>
                                        <p className="text-xs text-slate-500">Tanggal permintaan: {new Date(req.createdAt).toLocaleString('id-ID')}</p>
                                        {req.notes && (
                                            <div className="mt-2 p-3 bg-slate-800/40 rounded-lg border border-amber-500/20">
                                                <p className="text-xs text-amber-300 mb-1">Catatan dari mahasiswa:</p>
                                                <p className="text-xs text-amber-100">"{req.notes}"</p>
                                            </div>
                                        )}
                                        {req.mentorFeedback && (
                                            <div className="mt-3 p-3 bg-slate-800/50 rounded-lg border border-emerald-500/20">
                                                <p className="text-xs font-semibold text-emerald-300 mb-1">Feedback Anda:</p>
                                                <p className="text-xs text-emerald-100">{req.mentorFeedback}</p>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide
                                            ${req.status === 'pending' ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30' :
                                              req.status === 'in_progress' ? 'bg-sky-500/10 text-sky-300 border border-sky-500/30' :
                                              'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'}`}
                                        >
                                            {req.status.replace('_', ' ')}
                                        </span>
                                        {req.paymentStatus && (
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide
                                                ${req.paymentStatus === 'approved'
                                                    ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                                                    : req.paymentStatus === 'rejected'
                                                        ? 'bg-red-500/10 text-red-300 border border-red-500/30'
                                                        : 'bg-slate-500/10 text-slate-300 border border-slate-800'}`}
                                            >
                                                {req.paymentStatus === 'approved'
                                                    ? 'Pembayaran Disetujui'
                                                    : req.paymentStatus === 'rejected'
                                                        ? 'Pembayaran Ditolak'
                                                        : 'Menunggu Verifikasi'}
                                            </span>
                                        )}
                                        <div className="w-full md:w-auto">
                                            <div className="text-xs text-slate-400 mb-1">
                                                <p>Nominal: Rp {req.paymentAmount?.toLocaleString('id-ID')}</p>
                                                {req.paymentBank && (
                                                    <p>Bank: {req.paymentBank} {req.paymentAccountName ? `- ${req.paymentAccountName}` : ''}</p>
                                                )}
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                <button
                                                    onClick={() => handleViewUserPortfolio(req)}
                                                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-500 transition border border-indigo-500"
                                                >
                                                    Lihat Profile
                                                </button>
                                                <a
                                                    href={req.portfolioUrl}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 text-slate-200 hover:bg-slate-700 transition border border-slate-700"
                                                >
                                                    Lihat Portfolio
                                                </a>
                                                <button
                                                    onClick={() => handleApprovePayment(req.id)}
                                                    disabled={req.paymentStatus === 'approved'}
                                                    className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/10 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    Setujui Pembayaran
                                                </button>
                                                <button
                                                    onClick={() => handleCompleteReview(req.id)}
                                                    disabled={req.status === 'completed' || req.paymentStatus !== 'approved'}
                                                    className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-sky-500/40 text-sky-300 hover:bg-sky-500/10 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    Tandai Selesai & Beri Feedback
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* User Portfolio Modal */}
            {selectedUserPortfolio && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
                    <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity" onClick={() => setSelectedUserPortfolio(null)}></div>
                    <div className="relative bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto transform transition-all">
                        <div className="sticky top-0 bg-slate-900 border-b border-slate-800 p-6 flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-bold text-white">{selectedUserPortfolio.menteeName}</h2>
                                <p className="text-sm text-slate-400 mt-1">{selectedUserPortfolio.menteeEmail}</p>
                            </div>
                            <button
                                onClick={() => setSelectedUserPortfolio(null)}
                                className="text-slate-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-slate-800"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                </svg>
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {loadingPortfolio ? (
                                <div className="flex items-center justify-center py-8">
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                                        <p className="text-slate-400 text-sm">Memuat portofolio...</p>
                                    </div>
                                </div>
                            ) : portfolioData ? (
                                <>
                                    {/* Projects Section */}
                                    <div>
                                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                            <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
                                            Proyek
                                        </h3>
                                        {portfolioData.projects && portfolioData.projects.length > 0 ? (
                                            <div className="grid gap-4">
                                                {portfolioData.projects.map((project: any) => (
                                                    <div key={project.id} className="bg-slate-950/60 border border-slate-800 rounded-lg p-4">
                                                        <div className="flex items-start gap-4">
                                                            {project.imageUrl && (
                                                                <img src={project.imageUrl} alt={project.title} className="w-20 h-20 rounded-lg object-cover flex-shrink-0" />
                                                            )}
                                                            <div className="flex-1">
                                                                <h4 className="font-bold text-white">{project.title}</h4>
                                                                <p className="text-sm text-slate-400 mt-1">{project.description}</p>
                                                                {project.link && (
                                                                    <a href={project.link} target="_blank" rel="noreferrer" className="text-xs text-blue-400 hover:text-blue-300 mt-2 inline-block">
                                                                        Lihat Proyek →
                                                                    </a>
                                                                )}
                                                                {project.tags && project.tags.length > 0 && (
                                                                    <div className="flex flex-wrap gap-2 mt-3">
                                                                        {project.tags.map((tag: string) => (
                                                                            <span key={tag} className="text-xs bg-slate-800 text-slate-300 px-2 py-1 rounded">
                                                                                {tag}
                                                                            </span>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="bg-slate-950/50 border border-dashed border-slate-800 rounded-lg p-6 text-center">
                                                <p className="text-slate-400 text-sm">Belum ada proyek yang ditambahkan</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Certificates Section */}
                                    <div>
                                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                            <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                            Sertifikat
                                        </h3>
                                        {portfolioData.certificates && portfolioData.certificates.length > 0 ? (
                                            <div className="grid gap-4">
                                                {portfolioData.certificates.map((cert: any) => (
                                                    <div key={cert.id} className="bg-slate-950/60 border border-slate-800 rounded-lg p-4">
                                                        <div className="flex items-start gap-4">
                                                            {cert.imageUrl && (
                                                                <img src={cert.imageUrl} alt={cert.title} className="w-20 h-20 rounded-lg object-cover flex-shrink-0" />
                                                            )}
                                                            <div className="flex-1">
                                                                <h4 className="font-bold text-white">{cert.title}</h4>
                                                                <p className="text-sm text-slate-400 mt-1">Dari: {cert.issuer}</p>
                                                                <p className="text-xs text-slate-500 mt-1">Tanggal: {cert.date}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="bg-slate-950/50 border border-dashed border-slate-800 rounded-lg p-6 text-center">
                                                <p className="text-slate-400 text-sm">Belum ada sertifikat yang ditambahkan</p>
                                            </div>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <div className="bg-slate-950/50 border border-dashed border-slate-800 rounded-lg p-8 text-center">
                                    <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-600">
                                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                    </div>
                                    <p className="text-slate-400 font-medium mb-2">Portofolio Kosong</p>
                                    <p className="text-sm text-slate-500">Pengguna belum menambahkan proyek atau sertifikat pada portofolionya.</p>
                                    <p className="text-xs text-slate-600 mt-3 italic">Namun Anda tetap dapat memberikan feedback berdasarkan profil dan informasi pembayaran yang tersedia.</p>
                                </div>
                            )}

                            {/* Payment Info Section */}
                            <div className="border-t border-slate-800 pt-6">
                                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                    <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                    Informasi Pembayaran
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-slate-400">Nominal:</span>
                                        <span className="font-semibold text-white">
                                            {selectedUserPortfolio.paymentAmount ? `Rp ${selectedUserPortfolio.paymentAmount.toLocaleString('id-ID')}` : '-'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-slate-400">Bank:</span>
                                        <span className="font-semibold text-white">{selectedUserPortfolio.paymentBank || '-'}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-slate-400">Nama Rekening:</span>
                                        <span className="font-semibold text-white">{selectedUserPortfolio.paymentAccountName || '-'}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-slate-400">Status Pembayaran:</span>
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide
                                            ${selectedUserPortfolio.paymentStatus === 'approved'
                                                ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                                                : selectedUserPortfolio.paymentStatus === 'rejected'
                                                    ? 'bg-red-500/10 text-red-300 border border-red-500/30'
                                                    : 'bg-slate-500/10 text-slate-300 border border-slate-800'}`}
                                        >
                                            {selectedUserPortfolio.paymentStatus === 'approved'
                                                ? 'Disetujui'
                                                : selectedUserPortfolio.paymentStatus === 'rejected'
                                                    ? 'Ditolak'
                                                    : 'Menunggu Verifikasi'}
                                        </span>
                                    </div>
                                    {selectedUserPortfolio.notes && (
                                        <div className="bg-slate-800/40 border border-amber-500/20 rounded-lg p-3 mt-4">
                                            <p className="text-xs text-amber-300 font-semibold mb-1">Catatan dari Pengguna:</p>
                                            <p className="text-sm text-slate-300">{selectedUserPortfolio.notes}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-slate-800 p-6 flex gap-3 bg-slate-950/50">
                            <button
                                onClick={() => window.open(selectedUserPortfolio.portfolioUrl, '_blank')}
                                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-semibold transition text-sm"
                            >
                                Buka Portofolio Lengkap
                            </button>
                            <button
                                onClick={() => setSelectedUserPortfolio(null)}
                                className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold transition text-sm"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MentorDashboard;