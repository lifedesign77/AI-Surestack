import React, { useState, useEffect } from 'react';
import { CustomerInfo, Inquiry, InquiryStatus } from '../types';
import { storageService } from '../services/storageService';
import { useNavigate } from 'react-router-dom';

interface CustomerHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: CustomerInfo | null;
}

const CustomerHistoryModal: React.FC<CustomerHistoryModalProps> = ({ isOpen, onClose, customer }) => {
  const [history, setHistory] = useState<Inquiry[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen && customer) {
      const allInquiries = storageService.getInquiries();
      // Match by phone number as a simple heuristic for same customer identity
      const customerHistory = allInquiries.filter(
        inq => inq.customer?.phone === customer.phone
      ).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      
      setHistory(customerHistory);
    }
  }, [isOpen, customer]);

  if (!isOpen || !customer) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-slate-50 shrink-0">
          <div>
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <span className="material-icons-outlined text-brand-600">history</span>
              顧客詳細・対応履歴
            </h2>
            <p className="text-xs text-slate-500 mt-1">このお客様の過去の問い合わせや車両の買取履歴をすべて確認できます。</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200 transition-colors">
            <span className="material-icons-outlined text-2xl">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6 bg-slate-100/50">
            
          {/* Basic Info */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 flex flex-col gap-3 shadow-sm mb-6">
             <div className="flex justify-between items-start">
               <div>
                 <h3 className="text-2xl font-bold text-slate-800">{customer.name} <span className="text-sm font-normal text-slate-500 ml-2">{customer.kana}</span></h3>
                 <div className="mt-4 flex flex-wrap gap-x-8 gap-y-2">
                    <p className="text-sm text-slate-600 flex items-center gap-1.5 font-medium">
                        <span className="material-icons-outlined text-slate-400">phone</span>{customer.phone}
                    </p>
                    <p className="text-sm text-slate-600 flex items-center gap-1.5 font-medium">
                        <span className="material-icons-outlined text-slate-400">mail</span>{customer.email || '未登録'}
                    </p>
                    <p className="text-sm text-slate-600 flex items-center gap-1.5 font-medium">
                        <span className="material-icons-outlined text-slate-400">home</span>{customer.address || '未登録'}
                    </p>
                 </div>
               </div>
               <div className="text-right">
                  <div className="inline-flex flex-col items-center justify-center p-3 bg-brand-50 border border-brand-100 rounded-lg">
                    <span className="text-xs font-bold text-brand-600 mb-1">累計問い合わせ数</span>
                    <span className="text-2xl font-black text-brand-700">{history.length}<span className="text-sm ml-1 font-medium text-brand-600">件</span></span>
                  </div>
               </div>
             </div>
          </div>

          {/* History List */}
          <div>
            <h3 className="text-base font-bold text-slate-800 border-b-2 border-slate-200 pb-2 mb-4 flex items-center gap-2">
              <span className="material-icons-outlined text-sm text-slate-500">list_alt</span>
              過去の案件・車両履歴
            </h3>
            
            {history.length === 0 ? (
                <div className="text-center py-12 text-slate-500 bg-white rounded-xl border border-dashed border-slate-300">
                    <span className="material-icons-outlined text-4xl text-slate-300 mb-2 block">history_toggle_off</span>
                    過去の履歴は見つかりませんでした。
                </div>
            ) : (
                <div className="space-y-4">
                    {history.map((inq, index) => (
                        <div key={inq.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md hover:border-brand-300 transition-all group">
                            <div className="flex justify-between items-start mb-4 border-b border-slate-100 pb-3">
                                <div className="flex items-center gap-3">
                                    <span className="text-sm font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-md">{inq.timestamp.split(' ')[0]}</span>
                                    <span className={`text-xs font-bold px-3 py-1 rounded-full border ${inq.status === InquiryStatus.CLOSED_SUCCESS ? 'bg-green-50 text-green-700 border-green-200' : 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                                        {inq.status}
                                    </span>
                                    <span className="text-xs text-slate-400">案件ID: {inq.id.slice(-6)}</span>
                                </div>
                                <button 
                                    onClick={() => navigate(`/inquiries/${inq.id}`)}
                                    className="bg-brand-50 text-brand-600 hover:bg-brand-600 hover:text-white px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-1 transition-colors"
                                >
                                    詳細画面へ <span className="material-icons-outlined text-sm">arrow_forward</span>
                                </button>
                            </div>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                <div>
                                    <p className="text-xs font-bold text-slate-400 mb-1">買取車両</p>
                                    <p className="text-base font-bold text-slate-800">{inq.vehicle?.make || '-'} {inq.vehicle?.model || '-'}</p>
                                    <p className="text-xs text-slate-500 mt-1">{inq.vehicle?.color || '-'}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-400 mb-1">年式 / 走行距離</p>
                                    <p className="text-sm font-bold text-slate-800">{inq.vehicle?.year || '-'} / {inq.vehicle?.mileage || '-'}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-400 mb-1">買取金額</p>
                                    <p className="text-lg font-black text-brand-600">{inq.slip?.purchasePrice ? `¥${Number(inq.slip.purchasePrice).toLocaleString()}` : '-'}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-400 mb-1">受付担当 / 営業担当</p>
                                    <p className="text-sm font-bold text-slate-800">{inq.slip?.receptionName || '-'} / {inq.slip?.salesRep || '-'}</p>
                                </div>
                            </div>

                            {/* 最近のやり取りプレビュー */}
                            {inq.history && inq.history.length > 0 && (
                                <div className="mt-5 bg-slate-50 p-4 rounded-lg text-sm text-slate-600 border border-slate-100 flex gap-3">
                                    <span className="material-icons-outlined text-slate-400 mt-0.5">chat_bubble_outline</span>
                                    <div>
                                        <p className="text-xs font-bold text-slate-500 mb-1">最後のやり取り ({inq.history[0].date})</p>
                                        <p className="line-clamp-2 text-slate-700">{inq.history[0].content}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerHistoryModal;
