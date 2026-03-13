import LeadsIcon from '../icons/LeadsIcon';
import TrophyIcon from '../icons/TrophyIcon';
import DollarIcon from '../icons/DollarIcon';
import TrendUpIcon from '../icons/TrendUpIcon';

const cards = [
  {
    key: 'totalLeads',
    label: 'Total Leads',
    Icon: LeadsIcon,
    gradient: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
    bg: '#eef2ff',
    iconColor: '#6366f1',
    format: (v) => v?.toLocaleString() ?? 0,
  },
  {
    key: 'wonLeads',
    label: 'Deals Won',
    Icon: TrophyIcon,
    gradient: 'linear-gradient(135deg,#10b981,#059669)',
    bg: '#ecfdf5',
    iconColor: '#10b981',
    format: (v) => v?.toLocaleString() ?? 0,
  },
  {
    key: 'totalRevenue',
    label: 'Total Revenue',
    Icon: DollarIcon,
    gradient: 'linear-gradient(135deg,#f59e0b,#d97706)',
    bg: '#fffbeb',
    iconColor: '#f59e0b',
    format: (v) => `$${(v || 0).toLocaleString()}`,
  },
  {
    key: 'winRate',
    label: 'Win Rate',
    Icon: TrendUpIcon,
    gradient: 'linear-gradient(135deg,#0ea5e9,#0284c7)',
    bg: '#f0f9ff',
    iconColor: '#0ea5e9',
    format: (v) => `${v ?? 0}%`,
  },
];

export default function DashboardCards({ analytics }) {
  if (!analytics) return null;

  const winRate = analytics.totalLeads > 0
    ? Math.round((analytics.wonLeads / analytics.totalLeads) * 100)
    : 0;

  const data = { ...analytics, winRate };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {cards.map(({ key, label, Icon, gradient, bg, iconColor, format }) => (
        <div key={key} className="bg-white rounded-xl border border-slate-100 shadow-card p-5 hover:shadow-card-hover transition-shadow duration-200">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">{label}</p>
              <p className="text-2xl font-bold text-slate-900 mt-1.5">{format(data[key])}</p>
            </div>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: bg }}>
              <Icon size={18} style={{ color: iconColor }} />
            </div>
          </div>
          {/* Progress bar accent */}
          <div className="h-1 rounded-full bg-slate-100 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                background: gradient,
                width: key === 'winRate'
                  ? `${data.winRate}%`
                  : key === 'wonLeads' && data.totalLeads
                    ? `${Math.round((data.wonLeads / data.totalLeads) * 100)}%`
                    : '60%',
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
