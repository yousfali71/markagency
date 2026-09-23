export type Language = 'en' | 'ar';

export const translations = {
  en: {
    // Nav & General
    appName: "Client Portal",
    agencyPortal: "Agency Management Console",
    clientPortal: "Client Workspace",
    dashboard: "Overview",
    myPlan: "My Subscription",
    requests: "My Requests",
    deliverables: "Completed Assets",
    invoices: "My Invoices",
    notifications: "Notifications",
    settings: "Settings",
    logout: "Sign Out",
    login: "Sign In",
    search: "Search...",
    filter: "Filter",
    status: "Status",
    priority: "Priority",
    actions: "Actions",
    viewDetails: "View Details",
    save: "Save Changes",
    cancel: "Cancel",
    delete: "Delete",
    edit: "Edit",
    create: "Create New",
    submit: "Submit Request",
    loading: "Loading data...",
    demoMode: "Demo Mode Active",
    liveMode: "Live Server API",
    toggleLanguage: "العربية",
    toggleTheme: "Theme",
    email: "Email Address",
    password: "Password",
    
    // Welcome Banner
    welcomeBack: "Welcome back",
    activeSubscription: "Active Plan",
    requestQuota: "Included Services & Features",
    submitNewRequest: "Submit New Request",
    browsePlans: "Explore & Change Package",
    
    // Requests Workflow
    requestsTitle: "Service Requests & Edits",
    newRequestTitle: "Create New Request",
    requestTitle: "Title of Request",
    requestDescription: "Describe what you need in detail...",
    selectService: "Select Service Category",
    priorityLevel: "Urgency / Priority",
    uploadAttachments: "Upload Attachments & Reference Files",
    dragDropFiles: "Drag & drop PNG, JPG, PDF or doc files (up to 10 files)",
    submitting: "Submitting request...",
    requestSubmittedSuccess: "Request submitted successfully! Agency notified.",
    
    // Ticket detail & discussion
    requestDetails: "Request Breakdown",
    requestStatusTracker: "Progress Tracker",
    comments: "Discussion & Edit Requests",
    typeComment: "Write a message or request an edit...",
    sendComment: "Post Comment",
    noComments: "No comments yet on this request.",
    agencyResponse: "Agency Feedback",
    
    // Statuses
    status_submitted: "Submitted",
    status_in_review: "In Review",
    status_in_progress: "In Progress",
    status_done: "Completed & Delivered",
    status_rejected: "Needs Revision / Rejected",
    
    priority_low: "Low Priority",
    priority_medium: "Normal Priority",
    priority_high: "High Priority",
    
    // Plans & Subscriptions
    currentPlan: "Current Active Plan",
    availablePlans: "Available Agency Packages",
    requestPlanChange: "Subscribe to Package",
    planPendingApproval: "Subscription Request Pending Agency Approval",
    planActive: "Active",
    monthlyPrice: "/ month",
    yearlyPrice: "/ year",
    
    // Deliverables
    deliverablesTitle: "Completed Deliverables & Media",
    deliverablesSub: "Access and download assets produced for your company",
    noDeliverables: "No completed deliverables posted yet.",
    downloadAsset: "Download File",
    
    // Invoices
    invoicesTitle: "Billing & Payment Invoices",
    amountDue: "Amount Due",
    dueDate: "Due Date",
    status_pending: "Payment Pending",
    status_paid: "Paid",
    status_overdue: "Overdue",
    payNow: "Pay Invoice (Stripe)",

    // Notifications
    unreadCount: "unread notifications",
    markAllRead: "Mark all as read",
    noNotifications: "No new notifications."
  },
  ar: {
    // Nav & General
    appName: "بوابة العميل",
    agencyPortal: "لوحة تحكم الوكالة",
    clientPortal: "بوابة العميل",
    dashboard: "نظرة عامة",
    myPlan: "اشتراكي الحالي",
    requests: "طلباتي والتعديلات",
    deliverables: "الملفات المسلمة",
    invoices: "فواتيري ومدفوعاتي",
    notifications: "الإشعارات",
    settings: "الإعدادات",
    logout: "تسجيل الخروج",
    login: "تسجيل الدخول",
    search: "بحث...",
    filter: "تصفية",
    status: "الحالة",
    priority: "الأولوية",
    actions: "الإجراءات",
    viewDetails: "عرض التفاصيل",
    save: "حفظ",
    cancel: "إلغاء",
    delete: "حذف",
    edit: "تعديل",
    create: "إنشاء جديد",
    submit: "إرسال الطلب",
    loading: "جاري تحميل البيانات...",
    demoMode: "وضع التجربة المباشرة",
    liveMode: "متصل بالسيرفر",
    toggleLanguage: "English",
    toggleTheme: "المظهر",
    email: "البريد الإلكتروني",
    password: "كلمة المرور",
    
    // Welcome Banner
    welcomeBack: "مرحباً بك مجدداً",
    activeSubscription: "الباقة النشطة",
    requestQuota: "الخدمات والمزايا المشمولة",
    submitNewRequest: "إرسال طلب جديد",
    browsePlans: "استكشاف وتغيير الباقة",
    
    // Requests Workflow
    requestsTitle: "طلبات الخدمات والتعديلات",
    newRequestTitle: "إنشاء طلب خدمة جديد",
    requestTitle: "عنوان الطلب",
    requestDescription: "اشرح بالتفصيل ما تحتاجه...",
    selectService: "اختر تصنيف الخدمة",
    priorityLevel: "درجة الأهمية / الأولوية",
    uploadAttachments: "رفع المرفقات والملفات المرجعية",
    dragDropFiles: "اسحب وأسقط صور PNG, JPG, PDF أو مستندات (حتى 10 ملفات)",
    submitting: "جاري إرسال الطلب...",
    requestSubmittedSuccess: "تم إرسال الطلب بنجاح! تم إشعار الوكالة.",
    
    // Ticket detail & discussion
    requestDetails: "تفاصيل الطلب",
    requestStatusTracker: "مؤشر تقدم الطلب",
    comments: "المحادثة والملاحظات",
    typeComment: "اكتب رسالة أو اطلب تعديلاً...",
    sendComment: "إرسال التعليق",
    noComments: "لا توجد تعليقات على هذا الطلب بعد.",
    agencyResponse: "رد الوكالة",
    
    // Statuses
    status_submitted: "تم التقديم",
    status_in_review: "قيد المراجعة",
    status_in_progress: "جاري العمل عليه",
    status_done: "مكتمل وتم التسليم",
    status_rejected: "يتطلب تعديلات / مرفوض",
    
    priority_low: "أولوية منخفضة",
    priority_medium: "أولوية عادية",
    priority_high: "أولوية عالية جداً",
    
    // Plans & Subscriptions
    currentPlan: "الباقة المفعّلة حالياً",
    availablePlans: "باقات الوكالة المتاحة",
    requestPlanChange: "الاشتراك في الباقة",
    planPendingApproval: "طلب الاشتراك قيد الانتظار لموافقة الوكالة",
    planActive: "نشطة",
    monthlyPrice: "/ شهرياً",
    yearlyPrice: "/ سنوياً",
    
    // Deliverables
    deliverablesTitle: "الإنجازات والوسائط المكتملة",
    deliverablesSub: "عرض وتحميل كافة التصاميم والملفات المنفذة لشركتك",
    noDeliverables: "لم تقم الوكالة بنشر أي أعمال مكتملة بعد.",
    downloadAsset: "تحميل الملف",
    
    // Invoices
    invoicesTitle: "فواتير وسجلات الدفع",
    amountDue: "المبلغ المستحق",
    dueDate: "تاريخ الاستحقاق",
    status_pending: "معلقة قيد الدفع",
    status_paid: "مدفوعة بالكامل",
    status_overdue: "متأخرة عن موعدها",
    payNow: "دفع الفاتورة (Stripe)",

    // Notifications
    unreadCount: "إشعارات غير مقروءة",
    markAllRead: "تحديد الكل كمقروء",
    noNotifications: "لا توجد إشعارات جديدة."
  }
};
