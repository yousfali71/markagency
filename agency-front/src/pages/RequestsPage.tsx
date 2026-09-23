import React, { useState, useEffect, useMemo } from 'react';
import { Filter, UserPlus, MessageSquare, Send, X, Image as ImageIcon, ChevronRight, GripVertical, ArrowRightLeft } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import type { ServiceRequest, RequestStatus } from '../types/api';
import { initialUsers } from '../services/mockData';

const STATUS_CONFIG: Record<RequestStatus, { label: string; bg: string; color: string; border: string }> = {
  submitted:   { label: 'Submitted',   bg: 'rgba(123,94,167,0.07)',  color: 'var(--brand)', border: 'rgba(123,94,167,0.2)' },
  in_review:   { label: 'In Review',   bg: 'rgba(255,209,102,0.1)', color: '#9A7010',        border: 'rgba(255,209,102,0.3)' },
  in_progress: { label: 'In Progress', bg: 'rgba(78,205,196,0.09)',  color: 'var(--teal)',   border: 'rgba(78,205,196,0.25)' },
  done:        { label: 'Done',        bg: 'rgba(82,199,146,0.1)',   color: 'var(--green)',  border: 'rgba(82,199,146,0.25)' },
  completed:   { label: 'Completed',   bg: 'rgba(82,199,146,0.1)',   color: 'var(--green)',  border: 'rgba(82,199,146,0.25)' },
  rejected:    { label: 'Rejected',    bg: 'rgba(255,90,101,0.09)', color: 'var(--red)',    border: 'rgba(255,90,101,0.2)' },
};

const PRIORITY_CONFIG: Record<string, { color: string; bg: string }> = {
  low:    { color: 'var(--green)', bg: 'var(--green-alpha)' },
  medium: { color: '#9A7010',     bg: 'var(--yellow-alpha)' },
  high:   { color: 'var(--red)',  bg: 'var(--red-alpha)' },
};

export const RequestsPage: React.FC = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [selectedReq, setSelectedReq] = useState<ServiceRequest | null>(null);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [commentText, setCommentText] = useState('');
  const [showAssignModal, setShowAssignModal] = useState(false);

  // Drag and Drop States
  const [draggedReqId, setDraggedReqId] = useState<string | null>(null);
  const [dragOverCol, setDragOverCol] = useState<string | null>(null);

  // Mobile responsive state
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [activeMobileTab, setActiveMobileTab] = useState<string>('submitted');

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const loadRequests = async () => {
    // Fetch all requests ONCE without sending query params that trigger network calls on filter change
    const data = await api.getRequests();
    setRequests(data);
    if (selectedReq) {
      const updated = data.find(r => r.id === selectedReq.id);
      if (updated) setSelectedReq(updated);
    }
  };

  useEffect(() => { loadRequests(); }, []);

  // Smooth 0ms client-side filtering without network calls!
  const filteredRequests = useMemo(() => {
    return requests.filter(r => {
      const matchesStatus = !filterStatus || r.status === filterStatus || (filterStatus === 'done' && r.status === 'completed');
      const matchesPriority = !filterPriority || r.priority === filterPriority;
      return matchesStatus && matchesPriority;
    });
  }, [requests, filterStatus, filterPriority]);

  const handleStatusUpdate = async (id: string, newStatus: RequestStatus) => {
    // Optimistic UI update for instant feedback
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
    if (selectedReq?.id === id) {
      setSelectedReq(prev => prev ? { ...prev, status: newStatus } : null);
    }
    // Persist override to localStorage so it survives page refresh
    await api.updateRequestStatus(id, newStatus);
  };


  const handleAssignStaff = async (staffId: string) => {
    if (!selectedReq) return;
    await api.assignRequest(selectedReq.id, staffId);
    setShowAssignModal(false); loadRequests();
  };

  const handleSendComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !selectedReq || !user) return;
    await api.addComment(selectedReq.id, commentText, user);
    setCommentText(''); loadRequests();
  };

  const statusColumns: { key: RequestStatus; label: string }[] = [
    { key: 'submitted',   label: t('status_submitted') },
    { key: 'in_review',   label: t('status_in_review') },
    { key: 'in_progress', label: t('status_in_progress') },
    { key: 'done',        label: t('status_done') },
    { key: 'rejected',    label: t('status_rejected') },
  ];

  const COL_COLORS = [
    { header: 'var(--brand)', headerBg: 'var(--brand-alpha)' },
    { header: '#9A7010',     headerBg: 'var(--yellow-alpha)' },
    { header: 'var(--teal)', headerBg: 'var(--teal-alpha)' },
    { header: 'var(--green)',headerBg: 'var(--green-alpha)' },
    { header: 'var(--red)',  headerBg: 'var(--red-alpha)' },
  ];

  // Drag and Drop Event Handlers
  const handleDragStart = (e: React.DragEvent, reqId: string) => {
    e.dataTransfer.setData('text/plain', reqId);
    e.dataTransfer.effectAllowed = 'move';
    setDraggedReqId(reqId);
  };

  const handleDragEnd = () => {
    setDraggedReqId(null);
    setDragOverCol(null);
  };

  const handleDragOver = (e: React.DragEvent, colKey: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverCol !== colKey) {
      setDragOverCol(colKey);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDragOverCol(null);
    }
  };

  const handleDrop = (e: React.DragEvent, targetStatus: RequestStatus) => {
    e.preventDefault();
    setDragOverCol(null);
    setDraggedReqId(null);
    const reqId = e.dataTransfer.getData('text/plain');
    if (reqId) {
      handleStatusUpdate(reqId, targetStatus);
    }
  };

  // Filter columns based on mobile tab
  const displayedColumns = activeMobileTab === 'all'
    ? statusColumns
    : statusColumns.filter(c => c.key === activeMobileTab);

  return (
    <div style={{ padding: '24px 16px', display: 'flex', flexDirection: 'column', height: '100%', minHeight: 'calc(100vh - 80px)' }}>

      {/* Page header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('requests')}</h1>
          <p className="page-sub">Kanban board — drag & drop cards across columns to update status instantly</p>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', width: '100%', maxWidth: 'max-content' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-surface)', padding: '9px 14px', borderRadius: '12px', boxShadow: 'var(--shadow-xs)', border: '1.5px solid var(--border)', flex: 1, minWidth: '140px' }}>
            <Filter style={{ width: '14px', color: 'var(--brand)', flexShrink: 0 }} />
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ border: 'none', background: 'transparent', fontSize: '13px', fontFamily: 'Outfit, sans-serif', color: 'var(--text-dark)', outline: 'none', cursor: 'pointer', width: '100%' }}>
              <option value="">All Statuses</option>
              <option value="submitted">Submitted</option>
              <option value="in_review">In Review</option>
              <option value="in_progress">In Progress</option>
              <option value="done">Done</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-surface)', padding: '9px 14px', borderRadius: '12px', boxShadow: 'var(--shadow-xs)', border: '1.5px solid var(--border)', flex: 1, minWidth: '140px' }}>
            <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)} style={{ border: 'none', background: 'transparent', fontSize: '13px', fontFamily: 'Outfit, sans-serif', color: 'var(--text-dark)', outline: 'none', cursor: 'pointer', width: '100%' }}>
              <option value="">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>
      </div>

      {/* Mobile Column Navigation Tabs (hidden on desktop via CSS) */}
      <div className="kanban-mobile-tabs">
        {statusColumns.map(col => {
          const count = filteredRequests.filter(r => r.status === col.key || (col.key === 'done' && r.status === 'completed')).length;
          return (
            <button
              key={col.key}
              className={`kanban-mobile-tab ${activeMobileTab === col.key ? 'active' : ''}`}
              onClick={() => setActiveMobileTab(col.key)}
            >
              <span>{col.label}</span>
              <span className="kanban-tab-count">{count}</span>
            </button>
          );
        })}
      </div>

      {/* Kanban board: scrollable on desktop, single column on mobile */}
      <div
        className="kanban-board-container"
        style={{
          display: 'flex',
          gap: '14px',
          flex: 1,
          overflowX: 'auto',
          minHeight: '480px',
          paddingBottom: '16px',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {statusColumns.map((col) => {
          const colIdx = statusColumns.findIndex(c => c.key === col.key);
          const { header, headerBg } = COL_COLORS[colIdx >= 0 ? colIdx : 0];
          const colRequests = filteredRequests.filter(r => r.status === col.key || (col.key === 'done' && r.status === 'completed'));
          // On mobile: only render the active tab column
          if (isMobile && activeMobileTab !== col.key) return null;
          const isDragOver = dragOverCol === col.key;

          return (
            <div
              key={col.key}
              className={`kanban-col ${isDragOver ? 'kanban-col-dragover' : ''}`}
              onDragOver={e => handleDragOver(e, col.key)}
              onDragLeave={handleDragLeave}
              onDrop={e => handleDrop(e, col.key)}
            >
              {/* Column header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderRadius: '12px', background: headerBg }}>
                <span style={{ fontSize: '12px', fontWeight: 800, color: header, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{col.label}</span>
                <span style={{ width: '22px', height: '22px', borderRadius: '99px', background: header, color: 'white', fontSize: '11px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {colRequests.length}
                </span>
              </div>

              {/* Column Cards Drop Zone */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1, overflowY: 'auto', minHeight: '120px', padding: '2px' }}>
                {colRequests.map(req => {
                  const prio = PRIORITY_CONFIG[req.priority] || PRIORITY_CONFIG.medium;
                  const isBeingDragged = draggedReqId === req.id;

                  return (
                    <div
                      key={req.id}
                      draggable
                      onDragStart={e => handleDragStart(e, req.id)}
                      onDragEnd={handleDragEnd}
                      onClick={() => setSelectedReq(req)}
                      className={`surface-card kanban-card ${isBeingDragged ? 'kanban-card-dragging' : ''}`}
                      style={{
                        padding: '14px',
                        cursor: 'grab',
                        position: 'relative',
                        boxShadow: isBeingDragged ? 'none' : 'var(--shadow-xs)',
                      }}
                    >
                      {/* Drag handle & Priority */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <GripVertical style={{ width: '14px', color: 'var(--text-placeholder)', cursor: 'grab' }} />
                          <span style={{ padding: '3px 8px', borderRadius: '99px', fontSize: '10px', fontWeight: 800, background: prio.bg, color: prio.color, textTransform: 'uppercase' }}>
                            {req.priority}
                          </span>
                        </div>
                        <span style={{ fontSize: '10px', color: 'var(--text-placeholder)', fontFamily: 'monospace' }}>#{req.id.slice(-4)}</span>
                      </div>

                      {/* Title + description */}
                      <h4 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-dark)', margin: '0 0 5px', lineHeight: '1.3', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {req.title}
                      </h4>
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '0 0 12px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {req.description}
                      </p>

                      {/* Footer: Client + Quick Move dropdown + Comments */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '10px', borderTop: '1px solid var(--border)' }}>
                        <span style={{ fontSize: '11px', fontWeight: 700, color: header, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100px' }}>
                          {req.client?.companyName || req.clientId}
                        </span>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {/* Quick move selector for click-to-move */}
                          <div
                            onClick={e => e.stopPropagation()}
                            style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'var(--bg-body)', padding: '2px 6px', borderRadius: '8px', border: '1px solid var(--border)' }}
                            title="Move to another column"
                          >
                            <ArrowRightLeft style={{ width: '10px', color: 'var(--text-muted)' }} />
                            <select
                              value={req.status === 'completed' ? 'done' : req.status}
                              onChange={e => handleStatusUpdate(req.id, e.target.value as RequestStatus)}
                              style={{ border: 'none', background: 'transparent', fontSize: '10px', fontWeight: 700, color: 'var(--text-body)', cursor: 'pointer', outline: 'none' }}
                            >
                              <option value="submitted">Submitted</option>
                              <option value="in_review">In Review</option>
                              <option value="in_progress">In Progress</option>
                              <option value="done">Done</option>
                              <option value="rejected">Rejected</option>
                            </select>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '3px', color: 'var(--text-muted)' }}>
                            <MessageSquare style={{ width: '12px' }} />
                            <span style={{ fontSize: '11px', fontWeight: 600 }}>{req.comments?.length || 0}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {colRequests.length === 0 && (
                  <div
                    style={{
                      border: '2px dashed var(--border)',
                      borderRadius: '12px',
                      padding: '28px 12px',
                      textAlign: 'center',
                      color: 'var(--text-placeholder)',
                      fontSize: '12px',
                      fontWeight: 600,
                      background: isDragOver ? 'var(--brand-alpha)' : 'transparent',
                      transition: 'background 0.2s',
                    }}
                  >
                    {isDragOver ? 'Drop card here' : 'Empty Column'}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Side drawer: request details */}
      {selectedReq && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', justifyContent: 'flex-end', background: 'rgba(28,27,59,0.25)', backdropFilter: 'blur(4px)' }}>
          <div style={{ width: '92vw', maxWidth: '520px', height: '100%', background: 'var(--bg-surface)', display: 'flex', flexDirection: 'column', boxShadow: 'var(--shadow-lg)', overflowY: 'auto' }}>

            {/* Drawer header */}
            <div style={{ padding: '24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--brand)', fontWeight: 700, fontFamily: 'monospace', background: 'var(--brand-alpha)', padding: '3px 8px', borderRadius: '6px' }}>{selectedReq.id}</span>
                <h2 style={{ fontSize: '18px', fontWeight: 900, color: 'var(--text-dark)', margin: '10px 0 0', letterSpacing: '-0.3px' }}>{selectedReq.title}</h2>
              </div>
              <button onClick={() => setSelectedReq(null)} style={{ background: 'var(--bg-body)', border: '1px solid var(--border)', borderRadius: '10px', padding: '8px', cursor: 'pointer', color: 'var(--text-muted)', flexShrink: 0, marginLeft: '12px' }}>
                <X style={{ width: '16px' }} />
              </button>
            </div>

            {/* Status + assign bar */}
            <div style={{ padding: '16px 24px', background: 'var(--bg-body)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)' }}>Status:</span>
                <select
                  value={selectedReq.status === 'completed' ? 'done' : selectedReq.status}
                  onChange={e => handleStatusUpdate(selectedReq.id, e.target.value as RequestStatus)}
                  style={{ border: '1.5px solid var(--border)', borderRadius: '10px', padding: '6px 10px', fontSize: '12px', fontWeight: 700, fontFamily: 'Outfit, sans-serif', background: 'var(--bg-surface)', color: 'var(--text-dark)', cursor: 'pointer', outline: 'none' }}
                >
                  <option value="submitted">Submitted</option>
                  <option value="in_review">In Review</option>
                  <option value="in_progress">In Progress</option>
                  <option value="done">Done</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)' }}>Assigned:</span>
                <button onClick={() => setShowAssignModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '10px', background: 'var(--brand-alpha)', color: 'var(--brand)', border: 'none', fontSize: '12px', fontWeight: 700, cursor: 'pointer', fontFamily: 'Outfit, sans-serif' }}>
                  <UserPlus style={{ width: '13px' }} />
                  {selectedReq.assignedUser?.name || 'Assign Staff'}
                </button>
              </div>
            </div>

            {/* Scrollable content */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>

              {/* Description */}
              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 10px' }}>Description</h3>
                <div style={{ background: 'var(--bg-body)', borderRadius: '12px', padding: '14px', fontSize: '14px', color: 'var(--text-body)', lineHeight: '1.6', border: '1px solid var(--border)' }}>
                  {selectedReq.description}
                </div>
              </div>

              {/* Attachments */}
              {(selectedReq.attachments || []).length > 0 && (
                <div style={{ marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 10px' }}>Attachments</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    {selectedReq.attachments?.map(att => (
                      <a key={att.id} href={att.url} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '12px', background: 'var(--bg-body)', border: '1px solid var(--border)', textDecoration: 'none', transition: 'border-color 0.15s' }}>
                        <ImageIcon style={{ width: '16px', color: 'var(--brand)' }} />
                        <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-dark)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{att.fileName}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Comments */}
              <div>
                <h3 style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 10px' }}>Discussion</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
                  {(selectedReq.comments || []).length === 0
                    ? <p style={{ fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center', padding: '20px', background: 'var(--bg-body)', borderRadius: '12px' }}>No comments yet</p>
                    : selectedReq.comments?.map(c => (
                      <div key={c.id} style={{ padding: '12px 14px', borderRadius: '12px', background: 'var(--bg-body)', border: '1px solid var(--border)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                          <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--brand)' }}>{c.user?.name || c.userId}</span>
                          <span style={{ fontSize: '11px', color: 'var(--text-placeholder)' }}>{new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <p style={{ fontSize: '13px', color: 'var(--text-body)', margin: 0, lineHeight: '1.5' }}>{c.message}</p>
                      </div>
                    ))
                  }
                </div>
              </div>
            </div>

            {/* Comment input */}
            <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border)', background: 'var(--bg-surface)' }}>
              <form onSubmit={handleSendComment} style={{ display: 'flex', gap: '10px' }}>
                <input
                  type="text"
                  placeholder="Write a comment…"
                  value={commentText}
                  onChange={e => setCommentText(e.target.value)}
                  className="input-light"
                  style={{ flex: 1 }}
                />
                <button type="submit" className="btn-brand" style={{ padding: '11px 16px', flexShrink: 0 }}>
                  <Send style={{ width: '15px' }} />
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Staff Assignment Modal */}
      {showAssignModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)' }}>
          <div className="surface-card" style={{ width: '340px', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-dark)', margin: 0 }}>Assign Staff</h3>
              <button onClick={() => setShowAssignModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X style={{ width: '16px' }} />
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {initialUsers.filter(u => u.role === 'agency').map(st => (
                <div
                  key={st.id}
                  onClick={() => handleAssignStaff(st.id)}
                  style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', borderRadius: '12px', background: 'var(--bg-body)', border: '1.5px solid var(--border)', cursor: 'pointer', transition: 'border-color 0.15s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--brand)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; }}
                >
                  <img src={st.avatarUrl} alt={st.name} style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }} />
                  <div>
                    <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-dark)', margin: '0 0 2px' }}>{st.name}</p>
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0, textTransform: 'capitalize' }}>{st.agencyPermission}</p>
                  </div>
                  <ChevronRight style={{ width: '14px', color: 'var(--text-muted)', marginLeft: 'auto' }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
