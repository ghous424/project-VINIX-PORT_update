
import React, { useState, useEffect } from 'react';
import { Certificate } from '../types';
import Modal from './Modal';

interface CertificateEditModalProps {
  certificate: Certificate | null;
  onSave: (updatedCertificate: Certificate) => void;
  onClose: () => void;
}

const CertificateEditModal: React.FC<CertificateEditModalProps> = ({ certificate, onSave, onClose }) => {
  const [title, setTitle] = useState('');
  const [issuer, setIssuer] = useState('');
  const [date, setDate] = useState('');

  useEffect(() => {
    if (certificate) {
      setTitle(certificate.title);
      setIssuer(certificate.issuer);
      setDate(certificate.date);
    }
  }, [certificate]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!certificate) return;

    const updatedCertificate: Certificate = {
      ...certificate,
      title,
      issuer,
      date,
    };
    onSave(updatedCertificate);
    onClose();
  };

  return (
    <Modal isOpen={!!certificate} onClose={onClose} title="Edit Certificate">
      <form onSubmit={handleSave} className="space-y-4">
        <div>
            <label htmlFor="edit-cert-title" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Certificate Title</label>
            <input type="text" id="edit-cert-title" value={title} onChange={e => setTitle(e.target.value)} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" required />
        </div>
        <div>
            <label htmlFor="edit-issuer" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Issuer</label>
            <input type="text" id="edit-issuer" value={issuer} onChange={e => setIssuer(e.target.value)} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" required />
        </div>
        <div>
            <label htmlFor="edit-date" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Date Issued</label>
            <input type="date" id="edit-date" value={date} onChange={e => setDate(e.target.value)} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" required />
        </div>
        <div className="flex justify-end space-x-2 pt-2">
            <button type="button" onClick={onClose} className="text-gray-600 dark:text-gray-300 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600">Cancel</button>
            <button type="submit" className="text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm font-medium">Save Changes</button>
        </div>
      </form>
    </Modal>
  );
};

export default CertificateEditModal;
