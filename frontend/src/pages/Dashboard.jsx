import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import DashboardCards from '../components/DashboardCards';
import AnalyticsCharts from '../components/AnalyticsCharts';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import LeadsIcon from '../icons/LeadsIcon';
import TasksIcon from '../icons/TasksIcon';

const statusClass = {
  New: 'status-new', Contacted: 'status-contacted',
  Qualified: 'status-qualified', Won: 'status-won', Lost: 'status-lost',
};

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role !== 'Admin') { setLoading(false); return; }
    API.get('/leads/analytics')
      .then(({ data }) => setAnalytics(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: '#f8fafc' }}>
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden md:ml-60">
        <Navbar title="Dashboard" />
        <main className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : user?.role === 'Admin' ? (
            <div className="space-y-5">
              <DashboardCards analytics={analytics} />
              <AnalyticsCharts analytics={analytics} />

              {/* Recent Leads */}
              <div className="bg-white rounded-xl border border-slate-100 shadow-card">
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                  <h3 className="text-sm font-semibold text-slate-900">Recent Leads</h3>
                  <button onClick={() => navigate('/leads')} className="text-xs font-medium text-primary-600 hover:text-primary-700">
                    View all →
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b border-slate-50">
                        {['Name', 'Company', 'Status', 'Deal Value', 'Assigned To'].map((h) => (
                          <th key={h} className="px-6 py-3 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wide">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {(analytics?.recentLeads || []).map((lead) => (
                        <tr key={lead._id} className="hover:bg-slate-50/60 cursor-pointer transition-colors" onClick={() => navigate(`/leads/${lead._id}`)}>
                          <td className="px-6 py-3.5 text-sm font-semibold text-primary-600">{lead.name}</td>
                          <td className="px-6 py-3.5 text-sm text-slate-500">{lead.company || '—'}</td>
                          <td className="px-6 py-3.5"><span className={statusClass[lead.status]}>{lead.status}</span></td>
                          <td className="px-6 py-3.5 text-sm font-semibold text-slate-800">
                            {lead.dealValue ? `$${lead.dealValue.toLocaleString()}` : '—'}
                          </td>
                          <td className="px-6 py-3.5 text-sm text-slate-500">{lead.assignedTo?.name || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {!analytics?.recentLeads?.length && (
                    <p className="text-center py-10 text-slate-400 text-sm">No leads yet — create your first lead</p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            // Employee view
            <div className="space-y-5">
              <div className="bg-white rounded-xl border border-slate-100 shadow-card p-6">
                <div className="flex items-center gap-4">
                  {user?.avatarUrl ? (
                    <img src={user.avatarUrl} alt="avatar" className="w-12 h-12 rounded-xl object-cover flex-shrink-0"/>
                  ) : (
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold text-white flex-shrink-0"
                         style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
                      {user?.name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">Welcome back, {user?.name?.split(' ')[0]}!</h2>
                    <p className="text-sm text-slate-400 mt-0.5">
                      {user?.role} at <span className="text-slate-600 font-medium">{user?.organizationName}</span>
                    </p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={() => navigate('/leads')}
                  className="bg-white rounded-xl border border-slate-100 shadow-card p-6 text-left hover:shadow-card-hover hover:border-primary-200 transition-all group"
                >
                  <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center mb-4 group-hover:bg-primary-100 transition-colors">
                    <LeadsIcon size={18} className="text-primary-600" />
                  </div>
                  <p className="font-semibold text-slate-900">My Leads</p>
                  <p className="text-sm text-slate-400 mt-1">View and manage your assigned leads</p>
                </button>
                <button
                  onClick={() => navigate('/tasks')}
                  className="bg-white rounded-xl border border-slate-100 shadow-card p-6 text-left hover:shadow-card-hover hover:border-emerald-200 transition-all group"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center mb-4 group-hover:bg-emerald-100 transition-colors">
                    <TasksIcon size={18} className="text-emerald-600" />
                  </div>
                  <p className="font-semibold text-slate-900">My Tasks</p>
                  <p className="text-sm text-slate-400 mt-1">Track your follow-up tasks</p>
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
