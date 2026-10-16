'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  BellOff,
  CheckCircle2,
  AlertTriangle,
  Info,
  AlertCircle,
  CheckCheck,
  Trash2,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import { formatDistanceToNow, isToday, isYesterday, isThisWeek } from 'date-fns';
import {
  useGetInfiniteNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
  useDeleteNotification,
  Notification,
} from '@/hooks/queries/notifications';
import { useAppData } from '@/providers/AppDataProvider';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';

export default function NotificationsPage() {
  const { setHeaderData } = useAppData();
  const router = useRouter();
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const [filterUnreadOnly, setFilterUnreadOnly] = useState(false);

  useEffect(() => {
    setHeaderData(
      'Notification Center',
      'Review system updates, renewal reminders, and financial activity alerts.',
      false
    );
  }, [setHeaderData]);

  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useGetInfiniteNotifications({
    limit: 10,
    unread_only: filterUnreadOnly,
  });

  const markReadMutation = useMarkNotificationRead();
  const markAllReadMutation = useMarkAllNotificationsRead();
  const deleteMutation = useDeleteNotification();

  // Flatten paginated pages into a single stream
  const notifications = useMemo(
    () => data?.pages.flatMap((page) => page.data) || [],
    [data?.pages]
  );

  const unreadCount = data?.pages[0]?.unreadCount ?? 0;
  const totalItems = data?.pages[0]?.totalItems ?? 0;

  // IntersectionObserver to auto-fetch when scrolling near the bottom
  useEffect(() => {
    if (!hasNextPage || isFetchingNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          fetchNextPage();
        }
      },
      { threshold: 0.1, rootMargin: '150px' }
    );

    const currentSentinel = loadMoreRef.current;
    if (currentSentinel) {
      observer.observe(currentSentinel);
    }

    return () => {
      if (currentSentinel) {
        observer.unobserve(currentSentinel);
      }
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.is_read) {
      markReadMutation.mutate(notification.id);
    }
    if (notification.link_url) {
      router.push(notification.link_url);
    }
  };

  const handleDelete = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    deleteMutation.mutate(id);
  };

  // Group notifications into time buckets
  const groupedNotifications = useMemo(() => {
    const groups: { [key: string]: Notification[] } = {
      Today: [],
      Yesterday: [],
      'This Week': [],
      Earlier: [],
    };

    notifications.forEach((notif) => {
      const date = new Date(notif.created_at);
      if (isNaN(date.getTime())) {
        groups.Earlier.push(notif);
      } else if (isToday(date)) {
        groups.Today.push(notif);
      } else if (isYesterday(date)) {
        groups.Yesterday.push(notif);
      } else if (isThisWeek(date)) {
        groups['This Week'].push(notif);
      } else {
        groups.Earlier.push(notif);
      }
    });

    return Object.entries(groups).filter(([, items]) => items.length > 0);
  }, [notifications]);

  const getTypeIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-[#159A1D]" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case 'alert':
        return <AlertCircle className="w-5 h-5 text-rose-500" />;
      case 'info':
      default:
        return <Info className="w-5 h-5 text-sky-500" />;
    }
  };

  const getTypeBgClass = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return 'bg-emerald-50 border-emerald-200/60';
      case 'warning':
        return 'bg-amber-50 border-amber-200/60';
      case 'alert':
        return 'bg-rose-50 border-rose-200/60';
      case 'info':
      default:
        return 'bg-sky-50 border-sky-200/60';
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto pb-12 space-y-6">
      {/* Header Controls Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-100">
        {/* Filter Pills */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setFilterUnreadOnly(false)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              !filterUnreadOnly
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            All Alerts {totalItems > 0 && !filterUnreadOnly ? `(${totalItems})` : ''}
          </button>

          <button
            type="button"
            onClick={() => setFilterUnreadOnly(true)}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              filterUnreadOnly
                ? 'bg-[#159A1D] text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span>Unread</span>
            {unreadCount > 0 && (
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                  filterUnreadOnly ? 'bg-white text-[#159A1D]' : 'bg-[#159A1D] text-white'
                }`}
              >
                {unreadCount}
              </span>
            )}
          </button>
        </div>

        {/* Mark All Read Action */}
        <div className="flex items-center gap-2 self-end sm:self-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => markAllReadMutation.mutate()}
            disabled={unreadCount === 0 || markAllReadMutation.isPending}
            loading={markAllReadMutation.isPending}
            className="gap-2 text-xs font-bold"
          >
            {!markAllReadMutation.isPending && <CheckCheck className="w-4 h-4 text-slate-500" />}
            <span>Mark all read</span>
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="p-5 rounded-2xl bg-white border border-slate-100 flex items-start gap-4">
              <Skeleton variant="circular" width={44} height={44} />
              <div className="flex-1 space-y-2">
                <Skeleton variant="text" width="30%" height={18} />
                <Skeleton variant="text" width="80%" height={14} />
              </div>
            </div>
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-10 text-center">
          <EmptyState
            icon={<BellOff size={36} className="text-slate-400" />}
            title={filterUnreadOnly ? 'No unread notifications' : 'You are all caught up!'}
            description={
              filterUnreadOnly
                ? 'All of your notifications have been marked as read.'
                : 'System alerts, upcoming renewal reminders, and auto-posting receipts will appear here.'
            }
            actionText={filterUnreadOnly ? 'View all alerts' : undefined}
            onAction={filterUnreadOnly ? () => setFilterUnreadOnly(false) : undefined}
          />
        </div>
      ) : (
        <div className="space-y-6">
          {groupedNotifications.map(([groupTitle, groupItems]) => (
            <div key={groupTitle} className="space-y-3">
              <div className="flex items-center gap-2 px-1">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                  {groupTitle}
                </h3>
                <div className="h-px flex-1 bg-slate-100" />
                <span className="text-[11px] font-semibold text-slate-400">{groupItems.length}</span>
              </div>

              <div className="space-y-2.5">
                {groupItems.map((notification) => {
                  const isUnread = !notification.is_read;
                  return (
                    <div
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification)}
                      className={`group relative flex items-start justify-between gap-4 p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer ${
                        isUnread
                          ? 'bg-white border-[#159A1D]/25 shadow-xs ring-1 ring-[#159A1D]/10 hover:border-[#159A1D]/45 hover:shadow-sm'
                          : 'bg-white border-slate-100 hover:border-slate-200 hover:bg-slate-50/50'
                      }`}
                    >
                      <div className="flex items-start gap-3.5 sm:gap-4 flex-1 min-w-0">
                        {/* Icon Circle */}
                        <div
                          className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full border flex items-center justify-center shrink-0 shadow-2xs ${getTypeBgClass(
                            notification.type
                          )}`}
                        >
                          {getTypeIcon(notification.type)}
                        </div>

                        {/* Text Details */}
                        <div className="flex-1 min-w-0 pr-2">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h4
                              className={`text-sm sm:text-base font-bold truncate ${
                                isUnread ? 'text-slate-900 font-extrabold' : 'text-slate-700'
                              }`}
                            >
                              {notification.title}
                            </h4>
                            {isUnread && (
                              <span className="w-2 h-2 rounded-full bg-[#159A1D] shrink-0" />
                            )}
                          </div>
                          <p
                            className={`text-xs sm:text-sm leading-relaxed ${
                              isUnread ? 'text-slate-700 font-medium' : 'text-slate-500'
                            }`}
                          >
                            {notification.message}
                          </p>

                          {notification.link_url && (
                            <div className="inline-flex items-center gap-1 text-[11px] font-bold text-[#159A1D] mt-2 group-hover:underline">
                              <span>View related details</span>
                              <ChevronRight className="w-3 h-3" />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right Meta & Actions */}
                      <div className="flex flex-col items-end justify-between self-stretch shrink-0 gap-2">
                        <span className="text-[11px] font-medium text-slate-400 whitespace-nowrap">
                          {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                        </span>

                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={(e) => handleDelete(e, notification.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Dismiss notification"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Infinite Scroll Sentinel & Load More Indicator */}
          <div ref={loadMoreRef} className="pt-4 pb-8">
            {isFetchingNextPage ? (
              <div className="flex items-center justify-center gap-2 py-4 text-slate-500">
                <Loader2 className="w-5 h-5 animate-spin text-[#159A1D]" />
                <span className="text-xs font-semibold">Loading more notifications...</span>
              </div>
            ) : hasNextPage ? (
              <div className="flex justify-center py-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => fetchNextPage()}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-800"
                >
                  Scroll down or click to load more
                </Button>
              </div>
            ) : notifications.length > 0 ? (
              <p className="text-center text-xs font-medium text-slate-400 py-3">
                You have reached the end of all notifications.
              </p>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
