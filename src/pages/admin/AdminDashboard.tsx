import { useState } from 'react';
import { CheckCircle2, XCircle, Clock, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  useAdminTeachers,
  useApproveTeacher,
  useRejectTeacher,
  AdminTeacher,
} from '../../hooks/useAdmin';

type Tab = 'PENDING' | 'APPROVED' | 'REJECTED';

function TeacherCard({
  teacher,
  onApprove,
  onReject,
}: {
  teacher: AdminTeacher;
  onApprove?: () => void;
  onReject?: () => void;
}) {
  const { t } = useTranslation();
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-violet-500 rounded-xl flex items-center justify-center shrink-0">
            <span className="text-white font-bold text-lg">{teacher.user.name[0]}</span>
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-gray-900">{teacher.user.name}</p>
            <p className="text-sm text-gray-500 flex items-center gap-1">
              <Globe className="w-3.5 h-3.5" /> {teacher.country}
              <span className="mx-1">·</span>
              ${teacher.hourlyRate}/hr
            </p>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {teacher.tags.map((t) => (
                <span key={t.tag} className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs font-medium rounded-md">
                  {t.tag}
                </span>
              ))}
            </div>
            <p className="text-sm text-gray-600 mt-3 line-clamp-2">{teacher.intro}</p>
            <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {t('admin.submitted', { date: new Date(teacher.submittedAt).toLocaleDateString() })}
            </p>
          </div>
        </div>

        {onApprove && onReject && (
          <div className="flex flex-col gap-2 shrink-0">
            <button
              onClick={onApprove}
              className="flex items-center gap-1 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-xl transition-colors whitespace-nowrap"
            >
              <CheckCircle2 className="w-3.5 h-3.5" /> {t('admin.accept')}
            </button>
            {showConfirm ? (
              <div className="flex gap-1">
                <button
                  onClick={() => { onReject(); setShowConfirm(false); }}
                  className="flex-1 px-2 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-xl transition-colors"
                >
                  {t('admin.confirm')}
                </button>
                <button
                  onClick={() => setShowConfirm(false)}
                  className="flex-1 px-2 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-semibold rounded-xl transition-colors"
                >
                  {t('admin.cancel')}
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowConfirm(true)}
                className="flex items-center gap-1 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold rounded-xl transition-colors whitespace-nowrap"
              >
                <XCircle className="w-3.5 h-3.5" /> {t('admin.reject')}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<Tab>('PENDING');
  const { data: teachers = [], isLoading } = useAdminTeachers(activeTab);
  const approveMut = useApproveTeacher();
  const rejectMut = useRejectTeacher();

  const TABS: { key: Tab; label: string }[] = [
    { key: 'PENDING', label: t('admin.tabPending') },
    { key: 'APPROVED', label: t('admin.tabApproved') },
    { key: 'REJECTED', label: t('admin.tabRejected') },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{t('admin.title')}</h1>
          <p className="text-gray-500 mt-1 text-sm">{t('admin.subtitle')}</p>
        </div>

        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-8 w-fit">
          {TABS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-gray-500">Loading...</div>
        ) : teachers.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
            <p className="text-gray-500 text-sm">{t('admin.noApplications', { status: activeTab.toLowerCase() })}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {teachers.map((tch) => (
              <div key={tch.userId}>
              <TeacherCard
                teacher={tch}
                onApprove={activeTab === 'PENDING' ? () => approveMut.mutate(tch.userId) : undefined}
                onReject={activeTab === 'PENDING' ? () => rejectMut.mutate(tch.userId) : undefined}
              />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
