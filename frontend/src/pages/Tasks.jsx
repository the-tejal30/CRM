import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import TasksList from '../components/TasksList';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import API from '../api/axios';
import PlusIcon from '../icons/PlusIcon';
import CloseIcon from '../icons/CloseIcon';

export default function Tasks() {
  const { user } = useAuth();
  const toast = useToast();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState('');
  const [users, setUsers] = useState([]);
  const [leads, setLeads] = useState([]);
  const [form, setForm] = useState({ title: '', description: '', assignedTo: '', leadId: '', dueDate: '', priority: 'Medium' });

  useEffect(() => {
    const usersPromise = user?.role === 'Admin'
      ? API.get('/users')
      : Promise.resolve({ data: [user] });

    Promise.all([
      API.get('/tasks'),
      usersPromise,
      API.get('/leads?limit=100').catch(() => ({ data: { leads: [] } })),
    ]).then(([tasksRes, usersRes, leadsRes]) => {
      setTasks(tasksRes.data);
      setUsers(usersRes.data);
      setLeads(leadsRes.data.leads || []);
    }).catch(() => {
      toast.error('Failed to load tasks');
    }).finally(() => setLoading(false));
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.assignedTo) return;
    try {
      const { data } = await API.post('/tasks', form);
      setTasks((prev) => [data, ...prev]);
      setShowForm(false);
      setForm({ title: '', description: '', assignedTo: '', leadId: '', dueDate: '', priority: 'Medium' });
      toast.success('Task created');
    } catch {
      toast.error('Failed to create task');
    }
  };

  const handleDelete = async (id) => {
    try {
      await API.delete(`/tasks/${id}`);
      setTasks((prev) => prev.filter((t) => t._id !== id));
      toast.success('Task deleted');
    } catch {
      toast.error('Failed to delete task');
    }
  };

  const filtered = filter ? tasks.filter((t) => t.status === filter) : tasks;
  const pending = tasks.filter((t) => t.status === 'Pending').length;
  const completed = tasks.filter((t) => t.status === 'Completed').length;

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: '#f8fafc' }}>
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden md:ml-60">
        <Navbar title="Tasks" />
        <main className="flex-1 overflow-y-auto p-6">
          {/* Stats row */}
          <div className="grid grid-cols-3 gap-4 mb-5">
            {[
              { label: 'All', count: tasks.length, key: '' },
              { label: 'Pending', count: pending, key: 'Pending' },
              { label: 'Completed', count: completed, key: 'Completed' },
            ].map(({ label, count, key }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`p-4 rounded-xl border text-left transition-all duration-150 ${
                  filter === key
                    ? 'bg-primary-600 border-primary-600 text-white shadow-sm'
                    : 'bg-white border-slate-100 shadow-card hover:border-primary-200 hover:shadow-card-hover'
                }`}
              >
                <p className={`text-2xl font-bold ${filter === key ? 'text-white' : 'text-slate-900'}`}>{count}</p>
                <p className={`text-xs font-medium mt-0.5 ${filter === key ? 'text-primary-200' : 'text-slate-400'}`}>{label}</p>
              </button>
            ))}
          </div>

          <div className="bg-white rounded-xl border border-slate-100 shadow-card">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="text-sm font-semibold text-slate-900">
                {filter || 'All'} Tasks
              </h3>
              <button onClick={() => setShowForm(true)} className="btn-primary text-xs px-3 py-2">
                <PlusIcon size={14} /> New Task
              </button>
            </div>
            <div className="px-6 py-2">
              {loading ? (
                <div className="flex justify-center py-20">
                  <div className="w-7 h-7 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <TasksList
                  tasks={filtered}
                  onUpdate={(updated) => setTasks((prev) => prev.map((t) => t._id === updated._id ? updated : t))}
                  onDelete={handleDelete}
                />
              )}
            </div>
          </div>
        </main>
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-box max-w-lg" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
              <h2 className="text-base font-semibold text-slate-900">New Task</h2>
              <button onClick={() => setShowForm(false)} className="btn-ghost p-1.5"><CloseIcon size={16} /></button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Title *</label>
                <input value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} className="input-field" placeholder="Follow up call" required />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Description</label>
                <textarea value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} className="input-field resize-none" rows={2} placeholder="Optional details…" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Assign To *</label>
                  <select value={form.assignedTo} onChange={(e) => setForm((p) => ({ ...p, assignedTo: e.target.value }))} className="input-field" required>
                    <option value="">Select user</option>
                    {users.map((u) => <option key={u._id} value={u._id}>{u.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Related Lead</label>
                  <select value={form.leadId} onChange={(e) => setForm((p) => ({ ...p, leadId: e.target.value }))} className="input-field">
                    <option value="">No lead</option>
                    {leads.map((l) => <option key={l._id} value={l._id}>{l.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Due Date</label>
                  <input type="date" value={form.dueDate} onChange={(e) => setForm((p) => ({ ...p, dueDate: e.target.value }))} className="input-field" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Priority</label>
                  <select value={form.priority} onChange={(e) => setForm((p) => ({ ...p, priority: e.target.value }))} className="input-field">
                    {['Low', 'Medium', 'High'].map((p) => <option key={p}>{p}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">Create Task</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
