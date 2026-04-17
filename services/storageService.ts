import { Inquiry, CustomerInfo, MessageTemplate, DailyReport } from '../types';
import { MOCK_INQUIRIES } from '../data/mockData';

const DEFAULT_TEMPLATES: MessageTemplate[] = [
  { id: 't1', name: '初回連絡（SMS）', content: '石上車輛です。お問い合わせありがとうございます。査定についてご案内いたします。' },
  { id: 't2', name: '査定日程調整（Email）', content: 'お世話になっております。石上車輛でございます。\n査定の日程についてご相談させてください。' },
  { id: 't3', name: '成約御礼（Email）', content: 'この度はご成約いただき誠にありがとうございます。\n今後の流れについてご案内いたします。' }
];

class StorageService {
  private _inquiries: Inquiry[] = [];
  private _customers: CustomerInfo[] = [];
  private _templates: MessageTemplate[] = [];
  private _reports: DailyReport[] = [];

  constructor() {
    this.initStorage();
  }

  private initStorage() {
    try {
      const storedInquiries = localStorage.getItem('demo_inquiries');
      if (storedInquiries) {
        this._inquiries = JSON.parse(storedInquiries);
      } else {
        this._inquiries = [...MOCK_INQUIRIES];
        this.saveInquiries();
      }

      const storedCustomers = localStorage.getItem('demo_customers');
      if (storedCustomers) {
        this._customers = JSON.parse(storedCustomers);
      } else {
        const uniqueCustomersMap = new Map<string, CustomerInfo>();
        MOCK_INQUIRIES.forEach(inq => {
          if (inq.customer && inq.customer.id && !uniqueCustomersMap.has(inq.customer.id)) {
            uniqueCustomersMap.set(inq.customer.id, inq.customer);
          }
        });
        this._customers = Array.from(uniqueCustomersMap.values());
        this.saveCustomers();
      }

      const storedTemplates = localStorage.getItem('demo_templates');
      if (storedTemplates) {
        this._templates = JSON.parse(storedTemplates);
      } else {
        this._templates = [...DEFAULT_TEMPLATES];
        this.saveTemplates();
      }

      const storedReports = localStorage.getItem('demo_reports');
      if (storedReports) {
        this._reports = JSON.parse(storedReports);
      }
      
      // Initial notify
      setTimeout(() => this.notifyChange(), 100);
    } catch (error) {
      console.error("Storage initialization error:", error);
    }
  }

  private saveInquiries() {
    localStorage.setItem('demo_inquiries', JSON.stringify(this._inquiries));
  }

  private saveCustomers() {
    localStorage.setItem('demo_customers', JSON.stringify(this._customers));
  }

  private saveTemplates() {
    localStorage.setItem('demo_templates', JSON.stringify(this._templates));
  }

  private saveReports() {
    localStorage.setItem('demo_reports', JSON.stringify(this._reports));
  }

  private notifyChange() {
    window.dispatchEvent(new CustomEvent('storage-updated'));
  }

  // --- Inquiries ---

  getInquiries(): Inquiry[] {
    return [...this._inquiries].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  getInquiryById(id: string): Inquiry | undefined {
    return this._inquiries.find(i => i.id === id);
  }

  updateInquiry(id: string, updates: Partial<Inquiry>, userId: string, userName: string): Inquiry | null {
    const index = this._inquiries.findIndex(i => i.id === id);
    if (index === -1) return null;

    const oldInquiry = this._inquiries[index];
    const updatedInquiry = {
      ...oldInquiry,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    this._inquiries[index] = updatedInquiry;
    this.saveInquiries();
    this.notifyChange();

    return updatedInquiry;
  }

  lockInquiry(id: string, userId: string): boolean {
    const index = this._inquiries.findIndex(i => i.id === id);
    if (index === -1) return false;

    const inquiry = this._inquiries[index];
    if (inquiry.lockedBy && inquiry.lockedBy !== userId && inquiry.lockedAt && (Date.now() - inquiry.lockedAt < 5 * 60 * 1000)) {
      return false;
    }

    this._inquiries[index] = { 
      ...inquiry, 
      lockedBy: userId,
      lockedAt: Date.now()
    };
    this.saveInquiries();
    this.notifyChange();
    return true;
  }

  unlockInquiry(id: string, userId: string): void {
    const index = this._inquiries.findIndex(i => i.id === id);
    if (index === -1) return;

    const inquiry = this._inquiries[index];
    if (inquiry.lockedBy === userId) {
      this._inquiries[index] = { ...inquiry, lockedBy: undefined, lockedAt: undefined };
      this.saveInquiries();
      this.notifyChange();
    }
  }

  deleteInquiry(id: string, userId: string, userName: string): boolean {
    const index = this._inquiries.findIndex(i => i.id === id);
    if (index === -1) return false;

    this._inquiries.splice(index, 1);
    this.saveInquiries();
    this.notifyChange();

    return true;
  }

  // --- Customers ---

  getCustomers(): CustomerInfo[] {
    return [...this._customers];
  }

  getCustomerById(id: string): CustomerInfo | undefined {
    return this._customers.find(c => c.id === id);
  }

  updateCustomer(id: string, updates: Partial<CustomerInfo>, userId: string, userName: string): CustomerInfo | null {
    const index = this._customers.findIndex(c => c.id === id);
    if (index === -1) return null;

    const oldCustomer = this._customers[index];
    const updatedCustomer = {
      ...oldCustomer,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    this._customers[index] = updatedCustomer;
    this.saveCustomers();

    let inquiriesUpdated = false;
    this._inquiries = this._inquiries.map(inq => {
      if (inq.customerId === id || (inq.customer && inq.customer.id === id)) {
        inquiriesUpdated = true;
        return { ...inq, customer: updatedCustomer };
      }
      return inq;
    });

    if (inquiriesUpdated) {
      this.saveInquiries();
    }
    
    this.notifyChange();

    return updatedCustomer;
  }

  deleteCustomer(id: string, userId: string, userName: string): boolean {
    const index = this._customers.findIndex(c => c.id === id);
    if (index === -1) return false;

    this._customers.splice(index, 1);
    this.saveCustomers();
    this.notifyChange();

    return true;
  }

  // --- Templates ---

  getTemplates(): MessageTemplate[] {
    return [...this._templates];
  }

  addTemplate(template: Omit<MessageTemplate, 'id'>): MessageTemplate {
    const newTemplate: MessageTemplate = {
      ...template,
      id: `tpl_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
    
    this._templates.push(newTemplate);
    this.saveTemplates();
    this.notifyChange();
    
    return newTemplate;
  }

  updateTemplate(id: string, updates: Partial<MessageTemplate>): MessageTemplate | null {
    const index = this._templates.findIndex(t => t.id === id);
    if (index === -1) return null;

    const updatedTemplate = { ...this._templates[index], ...updates };
    
    this._templates[index] = updatedTemplate;
    this.saveTemplates();
    this.notifyChange();
    
    return updatedTemplate;
  }

  deleteTemplate(id: string): boolean {
    const index = this._templates.findIndex(t => t.id === id);
    if (index === -1) return false;

    this._templates.splice(index, 1);
    this.saveTemplates();
    this.notifyChange();
    
    return true;
  }

  // --- Daily Reports ---

  getReports(): DailyReport[] {
    return [...this._reports].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }

  getReportByDate(date: string): DailyReport | undefined {
    return this._reports.find(r => r.date === date);
  }

  saveReport(date: string, content: string): DailyReport {
    const existingIndex = this._reports.findIndex(r => r.date === date);
    const now = new Date().toISOString();

    if (existingIndex >= 0) {
      const updatedReport = {
        ...this._reports[existingIndex],
        content,
        updatedAt: now
      };
      this._reports[existingIndex] = updatedReport;
      this.saveReports();
      this.notifyChange();
      return updatedReport;
    } else {
      const newReport: DailyReport = {
        id: `rep_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        date,
        content,
        createdAt: now,
        updatedAt: now
      };
      this._reports.push(newReport);
      this.saveReports();
      this.notifyChange();
      return newReport;
    }
  }
}

export const storageService = new StorageService();
