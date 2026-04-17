import React, { useState, useEffect, Suspense } from 'react';
import { CustomerInfo } from '../types';
import { storageService } from '../services/storageService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import CustomerHistoryModal from './CustomerHistoryModal';

// Lazy load the PDF Modal to prevent initialization errors during app startup
const CustomerPreviewModal = React.lazy(() => import('./CustomerPreviewModal'));

const CustomerList: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [customers, setCustomers] = useState<CustomerInfo[]>([]);
  const [editingCustomer, setEditingCustomer] = useState<CustomerInfo | null>(null);
  const [selectedHistoryCustomer, setSelectedHistoryCustomer] = useState<CustomerInfo | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  useEffect(() => {
    const fetchCustomers = () => setCustomers(storageService.getCustomers());
    fetchCustomers();
    window.addEventListener('storage-updated', fetchCustomers);
    return () => window.removeEventListener('storage-updated', fetchCustomers);
  }, []);

  const handleSave = () => {
    if (!editingCustomer || !user) return;
    try {
      storageService.updateCustomer(editingCustomer.id, editingCustomer, user.id, user.name);
      showToast('顧客情報を更新しました。', 'success');
      setEditingCustomer(null);
    } catch (error: unknown) {
      console.error(error);
      showToast(error instanceof Error ? error.message : '更新中にエラーが発生しました。', 'error');
    }
  };

  const handleDelete = (id: string) => {
    if (!user) return;
    if (window.confirm('本当にこの顧客を削除しますか？')) {
      try {
        storageService.deleteCustomer(id, user.id, user.name);
        showToast('顧客を削除しました。', 'success');
      } catch (error: unknown) {
        console.error(error);
        showToast(error instanceof Error ? error.message : '削除中にエラーが発生しました。', 'error');
      }
    }
  };

  const filteredCustomers = customers.filter(c => 
    c?.name?.includes(searchTerm) || 
    c?.kana?.includes(searchTerm) || 
    c?.phone?.includes(searchTerm)
  );

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden min-h-[600px] flex flex-col">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span className="material-icons-outlined text-brand-600">people</span>
            顧客情報管理
          </h2>
          <div className="flex items-center gap-4">
            <div className="relative">
              <span className="material-icons-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
              <input 
                type="text" 
                placeholder="名前、電話番号で検索..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm w-64"
              />
            </div>
            <button 
              onClick={() => setIsPreviewOpen(true)}
              className="bg-slate-800 hover:bg-slate-700 text-white text-sm font-bold py-2 px-4 rounded-lg shadow flex items-center gap-2 transition-colors"
            >
              <span className="material-icons-outlined text-sm">print</span>
              帳票出力
            </button>
          </div>
        </div>

        <div className="overflow-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-100 text-slate-500 text-xs uppercase tracking-wider sticky top-0 z-10 shadow-sm">
              <tr>
                <th className="px-6 py-3 font-semibold border-b border-slate-200">顧客名</th>
                <th className="px-6 py-3 font-semibold border-b border-slate-200">フリガナ</th>
                <th className="px-6 py-3 font-semibold border-b border-slate-200">電話番号</th>
                <th className="px-6 py-3 font-semibold border-b border-slate-200">メールアドレス</th>
                <th className="px-6 py-3 font-semibold border-b border-slate-200">住所</th>
                <th className="px-6 py-3 font-semibold border-b border-slate-200">担当者</th>
                <th className="px-6 py-3 font-semibold border-b border-slate-200 text-center">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCustomers.map((customer) => (
                <tr key={customer.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-800">{customer.name}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{customer.kana}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{customer.phone}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{customer.email}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{customer.address || '-'}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{customer.repName || '-'}</td>
                  <td className="px-6 py-4 text-center">
                    <button 
                      onClick={() => setSelectedHistoryCustomer(customer)}
                      className="text-slate-600 hover:text-slate-800 mr-3"
                      title="過去の履歴を見る"
                    >
                      <span className="material-icons-outlined text-sm">history</span>
                    </button>
                    <button 
                      onClick={() => setEditingCustomer(customer)}
                      className="text-brand-600 hover:text-brand-800 mr-3"
                      title="編集"
                    >
                      <span className="material-icons-outlined text-sm">edit</span>
                    </button>
                    <button 
                      onClick={() => handleDelete(customer.id)}
                      className="text-red-500 hover:text-red-700"
                      title="削除"
                    >
                      <span className="material-icons-outlined text-sm">delete</span>
                    </button>
                  </td>
                </tr>
              ))}
              {filteredCustomers.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                    該当する顧客が見つかりません。
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {editingCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4">顧客情報の編集</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">名前</label>
                <input 
                  type="text" 
                  value={editingCustomer.name}
                  onChange={(e) => setEditingCustomer({...editingCustomer, name: e.target.value})}
                  className="w-full border-slate-300 rounded-lg text-sm p-2"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">フリガナ</label>
                <input 
                  type="text" 
                  value={editingCustomer.kana || ''}
                  onChange={(e) => setEditingCustomer({...editingCustomer, kana: e.target.value})}
                  className="w-full border-slate-300 rounded-lg text-sm p-2"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">電話番号</label>
                <input 
                  type="text" 
                  value={editingCustomer.phone || ''}
                  onChange={(e) => setEditingCustomer({...editingCustomer, phone: e.target.value})}
                  className="w-full border-slate-300 rounded-lg text-sm p-2"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">メールアドレス</label>
                <input 
                  type="email" 
                  value={editingCustomer.email || ''}
                  onChange={(e) => setEditingCustomer({...editingCustomer, email: e.target.value})}
                  className="w-full border-slate-300 rounded-lg text-sm p-2"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">住所</label>
                <input 
                  type="text" 
                  value={editingCustomer.address || ''}
                  onChange={(e) => setEditingCustomer({...editingCustomer, address: e.target.value})}
                  className="w-full border-slate-300 rounded-lg text-sm p-2"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button 
                onClick={() => setEditingCustomer(null)}
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

      {isPreviewOpen && (
        <Suspense fallback={<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"><div className="bg-white p-4 rounded-lg">読み込み中...</div></div>}>
          <CustomerPreviewModal 
            isOpen={isPreviewOpen} 
            onClose={() => setIsPreviewOpen(false)} 
            customers={filteredCustomers}
          />
        </Suspense>
      )}

      {/* History Modal */}
      <CustomerHistoryModal 
        isOpen={!!selectedHistoryCustomer} 
        onClose={() => setSelectedHistoryCustomer(null)} 
        customer={selectedHistoryCustomer} 
      />
    </>
  );
};

export default CustomerList;
