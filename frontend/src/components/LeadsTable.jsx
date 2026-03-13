import { useNavigate } from 'react-router-dom';
import EditIcon from '../icons/EditIcon';
import TrashIcon from '../icons/TrashIcon';
import LeadsIcon from '../icons/LeadsIcon';
import WhatsAppIcon from '../icons/WhatsAppIcon';

const statusClass = {
  New:       'status-new',
  Contacted: 'status-contacted',
  Qualified: 'status-qualified',
  Won:       'status-won',
  Lost:      'status-lost',
};

export default function LeadsTable({ leads, onDelete, isAdmin }) {
  const navigate = useNavigate();

  if (!leads || leads.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
        <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center"><LeadsIcon size={24} className="text-slate-300"/></div>
        <p className="font-semibold text-slate-600">No leads found</p>
        <p className="text-sm">Create your first lead to get started</p>
      </div>
    );
  }

  return (
    <>
      {/* Mobile card view */}
      <div className="sm:hidden divide-y divide-slate-50">
        {leads.map((lead) => (
          <div key={lead._id} className="p-4 hover:bg-slate-50/60 transition-colors">
            <div className="flex items-start justify-between gap-2 mb-2">
              <button
                onClick={() => navigate(`/leads/${lead._id}`)}
                className="font-semibold text-sm text-primary-600 hover:underline underline-offset-2 text-left leading-snug"
              >
                {lead.name}
              </button>
              <span className={`${statusClass[lead.status]} flex-shrink-0`}>{lead.status}</span>
            </div>
            {lead.company && <p className="text-xs text-slate-500 mb-0.5">{lead.company}</p>}
            {lead.email && <p className="text-xs text-slate-400 truncate">{lead.email}</p>}
            <div className="flex items-center justify-between mt-2.5">
              <span className="text-sm font-semibold text-slate-800">
                {lead.dealValue ? `$${lead.dealValue.toLocaleString()}` : <span className="text-slate-300 font-normal">—</span>}
              </span>
              <div className="flex items-center gap-0.5">
                {lead.phone && (
                  <a
                    href={`https://wa.me/${lead.phone.replace(/\D/g, '')}`}
                    target="_blank" rel="noreferrer"
                    className="p-1.5 rounded-lg text-[#25d366] hover:bg-green-50 transition-colors"
                    title="WhatsApp"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <WhatsAppIcon size={14}/>
                  </a>
                )}
                <button
                  onClick={() => navigate(`/leads/${lead._id}`)}
                  className="p-1.5 rounded-lg text-slate-400 hover:bg-primary-50 hover:text-primary-600 transition-colors"
                  title="View / Edit"
                >
                  <EditIcon size={14}/>
                </button>
                {isAdmin && (
                  <button
                    onClick={() => onDelete(lead._id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                    title="Delete"
                  >
                    <TrashIcon size={14}/>
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop table view */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-slate-100">
              {['Name', 'Company', 'Email', 'Status', 'Deal Value', 'Assigned To', ''].map((h) => (
                <th key={h} className="px-6 py-3 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {leads.map((lead) => (
              <tr key={lead._id} className="hover:bg-slate-50/60 transition-colors group">
                <td className="px-6 py-3.5">
                  <button
                    onClick={() => navigate(`/leads/${lead._id}`)}
                    className="font-semibold text-sm text-primary-600 hover:text-primary-700 hover:underline underline-offset-2 whitespace-nowrap"
                  >
                    {lead.name}
                  </button>
                </td>
                <td className="px-6 py-3.5 text-sm text-slate-600 whitespace-nowrap">{lead.company || <span className="text-slate-300">—</span>}</td>
                <td className="px-6 py-3.5 text-sm text-slate-500 max-w-[160px] truncate">{lead.email || <span className="text-slate-300">—</span>}</td>
                <td className="px-6 py-3.5">
                  <span className={statusClass[lead.status]}>{lead.status}</span>
                </td>
                <td className="px-6 py-3.5 whitespace-nowrap">
                  <span className="text-sm font-semibold text-slate-800">
                    {lead.dealValue ? `$${lead.dealValue.toLocaleString()}` : <span className="text-slate-300 font-normal">—</span>}
                  </span>
                </td>
                <td className="px-6 py-3.5">
                  {lead.assignedTo ? (
                    <div className="flex items-center gap-2 whitespace-nowrap">
                      {lead.assignedTo.avatarUrl ? (
                        <img src={lead.assignedTo.avatarUrl} alt="avatar" className="w-5 h-5 rounded-full object-cover flex-shrink-0"/>
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-primary-100 flex items-center justify-center text-[10px] font-bold text-primary-600 flex-shrink-0">
                          {lead.assignedTo.name?.charAt(0)}
                        </div>
                      )}
                      <span className="text-sm text-slate-600">{lead.assignedTo.name}</span>
                    </div>
                  ) : (
                    <span className="text-slate-300 text-sm">—</span>
                  )}
                </td>
                <td className="px-6 py-3.5">
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {lead.phone && (
                      <a
                        href={`https://wa.me/${lead.phone.replace(/\D/g, '')}`}
                        target="_blank" rel="noreferrer"
                        className="p-1.5 rounded-lg text-[#25d366] hover:bg-green-50 transition-colors"
                        title="WhatsApp"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <WhatsAppIcon size={14}/>
                      </a>
                    )}
                    <button
                      onClick={() => navigate(`/leads/${lead._id}`)}
                      className="p-1.5 rounded-lg hover:bg-primary-50 text-slate-400 hover:text-primary-600 transition-colors"
                      title="View"
                    >
                      <EditIcon size={14} />
                    </button>
                    {isAdmin && (
                      <button
                        onClick={() => onDelete(lead._id)}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
                        title="Delete"
                      >
                        <TrashIcon size={14} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
