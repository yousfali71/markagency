import type { User, Client, Plan, Service, ServiceRequest, Deliverable, Invoice, AppNotification, ClientPlan } from '../types/api';

export const initialServices: Service[] = [
  { id: 'srv-1', name: 'Social Media Management', description: 'Monthly content creation, captions, and scheduling across Instagram & LinkedIn', icon: 'Share2' },
  { id: 'srv-2', name: 'Motion Graphics Video', description: 'High-converting 2D/3D video animations for ad campaigns', icon: 'Video' },
  { id: 'srv-3', name: 'Brand Identity Design', description: 'Logo design, brand guidelines, color palettes, and typography', icon: 'Palette' },
  { id: 'srv-4', name: 'SEO & Performance Ads', description: 'Google Ads & Meta Meta PPC campaigns optimization with monthly reporting', icon: 'TrendingUp' },
];

export const initialPlans: Plan[] = [
  {
    id: 'plan-starter',
    name: 'Starter Growth',
    price: 799,
    billingCycle: 'monthly',
    description: 'Essential digital marketing presence for fast-growing startups',
    isActive: true,
    serviceIds: ['srv-1', 'srv-3'],
    services: [initialServices[0], initialServices[2]],
  },
  {
    id: 'plan-scale',
    name: 'Scale Pro Package',
    price: 1850,
    billingCycle: 'monthly',
    description: 'Comprehensive digital agency stack with motion graphics and dedicated ads team',
    isActive: true,
    serviceIds: ['srv-1', 'srv-2', 'srv-3', 'srv-4'],
    services: initialServices,
  },
  {
    id: 'plan-enterprise',
    name: 'Enterprise VIP',
    price: 4500,
    billingCycle: 'monthly',
    description: 'Unlimited revisions, custom media production, and 24/7 dedicated account manager',
    isActive: true,
    serviceIds: ['srv-1', 'srv-2', 'srv-3', 'srv-4'],
    services: initialServices,
  },
];

export const initialUsers: User[] = [
  { id: 'user-agency-owner', name: 'Karim El-Sayed', email: 'owner@agency.com', role: 'agency', agencyPermission: 'owner', clientId: null, avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80' },
  { id: 'user-agency-staff1', name: 'Sarah Hassan', email: 'sarah@agency.com', role: 'agency', agencyPermission: 'staff', clientId: null, avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80' },
  { id: 'user-agency-staff2', name: 'Omar Khaled', email: 'omar@agency.com', role: 'agency', agencyPermission: 'staff', clientId: null, avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80' },
  { id: 'user-client-acme', name: 'Tarek Mahmoud', email: 'tarek@acmemedia.com', role: 'client', agencyPermission: null, clientId: 'client-acme', avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80' },
  { id: 'user-client-nexus', name: 'Laila Mostafa', email: 'laila@nexusbrand.com', role: 'client', agencyPermission: null, clientId: 'client-nexus', avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80' },
];

export const initialClients: Client[] = [
  {
    id: 'client-acme',
    companyName: 'Acme Media Corp',
    contactPhone: '+201001234567',
    assignedAgencyUserId: 'user-agency-staff1',
    assignedAgencyUser: initialUsers[1],
    activePlan: initialPlans[1],
    createdAt: '2026-08-15T10:00:00.000Z',
  },
  {
    id: 'client-nexus',
    companyName: 'Nexus Global Retail',
    contactPhone: '+201119876543',
    assignedAgencyUserId: 'user-agency-staff2',
    assignedAgencyUser: initialUsers[2],
    activePlan: initialPlans[0],
    createdAt: '2026-08-20T14:30:00.000Z',
  },
];

export const initialRequests: ServiceRequest[] = [
  {
    id: 'req-101',
    title: 'Instagram Campaign Reel & Carousel Set',
    description: 'We need a set of 5 Instagram carousel slides announcing our Autumn product drop. Plus a 15-second teaser reel.',
    serviceId: 'srv-1',
    service: initialServices[0],
    priority: 'high',
    status: 'in_progress',
    clientId: 'client-acme',
    client: initialClients[0],
    assignedTo: 'user-agency-staff1',
    assignedUser: initialUsers[1],
    attachments: [
      { id: 'att-1', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80', fileName: 'Autumn_Moodboard.jpg', fileType: 'image/jpeg' },
      { id: 'att-2', url: 'https://images.unsplash.com/photo-1522542550221-31fd19575a2d?auto=format&fit=crop&w=600&q=80', fileName: 'Brand_Logo_PNG.png', fileType: 'image/png' },
    ],
    comments: [
      { id: 'c-1', requestId: 'req-101', userId: 'user-client-acme', user: initialUsers[3], message: 'Please ensure we use the dark purple gradient as specified in our brand book.', createdAt: '2026-09-07T12:00:00.000Z' },
      { id: 'c-2', requestId: 'req-101', userId: 'user-agency-staff1', user: initialUsers[1], message: 'Understood Tarek! The design team is already rendering the carousel preview slides.', createdAt: '2026-09-07T14:15:00.000Z' },
    ],
    createdAt: '2026-09-07T10:00:00.000Z',
  },
  {
    id: 'req-104',
    title: 'Rebranding Package & Logo Vector Assets',
    description: 'Full brand guidelines document export with typography and icons.',
    serviceId: 'srv-3',
    service: initialServices[2],
    priority: 'low',
    status: 'done',
    clientId: 'client-acme',
    client: initialClients[0],
    assignedTo: 'user-agency-staff1',
    assignedUser: initialUsers[1],
    attachments: [],
    comments: [
      { id: 'c-4', requestId: 'req-104', userId: 'user-agency-staff1', user: initialUsers[1], message: 'Final branding package zip file uploaded to deliverables section!', createdAt: '2026-09-05T18:00:00.000Z' },
    ],
    createdAt: '2026-09-02T11:20:00.000Z',
  },
];

export const initialDeliverables: Deliverable[] = [
  {
    id: 'deliv-1',
    clientId: 'client-acme',
    client: initialClients[0],
    serviceId: 'srv-3',
    service: initialServices[2],
    title: 'Complete Brand Guidelines & Logo Kit',
    description: 'High-res SVG, PNG logos, typography vectors, and color palette handbook.',
    fileUrl: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&w=600&q=80',
    completedAt: '2026-09-05T18:00:00.000Z',
    createdAt: '2026-09-05T18:00:00.000Z',
  },
];

export const initialInvoices: Invoice[] = [
  {
    id: 'inv-1001',
    clientId: 'client-acme',
    client: initialClients[0],
    amount: 1850.00,
    dueDate: '2026-09-30T23:59:59.000Z',
    status: 'pending',
    stripeInvoiceId: 'in_1Mxyz987654',
    createdAt: '2026-09-01T00:00:00.000Z',
  },
];

export const initialNotifications: AppNotification[] = [
  {
    id: 'notif-3',
    userId: 'user-client-acme',
    type: 'request_status_updated',
    message: 'Your request "Instagram Campaign Reel" status updated to: In Progress',
    isRead: false,
    createdAt: '2026-09-07T11:00:00.000Z',
  },
];

export const initialClientPlans: ClientPlan[] = [
  {
    id: 'cp-1',
    clientId: 'client-acme',
    planId: 'plan-scale',
    status: 'active',
    startDate: '2026-08-15T00:00:00.000Z',
  },
];
