import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';

const STATUS_COLORS = {
  New: '#6366f1',
  Contacted: '#f59e0b',
  Qualified: '#8b5cf6',
  Won: '#10b981',
  Lost: '#f43f5e',
};

const fmt = (v) => v >= 1000 ? `$${(v / 1000).toFixed(0)}k` : `$${v}`;

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900 text-white rounded-xl px-4 py-3 shadow-lg text-sm">
      <p className="font-medium mb-1 text-slate-300 text-xs">{label}</p>
      <p className="font-bold">{`$${payload[0].value.toLocaleString()}`}</p>
    </div>
  );
};

export default function AnalyticsCharts({ analytics }) {
  if (!analytics) return null;

  const pieData = (analytics.statusBreakdown || []).map((item) => ({
    name: item._id,
    value: item.count,
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      {/* Revenue Chart */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-card p-6 lg:col-span-2">
        <div className="mb-5">
          <h3 className="text-sm font-semibold text-slate-900">Revenue Overview</h3>
          <p className="text-xs text-slate-400 mt-0.5">Won deal revenue across months</p>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={analytics.revenueChart || []} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis tickFormatter={fmt} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2.5}
              fill="url(#revGrad)" dot={false}
              activeDot={{ r: 5, fill: '#6366f1', strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Pipeline Pie */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-card p-6">
        <div className="mb-5">
          <h3 className="text-sm font-semibold text-slate-900">Lead Pipeline</h3>
          <p className="text-xs text-slate-400 mt-0.5">Status breakdown</p>
        </div>
        {pieData.length > 0 ? (
          <>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={48} outerRadius={72} paddingAngle={3} dataKey="value" strokeWidth={0}>
                  {pieData.map((entry) => (
                    <Cell key={entry.name} fill={STATUS_COLORS[entry.name] || '#94a3b8'} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.2)', fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 mt-4">
              {pieData.map((entry) => (
                <div key={entry.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: STATUS_COLORS[entry.name] || '#94a3b8' }} />
                    <span className="text-slate-500">{entry.name}</span>
                  </div>
                  <span className="font-semibold text-slate-800">{entry.value}</span>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-48 text-slate-400 gap-2">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-xl">📊</div>
            <p className="text-sm">No data yet</p>
            <p className="text-xs">Mark leads as Won to see data</p>
          </div>
        )}
      </div>
    </div>
  );
}
