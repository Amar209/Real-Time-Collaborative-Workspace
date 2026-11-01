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
  // Deduplicate users by name
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
          className="relative inline-flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold text-white ring-2 ring-[#0b0f19] shadow transition hover:z-10 hover:scale-110"
          style={{ backgroundColor: u.color || u.avatarColor || "#3b82f6" }}
        >
          {u.name.charAt(0).toUpperCase()}
          <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-emerald-400 ring-1 ring-black" />
        </div>
      ))}
      <span className="pl-3 text-xs font-medium text-slate-400">
        {uniqueUsers.length} online
      </span>
    </div>
  );
}
