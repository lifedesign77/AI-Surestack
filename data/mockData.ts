import { ChannelType, InquiryStatus, Inquiry } from '../types';

export const MOCK_INQUIRIES: Inquiry[] = [
  { 
    id: '1', 
    customerId: 'c1',
    createdAt: '2023-10-27T10:30:00Z',
    updatedAt: '2023-10-27T10:30:00Z',
    customer: {
      id: 'c1', 
      name: '田中 太郎', 
      kana: 'タナカ タロウ',
      phone: '090-1234-5678', 
      email: 'tanaka@example.com',
      address: '札幌市中央区大通西1-1',
      preferredContact: '電話 (12:00-13:00)',
      repName: '佐藤',
      contactPhone: '090-1234-5678',
      createdAt: '2023-10-27T10:30:00Z',
      updatedAt: '2023-10-27T10:30:00Z'
    },
    vehicle: {
      make: 'トヨタ',
      model: 'プリウス',
      year: '2019 (R1)',
      mileage: '45,000km',
      color: 'パール白',
      inspectionDate: '2024/10',
      chassisNumber: 'ZVW50-1234567',
      plateStatus: 'あり',
      registrationNumber: '札幌 300 あ 1234',
      conditionNotes: '左リアバンパーに小傷あり。夏タイヤ積込。',
      images: [
        'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&q=80&w=300&h=200',
        'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&q=80&w=300&h=200'
      ],
      modelCode: 'ZVW50',
      plateRegion: '札幌',
      driveType: '2WD',
      transmission: 'AT',
      fuelType: 'ガソリン',
      owner: '田中 太郎',
      registeredUser: '田中 太郎',
      hasVehicleInspectionCert: true,
      addressConfirmation: '現住所',
      vehicleConditions: ['丸車'],
      freonType: 'HFC',
      srsStatus: '有',
      sideSrsStatus: '有'
    },
    slip: {
      receptionName: '佐藤',
      salesRep: '鈴木',
      stockNumber: '2410-001',
      stockDate: '2023-10-30',
      receptionDate: '2023-10-27',
      pickupLocation: '自宅',
      pickupRep: '児',
      scheduledAmPm: 'PM',
      contactTiming: ['行く前Tel'],
      pickupMethod: '可動',
      pickupLocationType: '住',
      pickupRequired: true,
      largeVehicleAccess: '可',
      hasKey: true,
      storageLocation: '自宅敷地',
      purchasePrice: '50000',
      paymentMethod: '振込',
      carTaxExplained: true,
      weightTaxExplained: true,
      liabilityInsExplained: true,
      personalItemsCleared: '依頼済',
      tireDisposal: '無',
      vehicleCategory: '廃車',
      paymentStatus: '未'
    },
    channel: ChannelType.LINE, 
    subject: 'プリウス査定依頼', 
    content: '乗り換えのため売却を検討しています。左リアバンパーに小傷があります。今週末の査定は可能でしょうか？',
    lastMessage: '明日の13時に伺ってもよろしいですか？', 
    timestamp: '2023-10-27 10:30', 
    status: InquiryStatus.ASSESSMENT_SCHEDULED,
    adminNotes: '',
    handoverNote: 'LINEにて写真受領済み。傷の状態は軽微。週末来店誘導中。'
  },
  { 
    id: '2', 
    customerId: 'c2',
    createdAt: '2023-10-26T15:45:00Z',
    updatedAt: '2023-10-26T15:45:00Z',
    customer: {
      id: 'c2', 
      name: '鈴木 次郎', 
      kana: 'スズキ ジロウ',
      phone: '080-9876-5432', 
      email: 'suzuki@example.com',
      repName: '田中',
      createdAt: '2023-10-26T15:45:00Z',
      updatedAt: '2023-10-26T15:45:00Z'
    },
    vehicle: {
        make: '日産',
        model: 'セレナ',
        year: '2018',
        mileage: '60,000km',
        color: '黒',
        plateStatus: 'あり',
        images: []
    },
    slip: {
        salesRep: '田中'
    },
    channel: ChannelType.PHONE, 
    subject: '車検の予約', 
    content: '来月車検が切れるので予約したい。代車は軽自動車希望。',
    lastMessage: '電話にて予約受付完了。担当：佐藤', 
    timestamp: '2023-10-26 15:45', 
    status: InquiryStatus.CLOSED_SUCCESS,
    handoverNote: '車検予約完了。代車（N-BOX）確保済み。'
  },
  { 
    id: '3', 
    customerId: 'c3',
    createdAt: '2023-10-27T09:15:00Z',
    updatedAt: '2023-10-27T09:15:00Z',
    customer: {
      id: 'c3', 
      name: '山田 花子', 
      kana: 'ヤマダ ハナコ',
      phone: '090-1111-2222', 
      email: 'hana@example.com',
      repName: '高橋',
      createdAt: '2023-10-27T09:15:00Z',
      updatedAt: '2023-10-27T09:15:00Z'
    },
    vehicle: {
      make: 'ダイハツ',
      model: 'タント',
      year: '2015 (H27)',
      mileage: '82,000km',
      color: '桃',
      inspectionDate: '2023/12',
      plateStatus: 'なし',
      images: []
    },
    slip: {
        salesRep: '高橋'
    },
    channel: ChannelType.EMAIL, 
    subject: '必要書類について', 
    content: '軽自動車の売却に必要な書類を教えてください。車検証と自賠責は手元にあります。',
    lastMessage: '印鑑証明書の期限について教えてください。', 
    timestamp: '2023-10-27 09:15', 
    status: InquiryStatus.CONTACTED,
    handoverNote: '書類の案内メール送付済み。返信待ち。'
  },
  { 
    id: '4', 
    customerId: 'c4',
    createdAt: '2023-10-27T11:00:00Z',
    updatedAt: '2023-10-27T11:00:00Z',
    customer: {
      id: 'c4', 
      name: '高橋 健一', 
      kana: 'タカハシ ケンイチ',
      phone: '090-5555-6666', 
      email: 'taka@example.com',
      repName: '佐藤',
      createdAt: '2023-10-27T11:00:00Z',
      updatedAt: '2023-10-27T11:00:00Z'
    },
    vehicle: {
      make: 'ホンダ',
      model: 'N-BOX',
      year: '2022 (R4)',
      mileage: '12,000km',
      color: '紫',
      inspectionDate: '2025/03',
      images: [
        'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80&w=300&h=200'
      ]
    },
    slip: {
        salesRep: '佐藤'
    },
    channel: ChannelType.LINE, 
    subject: 'N-BOX買取相談', 
    content: '他社と相見積もり中です。LINEで概算金額を出せますか？写真を送ります。',
    lastMessage: '写真を送りました。確認お願いします。', 
    timestamp: '2023-10-27 11:00', 
    status: InquiryStatus.NEGOTIATION,
    handoverNote: '相見積もり案件。高値提示必要かも。'
  },
  { 
    id: '5', 
    customerId: 'c5',
    createdAt: '2023-10-27T08:30:00Z',
    updatedAt: '2023-10-27T08:30:00Z',
    customer: {
      id: 'c5', 
      name: '佐藤 健太', 
      kana: 'サトウ ケンタ',
      phone: '090-7777-8888', 
      email: 'kenta@example.com',
      address: '石狩市花川...',
      repName: '鈴木',
      createdAt: '2023-10-27T08:30:00Z',
      updatedAt: '2023-10-27T08:30:00Z'
    },
    vehicle: {
      make: 'トヨタ',
      model: 'プラド',
      year: '2020 (R2)',
      mileage: '30,000km',
      color: '黒',
      inspectionDate: '2023/09',
      images: []
    },
    slip: {
        salesRep: '鈴木'
    },
    channel: ChannelType.FORM, 
    subject: 'Webサイトからの見積もり', 
    content: 'Webフォームより送信: カスタム多数。サンルーフ付き。冬タイヤあり。',
    lastMessage: '車種：ランドクルーザープラド、年式：2020', 
    timestamp: '2023-10-27 08:30', 
    status: InquiryStatus.UNREAD,
    handoverNote: ''
  },
];