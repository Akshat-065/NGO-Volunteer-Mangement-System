import { useEffect, useMemo, useRef, useState } from "react";
import { Bell, CheckCheck } from "lucide-react";
import { classNames, formatDateTime } from "../../utils/formatters";

const getMessageText = (notification) =>
  notification?.message || notification?.text || notification?.title || "New notification";

const getMessageTime = (notification) => {
  if (notification?.timeLabel) {
    return notification.timeLabel;
  }

  if (notification?.createdAt) {
    return formatDateTime(notification.createdAt);
  }

  return "Just now";
};

const NotificationBell = ({
  notifications = [],
  className = "",
  maxItems = 5,
  title = "Notifications",
  onItemClick
}) => {
  const [open, setOpen] = useState(false);
  const panelRef = useRef(null);

  const latestNotifications = useMemo(
    () =>
      [...notifications]
        .sort((left, right) => {
          const leftTime = new Date(left?.createdAt || left?.timestamp || 0).getTime();
          const rightTime = new Date(right?.createdAt || right?.timestamp || 0).getTime();
          return rightTime - leftTime;
        })
        .slice(0, maxItems),
    [maxItems, notifications]
  );

  const unreadCount = notifications.filter((notification) => !notification?.read).length;

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (!panelRef.current?.contains(event.target)) {
        setOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const handleItemClick = (notification) => {
    onItemClick?.(notification);
    setOpen(false);
  };

  return (
    <div ref={panelRef} className={classNames("relative inline-flex", className)}>
      <button
        type="button"
        aria-label="Open notifications"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className="relative inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/70 bg-white/90 text-slate shadow-card transition hover:text-ink focus:outline-none focus:ring-4 focus:ring-mist/40"
      >
        <Bell size={18} />

        {unreadCount > 0 ? (
          <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-coral px-1.5 py-0.5 text-[10px] font-bold leading-none text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="absolute right-0 top-[calc(100%+0.75rem)] z-50 w-[22rem] overflow-hidden rounded-3xl border border-mist/70 bg-white shadow-xl shadow-ink/10">
          <div className="flex items-center justify-between border-b border-mist/60 px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-ink">{title}</p>
              <p className="text-xs text-slate">
                {latestNotifications.length
                  ? `${latestNotifications.length} latest messages`
                  : "No messages yet"}
              </p>
            </div>

            {unreadCount > 0 ? (
              <span className="rounded-full bg-tide/10 px-2.5 py-1 text-xs font-semibold text-lagoon">
                {unreadCount} new
              </span>
            ) : (
              <CheckCheck size={16} className="text-slate" />
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {latestNotifications.length ? (
              latestNotifications.map((notification, index) => (
                <button
                  key={notification?.id || `${notification?.createdAt || index}-${index}`}
                  type="button"
                  onClick={() => handleItemClick(notification)}
                  className={classNames(
                    "flex w-full items-start gap-3 border-b border-mist/50 px-4 py-3 text-left transition last:border-b-0 hover:bg-cloud",
                    notification?.read ? "bg-white" : "bg-tide/5"
                  )}
                >
                  <span
                    className={classNames(
                      "mt-1 h-2.5 w-2.5 rounded-full",
                      notification?.read ? "bg-mist" : "bg-lagoon"
                    )}
                  />

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-ink">{getMessageText(notification)}</p>
                    {notification?.description ? (
                      <p className="mt-1 text-sm text-slate">{notification.description}</p>
                    ) : null}
                    <p className="mt-2 text-xs uppercase tracking-[0.18em] text-slate/70">
                      {getMessageTime(notification)}
                    </p>
                  </div>
                </button>
              ))
            ) : (
              <div className="px-4 py-8 text-center text-sm text-slate">No notifications yet.</div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default NotificationBell;
