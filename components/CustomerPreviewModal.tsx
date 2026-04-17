import React from 'react';
import { CustomerInfo } from '../types';

interface CustomerPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  customers: CustomerInfo[];
}

const CustomerPreviewModal: React.FC<CustomerPreviewModalProps> = ({ isOpen, onClose, customers }) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col">
        
        {/* Header Actions */}
        <div className="flex justify-between items-center p-4 border-b border-slate-200 bg-slate-50 rounded-t-xl shrink-0 print:hidden">
          <div>
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <span className="material-icons-outlined text-brand-600">assessment</span>
                顧客情報一覧 帳票プレビュー
            </h2>
            <p className="text-xs text-red-500 font-bold mt-1">※本システム構築時にはコーディングを行いPDFやExcel帳票として出力する機能を実装します。現在のプロトタイプでは画面表示のみとしています。</p>
          </div>
          <div className="flex items-center gap-3">
             <button 
                onClick={handlePrint}
                className="px-4 py-2 bg-slate-800 text-white text-sm font-bold rounded-lg shadow hover:bg-slate-700 transition-colors flex items-center gap-2"
             >
                <span className="material-icons-outlined text-sm">print</span>
                ブラウザ機能で印刷
             </button>
             <button 
                onClick={onClose}
                className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors border border-slate-300"
             >
                閉じる
             </button>
          </div>
        </div>

        {/* Lightweight HTML View */}
        <div className="flex-1 overflow-auto p-8 bg-white print:p-0">
          <div className="max-w-4xl mx-auto printable-area">
             <h1 className="text-2xl font-bold text-center mb-6 text-slate-800 border-b-2 border-slate-800 pb-2">顧客情報一覧</h1>
             <table className="w-full border-collapse text-sm">
                <thead>
                   <tr className="bg-slate-100">
                      <th className="border border-slate-300 p-2 text-left font-bold text-slate-700">顧客名</th>
                      <th className="border border-slate-300 p-2 text-left font-bold text-slate-700">フリガナ</th>
                      <th className="border border-slate-300 p-2 text-left font-bold text-slate-700">電話番号</th>
                      <th className="border border-slate-300 p-2 text-left font-bold text-slate-700">メールアドレス</th>
                      <th className="border border-slate-300 p-2 text-left font-bold text-slate-700">住所</th>
                      <th className="border border-slate-300 p-2 text-left font-bold text-slate-700">担当者</th>
                   </tr>
                </thead>
                <tbody>
                   {customers.map((c, i) => (
                      <tr key={i} className="hover:bg-slate-50">
                         <td className="border border-slate-300 p-2 text-slate-800">{c.name}</td>
                         <td className="border border-slate-300 p-2 text-slate-600">{c.kana}</td>
                         <td className="border border-slate-300 p-2 text-slate-600">{c.phone}</td>
                         <td className="border border-slate-300 p-2 text-slate-600">{c.email}</td>
                         <td className="border border-slate-300 p-2 text-slate-600">{c.address}</td>
                         <td className="border border-slate-300 p-2 text-slate-600">{c.repName}</td>
                      </tr>
                   ))}
                   {customers.length === 0 && (
                     <tr>
                        <td colSpan={6} className="border border-slate-300 p-4 text-center text-slate-500">データがありません</td>
                     </tr>
                   )}
                </tbody>
             </table>
          </div>
        </div>
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * {
            visibility: hidden;
          }
          .printable-area, .printable-area * {
            visibility: visible;
          }
          .printable-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .print\\:hidden {
            display: none !important;
          }
        }
      `}} />
    </div>
  );
};

export default CustomerPreviewModal;
