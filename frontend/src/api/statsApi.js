export async function fetchStatsOverview() {
  const response = await fetch("/api/stats/overview");

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: не удалось загрузить статистику`);
  }

  return response.json();
}
