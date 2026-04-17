import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { InquiryStatus, Inquiry } from '../types';
import { storageService } from '../services/storageService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const PickupList: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [editingPickup, setEditingPickup] = useState<Inquiry | null>(null);

  useEffect(() => {
    const loadInquiries = () => setInquiries(storageService.getInquiries());
    loadInquiries();
    window.addEventListener('storage-updated', loadInquiries);
    return () => window.removeEventListener('storage-updated', loadInquiries);
  }, []);

  // Filter inquiries that have slip data or are in contract statuses
  const pickups = inquiries.filter(inq => 
    inq?.slip?.pickupLocation || 
    (inq?.status && [InquiryStatus.CONTRACT_PENDING_DOCS, InquiryStatus.CONTRACT_PENDING_PAYMENT, InquiryStatus.CLOSED_SUCCESS].includes(inq.status))
  );

  const handleSave = () => {
    if (!editingPickup || !user) return;
    try {
      storageService.updateInquiry(editingPickup.id, editingPickup, user.id, user.name);
      showToast('引取情報を更新しました。', 'success');
      setEditingPickup(null);
    } catch (error: unknown) {
      console.error(error);
      showToast(error instanceof Error ? error.message : '更新中にエラーが発生しました。', 'error');
    }
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden min-h-[600px] flex flex-col">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span className="material-icons-outlined text-brand-600">local_shipping</span>
            引き取り管理
          </h2>
        </div>

        <div className="overflow-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-100 text-slate-500 text-xs uppercase tracking-wider sticky top-0 z-10 shadow-sm">
              <tr>
                <th className="px-6 py-3 font-semibold border-b border-slate-200">顧客名</th>
                <th className="px-6 py-3 font-semibold border-b border-slate-200">車両情報</th>
                <th className="px-6 py-3 font-semibold border-b border-slate-200">引取場所</th>
                <th className="px-6 py-3 font-semibold border-b border-slate-200">引取担当</th>
                <th className="px-6 py-3 font-semibold border-b border-slate-200">引取予定日</th>
                <th className="px-6 py-3 font-semibold border-b border-slate-200">ステータス</th>
                <th className="px-6 py-3 font-semibold border-b border-slate-200 text-center">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pickups.map((pickup) => (
                <tr key={pickup.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-800">{pickup.customer?.name || '-'}</td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-bold text-slate-700">{pickup.vehicle?.make} {pickup.vehicle?.model}</div>
                    <div className="text-xs text-slate-500">{pickup.vehicle?.registrationNumber || '-'}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{pickup.slip?.pickupLocation || pickup.customer?.address || '-'}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{pickup.slip?.pickupRep || '未定'}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{pickup.slip?.scheduledDate || '未定'}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                      pickup.status === InquiryStatus.CLOSED_SUCCESS ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                    }`}>
                      {pickup.status === InquiryStatus.CLOSED_SUCCESS ? '完了' : '予定'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button 
                      onClick={() => setEditingPickup(pickup)}
                      className="text-brand-600 hover:text-brand-800 mr-3"
                      title="編集"
                    >
                      <span className="material-icons-outlined text-sm">edit</span>
                    </button>
                    <button 
                      onClick={() => navigate(`/inquiries/${pickup.id}`)}
                      className="text-slate-600 hover:text-slate-800"
                      title="詳細を見る"
                    >
                      <span className="material-icons-outlined text-sm">visibility</span>
                    </button>
                  </td>
                </tr>
              ))}
              {pickups.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                    引き取り予定のデータがありません。
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {editingPickup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4">引取情報の編集</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">引取予定日</label>
                <input 
                  type="date" 
                  value={editingPickup.slip?.scheduledDate || ''}
                  onChange={(e) => setEditingPickup({
                    ...editingPickup, 
                    slip: { ...editingPickup.slip, scheduledDate: e.target.value }
                  })}
                  className="w-full border-slate-300 rounded-lg text-sm p-2"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">引取場所</label>
                <input 
                  type="text" 
                  value={editingPickup.slip?.pickupLocation || ''}
                  onChange={(e) => setEditingPickup({
                    ...editingPickup, 
                    slip: { ...editingPickup.slip, pickupLocation: e.target.value }
                  })}
                  className="w-full border-slate-300 rounded-lg text-sm p-2"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">引取り担当</label>
                <input 
                  type="text" 
                  value={editingPickup.slip?.pickupRep || ''}
                  onChange={(e) => setEditingPickup({
                    ...editingPickup, 
                    slip: { ...editingPickup.slip, pickupRep: e.target.value }
                  })}
                  className="w-full border-slate-300 rounded-lg text-sm p-2"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button 
                onClick={() => setEditingPickup(null)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-bold transition-colors"
              >
                キャンセル
              </button>
              <button 
                onClick={handleSave}
                className="px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-bold hover:bg-brand-700 transition-colors"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PickupList;
