import React, { useState, useEffect } from 'react';
import { ChannelType, InquiryStatus, Inquiry } from '../types';
import { useLocation, useNavigate } from 'react-router-dom';
import { storageService } from '../services/storageService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

// Staff list for dropdown
const STAFF_MEMBERS = ['未定', '佐藤', '鈴木', '田中', '高橋', '伊藤'];

// Color mapping for visual badges
const getColorClass = (colorName: string | undefined) => {
  if (!colorName) return 'bg-gray-100 border-gray-200';
  if (colorName.includes('白') || colorName.includes('ホワイト')) return 'bg-white border-slate-300';
  if (colorName.includes('黒') || colorName.includes('ブラック')) return 'bg-black border-black';
  if (colorName.includes('赤') || colorName.includes('レッド')) return 'bg-red-500 border-red-600';
  if (colorName.includes('青') || colorName.includes('ブルー')) return 'bg-blue-500 border-blue-600';
  if (colorName.includes('銀') || colorName.includes('シルバー')) return 'bg-gray-300 border-gray-400';
  if (colorName.includes('桃') || colorName.includes('ピンク')) return 'bg-pink-400 border-pink-500';
  if (colorName.includes('紫') || colorName.includes('パープル')) return 'bg-purple-600 border-purple-700';
  return 'bg-slate-400 border-slate-500';
};

const getStatusStyle = (status: InquiryStatus) => {
    switch (status) {
        case InquiryStatus.UNREAD: return 'bg-red-100 text-red-800 border-red-200';
        case InquiryStatus.CONTACTED: return 'bg-orange-100 text-orange-800 border-orange-200';
        case InquiryStatus.ASSESSMENT_SCHEDULED: return 'bg-blue-100 text-blue-800 border-blue-200';
        case InquiryStatus.ASSESSED: return 'bg-indigo-100 text-indigo-800 border-indigo-200';
        case InquiryStatus.NEGOTIATION: return 'bg-purple-100 text-purple-800 border-purple-200';
        case InquiryStatus.CONTRACT_PENDING_DOCS: 
        case InquiryStatus.CONTRACT_PENDING_PAYMENT:
            return 'bg-green-100 text-green-800 border-green-200';
        case InquiryStatus.CLOSED_SUCCESS: return 'bg-green-600 text-white border-green-600';
        case InquiryStatus.CLOSED_LOST: return 'bg-gray-200 text-gray-600 border-gray-300';
        case InquiryStatus.CANCELLED: return 'bg-gray-100 text-gray-400 border-gray-200';
        default: return 'bg-slate-100 text-slate-800';
    }
};

interface InquiryListProps {
  onUpdate?: () => void;
}

const InquiryList: React.FC<InquiryListProps> = ({ onUpdate }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [filter, setFilter] = useState<'ALL' | ChannelType>('ALL');
  
  // Local state to handle real-time edits
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);

  // Message Modal State
  const [messageModal, setMessageModal] = useState<{ isOpen: boolean; type: 'SMS' | 'EMAIL'; targetId: string | null }>({
    isOpen: false,
    type: 'SMS',
    targetId: null
  });
  const [messageBody, setMessageBody] = useState('');

  const fetchInquiries = () => {
    setInquiries(storageService.getInquiries());
    if (onUpdate) onUpdate();
  };

  useEffect(() => {
    fetchInquiries();
    window.addEventListener('storage-updated', fetchInquiries);
    return () => window.removeEventListener('storage-updated', fetchInquiries);
  }, []);

  useEffect(() => {
    if (location.state && location.state.filter) {
      setFilter(location.state.filter);
    }
  }, [location.state]);

  const handleStatusChange = (id: string, newStatus: InquiryStatus) => {
    if (!user) return;
    const updated = storageService.updateInquiry(id, { status: newStatus }, user.id, user.name);
    if (updated) {
      showToast('ステータスを更新しました', 'success');
    }
  };

  const handleRepChange = (id: string, newRep: string) => {
    if (!user) return;
    const inquiry = inquiries.find(i => i.id === id);
    if (!inquiry) return;

    const updated = storageService.updateInquiry(id, {
      customer: { ...inquiry.customer, repName: newRep },
      slip: { ...inquiry.slip, salesRep: newRep }
    }, user.id, user.name);
    
    if (updated) {
      showToast('担当者を更新しました', 'success');
    }
  };

  const openMessageModal = (e: React.MouseEvent, type: 'SMS' | 'EMAIL', id: string) => {
    e.stopPropagation();
    setMessageModal({ isOpen: true, type, targetId: id });
    setMessageBody('');
  };

  const sendMessage = () => {
    // Simulate sending
    showToast(`${messageModal.type}を送信しました。`, 'success');
    setMessageModal({ isOpen: false, type: 'SMS', targetId: null });
  };

  const filteredInquiries = inquiries.filter(inq => 
    inq && (filter === 'ALL' ? true : inq.channel === filter)
  );

  const getChannelIcon = (channel: ChannelType) => {
    switch (channel) {
      case ChannelType.LINE: return { icon: 'chat', color: 'text-green-500', bg: 'bg-green-50' };
      case ChannelType.PHONE: return { icon: 'phone', color: 'text-blue-500', bg: 'bg-blue-50' };
      case ChannelType.EMAIL: return { icon: 'mail', color: 'text-orange-500', bg: 'bg-orange-50' };
      case ChannelType.FORM: return { icon: 'web', color: 'text-purple-500', bg: 'bg-purple-50' };
    }
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden min-h-[600px] flex flex-col">
        {/* Header & Filter */}
        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span className="material-icons-outlined text-brand-600">contact_phone</span>
            問い合わせ管理
          </h2>
          
          <div className="flex bg-slate-200 p-1 rounded-lg">
            {(['ALL', ChannelType.LINE, ChannelType.PHONE, ChannelType.EMAIL, ChannelType.FORM] as const).map((type) => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                  filter === type 
                    ? 'bg-white text-slate-800 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {type === 'ALL' ? '全て' : type}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        <div className="overflow-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-100 text-slate-500 text-xs uppercase tracking-wider sticky top-0 z-10 shadow-sm">
              <tr>
                <th className="px-4 py-3 font-semibold border-b border-slate-200 w-16 text-center"></th>
                <th className="px-4 py-3 font-semibold border-b border-slate-200">顧客情報</th>
                <th className="px-4 py-3 font-semibold border-b border-slate-200 w-40">ステータス</th>
                <th className="px-4 py-3 font-semibold border-b border-slate-200 w-32">日時</th>
                <th className="px-4 py-3 font-semibold border-b border-slate-200">車両情報</th>
                <th className="px-4 py-3 font-semibold border-b border-slate-200 w-28">担当者</th>
                <th className="px-4 py-3 font-semibold border-b border-slate-200 w-40 text-center">アクション</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInquiries.map((inq) => {
                const { icon, color, bg } = getChannelIcon(inq.channel);
                return (
                  <tr 
                    key={inq.id} 
                    onClick={() => navigate(`/inquiries/${inq.id}`)}
                    className="hover:bg-slate-50 transition-colors group cursor-pointer"
                  >
                    {/* Channel */}
                    <td className="px-2 py-3 align-middle text-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto ${bg} ${color}`}>
                        <span className="material-icons-outlined text-xl">{icon}</span>
                      </div>
                      <div className="text-[9px] text-center text-slate-400 mt-1">{inq.channel}</div>
                    </td>

                    {/* Customer Info (MOVED LEFT) */}
                    <td className="px-4 py-3 align-middle">
                      <div className="font-bold text-slate-800 text-base">{inq?.customer?.name}</div>
                      <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                        <span className="material-icons-outlined text-[14px]">phone</span>
                        {inq?.customer?.phone}
                      </div>
                    </td>

                    {/* Status (Editable) */}
                    <td className="px-4 py-3 align-middle" onClick={(e) => e.stopPropagation()}>
                       <select 
                         value={inq.status}
                         onChange={(e) => handleStatusChange(inq.id, e.target.value as InquiryStatus)}
                         className={`block w-full rounded-md border-0 py-1.5 pl-2 pr-6 ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-brand-600 sm:text-xs sm:leading-6 font-bold cursor-pointer border ${getStatusStyle(inq.status)}`}
                       >
                         {Object.values(InquiryStatus).map(s => <option key={s} value={s}>{s}</option>)}
                       </select>
                    </td>

                    {/* Timestamp */}
                    <td className="px-4 py-3 align-middle text-xs text-slate-500">
                      <div>{inq?.timestamp?.split(' ')[0]}</div>
                      <div className="text-[10px]">{inq?.timestamp?.split(' ')[1]}</div>
                    </td>

                    {/* Vehicle Info */}
                    <td className="px-4 py-3 align-middle">
                        {inq.vehicle ? (
                            <div className="flex items-center gap-3">
                                <div className={`w-4 h-4 rounded-full shadow-sm border ${getColorClass(inq.vehicle.color)}`} title={inq.vehicle.color}></div>
                                <div>
                                    <div className="font-bold text-slate-800 text-sm">{inq.vehicle.model}</div>
                                    <div className="text-xs text-slate-500">
                                        {inq.vehicle.year && `${inq.vehicle.year}年式`}
                                        {inq.vehicle.mileage && ` / ${inq.vehicle.mileage}`}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <span className="text-xs text-slate-400">-</span>
                        )}
                    </td>

                    {/* Sales Rep (Editable) */}
                    <td className="px-4 py-3 align-middle" onClick={(e) => e.stopPropagation()}>
                       <select 
                         value={inq?.customer?.repName || inq?.slip?.salesRep || '未定'}
                         onChange={(e) => handleRepChange(inq.id, e.target.value)}
                         className="block w-full rounded-md border-slate-200 py-1 pl-2 pr-6 text-xs text-slate-700 focus:border-brand-500 focus:ring-brand-500"
                       >
                           {STAFF_MEMBERS.map(staff => <option key={staff} value={staff}>{staff}</option>)}
                       </select>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3 align-middle text-center">
                        <div className="flex justify-center gap-2" onClick={(e) => e.stopPropagation()}>
                            <button 
                                onClick={(e) => openMessageModal(e, 'EMAIL', inq.id)}
                                className="p-2 rounded-full text-slate-400 hover:text-orange-500 hover:bg-orange-50 transition-colors" title="メール作成"
                            >
                                <span className="material-icons-outlined">mail</span>
                            </button>
                            <button 
                                onClick={(e) => openMessageModal(e, 'SMS', inq.id)}
                                className="p-2 rounded-full text-slate-400 hover:text-blue-500 hover:bg-blue-50 transition-colors" title="SMS送信"
                            >
                                <span className="material-icons-outlined">sms</span>
                            </button>
                            <button 
                                onClick={() => navigate(`/inquiries/${inq.id}`)}
                                className="p-2 rounded-full text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition-colors" title="詳細・伝票編集"
                            >
                                <span className="material-icons-outlined">edit_note</span>
                            </button>
                        </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Message Modal */}
      {messageModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
           <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 transform transition-all scale-100 animate-fade-in">
              <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                     <span className="material-icons-outlined text-brand-600">
                         {messageModal.type === 'SMS' ? 'sms' : 'mail'}
                     </span>
                     {messageModal.type === 'SMS' ? 'SMS' : 'メール'}送信
                  </h3>
                  <button onClick={() => setMessageModal({...messageModal, isOpen: false})} className="text-slate-400 hover:text-slate-600">
                      <span className="material-icons-outlined">close</span>
                  </button>
              </div>
              
              <div className="mb-4 bg-slate-50 p-3 rounded-lg border border-slate-100 text-sm text-slate-600">
                  <span className="font-bold">宛先:</span> {inquiries.find(i => i?.id === messageModal.targetId)?.customer?.name} 様
              </div>

              <textarea 
                 value={messageBody}
                 onChange={(e) => setMessageBody(e.target.value)}
                 className="w-full h-32 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none mb-4 text-sm"
                 placeholder="メッセージを入力してください..."
              />

              <div className="flex gap-3 justify-end">
                  <button 
                    onClick={() => setMessageModal({...messageModal, isOpen: false})}
                    className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 font-medium text-sm transition-colors"
                  >
                      キャンセル
                  </button>
                  <button 
                    onClick={sendMessage}
                    className="px-4 py-2 rounded-lg bg-brand-600 text-white hover:bg-brand-700 font-bold text-sm shadow-md transition-colors flex items-center gap-1"
                  >
                      <span className="material-icons-outlined text-sm">send</span>
                      送 信
                  </button>
              </div>
           </div>
        </div>
      )}
    </>
  );
};

export default InquiryList;