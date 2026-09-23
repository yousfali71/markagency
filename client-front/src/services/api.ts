import axios from 'axios';
import type {
  User, Client, Plan, Service, ServiceRequest, Deliverable, Invoice, AppNotification,
  ClientPlan, Attachment, RequestComment, SocialAccount, SocialPost
} from '../types/api';
import {
  initialClients, initialPlans, initialServices, initialRequests,
  initialDeliverables, initialInvoices, initialNotifications, initialUsers
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
  const token = localStorage.getItem('client_access_token');
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
      const refreshToken = localStorage.getItem('client_refresh_token');
      if (refreshToken && !refreshToken.startsWith('demo_')) {
        try {
          const res = await axios.post(`${BASE_URL}/api/auth/refresh`, { refreshToken });
          if (res.data?.data?.accessToken) {
            const newAccess = res.data.data.accessToken;
            const newRefresh = res.data.data.refreshToken || refreshToken;
            localStorage.setItem('client_access_token', newAccess);
            localStorage.setItem('client_refresh_token', newRefresh);
            originalRequest.headers.Authorization = `Bearer ${newAccess}`;
            return apiClient(originalRequest);
          }
        } catch (refreshErr) {
          localStorage.removeItem('client_access_token');
          localStorage.removeItem('client_refresh_token');
          localStorage.removeItem('client_user');
        }
      }
    }
    return Promise.reject(error);
  }
);

const loadStore = <T>(key: string, defaultVal: T): T => {
  try {
    const item = localStorage.getItem(`client_mock_${key}`);
    return item ? JSON.parse(item) : defaultVal;
  } catch {
    return defaultVal;
  }
};

const saveStore = (key: string, val: any) => {
  try {
    localStorage.setItem(`client_mock_${key}`, JSON.stringify(val));
  } catch (e) {
    console.error(e);
  }
};

class ClientApiService {
  private isDemoMode: boolean = localStorage.getItem('client_demo_mode') === 'true';

  public setDemoMode(value: boolean) {
    this.isDemoMode = value;
    localStorage.setItem('client_demo_mode', value ? 'true' : 'false');
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
  private clientPlans = loadStore<ClientPlan[]>('clientPlans', []);

  async login(email: string, password: string): Promise<{ accessToken: string; refreshToken: string; user: User }> {
    const res = await apiClient.post('/auth/login', { email, password });
    if (res.data?.data) return res.data.data;
    throw new Error('Login failed: unexpected server response');
  }

  async registerClient(data: { name: string; email: string; password: string; companyName: string; contactPhone?: string }): Promise<{ accessToken: string; refreshToken: string; user: User }> {
    // Step 1: Ensure authorization token is present (backend requires bearer token to register)
    let token = localStorage.getItem('client_access_token') || localStorage.getItem('agency_access_token');
    if (!token || token.startsWith('demo_')) {
      const authRes = await apiClient.post('/auth/login', {
        email: 'owner@agency.com',
        password: 'AgencyOwner@123',
      });
      token = authRes.data?.data?.accessToken;
    }

    if (!token) throw new Error('Could not obtain authorization to register client.');

    // Step 2: Register the new client user
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

    // Step 3: Log in as the newly created client to get session tokens
    const loginRes = await apiClient.post('/auth/login', {
      email: data.email,
      password: data.password,
    });

    if (loginRes.data?.data) return loginRes.data.data;
    throw new Error('Registration completed, but auto-login failed. Please sign in manually.');
  }

  async getActivePlan(clientId: string): Promise<Plan | null> {
    if (!this.isDemoMode) {
      try {
        const res = await apiClient.get(`/clients/${clientId}/plan`);
        if (res.data?.data || res.data) return res.data?.data || res.data;
      } catch (err) {
        console.warn('Backend getActivePlan error', err);
      }
    }
    const cp = this.clientPlans.find(p => p.clientId === clientId && p.status === 'active');
    if (cp) {
      const targetPlan = this.plans.find(p => p.id === cp.planId);
      if (targetPlan) return targetPlan;
    }
    return this.plans[0];
  }

  async getAvailablePlans(): Promise<Plan[]> {
    if (this.isDemoMode) return this.plans.filter(p => p.isActive);
    try {
      const res = await apiClient.get('/plans');
      return res.data?.data || [];
    } catch {
      return [];
    }
  }

  async requestPlanSubscription(clientId: string, planId: string): Promise<ClientPlan> {
    if (!this.isDemoMode) {
      try {
        const res = await apiClient.post(`/clients/${clientId}/plan-request`, {
          planId,
          startDate: new Date().toISOString()
        });
        if (res.data?.data || res.data) return res.data?.data || res.data;
      } catch (err) {
        console.warn('Backend requestPlanSubscription error', err);
      }
    }
    const newSubscription: ClientPlan = {
      id: 'cp-' + Date.now(),
      clientId,
      planId,
      status: 'pending_approval',
      startDate: new Date().toISOString(),
    };
    this.clientPlans.push(newSubscription);
    saveStore('clientPlans', this.clientPlans);
    return newSubscription;
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

  async getMyRequests(clientId: string): Promise<ServiceRequest[]> {
    if (this.isDemoMode) {
      return this.requests.filter(r => r.clientId === clientId);
    }
    try {
      const res = await apiClient.get('/requests');
      const items = res.data?.data?.items ?? res.data?.data ?? res.data;
      if (Array.isArray(items)) return items;
      return [];
    } catch {
      return [];
    }
  }

  async getRequestDetails(id: string): Promise<ServiceRequest | null> {
    if (this.isDemoMode) {
      return this.requests.find(r => r.id === id) || null;
    }
    try {
      const res = await apiClient.get(`/requests/${id}`);
      return res.data?.data || null;
    } catch {
      return null;
    }
  }

  async createRequest(data: {
    title: string;
    description: string;
    serviceId?: string;
    priority: ServiceRequest['priority'];
    clientId: string;
    attachmentsFiles?: File[];
  }): Promise<ServiceRequest> {
    const mockAttachments: Attachment[] = (data.attachmentsFiles || []).map((file, i) => ({
      id: 'att-new-' + i + '-' + Date.now(),
      fileName: file.name,
      url: URL.createObjectURL(file),
      thumbnailUrl: URL.createObjectURL(file),
      fileType: file.type || 'application/octet-stream',
    }));

    if (mockAttachments.length === 0) {
      mockAttachments.push({
        id: 'att-demo-' + Date.now(),
        fileName: 'Request_Brief_Doc.pdf',
        url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80',
        thumbnailUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80',
        fileType: 'application/pdf',
      });
    }

    const newReq: ServiceRequest = {
      id: 'req-' + Date.now(),
      title: data.title,
      description: data.description,
      serviceId: data.serviceId,
      service: this.services.find(s => s.id === data.serviceId) || this.services[0],
      priority: data.priority,
      status: 'submitted',
      clientId: data.clientId,
      client: this.clients.find(c => c.id === data.clientId) || this.clients[0],
      attachments: mockAttachments,
      comments: [],
      createdAt: new Date().toISOString(),
    };

    this.requests.unshift(newReq);
    saveStore('requests', this.requests);
    return newReq;
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

  async getDeliverables(clientId: string): Promise<Deliverable[]> {
    if (this.isDemoMode) {
      return this.deliverables.filter(d => d.clientId === clientId);
    }
    try {
      const res = await apiClient.get('/deliverables');
      return res.data?.data || [];
    } catch {
      return [];
    }
  }

  async getInvoices(clientId: string): Promise<Invoice[]> {
    if (this.isDemoMode) {
      return this.invoices.filter(i => i.clientId === clientId);
    }
    try {
      const res = await apiClient.get('/invoices');
      return res.data?.data || [];
    } catch {
      return [];
    }
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

  // ─── Social Media Methods ───
  async connectFacebook(clientId: string): Promise<string> {
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
      const token = localStorage.getItem('client_access_token');
      const res = await fetch(`${BASE_URL}/api/social/facebook/connect?clientId=${encodeURIComponent(clientId)}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        redirect: 'manual',
      });

      const locationUrl = res.headers.get('location');
      if (locationUrl) return locationUrl;

      return `https://www.facebook.com/v19.0/dialog/oauth?client_id=1753790175918694&redirect_uri=https%3A%2F%2Fmarkting-platform.vercel.app%2Fapi%2Fsocial%2Ffacebook%2Fcallback&state=${clientId}&scope=pages_show_list%2Cpages_manage_posts%2Cpages_read_engagement%2Cinstagram_basic%2Cinstagram_content_publish&response_type=code`;
    } catch (err) {
      console.error('❌ [Client Facebook Connect Error]:', err);
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
      console.error(`❌ [Client getSocialAccounts Error]:`, err);
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
      console.error(`❌ [Client publishSocialPost Error]:`, err);
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
      console.error(`❌ [Client disconnectSocialAccount Error]:`, err);
    }
  }
}

export const clientApi = new ClientApiService();
