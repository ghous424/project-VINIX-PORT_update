
import React from 'react';
import { Project } from '../types';

interface ProjectCardProps {
  project: Project;
  onEdit: () => void;
  onDelete: () => void;
}

const EditIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg>;
const DeleteIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>;


const ProjectCard: React.FC<ProjectCardProps> = ({ project, onEdit, onDelete }) => {
  // Helper function to ensure tags are always an array
  const getTagsArray = (tags: any): string[] => {
    console.log('Initial project.tags value:', tags); // Debugging line
    if (Array.isArray(tags)) {
      return tags;
    }
    if (typeof tags === 'string') {
      try {
        // First, try to parse it as JSON, as it might be a JSON string of an array
        const parsed = JSON.parse(tags);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      } catch (e) {
        // Not a valid JSON string, so treat it as a comma-separated string
        return tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      }
      // If it was a string but not JSON, treat as comma-separated
      return tags.split(',').map(tag => tag.trim()).filter(tag => tag);
    }
    // Return an empty array for any other type (null, undefined, number, object, etc.)
    return [];
  };

  const tagsArray = getTagsArray(project.tags);
  console.log('tagsArray after processing:', tagsArray); // Debugging line

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300 ease-in-out group relative">
      <div className="absolute top-2 right-2 flex space-x-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={onEdit} className="p-1.5 bg-gray-100 dark:bg-gray-900 rounded-full text-gray-600 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-blue-900" aria-label="Edit Project">
              <EditIcon />
          </button>
          <button onClick={onDelete} className="p-1.5 bg-gray-100 dark:bg-gray-900 rounded-full text-gray-600 dark:text-gray-300 hover:bg-red-100 dark:hover:bg-red-900" aria-label="Delete Project">
              <DeleteIcon />
          </button>
      </div>
      <img className="w-full h-48 object-cover" src={project.imageUrl} alt={project.title} />
      <div className="p-6">
        <h3 className="font-bold text-xl mb-2 text-gray-900 dark:text-white">{project.title}</h3>
        <p className="text-gray-700 dark:text-gray-400 text-base mb-4">{project.description}</p>
        <div className="flex flex-wrap gap-2 mb-4">
          {tagsArray.map((tag) => (
            <span key={tag} className="inline-block bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 rounded-full px-3 py-1 text-sm font-semibold">
              {tag}
            </span>
          ))}
        </div>
        <a href={project.link} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700 dark:hover:text-blue-400 font-semibold">
          View Project &rarr;
        </a>
      </div>
    </div>
  );
};

export default ProjectCard;
