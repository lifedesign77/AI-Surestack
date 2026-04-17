import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { InquiryStatus, Inquiry } from '../types';
import { storageService } from '../services/storageService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const ContractList: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [editingContract, setEditingContract] = useState<Inquiry | null>(null);

  useEffect(() => {
    const loadInquiries = () => setInquiries(storageService.getInquiries());
    loadInquiries();
    window.addEventListener('storage-updated', loadInquiries);
    return () => window.removeEventListener('storage-updated', loadInquiries);
  }, []);

  // Filter inquiries that are in contract-related statuses
  const contractStatuses = [
    InquiryStatus.CONTRACT_PENDING_DOCS,
    InquiryStatus.CONTRACT_PENDING_PAYMENT,
    InquiryStatus.CLOSED_SUCCESS
  ];
  
  const contracts = inquiries.filter(inq => inq?.status && contractStatuses.includes(inq.status));

  const handleGenerateList = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      showToast('上様リスト（PDF）の生成が完了しました。ダウンロードを開始します。', 'success');
    }, 1500);
  };

  const handleSave = () => {
    if (!editingContract || !user) return;
    try {
      storageService.updateInquiry(editingContract.id, editingContract, user.id, user.name);
      showToast('成約情報を更新しました。', 'success');
      setEditingContract(null);
    } catch (error: unknown) {
      console.error(error);
      showToast(error instanceof Error ? error.message : '更新中にエラーが発生しました。', 'error');
    }
  };

  const handleDelete = (id: string) => {
    if (!user) return;
    if (window.confirm('本当にこの成約データ（案件）を削除しますか？')) {
      try {
        storageService.deleteInquiry(id, user.id, user.name);
        showToast('成約データを削除しました。', 'success');
      } catch (error: unknown) {
        console.error(error);
        showToast(error instanceof Error ? error.message : '削除中にエラーが発生しました。', 'error');
      }
    }
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden min-h-[600px] flex flex-col">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span className="material-icons-outlined text-brand-600">handshake</span>
            成約管理
          </h2>
          <button 
            onClick={handleGenerateList}
            disabled={isGenerating}
            className="px-4 py-2 bg-brand-600 text-white rounded-lg font-bold text-sm shadow-md hover:bg-brand-700 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {isGenerating ? (
              <span className="material-icons-outlined animate-spin text-sm">autorenew</span>
            ) : (
              <span className="material-icons-outlined text-sm">picture_as_pdf</span>
            )}
            上様リスト自動制作
          </button>
        </div>

        <div className="overflow-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-100 text-slate-500 text-xs uppercase tracking-wider sticky top-0 z-10 shadow-sm">
              <tr>
                <th className="px-6 py-3 font-semibold border-b border-slate-200">顧客情報</th>
                <th className="px-6 py-3 font-semibold border-b border-slate-200">車両・買取金額</th>
                <th className="px-6 py-3 font-semibold border-b border-slate-200 w-40">ステータス</th>
                <th className="px-6 py-3 font-semibold border-b border-slate-200 w-32">引取予定日</th>
                <th className="px-6 py-3 font-semibold border-b border-slate-200 w-32">担当（営 / 引）</th>
                <th className="px-6 py-3 font-semibold border-b border-slate-200 text-center w-32">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {contracts.map((contract) => (
                <tr key={contract.id} className="hover:bg-slate-50 transition-colors group cursor-pointer" onClick={() => navigate(`/inquiries/${contract.id}`)}>
                  <td className="px-6 py-4 align-middle">
                    <div className="font-bold text-slate-800 text-base">{contract.customer?.name || '-'}</div>
                    <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                      <span className="material-icons-outlined text-[14px]">phone</span>
                      {contract.customer?.phone || '未登録'}
                    </div>
                  </td>
                  <td className="px-6 py-4 align-middle">
                    <div className="text-sm font-bold text-slate-700">{contract.vehicle?.make || '不明'} {contract.vehicle?.model || '不明'}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="text-xs font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded border border-brand-100">
                        {contract.slip?.purchasePrice ? `¥${Number(contract.slip.purchasePrice).toLocaleString()}` : '金額未定'}
                      </div>
                      <div className="text-[10px] text-slate-400">{contract.vehicle?.year ? `${contract.vehicle?.year}年式` : ''}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 align-middle" onClick={(e) => e.stopPropagation()}>
                    <select 
                      value={contract.status}
                      onChange={(e) => {
                        const newStatus = e.target.value as InquiryStatus;
                        if (user) {
                          storageService.updateInquiry(contract.id, { status: newStatus }, user.id, user.name);
                          showToast('ステータスを更新しました', 'success');
                          const loadInquiries = () => setInquiries(storageService.getInquiries());
                          loadInquiries();
                        }
                      }}
                      className={`block w-full py-1.5 pl-2 pr-6 rounded-md text-xs font-bold border-slate-200 focus:ring-brand-500 cursor-pointer ${
                        contract.status === InquiryStatus.CLOSED_SUCCESS 
                          ? 'bg-green-50 text-green-700 border-green-200' 
                          : 'bg-blue-50 text-blue-700 border-blue-200'
                      }`}
                    >
                      <option value={InquiryStatus.CONTRACT_PENDING_DOCS}>{InquiryStatus.CONTRACT_PENDING_DOCS}</option>
                      <option value={InquiryStatus.CONTRACT_PENDING_PAYMENT}>{InquiryStatus.CONTRACT_PENDING_PAYMENT}</option>
                      <option value={InquiryStatus.CLOSED_SUCCESS}>{InquiryStatus.CLOSED_SUCCESS}</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 align-middle">
                    <div className="text-sm text-slate-700 font-medium">
                      {contract.slip?.scheduledDate || <span className="text-slate-400 text-xs">未定</span>}
                    </div>
                    {contract.slip?.scheduledAmPm && (
                       <div className="text-[10px] text-slate-500 mt-0.5">{contract.slip.scheduledAmPm}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 align-middle">
                    <div className="text-xs text-slate-600 mb-1 flex items-center justify-between">
                       <span className="text-slate-400 mr-1">営:</span> 
                       <span className="font-medium text-slate-800">{contract.slip?.salesRep || '-'}</span>
                    </div>
                    <div className="text-xs text-slate-600 flex items-center justify-between">
                       <span className="text-slate-400 mr-1">引:</span> 
                       <span className="font-medium text-slate-800">{contract.slip?.pickupRep || '-'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 align-middle text-center" onClick={(e) => e.stopPropagation()}>
                    <button 
                      onClick={() => setEditingContract(contract)}
                      className="text-brand-600 hover:text-brand-800 mr-3"
                      title="編集"
                    >
                      <span className="material-icons-outlined text-sm">edit</span>
                    </button>
                    <button 
                      onClick={() => handleDelete(contract.id)}
                      className="text-red-500 hover:text-red-700"
                      title="削除"
                    >
                      <span className="material-icons-outlined text-sm">delete</span>
                    </button>
                  </td>
                </tr>
              ))}
              {contracts.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    成約データがありません。
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {editingContract && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4">成約情報の編集</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">ステータス</label>
                <select 
                  value={editingContract.status}
                  onChange={(e) => setEditingContract({...editingContract, status: e.target.value as InquiryStatus})}
                  className="w-full border-slate-300 rounded-lg text-sm p-2"
                >
                  {Object.values(InquiryStatus).map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">成約日（予定日）</label>
                <input 
                  type="date" 
                  value={editingContract.slip?.scheduledDate || ''}
                  onChange={(e) => setEditingContract({
                    ...editingContract, 
                    slip: { ...editingContract.slip, scheduledDate: e.target.value }
                  })}
                  className="w-full border-slate-300 rounded-lg text-sm p-2"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">引取場所</label>
                <input 
                  type="text" 
                  value={editingContract.slip?.pickupLocation || ''}
                  onChange={(e) => setEditingContract({
                    ...editingContract, 
                    slip: { ...editingContract.slip, pickupLocation: e.target.value }
                  })}
                  className="w-full border-slate-300 rounded-lg text-sm p-2"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">引取り担当</label>
                <input 
                  type="text" 
                  value={editingContract.slip?.pickupRep || ''}
                  onChange={(e) => setEditingContract({
                    ...editingContract, 
                    slip: { ...editingContract.slip, pickupRep: e.target.value }
                  })}
                  className="w-full border-slate-300 rounded-lg text-sm p-2"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button 
                onClick={() => setEditingContract(null)}
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

export default ContractList;
