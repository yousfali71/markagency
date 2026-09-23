export type UserRole = 'agency' | 'client';
export type AgencyPermission = 'owner' | 'staff' | null;

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  agencyPermission: AgencyPermission;
  clientId: string | null;
  avatarUrl?: string;
}

export interface SocialAccount {
  id: string;
  clientId: string;
  platform: 'facebook' | 'instagram';
  pageId: string;
  pageName: string;
  instagramId?: string;
  instagramUsername?: string;
  createdAt: string;
}

export interface SocialPost {
  id: string;
  clientId: string;
  accountId: string;
  account?: SocialAccount;
  message: string;
  imageUrl?: string;
  scheduledPublishTime?: number;
  status: 'draft' | 'scheduled' | 'published' | 'failed';
  publishedId?: string;
  createdAt: string;
}

export interface Client {
  id: string;
  companyName: string;
  contactPhone: string;
  assignedAgencyUserId?: string | null;
  assignedAgencyUser?: User | null;
  users?: User[];
  activePlan?: Plan | null;
  socialAccounts?: SocialAccount[];
  createdAt: string;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  icon?: string;
  createdAt?: string;
}

export interface Plan {
  id: string;
  name: string;
  price: number;
  billingCycle: 'monthly' | 'yearly';
  description: string;
  isActive: boolean;
  services?: Service[];
  serviceIds?: string[];
}

export interface ClientPlan {
  id: string;
  clientId: string;
  planId: string;
  plan?: Plan;
  status: 'pending_approval' | 'active' | 'expired';
  startDate: string;
  createdAt?: string;
}

export type RequestStatus = 'submitted' | 'in_review' | 'in_progress' | 'done' | 'rejected';
export type RequestPriority = 'low' | 'medium' | 'high';

export interface Attachment {
  id: string;
  requestId?: string;
  url: string;
  thumbnailUrl?: string;
  fileName: string;
  fileType?: string;
  createdAt?: string;
}

export interface RequestComment {
  id: string;
  requestId: string;
  userId: string;
  user?: User;
  message: string;
  createdAt: string;
}

export interface ServiceRequest {
  id: string;
  title: string;
  description: string;
  serviceId?: string;
  service?: Service;
  priority: RequestPriority;
  status: RequestStatus;
  clientId: string;
  client?: Client;
  assignedTo?: string | null;
  assignedUser?: User | null;
  attachments?: Attachment[];
  comments?: RequestComment[];
  createdAt: string;
  updatedAt?: string;
}

export interface Deliverable {
  id: string;
  clientId: string;
  client?: Client;
  serviceId?: string;
  service?: Service;
  title: string;
  description: string;
  fileUrl?: string;
  completedAt: string;
  createdAt: string;
}

export type InvoiceStatus = 'pending' | 'paid' | 'overdue';

export interface Invoice {
  id: string;
  clientId: string;
  client?: Client;
  amount: number;
  dueDate: string;
  status: InvoiceStatus;
  stripeInvoiceId?: string;
  createdAt: string;
}

export interface AppNotification {
  id: string;
  userId: string;
  type: 'new_request' | 'request_status_updated' | 'new_comment' | 'plan_request';
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: { field: string; message: string }[];
  unreadCount?: number;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
