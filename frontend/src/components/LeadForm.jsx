import { useState, useEffect } from 'react';
import API from '../api/axios';

const defaultForm = {
  name: '',
  email: '',
  phone: '',
  company: '',
  status: 'New',
  dealValue: '',
  source: 'Other',
  assignedTo: '',
};

export default function LeadForm({ lead, onSuccess, onCancel }) {
  const [form, setForm] = useState(lead ? { ...lead, assignedTo: lead.assignedTo?._id || '' } : defaultForm);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    API.get('/users').then(({ data }) => setUsers(data)).catch(() => {});
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return setError('Name is required');
    setLoading(true);
    setError('');

    try {
      if (lead?._id) {
        const { data } = await API.put(`/leads/${lead._id}`, form);
        onSuccess(data);
      } else {
        const { data } = await API.post('/leads', form);
        onSuccess(data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save lead');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Name *</label>
          <input name="name" value={form.name} onChange={handleChange} className="input-field" placeholder="John Doe" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Company</label>
          <input name="company" value={form.company} onChange={handleChange} className="input-field" placeholder="Acme Corp" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Email</label>
          <input name="email" type="email" value={form.email} onChange={handleChange} className="input-field" placeholder="john@acme.com" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Phone</label>
          <input name="phone" value={form.phone} onChange={handleChange} className="input-field" placeholder="+1 555 0100" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Status</label>
          <select name="status" value={form.status} onChange={handleChange} className="input-field">
            {['New', 'Contacted', 'Qualified', 'Won', 'Lost'].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Deal Value ($)</label>
          <input name="dealValue" type="number" value={form.dealValue} onChange={handleChange} className="input-field" placeholder="10000" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Source</label>
          <select name="source" value={form.source} onChange={handleChange} className="input-field">
            {['Website', 'Referral', 'Social Media', 'Cold Call', 'Other'].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Assign To</label>
          <select name="assignedTo" value={form.assignedTo} onChange={handleChange} className="input-field">
            <option value="">Unassigned</option>
            {users.map((u) => (
              <option key={u._id} value={u._id}>{u.name} ({u.role})</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onCancel} className="btn-secondary">Cancel</button>
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? 'Saving...' : lead ? 'Update Lead' : 'Create Lead'}
        </button>
      </div>
    </form>
  );
}
