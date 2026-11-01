"use client";

import { useMemo } from "react";

export interface PresenceUser {
  clientId: number;
  name: string;
  color: string;
  avatarColor?: string;
  email?: string;
}

interface LiveAvatarsProps {
  users: PresenceUser[];
  currentUserId: string;
}

export default function LiveAvatars({ users }: LiveAvatarsProps) {
  const uniqueUsers = useMemo(() => {
    const map = new Map<string, PresenceUser>();
    users.forEach((u) => {
      if (u.name && !map.has(u.name)) {
        map.set(u.name, u);
      }
    });
    return Array.from(map.values());
  }, [users]);

  if (uniqueUsers.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center -space-x-2 overflow-hidden">
      {uniqueUsers.map((u) => (
        <div
          key={u.clientId || u.name}
          title={`${u.name} (Active now)`}
          className="relative inline-flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white ring-2 ring-white shadow-sm transition hover:z-10 hover:scale-105"
          style={{ backgroundColor: u.color || u.avatarColor || "#10b981" }}
        >
          {u.name.charAt(0).toUpperCase()}
          <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
        </div>
      ))}
      <span className="pl-3.5 text-xs font-semibold text-slate-500 tracking-tight">
        {uniqueUsers.length} online
      </span>
    </div>
  );
}
