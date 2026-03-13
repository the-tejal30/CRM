import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSidebar } from '../context/SidebarContext';
import DashboardIcon from '../icons/DashboardIcon';
import LeadsIcon from '../icons/LeadsIcon';
import TasksIcon from '../icons/TasksIcon';
import TeamIcon from '../icons/TeamIcon';
import LogoutIcon from '../icons/LogoutIcon';
import CloseIcon from '../icons/CloseIcon';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', Icon: DashboardIcon },
  { to: '/leads',     label: 'Leads',     Icon: LeadsIcon },
  { to: '/tasks',     label: 'Tasks',     Icon: TasksIcon },
  { to: '/users',     label: 'Team',      Icon: TeamIcon },
];

const SB = { bg: '#0d1117', hover: '#161b22', active: '#1c2333', border: '#21262d', muted: '#8b949e', dim: '#484f58' };

export default function Sidebar() {
  const { user, logout } = useAuth();
  const { open, setOpen } = useSidebar();
  const navigate = useNavigate();
  const handleLogout = () => { logout(); navigate('/login'); };
  const initials = user?.name?.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/60 z-30 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={`fixed left-0 top-0 h-full w-60 flex flex-col z-40 transition-transform duration-200
          ${open ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}
        style={{ backgroundColor: SB.bg }}
      >
        {/* Logo + mobile close */}
        <div className="px-5 py-5 flex items-center justify-between" style={{ borderBottom: `1px solid ${SB.border}` }}>
          <div className="flex items-center gap-3 min-w-0">
            {/* Logo area: CRM icon + org logo/initial half-overlapping */}
            <div className="relative flex-shrink-0" style={{ width: '42px', height: '30px' }}>
              <img src="/logo-icon.png" alt="SalesPilot" className="w-[30px] h-[30px] rounded-full object-cover absolute left-0 top-0" style={{ zIndex: 1 }} />
              {user?.orgLogoUrl ? (
                <img
                  src={user.orgLogoUrl}
                  alt="org"
                  className="w-[30px] h-[30px] rounded-full object-cover absolute top-0"
                  style={{ left: '18px', zIndex: 2, boxShadow: `0 0 0 2.5px #0d1117` }}
                />
              ) : (
                <div
                  className="w-[30px] h-[30px] rounded-full flex items-center justify-center text-[11px] font-bold text-white absolute top-0"
                  style={{ left: '18px', zIndex: 2, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', boxShadow: `0 0 0 2.5px #0d1117` }}
                >
                  {user?.organizationName?.[0]?.toUpperCase() ?? '?'}
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-white text-sm leading-tight">SalesPilot</p>
              <p className="text-[11px] truncate" style={{ color: SB.muted }}>
                {user?.organizationName}
              </p>
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="md:hidden p-1 rounded-lg transition-colors flex-shrink-0"
            style={{ color: SB.dim }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#f0f6fc')}
            onMouseLeave={(e) => (e.currentTarget.style.color = SB.dim)}
          >
            <CloseIcon size={16} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest" style={{ color: SB.dim }}>
            Menu
          </p>
          {navItems.map(({ to, label, Icon }) => (
            <NavLink key={to} to={to} end={to === '/dashboard'} onClick={() => setOpen(false)}>
              {({ isActive }) => (
                <div
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 cursor-pointer"
                  style={{
                    backgroundColor: isActive ? SB.active : 'transparent',
                    color: isActive ? '#f0f6fc' : SB.muted,
                  }}
                  onMouseEnter={(e) => { if (!isActive) { e.currentTarget.style.backgroundColor = SB.hover; e.currentTarget.style.color = '#f0f6fc'; } }}
                  onMouseLeave={(e) => { if (!isActive) { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = SB.muted; } }}
                >
                  <Icon size={16} style={{ color: isActive ? '#818cf8' : 'inherit', flexShrink: 0 }} />
                  <span className="flex-1">{label}</span>
                  {isActive && <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#6366f1' }} />}
                </div>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User */}
        <div className="px-3 py-4" style={{ borderTop: `1px solid ${SB.border}` }}>
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg" style={{ backgroundColor: SB.hover }}>
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt="avatar" className="w-7 h-7 rounded-full object-cover flex-shrink-0"/>
            ) : (
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                   style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
                {initials}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-[12px] font-semibold text-white truncate leading-tight">{user?.name}</p>
              <p className="text-[10px] truncate" style={{ color: SB.muted }}>{user?.role}</p>
            </div>
            <button
              onClick={handleLogout}
              title="Sign out"
              className="flex-shrink-0 transition-colors p-0.5 rounded"
              style={{ color: SB.dim }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#f85149')}
              onMouseLeave={(e) => (e.currentTarget.style.color = SB.dim)}
            >
              <LogoutIcon size={14} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
