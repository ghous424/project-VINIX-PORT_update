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

const AnalyticsPage: React.FC = () => {
    const { projects, certificates } = usePortfolio();
    const { user } = useAuth();
    const [reviewRequests, setReviewRequests] = useState<ReviewRequest[]>([]);

    const isMentor = user?.role === 'mentor';

    const handleApprovePayment = async (id: number) => {
        try {
            await api.updateReviewRequestStatus(id, 'in_progress', { paymentStatus: 'approved' });
            setReviewRequests(prev =>
                prev.map(req => req.id === id ? { ...req, status: 'in_progress', paymentStatus: 'approved' } : req)
            );
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
        } catch (error) {
            console.error('Failed to complete review', error);
            alert('Gagal menyelesaikan review. Coba lagi.');
        }
    };

    useEffect(() => {
        if (isMentor) {
            api.getReviewRequests()
                .then(setReviewRequests)
                .catch(err => console.error('Failed to load review requests', err));
        }
    }, [isMentor]);

    const totalRequests = useMemo(() => reviewRequests.length, [reviewRequests]);
    const pendingRequests = useMemo(
        () => reviewRequests.filter(r => r.status === 'pending').length,
        [reviewRequests]
    );

    const contentData = useMemo(() => [
        { name: 'Projects', count: projects.length, color: '#3B82F6' },
        { name: 'Certificates', count: certificates.length, color: '#10B981' }
    ], [projects.length, certificates.length]);

    return (
        <div className="min-h-screen bg-slate-950 font-sans selection:bg-blue-500 selection:text-white pt-28 pb-12 px-4 relative overflow-hidden">
            
            {/* Background Effects */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                <div className="absolute -top-[10%] -left-[10%] w-[60%] h-[60%] rounded-full bg-blue-600/10 blur-[100px]"></div>
                <div className="absolute bottom-[10%] right-[10%] w-[40%] h-[40%] rounded-full bg-purple-600/10 blur-[80px]"></div>
            </div>

            <div className="relative z-10 container mx-auto max-w-5xl">
                
                {isMentor ? (
                    <>
                        <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
                            <div>
                                <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-2">Mentor Dashboard</h1>
                                <p className="text-slate-400">Kelola permintaan review portofolio dari peserta.</p>
                            </div>
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-bold uppercase tracking-wide">
                                <span className="relative flex h-2 w-2">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                                </span>
                                Mentor Mode
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            <StatCard 
                                title="Total Requests"
                                value={totalRequests.toString()}
                                subtext="Semua permintaan review yang diterima"
                                colorClass="bg-indigo-500"
                                gradient="bg-gradient-to-br from-indigo-500 to-purple-600"
                                icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7h18M3 12h18M3 17h18"></path></svg>}
                            />
                            <StatCard 
                                title="Pending Reviews"
                                value={pendingRequests.toString()}
                                subtext="Menunggu tindakan Anda"
                                colorClass="bg-amber-500"
                                gradient="bg-gradient-to-br from-amber-500 to-orange-600"
                                icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M12 2a10 10 0 100 20 10 10 0 000-20z"></path></svg>}
                            />
                        </div>

                        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl p-8 shadow-xl">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-xl font-bold text-white">Review Requests</h2>
                                    <p className="text-sm text-slate-500 mt-1">Daftar permintaan review terbaru dari peserta.</p>
                                </div>
                            </div>

                            {reviewRequests.length === 0 ? (
                                <div className="text-center py-12 text-slate-500 text-sm border border-dashed border-slate-800 rounded-xl bg-slate-950/50">
                                    <p className="mb-2">Belum ada permintaan review.</p>
                                    <p className="text-xs text-slate-600">Peserta dapat membuat permintaan dari halaman portfolio mereka.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {reviewRequests.map((req) => (
                                        <div key={req.id} className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4 hover:border-indigo-500/30 transition-colors">
                                            <div>
                                                <p className="text-sm font-semibold text-white">{req.menteeName}</p>
                                                <p className="text-xs text-slate-400">{req.menteeEmail}</p>
                                                <p className="text-xs text-slate-500 mt-1">{new Date(req.createdAt).toLocaleString()}</p>
                                                {req.notes && (
                                                    <p className="text-xs text-slate-400 mt-2">
                                                        Catatan dari mahasiswa: {req.notes}
                                                    </p>
                                                )}
                                                {req.mentorFeedback && (
                                                    <p className="text-xs text-emerald-400 mt-1">
                                                        Feedback Anda: {req.mentorFeedback}
                                                    </p>
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
                                                                : 'bg-slate-500/10 text-slate-300 border border-slate-500/30'}`}
                                                    >
                                                        {req.paymentStatus === 'approved'
                                                            ? 'Payment Approved'
                                                            : req.paymentStatus === 'rejected'
                                                                ? 'Payment Rejected'
                                                                : 'Waiting Verification'}
                                                    </span>
                                                )}
                                                {typeof req.paymentAmount !== 'undefined' && (
                                                    <div className="text-xs text-slate-400">
                                                        <p>Nominal: Rp {req.paymentAmount?.toLocaleString('id-ID')}</p>
                                                        {req.paymentBank && (
                                                            <p>Bank: {req.paymentBank} {req.paymentAccountName ? `- ${req.paymentAccountName}` : ''}</p>
                                                        )}  
                                                    </div>
                                                )}
                                                <div className="flex items-center gap-2 flex-wrap">
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
                                                        Tandai Selesai
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <>
                        <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
                            <div>
                                <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-2">Portfolio Analytics</h1>
                                <p className="text-slate-400">Ringkasan performa dan distribusi konten portofoliomu.</p>
                            </div>
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wide">
                                <span className="relative flex h-2 w-2">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                </span>
                                Live Data
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            <StatCard 
                                title="Total Projects"
                                value={projects.length.toString()}
                                subtext="Proyek aktif yang ditampilkan"
                                colorClass="bg-blue-500"
                                gradient="bg-gradient-to-br from-blue-500 to-blue-700"
                                icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>}
                            />

                            <StatCard 
                                title="Total Certificates"
                                value={certificates.length.toString()}
                                subtext="Sertifikat & lisensi terverifikasi"
                                colorClass="bg-emerald-500"
                                gradient="bg-gradient-to-br from-emerald-500 to-teal-600"
                                icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>}
                            />
                        </div>

                        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl p-8 shadow-xl">
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h2 className="text-xl font-bold text-white">Content Overview</h2>
                                    <p className="text-sm text-slate-500 mt-1">Perbandingan jumlah konten dalam portofolio</p>
                                </div>
                                <div className="flex gap-4 text-xs font-medium text-slate-400">
                                     <div className="flex items-center gap-2">
                                         <span className="w-3 h-3 rounded-full bg-blue-500"></span> Projects
                                     </div>
                                     <div className="flex items-center gap-2">
                                         <span className="w-3 h-3 rounded-full bg-emerald-500"></span> Certificates
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
                                        <Bar dataKey="count" name="Total Items" radius={[8, 8, 0, 0]}>
                                            {contentData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                            
                            <div className="mt-6 pt-6 border-t border-slate-800 flex justify-center">
                                <p className="text-slate-500 text-sm flex items-center gap-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                    Data diperbarui secara real-time saat Anda mengunggah konten baru.
                                </p>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default AnalyticsPage;