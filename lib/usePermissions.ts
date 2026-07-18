"use client";

import { useEffect, useState } from "react";

export type Perms = Record<string, boolean>;

// Module-level cache so multiple components don't each refetch /api/auth/me.
let cache: Perms | null = null;

export function usePermissions(): Perms {
  const [perms, setPerms] = useState<Perms>(cache || {});
  useEffect(() => {
    if (cache) {
      setPerms(cache);
      return;
    }
    let alive = true;
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((j) => {
        cache = (j.permissions as Perms) || {};
        if (alive) setPerms(cache);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);
  return perms;
}
