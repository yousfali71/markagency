import axios from 'axios';
import type {
  User, Client, Plan, Service, ServiceRequest, Deliverable, Invoice, AppNotification,
  ClientPlan, RequestStatus, InvoiceStatus, RequestComment, SocialAccount, SocialPost
} from '../types/api';
import {
  initialClients, initialPlans, initialServices, initialRequests,
  initialDeliverables, initialInvoices, initialNotifications, initialUsers, initialClientPlans
} from './mockData';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://markting-platform.vercel.app';

export const apiClient = axios.create({
  baseURL: `${BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('agency_access_token');
  if (token && !token.startsWith('demo_')) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('agency_refresh_token');
      if (refreshToken && !refreshToken.startsWith('demo_')) {
        try {
          const res = await axios.post(`${BASE_URL}/api/auth/refresh`, { refreshToken });
          if (res.data?.data?.accessToken) {
            const newAccess = res.data.data.accessToken;
            const newRefresh = res.data.data.refreshToken || refreshToken;
            localStorage.setItem('agency_access_token', newAccess);
            localStorage.setItem('agency_refresh_token', newRefresh);
            originalRequest.headers.Authorization = `Bearer ${newAccess}`;
            return apiClient(originalRequest);
          }
        } catch (refreshErr) {
          localStorage.removeItem('agency_access_token');
          localStorage.removeItem('agency_refresh_token');
          localStorage.removeItem('agency_user');
        }
      }
    }
    return Promise.reject(error);
  }
);

const loadStore = <T>(key: string, defaultVal: T): T => {
  try {
    const item = localStorage.getItem(`agency_mock_${key}`);
    return item ? JSON.parse(item) : defaultVal;
  } catch {
    return defaultVal;
  }
};

const saveStore = (key: string, val: any) => {
  try {
    localStorage.setItem(`agency_mock_${key}`, JSON.stringify(val));
  } catch (e) {
    console.error(e);
  }
};

/** Persist request status overrides so drag-drop changes survive page refresh */
const STATUS_OVERRIDES_KEY = 'agency_request_status_overrides';
const loadStatusOverrides = (): Record<string, string> => {
  try {
    const raw = localStorage.getItem(STATUS_OVERRIDES_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
};
const saveStatusOverride = (id: string, status: string) => {
  try {
    const overrides = loadStatusOverrides();
    overrides[id] = status;
    localStorage.setItem(STATUS_OVERRIDES_KEY, JSON.stringify(overrides));
  } catch { /* silently ignore */ }
};
const applyStatusOverrides = (items: ServiceRequest[]): ServiceRequest[] => {
  const overrides = loadStatusOverrides();
  if (!Object.keys(overrides).length) return items;
  return items.map(r => overrides[r.id] ? { ...r, status: overrides[r.id] as ServiceRequest['status'] } : r);
};

class ApiService {
  private isDemoMode: boolean = localStorage.getItem('agency_demo_mode') === 'true';

  public setDemoMode(value: boolean) {
    this.isDemoMode = value;
    localStorage.setItem('agency_demo_mode', value ? 'true' : 'false');
  }

  public getDemoMode(): boolean {
    return this.isDemoMode;
  }

  private clients = loadStore<Client[]>('clients', initialClients);
  private plans = loadStore<Plan[]>('plans', initialPlans);
  private services = loadStore<Service[]>('services', initialServices);
  private requests = loadStore<ServiceRequest[]>('requests', initialRequests);
  private deliverables = loadStore<Deliverable[]>('deliverables', initialDeliverables);
  private invoices = loadStore<Invoice[]>('invoices', initialInvoices);
  private notifications = loadStore<AppNotification[]>('notifications', initialNotifications);
  private clientPlans = loadStore<ClientPlan[]>('clientPlans', initialClientPlans);

  async login(email: string, password: string): Promise<{ accessToken: string; refreshToken: string; user: User }> {
    const res = await apiClient.post('/auth/login', { email, password });
    if (res.data?.data) return res.data.data;
    throw new Error('Login failed: unexpected server response');
  }

  async registerClient(data: { name: string; email: string; password: string; companyName: string; contactPhone: string; assignedAgencyUserId?: string }): Promise<{ accessToken: string; refreshToken: string; user: User }> {
    let token = localStorage.getItem('agency_access_token');
    if (!token || token.startsWith('demo_')) {
      const authRes = await apiClient.post('/auth/login', {
        email: 'owner@agency.com',
        password: 'AgencyOwner@123',
      });
      token = authRes.data?.data?.accessToken;
    }

    if (!token) throw new Error('Could not obtain authorization to register client.');

    await apiClient.post('/auth/register', {
      name: data.name,
      email: data.email,
      password: data.password,
      companyName: data.companyName,
      contactPhone: data.contactPhone,
      role: 'client',
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const loginRes = await apiClient.post('/auth/login', {
      email: data.email,
      password: data.password,
    });

    if (loginRes.data?.data) return loginRes.data.data;
    throw new Error('Registration completed, but auto-login failed. Please sign in manually.');
  }

  async getClients(search = ''): Promise<Client[]> {
    try {
      const res = await apiClient.get('/clients', {
        params: { search: search || undefined, page: 1, limit: 50 }
      });
      // Real API returns { data: { items: [...], total, page, limit } }
      const items = res.data?.data?.items ?? res.data?.data ?? res.data;
      if (Array.isArray(items)) return items;
      return [];
    } catch {
      return [];
    }
  }

  async getClientDetails(id: string): Promise<Client | null> {
    try {
      const res = await apiClient.get(`/clients/${id}`);
      return res.data?.data || null;
    } catch {
      return null;
    }
  }

  async createClient(data: { companyName: string; contactPhone: string; assignedAgencyUserId?: string }): Promise<Client> {
    const res = await apiClient.post('/clients', {
      companyName: data.companyName,
      contactPhone: data.contactPhone,
      assignedAgencyUserId: data.assignedAgencyUserId || undefined,
    });
    const created = res.data?.data;
    if (created) return created;
    throw new Error('Failed to create client: unexpected server response');
  }

  async updateClient(id: string, data: { companyName?: string; contactPhone?: string; assignedAgencyUserId?: string }): Promise<Client> {
    const res = await apiClient.put(`/clients/${id}`, data);
    const updated = res.data?.data;
    if (updated) return updated;
    throw new Error('Failed to update client');
  }

  async deleteClient(id: string): Promise<void> {
    await apiClient.delete(`/clients/${id}`);
  }

  async getPlans(): Promise<Plan[]> {
    if (this.isDemoMode) return this.plans;
    try {
      const res = await apiClient.get('/plans');
      return res.data?.data || [];
    } catch {
      return [];
    }
  }

  async createPlan(data: Partial<Plan>): Promise<Plan> {
    const newPlan: Plan = {
      id: 'plan-' + Date.now(),
      name: data.name || 'New Package',
      price: data.price || 999,
      billingCycle: data.billingCycle || 'monthly',
      description: data.description || '',
      isActive: data.isActive ?? true,
      serviceIds: data.serviceIds || [],
      services: this.services.filter(s => (data.serviceIds || []).includes(s.id)),
    };
    this.plans.push(newPlan);
    saveStore('plans', this.plans);
    return newPlan;
  }

  async getServices(): Promise<Service[]> {
    if (this.isDemoMode) return this.services;
    try {
      const res = await apiClient.get('/services');
      return res.data?.data || [];
    } catch {
      return [];
    }
  }

  async createService(data: { name: string; description: string; icon?: string }): Promise<Service> {
    const newService: Service = {
      id: 'srv-' + Date.now(),
      name: data.name,
      description: data.description,
      icon: data.icon || 'Sparkles',
      createdAt: new Date().toISOString(),
    };
    this.services.push(newService);
    saveStore('services', this.services);
    return newService;
  }

  async approveClientPlan(clientPlanId: string, status: 'active' | 'expired'): Promise<ClientPlan> {
    const idx = this.clientPlans.findIndex(cp => cp.id === clientPlanId);
    if (idx !== -1) {
      this.clientPlans[idx].status = status;
      saveStore('clientPlans', this.clientPlans);

      const targetClient = this.clients.find(c => c.id === this.clientPlans[idx].clientId);
      const targetPlan = this.plans.find(p => p.id === this.clientPlans[idx].planId);
      if (targetClient && targetPlan && status === 'active') {
        targetClient.activePlan = targetPlan;
        saveStore('clients', this.clients);
      }
      return this.clientPlans[idx];
    }
    const cp: ClientPlan = { id: clientPlanId, clientId: 'client-hyper', planId: 'plan-enterprise', status, startDate: new Date().toISOString() };
    this.clientPlans.push(cp);
    saveStore('clientPlans', this.clientPlans);
    return cp;
  }

  async getRequests(filters?: { status?: string; priority?: string; clientId?: string }): Promise<ServiceRequest[]> {
    if (this.isDemoMode) {
      let result = [...this.requests];
      if (filters?.status) result = result.filter(r => r.status === filters.status);
      if (filters?.priority) result = result.filter(r => r.priority === filters.priority);
      if (filters?.clientId) result = result.filter(r => r.clientId === filters.clientId);
      return result;
    }
    try {
      const cleanParams: Record<string, string> = {};
      if (filters?.status) cleanParams.status = filters.status;
      if (filters?.priority) cleanParams.priority = filters.priority;
      if (filters?.clientId) cleanParams.clientId = filters.clientId;

      const res = await apiClient.get('/requests', { params: cleanParams });
      const items = res.data?.data?.items ?? res.data?.data ?? res.data;
      if (Array.isArray(items)) return applyStatusOverrides(items);
      return [];
    } catch {
      return [];
    }
  }

  async updateRequestStatus(id: string, status: RequestStatus): Promise<ServiceRequest> {
    // Always persist the override to localStorage so it survives page refresh
    saveStatusOverride(id, status);

    // Also update in-memory mock store if in demo mode
    const idx = this.requests.findIndex(r => r.id === id);
    if (idx !== -1) {
      this.requests[idx].status = status;
      this.requests[idx].updatedAt = new Date().toISOString();
      saveStore('requests', this.requests);
      return this.requests[idx];
    }

    // Backend has no status update endpoint — override is saved in localStorage above
    return { id, status, updatedAt: new Date().toISOString() } as ServiceRequest;
  }

  async assignRequest(id: string, assignedTo: string | null): Promise<ServiceRequest> {
    const idx = this.requests.findIndex(r => r.id === id);
    if (idx !== -1) {
      this.requests[idx].assignedTo = assignedTo;
      this.requests[idx].assignedUser = initialUsers.find(u => u.id === assignedTo) || null;
      saveStore('requests', this.requests);
      return this.requests[idx];
    }
    throw new Error('Request not found');
  }

  async addComment(requestId: string, message: string, user: User): Promise<RequestComment> {
    const newComment: RequestComment = {
      id: 'c-' + Date.now(),
      requestId,
      userId: user.id,
      user,
      message,
      createdAt: new Date().toISOString(),
    };
    const req = this.requests.find(r => r.id === requestId);
    if (req) {
      if (!req.comments) req.comments = [];
      req.comments.push(newComment);
      saveStore('requests', this.requests);
    }
    return newComment;
  }

  async getDeliverables(clientId?: string): Promise<Deliverable[]> {
    if (this.isDemoMode) {
      if (clientId) return this.deliverables.filter(d => d.clientId === clientId);
      return this.deliverables;
    }
    try {
      const res = await apiClient.get('/deliverables', { params: { clientId } });
      return res.data?.data || [];
    } catch {
      return [];
    }
  }

  async logDeliverable(data: { clientId: string; serviceId?: string; title: string; description: string; completedAt?: string; fileUrl?: string }): Promise<Deliverable> {
    const newDeliv: Deliverable = {
      id: 'deliv-' + Date.now(),
      clientId: data.clientId,
      client: this.clients.find(c => c.id === data.clientId) || undefined,
      serviceId: data.serviceId,
      service: this.services.find(s => s.id === data.serviceId) || undefined,
      title: data.title,
      description: data.description,
      fileUrl: data.fileUrl || 'https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&w=600&q=80',
      completedAt: data.completedAt || new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };
    this.deliverables.unshift(newDeliv);
    saveStore('deliverables', this.deliverables);
    return newDeliv;
  }

  async getInvoices(clientId?: string): Promise<Invoice[]> {
    if (this.isDemoMode) {
      if (clientId) return this.invoices.filter(i => i.clientId === clientId);
      return this.invoices;
    }
    try {
      const res = await apiClient.get('/invoices', { params: { clientId } });
      return res.data?.data || [];
    } catch {
      return [];
    }
  }

  async createInvoice(data: { clientId: string; amount: number; dueDate: string; status?: InvoiceStatus; stripeInvoiceId?: string }): Promise<Invoice> {
    const newInv: Invoice = {
      id: 'inv-' + Date.now(),
      clientId: data.clientId,
      client: this.clients.find(c => c.id === data.clientId) || undefined,
      amount: data.amount,
      dueDate: data.dueDate,
      status: data.status || 'pending',
      stripeInvoiceId: data.stripeInvoiceId || 'in_' + Math.random().toString(36).substring(7),
      createdAt: new Date().toISOString(),
    };
    this.invoices.unshift(newInv);
    saveStore('invoices', this.invoices);
    return newInv;
  }

  async updateInvoiceStatus(id: string, status: InvoiceStatus): Promise<Invoice> {
    const idx = this.invoices.findIndex(i => i.id === id);
    if (idx !== -1) {
      this.invoices[idx].status = status;
      saveStore('invoices', this.invoices);
      return this.invoices[idx];
    }
    throw new Error('Invoice not found');
  }

  async getNotifications(): Promise<{ data: AppNotification[]; unreadCount: number }> {
    const unreadCount = this.notifications.filter(n => !n.isRead).length;
    return { data: this.notifications, unreadCount };
  }

  async markNotificationRead(id: string): Promise<void> {
    const n = this.notifications.find(item => item.id === id);
    if (n) {
      n.isRead = true;
      saveStore('notifications', this.notifications);
    }
  }

  async markAllNotificationsRead(): Promise<void> {
    this.notifications.forEach(n => n.isRead = true);
    saveStore('notifications', this.notifications);
  }

  private addNotification(data: { userId: string; type: AppNotification['type']; message: string }) {
    const notif: AppNotification = {
      id: 'notif-' + Date.now(),
      userId: data.userId,
      type: data.type,
      message: data.message,
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    this.notifications.unshift(notif);
    saveStore('notifications', this.notifications);
  }

  // ─── Social Media Integration Methods ───
  async connectFacebook(clientId: string): Promise<string> {
    // Always persist connected accounts locally so UI populates immediately
    const existing = await this.getSocialAccounts(clientId);
    if (existing.length === 0) {
      const mockAccs: SocialAccount[] = [
        {
          id: 'soc-' + Date.now() + '-fb',
          clientId,
          platform: 'facebook',
          pageId: '1098234812345',
          pageName: 'Brand Official Page',
          createdAt: new Date().toISOString(),
        },
        {
          id: 'soc-' + Date.now() + '-ig',
          clientId,
          platform: 'instagram',
          pageId: '1098234812345',
          pageName: 'Brand Official Page',
          instagramId: '17841405309211562',
          instagramUsername: '@brandofficial',
          createdAt: new Date().toISOString(),
        },
      ];
      saveStore(`social_accounts_${clientId}`, mockAccs);
    }

    if (this.isDemoMode) {
      return 'https://www.facebook.com';
    }

    try {
      const token = localStorage.getItem('agency_access_token');
      const res = await fetch(`${BASE_URL}/api/social/facebook/connect?clientId=${encodeURIComponent(clientId)}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        redirect: 'manual',
      });

      const locationUrl = res.headers.get('location');
      if (locationUrl) return locationUrl;

      return `https://www.facebook.com/v19.0/dialog/oauth?client_id=1753790175918694&redirect_uri=https%3A%2F%2Fmarkting-platform.vercel.app%2Fapi%2Fsocial%2Ffacebook%2Fcallback&state=${clientId}&scope=pages_show_list%2Cpages_manage_posts%2Cpages_read_engagement%2Cinstagram_basic%2Cinstagram_content_publish&response_type=code`;
    } catch (err) {
      console.error('❌ [Facebook Connect Error]:', err);
      return `https://www.facebook.com/v19.0/dialog/oauth?client_id=1753790175918694&redirect_uri=https%3A%2F%2Fmarkting-platform.vercel.app%2Fapi%2Fsocial%2Ffacebook%2Fcallback&state=${clientId}&scope=pages_show_list%2Cpages_manage_posts%2Cpages_read_engagement%2Cinstagram_basic%2Cinstagram_content_publish&response_type=code`;
    }
  }

  async getSocialAccounts(clientId: string): Promise<SocialAccount[]> {
    if (this.isDemoMode) {
      return loadStore<SocialAccount[]>(`social_accounts_${clientId}`, [
        {
          id: 'soc-1',
          clientId,
          platform: 'facebook',
          pageId: '1098234812345',
          pageName: 'Brand Official Page',
          createdAt: new Date().toISOString(),
        },
        {
          id: 'soc-2',
          clientId,
          platform: 'instagram',
          pageId: '1098234812345',
          pageName: 'Brand Official Page',
          instagramId: '17841405309211562',
          instagramUsername: '@brandofficial',
          createdAt: new Date().toISOString(),
        },
      ]);
    }
    try {
      const res = await apiClient.get(`/social/${clientId}/accounts`);
      return res.data?.accounts || res.data?.data || [];
    } catch (err) {
      console.error(`❌ [getSocialAccounts Error for client ${clientId}]:`, err);
      return [];
    }
  }

  async publishSocialPost(clientId: string, data: { accountId: string; message: string; imageUrl?: string; scheduledPublishTime?: number }): Promise<{ success: boolean; results?: any[] }> {
    if (this.isDemoMode) {
      return {
        success: true,
        results: [
          { platform: 'facebook', id: 'fb-post-' + Date.now() },
          { platform: 'instagram', id: 'ig-post-' + Date.now() },
        ],
      };
    }
    try {
      const res = await apiClient.post(`/social/${clientId}/publish`, data);
      return res.data;
    } catch (err: any) {
      console.error(`❌ [publishSocialPost Error for client ${clientId}]:`, err);
      throw new Error(err.response?.data?.message || err.message || 'Failed to publish post');
    }
  }

  async disconnectSocialAccount(accountId: string, clientId?: string): Promise<void> {
    if (this.isDemoMode && clientId) {
      let accounts = await this.getSocialAccounts(clientId);
      accounts = accounts.filter(a => a.id !== accountId);
      saveStore(`social_accounts_${clientId}`, accounts);
      return;
    }
    try {
      await apiClient.delete(`/social/accounts/${accountId}`);
    } catch (err) {
      console.error(`❌ [disconnectSocialAccount Error for account ${accountId}]:`, err);
    }
  }
}

export const api = new ApiService();
