import React, { useState, useEffect } from 'react';
import { storageService } from '../services/storageService';
import { MessageTemplate } from '../types';
import { useToast } from '../context/ToastContext';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'GENERAL' | 'TEMPLATES' | 'ACCOUNT'>('GENERAL');
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [editingTemplate, setEditingTemplate] = useState<MessageTemplate | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    if (isOpen) {
      setTemplates(storageService.getTemplates());
    }
  }, [isOpen]);

  const handleSaveTemplate = () => {
    if (!editingTemplate || !editingTemplate.name.trim() || !editingTemplate.content.trim()) {
      showToast('タイトルと本文を入力してください', 'warning');
      return;
    }

    if (editingTemplate.id) {
      storageService.updateTemplate(editingTemplate.id, {
        name: editingTemplate.name,
        content: editingTemplate.content
      });
      showToast('テンプレートを更新しました', 'success');
    } else {
      storageService.addTemplate({
        name: editingTemplate.name,
        content: editingTemplate.content
      });
      showToast('テンプレートを追加しました', 'success');
    }
    
    setTemplates(storageService.getTemplates());
    setEditingTemplate(null);
  };

  const handleDeleteTemplate = (id: string) => {
    if (window.confirm('このテンプレートを削除しますか？')) {
      storageService.deleteTemplate(id);
      setTemplates(storageService.getTemplates());
      showToast('テンプレートを削除しました', 'success');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl h-[80vh] flex overflow-hidden">
        
        {/* Sidebar */}
        <div className="w-64 bg-slate-50 border-r border-slate-200 p-4 flex flex-col">
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <span className="material-icons-outlined text-brand-600">settings</span>
            設定
          </h3>
          <nav className="space-y-1 flex-1">
            <button 
              onClick={() => { setActiveTab('GENERAL'); setEditingTemplate(null); }}
              className={`w-full text-left px-4 py-3 rounded-lg text-sm font-bold flex items-center gap-3 transition-colors ${activeTab === 'GENERAL' ? 'bg-white text-brand-600 shadow-sm ring-1 ring-slate-200' : 'text-slate-500 hover:bg-slate-100'}`}
            >
              <span className="material-icons-outlined">tune</span>
              一般設定
            </button>
            <button 
              onClick={() => { setActiveTab('TEMPLATES'); setEditingTemplate(null); }}
              className={`w-full text-left px-4 py-3 rounded-lg text-sm font-bold flex items-center gap-3 transition-colors ${activeTab === 'TEMPLATES' ? 'bg-white text-brand-600 shadow-sm ring-1 ring-slate-200' : 'text-slate-500 hover:bg-slate-100'}`}
            >
              <span className="material-icons-outlined">description</span>
              定型文管理
            </button>
            <button 
              onClick={() => { setActiveTab('ACCOUNT'); setEditingTemplate(null); }}
              className={`w-full text-left px-4 py-3 rounded-lg text-sm font-bold flex items-center gap-3 transition-colors ${activeTab === 'ACCOUNT' ? 'bg-white text-brand-600 shadow-sm ring-1 ring-slate-200' : 'text-slate-500 hover:bg-slate-100'}`}
            >
              <span className="material-icons-outlined">manage_accounts</span>
              アカウント
            </button>
          </nav>
          <div className="pt-4 border-t border-slate-200">
             <button onClick={onClose} className="w-full py-2 text-sm text-slate-500 hover:text-slate-800 font-bold">
               設定を閉じる
             </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8">
          
          {activeTab === 'GENERAL' && (
            <div className="space-y-8 animate-fade-in">
              <div>
                <h4 className="text-xl font-bold text-slate-800 mb-1">システム通知</h4>
                <p className="text-sm text-slate-500 mb-6">通知の受信設定を管理します</p>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                    <div>
                      <p className="font-bold text-slate-700">メール通知</p>
                      <p className="text-xs text-slate-500">新しい問い合わせがあった際にメールを受信する</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-600"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                    <div>
                      <p className="font-bold text-slate-700">デスクトップ通知</p>
                      <p className="text-xs text-slate-500">ブラウザのプッシュ通知を有効にする</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-600"></div>
                    </label>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="text-xl font-bold text-slate-800 mb-1">表示設定</h4>
                <div className="mt-4 grid grid-cols-3 gap-4">
                   <button className="border-2 border-brand-500 bg-brand-50 p-4 rounded-lg text-center">
                      <span className="material-icons-outlined text-brand-600 mb-2">light_mode</span>
                      <p className="text-sm font-bold text-brand-700">ライト</p>
                   </button>
                   <button className="border border-slate-200 p-4 rounded-lg text-center hover:bg-slate-50">
                      <span className="material-icons-outlined text-slate-400 mb-2">dark_mode</span>
                      <p className="text-sm font-bold text-slate-600">ダーク</p>
                   </button>
                   <button className="border border-slate-200 p-4 rounded-lg text-center hover:bg-slate-50">
                      <span className="material-icons-outlined text-slate-400 mb-2">contrast</span>
                      <p className="text-sm font-bold text-slate-600">自動</p>
                   </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'TEMPLATES' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="text-xl font-bold text-slate-800 mb-1">定型文テンプレート</h4>
                  <p className="text-sm text-slate-500">よく使う返信文を登録・編集します</p>
                </div>
                {!editingTemplate && (
                  <button 
                    onClick={() => setEditingTemplate({ id: '', name: '', content: '' })}
                    className="bg-brand-600 text-white px-3 py-2 rounded-lg text-sm font-bold hover:bg-brand-700 flex items-center gap-1"
                  >
                    <span className="material-icons-outlined text-sm">add</span>
                    新規作成
                  </button>
                )}
              </div>

              {editingTemplate ? (
                <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">テンプレート名</label>
                    <input 
                      type="text" 
                      value={editingTemplate.name}
                      onChange={(e) => setEditingTemplate({...editingTemplate, name: e.target.value})}
                      className="w-full border-slate-300 rounded-lg shadow-sm focus:ring-brand-500 focus:border-brand-500 sm:text-sm p-2 border"
                      placeholder="例：初回連絡（SMS）"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">本文</label>
                    <textarea 
                      value={editingTemplate.content}
                      onChange={(e) => setEditingTemplate({...editingTemplate, content: e.target.value})}
                      className="w-full border-slate-300 rounded-lg shadow-sm focus:ring-brand-500 focus:border-brand-500 sm:text-sm p-2 border h-32"
                      placeholder="テンプレートの本文を入力..."
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button 
                      onClick={() => setEditingTemplate(null)}
                      className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
                    >
                      キャンセル
                    </button>
                    <button 
                      onClick={handleSaveTemplate}
                      className="px-4 py-2 text-sm font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-lg transition-colors"
                    >
                      保存する
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {templates.map(tpl => (
                    <div key={tpl.id} className="border border-slate-200 rounded-xl p-4 hover:border-brand-300 transition-colors group">
                      <div className="flex justify-between items-start mb-2">
                         <h5 className="font-bold text-slate-800">{tpl.name}</h5>
                         <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => setEditingTemplate(tpl)} className="text-slate-400 hover:text-brand-600"><span className="material-icons-outlined text-lg">edit</span></button>
                            <button onClick={() => handleDeleteTemplate(tpl.id)} className="text-slate-400 hover:text-red-600"><span className="material-icons-outlined text-lg">delete</span></button>
                         </div>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-lg text-xs text-slate-600 font-mono whitespace-pre-wrap">
                        {tpl.content}
                      </div>
                    </div>
                  ))}
                  {templates.length === 0 && (
                    <div className="text-center py-8 text-slate-400">
                      <p>テンプレートがありません。</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'ACCOUNT' && (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 animate-fade-in">
               <span className="material-icons-outlined text-6xl mb-4 text-slate-300">construction</span>
               <p className="text-lg font-bold">アカウント管理機能は準備中です</p>
               <p className="text-sm">管理者に問い合わせてください</p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default SettingsModal;