import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import LeadForm from '../components/LeadForm';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import API from '../api/axios';
import ArrowLeftIcon from '../icons/ArrowLeftIcon';
import EditIcon from '../icons/EditIcon';
import AIIcon from '../icons/AIIcon';
import MailIcon from '../icons/MailIcon';
import PhoneIcon from '../icons/PhoneIcon';
import BuildingIcon from '../icons/BuildingIcon';
import TagIcon from '../icons/TagIcon';
import DollarIcon from '../icons/DollarIcon';
import UserIcon from '../icons/UserIcon';
import CalendarIcon from '../icons/CalendarIcon';
import CloseIcon from '../icons/CloseIcon';
import TrashIcon from '../icons/TrashIcon';
import WhatsAppIcon from '../icons/WhatsAppIcon';

const statusClass = {
  New: 'status-new', Contacted: 'status-contacted',
  Qualified: 'status-qualified', Won: 'status-won', Lost: 'status-lost',
};

export default function LeadDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();
  const [lead, setLead] = useState(null);
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [insight, setInsight] = useState(null);
  const [insightLoading, setInsightLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([API.get(`/leads/${id}`), API.get(`/notes/lead/${id}`)])
      .then(([leadRes, notesRes]) => { setLead(leadRes.data); setNotes(notesRes.data); })
      .catch(() => { toast.error('Lead not found'); navigate('/leads'); })
      .finally(() => setLoading(false));
  }, [id]);

  const addNote = async (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    try {
      const { data } = await API.post('/notes', { leadId: id, content: newNote });
      setNotes((prev) => [data, ...prev]);
      setNewNote('');
      toast.success('Note added');
    } catch {
      toast.error('Failed to add note');
    }
  };

  const deleteNote = async (noteId) => {
    try {
      await API.delete(`/notes/${noteId}`);
      setNotes((prev) => prev.filter((n) => n._id !== noteId));
      toast.success('Note deleted');
    } catch {
      toast.error('Failed to delete note');
    }
  };

  const fetchInsight = async () => {
    setInsightLoading(true);
    try {
      const allNotes = notes.map((n) => n.content).join(' ');
      const { data } = await API.post('/leads/ai-insight', { leadId: id, notes: allNotes, dealValue: lead?.dealValue || 0 });
      setInsight(data);
      toast.success('AI insight generated');
    } catch {
      toast.error('Failed to generate AI insight');
    } finally {
      setInsightLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen overflow-hidden" style={{ backgroundColor: '#f8fafc' }}>
        <Sidebar />
        <div className="flex-1 md:ml-60 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  const scoreColor = insight
    ? insight.leadScore >= 70 ? '#10b981' : insight.leadScore >= 45 ? '#f59e0b' : '#f43f5e'
    : '#6366f1';

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: '#f8fafc' }}>
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden md:ml-60">
        <Navbar title="Lead Details" />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <button
            onClick={() => navigate('/leads')}
            className="flex items-center gap-2 text-sm text-slate-500 hover:text-primary-600 transition-colors mb-5 group"
          >
            <ArrowLeftIcon size={15} className="group-hover:-translate-x-0.5 transition-transform" />
            Back to Leads
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Left column */}
            <div className="lg:col-span-2 space-y-5">
              {/* Lead card */}
              {editing ? (
                <div className="bg-white rounded-xl border border-slate-100 shadow-card p-6">
                  <h2 className="text-base font-semibold text-slate-900 mb-5">Edit Lead</h2>
                  <LeadForm
                    lead={lead}
                    onSuccess={(updated) => { setLead(updated); setEditing(false); toast.success('Lead updated'); }}
                    onCancel={() => setEditing(false)}
                  />
                </div>
              ) : (
                <div className="bg-white rounded-xl border border-slate-100 shadow-card overflow-hidden">
                  <div className="h-1.5 w-full" style={{
                    background: lead?.status === 'Won' ? '#10b981' : lead?.status === 'Lost' ? '#f43f5e' : lead?.status === 'Qualified' ? '#8b5cf6' : lead?.status === 'Contacted' ? '#f59e0b' : '#3b82f6'
                  }} />
                  <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={statusClass[lead?.status]}>{lead?.status}</span>
                        {lead?.source && <span className="text-xs text-slate-400 font-medium">{lead.source}</span>}
                      </div>
                      <h2 className="text-xl font-bold text-slate-900">{lead?.name}</h2>
                      <p className="text-sm text-slate-400 mt-0.5">{lead?.company || 'No company'}</p>
                    </div>
                    <button onClick={() => setEditing(true)} className="btn-secondary px-3 py-1.5 text-xs gap-1.5 flex-shrink-0">
                      <EditIcon size={13} /> Edit
                    </button>
                  </div>

                  {/* Quick outreach */}
                  {(lead?.phone || lead?.email) && (
                    <div className="flex items-center flex-wrap gap-2 mb-5">
                      {lead.phone && (
                        <a
                          href={`https://wa.me/${lead.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Hi ${lead.name}, I'm reaching out regarding your enquiry.`)}`}
                          target="_blank" rel="noreferrer"
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                          style={{ background: '#dcfce7', color: '#15803d' }}
                        >
                          <WhatsAppIcon size={13}/> WhatsApp
                        </a>
                      )}
                      {lead.email && (
                        <a
                          href={`mailto:${lead.email}?subject=${encodeURIComponent(`Following up — ${lead.company || lead.name}`)}&body=${encodeURIComponent(`Hi ${lead.name},\n\n`)}`}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                          style={{ background: '#e0e7ff', color: '#4338ca' }}
                        >
                          <MailIcon size={13}/> Send Email
                        </a>
                      )}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { Icon: MailIcon, label: 'Email', value: lead?.email },
                      { Icon: PhoneIcon, label: 'Phone', value: lead?.phone },
                      { Icon: DollarIcon, label: 'Deal Value', value: lead?.dealValue ? `$${lead.dealValue.toLocaleString()}` : null, highlight: true },
                      { Icon: UserIcon, label: 'Assigned To', value: lead?.assignedTo?.name },
                      { Icon: TagIcon, label: 'Source', value: lead?.source },
                      { Icon: CalendarIcon, label: 'Created', value: new Date(lead?.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) },
                    ].map(({ Icon, label, value, highlight }) => (
                      <div key={label} className="flex items-start gap-3 p-3 rounded-lg bg-slate-50">
                        <Icon size={14} className="text-slate-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-[11px] text-slate-400 font-medium">{label}</p>
                          <p className={`text-sm font-semibold mt-0.5 ${highlight ? 'text-emerald-600 text-base' : 'text-slate-800'}`}>
                            {value || <span className="text-slate-300 font-normal">—</span>}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  </div>
                </div>
              )}

              {/* Notes */}
              <div className="bg-white rounded-xl border border-slate-100 shadow-card p-6">
                <h3 className="text-sm font-semibold text-slate-900 mb-4">Notes</h3>
                <form onSubmit={addNote} className="flex gap-2 mb-5">
                  <input
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Add a note about this lead…"
                    className="input-field flex-1"
                  />
                  <button type="submit" className="btn-primary px-4">Add</button>
                </form>
                {notes.length === 0 ? (
                  <p className="text-sm text-slate-400 text-center py-6">No notes yet. Add one above.</p>
                ) : (
                  <ul className="space-y-3">
                    {notes.map((note) => (
                      <li key={note._id} className="group flex items-start gap-3 p-4 rounded-xl bg-slate-50 hover:bg-slate-100/70 transition-colors">
                        {note.createdBy?.avatarUrl ? (
                          <img src={note.createdBy.avatarUrl} alt="avatar" className="w-6 h-6 rounded-full object-cover flex-shrink-0 mt-0.5"/>
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center text-[10px] font-bold text-primary-600 flex-shrink-0 mt-0.5">
                            {note.createdBy?.name?.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-slate-700 leading-relaxed">{note.content}</p>
                          <p className="text-[11px] text-slate-400 mt-1.5">
                            <span className="font-medium">{note.createdBy?.name}</span>
                            {' · '}
                            {new Date(note.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                        <button
                          onClick={() => deleteNote(note._id)}
                          className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all flex-shrink-0"
                        >
                          <TrashIcon size={13} />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* Right column — AI Insight */}
            <div>
              <div className="bg-white rounded-xl border border-slate-100 shadow-card p-6 sticky top-6">
                <div className="flex items-center gap-2 mb-1">
                  <AIIcon size={16} className="text-primary-500" />
                  <h3 className="text-sm font-semibold text-slate-900">AI Lead Insight</h3>
                </div>
                <p className="text-xs text-slate-400 mb-5">Powered by deal value + notes analysis</p>

                <button
                  onClick={fetchInsight}
                  disabled={insightLoading}
                  className="btn-primary w-full justify-center"
                  style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}
                >
                  {insightLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      Analyzing…
                    </>
                  ) : (
                    <><AIIcon size={15} /> Get AI Insight</>
                  )}
                </button>

                {insight && (
                  <div className="mt-5 space-y-4 animate-slide-up">
                    {/* Score ring */}
                    <div className="flex items-center justify-center">
                      <div className="relative w-24 h-24">
                        <svg className="w-24 h-24 -rotate-90" viewBox="0 0 96 96">
                          <circle cx="48" cy="48" r="40" fill="none" stroke="#f1f5f9" strokeWidth="8" />
                          <circle cx="48" cy="48" r="40" fill="none" stroke={scoreColor} strokeWidth="8"
                            strokeDasharray={`${2 * Math.PI * 40 * insight.leadScore / 100} 999`}
                            strokeLinecap="round" />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-2xl font-bold text-slate-900">{insight.leadScore}</span>
                          <span className="text-[10px] text-slate-400 font-medium">score</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl border" style={{ backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' }}>
                      <p className="text-[11px] font-semibold text-emerald-700 mb-1">Closing Probability</p>
                      <p className="text-xl font-bold text-emerald-600">{insight.probabilityOfClosing}</p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-primary-50 border border-primary-100">
                      <p className="text-[11px] font-semibold text-primary-700 mb-1">Next Action</p>
                      <p className="text-sm text-slate-700 leading-relaxed">{insight.suggestedNextAction}</p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-50">
                      <p className="text-[11px] font-semibold text-slate-500 mb-1">Analysis</p>
                      <p className="text-xs text-slate-600 leading-relaxed">{insight.analysis}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
