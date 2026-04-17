import React, { useState, useEffect, Suspense } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { InquiryStatus, ChannelType, Inquiry, CommunicationHistory, MessageTemplate } from '../types';
import { storageService } from '../services/storageService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import ImageGallery from './ImageGallery';

// Helper components
const RadioGroup = ({ value, onChange, options }: { value: any, onChange: (val: any) => void, options: string[] }) => (
  <div className="flex flex-wrap gap-2">
    {options.map(opt => (
      <button
        key={opt}
        onClick={(e) => { e.preventDefault(); onChange(value === opt ? undefined : opt); }}
        className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${value === opt ? 'bg-brand-50 border-brand-500 text-brand-700' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:border-slate-300'}`}
      >
        {opt}
      </button>
    ))}
  </div>
);

const CheckboxGroup = ({ values = [], onChange, options, columns = 2 }: { values?: string[], onChange: (val: string[]) => void, options: string[], columns?: number }) => {
  const toggle = (opt: string) => {
    if (values.includes(opt)) {
      onChange(values.filter(v => v !== opt));
    } else {
      onChange([...values, opt]);
    }
  };
  const gridColsClass = columns === 3 ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2';
  return (
    <div className={`grid ${gridColsClass} gap-2`}>
      {options.map(opt => (
        <button
          key={opt}
          onClick={(e) => { e.preventDefault(); toggle(opt); }}
          className={`px-3 py-1.5 rounded text-xs font-bold border transition-colors text-left flex items-center ${values.includes(opt) ? 'bg-brand-50 border-brand-500 text-brand-700' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:border-slate-300'}`}
        >
          <span className="material-icons-outlined text-[14px] mr-1">
            {values.includes(opt) ? 'check_box' : 'check_box_outline_blank'}
          </span>
          {opt}
        </button>
      ))}
    </div>
  );
};

const Section = ({ id, title, icon, isOpen, onToggle, children, badgeCount, badgeTotal }: any) => (
  <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden mb-6 transition-shadow hover:shadow-lg">
    <div 
      className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors"
      onClick={() => onToggle(id)}
    >
      <div className="flex items-center gap-2">
        <span className="material-icons-outlined text-brand-600">{icon}</span>
        <h3 className="font-bold text-slate-800">{title}</h3>
        {badgeTotal > 0 && (
          <span className="ml-3 text-xs font-bold bg-brand-100 text-brand-700 px-2 py-0.5 rounded-full">
            {badgeCount}/{badgeTotal} 入力済
          </span>
        )}
      </div>
      <span className="material-icons-outlined text-slate-400">
        {isOpen ? 'expand_less' : 'expand_more'}
      </span>
    </div>
    {isOpen && <div className="p-6 space-y-6">{children}</div>}
  </div>
);

const CurrencyInput = ({ value, onChange }: { value: string | undefined, onChange: (val: string) => void }) => (
  <div className="relative">
    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold">¥</span>
    <input 
      type="text" 
      value={value || ''}
      onChange={(e) => {
        const val = e.target.value.replace(/[^0-9]/g, '');
        onChange(val ? Number(val).toLocaleString() : '');
      }}
      className="w-full bg-slate-50 border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors pl-8"
    />
  </div>
);

const countFilled = (obj: any, keys: string[]) => {
  if (!obj) return 0;
  return keys.filter(k => {
    const val = obj[k];
    if (Array.isArray(val)) return val.length > 0;
    if (typeof val === 'boolean') return true;
    return val !== undefined && val !== null && val !== '';
  }).length;
};

// Lazy load the PDF Modal to prevent initialization errors during app startup
const SlipPreviewModal = React.lazy(() => import('./SlipPreviewModal'));

// Mock History Data
const MOCK_HISTORY: CommunicationHistory[] = [
    { id: '3', type: '受信', method: 'LINE', date: '2023/10/27 11:00', content: '明日の13時に伺ってもよろしいですか？', agent: 'お客様' },
    { id: '2', type: '送信', method: 'LINE', date: '2023/10/27 10:45', content: 'お問い合わせありがとうございます。査定担当の佐藤です。今週末ですと、29日(日)の13時はいかがでしょうか？', agent: '佐藤' },
    { id: '1', type: '受信', method: 'LINE', date: '2023/10/27 10:30', content: '乗り換えのため売却を検討しています。左リアバンパーに小傷があります。今週末の査定は可能でしょうか？', agent: 'お客様' },
];

const InquiryDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  
  const [originalData, setOriginalData] = useState<Inquiry | undefined>(undefined);
  const [formData, setFormData] = useState<Inquiry | undefined>(undefined);
  
  // Messaging State
  const [draftMessage, setDraftMessage] = useState('');
  const [messageType, setMessageType] = useState<'SMS' | 'EMAIL'>('SMS');
  const [history, setHistory] = useState<CommunicationHistory[]>(MOCK_HISTORY);
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);

  // Preview Modal State
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [isSending, setIsSending] = useState(false);
  
  const [isLockedByOther, setIsLockedByOther] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    A: true,
    B: true,
    C: false,
    D: false,
    E: false,
    F: false,
    G: false,
    H: false,
    I: false,
    J: false,
  });

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    const loadData = () => {
      if (id && user) {
        const found = storageService.getInquiryById(id);
        if (found) {
            // Check lock
            if (found.lockedBy && found.lockedBy !== user.id && found.lockedAt && (Date.now() - found.lockedAt < 5 * 60 * 1000)) {
                setIsLockedByOther(true);
            } else {
                setIsLockedByOther(false);
                storageService.lockInquiry(id, user.id);
            }

            const cloned = JSON.parse(JSON.stringify(found));
            
            // Only update if there are no unsaved changes, to prevent overwriting user input
            setOriginalData((prevOriginal) => {
              setFormData((prevForm) => {
                const hasUnsaved = JSON.stringify(prevOriginal) !== JSON.stringify(prevForm);
                if (!hasUnsaved) {
                  return cloned;
                }
                return prevForm;
              });
              return cloned;
            });
            
            if (cloned.history) {
              setHistory(cloned.history);
            }
        }
      }
      // Load templates
      setTemplates(storageService.getTemplates());
    };

    loadData();
    window.addEventListener('storage-updated', loadData);
    
    // Unlock on unmount
    return () => {
        window.removeEventListener('storage-updated', loadData);
        if (id && user && !isLockedByOther) {
            storageService.unlockInquiry(id, user.id);
        }
    };
  }, [id, user, isLockedByOther]);

  const hasUnsavedChanges = JSON.stringify(originalData) !== JSON.stringify(formData);

  if (!formData) {
    return <div className="p-8 text-center text-slate-500">案件が見つかりませんでした。</div>;
  }

  // Update handlers
  const updateSlip = (field: string, value: string | boolean | string[] | undefined) => {
    setFormData(prev => prev ? ({ ...prev, slip: { ...prev.slip, [field]: value } }) : undefined);
  };

  const updateCustomer = (field: string, value: string | undefined) => {
    setFormData(prev => prev ? ({ ...prev, customer: { ...prev.customer, [field]: value } }) : undefined);
  };

  const updateVehicle = (field: string, value: string | boolean | string[] | undefined) => {
    setFormData(prev => prev ? ({ ...prev, vehicle: { ...prev.vehicle, [field]: value } }) : undefined);
  };
  
  const updateImages = (newImages: string[]) => {
      setFormData(prev => {
          if (!prev) return undefined;
          const currentVehicle = prev.vehicle || {
              make: '', model: '', year: '', mileage: '', color: ''
          };
          return { ...prev, vehicle: { ...currentVehicle, images: newImages } };
      });
  };

  const handleSave = async () => {
      if (!user || !formData || !id || isSaving || isOffline || isLockedByOther) return;
      setIsSaving(true);
      try {
          // Simulate network delay for better UX
          await new Promise(resolve => setTimeout(resolve, 300));
          const updated = storageService.updateInquiry(id, formData, user.id, user.name);
          if (updated) {
              setOriginalData(JSON.parse(JSON.stringify(formData)));
              showToast("案件情報を保存しました。", "success");
          } else {
              showToast("保存に失敗しました。", "error");
          }
      } catch (error: unknown) {
          console.error(error);
          showToast(error instanceof Error ? error.message : "保存中にエラーが発生しました。", "error");
      } finally {
          setIsSaving(false);
      }
  };

  const handleDelete = () => {
      if (!user || !id || isLockedByOther) return;
      if (window.confirm("本当にこの案件を削除しますか？この操作は取り消せません。")) {
          try {
              const success = storageService.deleteInquiry(id, user.id, user.name);
              if (success) {
                  navigate('/');
              } else {
                  showToast("削除に失敗しました。", "error");
              }
          } catch (error: unknown) {
              console.error(error);
              showToast(error instanceof Error ? error.message : "削除中にエラーが発生しました。", "error");
          }
      }
  };

  const handleSendMessage = async () => {
      if (!draftMessage.trim() || !user || !id || isSending || isOffline) return;
      setIsSending(true);
      
      try {
          // Simulate network delay
          await new Promise(resolve => setTimeout(resolve, 500));
          
          const newMessage: CommunicationHistory = {
              id: Date.now().toString(),
              type: '送信',
              method: messageType,
              date: new Date().toLocaleString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }),
              content: draftMessage,
              agent: user.name
          };

          const newHistory = [newMessage, ...history];
          setHistory(newHistory);
          
          // Update the inquiry with the new history
          if (formData) {
            const updatedFormData = { ...formData, history: newHistory };
            setFormData(updatedFormData);
            // Auto-save when sending message
            storageService.updateInquiry(id, updatedFormData, user.id, user.name);
            setOriginalData(JSON.parse(JSON.stringify(updatedFormData)));
          }

          setDraftMessage('');
          showToast("メッセージを送信しました。", "success");
      } catch (error: unknown) {
          console.error(error);
          showToast("メッセージの送信に失敗しました。", "error");
      } finally {
          setIsSending(false);
      }
  };

  const handleApplyTemplate = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const templateId = e.target.value;
      if (!templateId) return;
      
      const template = templates.find(t => t.id === templateId);
      if (template) {
          setDraftMessage(prev => prev ? `${prev}\n${template.content}` : template.content);
      }
      e.target.value = ''; // Reset select
  };

  return (
    <>
      <div className="flex flex-col gap-6 max-w-7xl mx-auto pb-24">
        {/* Offline Warning */}
        {isOffline && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2 shadow-sm">
                <span className="material-icons-outlined">wifi_off</span>
                <span className="font-bold text-sm">現在オフラインです。ネットワーク接続が回復するまで保存できません。</span>
            </div>
        )}

        {/* Concurrent Edit Warning */}
        {isLockedByOther && (
            <div className="bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded-lg flex items-center gap-2 shadow-sm">
                <span className="material-icons-outlined">lock</span>
                <span className="font-bold text-sm">現在、他の担当者がこの案件を編集中です。上書き保存を防ぐため、編集機能が制限されています。</span>
            </div>
        )}

        {/* Top Header Navigation */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
              <button 
                  onClick={() => navigate('/')}
                  className="flex items-center text-slate-500 hover:text-brand-600 transition-colors font-medium text-sm"
                >
                  <span className="material-icons-outlined mr-1">arrow_back</span>
                  ダッシュボードへ戻る
              </button>
              {hasUnsavedChanges && !isLockedByOther && (
                  <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded border border-amber-200 flex items-center gap-1">
                      <span className="material-icons-outlined text-[14px]">warning</span>
                      未保存の変更があります
                  </span>
              )}
          </div>
          
          <div className="flex items-center gap-3">
             {/* Status Dropdown */}
             <div className={`flex items-center bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm ${isLockedByOther ? 'opacity-50' : ''}`}>
                <span className="text-xs text-slate-500 mr-2 font-bold">ステータス</span>
                <select 
                  value={formData.status} 
                  onChange={(e) => setFormData({...formData, status: e.target.value as InquiryStatus})}
                  disabled={isLockedByOther}
                  className="bg-transparent border-none text-sm font-bold text-slate-800 focus:ring-0 cursor-pointer p-0 disabled:cursor-not-allowed"
                >
                  {Object.values(InquiryStatus).map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
             </div>

             <button 
                onClick={handleSave}
                disabled={!hasUnsavedChanges || isSaving || isOffline || isLockedByOther}
                className={`text-sm font-bold py-2 px-4 rounded-lg shadow flex items-center gap-2 transition-colors ${
                    isSaving
                        ? 'bg-brand-400 text-white cursor-wait'
                        : (hasUnsavedChanges && !isOffline && !isLockedByOther)
                            ? 'bg-brand-600 hover:bg-brand-700 text-white' 
                            : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                }`}
             >
                {isSaving ? (
                    <>
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                        保存中...
                    </>
                ) : (
                    <>
                        <span className="material-icons-outlined text-sm">save</span>
                        保 存
                    </>
                )}
             </button>

             <button 
                  onClick={() => setIsPreviewOpen(true)}
                  className="bg-slate-800 hover:bg-slate-700 text-white text-sm font-bold py-2 px-4 rounded-lg shadow flex items-center gap-2 transition-colors"
              >
                  <span className="material-icons-outlined text-sm">print</span>
                  帳票出力
              </button>

              <button 
                  onClick={handleDelete}
                  disabled={isLockedByOther}
                  className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-sm font-bold py-2 px-4 rounded-lg shadow-sm flex items-center gap-2 transition-colors ml-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                  <span className="material-icons-outlined text-sm">delete</span>
                  削除
              </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* LEFT COLUMN: Main Information Forms */}
            <div className={`lg:col-span-2 space-y-6 ${isLockedByOther ? 'opacity-70 pointer-events-none' : ''}`}>
                
                {/* A. 顧客情報 */}
                <Section 
                  id="A" title="顧客情報" icon="person" 
                  isOpen={openSections.A} onToggle={toggleSection}
                  badgeCount={countFilled(formData?.customer, ['name', 'phone', 'address'])} badgeTotal={3}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div className="space-y-1">
                             <label className="text-xs font-bold text-slate-500">お名前</label>
                             <input 
                                type="text" 
                                value={formData?.customer?.name || ''}
                                onChange={(e) => updateCustomer('name', e.target.value)}
                                className="w-full bg-slate-50 border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors font-bold"
                             />
                         </div>
                         <div className="space-y-1">
                             <label className="text-xs font-bold text-slate-500">連絡先 (TEL)</label>
                             <input 
                                type="text" 
                                value={formData?.customer?.phone || ''}
                                onChange={(e) => updateCustomer('phone', e.target.value)}
                                className="w-full bg-slate-50 border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
                             />
                         </div>
                         <div className="md:col-span-2 space-y-1">
                             <label className="text-xs font-bold text-slate-500">住所</label>
                             <input 
                                type="text" 
                                value={formData?.customer?.address || ''}
                                onChange={(e) => updateCustomer('address', e.target.value)}
                                className="w-full bg-slate-50 border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
                                placeholder="例: 札幌市..."
                             />
                         </div>
                    </div>
                </Section>

                {/* B. 車両基本情報 */}
                <Section 
                  id="B" title="車両基本情報" icon="directions_car" 
                  isOpen={openSections.B} onToggle={toggleSection}
                  badgeCount={countFilled(formData?.vehicle, ['make', 'model', 'year', 'mileage', 'color', 'chassisNumber', 'modelCode', 'plateStatus', 'plateRegion', 'registrationNumber', 'driveType', 'transmission', 'fuelType', 'inspectionDate'])} badgeTotal={14}
                >
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500">メーカー</label>
                            <input type="text" value={formData?.vehicle?.make || ''} onChange={(e) => updateVehicle('make', e.target.value)} className="w-full bg-slate-50 border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500">車種名</label>
                            <input type="text" value={formData?.vehicle?.model || ''} onChange={(e) => updateVehicle('model', e.target.value)} className="w-full bg-slate-50 border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors font-bold" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500">年式</label>
                            <input type="text" value={formData?.vehicle?.year || ''} onChange={(e) => updateVehicle('year', e.target.value)} className="w-full bg-slate-50 border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500">走行距離</label>
                            <input type="text" value={formData?.vehicle?.mileage || ''} onChange={(e) => updateVehicle('mileage', e.target.value)} className="w-full bg-slate-50 border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500">車体色</label>
                            <select value={formData?.vehicle?.color || ''} onChange={(e) => updateVehicle('color', e.target.value)} className="w-full bg-slate-50 border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors">
                                <option value="">選択...</option>
                                {['白', '黒', 'シルバー', '赤', '青', '黄', '緑', 'ベージュ', 'ガンメタ', '紺', '水色', '紫', '茶', '金', '桃', '橙', 'グレー', 'その他'].map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500">車台番号</label>
                            <input type="text" value={formData?.vehicle?.chassisNumber || ''} onChange={(e) => updateVehicle('chassisNumber', e.target.value)} className="w-full bg-slate-50 border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors font-mono uppercase" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500">型式</label>
                            <input type="text" value={formData?.vehicle?.modelCode || ''} onChange={(e) => updateVehicle('modelCode', e.target.value)} className="w-full bg-slate-50 border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors" />
                        </div>
                        <div className="space-y-1 md:col-span-2">
                            <label className="text-xs font-bold text-slate-500">Noプレート</label>
                            <RadioGroup value={formData?.vehicle?.plateStatus} onChange={(v) => updateVehicle('plateStatus', v)} options={['あり', 'なし', '外し済み']} />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500">ナンバー地域</label>
                            <select value={formData?.vehicle?.plateRegion || ''} onChange={(e) => updateVehicle('plateRegion', e.target.value)} className="w-full bg-slate-50 border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors">
                                <option value="">選択...</option>
                                {['札幌', '室蘭', '旭川', 'その他'].map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500">登録番号</label>
                            <input type="text" value={formData?.vehicle?.registrationNumber || ''} onChange={(e) => updateVehicle('registrationNumber', e.target.value)} className="w-full bg-slate-50 border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500">駆動</label>
                            <RadioGroup value={formData?.vehicle?.driveType} onChange={(v) => updateVehicle('driveType', v)} options={['4WD', '2WD']} />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500">ミッション</label>
                            <RadioGroup value={formData?.vehicle?.transmission} onChange={(v) => updateVehicle('transmission', v)} options={['AT', 'MT']} />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500">燃料</label>
                            <select value={formData?.vehicle?.fuelType || ''} onChange={(e) => updateVehicle('fuelType', e.target.value)} className="w-full bg-slate-50 border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors">
                                <option value="">選択...</option>
                                {['ガソリン', 'ディーゼル', 'ガス', 'ハイブリッド', 'EV'].map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500">車検期限</label>
                            <input type="date" value={formData?.vehicle?.inspectionDate || ''} onChange={(e) => updateVehicle('inspectionDate', e.target.value)} className="w-full bg-slate-50 border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors" />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-bold text-slate-500">車両状態・査定メモ</label>
                        <textarea rows={4} value={formData?.vehicle?.conditionNotes || ''} onChange={(e) => updateVehicle('conditionNotes', e.target.value)} className="w-full bg-slate-50 border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors text-base p-3" placeholder="傷、凹み、エンジンの状態など..." />
                    </div>
                    <div className="border-t border-slate-100 pt-6">
                        <ImageGallery images={formData?.vehicle?.images || []} onImagesChange={updateImages} />
                    </div>
                </Section>

                {/* C. 所有者・書類情報 */}
                <Section 
                  id="C" title="所有者・書類情報" icon="description" 
                  isOpen={openSections.C} onToggle={toggleSection}
                  badgeCount={countFilled(formData?.vehicle, ['owner', 'registeredUser', 'hasVehicleInspectionCert', 'addressConfirmation', 'addressMoveCount']) + countFilled(formData?.slip, ['requiredDocs', 'registrationLocation', 'registrationExplained'])} badgeTotal={8}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500">所有者</label>
                            <input type="text" value={formData?.vehicle?.owner || ''} onChange={(e) => updateVehicle('owner', e.target.value)} className="w-full bg-slate-50 border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500">使用者</label>
                            <input type="text" value={formData?.vehicle?.registeredUser || ''} onChange={(e) => updateVehicle('registeredUser', e.target.value)} className="w-full bg-slate-50 border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500">車検証</label>
                            <RadioGroup value={formData?.vehicle?.hasVehicleInspectionCert ? '有り' : formData?.vehicle?.hasVehicleInspectionCert === false ? 'なし' : undefined} onChange={(v) => updateVehicle('hasVehicleInspectionCert', v === '有り' ? true : v === 'なし' ? false : undefined)} options={['有り', 'なし']} />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500">住所確認</label>
                            <RadioGroup value={formData?.vehicle?.addressConfirmation} onChange={(v) => updateVehicle('addressConfirmation', v)} options={['現住所', '引越あり']} />
                        </div>
                        {formData?.vehicle?.addressConfirmation === '引越あり' && (
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500">引越回数</label>
                                <input type="number" value={formData?.vehicle?.addressMoveCount || ''} onChange={(e) => updateVehicle('addressMoveCount', e.target.value)} className="w-full bg-slate-50 border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors" />
                            </div>
                        )}
                        <div className="space-y-1 md:col-span-2">
                            <label className="text-xs font-bold text-slate-500">必要書類</label>
                            <CheckboxGroup values={formData?.slip?.requiredDocs || []} onChange={(v) => updateSlip('requiredDocs', v)} options={['車検証', '一抹証', '印鑑証明', '実印', '認印', '住民票', '戸籍附表', '住居表示', '戸籍謄本', '理由書', '死亡物件書類', '念書', '免コピ', '口座情報', 'リサイクル券', '譲渡書類(ディーラー)', '譲渡書類(信販)']} columns={3} />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500">登録場所</label>
                            <input type="text" value={formData?.slip?.registrationLocation || ''} onChange={(e) => updateSlip('registrationLocation', e.target.value)} className="w-full bg-slate-50 border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500">札幌説明</label>
                            <RadioGroup value={formData?.slip?.registrationExplained ? '済' : formData?.slip?.registrationExplained === false ? '未' : undefined} onChange={(v) => updateSlip('registrationExplained', v === '済' ? true : v === '未' ? false : undefined)} options={['済', '未']} />
                        </div>
                    </div>
                </Section>

                {/* D. 受付・引取情報 */}
                <Section 
                  id="D" title="受付・引取情報" icon="local_shipping" 
                  isOpen={openSections.D} onToggle={toggleSection}
                  badgeCount={countFilled(formData?.slip, ['receptionName', 'receptionDate', 'stockNumber', 'stockDate', 'orderDate', 'salesRep', 'pickupRep', 'scheduledDate', 'scheduledAmPm', 'contactTiming', 'pickupMethod', 'pickupLocationType', 'pickupLocation', 'pickupRequired', 'pickupStore', 'pickupFee'])} badgeTotal={16}
                >
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500">受付者</label>
                            <input type="text" value={formData?.slip?.receptionName || ''} onChange={(e) => updateSlip('receptionName', e.target.value)} className="w-full bg-slate-50 border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500">受付日</label>
                            <input type="date" value={formData?.slip?.receptionDate || ''} onChange={(e) => updateSlip('receptionDate', e.target.value)} className="w-full bg-slate-50 border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500">入庫番号</label>
                            <input type="text" value={formData?.slip?.stockNumber || ''} onChange={(e) => updateSlip('stockNumber', e.target.value)} className="w-full bg-slate-50 border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500">入庫日</label>
                            <input type="date" value={formData?.slip?.stockDate || ''} onChange={(e) => updateSlip('stockDate', e.target.value)} className="w-full bg-slate-50 border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500">受注日</label>
                            <input type="date" value={formData?.slip?.orderDate || ''} onChange={(e) => updateSlip('orderDate', e.target.value)} className="w-full bg-slate-50 border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500">営業担当</label>
                            <input type="text" value={formData?.slip?.salesRep || ''} onChange={(e) => updateSlip('salesRep', e.target.value)} className="w-full bg-slate-50 border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500">引取担当</label>
                            <select value={formData?.slip?.pickupRep || ''} onChange={(e) => updateSlip('pickupRep', e.target.value)} className="w-full bg-slate-50 border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors">
                                <option value="">選択...</option>
                                {['児', '清', '武', '小', '宮', 'TMC', '持込', 'その他'].map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500">予定日</label>
                            <input type="date" value={formData?.slip?.scheduledDate || ''} onChange={(e) => updateSlip('scheduledDate', e.target.value)} className="w-full bg-slate-50 border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500">AM/PM</label>
                            <RadioGroup value={formData?.slip?.scheduledAmPm} onChange={(v) => updateSlip('scheduledAmPm', v)} options={['AM', 'PM']} />
                        </div>
                        <div className="space-y-1 md:col-span-3">
                            <label className="text-xs font-bold text-slate-500">連絡タイミング</label>
                            <CheckboxGroup values={formData?.slip?.contactTiming || []} onChange={(v) => updateSlip('contactTiming', v)} options={['引取', '店舗手続後引取', '朝Tel', '行く前Tel', '時間指定Tel', 'Tel不要', '持込']} columns={3} />
                        </div>
                        <div className="space-y-1 md:col-span-2">
                            <label className="text-xs font-bold text-slate-500">引取方法</label>
                            <RadioGroup value={formData?.slip?.pickupMethod} onChange={(v) => updateSlip('pickupMethod', v)} options={['可動', 'ウィンチ', 'ユニック']} />
                        </div>
                        <div className="space-y-1 md:col-span-2">
                            <label className="text-xs font-bold text-slate-500">引取場所種別</label>
                            <RadioGroup value={formData?.slip?.pickupLocationType} onChange={(v) => updateSlip('pickupLocationType', v)} options={['住', '駐', '職', '待合せ']} />
                        </div>
                        <div className="space-y-1 md:col-span-3">
                            <label className="text-xs font-bold text-slate-500">引取場所（住所）</label>
                            <input type="text" value={formData?.slip?.pickupLocation || ''} onChange={(e) => updateSlip('pickupLocation', e.target.value)} className="w-full bg-slate-50 border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500">引取要否</label>
                            <RadioGroup value={formData?.slip?.pickupRequired ? '必要' : formData?.slip?.pickupRequired === false ? '持込' : undefined} onChange={(v) => updateSlip('pickupRequired', v === '必要' ? true : v === '持込' ? false : undefined)} options={['必要', '持込']} />
                        </div>
                        {formData?.slip?.pickupRequired === false && (
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500">持込店舗名</label>
                                <input type="text" value={formData?.slip?.pickupStore || ''} onChange={(e) => updateSlip('pickupStore', e.target.value)} className="w-full bg-slate-50 border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors" />
                            </div>
                        )}
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500">引取料金</label>
                            <select value={formData?.slip?.pickupFee || ''} onChange={(e) => updateSlip('pickupFee', e.target.value)} className="w-full bg-slate-50 border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors">
                                <option value="">選択...</option>
                                {['サービス', '¥2,000', '¥3,000', 'その他'].map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                    </div>
                </Section>

                {/* E. 現場確認情報 */}
                <Section 
                  id="E" title="現場確認情報" icon="home_work" 
                  isOpen={openSections.E} onToggle={toggleSection}
                  badgeCount={countFilled(formData?.slip, ['largeVehicleAccess', 'hasKey', 'storageLocation', 'personalItemsCleared', 'snowRemovalRequested'])} badgeTotal={5}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500">大型車進入</label>
                            <RadioGroup value={formData?.slip?.largeVehicleAccess} onChange={(v) => updateSlip('largeVehicleAccess', v)} options={['可', '不可']} />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500">鍵</label>
                            <RadioGroup value={formData?.slip?.hasKey ? '有り' : formData?.slip?.hasKey === false ? '無し' : undefined} onChange={(v) => updateSlip('hasKey', v === '有り' ? true : v === '無し' ? false : undefined)} options={['有り', '無し']} />
                        </div>
                        <div className="space-y-1 md:col-span-2">
                            <label className="text-xs font-bold text-slate-500">保管場所</label>
                            <RadioGroup value={formData?.slip?.storageLocation} onChange={(v) => updateSlip('storageLocation', v)} options={['車庫内', '自宅敷地', '駐車場', '路上']} />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500">車内私物整理</label>
                            <RadioGroup value={formData?.slip?.personalItemsCleared} onChange={(v) => updateSlip('personalItemsCleared', v)} options={['依頼済', '未']} />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500">除雪依頼</label>
                            <RadioGroup value={formData?.slip?.snowRemovalRequested ? '済' : formData?.slip?.snowRemovalRequested === false ? '未' : undefined} onChange={(v) => updateSlip('snowRemovalRequested', v === '済' ? true : v === '未' ? false : undefined)} options={['済', '未']} />
                        </div>
                    </div>
                </Section>
                
                {/* F. 金額・説明チェック */}
                <Section 
                  id="F" title="金額・説明チェック" icon="payments" 
                  isOpen={openSections.F} onToggle={toggleSection}
                  badgeCount={countFilled(formData?.slip, ['purchasePrice', 'paymentMethod', 'carTaxExplained', 'carTaxNotes', 'weightTaxExplained', 'liabilityInsExplained', 'sealCertExpiryExplained', 'sealCertVerified', 'additionalDepositExplained'])} badgeTotal={9}
                >
                    {formData?.slip?.additionalDepositExplained && (
                        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg flex items-center gap-2 shadow-sm mb-4">
                            <span className="material-icons-outlined">warning</span>
                            <span className="font-bold text-sm">⚠ 現車装備を必ず確認してください！</span>
                        </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500">買取金額</label>
                            <CurrencyInput value={formData?.slip?.purchasePrice} onChange={(v) => updateSlip('purchasePrice', v)} />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500">支払方法</label>
                            <RadioGroup value={formData?.slip?.paymentMethod} onChange={(v) => updateSlip('paymentMethod', v)} options={['現金', '振込']} />
                        </div>
                        <div className="space-y-1 flex gap-4 items-end">
                            <div className="flex-1">
                                <label className="text-xs font-bold text-slate-500">車税の説明</label>
                                <CheckboxGroup values={formData?.slip?.carTaxExplained ? ['した'] : []} onChange={(v) => updateSlip('carTaxExplained', v.includes('した'))} options={['した']} columns={1} />
                            </div>
                            <div className="flex-[2]">
                                <label className="text-xs font-bold text-slate-500">車税備考</label>
                                <input type="text" value={formData?.slip?.carTaxNotes || ''} onChange={(e) => updateSlip('carTaxNotes', e.target.value)} className="w-full bg-slate-50 border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors" />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500">重量税の説明</label>
                            <CheckboxGroup values={formData?.slip?.weightTaxExplained ? ['した'] : []} onChange={(v) => updateSlip('weightTaxExplained', v.includes('した'))} options={['した']} columns={1} />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500">自賠責の説明</label>
                            <CheckboxGroup values={formData?.slip?.liabilityInsExplained ? ['した'] : []} onChange={(v) => updateSlip('liabilityInsExplained', v.includes('した'))} options={['した']} columns={1} />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500">印鑑証明 有効期限の説明</label>
                            <CheckboxGroup values={formData?.slip?.sealCertExpiryExplained ? ['した'] : []} onChange={(v) => updateSlip('sealCertExpiryExplained', v.includes('した'))} options={['した']} columns={1} />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500">印鑑証明 印影確認</label>
                            <CheckboxGroup values={formData?.slip?.sealCertVerified ? ['した'] : []} onChange={(v) => updateSlip('sealCertVerified', v.includes('した'))} options={['した']} columns={1} />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500">追加預託説明</label>
                            <CheckboxGroup values={formData?.slip?.additionalDepositExplained ? ['した'] : []} onChange={(v) => updateSlip('additionalDepositExplained', v.includes('した'))} options={['した']} columns={1} />
                        </div>
                    </div>
                </Section>

                {/* G. 手続き・ステータス */}
                <Section 
                  id="G" title="手続き・ステータス" icon="gavel" 
                  isOpen={openSections.G} onToggle={toggleSection}
                  badgeCount={countFilled(formData?.slip, ['cancellationStatus', 'cancellationFee', 'inquirySource', 'holdReason', 'lostReason', 'followUpDate'])} badgeTotal={6}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500">抹消手続き</label>
                            <RadioGroup value={formData?.slip?.cancellationStatus} onChange={(v) => updateSlip('cancellationStatus', v)} options={['一抹済', '有', '無']} />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500">抹消手続き料金</label>
                            <input list="cancellationFeeOptions" value={formData?.slip?.cancellationFee || ''} onChange={(e) => updateSlip('cancellationFee', e.target.value)} className="w-full bg-slate-50 border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors" placeholder="選択または入力" />
                            <datalist id="cancellationFeeOptions">
                                <option value="サービス" />
                                <option value="¥2,000" />
                                <option value="¥3,000" />
                            </datalist>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500">問合せ認知媒体</label>
                            <input type="text" value={formData?.slip?.inquirySource || ''} onChange={(e) => updateSlip('inquirySource', e.target.value)} className="w-full bg-slate-50 border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500">保留理由</label>
                            <select value={formData?.slip?.holdReason || ''} onChange={(e) => updateSlip('holdReason', e.target.value)} className="w-full bg-slate-50 border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors">
                                <option value="">選択...</option>
                                {['書類待', '日程待', '家族と相談', '金額', '不明'].map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500">未成約理由</label>
                            <select value={formData?.slip?.lostReason || ''} onChange={(e) => updateSlip('lostReason', e.target.value)} className="w-full bg-slate-50 border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors">
                                <option value="">選択...</option>
                                {['金額合わず', '日程合わず', '引続き乗る', '他社にも聞く', '知人に譲る', '教えてもらえず', 'その他'].map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500">フォロー予定日</label>
                            <input type="date" value={formData?.slip?.followUpDate || ''} onChange={(e) => updateSlip('followUpDate', e.target.value)} className="w-full bg-slate-50 border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors" />
                        </div>
                    </div>
                </Section>

                {/* H. タイヤ・パーツ・返却物 */}
                <Section 
                  id="H" title="タイヤ・パーツ・返却物" icon="build" 
                  isOpen={openSections.H} onToggle={toggleSection}
                  badgeCount={countFilled(formData?.slip, ['tireDisposal', 'tireDisposalFee', 'tireSize', 'tireSeason', 'wheelType', 'centerCap', 'batterySize', 'otherMakerInfo', 'returnItemExists', 'returnItemDetails', 'returnFee'])} badgeTotal={11}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500">タイヤ処分</label>
                            <RadioGroup value={formData?.slip?.tireDisposal} onChange={(v) => updateSlip('tireDisposal', v)} options={['無', '有（無料）', '有料']} />
                        </div>
                        {formData?.slip?.tireDisposal === '有料' && (
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500">タイヤ処分料金</label>
                                <CurrencyInput value={formData?.slip?.tireDisposalFee} onChange={(v) => updateSlip('tireDisposalFee', v)} />
                            </div>
                        )}
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500">タイヤサイズ</label>
                            <input type="text" value={formData?.slip?.tireSize || ''} onChange={(e) => updateSlip('tireSize', e.target.value)} className="w-full bg-slate-50 border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500">夏/冬</label>
                            <RadioGroup value={formData?.slip?.tireSeason} onChange={(v) => updateSlip('tireSeason', v)} options={['夏', '冬']} />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500">ホイール</label>
                            <RadioGroup value={formData?.slip?.wheelType} onChange={(v) => updateSlip('wheelType', v)} options={['アルミ', 'スチール']} />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500">センターキャップ</label>
                            <RadioGroup value={formData?.slip?.centerCap} onChange={(v) => updateSlip('centerCap', v)} options={['無', '要', '不要']} />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500">バッテリーサイズ</label>
                            <input type="text" value={formData?.slip?.batterySize || ''} onChange={(e) => updateSlip('batterySize', e.target.value)} className="w-full bg-slate-50 border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500">他メーカー等</label>
                            <input type="text" value={formData?.slip?.otherMakerInfo || ''} onChange={(e) => updateSlip('otherMakerInfo', e.target.value)} className="w-full bg-slate-50 border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500">返却物</label>
                            <RadioGroup value={formData?.slip?.returnItemExists ? '有' : formData?.slip?.returnItemExists === false ? '無' : undefined} onChange={(v) => updateSlip('returnItemExists', v === '有' ? true : v === '無' ? false : undefined)} options={['有', '無']} />
                        </div>
                        {formData?.slip?.returnItemExists && (
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500">返却物内容</label>
                                <input type="text" value={formData?.slip?.returnItemDetails || ''} onChange={(e) => updateSlip('returnItemDetails', e.target.value)} className="w-full bg-slate-50 border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors" />
                            </div>
                        )}
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500">返し物工賃</label>
                            <CurrencyInput value={formData?.slip?.returnFee} onChange={(v) => updateSlip('returnFee', v)} />
                        </div>
                    </div>
                </Section>

                {/* I. 車輌状態・リサイクル */}
                <Section 
                  id="I" title="車輌状態・リサイクル" icon="recycling" 
                  isOpen={openSections.I} onToggle={toggleSection}
                  badgeCount={countFilled(formData?.vehicle, ['vehicleConditions', 'freonType', 'srsStatus', 'sideSrsStatus']) + countFilled(formData?.slip, ['transportFee', 'recycleFeeCollected', 'recycleFeeAmount', 'recycleDepositStatus', 'recycleFeePurchase', 'recycleFeePayee', 'paymentStatus', 'vehicleCategory', 'specialNotes', 'depositCategory', 'depositPhase'])} badgeTotal={15}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1 md:col-span-2">
                            <label className="text-xs font-bold text-slate-500">車輌状況</label>
                            <CheckboxGroup values={formData?.vehicle?.vehicleConditions || []} onChange={(v) => updateVehicle('vehicleConditions', v)} options={['丸車', '前事故', '後事故', '右前事故', '左前事故', '右側面事故', '左側面事故', 'E/Gダメ', 'T/Mダメ', '横転', '水没', '火災', 'ガラ', '全損']} columns={3} />
                        </div>
                        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500">フロン</label>
                                <RadioGroup value={formData?.vehicle?.freonType} onChange={(v) => updateVehicle('freonType', v)} options={['R1234', 'HFC', 'CFC', 'AC無', 'ガス無']} />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500">SRS</label>
                                <RadioGroup value={formData?.vehicle?.srsStatus} onChange={(v) => updateVehicle('srsStatus', v)} options={['有', '無', '展開済']} />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500">サイドSRS</label>
                                <RadioGroup value={formData?.vehicle?.sideSrsStatus} onChange={(v) => updateVehicle('sideSrsStatus', v)} options={['有', '無', '展開済']} />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500">陸送費</label>
                            <CurrencyInput value={formData?.slip?.transportFee} onChange={(v) => updateSlip('transportFee', v)} />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500">リサイクル料 集金金額</label>
                            <CurrencyInput value={formData?.slip?.recycleFeeCollected} onChange={(v) => updateSlip('recycleFeeCollected', v)} />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500">リサイクル料金</label>
                            <CurrencyInput value={formData?.slip?.recycleFeeAmount} onChange={(v) => updateSlip('recycleFeeAmount', v)} />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500">預託状態</label>
                            <RadioGroup value={formData?.slip?.recycleDepositStatus} onChange={(v) => updateSlip('recycleDepositStatus', v)} options={['預託済', '未預託', '追加預託']} />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500">リサイクル料 仕入金額</label>
                            <CurrencyInput value={formData?.slip?.recycleFeePurchase} onChange={(v) => updateSlip('recycleFeePurchase', v)} />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500">リサイクル料 支払先</label>
                            <input type="text" value={formData?.slip?.recycleFeePayee || ''} onChange={(e) => updateSlip('recycleFeePayee', e.target.value)} className="w-full bg-slate-50 border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500">支払状況</label>
                            <select value={formData?.slip?.paymentStatus || ''} onChange={(e) => updateSlip('paymentStatus', e.target.value)} className="w-full bg-slate-50 border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors">
                                <option value="">選択...</option>
                                {['済', '未', '掛', 'AA', '損'].map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500">車輌区分</label>
                            <RadioGroup value={formData?.slip?.vehicleCategory} onChange={(v) => updateSlip('vehicleCategory', v)} options={['廃車', '国部車', '輸部車', '輸中車']} />
                        </div>
                        <div className="space-y-1 md:col-span-2">
                            <label className="text-xs font-bold text-slate-500">特記事項</label>
                            <CheckboxGroup values={formData?.slip?.specialNotes || []} onChange={(v) => updateSlip('specialNotes', v)} options={['マル急', '死亡物件', '還付あり', '一時保管', '無']} columns={3} />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500">預託区分</label>
                            <RadioGroup value={formData?.slip?.depositCategory} onChange={(v) => updateSlip('depositCategory', v)} options={['預託 済', '預託 待']} />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500">預託フェーズ</label>
                            <CheckboxGroup values={formData?.slip?.depositPhase || []} onChange={(v) => updateSlip('depositPhase', v)} options={['引取', 'フロン', '解体']} columns={3} />
                        </div>
                    </div>
                </Section>

                {/* J. 作業日程 */}
                <Section 
                  id="J" title="作業日程" icon="calendar_month" 
                  isOpen={openSections.J} onToggle={toggleSection}
                  badgeCount={countFilled(formData?.slip, ['removalDate', 'removalRep', 'moveDate', 'returnDate'])} badgeTotal={4}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500">取外日</label>
                            <input type="date" value={formData?.slip?.removalDate || ''} onChange={(e) => updateSlip('removalDate', e.target.value)} className="w-full bg-slate-50 border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500">取外担当</label>
                            <input type="text" value={formData?.slip?.removalRep || ''} onChange={(e) => updateSlip('removalRep', e.target.value)} className="w-full bg-slate-50 border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500">移動日</label>
                            <input type="date" value={formData?.slip?.moveDate || ''} onChange={(e) => updateSlip('moveDate', e.target.value)} className="w-full bg-slate-50 border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500">返却日</label>
                            <input type="date" value={formData?.slip?.returnDate || ''} onChange={(e) => updateSlip('returnDate', e.target.value)} className="w-full bg-slate-50 border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors" />
                        </div>
                    </div>
                </Section>

            </div>
            
            {/* RIGHT COLUMN: Communication & Notes */}
            <div className="lg:col-span-1 space-y-6">
                
                {/* Handover Note */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 shadow-sm">
                   <div className="flex items-center gap-2 mb-2 text-yellow-800">
                      <span className="material-icons-outlined">sticky_note_2</span>
                      <h3 className="font-bold text-lg">社内申し送り・備考</h3>
                   </div>
                   <textarea 
                      value={formData.handoverNote || ''}
                      onChange={(e) => setFormData({...formData, handoverNote: e.target.value})}
                      placeholder="次の担当者へのメモ..."
                      className="w-full bg-white border-yellow-300 rounded-lg text-lg p-4 focus:ring-2 focus:ring-yellow-400 focus:border-transparent min-h-[300px]"
                   />
                </div>

                {/* Communication Panel */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="px-4 py-3 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                        <h3 className="font-bold text-slate-800 text-base">メッセージ送信</h3>
                        <select 
                            onChange={handleApplyTemplate}
                            className="text-sm border-slate-300 rounded py-1 pl-2 pr-6 text-slate-600 focus:ring-brand-500 focus:border-brand-500"
                            value=""
                        >
                            <option value="" disabled>テンプレート...</option>
                            {templates.map(t => (
                                <option key={t.id} value={t.id}>{t.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="p-4 space-y-4">
                        <div className="flex gap-2">
                             <button 
                                onClick={() => setMessageType('SMS')}
                                className={`flex-1 py-2 rounded text-sm font-bold border transition-colors ${messageType === 'SMS' ? 'bg-brand-50 border-brand-200 text-brand-700' : 'bg-white border-slate-200 text-slate-500'}`}
                             >SMS</button>
                             <button 
                                onClick={() => setMessageType('EMAIL')}
                                className={`flex-1 py-2 rounded text-sm font-bold border transition-colors ${messageType === 'EMAIL' ? 'bg-orange-50 border-orange-200 text-orange-700' : 'bg-white border-slate-200 text-slate-500'}`}
                             >Email</button>
                        </div>
                        <div className="relative">
                            <textarea 
                                value={draftMessage}
                                onChange={(e) => setDraftMessage(e.target.value)}
                                className="w-full border-slate-300 rounded-lg text-lg p-4 min-h-[400px]"
                                placeholder="メッセージを入力..."
                            />
                        </div>
                        <div className="flex gap-2 justify-end">
                            <button 
                                onClick={handleSendMessage}
                                disabled={!draftMessage || isSending}
                                className="bg-brand-600 hover:bg-brand-700 text-white text-sm font-bold py-2.5 px-6 rounded shadow disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                            >
                                {isSending ? (
                                    <>
                                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                        送信中...
                                    </>
                                ) : (
                                    '送信'
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* History Timeline */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
                        <h3 className="font-bold text-slate-800 text-sm">対応履歴</h3>
                    </div>
                    <div className="max-h-80 overflow-y-auto p-4 space-y-4">
                        {history.map((item) => (
                            <div key={item.id} className="flex gap-3 items-start text-sm">
                                <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${item.agent === 'お客様' ? 'bg-slate-400' : 'bg-brand-500'}`} />
                                <div>
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <span className="font-bold text-slate-700 text-xs">{item.agent}</span>
                                        <span className="text-[10px] text-slate-400">{item.date}</span>
                                    </div>
                                    <p className="text-slate-600 bg-slate-50 p-2 rounded-lg text-xs leading-relaxed border border-slate-100 whitespace-pre-wrap">
                                        {item.content}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>

      </div>

      <Suspense fallback={
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white p-4 rounded-lg flex items-center gap-3">
                <span className="w-5 h-5 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></span>
                <span className="text-sm font-bold text-slate-700">帳票システム起動中...</span>
            </div>
        </div>
      }>
        {isPreviewOpen && (
            <SlipPreviewModal 
                isOpen={isPreviewOpen} 
                onClose={() => setIsPreviewOpen(false)} 
                data={formData}
                onUpdate={setFormData}
            />
        )}
      </Suspense>
    </>
  );
};

export default InquiryDetail;