import { useEffect, useState } from "react";
import { fetchStatsOverview } from "../api/statsApi";

export function useStatsData() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      try {
        setLoading(true);
        const response = await fetchStatsOverview();
        if (!cancelled) {
          setData(response);
          setError(null);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError.message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      cancelled = true;
    };
  }, []);

  return { data, loading, error };
}
