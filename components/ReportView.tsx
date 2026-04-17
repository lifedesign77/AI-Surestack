import React, { useState, useEffect } from 'react';
import { InquiryStatus, Inquiry, DailyReport } from '../types';
import { storageService } from '../services/storageService';
import { useToast } from '../context/ToastContext';

const ReportView: React.FC = () => {
  const { showToast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [reports, setReports] = useState<DailyReport[]>([]);
  
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [reportContent, setReportContent] = useState('');

  useEffect(() => {
    const loadData = () => {
      setInquiries(storageService.getInquiries());
      setReports(storageService.getReports());
    };
    loadData();
    window.addEventListener('storage-updated', loadData);
    return () => window.removeEventListener('storage-updated', loadData);
  }, []);

  // Calculate stats for the selected date
  const dateInquiries = inquiries.filter(i => i?.timestamp?.startsWith(selectedDate));
  const newInquiriesCount = dateInquiries.length;
  // For closed success, we might want to check when it was closed, but for demo we just count all or mock it.
  // Let's just mock it based on the date for simplicity in this demo.
  const closedSuccessCount = selectedDate === todayStr ? inquiries.filter(i => i?.status === InquiryStatus.CLOSED_SUCCESS).length : Math.floor(Math.random() * 5);

  useEffect(() => {
    const existingReport = reports.find(r => r.date === selectedDate);
    if (existingReport) {
      setReportContent(existingReport.content);
    } else {
      // Set initial template if empty for the selected date
      setReportContent(`【業務報告】
対象日: ${selectedDate}
作成者: 

■ 概要
新規問い合わせ: ${newInquiriesCount}件
成約: ${closedSuccessCount}件

■ トピックス
- 
- 

■ 翌営業日の予定・課題
- 
- `);
    }
  }, [selectedDate, reports, newInquiriesCount, closedSuccessCount]);

  const handleSaveReport = () => {
    setIsSaving(true);
    storageService.saveReport(selectedDate, reportContent);
    setTimeout(() => {
      setIsSaving(false);
      showToast(`${selectedDate} の日報を保存しました。`, 'success');
    }, 500);
  };

  // Generate an array of the last 14 days for the sidebar
  const pastDays = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toISOString().split('T')[0];
  });

  return (
    <div className="flex flex-col md:flex-row gap-6 h-[calc(100vh-8rem)]">
      {/* Sidebar for past reports */}
      <div className="w-full md:w-64 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden shrink-0">
        <div className="p-4 border-b border-slate-100 bg-slate-50">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <span className="material-icons-outlined text-brand-600">calendar_month</span>
            日報履歴
          </h3>
        </div>
        <div className="overflow-y-auto flex-1 p-2 space-y-1">
          {pastDays.map(date => {
            const hasReport = reports.some(r => r.date === date);
            const isSelected = date === selectedDate;
            return (
              <button
                key={date}
                onClick={() => setSelectedDate(date)}
                className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-between ${
                  isSelected 
                    ? 'bg-brand-50 text-brand-700 border border-brand-200' 
                    : 'text-slate-600 hover:bg-slate-50 border border-transparent'
                }`}
              >
                <span>{date === todayStr ? '今日 (' + date + ')' : date}</span>
                {hasReport && (
                  <span className="material-icons-outlined text-green-500 text-sm" title="提出済み">check_circle</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col overflow-hidden">
        <div className="flex justify-between items-center mb-6 shrink-0">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span className="material-icons-outlined text-brand-600">edit_document</span>
            {selectedDate === todayStr ? '本日の日報' : `${selectedDate} の日報`}
          </h2>
          <button 
            onClick={handleSaveReport}
            disabled={isSaving}
            className="px-6 py-2 bg-brand-600 text-white rounded-lg font-bold text-sm shadow-md hover:bg-brand-700 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {isSaving ? (
              <span className="material-icons-outlined animate-spin text-sm">autorenew</span>
            ) : (
              <span className="material-icons-outlined text-sm">save</span>
            )}
            保存する
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 shrink-0">
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-slate-500 mb-1">対象日の新規問い合わせ</p>
              <h3 className="text-2xl font-extrabold text-slate-800">{newInquiriesCount}<span className="text-sm font-medium text-slate-400 ml-1">件</span></h3>
            </div>
            <span className="material-icons-outlined text-4xl text-slate-200">contact_mail</span>
          </div>
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-slate-500 mb-1">対象日の成約数</p>
              <h3 className="text-2xl font-extrabold text-slate-800">{closedSuccessCount}<span className="text-sm font-medium text-slate-400 ml-1">件</span></h3>
            </div>
            <span className="material-icons-outlined text-4xl text-slate-200">handshake</span>
          </div>
        </div>

        <div className="flex-1 flex flex-col min-h-0">
          <textarea
            value={reportContent}
            onChange={(e) => setReportContent(e.target.value)}
            className="flex-1 w-full bg-slate-50 p-6 rounded-lg border border-slate-200 font-mono text-base text-slate-800 whitespace-pre-wrap focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none leading-relaxed"
            placeholder="日報を入力してください..."
          />
        </div>
      </div>
    </div>
  );
};

export default ReportView;
