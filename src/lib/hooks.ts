import { useEffect, useState } from "react";
import type { PostgrestResponse } from "./types-helper";

type QueryResult<T> = { data: T[] | null; error: { message: string } | null };

/**
 * Minimal data-fetching hook so pages stay declarative.
 * Returns { data, error, loading } and refetches when `deps` change.
 */
export function useQuery<T>(query: () => Promise<QueryResult<T>>, deps: unknown[] = []) {
  const [data, setData] = useState<T[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(null);
    query()
      .then((res) => {
        if (!alive) return;
        if (res.error) setError(res.error.message);
        else setData(res.data);
      })
      .catch((e) => alive && setError(String(e)))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, error, loading };
}

export type { QueryResult };
export type { PostgrestResponse };
