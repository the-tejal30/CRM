import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import API from '../api/axios';
import KeyIcon from '../icons/KeyIcon';
import CopyIcon from '../icons/CopyIcon';
import ShieldIcon from '../icons/ShieldIcon';
import TeamIcon from '../icons/TeamIcon';
import EditIcon from '../icons/EditIcon';
import CloseIcon from '../icons/CloseIcon';
import CheckIcon from '../icons/CheckIcon';
import MailIcon from '../icons/MailIcon';
import LockIcon from '../icons/LockIcon';

function EditUserModal({ target, onClose, onSaved }) {
  const toast = useToast();
  const [form, setForm] = useState({ name: target.name, email: target.email, role: target.role });
  const [newPw, setNewPw] = useState('');
  const [showPwField, setShowPwField] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async (e) => {
    e.preventDefault();
    setError(''); setSaving(true);
    try {
      const payload = { ...form };
      if (showPwField && newPw) payload.newPassword = newPw;
      const { data } = await API.put(`/users/${target._id}`, payload);
      onSaved({ ...target, ...data });
      toast.success('Member updated');
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save');
    } finally { setSaving(false); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box max-w-sm" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <h2 className="font-semibold text-slate-900 text-base">Edit Member</h2>
          <button onClick={onClose} className="btn-ghost p-1.5 rounded-lg"><CloseIcon size={16}/></button>
        </div>
        <form onSubmit={handleSave} className="p-6 space-y-4">
          {error && <div className="bg-red-50 border border-red-100 text-red-700 px-3 py-2 rounded-lg text-xs">{error}</div>}

          <div className="flex items-center gap-3 mb-2">
            {target.avatarUrl ? (
              <img src={target.avatarUrl} alt="avatar" className="w-10 h-10 rounded-full object-cover flex-shrink-0"/>
            ) : (
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                   style={{ background: target.role === 'Admin' ? 'linear-gradient(135deg,#6366f1,#8b5cf6)' : 'linear-gradient(135deg,#0ea5e9,#0284c7)' }}>
                {target.name?.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <p className="text-sm font-semibold text-slate-800">{target.name}</p>
              <p className="text-xs text-slate-400">{target.email}</p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Full Name</label>
            <input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} className="input-field" required/>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Email</label>
            <div className="relative">
              <MailIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"/>
              <input type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} className="input-field pl-9" required/>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Role</label>
            <select value={form.role} onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))} className="input-field">
              <option>Admin</option>
              <option>Employee</option>
            </select>
          </div>

          {/* Password reset */}
          <div className="border-t border-slate-100 pt-4">
            <button type="button" onClick={() => setShowPwField((p) => !p)}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-primary-600 transition-colors">
              <LockIcon size={13}/> {showPwField ? 'Cancel password reset' : 'Reset password'}
            </button>
            {showPwField && (
              <div className="mt-3">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">New Password</label>
                <div className="relative">
                  <LockIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"/>
                  <input type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)}
                    className="input-field pl-9" placeholder="Min. 6 characters" minLength={6}/>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">The user will use this password on next login.</p>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1 justify-center"
              style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
              {saving ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"/> : <><CheckIcon size={13}/> Save</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Users() {
  const { user: currentUser } = useAuth();
  const toast = useToast();
  const isAdmin = currentUser?.role === 'Admin';
  const [users, setUsers] = useState([]);
  const [org, setOrg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [editTarget, setEditTarget] = useState(null);

  useEffect(() => {
    Promise.all([
      API.get('/organizations/members'),
      API.get('/organizations/me'),
    ]).then(([usersRes, orgRes]) => {
      setUsers(usersRes.data);
      setOrg(orgRes.data);
    }).catch(() => {
      toast.error('Failed to load team');
    }).finally(() => setLoading(false));
  }, []);

  const copyInvite = () => {
    navigator.clipboard.writeText(org?.inviteCode || '');
    setCopied(true);
    toast.info('Invite code copied');
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleActive = async (userId, isActive) => {
    try {
      const { data } = await API.put(`/users/${userId}`, { isActive: !isActive });
      setUsers((prev) => prev.map((u) => (u._id === userId ? { ...u, isActive: data.isActive } : u)));
      toast.success(data.isActive ? 'Member activated' : 'Member deactivated');
    } catch {
      toast.error('Failed to update member status');
    }
  };

  const removeUser = async (userId) => {
    if (!confirm('Remove this user from the organization?')) return;
    try {
      await API.delete(`/users/${userId}`);
      setUsers((prev) => prev.filter((u) => u._id !== userId));
      toast.success('Member removed');
    } catch {
      toast.error('Failed to remove member');
    }
  };

  const roleBadge = (role) => role === 'Admin' ? 'bg-violet-100 text-violet-700' : 'bg-blue-100 text-blue-700';

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: '#f8fafc' }}>
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden md:ml-60">
        <Navbar title="Team" />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">

          {/* Org Card */}
          {org && (
            <div className="bg-white rounded-xl border border-slate-100 shadow-card p-5 mb-5">
              <div className="flex flex-col sm:flex-row sm:items-center gap-5">
                <div className="flex items-center gap-4 flex-1">
                  {org.logoUrl ? (
                    <img src={org.logoUrl} alt="logo" className="w-12 h-12 rounded-xl object-cover border border-slate-100 flex-shrink-0"/>
                  ) : (
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold text-white flex-shrink-0"
                         style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
                      {org.organizationName?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <h2 className="font-bold text-slate-900">{org.organizationName}</h2>
                    {org.industry && <p className="text-xs text-slate-400">{org.industry}</p>}
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <TeamIcon size={12} className="text-slate-400"/>
                      <p className="text-xs text-slate-400">{users.length} member{users.length !== 1 ? 's' : ''}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-primary-50 rounded-xl px-4 py-3">
                  <KeyIcon size={15} className="text-primary-500 flex-shrink-0"/>
                  <div>
                    <p className="text-[10px] text-primary-500 font-semibold uppercase tracking-wide">Invite Code</p>
                    <p className="text-base font-bold text-primary-700 tracking-[0.15em] font-mono">{org.inviteCode}</p>
                  </div>
                  <button onClick={copyInvite}
                    className="ml-2 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                    style={{ background: copied ? '#dcfce7' : '#e0e7ff', color: copied ? '#15803d' : '#4f46e5' }}>
                    <CopyIcon size={12}/>{copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Members Table */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-card">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="text-sm font-semibold text-slate-900">
                Members
                <span className="ml-2 text-xs font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{users.length}</span>
              </h3>
              {!isAdmin && (
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <ShieldIcon size={13}/>
                  <span className="hidden sm:inline">Read-only - contact admin to manage</span>
                </div>
              )}
            </div>

            {loading ? (
              <div className="flex justify-center py-16">
                <div className="w-7 h-7 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"/>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-slate-50">
                      {['Member', 'Role', 'Status', 'Joined', ...(isAdmin ? ['Actions'] : [])].map((h) => (
                        <th key={h} className="px-6 py-3 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {users.map((u) => (
                      <tr key={u._id} className="hover:bg-slate-50/60 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {u.avatarUrl ? (
                              <img src={u.avatarUrl} alt="avatar" className="w-8 h-8 rounded-full object-cover flex-shrink-0"/>
                            ) : (
                              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                                   style={{ background: u.role === 'Admin' ? 'linear-gradient(135deg,#6366f1,#8b5cf6)' : 'linear-gradient(135deg,#0ea5e9,#0284c7)' }}>
                                {u.name?.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <div>
                              <p className="text-sm font-semibold text-slate-800">
                                {u.name}
                                {u._id === currentUser?._id && (
                                  <span className="ml-1.5 text-[10px] text-slate-400 font-normal bg-slate-100 px-1.5 py-0.5 rounded-full">you</span>
                                )}
                              </p>
                              <p className="text-xs text-slate-400">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`badge ${roleBadge(u.role)}`}>{u.role}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`badge ${u.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
                            <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${u.isActive ? 'bg-emerald-500' : 'bg-red-400'}`}/>
                            {u.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-400">
                          {new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>
                        {isAdmin && (
                          <td className="px-6 py-4">
                            <div className={`flex items-center gap-1 ${u._id !== currentUser?._id ? 'opacity-0 group-hover:opacity-100' : 'opacity-0'} transition-opacity`}>
                              {u._id !== currentUser?._id && (
                                <>
                                  <button
                                    onClick={() => setEditTarget(u)}
                                    className="p-1.5 rounded-lg text-slate-400 hover:text-primary-600 hover:bg-primary-50 transition-colors"
                                    title="Edit member"
                                  >
                                    <EditIcon size={14}/>
                                  </button>
                                  <button
                                    onClick={() => toggleActive(u._id, u.isActive)}
                                    className={`text-xs font-medium px-2.5 py-1 rounded-lg transition-colors ${
                                      u.isActive ? 'text-amber-600 hover:bg-amber-50' : 'text-emerald-600 hover:bg-emerald-50'
                                    }`}
                                  >
                                    {u.isActive ? 'Deactivate' : 'Activate'}
                                  </button>
                                  <button
                                    onClick={() => removeUser(u._id)}
                                    className="text-xs font-medium text-red-500 hover:bg-red-50 px-2.5 py-1 rounded-lg transition-colors"
                                  >
                                    Remove
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>

      {editTarget && (
        <EditUserModal
          target={editTarget}
          onClose={() => setEditTarget(null)}
          onSaved={(updated) => setUsers((prev) => prev.map((u) => u._id === updated._id ? updated : u))}
        />
      )}
    </div>
  );
}
