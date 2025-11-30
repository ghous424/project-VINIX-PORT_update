import React from 'react';
// Pastikan interface Project di types.ts sudah mengakomodasi image_url
// atau kita handle manual di sini dengan 'any' sementara agar tidak merah
import { Project } from '../types';

interface ProjectCardProps {
  project: Project | any; // Pakai any dulu biar aman menangkap properti dari DB
  onEdit: () => void;
  onDelete: () => void;
}

const EditIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg>;
const DeleteIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>;

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onEdit, onDelete }) => {
  
  // Fungsi Helper Super Aman untuk Tags
  const getTagsArray = (tags: any): string[] => {
    if (!tags) return []; // Jika null/undefined, kembalikan array kosong
    if (Array.isArray(tags)) return tags; // Jika sudah array, kembalikan
    
    if (typeof tags === 'string') {
      try {
        // Coba parsing JSON (contoh: '["react", "css"]')
        const parsed = JSON.parse(tags);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        // Jika bukan JSON, anggap CSV (contoh: "react, css")
        return tags.split(',').map(tag => tag.trim()).filter(Boolean);
      }
      // Fallback string biasa
      return tags.split(',').map(tag => tag.trim()).filter(Boolean);
    }
    return [];
  };

  const tagsArray = getTagsArray(project.tags);

  // Handle Mismatch: Database TiDB kirim 'image_url', tapi Frontend mungkin minta 'imageUrl'
  // Kita ambil mana saja yang ada isinya.
  const displayImage = project.image_url || project.imageUrl || 'https://via.placeholder.com/400x300?text=No+Image';

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300 ease-in-out group relative h-full flex flex-col">
      <div className="absolute top-2 right-2 flex space-x-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={onEdit} className="p-2 bg-white dark:bg-gray-700 rounded-full text-blue-600 hover:text-blue-800 shadow-md transition-colors" aria-label="Edit Project">
              <EditIcon />
          </button>
          <button onClick={onDelete} className="p-2 bg-white dark:bg-gray-700 rounded-full text-red-600 hover:text-red-800 shadow-md transition-colors" aria-label="Delete Project">
              <DeleteIcon />
          </button>
      </div>
      
      <div className="h-48 overflow-hidden">
        <img 
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
            src={displayImage} 
            alt={project.title} 
            onError={(e) => {
                // Fallback jika gambar gagal load
                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x300?text=Image+Error';
            }}
        />
      </div>

      <div className="p-6 flex flex-col flex-grow">
        <h3 className="font-bold text-xl mb-2 text-gray-900 dark:text-white line-clamp-1">{project.title}</h3>
        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3 flex-grow">{project.description}</p>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {tagsArray.slice(0, 3).map((tag, index) => (
            <span key={index} className="inline-block bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 rounded-md px-2 py-1 text-xs font-semibold border border-blue-100 dark:border-blue-800">
              {tag}
            </span>
          ))}
          {tagsArray.length > 3 && (
             <span className="text-xs text-gray-500 self-center">+{tagsArray.length - 3} more</span>
          )}
        </div>
        
        {project.link && (
            <a href={project.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-semibold text-sm mt-auto">
            View Project 
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
            </a>
        )}
      </div>
    </div>
  );
};

export default ProjectCard;