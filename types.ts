export enum ChannelType {
  PHONE = 'Phone',
  LINE = 'LINE',
  EMAIL = 'Email',
  FORM = 'Web Form'
}

export enum InquiryStatus {
  UNREAD = '未読',
  CONTACTED = '初回連絡済',
  ASSESSMENT_SCHEDULED = '査定日確定',
  ASSESSED = '査定済み',
  NEGOTIATION = '金額交渉中',
  CONTRACT_PENDING_DOCS = '成約(書類待)',
  CONTRACT_PENDING_PAYMENT = '成約(入金待)',
  CLOSED_SUCCESS = '成約完了',
  CLOSED_LOST = '失注',
  CANCELLED = 'キャンセル'
}

export enum UserRole {
  ADMIN = 'admin',
  STAFF = 'staff'
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  email: string;
}

export interface VehicleInfo {
  make: string;
  model: string;
  year: string;
  mileage: string;
  color: string;
  inspectionDate?: string;
  chassisNumber?: string;
  plateStatus?: 'あり' | 'なし' | '外し済み';
  registrationNumber?: string;
  conditionNotes?: string;
  images?: string[];
  
  // --- 新規追加 ---
  modelCode?: string;        // 型式
  plateRegion?: string;      // ナンバー地域（札幌・室蘭・旭川 等）
  owner?: string;            // 所有者名
  registeredUser?: string;   // 使用者名
  driveType?: '4WD' | '2WD';
  transmission?: 'AT' | 'MT';
  fuelType?: 'ガソリン' | 'ディーゼル' | 'ガス' | 'ハイブリッド' | 'EV';
  hasVehicleInspectionCert?: boolean;  // 車検証 有無
  addressConfirmation?: '現住所' | '引越あり';
  addressMoveCount?: string;           // 引越回数

  // 車輌状況（Row 34）— 複数選択
  vehicleConditions?: string[];
  // フロン（Row 35）
  freonType?: 'R1234' | 'HFC' | 'CFC' | 'AC無' | 'ガス無';
  // SRS
  srsStatus?: '有' | '無' | '展開済';
  sideSrsStatus?: '有' | '無' | '展開済';
}

export interface CustomerInfo {
  id: string;
  name: string;
  kana: string;
  phone: string;
  email: string;
  address?: string;
  preferredContact?: string;
  repName?: string;
  contactPhone?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SlipData {
  receptionName?: string;
  salesRep?: string;
  stockNumber?: string;
  stockDate?: string;
  pickupRep?: string;
  receptionDate?: string;
  orderDate?: string;
  scheduledDate?: string;
  pickupMethod?: string;
  pickupLocation?: string;
  contactTiming?: string[];

  // --- 新規追加 ---
  scheduledAmPm?: 'AM' | 'PM';
  pickupLocationType?: '住' | '駐' | '職' | '待合せ';

  // 法務・書類
  largeVehicleAccess?: '可' | '不可';       // 大型車進入
  hasKey?: boolean;                          // 鍵 有無
  storageLocation?: '車庫内' | '自宅敷地' | '駐車場' | '路上';
  registrationLocation?: string;             // 登録場所
  registrationExplained?: boolean;           // 登録場所 説明済

  // 各種説明チェック
  carTaxExplained?: boolean;         // 車税の説明 した
  carTaxNotes?: string;              // 車税備考
  weightTaxExplained?: boolean;      // 重量税の説明 した
  liabilityInsExplained?: boolean;   // 自賠責の説明 した
  sealCertExpiryExplained?: boolean; // 印鑑証明の有効期限の説明 した
  sealCertVerified?: boolean;        // 印鑑証明の印影確認 チェック済

  // 書類チェック（複数選択）
  requiredDocs?: string[];

  // 取引
  purchasePrice?: string;            // 買取金額
  paymentMethod?: '現金' | '振込';
  cancellationStatus?: '一抹済' | '有' | '無';  // 抹消手続き
  cancellationFee?: string;          // 抹消手続き料金
  additionalDepositExplained?: boolean; // 追加預託説明

  // 引取
  pickupRequired?: boolean;          // 引取 必要
  pickupStore?: string;              // 持込店舗名
  pickupFee?: string;                // 引取料金

  // 認知・成約
  inquirySource?: string;            // 問合せ認知媒体
  holdReason?: string;               // 保留理由
  lostReason?: string;               // 未成約理由
  followUpDate?: string;             // フォロー予定日

  // タイヤ
  tireDisposal?: '無' | '有(無料)' | '有料';
  tireDisposalFee?: string;
  tireSize?: string;
  tireSeason?: '夏' | '冬';

  // 私物・返却
  personalItemsCleared?: '依頼済' | '未';
  returnItemExists?: boolean;        // 返却物 有無
  returnItemDetails?: string;        // 返却物 内容
  returnFee?: string;                // 返し物工賃

  // ホイール・バッテリー
  wheelType?: 'アルミ' | 'スチール';
  centerCap?: '無' | '要' | '不要';
  batterySize?: string;
  otherMakerInfo?: string;           // 他メーカー等

  // 作業日程
  removalDate?: string;              // 取外日
  removalRep?: string;               // 取外担当
  moveDate?: string;                 // 移動日
  returnDate?: string;               // 返却日

  // 下部情報（Row 34-38）
  transportFee?: string;             // 陸送費

  // リサイクル料
  recycleFeeCollected?: string;      // 集金金額
  recycleFeeAmount?: string;         // リサイクル料金
  recycleDepositStatus?: '預託済' | '未預託' | '追加預託';
  recycleFeePurchase?: string;       // 仕入金額
  recycleFeePayee?: string;          // 支払先

  // 支払・区分
  paymentStatus?: '済' | '未' | '掛' | 'AA' | '損';
  vehicleCategory?: '廃車' | '国部車' | '輸部車' | '輸中車';
  depositCategory?: '預託 済' | '預託 待';
  depositPhase?: string[];             // 引取・フロン・解体

  // 特記事項（複数選択）
  specialNotes?: string[];

  // 備考
  snowRemovalRequested?: boolean;    // 除雪依頼済
  generalNotes?: string;             // 自由記述備考
}

export interface Inquiry {
  id: string;
  customerId: string; // 顧客IDで紐付け
  customer: CustomerInfo; // 表示用のスナップショット
  vehicle?: VehicleInfo;
  slip?: SlipData;
  channel: ChannelType;
  subject: string;
  content: string;
  lastMessage: string;
  timestamp: string;
  status: InquiryStatus;
  adminNotes?: string;
  handoverNote?: string;
  history?: CommunicationHistory[];
  createdAt: string;
  updatedAt: string;
  lockedBy?: string; // User ID who is currently editing
  lockedAt?: number; // Timestamp of the lock
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export interface VehicleInspectionResult {
  make: string | null;
  model: string | null;
  year: string | null;
  chassisNumber: string | null;
  registrationNumber: string | null;
  ownerName: string | null;
  color: string | null;
  mileage: string | null;
}

export interface MessageTemplate {
  id: string;
  name: string;
  content: string;
}

export interface CommunicationHistory {
  id: string;
  type: '受信' | '送信';
  method: 'LINE' | 'SMS' | 'EMAIL' | 'PHONE';
  date: string;
  content: string;
  agent: string;
}

export interface DailyReport {
  id: string;
  date: string; // YYYY-MM-DD
  content: string;
  createdAt: string;
  updatedAt: string;
}
