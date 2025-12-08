'use client';

import { useState } from 'react';
import { Shield, Key, Activity, User, Download, Smartphone, Copy, Check } from 'lucide-react';
import Image from 'next/image';

interface Admin {
  id: string;
  name: string;
  email: string;
  twoFactorEnabled: boolean;
  createdAt: Date;
  lastLoginAt: Date | null;
}

interface SettingsContentProps {
  admin: Admin;
}

export default function SettingsContent({ admin }: SettingsContentProps) {
  const [activeTab, setActiveTab] = useState('security');
  const [is2FAEnabled, setIs2FAEnabled] = useState(admin.twoFactorEnabled);
  const [showSetup2FA, setShowSetup2FA] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [verifyCode, setVerifyCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedCode, setCopiedCode] = useState<number | null>(null);

  const handle2FASetup = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const res = await fetch('/api/admin/auth/2fa/setup', {
        method: 'POST',
        credentials: 'include',
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to setup 2FA');
      }

      setQrCode(data.qrCode);
      setSecret(data.secret);
      setBackupCodes(data.backupCodes);
      setShowSetup2FA(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnable2FA = async () => {
    if (!verifyCode || verifyCode.length !== 6) {
      setError('Please enter a valid 6-digit code');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/auth/2fa/enable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ token: verifyCode }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to enable 2FA');
      }

      setIs2FAEnabled(true);
      setSuccess('Two-factor authentication enabled successfully!');
      setShowSetup2FA(false);
      setVerifyCode('');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisable2FA = async () => {
    if (!confirm('Are you sure you want to disable two-factor authentication? This will make your account less secure.')) {
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/auth/2fa/disable', {
        method: 'POST',
        credentials: 'include',
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to disable 2FA');
      }

      setIs2FAEnabled(false);
      setSuccess('Two-factor authentication disabled successfully');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(index);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const downloadBackupCodes = () => {
    const text = `The Creation Salon - Backup Codes\n\nGenerated: ${new Date().toLocaleString()}\n\n${backupCodes.join('\n')}\n\nKeep these codes safe. Each code can only be used once.`;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'backup-codes.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const tabs = [
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'activity', name: 'Activity', icon: Activity },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">Manage your account settings and preferences</p>
      </div>

      {/* Alerts */}
      {error && (
        <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-xs sm:text-sm text-red-600">{error}</p>
        </div>
      )}
      {success && (
        <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-xs sm:text-sm text-green-600">{success}</p>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="border-b border-gray-200 overflow-x-auto">
          <div className="flex min-w-max sm:min-w-0">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium transition-all active:scale-95 whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50/30'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                  {tab.name}
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-4 sm:p-6">
          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="space-y-4 sm:space-y-6">
              {/* Two-Factor Authentication */}
              <div className="border border-gray-200 rounded-lg p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                  <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Smartphone className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900">Two-Factor Authentication</h3>
                      <p className="text-xs sm:text-sm text-gray-600 mt-1">
                        Add an extra layer of security to your account
                      </p>
                      <div className="mt-2">
                        <span
                          className={`inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${
                            is2FAEnabled
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {is2FAEnabled ? '✓ Enabled' : 'Disabled'}
                        </span>
                      </div>
                    </div>
                  </div>
                  {!is2FAEnabled ? (
                    <button
                      onClick={handle2FASetup}
                      disabled={isLoading}
                      className="w-full sm:w-auto px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 active:bg-purple-800 transition-all disabled:opacity-50 text-sm active:scale-95"
                    >
                      {isLoading ? 'Setting up...' : 'Enable 2FA'}
                    </button>
                  ) : (
                    <button
                      onClick={handleDisable2FA}
                      disabled={isLoading}
                      className="w-full sm:w-auto px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 active:bg-red-800 transition-all disabled:opacity-50 text-sm active:scale-95">
                      Disable 2FA
                    </button>
                  )}
                </div>

                {/* 2FA Setup Modal */}
                {showSetup2FA && (
                  <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                      {/* QR Code */}
                      <div>
                        <h4 className="text-sm sm:text-base font-semibold text-gray-900 mb-2 sm:mb-3">1. Scan QR Code</h4>
                        <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
                          Use Google Authenticator, Authy, or any TOTP app to scan this code:
                        </p>
                        {qrCode && (
                          <div className="bg-white p-3 sm:p-4 rounded-lg border border-gray-200 inline-block">
                            <Image src={qrCode} alt="2FA QR Code" width={160} height={160} className="sm:w-[200px] sm:h-[200px]" />
                          </div>
                        )}
                        <div className="mt-3 sm:mt-4">
                          <p className="text-xs text-gray-500 mb-2">Or enter this key manually:</p>
                          <div className="flex items-center gap-2">
                            <code className="text-xs bg-gray-100 px-2 sm:px-3 py-1.5 sm:py-2 rounded font-mono break-all flex-1">
                              {secret}
                            </code>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(secret);
                                setSuccess('Secret copied to clipboard');
                              }}
                              className="p-2 hover:bg-gray-100 rounded transition-colors"
                            >
                              <Copy className="w-4 h-4 text-gray-600" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Verification */}
                      <div>
                        <h4 className="text-sm sm:text-base font-semibold text-gray-900 mb-2 sm:mb-3">2. Verify Code</h4>
                        <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
                          Enter the 6-digit code from your authenticator app:
                        </p>
                        <input
                          type="text"
                          inputMode="numeric"
                          maxLength={6}
                          value={verifyCode}
                          onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, ''))}
                          className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-center text-xl sm:text-2xl font-mono tracking-widest"
                          placeholder="000000"
                        />
                        <button
                          onClick={handleEnable2FA}
                          disabled={isLoading || verifyCode.length !== 6}
                          className="w-full mt-3 sm:mt-4 px-4 py-2.5 sm:py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 active:bg-purple-800 transition-all disabled:opacity-50 text-sm sm:text-base active:scale-95">
                          {isLoading ? 'Verifying...' : 'Verify & Enable'}
                        </button>
                      </div>
                    </div>

                    {/* Backup Codes */}
                    {backupCodes.length > 0 && (
                      <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-3 sm:mb-4">
                          <div>
                            <h4 className="text-sm sm:text-base font-semibold text-gray-900">3. Save Backup Codes</h4>
                            <p className="text-xs sm:text-sm text-gray-600 mt-1">
                              Keep these codes safe. Each can only be used once.
                            </p>
                          </div>
                          <button
                            onClick={downloadBackupCodes}
                            className="flex items-center justify-center sm:justify-start gap-2 px-3 sm:px-4 py-2 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 rounded-lg text-xs sm:text-sm font-medium transition-all active:scale-95">
                            <Download className="w-4 h-4" />
                            Download
                          </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                          {backupCodes.map((code, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between bg-gray-50 px-3 sm:px-4 py-2 sm:py-3 rounded-lg border border-gray-200">
                              <code className="text-xs sm:text-sm font-mono">{code}</code>
                              <button
                                onClick={() => copyToClipboard(code, index)}
                                className="p-1 hover:bg-gray-200 rounded transition-colors"
                              >
                                {copiedCode === index ? (
                                  <Check className="w-4 h-4 text-green-600" />
                                ) : (
                                  <Copy className="w-4 h-4 text-gray-600" />
                                )}
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Password Change */}
              <div className="border border-gray-200 rounded-lg p-4 sm:p-6">
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Key className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900">Password</h3>
                    <p className="text-xs sm:text-sm text-gray-600 mt-1">
                      Last changed {admin.createdAt ? new Date(admin.createdAt).toLocaleDateString() : 'never'}
                    </p>
                    <button className="mt-3 sm:mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 active:bg-indigo-800 transition-all text-sm active:scale-95">
                      Change Password
                    </button>
                  </div>
                </div>
              </div>

              {/* Sessions */}
              <div className="border border-gray-200 rounded-lg p-4 sm:p-6">
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-violet-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Activity className="w-5 h-5 sm:w-6 sm:h-6 text-violet-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900">Active Sessions</h3>
                    <p className="text-xs sm:text-sm text-gray-600 mt-1">
                      Manage devices and browsers where you're logged in
                    </p>
                    <a
                      href="/admin/dashboard/sessions"
                      className="inline-block mt-3 sm:mt-4 px-4 py-2 bg-violet-600 text-white rounded-lg font-medium hover:bg-violet-700 active:bg-violet-800 transition-all text-sm active:scale-95">
                      View Sessions
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="space-y-4 sm:space-y-6">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  defaultValue={admin.name}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm sm:text-base"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  defaultValue={admin.email}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm sm:text-base"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Account Created</label>
                <input
                  type="text"
                  value={new Date(admin.createdAt).toLocaleDateString()}
                  disabled
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-50 border border-gray-300 rounded-lg text-sm sm:text-base text-gray-500"
                />
              </div>
              <button className="w-full sm:w-auto px-6 py-2.5 sm:py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 active:bg-purple-800 transition-all text-sm sm:text-base active:scale-95">
                Save Changes
              </button>
            </div>
          )}

          {/* Activity Tab */}
          {activeTab === 'activity' && (
            <div>
              <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">Recent account activity and login history</p>
              <div className="space-y-3">
                <div className="p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm sm:text-base font-medium text-gray-900">Login</p>
                      <p className="text-xs sm:text-sm text-gray-600 mt-1 truncate" title={admin.lastLoginAt ? new Date(admin.lastLoginAt).toLocaleString() : 'Never'}>
                        {admin.lastLoginAt 
                          ? new Date(admin.lastLoginAt).toLocaleString()
                          : 'Never'}
                      </p>
                    </div>
                    <span className="text-xs bg-green-100 text-green-700 px-2.5 sm:px-3 py-1 rounded-full whitespace-nowrap flex-shrink-0">
                      Success
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
