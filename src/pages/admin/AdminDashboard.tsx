import React, { useState } from 'react';
import { CheckCircle2, XCircle, Users, Clock, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useTeachersStore } from '../../store/useTeachersStore';
import { TeacherListing } from '../../types';

type Tab = 'pending' | 'approved' | 'rejected';

function TeacherCard({ teacher, onApprove, onReject }: {
  teacher: TeacherListing;
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
            <span className="text-white font-bold text-lg">{teacher.name[0]}</span>
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-gray-900">{teacher.name}</p>
            <p className="text-sm text-gray-500 flex items-center gap-1">
              <Globe className="w-3.5 h-3.5" /> {teacher.country}
              <span className="mx-1">·</span>
              ${teacher.price}/hr
            </p>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {teacher.tags.map((tag) => (
                <span key={tag} className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs font-medium rounded-md">
                  {tag}
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
  const [activeTab, setActiveTab] = useState<Tab>('pending');
  const { teachers, approveTeacher, rejectTeacher } = useTeachersStore();

  const pending = teachers.filter((t) => t.status === 'pending');
  const approved = teachers.filter((t) => t.status === 'approved');
  const rejected = teachers.filter((t) => t.status === 'rejected');

  const tabTeachers: Record<Tab, TeacherListing[]> = { pending, approved, rejected };
  const current = tabTeachers[activeTab];

  const TABS: { key: Tab; label: string; count: number; color: string }[] = [
    { key: 'pending', label: t('admin.tabPending'), count: pending.length, color: 'text-amber-600' },
    { key: 'approved', label: t('admin.tabApproved'), count: approved.length, color: 'text-emerald-600' },
    { key: 'rejected', label: t('admin.tabRejected'), count: rejected.length, color: 'text-red-500' },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{t('admin.title')}</h1>
          <p className="text-gray-500 mt-1 text-sm">{t('admin.subtitle')}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-5 mb-8">
          {[
            { label: t('admin.pendingReview'), value: pending.length, bg: 'bg-amber-50', icon: <Clock className="w-5 h-5 text-amber-500" /> },
            { label: t('admin.approved'), value: approved.length, bg: 'bg-emerald-50', icon: <CheckCircle2 className="w-5 h-5 text-emerald-600" /> },
            { label: t('admin.total'), value: teachers.length, bg: 'bg-blue-50', icon: <Users className="w-5 h-5 text-blue-600" /> },
          ].map(({ label, value, bg, icon }) => (
            <div key={label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center mb-4`}>{icon}</div>
              <div className="text-2xl font-bold text-gray-900 mb-1">{value}</div>
              <div className="text-xs text-gray-500 font-medium">{label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6 w-fit">
          {TABS.map(({ key, label, count, color }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === key
                  ? 'bg-white shadow-sm text-gray-900'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {label}{' '}
              <span className={`ml-1 ${activeTab === key ? color : 'text-gray-400'}`}>({count})</span>
            </button>
          ))}
        </div>

        {/* Teacher List */}
        {current.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
            <p className="text-gray-500 text-sm">{t('admin.noApplications', { status: activeTab })}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {current.map((teacher) => (
              <React.Fragment key={teacher.id}>
                <TeacherCard
                  teacher={teacher}
                  onApprove={activeTab === 'pending' ? () => approveTeacher(teacher.id) : undefined}
                  onReject={activeTab === 'pending' ? () => rejectTeacher(teacher.id) : undefined}
                />
              </React.Fragment>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
