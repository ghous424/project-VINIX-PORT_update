
import React from 'react';
import { Certificate } from '../types';

interface CertificateCardProps {
  certificate: Certificate;
  onEdit: () => void;
  onDelete: () => void;
}

const EditIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg>;
const DeleteIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>;

const CertificateCard: React.FC<CertificateCardProps> = ({ certificate, onEdit, onDelete }) => {
  return (
    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg flex items-center justify-between space-x-4 shadow relative group">
      <div className="flex items-center space-x-4 min-w-0">
        <img src={certificate.imageUrl} alt={certificate.title} className="w-24 h-16 object-cover rounded flex-shrink-0"/>
        <div className="min-w-0">
            <h3 className="font-semibold text-gray-900 dark:text-white truncate">{certificate.title}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{certificate.issuer} - {certificate.date}</p>
        </div>
      </div>
      <div className="absolute top-1/2 right-4 transform -translate-y-1/2 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={onEdit} className="p-1.5 bg-gray-200 dark:bg-gray-800 rounded-full text-gray-600 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-blue-900" aria-label="Edit Certificate">
              <EditIcon />
          </button>
          <button onClick={onDelete} className="p-1.5 bg-gray-200 dark:bg-gray-800 rounded-full text-gray-600 dark:text-gray-300 hover:bg-red-100 dark:hover:bg-red-900" aria-label="Delete Certificate">
              <DeleteIcon />
          </button>
      </div>
    </div>
  );
};

export default CertificateCard;
