'use client';

import { useState } from 'react';

interface ProfileData {
  fullName: string;
  username: string;
  email: string;
  whatsapp: string;
}

interface PasswordData {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function ProfilPage() {
  const [profile, setProfile] = useState<ProfileData>({
    fullName: 'Customer',
    username: 'customer',
    email: 'customer@example.com',
    whatsapp: '',
  });

  const [password, setPassword] = useState<PasswordData>({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [profileSaving, setProfileSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileMessage('');
    // Placeholder - not connected yet
    setTimeout(() => {
      setProfileSaving(false);
      setProfileMessage('Fitur edit profil akan aktif di update mendatang');
    }, 500);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordSaving(true);
    setPasswordMessage('');

    if (password.newPassword !== password.confirmPassword) {
      setPasswordMessage('Password baru tidak sama');
      setPasswordSaving(false);
      return;
    }

    if (password.newPassword.length < 6) {
      setPasswordMessage('Password minimal 6 karakter');
      setPasswordSaving(false);
      return;
    }

    // Placeholder - not connected yet
    setTimeout(() => {
      setPasswordSaving(false);
      setPasswordMessage('Fitur ganti password akan aktif di update mendatang');
      setPassword({ oldPassword: '', newPassword: '', confirmPassword: '' });
    }, 500);
  };

  return (
    <div>
      <h1 className="font-heading text-heading-2 text-white mb-2">Profil</h1>
      <p className="text-body-sm text-muted-foreground mb-8">
        Kelola informasi akun kamu
      </p>

      {/* Info Banner */}
      <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl mb-6">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-body-sm text-blue-300">
            Fitur edit profil akan aktif di update mendatang
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Info */}
        <div className="bg-dark-card border border-dark-border rounded-xl p-6">
          <h2 className="font-heading text-heading-4 text-white mb-6">Informasi Pribadi</h2>
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-body-xs text-muted-foreground mb-1.5">Nama Lengkap</label>
              <input
                type="text"
                value={profile.fullName}
                onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                className="w-full px-3 py-2.5 bg-dark border border-dark-border rounded-lg text-body-sm text-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
              />
            </div>

            {/* Username (readonly) */}
            <div>
              <label className="block text-body-xs text-muted-foreground mb-1.5">Username</label>
              <input
                type="text"
                value={profile.username}
                readOnly
                className="w-full px-3 py-2.5 bg-dark/50 border border-dark-border rounded-lg text-body-sm text-muted-foreground cursor-not-allowed"
              />
              <p className="text-body-xs text-muted-foreground mt-1">Username tidak dapat diubah</p>
            </div>

            {/* Email (readonly) */}
            <div>
              <label className="block text-body-xs text-muted-foreground mb-1.5">Email</label>
              <input
                type="email"
                value={profile.email}
                readOnly
                className="w-full px-3 py-2.5 bg-dark/50 border border-dark-border rounded-lg text-body-sm text-muted-foreground cursor-not-allowed"
              />
              <p className="text-body-xs text-muted-foreground mt-1">Email tidak dapat diubah</p>
            </div>

            {/* WhatsApp */}
            <div>
              <label className="block text-body-xs text-muted-foreground mb-1.5">WhatsApp</label>
              <input
                type="text"
                value={profile.whatsapp}
                onChange={(e) => setProfile({ ...profile, whatsapp: e.target.value })}
                placeholder="08xxxxxxxxxx"
                className="w-full px-3 py-2.5 bg-dark border border-dark-border rounded-lg text-body-sm text-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
              />
            </div>

            {/* Profile Message */}
            {profileMessage && (
              <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <p className="text-body-xs text-blue-300">{profileMessage}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={profileSaving}
              className="w-full py-2.5 bg-primary text-primary-foreground text-body-sm font-medium rounded-lg hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {profileSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Menyimpan...
                </>
              ) : (
                'Simpan Perubahan'
              )}
            </button>
          </form>
        </div>

        {/* Change Password */}
        <div className="bg-dark-card border border-dark-border rounded-xl p-6">
          <h2 className="font-heading text-heading-4 text-white mb-6">Ganti Password</h2>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            {/* Old Password */}
            <div>
              <label className="block text-body-xs text-muted-foreground mb-1.5">Password Lama</label>
              <input
                type="password"
                value={password.oldPassword}
                onChange={(e) => setPassword({ ...password, oldPassword: e.target.value })}
                placeholder="Masukkan password lama"
                className="w-full px-3 py-2.5 bg-dark border border-dark-border rounded-lg text-body-sm text-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
              />
            </div>

            {/* New Password */}
            <div>
              <label className="block text-body-xs text-muted-foreground mb-1.5">Password Baru</label>
              <input
                type="password"
                value={password.newPassword}
                onChange={(e) => setPassword({ ...password, newPassword: e.target.value })}
                placeholder="Masukkan password baru"
                className="w-full px-3 py-2.5 bg-dark border border-dark-border rounded-lg text-body-sm text-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-body-xs text-muted-foreground mb-1.5">Konfirmasi Password Baru</label>
              <input
                type="password"
                value={password.confirmPassword}
                onChange={(e) => setPassword({ ...password, confirmPassword: e.target.value })}
                placeholder="Ulangi password baru"
                className="w-full px-3 py-2.5 bg-dark border border-dark-border rounded-lg text-body-sm text-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
              />
            </div>

            {/* Password Message */}
            {passwordMessage && (
              <div className={`p-3 rounded-lg border ${
                passwordMessage.includes('tidak sama') || passwordMessage.includes('minimal')
                  ? 'bg-red-500/10 border-red-500/20'
                  : 'bg-blue-500/10 border-blue-500/20'
              }`}>
                <p className={`text-body-xs ${
                  passwordMessage.includes('tidak sama') || passwordMessage.includes('minimal')
                    ? 'text-red-300'
                    : 'text-blue-300'
                }`}>
                  {passwordMessage}
                </p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={passwordSaving}
              className="w-full py-2.5 bg-primary text-primary-foreground text-body-sm font-medium rounded-lg hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {passwordSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Menyimpan...
                </>
              ) : (
                'Ganti Password'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
