import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSidebar } from '../context/SidebarContext';
import { useToast } from '../context/ToastContext';
import API from '../api/axios';
import BuildingIcon from '../icons/BuildingIcon';
import CloseIcon from '../icons/CloseIcon';
import KeyIcon from '../icons/KeyIcon';
import CopyIcon from '../icons/CopyIcon';
import MailIcon from '../icons/MailIcon';
import ShieldIcon from '../icons/ShieldIcon';
import TeamIcon from '../icons/TeamIcon';
import CalendarIcon from '../icons/CalendarIcon';
import EditIcon from '../icons/EditIcon';
import LockIcon from '../icons/LockIcon';
import ImageIcon from '../icons/ImageIcon';
import GlobeIcon from '../icons/GlobeIcon';
import MenuIcon from '../icons/MenuIcon';
import CheckIcon from '../icons/CheckIcon';

function Modal({ onClose, children, maxW = 'max-w-md' }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className={`modal-box ${maxW} max-h-[90vh] overflow-y-auto w-full`} onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

/* ── Profile Modal ─────────────────────────────────────────────── */
function ProfileModal({ user, onClose, onUpdate }) {
  const toast = useToast();
  const [tab, setTab] = useState('view');
  const [form, setForm] = useState({ name: user?.name || '', email: user?.email || '' });
  const [avatarPreview, setAvatarPreview] = useState(user?.avatarUrl || '');
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleAvatarFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 500 * 1024) { setError('Photo must be under 500 KB'); return; }
    const reader = new FileReader();
    reader.onload = (ev) => setAvatarPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const saveProfile = async () => {
    setError(''); setSaving(true);
    try {
      const { data } = await API.put('/auth/profile', { ...form, avatarUrl: avatarPreview });
      onUpdate(data);
      toast.success('Profile updated');
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save');
    } finally { setSaving(false); }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirm) return setError('Passwords do not match');
    if (pwForm.newPassword.length < 6) return setError('Password must be at least 6 characters');
    setError(''); setSaving(true);
    try {
      await API.put('/auth/profile', { currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      toast.success('Password changed');
      setPwForm({ currentPassword: '', newPassword: '', confirm: '' });
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change password');
    } finally { setSaving(false); }
  };

  return (
    <Modal onClose={onClose}>
      <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
        <h2 className="font-semibold text-slate-900 text-base">My Profile</h2>
        <button onClick={onClose} className="btn-ghost p-1.5 rounded-lg"><CloseIcon size={16} /></button>
      </div>
      <div className="p-6">
        <div className="flex items-center gap-4 mb-5">
          <div className="relative flex-shrink-0">
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt="avatar" className="w-16 h-16 rounded-2xl object-cover"/>
            ) : (
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-bold text-white"
                   style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
                {user?.name?.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-slate-900 truncate">{user?.name}</h3>
            <span className={`badge mt-1 ${user?.role === 'Admin' ? 'bg-violet-100 text-violet-700' : 'bg-blue-100 text-blue-700'}`}>
              {user?.role}
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-slate-100 rounded-xl mb-5">
          {[['view','Info'],['edit','Edit'],['password','Password']].map(([key, label]) => (
            <button key={key} onClick={() => { setTab(key); setError(''); }}
              className="flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all"
              style={tab === key ? { background: '#fff', color: '#4f46e5', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' } : { color: '#64748b' }}>
              {label}
            </button>
          ))}
        </div>

        {error && <div className="bg-red-50 border border-red-100 text-red-700 px-3 py-2 rounded-lg text-xs mb-4">{error}</div>}

        {tab === 'view' && (
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
              <MailIcon size={15} className="text-slate-400 flex-shrink-0" />
              <div><p className="text-[11px] text-slate-400 font-medium">Email</p><p className="text-sm text-slate-800 font-medium">{user?.email || '—'}</p></div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
              <BuildingIcon size={15} className="text-slate-400 flex-shrink-0" />
              <div><p className="text-[11px] text-slate-400 font-medium">Organization</p><p className="text-sm text-slate-800 font-medium">{user?.organizationName}</p></div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
              <ShieldIcon size={15} className="text-slate-400 flex-shrink-0" />
              <div>
                <p className="text-[11px] text-slate-400 font-medium">Access Level</p>
                <p className="text-sm text-slate-800 font-semibold">{user?.role === 'Admin' ? 'Administrator' : 'Team Member'}</p>
                <p className="text-xs text-slate-400 mt-0.5">{user?.role === 'Admin' ? 'Manage team, leads & analytics' : 'Assigned leads & tasks'}</p>
              </div>
            </div>
          </div>
        )}

        {tab === 'edit' && (
          <div className="space-y-4">
            {/* Avatar upload */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Profile Photo</label>
              <div className="flex items-center gap-4">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="preview" className="w-14 h-14 rounded-2xl object-cover border border-slate-200 flex-shrink-0"/>
                ) : (
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-base font-bold text-white flex-shrink-0"
                       style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
                    {user?.name?.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)}
                  </div>
                )}
                <div className="flex flex-col gap-1.5">
                  <label className="btn-secondary cursor-pointer text-xs px-3 py-1.5 inline-flex items-center gap-1.5">
                    <ImageIcon size={13}/> Upload Photo
                    <input type="file" accept="image/*" className="hidden" onChange={handleAvatarFile}/>
                  </label>
                  {avatarPreview && <button onClick={() => setAvatarPreview('')} className="text-xs text-red-500 hover:underline text-left">Remove</button>}
                  <p className="text-[11px] text-slate-400">JPG, PNG up to 500 KB</p>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Full Name</label>
              <input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} className="input-field" placeholder="Your name" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Email</label>
              <input type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} className="input-field" placeholder="you@company.com" />
            </div>
            <div className="flex gap-3 pt-1">
              <button onClick={() => { setTab('view'); setError(''); }} className="btn-secondary flex-1">Cancel</button>
              <button onClick={saveProfile} disabled={saving} className="btn-primary flex-1 justify-center"
                style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
                {saving ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"/> : 'Save Changes'}
              </button>
            </div>
          </div>
        )}

        {tab === 'password' && (
          <form onSubmit={changePassword} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Current Password</label>
              <div className="relative">
                <LockIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input type="password" value={pwForm.currentPassword} onChange={(e) => setPwForm((p) => ({ ...p, currentPassword: e.target.value }))}
                  className="input-field pl-9" placeholder="••••••••" required />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">New Password</label>
              <div className="relative">
                <LockIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input type="password" value={pwForm.newPassword} onChange={(e) => setPwForm((p) => ({ ...p, newPassword: e.target.value }))}
                  className="input-field pl-9" placeholder="Min. 6 characters" required minLength={6} />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Confirm New Password</label>
              <div className="relative">
                <LockIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input type="password" value={pwForm.confirm} onChange={(e) => setPwForm((p) => ({ ...p, confirm: e.target.value }))}
                  className="input-field pl-9" placeholder="••••••••" required />
              </div>
            </div>
            <div className="flex gap-3 pt-1">
              <button type="button" onClick={() => { setTab('view'); setError(''); }} className="btn-secondary flex-1">Cancel</button>
              <button type="submit" disabled={saving} className="btn-primary flex-1 justify-center"
                style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
                {saving ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"/> : 'Update Password'}
              </button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
}

/* ── Company Modal ─────────────────────────────────────────────── */
function CompanyModal({ user, onClose, onOrgUpdate }) {
  const toast = useToast();
  const isAdmin = user?.role === 'Admin';
  const [org, setOrg] = useState(null);
  const [members, setMembers] = useState([]);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [orgForm, setOrgForm] = useState({ organizationName: '', logoUrl: '', website: '', industry: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([API.get('/organizations/me'), API.get('/organizations/members')])
      .then(([orgRes, membersRes]) => {
        setOrg(orgRes.data);
        setMembers(membersRes.data);
        setOrgForm({
          organizationName: orgRes.data.organizationName || '',
          logoUrl: orgRes.data.logoUrl || '',
          website: orgRes.data.website || '',
          industry: orgRes.data.industry || '',
        });
      }).finally(() => setLoading(false));
  }, []);

  const copyInvite = () => {
    navigator.clipboard.writeText(org?.inviteCode || '');
    setCopied(true);
    toast.info('Invite code copied');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLogoFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 500 * 1024) { setError('Image must be under 500 KB'); return; }
    const reader = new FileReader();
    reader.onload = (ev) => setOrgForm((p) => ({ ...p, logoUrl: ev.target.result }));
    reader.readAsDataURL(file);
  };

  const saveOrg = async () => {
    setError(''); setSaving(true);
    try {
      const { data } = await API.put('/organizations/me', orgForm);
      setOrg(data);
      onOrgUpdate?.({ orgLogoUrl: data.logoUrl || '', organizationName: data.organizationName });
      toast.success('Company profile updated');
      setEditing(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save');
    } finally { setSaving(false); }
  };

  const INDUSTRIES = ['Technology', 'Finance', 'Healthcare', 'Retail', 'Manufacturing', 'Education', 'Real Estate', 'Other'];

  return (
    <Modal onClose={onClose} maxW="max-w-lg">
      <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
        <h2 className="font-semibold text-slate-900 text-base">Company Profile</h2>
        <div className="flex items-center gap-2">
          {isAdmin && !editing && (
            <button onClick={() => setEditing(true)} className="btn-secondary px-3 py-1.5 text-xs gap-1.5">
              <EditIcon size={13}/> Edit
            </button>
          )}
          <button onClick={onClose} className="btn-ghost p-1.5 rounded-lg"><CloseIcon size={16} /></button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="p-6 space-y-5">
          {error && <div className="bg-red-50 border border-red-100 text-red-700 px-3 py-2 rounded-lg text-xs">{error}</div>}

          {!editing ? (
            <>
              <div className="flex items-center gap-4">
                {org?.logoUrl ? (
                  <img src={org.logoUrl} alt="logo" className="w-14 h-14 rounded-xl object-cover flex-shrink-0 border border-slate-100"/>
                ) : (
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center text-lg font-bold text-white flex-shrink-0"
                       style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
                    {org?.organizationName?.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{org?.organizationName}</h3>
                  {org?.industry && <p className="text-xs text-slate-400 mt-0.5">{org.industry}</p>}
                  <div className="flex items-center gap-2 mt-1">
                    <CalendarIcon size={12} className="text-slate-400"/>
                    <p className="text-xs text-slate-400">Created {new Date(org?.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
                  </div>
                </div>
              </div>

              {org?.website && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-slate-50">
                  <GlobeIcon size={14} className="text-slate-400 flex-shrink-0"/>
                  <a href={org.website} target="_blank" rel="noreferrer" className="text-sm text-primary-600 hover:underline truncate">{org.website}</a>
                </div>
              )}

              <div className="p-4 rounded-xl border border-dashed border-primary-200 bg-primary-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <KeyIcon size={15} className="text-primary-500"/>
                    <div>
                      <p className="text-[11px] text-primary-600 font-medium">Invite Code</p>
                      <p className="text-lg font-bold text-primary-700 tracking-[0.2em] font-mono">{org?.inviteCode}</p>
                    </div>
                  </div>
                  <button onClick={copyInvite}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                    style={{ backgroundColor: copied ? '#dcfce7' : '#e0e7ff', color: copied ? '#15803d' : '#4f46e5' }}>
                    <CopyIcon size={13}/>{copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <p className="text-[11px] text-primary-500 mt-2">Share this code to invite teammates</p>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-3">
                  <TeamIcon size={14} className="text-slate-400"/>
                  <p className="text-sm font-semibold text-slate-700">Team ({members.length})</p>
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {members.map((m) => (
                    <div key={m._id} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-slate-50 transition-colors">
                      {m.avatarUrl ? (
                        <img src={m.avatarUrl} alt="avatar" className="w-7 h-7 rounded-full object-cover flex-shrink-0"/>
                      ) : (
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                             style={{ background: m.role === 'Admin' ? 'linear-gradient(135deg,#6366f1,#8b5cf6)' : 'linear-gradient(135deg,#06b6d4,#0284c7)' }}>
                          {m.name?.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-800 truncate">
                          {m.name}{m._id === user?._id && <span className="text-slate-400 font-normal ml-1">(you)</span>}
                        </p>
                        <p className="text-[11px] text-slate-400 truncate">{m.email}</p>
                      </div>
                      <span className={`badge text-[10px] ${m.role === 'Admin' ? 'bg-violet-100 text-violet-600' : 'bg-blue-100 text-blue-600'}`}>{m.role}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Company Logo</label>
                <div className="flex items-center gap-4">
                  {orgForm.logoUrl ? (
                    <img src={orgForm.logoUrl} alt="logo" className="w-14 h-14 rounded-xl object-cover border border-slate-200 flex-shrink-0"/>
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                      <ImageIcon size={20} className="text-slate-400"/>
                    </div>
                  )}
                  <div className="flex-1">
                    <label className="btn-secondary cursor-pointer text-xs px-3 py-2 inline-flex items-center gap-1.5">
                      <ImageIcon size={13}/> Upload Image
                      <input type="file" accept="image/*" className="hidden" onChange={handleLogoFile}/>
                    </label>
                    <p className="text-[11px] text-slate-400 mt-1">PNG, JPG up to 500 KB</p>
                  </div>
                  {orgForm.logoUrl && (
                    <button onClick={() => setOrgForm((p) => ({ ...p, logoUrl: '' }))} className="text-xs text-red-500 hover:underline flex-shrink-0">Remove</button>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Organization Name</label>
                <input value={orgForm.organizationName} onChange={(e) => setOrgForm((p) => ({ ...p, organizationName: e.target.value }))} className="input-field"/>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Industry</label>
                <select value={orgForm.industry} onChange={(e) => setOrgForm((p) => ({ ...p, industry: e.target.value }))} className="input-field">
                  <option value="">Select industry</option>
                  {INDUSTRIES.map((i) => <option key={i}>{i}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Website</label>
                <div className="relative">
                  <GlobeIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"/>
                  <input type="url" value={orgForm.website} onChange={(e) => setOrgForm((p) => ({ ...p, website: e.target.value }))}
                    className="input-field pl-9" placeholder="https://yourcompany.com"/>
                </div>
              </div>

              <div className="flex gap-3 pt-1">
                <button onClick={() => { setEditing(false); setError(''); }} className="btn-secondary flex-1">Cancel</button>
                <button onClick={saveOrg} disabled={saving} className="btn-primary flex-1 justify-center"
                  style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
                  {saving ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"/> : 'Save Changes'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}

/* ── Navbar ─────────────────────────────────────────────────────── */
export default function Navbar({ title }) {
  const { user, updateUser } = useAuth();
  const { setOpen } = useSidebar();
  const [showProfile, setShowProfile] = useState(false);
  const [showCompany, setShowCompany] = useState(false);
  const initials = user?.name?.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);

  return (
    <>
      <header className="bg-white border-b border-slate-100 px-4 sm:px-6 py-0 h-14 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setOpen(true)}
            className="md:hidden p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-all"
          >
            <MenuIcon size={20} />
          </button>
          <h1 className="text-base font-semibold text-slate-900">{title}</h1>
        </div>

        <div className="flex items-center gap-2">
          {/* Desktop: full company button */}
          <button
            onClick={() => setShowCompany(true)}
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-primary-300 hover:bg-primary-50 transition-all duration-150 group"
          >
            <BuildingIcon size={14} className="text-slate-400 group-hover:text-primary-500 transition-colors" />
            <span className="text-xs font-medium text-slate-600 group-hover:text-primary-600 transition-colors max-w-[120px] truncate">
              {user?.organizationName}
            </span>
          </button>
          {/* Mobile: icon-only company button */}
          <button
            onClick={() => setShowCompany(true)}
            className="sm:hidden p-1.5 rounded-lg text-slate-500 hover:text-primary-600 hover:bg-primary-50 transition-all"
            title={user?.organizationName}
          >
            <BuildingIcon size={18} />
          </button>
          <div className="w-px h-6 bg-slate-200 hidden sm:block" />
          <button
            onClick={() => setShowProfile(true)}
            className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-slate-50 transition-all duration-150 group"
          >
            <div className="text-right hidden sm:block">
              <p className="text-xs font-semibold text-slate-700 leading-tight">{user?.name}</p>
              <p className="text-[10px] text-slate-400 leading-tight">{user?.role}</p>
            </div>
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt="avatar" className="w-7 h-7 rounded-full object-cover flex-shrink-0 ring-2 ring-white ring-offset-1 ring-offset-slate-100"/>
            ) : (
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 ring-2 ring-white ring-offset-1 ring-offset-slate-100"
                   style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
                {initials}
              </div>
            )}
          </button>
        </div>
      </header>

      {showProfile && (
        <ProfileModal user={user} onClose={() => setShowProfile(false)} onUpdate={(data) => updateUser(data)} />
      )}
      {showCompany && <CompanyModal user={user} onClose={() => setShowCompany(false)} onOrgUpdate={(data) => updateUser(data)} />}
    </>
  );
}
