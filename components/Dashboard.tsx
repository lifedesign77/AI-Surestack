import React, { useState, useEffect } from 'react';
import { ChannelType, InquiryStatus, Inquiry } from '../types';
import { storageService } from '../services/storageService';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend
} from 'recharts';

const Dashboard: React.FC = () => {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);

  const fetchInquiries = () => {
    setInquiries(storageService.getInquiries());
  };

  useEffect(() => {
    // Load from storage service
    fetchInquiries();
    window.addEventListener('storage-updated', fetchInquiries);
    return () => window.removeEventListener('storage-updated', fetchInquiries);
  }, []);

  const totalInquiries = inquiries.length;
  const doneStatuses = [InquiryStatus.CLOSED_SUCCESS, InquiryStatus.CLOSED_LOST, InquiryStatus.CANCELLED];
  const successInquiries = inquiries.filter(i => i?.status === InquiryStatus.CLOSED_SUCCESS).length;
  
  const conversionRate = totalInquiries > 0 ? ((successInquiries / totalInquiries) * 100).toFixed(1) : '0.0';

  const COLORS = {
    [ChannelType.LINE]: '#10b981',
    [ChannelType.PHONE]: '#3b82f6',
    [ChannelType.EMAIL]: '#f97316',
    [ChannelType.FORM]: '#a855f7'
  };

  const channelStats = Object.values(ChannelType).map(channel => {
    const channelInquiries = inquiries.filter(i => i?.channel === channel);
    const count = channelInquiries.length;
    const success = channelInquiries.filter(i => i?.status === InquiryStatus.CLOSED_SUCCESS).length;
    const rate = count > 0 ? ((success / count) * 100).toFixed(0) : '0';
    
    let icon = 'help';
    let color = 'text-slate-500';
    if(channel === ChannelType.LINE) { icon = 'chat'; color = 'text-green-500'; }
    if(channel === ChannelType.PHONE) { icon = 'phone'; color = 'text-blue-500'; }
    if(channel === ChannelType.EMAIL) { icon = 'mail'; color = 'text-orange-500'; }
    if(channel === ChannelType.FORM) { icon = 'web'; color = 'text-purple-500'; }

    return { name: channel, count, rate, success, icon, color, fill: COLORS[channel] };
  });

  const statusData = Object.values(InquiryStatus).map(status => ({
    name: status,
    value: inquiries.filter(i => i?.status === status).length
  })).filter(d => d.value > 0);

  const STATUS_COLORS = ['#3b82f6', '#f59e0b', '#10b981', '#ef4444', '#64748b'];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10 printable-area bg-slate-50 print:bg-white min-h-screen">
      <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">ダッシュボード・分析レポート</h2>
          <p className="text-sm text-slate-500 mt-1">各種パフォーマンス指標の確認とレポート出力</p>
        </div>
        <button 
          onClick={handlePrint}
          className="bg-slate-800 hover:bg-slate-700 text-white text-sm font-bold py-2 px-6 rounded-lg shadow-md flex items-center gap-2 transition-transform active:scale-95 print:hidden"
        >
          <span className="material-icons-outlined text-sm">print</span>
          レポート資料出力
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-center">
            <p className="text-sm font-bold text-slate-500 mb-2 flex items-center gap-1">
               <span className="material-icons-outlined text-brand-500 text-sm">contact_phone</span>総問い合わせ数
            </p>
            <h3 className="text-4xl font-extrabold text-slate-800">{totalInquiries}<span className="text-sm font-medium text-slate-400 ml-1">件</span></h3>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-center">
            <p className="text-sm font-bold text-slate-500 mb-2 flex items-center gap-1">
               <span className="material-icons-outlined text-green-500 text-sm">verified</span>全体成約数
            </p>
            <h3 className="text-4xl font-extrabold text-slate-800">{successInquiries}<span className="text-sm font-medium text-slate-400 ml-1">件</span></h3>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-center">
            <p className="text-sm font-bold text-slate-500 mb-2 flex items-center gap-1">
               <span className="material-icons-outlined text-orange-500 text-sm">trending_up</span>全体成約率
            </p>
            <h3 className="text-4xl font-extrabold text-slate-800">{conversionRate}<span className="text-sm font-medium text-slate-400 ml-1">%</span></h3>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
           <h3 className="font-bold text-slate-700 mb-6 flex items-center gap-2">
               <span className="material-icons-outlined text-slate-400">bar_chart</span>
               媒体別 問い合わせ＆成約数
           </h3>
           <div className="h-[300px] w-full">
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={channelStats} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                 <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                 <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                 <RechartsTooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                 <Legend iconType="circle" wrapperStyle={{fontSize: '12px', paddingTop: '10px'}} />
                 <Bar dataKey="count" name="問い合わせ数" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                 <Bar dataKey="success" name="成約数" fill="#3b82f6" radius={[4, 4, 0, 0]} />
               </BarChart>
             </ResponsiveContainer>
           </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
           <h3 className="font-bold text-slate-700 mb-6 flex items-center gap-2">
               <span className="material-icons-outlined text-slate-400">donut_large</span>
               ステータス分布
           </h3>
           <div className="h-[300px] w-full">
             <ResponsiveContainer width="100%" height="100%">
               <PieChart>
                 <Pie
                   data={statusData}
                   cx="50%"
                   cy="50%"
                   innerRadius={80}
                   outerRadius={120}
                   paddingAngle={2}
                   dataKey="value"
                   label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                   labelLine={false}
                 >
                   {statusData.map((entry, index) => (
                     <Cell key={`cell-${index}`} fill={STATUS_COLORS[index % STATUS_COLORS.length]} />
                   ))}
                 </Pie>
                 <RechartsTooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                 <Legend iconType="circle" wrapperStyle={{fontSize: '12px'}} />
               </PieChart>
             </ResponsiveContainer>
           </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
         <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
            <h3 className="font-bold text-slate-700 flex items-center gap-2">
               <span className="material-icons-outlined text-slate-400">table_chart</span>
               媒体別パフォーマンス詳細
            </h3>
         </div>
         <div className="overflow-x-auto">
           <table className="w-full text-left">
              <thead className="bg-white text-xs text-slate-500 uppercase border-b border-slate-200">
                 <tr>
                    <th className="px-6 py-4 font-semibold">媒体</th>
                    <th className="px-6 py-4 font-semibold text-right">問い合わせ数</th>
                    <th className="px-6 py-4 font-semibold text-right">成約数</th>
                    <th className="px-6 py-4 font-semibold text-right">成約率</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                 {channelStats.map((stat) => (
                    <tr key={stat.name} className="hover:bg-slate-50 transition-colors">
                       <td className="px-6 py-4 flex items-center gap-3">
                          <span className={`material-icons-outlined ${stat.color}`}>{stat.icon}</span>
                          <span className="font-bold text-slate-700">{stat.name}</span>
                       </td>
                       <td className="px-6 py-4 text-right font-bold text-slate-600">{stat.count}件</td>
                       <td className="px-6 py-4 text-right font-bold text-slate-800">{stat.success}件</td>
                       <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-3">
                            <span className="font-bold text-slate-800 w-12">{stat.rate}%</span>
                            <div className="w-24 bg-slate-100 rounded-full h-2 overflow-hidden hidden sm:block">
                               <div 
                                  className={`h-full rounded-full ${parseInt(stat.rate) >= 50 ? 'bg-green-500' : 'bg-brand-500'}`} 
                                  style={{ width: `${stat.rate}%` }}
                               ></div>
                            </div>
                          </div>
                       </td>
                    </tr>
                 ))}
              </tbody>
           </table>
         </div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * { visibility: hidden; }
          .printable-area, .printable-area * { visibility: visible; }
          .printable-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 20px;
            background: white !important;
          }
          .print\\:hidden { display: none !important; }
          .print\\:bg-white { background-color: white !important; }
          .shadow-sm, .shadow-md { box-shadow: none !important; }
        }
      `}} />
    </div>
  );
};

export default Dashboard;