import React, { createContext, useContext, useState, useCallback } from "react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { CheckCheck, XCircle } from "lucide-react";

type NotificationType = "success" | "error";

type Notification = {
  id: number;
  title: string;
  text: string;
  type: NotificationType;
};

type NotificationContextType = {
  notify: (title: string, text: string, type: NotificationType) => void;
};

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

// eslint-disable-next-line react-refresh/only-export-components
export const useNotification = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx)
    throw new Error("useNotification must be used within NotificationProvider");
  return ctx;
};

export const NotificationProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const notify = useCallback(
    (title: string, text: string, type: NotificationType) => {
      setNotifications((prev) => [
        ...prev,
        { id: Date.now() + Math.random(), title, text, type },
      ]);
      setTimeout(() => {
        setNotifications((prev) => prev.slice(1));
      }, 3000);
    },
    []
  );

  return (
    <NotificationContext.Provider value={{ notify }}>
      {children}
      <div
        style={{
          position: "fixed",
          bottom: 24,
          right: 24,
          zIndex: 9999,
          display: "flex",
          flexDirection: "column",
          gap: 12,
          alignItems: "flex-end",
        }}
      >
        {notifications.map((n) => (
          <Alert
            key={n.id}
            variant={n.type === "error" ? "destructive" : undefined}
            className="min-w-[260px] max-w-xs shadow-lg border"
            style={{ animation: "fadeIn 0.2s" }}
          >
            {n.type === "success" ? (
              <CheckCheck className="h-5 w-5" />
            ) : (
              <XCircle className="h-5 w-5" />
            )}
            <AlertTitle>{n.title}</AlertTitle>
            <AlertDescription>{n.text}</AlertDescription>
          </Alert>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};
