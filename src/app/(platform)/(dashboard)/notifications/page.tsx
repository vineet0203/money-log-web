"use client";

import React, { useState } from 'react';
import { 
  useGetNotifications, 
  useMarkNotificationRead, 
  useMarkAllNotificationsRead, 
  Notification 
} from '@/hooks/queries/notifications';
import { useAppData } from '@/providers/AppDataProvider';
import { 
  BellOff, 
  CheckCircle, 
  AlertTriangle, 
  Info, 
  AlertCircle,
  Loader2,
  CheckCheck
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function NotificationsPage() {
  const { setHeaderData } = useAppData();
  const [page, setPage] = useState(1);

  React.useEffect(() => {
    setHeaderData(
      'Notifications',
      'Stay updated with your latest alerts and reminders.',
      false
    );
  }, [setHeaderData]);

  const { data, isLoading, isFetching } = useGetNotifications({ page, limit: 10 });
  const { mutate: markRead } = useMarkNotificationRead();
  const { mutate: markAllRead, isPending: isMarkingAll } = useMarkAllNotificationsRead();

  const notifications = data?.data || [];

  const handleMarkRead = (id: number, isRead: number) => {
    if (!isRead) {
      markRead(id);
    }
  };

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success': return <CheckCircle className="text-emerald-500" size={24} />;
      case 'warning': return <AlertTriangle className="text-amber-500" size={24} />;
      case 'alert': return <AlertCircle className="text-red-500" size={24} />;
      case 'info': default: return <Info className="text-blue-500" size={24} />;
    }
  };

  const getBgClass = (type: Notification['type']) => {
    switch (type) {
      case 'success': return 'bg-emerald-100';
      case 'warning': return 'bg-amber-100';
      case 'alert': return 'bg-red-100';
      case 'info': default: return 'bg-blue-100';
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto pb-10">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-slate-800">Your Alerts</h2>
        {notifications.length > 0 && (
          <button
            onClick={() => markAllRead()}
            disabled={isMarkingAll}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-sm disabled:opacity-50"
          >
            {isMarkingAll ? <Loader2 className="animate-spin w-4 h-4" /> : <CheckCheck className="w-4 h-4" />}
            Mark all as read
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin mb-4" />
          <p>Loading notifications...</p>
        </div>
      ) : notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 px-4 bg-white rounded-2xl border border-slate-100 shadow-sm text-center">
          <BellOff className="w-16 h-16 text-slate-300 mb-4" />
          <h3 className="text-lg font-bold text-slate-800 mb-2">No Notifications</h3>
          <p className="text-slate-500 max-w-sm">You don't have any notifications at the moment. We'll let you know when something comes up!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <div 
              key={notification.id}
              onClick={() => handleMarkRead(notification.id, notification.is_read)}
              className={`flex items-start gap-4 p-5 rounded-2xl border cursor-pointer transition-all ${
                notification.is_read 
                  ? 'bg-white border-slate-100' 
                  : 'bg-[#159A1D]/5 border-[#159A1D]/20 shadow-sm hover:bg-[#159A1D]/10'
              }`}
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${getBgClass(notification.type)}`}>
                {getIcon(notification.type)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1">
                  <h4 className={`text-base font-bold truncate pr-4 ${notification.is_read ? 'text-slate-700' : 'text-slate-900'}`}>
                    {notification.title}
                  </h4>
                  <div className="flex items-center gap-2 flex-shrink-0 pt-1">
                    {!notification.is_read && (
                      <span className="w-2.5 h-2.5 rounded-full bg-[#159A1D]" />
                    )}
                    <span className="text-xs font-medium text-slate-400">
                      {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                    </span>
                  </div>
                </div>
                <p className={`text-sm leading-relaxed ${notification.is_read ? 'text-slate-500' : 'text-slate-700 font-medium'}`}>
                  {notification.message}
                </p>
              </div>
            </div>
          ))}

          {/* Pagination Controls */}
          {data && data.totalPages > 1 && (
            <div className="flex justify-between items-center pt-6">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1 || isFetching}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 transition-colors shadow-sm"
              >
                Previous
              </button>
              <span className="text-sm text-slate-500 font-medium">
                Page {page} of {data.totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(data.totalPages, p + 1))}
                disabled={page === data.totalPages || isFetching}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 transition-colors shadow-sm"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
