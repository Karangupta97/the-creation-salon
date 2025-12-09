'use client';

import { useState, useEffect } from 'react';
import { Monitor, Smartphone, Tablet, MapPin, Clock, Trash2, AlertCircle } from 'lucide-react';

interface Session {
  id: string;
  deviceInfo: string;
  ipAddress: string;
  lastActivity: Date;
  createdAt: Date;
}

export default function SessionsContent() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const res = await fetch('/api/admin/sessions', {
        credentials: 'include',
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch sessions');
      }

      setSessions(data.sessions);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRevokeSession = async (sessionId: string) => {
    if (!confirm('Are you sure you want to revoke this session?')) {
      return;
    }

    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/admin/sessions', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ sessionId }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to revoke session');
      }

      setSuccess('Session revoked successfully');
      fetchSessions();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleRevokeAllSessions = async () => {
    if (
      !confirm(
        'Are you sure you want to revoke all other sessions? You will remain logged in on this device.'
      )
    ) {
      return;
    }

    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/admin/sessions', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ revokeAll: true }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to revoke sessions');
      }

      setSuccess('All other sessions revoked successfully');
      fetchSessions();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const getDeviceIcon = (deviceInfo: string) => {
    if (deviceInfo.toLowerCase().includes('android') || deviceInfo.toLowerCase().includes('ios')) {
      return <Smartphone className="w-6 h-6 text-purple-600" />;
    } else if (deviceInfo.toLowerCase().includes('tablet')) {
      return <Tablet className="w-6 h-6 text-purple-600" />;
    }
    return <Monitor className="w-6 h-6 text-purple-600" />;
  };

  const formatLastActivity = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    return `${days} day${days > 1 ? 's' : ''} ago`;
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Active Sessions</h1>
        <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">
          Manage devices and browsers where you&apos;re currently logged in
        </p>
      </div>

      {error && (
        <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 sm:gap-3">
          <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 flex-shrink-0" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-600">{success}</p>
        </div>
      )}

      <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex-1 min-w-0">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900">
              {sessions.length} Active Session{sessions.length !== 1 ? 's' : ''}
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 mt-0.5 sm:mt-1">
              Sessions expire after 30 days of inactivity
            </p>
          </div>
          {sessions.length > 1 && (
            <button
              onClick={handleRevokeAllSessions}
              className="w-full sm:w-auto px-3 sm:px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 active:bg-red-800 transition-all text-xs sm:text-sm active:scale-95"
            >
              Revoke All Others
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-purple-200 border-t-purple-600"></div>
            <p className="text-gray-600 mt-4">Loading sessions...</p>
          </div>
        ) : sessions.length === 0 ? (
          <div className="p-12 text-center">
            <Monitor className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No active sessions found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="p-4 sm:p-6 hover:bg-gray-50 active:bg-gray-100 transition-colors"
              >
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    {getDeviceIcon(session.deviceInfo)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm sm:text-base font-semibold text-gray-900 truncate">
                      {session.deviceInfo}
                    </h3>

                    <div className="mt-2 space-y-1">
                      <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-600">
                        <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                        <span className="truncate">IP: {session.ipAddress}</span>
                      </div>
                      <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-600">
                        <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                        <span>Last active: {formatLastActivity(session.lastActivity)}</span>
                      </div>
                      <div className="text-xs text-gray-500">
                        Created: {new Date(session.createdAt).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleRevokeSession(session.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 active:bg-red-100 rounded-lg transition-all active:scale-95 flex-shrink-0"
                    title="Revoke this session"
                    aria-label="Revoke session"
                  >
                    <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start gap-2 sm:gap-3">
          <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-xs sm:text-sm text-blue-800">
            <p className="font-medium mb-1">Security Tip</p>
            <p>
              If you see any sessions you don&apos;t recognize, revoke them immediately and change
              your password.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
