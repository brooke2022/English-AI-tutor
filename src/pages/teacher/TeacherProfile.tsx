import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, ExternalLink, Upload, Video, X, Link as LinkIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store/useAuthStore';
import { useTeachersStore } from '../../store/useTeachersStore';

const SPECIALTIES = ['IELTS', 'Business', 'Kids', 'Conversational', 'Beginners', 'Job Interview', 'Pronunciation', 'Advanced'];
const COUNTRIES = ['Philippines', 'Nepal', 'India', 'South Africa', 'United Kingdom', 'United States', 'Canada', 'Australia', 'Other'];

export default function TeacherProfile() {
  const { user, updateProfile, isLoading } = useAuthStore();
  const { t } = useTranslation();
  const teacherListing = useTeachersStore((s) => user ? s.getTeacherByUserId(user.id) : undefined);
  const updateTeacher = useTeachersStore((s) => s.updateTeacher);

  const [form, setForm] = useState({
    name: user?.name || '',
    country: teacherListing?.country || 'Philippines',
    timezone: teacherListing?.timezone || user?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
    intro: teacherListing?.intro || 'Hi! I am a certified TEFL teacher with years of experience.',
    tags: teacherListing?.tags || (['IELTS', 'Business'] as string[]),
    price: String(teacherListing?.price ?? '12'),
    trialPrice: String(teacherListing?.trialPrice ?? '2'),
    yearsExp: String(teacherListing?.yearsExp ?? ''),
    education: teacherListing?.education || '',
    whatsapp: teacherListing?.whatsapp || '',
  });
  const [saved, setSaved] = useState(false);

  // Video state
  const [videoUrl, setVideoUrl] = useState(teacherListing?.videoUrl || '');
  const [videoUrlInput, setVideoUrlInput] = useState('');
  const [videoMode, setVideoMode] = useState<'upload' | 'url'>('upload');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleTag = (tag: string) =>
    setForm((f) => ({
      ...f,
      tags: f.tags.includes(tag) ? f.tags.filter((t) => t !== tag) : [...f.tags, tag],
    }));

  const handleVideoFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const blobUrl = URL.createObjectURL(file);
    setVideoUrl(blobUrl);
  };

  const handleVideoUrlSave = () => {
    if (videoUrlInput.trim()) {
      setVideoUrl(videoUrlInput.trim());
      setVideoUrlInput('');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile({ name: form.name, timezone: form.timezone });
    if (teacherListing) {
      updateTeacher(teacherListing.id, {
        name: form.name,
        country: form.country,
        timezone: form.timezone,
        intro: form.intro,
        tags: form.tags,
        price: Number(form.price),
        trialPrice: Number(form.trialPrice),
        yearsExp: form.yearsExp ? Number(form.yearsExp) : undefined,
        education: form.education || undefined,
        whatsapp: form.whatsapp || undefined,
        videoUrl,
      });
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const isYouTube = videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be');

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{t('teacher.profile.title')}</h1>
          <Link
            to={teacherListing ? `/teachers/${teacherListing.id}` : '/teachers'}
            className="inline-flex items-center gap-1.5 text-sm text-blue-600 font-medium hover:text-blue-700 bg-blue-50 px-3 py-2 rounded-xl"
          >
            <ExternalLink className="w-4 h-4" /> {t('teacher.profile.previewProfile')}
          </Link>
        </div>

        <div className="space-y-6">
          {/* Avatar */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 flex items-center gap-6">
            <div className="w-20 h-20 bg-gradient-to-br from-violet-500 to-blue-500 rounded-2xl flex items-center justify-center shrink-0">
              <span className="text-3xl font-bold text-white">{user?.name?.[0]?.toUpperCase()}</span>
            </div>
            <div>
              <p className="font-bold text-gray-900 text-lg">{user?.name}</p>
              <p className="text-sm text-gray-500">{user?.email}</p>
              <span className="inline-block mt-2 px-2.5 py-1 bg-violet-50 text-violet-700 text-xs font-semibold rounded-full">
                {t('nav.roles.teacher')}
              </span>
            </div>
          </div>

          {/* Video Section */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
            <h2 className="text-lg font-bold text-gray-900 mb-1">{t('teacher.profile.introVideo')}</h2>
            <p className="text-sm text-gray-500 mb-5">{t('teacher.profile.introVideoSub')}</p>

            {/* Preview */}
            {videoUrl && (
              <div className="mb-5 relative rounded-xl overflow-hidden bg-gray-900 aspect-video">
                {isYouTube ? (
                  <iframe
                    src={videoUrl.replace('watch?v=', 'embed/')}
                    className="w-full h-full"
                    allowFullScreen
                    title="Intro video"
                  />
                ) : (
                  <video src={videoUrl} controls className="w-full h-full object-cover" />
                )}
                <button
                  type="button"
                  onClick={() => setVideoUrl('')}
                  className="absolute top-2 right-2 w-7 h-7 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Mode toggle */}
            <div className="flex gap-2 mb-4">
              <button
                type="button"
                onClick={() => setVideoMode('upload')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${videoMode === 'upload' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                <Upload className="w-4 h-4" /> {t('teacher.profile.uploadFile')}
              </button>
              <button
                type="button"
                onClick={() => setVideoMode('url')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${videoMode === 'url' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                <LinkIcon className="w-4 h-4" /> {t('teacher.profile.pasteUrl')}
              </button>
            </div>

            {videoMode === 'upload' ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-200 hover:border-blue-400 hover:bg-blue-50/30 rounded-xl p-8 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <Video className="w-8 h-8 text-gray-300" />
                <p className="text-sm font-medium text-gray-600">{t('teacher.profile.clickToSelect')}</p>
                <p className="text-xs text-gray-400">{t('teacher.profile.videoTypes')}</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/*"
                  className="hidden"
                  onChange={handleVideoFile}
                />
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="url"
                  value={videoUrlInput}
                  onChange={(e) => setVideoUrlInput(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="flex-1 px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm"
                />
                <button
                  type="button"
                  onClick={handleVideoUrlSave}
                  disabled={!videoUrlInput.trim()}
                  className="px-4 py-3 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-300 text-white rounded-xl text-sm font-semibold transition-colors"
                >
                  {t('teacher.profile.set')}
                </button>
              </div>
            )}
          </div>

          {/* Main form */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
            <h2 className="text-lg font-bold text-gray-900 mb-6">{t('teacher.profile.tutorInfo')}</h2>
            <form onSubmit={handleSave} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('teacher.profile.fullName')}</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('teacher.profile.email')}</label>
                <input
                  type="email"
                  value={user?.email}
                  disabled
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-100 text-gray-400 text-sm cursor-not-allowed"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('teacher.profile.country')}</label>
                  <select
                    value={form.country}
                    onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm"
                  >
                    {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('teacher.profile.timezone')}</label>
                  <input
                    type="text"
                    value={form.timezone}
                    onChange={(e) => setForm((f) => ({ ...f, timezone: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  {t('teacher.profile.whatsapp')} <span className="text-gray-400 font-normal text-xs">{t('auth.registerTeacher.whatsappOptional')}</span>
                </label>
                <input
                  type="text"
                  value={form.whatsapp}
                  onChange={(e) => setForm((f) => ({ ...f, whatsapp: e.target.value }))}
                  placeholder={t('teacher.profile.whatsappPlaceholder')}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm"
                />
                <p className="text-xs text-gray-400 mt-1">{t('teacher.profile.whatsappHint')}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('teacher.profile.yearsExp')}</label>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    placeholder={t('teacher.profile.yearsExpPlaceholder')}
                    value={form.yearsExp}
                    onChange={(e) => setForm((f) => ({ ...f, yearsExp: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('teacher.profile.education')}</label>
                  <input
                    type="text"
                    placeholder={t('teacher.profile.educationPlaceholder')}
                    value={form.education}
                    onChange={(e) => setForm((f) => ({ ...f, education: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('teacher.profile.specialties')}</label>
                <div className="flex flex-wrap gap-2">
                  {SPECIALTIES.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                        form.tags.includes(tag)
                          ? 'bg-violet-600 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('teacher.profile.hourlyRate')}</label>
                  <input
                    type="number"
                    min="1"
                    value={form.price}
                    onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('teacher.profile.trialPrice')}</label>
                  <input
                    type="number"
                    min="1"
                    value={form.trialPrice}
                    onChange={(e) => setForm((f) => ({ ...f, trialPrice: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  {t('teacher.profile.aboutMe')} <span className="text-gray-400 font-normal">{t('teacher.profile.aboutMeLimit')}</span>
                </label>
                <textarea
                  maxLength={400}
                  rows={4}
                  value={form.intro}
                  onChange={(e) => setForm((f) => ({ ...f, intro: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm resize-none"
                />
                <p className="text-xs text-gray-400 mt-1 text-right">{form.intro.length}/400</p>
              </div>

              <div className="flex items-center gap-4 pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-3 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-300 text-white rounded-xl font-semibold transition-colors flex items-center gap-2 text-sm"
                >
                  {isLoading
                    ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : t('teacher.profile.save')
                  }
                </button>
                {saved && (
                  <div className="flex items-center gap-2 text-emerald-600 text-sm font-medium">
                    <CheckCircle2 className="w-4 h-4" /> {t('teacher.profile.saved')}
                  </div>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
