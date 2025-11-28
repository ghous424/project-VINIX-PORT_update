
import React, { useState, useEffect } from 'react';
import { Project } from '../types';
import Modal from './Modal';

interface ProjectEditModalProps {
  project: Project | null;
  onSave: (updatedProject: Project) => void;
  onClose: () => void;
}

const ProjectEditModal: React.FC<ProjectEditModalProps> = ({ project, onSave, onClose }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [link, setLink] = useState('');

  useEffect(() => {
    if (project) {
      setTitle(project.title);
      setDescription(project.description);
      setTags(project.tags.join(', '));
      setLink(project.link);
    }
  }, [project]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!project) return;
    
    const updatedProject: Project = {
      ...project,
      title,
      description,
      link,
      tags: tags.split(',').map(tag => tag.trim()).filter(Boolean),
    };
    onSave(updatedProject);
    onClose();
  };

  return (
    <Modal isOpen={!!project} onClose={onClose} title="Edit Project">
      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label htmlFor="edit-title" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Project Title</label>
          <input type="text" id="edit-title" value={title} onChange={e => setTitle(e.target.value)} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" required />
        </div>
        <div>
          <label htmlFor="edit-description" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Description</label>
          <textarea id="edit-description" rows={4} value={description} onChange={e => setDescription(e.target.value)} className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" required></textarea>
        </div>
        <div>
            <label htmlFor="edit-link" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Project Link</label>
            <input type="url" id="edit-link" value={link} onChange={e => setLink(e.target.value)} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" />
        </div>
        <div>
          <label htmlFor="edit-tags" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Tags (comma-separated)</label>
          <input type="text" id="edit-tags" value={tags} onChange={e => setTags(e.target.value)} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" />
        </div>
        <div className="flex justify-end space-x-2 pt-2">
            <button type="button" onClick={onClose} className="text-gray-600 dark:text-gray-300 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600">Cancel</button>
            <button type="submit" className="text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm font-medium">Save Changes</button>
        </div>
      </form>
    </Modal>
  );
};

export default ProjectEditModal;
