import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePortfolio } from '../contexts/PortfolioContext';
import { useAuth } from '../contexts/AuthContext';

type UploadType = 'project' | 'certificate';

const UploadPage: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [uploadType, setUploadType] = useState<UploadType>('project');
    
    // Shared field
    const [title, setTitle] = useState('');

    // Project fields
    const [description, setDescription] = useState('');
    const [link, setLink] = useState('');
    const [tags, setTags] = useState('');

    // Certificate fields
    const [issuer, setIssuer] = useState('');
    const [date, setDate] = useState('');

    const [uploadStatus, setUploadStatus] = useState('');
    const navigate = useNavigate();
    const { user } = useAuth();
    const { addProject, addCertificate } = usePortfolio();

    // --- [UPDATE 1] Validasi saat klik tombol upload ---
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];

            // Cek Ukuran File (Maksimal 2MB)
            if (selectedFile.size > 2 * 1024 * 1024) {
                alert("File terlalu besar! Maksimal 2MB agar upload berhasil.");
                e.target.value = ''; // Reset input agar user bisa pilih ulang
                return;
            }

            setFile(selectedFile);
        }
    };

    const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    };

    // --- [UPDATE 2] Validasi saat Drag & Drop ---
    const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const droppedFile = e.dataTransfer.files[0];

            // Cek Ukuran File (Maksimal 2MB)
            if (droppedFile.size > 3 * 1024 * 1024) {
                alert("File terlalu besar! Maksimal 3MB agar upload berhasil.");
                return;
            }

            setFile(droppedFile);
            e.dataTransfer.clearData();
        }
    }, []);

    const convertToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = error => reject(error);
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) {
            setUploadStatus('Please select an image or file to upload.');
            return;
        }
        
        if (!user || !(user as any).id) {
            setUploadStatus('Error: User not authenticated. Please login again.');
            return;
        }

        setUploadStatus('Uploading...');

        try {
            const imageUrl = await convertToBase64(file);

            if (uploadType === 'project') {
                await addProject({
                    title,
                    description,
                    imageUrl,
                    link,
                    tags: tags.split(',').map(tag => tag.trim()).filter(Boolean),
                });
                console.log('Project added successfully');
            } else {
                await addCertificate({
                    title,
                    issuer,
                    date,
                    imageUrl, // In real app, this might be a PDF url
                });
                console.log('Certificate added successfully');
            }

            setUploadStatus(`Successfully uploaded! Redirecting...`);
            
            setTimeout(() => {
                navigate('/portfolio');
            }, 1500);
        } catch (error) {
            setUploadStatus('Error processing file. Please try again.');
            console.error('Upload failed with error:', error);
        }
    };
    
    return (
        <div className="min-h-screen bg-slate-950 font-sans selection:bg-blue-500 selection:text-white pt-28 pb-12 px-4 relative overflow-hidden">
            
            {/* Background Effects */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                <div className="absolute top-0 left-1/3 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-0 right-1/3 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[100px]"></div>
            </div>

            <div className="relative z-10 container mx-auto max-w-3xl">
                
                <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 shadow-2xl rounded-2xl p-8 md:p-10 relative overflow-hidden">
                    {/* Top Glow Line */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 opacity-50"></div>

                    <h1 className="text-3xl font-bold mb-2 text-center text-white tracking-tight">Upload Content</h1>
                    <p className="text-center text-slate-400 mb-8">Showcase your best work or achievements.</p>
                    
                    <form onSubmit={handleSubmit} className="space-y-8">
                        
                        {/* Toggle Tabs */}
                        <div className="flex justify-center">
                            <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 inline-flex">
                                <button
                                    type="button"
                                    onClick={() => setUploadType('project')}
                                    className={`px-6 py-2.5 text-sm font-bold rounded-lg transition-all ${
                                        uploadType === 'project' 
                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
                                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                                    }`}
                                >
                                    Project
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setUploadType('certificate')}
                                    className={`px-6 py-2.5 text-sm font-bold rounded-lg transition-all ${
                                        uploadType === 'certificate' 
                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
                                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                                    }`}
                                >
                                    Certificate
                                </button>
                            </div>
                        </div>

                        {/* Drag & Drop Area */}
                        <div>
                            <label className="block mb-3 text-sm font-medium text-slate-300">
                                {uploadType === 'project' ? 'Project Cover Image' : 'Certificate File (Image/Scan)'}
                            </label>
                            <div
                                onDragEnter={handleDragEnter}
                                onDragLeave={handleDragLeave}
                                onDragOver={handleDragOver}
                                onDrop={handleDrop}
                                className={`relative group flex justify-center items-center w-full h-64 px-4 transition-all duration-300 border-2 border-dashed rounded-xl cursor-pointer
                                ${isDragging 
                                    ? 'border-blue-500 bg-blue-500/10' 
                                    : 'border-slate-700 bg-slate-950/50 hover:border-blue-500/50 hover:bg-slate-900'
                                }`}
                            >
                                 <label htmlFor="file-upload" className="w-full h-full flex flex-col justify-center items-center cursor-pointer">
                                    <input id="file-upload" type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
                                    
                                    {file ? (
                                        <div className="text-center relative z-10">
                                            <div className="w-16 h-16 mx-auto mb-3 bg-blue-500/20 text-blue-400 rounded-xl flex items-center justify-center border border-blue-500/30">
                                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                            </div>
                                            <p className="text-sm font-medium text-white">{file.name}</p>
                                            <p className="text-xs text-slate-500 mt-1">Click to change file</p>
                                        </div>
                                    ) : (
                                        <div className="text-center">
                                            <div className="w-16 h-16 mx-auto mb-3 bg-slate-800 text-slate-400 rounded-xl flex items-center justify-center group-hover:text-blue-400 group-hover:bg-blue-500/10 group-hover:border-blue-500/30 border border-slate-700 transition-all">
                                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                                            </div>
                                            <p className="text-sm text-slate-300">
                                                <span className="font-bold text-blue-400 hover:underline">Click to upload</span> or drag and drop
                                            </p>
                                            <p className="text-xs text-slate-500 mt-2">SVG, PNG, JPG or GIF (MAX. 2MB)</p>
                                        </div>
                                    )}
                                </label>
                            </div>
                        </div>
                        
                        {/* Dynamic Fields */}
                        <div className="space-y-5 animate-fade-in-up">
                            {uploadType === 'project' ? (
                                <>
                                    <div>
                                        <label htmlFor="title" className="block mb-2 text-sm font-medium text-slate-300">Project Title</label>
                                        <input type="text" id="title" value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder-slate-600" placeholder="e.g. E-Commerce Redesign" required />
                                    </div>
                                    <div>
                                        <label htmlFor="description" className="block mb-2 text-sm font-medium text-slate-300">Description</label>
                                        <textarea id="description" rows={4} value={description} onChange={e => setDescription(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder-slate-600 resize-none" placeholder="Describe your project..." required></textarea>
                                    </div>
                                     <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div>
                                            <label htmlFor="link" className="block mb-2 text-sm font-medium text-slate-300">Project Link</label>
                                            <input type="url" id="link" value={link} onChange={e => setLink(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder-slate-600" placeholder="https://github.com/..." />
                                        </div>
                                        <div>
                                            <label htmlFor="tags" className="block mb-2 text-sm font-medium text-slate-300">Tags</label>
                                            <input type="text" id="tags" value={tags} onChange={e => setTags(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder-slate-600" placeholder="React, TypeScript, UI/UX" />
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div>
                                        <label htmlFor="cert-title" className="block mb-2 text-sm font-medium text-slate-300">Certificate Title</label>
                                        <input type="text" id="cert-title" value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder-slate-600" placeholder="e.g. AWS Certified Developer" required />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div>
                                            <label htmlFor="issuer" className="block mb-2 text-sm font-medium text-slate-300">Issuer Organization</label>
                                            <input type="text" id="issuer" value={issuer} onChange={e => setIssuer(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder-slate-600" placeholder="e.g. Amazon Web Services" required />
                                        </div>
                                        <div>
                                            <label htmlFor="date" className="block mb-2 text-sm font-medium text-slate-300">Date Issued</label>
                                            <input type="date" id="date" value={date} onChange={e => setDate(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder-slate-600" required />
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Status Message & Submit */}
                        <div className="pt-4">
                             {uploadStatus && (
                                <div className={`mb-4 p-3 rounded-lg text-sm text-center ${uploadStatus.includes('Success') ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'}`}>
                                    {uploadStatus}
                                </div>
                             )}
                            <button type="submit" className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-blue-900/20 transition-all transform hover:-translate-y-0.5 text-lg">
                                {uploadType === 'project' ? 'Publish Project' : 'Save Certificate'}
                            </button>
                        </div>

                    </form>
                </div>
            </div>
        </div>
    );
};

export default UploadPage;