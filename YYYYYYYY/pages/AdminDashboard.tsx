import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_URL } from '../services/api';

interface ReviewRequest {
  id: number;
  menteeName: string;
  menteeEmail: string;
  paymentAmount: number;
  paymentStatus: string;
  status: string;
  portfolioUrl: string;
}

const AdminDashboard: React.FC = () => {
  const [requests, setRequests] = useState<ReviewRequest[]>([]);
  const [loading, setLoading] = useState(false);

  // Ambil data request saat halaman dibuka
  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      // Kita pakai endpoint yang sudah ada (mungkin perlu disesuaikan jika butuh auth admin)
      // Asumsi: endpoint ini mengembalikan list request
      const res = await axios.get(`${API_URL}/api/review-requests`);
      setRequests(res.data);
    } catch (error) {
      console.error("Gagal ambil data", error);
    }
  };

  const handleApprove = async (requestId: number) => {
    if(!window.confirm("Yakin ingin menyetujui pembayaran ini?")) return;
    
    setLoading(true);
    try {
      // Panggil endpoint Admin yang baru kita buat di server.js
      await axios.put(`${API_URL}/api/admin/approve-payment/${requestId}`);
      alert("Pembayaran Berhasil Disetujui! User sekarang bisa akses portofolio.");
      fetchRequests(); // Refresh data
    } catch (error) {
      alert("Gagal melakukan approval.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-8">Admin Control Panel 🛠️</h1>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-800 text-white">
            <tr>
              <th className="py-3 px-4 text-left">Nama User</th>
              <th className="py-3 px-4 text-left">Email</th>
              <th className="py-3 px-4 text-left">Nominal</th>
              <th className="py-3 px-4 text-left">Status Saat Ini</th>
              <th className="py-3 px-4 text-left">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {requests.map((req) => (
              <tr key={req.id}>
                <td className="py-3 px-4">{req.menteeName}</td>
                <td className="py-3 px-4">{req.menteeEmail}</td>
                <td className="py-3 px-4">Rp {req.paymentAmount?.toLocaleString()}</td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    req.paymentStatus === 'approved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {req.paymentStatus || 'Pending'}
                  </span>
                </td>
                <td className="py-3 px-4">
                  {req.paymentStatus !== 'approved' && (
                    <button 
                      onClick={() => handleApprove(req.id)}
                      disabled={loading}
                      className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700 text-sm"
                    >
                      {loading ? 'Processing...' : '✅ Approve'}
                    </button>
                  )}
                  {req.paymentStatus === 'approved' && (
                    <span className="text-green-600 font-bold">✓ Selesai</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDashboard;