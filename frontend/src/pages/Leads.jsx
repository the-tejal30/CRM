import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import LeadsTable from '../components/LeadsTable';
import LeadForm from '../components/LeadForm';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import API from '../api/axios';
import PlusIcon from '../icons/PlusIcon';
import SearchIcon from '../icons/SearchIcon';
import CloseIcon from '../icons/CloseIcon';

const exportCSV = (leads) => {
  const headers = ['Name', 'Company', 'Email', 'Phone', 'Status', 'Deal Value', 'Source', 'Assigned To', 'Created'];
  const rows = leads.map((l) => [
    l.name, l.company || '', l.email || '', l.phone || '',
    l.status, l.dealValue || 0, l.source || '',
    l.assignedTo?.name || '', new Date(l.createdAt).toLocaleDateString(),
  ]);
  const csv = [headers, ...rows].map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = 'leads.csv'; a.click();
  URL.revokeObjectURL(url);
};

const STATUSES = ['', 'New', 'Contacted', 'Qualified', 'Won', 'Lost'];

export default function Leads() {
  const { user } = useAuth();
  const toast = useToast();
  const [leads, setLeads] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');

  const fetchLeads = async (p = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: p, limit: 15 });
      if (search) params.append('search', search);
      if (status) params.append('status', status);
      const { data } = await API.get(`/leads?${params}`);
      setLeads(data.leads);
      setTotal(data.total);
      setPages(data.pages);
      setPage(data.page);
    } catch {
      toast.error('Failed to load leads');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLeads(); }, [status]);

  const handleSearch = (e) => { e.preventDefault(); fetchLeads(1); };

  const handleDelete = async (id) => {
    if (!confirm('Delete this lead and all its notes?')) return;
    try {
      await API.delete(`/leads/${id}`);
      setLeads((prev) => prev.filter((l) => l._id !== id));
      setTotal((t) => t - 1);
      toast.success('Lead deleted');
    } catch {
      toast.error('Failed to delete lead');
    }
  };

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: '#f8fafc' }}>
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden md:ml-60">
        <Navbar title="Leads" />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {/* Toolbar */}
          <div className="flex flex-col gap-3 mb-5">
            <div className="flex items-center gap-2">
              <form onSubmit={handleSearch} className="flex gap-2 flex-1 min-w-0">
                <div className="relative flex-1 min-w-0">
                  <SearchIcon size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search leads…"
                    className="input-field pl-9"
                  />
                </div>
                <button type="submit" className="btn-primary flex-shrink-0">Search</button>
              </form>
              <button onClick={() => setShowForm(true)} className="btn-primary flex-shrink-0">
                <PlusIcon size={15} /><span className="hidden sm:inline">New Lead</span>
              </button>
            </div>
            <div className="flex rounded-lg border border-slate-200 bg-white p-1 gap-0.5 overflow-x-auto">
              {STATUSES.map((s) => (
                <button
                  key={s}
                  onClick={() => setStatus(s)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-150 whitespace-nowrap flex-shrink-0 ${
                    status === s ? 'bg-primary-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                  }`}
                >
                  {s || 'All'}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-100 shadow-card overflow-hidden">
            <div className="px-4 sm:px-6 py-4 border-b border-slate-100 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-slate-900">{total}</span>
                <span className="text-sm text-slate-400">lead{total !== 1 ? 's' : ''} found</span>
              </div>
              {leads.length > 0 && (
                <button
                  onClick={() => { exportCSV(leads); toast.info('CSV exported'); }}
                  className="text-xs font-medium text-slate-500 hover:text-primary-600 px-2.5 py-1.5 rounded-lg hover:bg-primary-50 transition-colors flex-shrink-0"
                >
                  ↓ Export CSV
                </button>
              )}
            </div>

            {loading ? (
              <div className="flex justify-center py-20">
                <div className="w-7 h-7 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <LeadsTable leads={leads} onDelete={handleDelete} isAdmin={user?.role === 'Admin'} />
            )}

            {pages > 1 && (
              <div className="flex items-center justify-center gap-2 px-6 py-4 border-t border-slate-100">
                <button disabled={page === 1} onClick={() => fetchLeads(page - 1)} className="btn-secondary disabled:opacity-40 text-xs px-3 py-1.5">← Prev</button>
                <span className="text-xs text-slate-500 font-medium">Page {page} of {pages}</span>
                <button disabled={page === pages} onClick={() => fetchLeads(page + 1)} className="btn-secondary disabled:opacity-40 text-xs px-3 py-1.5">Next →</button>
              </div>
            )}
          </div>
        </main>
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-box max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
              <h2 className="text-base font-semibold text-slate-900">New Lead</h2>
              <button onClick={() => setShowForm(false)} className="btn-ghost p-1.5"><CloseIcon size={16} /></button>
            </div>
            <div className="p-6">
              <LeadForm
                onSuccess={(newLead) => {
                  setLeads((prev) => [newLead, ...prev]);
                  setTotal((t) => t + 1);
                  setShowForm(false);
                  toast.success('Lead created');
                }}
                onCancel={() => setShowForm(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
