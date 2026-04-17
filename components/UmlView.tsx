import React from 'react';

const UmlView: React.FC = () => {
  return (
    <div className="space-y-12 pb-20">
      {/* System Explanation Section */}
      <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 bg-brand-600 text-white">
          <h2 className="text-2xl font-black flex items-center gap-3">
            <span className="material-icons-outlined">info</span>
            システム概要：石上車輛 顧客管理システム
          </h2>
          <p className="text-brand-100 mt-2 text-sm">
            本システムは、自動車買取・販売における「問い合わせ」から「成約」「車両引取」までを一気通貫で管理する業務基盤です。
          </p>
        </div>
        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-800 border-l-4 border-brand-500 pl-3">主な目的</h3>
            <ul className="space-y-2 text-sm text-slate-600 list-disc pl-5">
              <li>複数チャネル（LINE、電話、メール）からの問い合わせの一元管理</li>
              <li>手動入力ベースの確実なデータ管理と業務フローの標準化</li>
              <li>「エクセル風」の帳票出力を維持しつつ、Webネイティブな操作感を提供</li>
              <li>全社的な進捗状況の可視化と、成約率の向上</li>
            </ul>
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-800 border-l-4 border-brand-500 pl-3">主要な管理対象</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-xs font-black text-brand-600 mb-1 uppercase">Customer</p>
                <p className="text-xs text-slate-500 font-bold">顧客マスタ</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-xs font-black text-brand-600 mb-1 uppercase">Vehicle</p>
                <p className="text-xs text-slate-500 font-bold">車両データ</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-xs font-black text-brand-600 mb-1 uppercase">Inquiry</p>
                <p className="text-xs text-slate-500 font-bold">案件・対応履歴</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-xs font-black text-brand-600 mb-1 uppercase">DailyReport</p>
                <p className="text-xs text-slate-500 font-bold">日報・レポート</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Class Diagram Section */}
      <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span className="material-icons-outlined text-brand-600">account_tree</span>
            システムアーキテクチャ・クラス図
          </h2>
          <p className="text-xs text-slate-400 mt-1">フロントエンド、バックエンド、データベースの構成と主要なデータモデルを示します。</p>
        </div>
        <div className="p-8 overflow-x-auto">
          <div className="min-w-[800px] flex flex-col items-center gap-8 py-4">
            
            {/* Architecture Layers */}
            <div className="flex justify-center items-center gap-16 w-full max-w-4xl">
                {/* Frontend */}
                <div className="flex flex-col items-center">
                    <div className="w-48 bg-blue-50 border-2 border-blue-400 rounded-lg shadow-md overflow-hidden">
                        <div className="bg-blue-500 text-white p-2 text-center font-bold text-sm">Frontend (React)</div>
                        <div className="p-3 text-xs space-y-1 text-slate-700 text-center">
                            <p>UI Components</p>
                            <p>State Management</p>
                            <p>PDF Generation</p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center">
                    <div className="w-16 h-0.5 bg-slate-400 relative">
                        <div className="absolute right-0 -top-1 text-slate-400">▶</div>
                        <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] text-slate-500">Sync</div>
                    </div>
                </div>

                {/* Database */}
                <div className="flex flex-col items-center">
                    <div className="w-48 bg-orange-50 border-2 border-orange-400 rounded-lg shadow-md overflow-hidden">
                        <div className="bg-orange-500 text-white p-2 text-center font-bold text-sm">Storage</div>
                        <div className="p-3 text-xs space-y-1 text-slate-700 text-center">
                            <p>Local Storage</p>
                            <p>Data Persistence</p>
                            <p>Mock Data</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="w-full max-w-4xl border-t border-slate-200 my-4"></div>

            {/* Data Models */}
            <div className="flex justify-center items-start gap-12">
              {/* Customer Class */}
              <div className="w-48 bg-white border-2 border-slate-800 rounded-lg shadow-md overflow-hidden">
                <div className="bg-slate-800 text-white p-2 text-center font-bold text-sm">Customer</div>
                <div className="p-3 text-[10px] space-y-1 font-mono">
                  <p>+ id: string</p>
                  <p>+ name: string</p>
                  <p>+ phone: string</p>
                  <p>+ email: string</p>
                  <p>+ address: string</p>
                </div>
              </div>

              <div className="flex flex-col items-center pt-8">
                <div className="w-20 h-0.5 bg-slate-400 relative">
                  <div className="absolute right-0 -top-1 text-slate-400">▶</div>
                  <div className="absolute -top-5 left-0 text-[10px] font-bold text-slate-400">1</div>
                  <div className="absolute -top-5 right-0 text-[10px] font-bold text-slate-400">0..*</div>
                </div>
              </div>

              {/* Inquiry Class (Center) */}
              <div className="w-56 bg-white border-2 border-brand-600 rounded-lg shadow-lg overflow-hidden relative">
                <div className="bg-brand-600 text-white p-2 text-center font-bold text-sm">Inquiry</div>
                <div className="p-3 text-[10px] space-y-1 font-mono border-b border-slate-100">
                  <p>+ id: string</p>
                  <p>+ channel: ChannelType</p>
                  <p>+ status: InquiryStatus</p>
                  <p>+ lockedBy: string</p>
                  <p>+ lockedAt: number</p>
                </div>
                <div className="p-3 text-[10px] space-y-1 font-mono italic text-slate-500">
                  <p>+ updateStatus()</p>
                  <p>+ addHistory()</p>
                </div>
                {/* Connection to Vehicle */}
                <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-0.5 h-10 bg-slate-400">
                   <div className="absolute bottom-0 -left-1 text-slate-400 rotate-90">▶</div>
                </div>
                {/* Connection to Slip */}
                <div className="absolute -right-12 top-1/2 -translate-y-1/2 w-12 h-0.5 bg-slate-400">
                   <div className="absolute right-0 -top-1 text-slate-400">▶</div>
                </div>
              </div>

              {/* SlipData Class */}
              <div className="w-48 bg-white border-2 border-slate-800 rounded-lg shadow-md overflow-hidden">
                <div className="bg-slate-800 text-white p-2 text-center font-bold text-sm">SlipData</div>
                <div className="p-3 text-[10px] space-y-1 font-mono">
                  <p>+ stockNumber: string</p>
                  <p>+ receptionName: string</p>
                  <p>+ salesRep: string</p>
                  <p>+ scheduledDate: string</p>
                  <p className="text-slate-400 italic">+ ... (many fields)</p>
                </div>
              </div>
            </div>

            <div className="flex justify-center gap-12 mt-4">
               <div className="w-48"></div> {/* Spacer */}
               {/* Vehicle Class */}
               <div className="w-48 bg-white border-2 border-slate-800 rounded-lg shadow-md overflow-hidden">
                  <div className="bg-slate-800 text-white p-2 text-center font-bold text-sm">Vehicle</div>
                  <div className="p-3 text-[10px] space-y-1 font-mono">
                    <p>+ make: string</p>
                    <p>+ model: string</p>
                    <p>+ year: string</p>
                    <p>+ chassisNumber: string</p>
                    <p className="text-slate-400 italic">+ ... (many fields)</p>
                  </div>
                </div>
               <div className="w-48"></div> {/* Spacer */}
            </div>
          </div>
        </div>
      </section>

      {/* Activity Diagram Section */}
      <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span className="material-icons-outlined text-brand-600">route</span>
            アクティビティ図 (業務プロセス詳細)
          </h2>
          <p className="text-xs text-slate-400 mt-1">実際のUI操作とデータフローに即した構造です。</p>
        </div>
        
        <div className="p-8 overflow-x-auto bg-white">
          <div className="min-w-[800px] flex flex-col items-center py-4 space-y-12">
            
            {/* Block 1: 案件詳細の入力 */}
            <div className="w-full max-w-3xl border border-yellow-500 pt-8 pb-6 px-6 relative bg-yellow-50/10">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white px-4 text-yellow-600 text-sm">
                1. 「案件詳細」セクション (入力)
              </div>
              
              <div className="flex justify-center">
                <div className="flex flex-col items-center">
                  <div className="border border-orange-400 bg-white px-4 py-4 text-center text-sm w-56 text-slate-700">
                    顧客・車両・伝票情報を手入力<br/>(アコーディオン形式)
                  </div>
                  <div className="h-12 w-px bg-slate-400 relative">
                    <div className="absolute left-2 top-3 text-xs text-slate-500 w-14">直接入力</div>
                    <div className="absolute bottom-0 -left-1.5 text-slate-400 text-[10px]">▼</div>
                  </div>
                  <div className="border border-blue-400 rounded-full bg-white w-24 h-24 flex items-center justify-center text-sm text-slate-700 text-center">
                    入力データ
                  </div>
                  <div className="h-12 w-px bg-slate-400 relative">
                    <div className="absolute left-2 top-3 text-xs text-slate-500 w-14">データ反映</div>
                    <div className="absolute bottom-0 -left-1.5 text-slate-400 text-[10px]">▼</div>
                  </div>
                </div>
              </div>

              <div className="flex justify-center">
                <div className="border border-slate-400 bg-white px-6 py-4 text-center text-sm w-72 text-slate-700">
                  詳細画面へのデータ反映<br/>(システム内部処理)
                </div>
              </div>
              
              {/* Branching out */}
              <div className="flex justify-center mt-0">
                <div className="h-12 w-px bg-slate-400 relative">
                  <div className="absolute -left-16 top-3 text-xs text-slate-500 w-14 text-right">全件表示</div>
                  <div className="absolute bottom-0 -left-1.5 text-slate-400 text-[10px]">▼</div>
                </div>
              </div>
              
              <div className="flex justify-center relative">
                <div className="border border-slate-500 rounded-full bg-white w-32 h-32 flex items-center justify-center text-sm text-slate-700 text-center shadow-sm">
                  「詳細」タブ<br/>(全データ確認・修正)
                </div>
              </div>
            </div>

            {/* Down Arrow between blocks */}
            <div className="h-12 w-px bg-slate-400 relative -my-12 z-10">
               <div className="absolute bottom-0 -left-1.5 text-slate-400 text-[10px]">▼</div>
            </div>

            {/* Block 2: 顧客対応・メッセージ送信 */}
            <div className="w-full max-w-3xl border border-yellow-500 pt-8 pb-6 px-6 relative bg-yellow-50/10 mt-12">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white px-4 text-yellow-600 text-sm">
                2. 「顧客対応」セクション (送信)
              </div>
              
              <div className="flex justify-center gap-12">
                <div className="flex flex-col items-center">
                  <div className="border border-orange-400 bg-white px-4 py-4 text-center text-sm w-56 text-slate-700">
                    メッセージを手動で<br/>作成 (テキストエリア)
                  </div>
                  <div className="h-12 w-px bg-slate-400 relative">
                    <div className="absolute left-2 top-3 text-xs text-slate-500 w-14">直接入力</div>
                    <div className="absolute bottom-0 -left-1.5 text-slate-400 text-[10px]">▼</div>
                  </div>
                  <div className="border border-blue-400 rounded-full bg-white w-24 h-24 flex items-center justify-center text-sm text-slate-700 text-center">
                    入力された<br/>テキスト
                  </div>
                  <div className="h-12 w-px bg-slate-400 relative">
                    <div className="absolute left-2 top-3 text-xs text-slate-500 w-14">テキスト反映</div>
                    <div className="absolute bottom-0 -left-1.5 text-slate-400 text-[10px]">▼</div>
                  </div>
                </div>
                <div className="flex flex-col items-center">
                  <div className="border border-orange-400 bg-white px-4 py-4 text-center text-sm w-56 text-slate-700">
                    定型文から<br/>作成 (テンプレート)
                  </div>
                  <div className="h-12 w-px bg-slate-400 relative">
                    <div className="absolute left-2 top-3 text-xs text-slate-500 w-14">選択</div>
                    <div className="absolute bottom-0 -left-1.5 text-slate-400 text-[10px]">▼</div>
                  </div>
                  <div className="border border-blue-400 rounded-full bg-white w-24 h-24 flex items-center justify-center text-sm text-slate-700 text-center">
                    展開された<br/>テキスト
                  </div>
                  <div className="h-12 w-px bg-slate-400 relative">
                    <div className="absolute left-2 top-3 text-xs text-slate-500 w-14">テキスト展開</div>
                    <div className="absolute bottom-0 -left-1.5 text-slate-400 text-[10px]">▼</div>
                  </div>
                </div>
              </div>

              {/* Merge */}
              <div className="flex justify-center mt-0">
                <div className="w-[340px] h-px bg-slate-400"></div>
              </div>
              <div className="flex justify-center">
                <div className="h-8 w-px bg-slate-400 relative">
                  <div className="absolute bottom-0 -left-1.5 text-slate-400 text-[10px]">▼</div>
                </div>
              </div>
              
              <div className="flex justify-center">
                <div className="border border-slate-400 bg-white px-6 py-4 text-center text-sm w-72 text-slate-700">
                  SMS / Email 送信処理<br/>(システム内部処理)
                </div>
              </div>

              {/* Branching out */}
              <div className="flex justify-center mt-0">
                <div className="h-12 w-px bg-slate-400 relative">
                  <div className="absolute -left-16 top-3 text-xs text-slate-500 w-14 text-right">履歴保存</div>
                  <div className="absolute bottom-0 -left-1.5 text-slate-400 text-[10px]">▼</div>
                </div>
              </div>
              
              <div className="flex justify-center">
                <div className="border border-slate-500 rounded-full bg-white w-32 h-32 flex items-center justify-center text-sm text-slate-700 text-center shadow-sm">
                  「対応履歴」<br/>(送信内容の確認)
                </div>
              </div>
            </div>

            {/* Down Arrow between blocks */}
            <div className="h-12 w-px bg-slate-400 relative -my-12 z-10">
               <div className="absolute bottom-0 -left-1.5 text-slate-400 text-[10px]">▼</div>
            </div>

            {/* Block 3: ステータス管理・意思決定 */}
            <div className="w-full max-w-3xl border border-yellow-500 pt-8 pb-6 px-6 relative bg-yellow-50/10 mt-12">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white px-4 text-yellow-600 text-sm">
                3. 「ステータス管理」セクション (意思決定・後続処理)
              </div>
              
              <div className="flex justify-center">
                <div className="h-8 w-px bg-slate-400 relative">
                  <div className="absolute bottom-0 -left-1.5 text-slate-400 text-[10px]">▼</div>
                </div>
              </div>

              <div className="flex justify-center">
                <div className="border border-slate-400 bg-white px-6 py-4 text-center text-sm w-72 text-slate-700">
                  ステータス変更<br/>(システム内部処理)
                </div>
              </div>

              <div className="flex justify-center mt-0">
                <div className="h-8 w-px bg-slate-400 relative"></div>
              </div>
              <div className="flex justify-center">
                <div className="w-[480px] h-px bg-slate-400"></div>
              </div>

              <div className="flex justify-center gap-12">
                {/* 成約 Route */}
                <div className="flex flex-col items-center w-32">
                  <div className="h-8 w-px bg-slate-400 relative">
                    <div className="absolute -left-10 top-2 text-xs text-slate-500 w-8 text-right">成約</div>
                    <div className="absolute bottom-0 -left-1.5 text-slate-400 text-[10px]">▼</div>
                  </div>
                  <div className="border border-slate-500 rounded-full bg-white w-24 h-24 flex items-center justify-center text-sm text-slate-700 text-center shadow-sm">
                    「成約一覧」<br/>「引取一覧」<br/>へ反映
                  </div>
                  <div className="h-8 w-px bg-slate-400 relative border-dashed">
                    <div className="absolute bottom-0 -left-1.5 text-slate-400 text-[10px]">▼</div>
                  </div>
                  <div className="border border-slate-400 bg-white px-2 py-2 text-center text-xs w-28 text-slate-700">
                    帳票PDF発行
                  </div>
                </div>

                {/* 交渉中 Route */}
                <div className="flex flex-col items-center w-32">
                  <div className="h-8 w-px bg-slate-400 relative">
                    <div className="absolute left-2 top-2 text-xs text-slate-500 w-12">交渉中</div>
                    <div className="absolute bottom-0 -left-1.5 text-slate-400 text-[10px]">▼</div>
                  </div>
                  <div className="border border-slate-500 rounded-full bg-white w-24 h-24 flex items-center justify-center text-sm text-slate-700 text-center shadow-sm">
                    対応継続
                  </div>
                </div>

                {/* 失注 Route */}
                <div className="flex flex-col items-center w-32">
                  <div className="h-8 w-px bg-slate-400 relative">
                    <div className="absolute left-2 top-2 text-xs text-slate-500 w-8">失注</div>
                    <div className="absolute bottom-0 -left-1.5 text-slate-400 text-[10px]">▼</div>
                  </div>
                  <div className="border border-slate-500 rounded-full bg-white w-24 h-24 flex items-center justify-center text-sm text-slate-700 text-center shadow-sm">
                    案件終了
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* System Architecture Explanation */}
      <section className="bg-slate-900 text-white rounded-2xl p-8 shadow-xl">
        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
          <span className="material-icons-outlined text-brand-400">architecture</span>
          技術アーキテクチャの解説
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
          <div className="space-y-3">
            <h4 className="font-bold text-brand-400 border-b border-white/10 pb-2">Frontend (React/TS)</h4>
            <p className="text-slate-400 leading-relaxed">
              Viteによる高速なビルド環境と、TypeScriptによる型安全な開発を実現。
              Tailwind CSSにより、一貫性のあるデザインシステムを構築しています。
              オフライン状態の検知や、排他制御のUIフィードバックも担当します。
            </p>
          </div>
          <div className="space-y-3">
            <h4 className="font-bold text-brand-400 border-b border-white/10 pb-2">Database & Storage</h4>
            <p className="text-slate-400 leading-relaxed">
              デモ環境としてLocal Storageを活用し、スタンドアロンで動作する環境を構築。
              外部APIに依存せず、セキュアかつ高速なデータアクセスを実現しています。
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default UmlView;
