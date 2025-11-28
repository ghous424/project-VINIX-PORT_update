import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import SkillChart from '../components/SkillChart';
import ProjectCard from '../components/ProjectCard';
import CertificateCard from '../components/CertificateCard';
import { api } from '../services/api';
import { Project, Certificate, Skill, User } from '../types';

const UserPortfolioPage: React.FC = () => {
    const { username } = useParams<{ username: string }>();
    const [portfolioData, setPortfolioData] = useState<{ user: User, projects: Project[], certificates: Certificate[], skills: Skill[] } | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (username) {
            setLoading(true);
            const fetchPortfolio = async () => {
                try {
                    // Fetch user data first
                    const userResponse = await fetch(`${window.location.origin}/api/user/${username}`);
                    if (!userResponse.ok) throw new Error('User not found');
                    const userData: User = await userResponse.json();

                    // Then fetch portfolio data (projects, certificates)
                    const portfolioResponse = await fetch(`${window.location.origin}/api/portfolio/${username}`);
                    let projectsData: Project[] = [];
                    let certificatesData: Certificate[] = [];
                    if (portfolioResponse.ok) {
                        const portfolioJson = await portfolioResponse.json();
                        projectsData = portfolioJson.projects || [];
                        certificatesData = portfolioJson.certificates || [];
                    }

                    // For now, let's use some mock skills data as we don't have a specific endpoint for it
                    const mockSkills: Skill[] = [
                        { id: 1, name: 'Soft Skills', level: 85 },
                        { id: 2, name: 'Digital Skills', level: 90 },
                        { id: 3, name: 'Workplace Readiness', level: 75 },
                        { id: 4, name: 'React', level: 95 },
                        { id: 5, name: 'Node.js', level: 80 },
                    ];
                    
                    setPortfolioData({
                        user: userData,
                        projects: projectsData,
                        certificates: certificatesData,
                        skills: mockSkills,
                    });
                } catch (error) {
                    console.error('Error loading portfolio:', error);
                    setPortfolioData(null);
                } finally {
                    setLoading(false);
                }
            };
            fetchPortfolio();
        }
    }, [username]);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-200">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="animate-pulse">Loading portfolio for {username}...</p>
                </div>
            </div>
        );
    }

    if (!portfolioData) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-200">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-white mb-4">Portfolio Not Found</h1>
                    <p className="text-slate-400">Could not load the portfolio for "{username}". The user may not exist or has not set up their portfolio yet.</p>
                </div>
            </div>
        );
    }
    
    const { user, projects, certificates, skills } = portfolioData;

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-blue-500 selection:text-white pt-28 pb-12 px-4 relative overflow-hidden">
            
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                <div className="absolute -top-[10%] -left-[10%] w-[60%] h-[60%] rounded-full bg-blue-600/10 blur-[100px]"></div>
                <div className="absolute bottom-[10%] right-[10%] w-[40%] h-[40%] rounded-full bg-purple-600/10 blur-[80px]"></div>
            </div>

            <div className="container mx-auto px-4 md:px-6 relative z-10">
                
                <div className="bg-slate-900/60 backdrop-blur-2xl border border-slate-800 shadow-2xl rounded-2xl overflow-hidden mb-8 relative">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 opacity-50"></div>
                    <div className="h-40 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
                         <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] opacity-30"></div>
                         <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-900/90"></div>
                    </div>
                    
                    <div className="px-8 pb-8">
                        <div className="flex flex-col md:flex-row items-start md:items-end -mt-16 gap-6">
                            <div className="relative">
                                <div className="absolute -inset-1 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full opacity-50 blur"></div>
                                <img className="relative w-32 h-32 rounded-full border-4 border-slate-900 bg-slate-950 object-cover shadow-xl" src={user.avatarUrl} alt={user.name} />
                            </div>
                            
                            <div className="flex-1 w-full">
                                <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
                                    <div>
                                        <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-1">{user.name}</h1>
                                        <p className="text-lg text-blue-400 font-medium">{user.title}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl p-6">
                             <h3 className="text-lg font-bold text-white mb-4">About Me</h3>
                             <p className="text-slate-400 text-sm leading-relaxed whitespace-pre-line">
                                 {user.bio || "No bio available."}
                             </p>
                        </div>
                    </div>

                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl p-8 shadow-lg">
                            <h2 className="text-xl font-bold text-white mb-8">Skills</h2>
                            <SkillChart data={skills} />
                        </div>

                        <div>
                            <h2 className="text-xl font-bold text-white mb-6">Featured Projects</h2>
                            {projects.length > 0 ? (
                                <div className="grid md:grid-cols-2 gap-6">
                                    {projects.map(project => (
                                        <ProjectCard key={project.id} project={project} onEdit={() => {}} onDelete={() => {}} />
                                    ))}
                                </div>
                            ) : (
                                <p className="text-slate-400">No projects to display.</p>
                            )}
                        </div>

                        <div>
                            <h2 className="text-xl font-bold text-white mb-6">Certificates</h2>
                            {certificates.length > 0 ? (
                                <div className="grid md:grid-cols-2 gap-4">
                                    {certificates.map(cert => (
                                        <CertificateCard key={cert.id} certificate={cert} onEdit={() => {}} onDelete={() => {}} />
                                    ))}
                                </div>
                            ) : (
                                <p className="text-slate-400">No certificates to display.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserPortfolioPage;
