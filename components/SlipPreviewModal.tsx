import React from 'react';
import { Inquiry } from '../types';

interface SlipPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: Inquiry;
  onUpdate: (updatedData: Inquiry) => void;
}

const SlipPreviewModal: React.FC<SlipPreviewModalProps> = ({ isOpen, onClose, data, onUpdate }) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const v = data.vehicle || {} as any;
  const s = data.slip || {} as any;
  const c = data.customer || {} as any;

  // Simple formatter for arrays to string
  const formatList = (val: any) => Array.isArray(val) ? val.join('・') : val;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col">
        
        {/* Header Actions */}
        <div className="flex justify-between items-center p-4 border-b border-slate-200 bg-slate-50 rounded-t-xl shrink-0 print:hidden">
          <div>
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <span className="material-icons-outlined text-brand-600">assessment</span>
                伝票印刷プレビュー (モック版)
            </h2>
            <p className="text-xs text-red-500 font-bold mt-1">※本システム構築時にはコーディングを行い実際のExcel帳票（廃車受付シート）と同一のフォーマットで出力する機能を実装します。</p>
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
        <div className="flex-1 overflow-auto p-4 bg-slate-200 print:bg-white print:p-0">
           <div className="bg-white mx-auto p-8 shadow-sm printable-area text-xs" style={{ maxWidth: '800px', minHeight: '1122px', fontFamily: 'sans-serif' }}>
              <div className="flex justify-between items-end mb-2">
                 <h1 className="text-2xl font-bold tracking-widest border-b-2 border-black pb-1">廃車受付シート</h1>
                 <div className="text-right flex gap-4">
                    <p>受付日: {s.receptionDate || ''}</p>
                    <p>受付者: {s.receptionName || ''}</p>
                 </div>
              </div>

              {/* Top basic info block */}
              <div className="border-2 border-black p-2 mb-4 grid grid-cols-4 gap-2">
                 <div className="col-span-1">入庫No: <span className="font-bold border-b border-black inline-block min-w-[80px]">{s.stockNumber || ''}</span></div>
                 <div className="col-span-1">入庫日: <span className="border-b border-black inline-block min-w-[80px]">{s.stockDate || ''}</span></div>
                 <div className="col-span-1">注文日: <span className="border-b border-black inline-block min-w-[80px]">{s.orderDate || ''}</span></div>
                 <div className="col-span-1 border-l border-black pl-2">
                    営:<span className="inline-block w-8">{s.salesRep || ''}</span>
                    引:<span className="inline-block w-8">{s.pickupRep || ''}</span>
                 </div>
              </div>

              {/* Customer Info */}
               <table className="w-full border-collapse border-2 border-black mb-4">
                 <tbody>
                    <tr>
                       <th className="border border-black bg-gray-100 p-1 w-[15%] text-left">お客様名</th>
                       <td colSpan={3} className="border border-black p-1">{c.name || ''} ({c.kana || ''})</td>
                    </tr>
                    <tr>
                       <th className="border border-black bg-gray-100 p-1 text-left">電話番号</th>
                       <td className="border border-black p-1 w-[35%]">{c.phone || ''}</td>
                       <th className="border border-black bg-gray-100 p-1 w-[15%] text-left">住所</th>
                       <td className="border border-black p-1">{c.address || ''}</td>
                    </tr>
                 </tbody>
              </table>

              {/* Vehicle Info */}
              <div className="bg-black text-white px-2 py-0.5 font-bold mb-1">【車輌情報】</div>
              <table className="w-full border-collapse border-2 border-black mb-4">
                 <tbody>
                    <tr>
                       <th className="border border-black bg-gray-100 p-1 w-[15%] text-left">車名</th>
                       <td className="border border-black p-1 w-[35%]">{v.make || ''} {v.model || ''}</td>
                       <th className="border border-black bg-gray-100 p-1 w-[15%] text-left">ナンバー</th>
                       <td className="border border-black p-1"><span className="text-gray-500 mr-2">{v.plateStatus}</span> {v.plateRegion} {v.registrationNumber}</td>
                    </tr>
                    <tr>
                       <th className="border border-black bg-gray-100 p-1 text-left">車台番号</th>
                       <td className="border border-black p-1">{v.chassisNumber || ''}</td>
                       <th className="border border-black bg-gray-100 p-1 text-left">型式</th>
                       <td className="border border-black p-1">{v.modelCode || ''}</td>
                    </tr>
                    <tr>
                       <th className="border border-black bg-gray-100 p-1 text-left">年式/車検</th>
                       <td className="border border-black p-1">年式:{v.year||'　　'} / 車検:{v.inspectionDate||'　　'}</td>
                       <th className="border border-black bg-gray-100 p-1 text-left">仕様</th>
                       <td className="border border-black p-1">{v.driveType||''} / {v.transmission||''} / {v.fuelType||''} / {v.color||''} / {v.mileage ? `${v.mileage}km`:''}</td>
                    </tr>
                 </tbody>
              </table>

              {/* Owner and Docs Info */}
              <div className="flex gap-4 mb-4">
                 <div className="flex-1">
                    <div className="bg-black text-white px-2 py-0.5 font-bold mb-1">【所有者・書類】</div>
                    <table className="w-full border-collapse border border-black h-[120px]">
                       <tbody>
                          <tr>
                             <th className="border border-black bg-gray-100 p-1 w-[20%] text-left">所有者</th>
                             <td className="border border-black p-1">{v.owner || ''}</td>
                          </tr>
                          <tr>
                             <th className="border border-black bg-gray-100 p-1 text-left">使用者</th>
                             <td className="border border-black p-1">{v.registeredUser || ''}</td>
                          </tr>
                          <tr>
                             <th className="border border-black bg-gray-100 p-1 text-left">住所確認</th>
                             <td className="border border-black p-1">{v.addressConfirmation} (引越:{v.addressMoveCount||0}回)</td>
                          </tr>
                          <tr>
                             <th className="border border-black bg-gray-100 p-1 text-left">必要書類</th>
                             <td className="border border-black p-1" style={{fontSize: '0.65rem'}}>{formatList(s.requiredDocs)}</td>
                          </tr>
                       </tbody>
                    </table>
                 </div>
                 <div className="flex-1">
                    <div className="bg-black text-white px-2 py-0.5 font-bold mb-1">【チェック・料金】</div>
                    <table className="w-full border-collapse border border-black h-[120px]">
                       <tbody>
                          <tr>
                             <th className="border border-black bg-gray-100 p-1 w-[30%] text-left">買取金額</th>
                             <td className="border border-black p-1 font-bold">{s.purchasePrice ? `¥${s.purchasePrice.toLocaleString()}` : ''} ({s.paymentMethod||''})</td>
                          </tr>
                          <tr>
                             <th className="border border-black bg-gray-100 p-1 text-left">各種税金説明</th>
                             <td className="border border-black p-1 flex gap-2">
                                車税:{s.carTaxExplained? '済':'未'} / 重量税:{s.weightTaxExplained? '済':'未'} / 自賠責:{s.liabilityInsExplained? '済':'未'}
                             </td>
                          </tr>
                          <tr>
                             <th className="border border-black bg-gray-100 p-1 text-left">車税備考</th>
                             <td className="border border-black p-1">{s.carTaxNotes || ''}</td>
                          </tr>
                          <tr>
                             <th className="border border-black bg-gray-100 p-1 text-left">追加預託説明</th>
                             <td className="border border-black p-1 text-red-600 font-bold">{s.additionalDepositExplained ? '★説明済' : '未'}</td>
                          </tr>
                       </tbody>
                    </table>
                 </div>
              </div>

              {/* Pickup Info */}
              <div className="bg-black text-white px-2 py-0.5 font-bold mb-1">【引取情報】</div>
              <table className="w-full border-collapse border-2 border-black mb-4">
                 <tbody>
                    <tr>
                       <th className="border border-black bg-gray-100 p-1 w-[15%] text-left">引取場所</th>
                       <td colSpan={3} className="border border-black p-1 font-bold text-sm">
                           [{s.pickupLocationType || '未指定'}] {s.pickupLocation || ''} 
                           {s.pickupRequired === false && <span className="ml-4 text-red-600">(持込: {s.pickupStore})</span>}
                       </td>
                    </tr>
                    <tr>
                       <th className="border border-black bg-gray-100 p-1 text-left">予定日時</th>
                       <td className="border border-black p-1 w-[35%]">{s.scheduledDate || ''} ({s.scheduledAmPm || ''})</td>
                       <th className="border border-black bg-gray-100 p-1 w-[15%] text-left">連絡T</th>
                       <td className="border border-black p-1">{formatList(s.contactTiming)}</td>
                    </tr>
                    <tr>
                       <th className="border border-black bg-gray-100 p-1 text-left">引取方法</th>
                       <td className="border border-black p-1">{s.pickupMethod || ''}</td>
                       <th className="border border-black bg-gray-100 p-1 text-left">引取料金</th>
                       <td className="border border-black p-1">{s.pickupFee || ''}</td>
                    </tr>
                 </tbody>
              </table>

              {/* Field Check Info */}
              <div className="bg-black text-white px-2 py-0.5 font-bold mb-1">【現場確認・車両状態】</div>
              <table className="w-full border-collapse border-2 border-black mb-4">
                 <tbody>
                    <tr>
                       <th className="border border-black bg-gray-100 p-1 w-[15%] text-left">現場状況</th>
                       <td className="border border-black p-1 w-[35%]">
                          大型:{s.largeVehicleAccess||''} / 鍵:{s.hasKey===true?'有':s.hasKey===false?'無':''} / 保管:{s.storageLocation||''}
                       </td>
                       <th className="border border-black bg-gray-100 p-1 w-[15%] text-left">私物/除雪</th>
                       <td className="border border-black p-1">
                          整理:{s.personalItemsCleared||''} / 除雪:{s.snowRemovalRequested? '済':'未'}
                       </td>
                    </tr>
                    <tr>
                       <th className="border border-black bg-gray-100 p-1 text-left">特記事項</th>
                       <td colSpan={3} className="border border-black p-2 min-h-[40px] whitespace-pre-wrap">{v.conditionNotes || ''}</td>
                    </tr>
                 </tbody>
              </table>
              
              {/* Parts */}
              <div className="bg-black text-white px-2 py-0.5 font-bold mb-1">【タイヤ・パーツ・返却物】</div>
              <table className="w-full border-collapse border-2 border-black mb-4">
                 <tbody>
                    <tr>
                       <th className="border border-black bg-gray-100 p-1 w-[15%] text-left">タイヤ/ホイール</th>
                       <td className="border border-black p-1 w-[35%]">
                          処分:{s.tireDisposal||''} (料金:{s.tireDisposalFee||''})<br/>
                          サイズ:{s.tireSize||''} ({s.tireSeason||''})<br/>
                          ホイール:{s.wheelType||''} / キャップ:{s.centerCap||''}
                       </td>
                       <th className="border border-black bg-gray-100 p-1 w-[15%] text-left">返却物</th>
                       <td className="border border-black p-1">
                          有無:{s.returnItemExists?'有':'無'} / 内容:{s.returnItemDetails||''}
                       </td>
                    </tr>
                 </tbody>
              </table>

              <div className="mt-4 text-center text-red-500 font-bold border-t pt-2">
                 <p>※実際の開発環境では、この画面レイアウトではなく「直接Excelファイルとしてダウンロード」などの機能を提供可能です。</p>
              </div>
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
            margin: 0;
            padding: 0;
            box-shadow: none;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:bg-white {
            background-color: white !important;
          }
          .print\\:p-0 {
            padding: 0 !important;
          }
        }
      `}} />
    </div>
  );
};

export default SlipPreviewModal;