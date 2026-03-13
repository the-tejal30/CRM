import { useState } from 'react';
import API from '../api/axios';
import { useToast } from '../context/ToastContext';
import CheckIcon from '../icons/CheckIcon';
import TasksIcon from '../icons/TasksIcon';
import TrashIcon from '../icons/TrashIcon';
import CalendarIcon from '../icons/CalendarIcon';
import UserIcon from '../icons/UserIcon';
import LeadsIcon from '../icons/LeadsIcon';

const priorityStyle = {
  Low:    { color: '#94a3b8', label: 'Low' },
  Medium: { color: '#f59e0b', label: 'Medium' },
  High:   { color: '#f43f5e', label: 'High' },
};

export default function TasksList({ tasks, onUpdate, onDelete }) {
  const toast = useToast();
  const [toggling, setToggling] = useState(null);

  const toggleStatus = async (task) => {
    setToggling(task._id);
    try {
      const newStatus = task.status === 'Pending' ? 'Completed' : 'Pending';
      const { data } = await API.put(`/tasks/${task._id}`, { status: newStatus });
      onUpdate(data);
      toast.success(newStatus === 'Completed' ? 'Task completed' : 'Task reopened');
    } catch {
      toast.error('Failed to update task');
    } finally {
      setToggling(null);
    }
  };

  if (!tasks || tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-400">
        <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center"><TasksIcon size={24} className="text-slate-300"/></div>
        <p className="font-semibold text-slate-600">No tasks yet</p>
        <p className="text-sm">Create a follow-up task to stay on track</p>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-slate-50">
      {tasks.map((task) => {
        const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'Completed';
        const { color: priorityColor } = priorityStyle[task.priority] || priorityStyle.Medium;
        const done = task.status === 'Completed';

        return (
          <li key={task._id} className="flex items-start gap-4 py-4 group hover:bg-slate-50/50 px-1 rounded-lg transition-colors">
            {/* Checkbox */}
            <button
              onClick={() => toggleStatus(task)}
              disabled={toggling === task._id}
              className={`mt-0.5 w-5 h-5 rounded-md border-2 flex-shrink-0 flex items-center justify-center transition-all duration-200 ${
                done
                  ? 'bg-emerald-500 border-emerald-500 text-white'
                  : 'border-slate-300 hover:border-primary-400 hover:bg-primary-50'
              }`}
            >
              {done && <CheckIcon size={11} />}
              {toggling === task._id && <div className="w-2.5 h-2.5 border border-current border-t-transparent rounded-full animate-spin" />}
            </button>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className={`text-sm font-semibold ${done ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                  {task.title}
                </p>
                {/* Priority dot */}
                <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: priorityColor }} title={`${task.priority} priority`} />
              </div>
              {task.description && (
                <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{task.description}</p>
              )}
              <div className="flex flex-wrap gap-3 mt-2">
                {task.assignedTo?.name && (
                  <span className="flex items-center gap-1 text-[11px] text-slate-400">
                    <UserIcon size={11} className="text-slate-300" />
                    {task.assignedTo.name}
                  </span>
                )}
                {task.leadId?.name && (
                  <span className="flex items-center gap-1 text-[11px] text-slate-400">
                    <LeadsIcon size={11} className="text-slate-300" />
                    {task.leadId.name}
                  </span>
                )}
                {task.dueDate && (
                  <span className={`flex items-center gap-1 text-[11px] font-medium ${isOverdue ? 'text-red-500' : 'text-slate-400'}`}>
                    <CalendarIcon size={11} />
                    {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    {isOverdue && <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full">overdue</span>}
                  </span>
                )}
              </div>
            </div>

            {/* Delete */}
            <button
              onClick={() => onDelete(task._id)}
              className="p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100 flex-shrink-0"
            >
              <TrashIcon size={14} />
            </button>
          </li>
        );
      })}
    </ul>
  );
}
