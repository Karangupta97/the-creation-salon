'use client';

import { useState } from 'react';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Clock,
  MapPin,
  Monitor,
  Filter
} from 'lucide-react';

interface AuditLog {
  id: string;
  action: string;
  ipAddress: string;
  userAgent: string | null;
  reason: string | null;
  metadata: unknown;
  createdAt: Date;
}

interface ActivityContentProps {
  logs: AuditLog[];
}

export default function ActivityContent({ logs }: ActivityContentProps) {
  const [filter, setFilter] = useState<'all' | 'success' | 'failed' | 'security'>('all');

  const getActionIcon = (action: string) => {
    if (action.includes('SUCCESS')) {
      return <CheckCircle className="w-5 h-5 text-green-600" />;
    }
    if (action.includes('FAILED') || action.includes('LOCKED')) {
      return <XCircle className="w-5 h-5 text-red-600" />;
    }
    if (action.includes('2FA') || action.includes('PASSWORD')) {
      return <Shield className="w-5 h-5 text-purple-600" />;
    }
    return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
  };

  const getActionColor = (action: string) => {
    if (action.includes('SUCCESS')) return 'bg-green-50 text-green-700 border-green-200';
    if (action.includes('FAILED') || action.includes('LOCKED')) return 'bg-red-50 text-red-700 border-red-200';
    if (action.includes('2FA') || action.includes('PASSWORD')) return 'bg-purple-50 text-purple-700 border-purple-200';
    return 'bg-yellow-50 text-yellow-700 border-yellow-200';
  };

  const formatAction = (action: string) => {
    return action
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const filteredLogs = logs.filter((log) => {
    if (filter === 'all') return true;
    if (filter === 'success') return log.action.includes('SUCCESS');
    if (filter === 'failed') return log.action.includes('FAILED') || log.action.includes('LOCKED');
    if (filter === 'security') return log.action.includes('2FA') || log.action.includes('PASSWORD');
    return true;
  });

  const stats = {
    total: logs.length,
    success: logs.filter((l) => l.action.includes('SUCCESS')).length,
    failed: logs.filter((l) => l.action.includes('FAILED') || l.action.includes('LOCKED')).length,
    security: logs.filter((l) => l.action.includes('2FA') || l.action.includes('PASSWORD')).length,
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Activity Log</h1>
        <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">
          Monitor your account activity and security events
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-100 p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm text-gray-600 truncate">Total Events</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-0.5 sm:mt-1">{stats.total}</p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-100 p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm text-gray-600 truncate">Successful</p>
              <p className="text-xl sm:text-2xl font-bold text-green-600 mt-0.5 sm:mt-1">{stats.success}</p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-100 p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm text-gray-600 truncate">Failed</p>
              <p className="text-xl sm:text-2xl font-bold text-red-600 mt-0.5 sm:mt-1">{stats.failed}</p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <XCircle className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-100 p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm text-gray-600 truncate">Security</p>
              <p className="text-xl sm:text-2xl font-bold text-purple-600 mt-0.5 sm:mt-1">{stats.security}</p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-100 p-3 sm:p-4 mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
          <Filter className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 hidden sm:block" />
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all active:scale-95 ${
                filter === 'all'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All ({stats.total})
            </button>
            <button
              onClick={() => setFilter('success')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'success'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Success ({stats.success})
            </button>
            <button
              onClick={() => setFilter('failed')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'failed'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Failed ({stats.failed})
            </button>
            <button
              onClick={() => setFilter('security')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'security'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Security ({stats.security})
            </button>
          </div>
        </div>
      </div>

      {/* Activity Log */}
      <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900">Recent Activity</h2>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            Showing {filteredLogs.length} of {logs.length} events
          </p>
        </div>

        {filteredLogs.length === 0 ? (
          <div className="p-12 text-center">
            <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No activity logs found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredLogs.map((log) => (
              <div key={log.id} className="p-4 sm:p-6 hover:bg-gray-50 active:bg-gray-100 transition-colors">
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="flex-shrink-0 mt-0.5 sm:mt-1">{getActionIcon(log.action)}</div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4 mb-2">
                      <div className="flex-1 min-w-0">
                        <span
                          className={`inline-block px-2 sm:px-3 py-1 rounded-lg text-xs sm:text-sm font-medium border ${getActionColor(
                            log.action
                          )}`}
                        >
                          {formatAction(log.action)}
                        </span>
                        {log.reason && (
                          <p className="text-xs sm:text-sm text-gray-600 mt-2">{log.reason.replace(/_/g, ' ')}</p>
                        )}
                      </div>
                      <span className="text-xs sm:text-sm text-gray-500 whitespace-nowrap flex-shrink-0">
                        {new Date(log.createdAt).toLocaleString('en-US', { 
                          month: 'short', 
                          day: 'numeric', 
                          hour: '2-digit', 
                          minute: '2-digit'
                        })}
                      </span>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600 mt-2 sm:mt-3">
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                        <span className="truncate">{log.ipAddress}</span>
                      </div>
                      {log.userAgent && (
                        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                          <Monitor className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                          <span className="truncate max-w-[200px] sm:max-w-xs" title={log.userAgent}>
                            {log.userAgent.substring(0, 30)}{log.userAgent.length > 30 ? '...' : ''}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Security Notice */}
      <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <div className="flex items-start gap-2 sm:gap-3">
          <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div className="text-xs sm:text-sm text-amber-800">
            <p className="font-medium mb-1">Security Notice</p>
            <p>
              If you notice any suspicious activity or unrecognized login attempts, please change
              your password immediately and enable two-factor authentication.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
