import { useParams } from 'react-router-dom';
import React, { useState, useRef, useEffect, useMemo } from 'react';
import SkillChart from '../components/SkillChart';
import ProjectCard from '../components/ProjectCard';
import CertificateCard from '../components/CertificateCard';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { usePortfolio } from '../contexts/PortfolioContext';
import { api } from '../services/api';
import ProjectEditModal from '../components/ProjectEditModal';
import CertificateEditModal from '../components/CertificateEditModal';
import { Project, Certificate, Skill, ReviewRequest } from '../types';
import { useAuth } from '../contexts/AuthContext';

const EditIcon = ({ className = "h-5 w-5" }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
        <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
        <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
    </svg>
);

interface AnalysisResult {
    category: string;
    score: number;
    feedback: string;
    colorClass: string;
}

const PortfolioPage: React.FC = () => {
    const { user, updateUser } = useAuth();
    
    const [isEditingBio, setIsEditingBio] = useState(false);
    const [editedBio, setEditedBio] = useState('');
    
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [editedTitle, setEditedTitle] = useState('');

    const [showReviewModal, setShowReviewModal] = useState(false);
    const [isRequestingReview, setIsRequestingReview] = useState(false);
    const [paymentBank, setPaymentBank] = useState('');
    const [paymentAccountName, setPaymentAccountName] = useState('');
    const [paymentAmount, setPaymentAmount] = useState('150000');
    const [paymentProofImage, setPaymentProofImage] = useState<string | null>(null);
    const [paymentNotes, setPaymentNotes] = useState('');
    const [myReviewRequests, setMyReviewRequests] = useState<ReviewRequest[]>([]);
    const [isLoadingReviews, setIsLoadingReviews] = useState(false);

    const avatarInputRef = useRef<HTMLInputElement>(null);
    
    useEffect(() => {
        if (user) {
            setEditedBio(user.bio);
            setEditedTitle(user.title);
        }
    }, [user]);

    const { 
        projects, 
        certificates,
        skills, 
        updateProject,
        deleteProject,
        updateCertificate,
        deleteCertificate 
    } = usePortfolio();

    const [editingProject, setEditingProject] = useState<Project | null>(null);
    const [editingCertificate, setEditingCertificate] = useState<Certificate | null>(null);

    useEffect(() => {
        if (!user) return;
        setIsLoadingReviews(true);
        api.getReviewRequests()
            .then((requests) => {
                const mine = requests.filter(req => req.menteeEmail === user.email);
                setMyReviewRequests(mine);
            })
            .catch((error) => {
                console.error('Failed to load review requests for user', error);
            })
            .finally(() => {
                setIsLoadingReviews(false);
            });
    }, [user]);

    // Generate Analysis based on Assessment Skills
    const assessmentAnalysis = useMemo(() => {
        const relevantCategories = ['Soft Skills', 'Digital Skills', 'Workplace Readiness'];
        const analysisResults: AnalysisResult[] = [];

        skills.forEach(skill => {
            if (relevantCategories.includes(skill.name)) {
                let feedback = '';
                let colorClass = 'text-slate-400';

                if (skill.name === 'Soft Skills') {
                    if (skill.level >= 80) {
                        feedback = "Kemampuan komunikasi dan interpersonal sangat baik.";
                        colorClass = "text-emerald-400";
                    } else if (skill.level >= 60) {
                        feedback = "Interaksi cukup baik, tingkatkan negosiasi.";
                        colorClass = "text-amber-400";
                    } else {
                        feedback = "Perlu pengembangan komunikasi tim.";
                        colorClass = "text-red-400";
                    }
                } else if (skill.name === 'Digital Skills') {
                      if (skill.level >= 80) {
                        feedback = "Sangat mahir dalam ekosistem digital.";
                        colorClass = "text-emerald-400";
                    } else if (skill.level >= 60) {
                        feedback = "Cukup familiar dengan teknologi dasar.";
                        colorClass = "text-amber-400";
                    } else {
                        feedback = "Literasi digital perlu ditingkatkan.";
                        colorClass = "text-red-400";
                    }
                } else if (skill.name === 'Workplace Readiness') {
                      if (skill.level >= 80) {
                        feedback = "Mentalitas profesional sangat matang.";
                        colorClass = "text-emerald-400";
                    } else if (skill.level >= 60) {
                        feedback = "Etos kerja terbentuk, tingkatkan inisiatif.";
                        colorClass = "text-amber-400";
                    } else {
                        feedback = "Perlu adaptasi budaya kerja.";
                        colorClass = "text-red-400";
                    }
                }

                analysisResults.push({
                    category: skill.name,
                    score: skill.level,
                    feedback,
                    colorClass
                });
            }
        });

        return analysisResults;
    }, [skills]);

    const toBase64 = (url: string): Promise<string | ArrayBuffer | null> => fetch(url)
        .then(response => response.blob())
        .then(blob => new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        }));

    const handleDownloadPdf = async () => {
        if (!user) return;
        const doc = new jsPDF();
        
        doc.setProperties({
            title: `${user.name}'s Portfolio`,
            author: 'VinixPort',
        });

        try {
            const avatarBase64 = await toBase64(user.avatarUrl) as string;
            const imageFormat = avatarBase64.startsWith('data:image/png') ? 'PNG' : 'JPEG';
            doc.addImage(avatarBase64, imageFormat, 20, 20, 30, 30);
        } catch (error) {
            console.error("Could not add avatar to PDF:", error);
        }
        
        doc.setFontSize(28);
        doc.setFont('helvetica', 'bold');
        doc.text(user.name, 60, 30);
        
        doc.setFontSize(16);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(80, 80, 80);
        doc.text(user.title, 60, 40);
        doc.setDrawColor(200);
        doc.line(20, 55, 190, 55);

        // Bio
        doc.setFontSize(12);
        doc.setTextColor(40, 40, 40);
        const bioText = doc.splitTextToSize(user.bio, 170);
        doc.text(bioText, 20, 65);
        
        const bioDimensions = doc.getTextDimensions(bioText);
        let currentY = 65 + bioDimensions.h;

        // Skills
        autoTable(doc, {
            startY: currentY + 10,
            head: [['Skills', 'Proficiency']],
            body: skills.map(skill => [skill.name, `${skill.level}%`]),
        });

        let lastY = (doc as any).lastAutoTable.finalY;

        // Projects
        if (projects.length > 0) {
            autoTable(doc, {
                startY: lastY + 10,
                head: [['Project', 'Description']],
                body: projects.map(p => [p.title, p.description]),
            });
            lastY = (doc as any).lastAutoTable.finalY;
        }
        
        // Certificates
        if (certificates.length > 0) {
             autoTable(doc, {
                startY: lastY + 10,
                head: [['Certificate', 'Issuer', 'Date']],
                body: certificates.map(c => [c.title, c.issuer, c.date]),
            });
        }
        
        doc.save(`${user.name.replace(/\s/g, '_')}_Portfolio.pdf`);
    };

    const handleSaveBio = () => {
        updateUser({ bio: editedBio });
        setIsEditingBio(false);
    };

    const handleSaveTitle = () => {
        updateUser({ title: editedTitle });
        setIsEditingTitle(false);
    };
    
    const handleRequestReview = async () => {
        if (!user) return;
        if (!paymentAmount) {
            alert('Nominal transfer wajib diisi.');
            return;
        }
        setIsRequestingReview(true);
        try {
            const newRequest = await api.createReviewRequest({
                menteeName: user.name,
                menteeEmail: user.email,
                portfolioUrl: window.location.origin + '/#/portfolio',
                notes: paymentNotes,
                paymentAmount: Number(paymentAmount),
                paymentBank,
                paymentAccountName,
                paymentProofImage,
            });
            setMyReviewRequests(prev => [newRequest, ...prev]);
            alert('Permintaan review berhasil dikirim ke mentor.');
            setShowReviewModal(false);
            setPaymentBank('');
            setPaymentAccountName('');
            setPaymentAmount('150000');
            setPaymentProofImage(null);
            setPaymentNotes('');
        } catch (error) {
            console.error('Failed to create review request', error);
            alert('Gagal mengirim permintaan review. Coba lagi.');
        } finally {
            setIsRequestingReview(false);
        }
    };

    const handlePaymentProofChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                setPaymentProofImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                updateUser({ avatarUrl: base64String });
            };
            reader.readAsDataURL(file);
        }
    };

    const triggerAvatarUpload = () => {
        avatarInputRef.current?.click();
    };

    const shareUrl = user ? `${window.location.origin}/u/${user.name.replace(/\s+/g, '').toLowerCase()}` : '';
    const shareText = `Check out my professional portfolio on VinixPort!`;
    const latestReviewRequest = myReviewRequests[0];

    const handleShare = (platform: 'twitter' | 'linkedin' | 'whatsapp') => {
        let url = '';
        switch(platform) {
            case 'twitter':
                url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
                break;
            case 'linkedin':
                url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
                break;
            case 'whatsapp':
                url = `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`;
                break;
        }
        window.open(url, '_blank');
    };

    if (!user) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-200">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="animate-pulse">Loading portfolio...</p>
                </div>
            </div>
        );
    }

    return (
        // KUNCI PERBAIKAN: pt-28 memberi ruang agar header tidak tertutup navbar
        <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-blue-500 selection:text-white pt-28 pb-12 px-4 relative overflow-hidden">
            
            {/* Background Effects */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                <div className="absolute -top-[10%] -left-[10%] w-[60%] h-[60%] rounded-full bg-blue-600/10 blur-[100px]"></div>
                <div className="absolute bottom-[10%] right-[10%] w-[40%] h-[40%] rounded-full bg-purple-600/10 blur-[80px]"></div>
            </div>

            <div className="container mx-auto px-4 md:px-6 relative z-10">
                
                {/* Profile Header Card */}
                <div className="bg-slate-900/60 backdrop-blur-2xl border border-slate-800 shadow-2xl rounded-2xl overflow-hidden mb-8 relative group">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 opacity-50"></div>
                    
                    <div className="h-40 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
                         <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] opacity-30"></div>
                         <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-900/90"></div>
                    </div>
                    
                    <div className="px-8 pb-8">
                        <div className="flex flex-col md:flex-row items-start md:items-end -mt-16 gap-6">
                            <div className="relative group/avatar">
                                <div className="absolute -inset-1 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full opacity-50 blur group-hover/avatar:opacity-100 transition duration-500"></div>
                                <img className="relative w-32 h-32 rounded-full border-4 border-slate-900 bg-slate-950 object-cover shadow-xl" src={user.avatarUrl} alt={user.name} />
                                <button 
                                    onClick={triggerAvatarUpload}
                                    className="absolute inset-0 rounded-full flex items-center justify-center bg-black/50 opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-200 z-20"
                                    title="Change Avatar"
                                >
                                    <EditIcon className="w-8 h-8 text-white" />
                                </button>
                                <input type="file" ref={avatarInputRef} onChange={handleAvatarChange} className="hidden" accept="image/*" />
                            </div>
                            
                            <div className="flex-1 w-full">
                                <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
                                    <div>
                                        <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-1">{user.name}</h1>
                                        {isEditingTitle ? (
                                             <div className="flex items-center gap-2 mt-2">
                                                <input
                                                    type="text"
                                                    value={editedTitle}
                                                    onChange={(e) => setEditedTitle(e.target.value)}
                                                    className="bg-slate-950 border border-slate-700 text-white px-3 py-1.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-lg"
                                                    autoFocus
                                                />
                                                <button onClick={handleSaveTitle} className="text-sm bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg font-bold transition">Save</button>
                                                <button onClick={() => setIsEditingTitle(false)} className="text-sm text-slate-400 hover:text-white transition">Cancel</button>
                                             </div>
                                        ) : (
                                            <div className="flex items-center gap-2 group/title cursor-pointer mt-1" onClick={() => setIsEditingTitle(true)}>
                                                <p className="text-lg text-blue-400 font-medium">{user.title}</p>
                                                <EditIcon className="w-4 h-4 text-slate-600 opacity-0 group-hover/title:opacity-100 transition-opacity" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex gap-3">
                                        <button 
                                            onClick={handleDownloadPdf}
                                            className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 text-white rounded-xl transition-all text-sm font-bold shadow-lg"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                                            Download CV
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Grid Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Left Sidebar */}
                    <div className="lg:col-span-1 space-y-6">
                        
                        {/* Premium Mentor Card */}
                        <div className="relative bg-gradient-to-br from-indigo-950 to-slate-900 border border-indigo-500/30 p-6 rounded-2xl overflow-hidden group hover:border-indigo-500/60 transition-all shadow-lg">
                             <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
                             <div className="relative z-10">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 bg-indigo-500/20 border border-indigo-500/30 rounded-lg text-indigo-300">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white text-lg leading-tight">Expert Review</h3>
                                        <p className="text-xs text-indigo-300">Premium Feature</p>
                                    </div>
                                </div>
                                <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                                    Dapatkan feedback profesional dari HR dan Senior Developer untuk kualitas portofolio maksimal.
                                </p>
                                <button 
                                    onClick={() => setShowReviewModal(true)}
                                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-900/20 transition-all transform hover:-translate-y-0.5 text-sm flex items-center justify-center gap-2"
                                >
                                    Review Sekarang
                                </button>
                             </div>
                        </div>

                        {isLoadingReviews ? (
                            <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl p-4 text-sm text-slate-400">
                                Memuat status review...
                            </div>
                        ) : latestReviewRequest ? (
                            <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl p-5 text-sm">
                                <h3 className="text-sm font-bold text-white mb-1">Status Premium Review</h3>
                                <p className="text-xs text-slate-500 mb-2">Terakhir update: {new Date(latestReviewRequest.createdAt).toLocaleString()}</p>
                                <p className="text-xs text-slate-300">
                                    Status pembayaran: <span className="font-semibold">
                                        {latestReviewRequest.paymentStatus === 'approved'
                                            ? 'Disetujui'
                                            : latestReviewRequest.paymentStatus === 'rejected'
                                                ? 'Ditolak'
                                                : 'Menunggu verifikasi'}
                                    </span>
                                </p>
                                <p className="text-xs text-slate-300 mt-1">
                                    Status review: <span className="font-semibold">{latestReviewRequest.status.replace('_', ' ')}</span>
                                </p>
                                {typeof latestReviewRequest.paymentAmount !== 'undefined' && (
                                    <p className="text-xs text-slate-400 mt-1">
                                        Nominal: Rp {latestReviewRequest.paymentAmount?.toLocaleString('id-ID')}
                                    </p>
                                )}
                                {latestReviewRequest.mentorFeedback && (
                                    <p className="text-xs text-slate-400 mt-2">
                                        Feedback mentor: {latestReviewRequest.mentorFeedback}
                                    </p>
                                )}
                            </div>
                        ) : null}

                        {/* About Me */}
                        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl p-6">
                             <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-bold text-white">About Me</h3>
                                <button onClick={() => setIsEditingBio(!isEditingBio)} className="text-slate-500 hover:text-blue-400 transition-colors p-1 rounded hover:bg-slate-800">
                                    <EditIcon />
                                </button>
                             </div>
                             {isEditingBio ? (
                                 <div className="space-y-3">
                                     <textarea 
                                        value={editedBio}
                                        onChange={(e) => setEditedBio(e.target.value)}
                                        rows={6}
                                        className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-sm text-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none leading-relaxed"
                                     />
                                     <div className="flex gap-2 justify-end">
                                         <button onClick={() => { setIsEditingBio(false); setEditedBio(user.bio); }} className="text-xs text-slate-400 hover:text-white px-3 py-1.5">Cancel</button>
                                         <button onClick={handleSaveBio} className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-4 py-1.5 rounded-lg font-bold">Save</button>
                                     </div>
                                 </div>
                             ) : (
                                 <p className="text-slate-400 text-sm leading-relaxed whitespace-pre-line">
                                     {user.bio || "No bio yet. Click edit to add one."}
                                 </p>
                             )}
                        </div>

                        {/* Share Buttons */}
                        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl p-6">
                             <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Share Portfolio</h3>
                             <div className="grid grid-cols-3 gap-3">
                                <button onClick={() => handleShare('linkedin')} className="group flex items-center justify-center py-3 bg-[#0077b5]/10 hover:bg-[#0077b5] border border-[#0077b5]/20 hover:border-[#0077b5] rounded-xl transition-all duration-300">
                                    <svg className="w-5 h-5 text-[#0077b5] group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                                </button>
                                <button onClick={() => handleShare('twitter')} className="group flex items-center justify-center py-3 bg-white/5 hover:bg-white border border-white/10 hover:border-white rounded-xl transition-all duration-300">
                                    <svg className="w-5 h-5 text-white group-hover:text-black transition-colors" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                                </button>
                                <button onClick={() => handleShare('whatsapp')} className="group flex items-center justify-center py-3 bg-[#25D366]/10 hover:bg-[#25D366] border border-[#25D366]/20 hover:border-[#25D366] rounded-xl transition-all duration-300">
                                    <svg className="w-5 h-5 text-[#25D366] group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                                </button>
                             </div>
                        </div>
                    </div>

                    {/* Right Content */}
                    <div className="lg:col-span-2 space-y-8">
                        
                        {/* Skills Section */}
                        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl p-8 shadow-lg">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="p-2 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                                    <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                                </div>
                                <h2 className="text-xl font-bold text-white">Skills & Assessment</h2>
                            </div>
                            
                            <div className="mb-8">
                                <SkillChart data={skills} />
                            </div>
                            
                            <div className="space-y-4">
                                {assessmentAnalysis.length > 0 ? (
                                    assessmentAnalysis.map((item) => (
                                        <div key={item.category} className="bg-slate-950 border border-slate-800/50 p-5 rounded-xl flex flex-col gap-2 hover:border-slate-700 transition-colors">
                                            <div className="flex justify-between items-center">
                                                <span className="text-slate-200 font-bold tracking-wide">{item.category}</span>
                                                <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                                                    item.score >= 80 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 
                                                    item.score >= 60 ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 
                                                    'bg-red-500/10 text-red-400 border border-red-500/20'
                                                }`}>
                                                    {item.score}%
                                                </span>
                                            </div>
                                            <p className={`text-sm ${item.colorClass} leading-relaxed`}>
                                                {item.feedback}
                                            </p>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-10 bg-slate-950/50 rounded-xl border border-dashed border-slate-800">
                                        <p className="text-slate-400 mb-2 font-medium">Belum ada data asesmen.</p>
                                        <p className="text-sm text-slate-500">Selesaikan asesmen untuk melihat analisis keahlianmu.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Projects Section */}
                        <div>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                                    <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
                                </div>
                                <h2 className="text-xl font-bold text-white">Featured Projects</h2>
                            </div>
                            
                            {projects.length === 0 ? (
                                <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl p-12 text-center">
                                    <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-600">
                                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                                    </div>
                                    <p className="text-slate-400 font-medium">Belum ada proyek.</p>
                                    <p className="text-sm text-slate-500 mt-1">Mulai bangun portofoliomu sekarang.</p>
                                </div>
                            ) : (
                                <div className="grid md:grid-cols-2 gap-6">
                                    {projects.map(project => (
                                        <ProjectCard 
                                            key={project.id} 
                                            project={project} 
                                            onEdit={() => setEditingProject(project)} 
                                            onDelete={() => deleteProject(project.id)} 
                                        />
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Certificates Section */}
                        <div>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                                    <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                </div>
                                <h2 className="text-xl font-bold text-white">Certificates</h2>
                            </div>

                             {certificates.length === 0 ? (
                                <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl p-12 text-center">
                                    <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-600">
                                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z"></path></svg>
                                    </div>
                                    <p className="text-slate-400 font-medium">Belum ada sertifikat.</p>
                                </div>
                            ) : (
                                <div className="grid md:grid-cols-2 gap-4">
                                    {certificates.map(cert => (
                                        <CertificateCard key={cert.id} certificate={cert} onEdit={() => setEditingCertificate(cert)} onDelete={() => deleteCertificate(cert.id)} />
                                    ))}
                                </div>
                            )}
                        </div>

                    </div>
                </div>
            </div>

            {/* Modals */}
            <ProjectEditModal
                project={editingProject}
                onClose={() => setEditingProject(null)}
                onSave={updateProject}
            />
            <CertificateEditModal
                certificate={editingCertificate}
                onClose={() => setEditingCertificate(null)}
                onSave={updateCertificate}
            />

            {/* Payment / Review Modal - Styled for Dark Mode */}
            {showReviewModal && (
                <div className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto">
                    <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity" onClick={() => setShowReviewModal(false)}></div>
                    <div className="relative bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto transform transition-all scale-100 mt-10 mb-10">
                        <div className="p-8 text-center">
                             <div className="mx-auto w-16 h-16 bg-indigo-500/10 rounded-full flex items-center justify-center mb-6 text-indigo-400 border border-indigo-500/20">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                             </div>
                             <h3 className="text-2xl font-bold text-white mb-2">Unlock Premium Review</h3>
                             <p className="text-slate-400 mb-8 text-sm leading-relaxed">
                                 Hubungkan portofoliomu dengan mentor expert untuk mendapatkan feedback yang bisa mengubah karirmu.
                             </p>
                             
                             <div className="bg-slate-950 rounded-xl p-5 border border-slate-800 mb-8 text-left">
                                 <div className="flex justify-between mb-3 text-sm">
                                     <span className="text-slate-400">CV Audit</span>
                                     <span className="text-emerald-400 font-medium flex items-center gap-1">
                                         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                         Included
                                     </span>
                                 </div>
                                 <div className="flex justify-between mb-3 text-sm">
                                     <span className="text-slate-400">1-on-1 Chat</span>
                                     <span className="text-emerald-400 font-medium flex items-center gap-1">
                                         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                         Included
                                     </span>
                                 </div>
                                 <div className="border-t border-slate-800 my-4"></div>
                                 <div className="flex justify-between items-center">
                                     <span className="text-white font-bold">Total</span>
                                     <span className="text-2xl font-bold text-white">Rp 150.000</span>
                                 </div>
                             </div>

                             <div className="bg-slate-950 rounded-xl p-5 border border-slate-800 mb-8 text-left space-y-4">
                                 <div>
                                     <label className="block text-xs font-semibold text-slate-400 mb-1">Bank Pengirim</label>
                                     <input
                                         type="text"
                                         value={paymentBank}
                                         onChange={(e) => setPaymentBank(e.target.value)}
                                         className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                     />
                                 </div>
                                 <div>
                                     <label className="block text-xs font-semibold text-slate-400 mb-1">Nama Pemilik Rekening</label>
                                     <input
                                         type="text"
                                         value={paymentAccountName}
                                         onChange={(e) => setPaymentAccountName(e.target.value)}
                                         className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                     />
                                 </div>
                                 <div>
                                     <label className="block text-xs font-semibold text-slate-400 mb-1">Nominal Transfer</label>
                                     <input
                                         type="number"
                                         value={paymentAmount}
                                         onChange={(e) => setPaymentAmount(e.target.value)}
                                         className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                     />
                                 </div>
                                 <div>
                                     <label className="block text-xs font-semibold text-slate-400 mb-1">Bukti Transfer</label>
                                     <input
                                         type="file"
                                         accept="image/*"
                                         onChange={handlePaymentProofChange}
                                         className="block w-full text-xs text-slate-400 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500"
                                     />
                                     {paymentProofImage && (
                                         <p className="mt-2 text-xs text-emerald-400">Bukti transfer sudah diunggah.</p>
                                     )}
                                 </div>
                                 <div>
                                     <label className="block text-xs font-semibold text-slate-400 mb-1">Catatan untuk Mentor (opsional)</label>
                                     <textarea
                                         value={paymentNotes}
                                         onChange={(e) => setPaymentNotes(e.target.value)}
                                         rows={3}
                                         className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                                     />
                                 </div>
                             </div>

                             <div className="flex gap-3">
                                <button onClick={() => setShowReviewModal(false)} className="flex-1 py-3.5 border border-slate-700 rounded-xl text-slate-400 font-bold hover:bg-slate-800 hover:text-white transition-all text-sm">
                                    Nanti Saja
                                </button>
                                <button 
                                   onClick={handleRequestReview}
                                   disabled={isRequestingReview}
                                   className={`flex-1 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow-lg shadow-indigo-900/30 transition-all text-sm hover:-translate-y-0.5 ${isRequestingReview ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    {isRequestingReview ? 'Loading...' : 'Bayar Sekarang'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PortfolioPage;