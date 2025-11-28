import React, { useState } from 'react';
import { mockAssessmentQuestions } from '../services/mockData';
import SkillChart from '../components/SkillChart';
import { Skill } from '../types';
import { usePortfolio } from '../contexts/PortfolioContext';
import { useNavigate } from 'react-router-dom';

const SkillAssessmentPage: React.FC = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  // Store answers as questionId: score (1-5)
  const [answers, setAnswers] = useState<{[key: number]: number}>({});
  const [showResults, setShowResults] = useState(false);
  const [calculatedSkills, setCalculatedSkills] = useState<Skill[]>([]);
  
  const { updateSkills } = usePortfolio();
  const navigate = useNavigate();

  const questions = mockAssessmentQuestions;
  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  const handleLikertSelect = (score: number) => {
    const newAnswers = {
      ...answers,
      [currentQuestion.id]: score
    };
    setAnswers(newAnswers);

    // Auto advance after a short delay for better UX
    setTimeout(() => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        } else {
            finishAssessment(newAnswers);
        }
    }, 250);
  };

  const finishAssessment = (finalAnswers: {[key: number]: number}) => {
      // Calculate scores per category
      const categories = ['Soft Skills', 'Digital Skills', 'Workplace Readiness'];
      const results: Skill[] = categories.map(category => {
          const categoryQuestions = questions.filter(q => q.category === category);
          const totalQuestions = categoryQuestions.length;
          
          // Sum scores for this category
          const totalScore = categoryQuestions.reduce((sum, q) => {
              return sum + (finalAnswers[q.id] || 0);
          }, 0);

          // Max possible score is 5 * number of questions
          const maxScore = totalQuestions * 5;
          
          // Convert to 0-100 scale
          const percentage = Math.round((totalScore / maxScore) * 100);

          return { name: category, level: percentage };
      });

      setCalculatedSkills(results);
      
      // Update Global Context so Portfolio Page reflects these new skills
      updateSkills(results);
      
      setShowResults(true);
  };

  if (showResults) {
    return (
        <div className="min-h-screen bg-slate-950 font-sans selection:bg-blue-500 selection:text-white pt-32 pb-12 px-4 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px]"></div>
            </div>

            <div className="relative z-10 container mx-auto max-w-3xl">
                <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 shadow-2xl rounded-2xl p-8 md:p-10 text-center">
                    
                    <div className="mb-6 inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 shadow-lg shadow-emerald-500/30 mb-6">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                    </div>
                    
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">Assessment Complete!</h1>
                    <p className="text-lg text-slate-400 mb-10 leading-relaxed max-w-xl mx-auto">
                       Terima kasih telah menyelesaikan asesmen. Berikut adalah peta kekuatan profesional Anda berdasarkan analisis kami.
                    </p>
                    
                    <div className="mb-10 bg-slate-950/50 border border-slate-800 rounded-2xl p-6 shadow-inner">
                        <SkillChart data={calculatedSkills} />
                    </div>

                    <div className="grid gap-4 text-left mb-10">
                        {calculatedSkills.map((skill) => (
                            <div key={skill.name} className="bg-slate-800/50 border border-slate-700 p-5 rounded-xl hover:border-blue-500/50 transition-colors group relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                                <div className="flex justify-between items-end mb-2 relative z-10">
                                    <div>
                                        <span className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-1 block">Category</span>
                                        <span className="font-bold text-white text-lg">{skill.name}</span>
                                    </div>
                                    <span className="text-2xl font-bold text-white">{skill.level}<span className="text-sm text-slate-500 ml-0.5">%</span></span>
                                </div>
                                <div className="w-full bg-slate-700 rounded-full h-2 relative z-10 overflow-hidden">
                                    <div 
                                        className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-1000 ease-out" 
                                        style={{ width: `${skill.level}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex flex-col md:flex-row gap-4">
                        <button
                            onClick={() => {
                                setShowResults(false);
                                setCurrentQuestionIndex(0);
                                setAnswers({});
                            }}
                            className="flex-1 py-3.5 px-6 rounded-xl border border-slate-700 text-slate-300 font-bold hover:bg-slate-800 hover:text-white transition-all"
                        >
                            Ulangi Asesmen
                        </button>
                        <button
                            onClick={() => navigate('/portfolio')}
                            className="flex-1 py-3.5 px-6 rounded-xl bg-blue-600 text-white font-bold shadow-lg shadow-blue-600/20 hover:bg-blue-500 hover:shadow-blue-600/40 transition-all transform hover:-translate-y-0.5"
                        >
                            Lihat di Portofolio
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
  }

  return (
    // Perubahan utama: Menggunakan pt-28 (padding top) alih-alih flex-center untuk menghindari tabrakan navbar
    <div className="min-h-screen bg-slate-950 font-sans selection:bg-blue-500 selection:text-white pt-28 pb-12 px-4 relative overflow-hidden">
      
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
          <div className="absolute -top-[10%] -left-[10%] w-[60%] h-[60%] rounded-full bg-blue-600/10 blur-[100px]"></div>
          <div className="absolute bottom-[10%] right-[10%] w-[40%] h-[40%] rounded-full bg-purple-600/10 blur-[80px]"></div>
      </div>

      <div className="relative z-10 container mx-auto max-w-2xl">
        
        {/* Header Info */}
        <div className="flex items-center justify-between mb-6 px-1">
             <div className="flex items-center gap-3">
                <span className="flex h-2.5 w-2.5 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500"></span>
                </span>
                <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">Assessment in Progress</span>
             </div>
             <button 
                onClick={() => navigate('/portfolio')}
                className="text-slate-500 hover:text-white text-sm font-medium transition-colors flex items-center gap-1"
             >
                <span>Exit</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
             </button>
        </div>

        <div className="bg-slate-900/60 backdrop-blur-2xl border border-slate-800 shadow-2xl rounded-2xl p-6 md:p-10 relative overflow-hidden">
            
            {/* Top Glow Line */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 opacity-50"></div>

            <div className="flex justify-between items-end mb-8">
                <div>
                    <span className="inline-block border border-blue-500/30 bg-blue-500/10 text-blue-300 text-[10px] font-bold px-2 py-1 rounded-full mb-2 uppercase tracking-wider">
                        {currentQuestion.category}
                    </span>
                    <h1 className="text-2xl md:text-3xl font-bold text-white">Skill Check</h1>
                </div>
                <div className="text-right">
                    <span className="block text-xs text-slate-500 font-mono mb-1">Question</span>
                    <span className="text-white font-mono text-xl font-bold">
                        {currentQuestionIndex + 1} <span className="text-slate-600 text-base">/ {questions.length}</span>
                    </span>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-800 rounded-full h-1.5 mb-12 overflow-hidden">
                <div 
                    className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500 shadow-[0_0_10px_rgba(59,130,246,0.5)] transition-all duration-500 ease-out" 
                    style={{ width: `${progress}%` }}
                ></div>
            </div>

            {/* Question */}
            <div className="mb-12 min-h-[120px] flex items-center justify-center">
                <p className="text-xl md:text-2xl font-medium text-white text-center leading-relaxed">
                    "{currentQuestion.question}"
                </p>
            </div>

            {/* Likert Scale Options */}
            <div className="space-y-4">
                <div className="flex justify-between text-xs text-slate-500 font-bold uppercase tracking-wider px-1 mb-2">
                    <span>Sangat Tidak Bisa</span>
                    <span>Sangat Bisa</span>
                </div>
                <div className="grid grid-cols-5 gap-3 md:gap-4">
                    {[1, 2, 3, 4, 5].map((val) => (
                        <button
                            key={val}
                            onClick={() => handleLikertSelect(val)}
                            className={`group relative aspect-square md:aspect-auto md:h-16 rounded-xl border flex items-center justify-center text-xl font-bold transition-all duration-200 outline-none
                            ${answers[currentQuestion.id] === val 
                                ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20 scale-105 z-10' 
                                : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700 hover:border-slate-600 hover:text-white hover:-translate-y-1'
                            }`}
                        >
                            {val}
                        </button>
                    ))}
                </div>
            </div>
            
            <div className="mt-10 pt-6 border-t border-slate-800 flex justify-between items-center">
                 <button
                    onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                    disabled={currentQuestionIndex === 0}
                    className={`flex items-center gap-2 text-sm font-bold transition-colors
                        ${currentQuestionIndex === 0 
                            ? 'text-slate-800 cursor-not-allowed' 
                            : 'text-slate-400 hover:text-white'
                        }`}
                 >
                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                     Previous
                 </button>
                 
                 <span className="text-[10px] text-slate-600 uppercase tracking-wider hidden md:block">
                    Pilih angka 1 - 5
                 </span>
            </div>
        </div>
      </div>
    </div>
  );
};

export default SkillAssessmentPage;