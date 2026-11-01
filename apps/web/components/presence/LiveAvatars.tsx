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
    <div className="flex items-center -space-x-1.5 overflow-hidden">
      {uniqueUsers.map((u) => (
        <div
          key={u.clientId || u.name}
          title={`${u.name} (Active)`}
          className="relative inline-flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-semibold text-white ring-1.5 ring-white transition hover:scale-105"
          style={{ backgroundColor: u.color || u.avatarColor || "#0f172a" }}
        >
          {u.name.charAt(0).toUpperCase()}
        </div>
      ))}
      <span className="pl-2 text-xs text-slate-400 font-normal">
        {uniqueUsers.length} online
      </span>
    </div>
  );
}
