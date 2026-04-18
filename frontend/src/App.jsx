import { useState } from "react";
import { CircularChart } from "./components/CircularChart";
import { MetricToggle } from "./components/MetricToggle";
import { TimeSlider } from "./components/TimeSlider";
import { useStatsData } from "./hooks/useStatsData";

const deckSections = [
  "Обзор российского рынка",
  "Стратегия",
  "Магнит сегодня",
  "Операционные и финансовые результаты",
  "Команда",
];

const metricDetails = {
  lateRate: {
    title: "Процент опозданий",
    caption:
      "Опозданием считаем заказ, у которого фактическое время доставки превысило обещанный клиенту интервал.",
  },
  deliveryTime: {
    title: "Время доставки",
    caption:
      "Среднее время доставки восстановлено по корзинам `cte_bin` и помогает увидеть, где логистика начинает терять темп.",
  },
  orderCount: {
    title: "Количество заказов",
    caption:
      "Показывает, в каких кольцах Москвы в выбранный час концентрируется основной спрос и где накапливается нагрузка.",
  },
};

export default function App() {
  const { data, loading, error } = useStatsData();
  const [selectedMetric, setSelectedMetric] = useState("lateRate");
  const [selectedFrameIndex, setSelectedFrameIndex] = useState(0);

  if (loading) {
    return (
      <main className="page-shell">
        <section className="state-card">
          <p className="eyebrow">Загрузка</p>
          <h1>Подготавливаем карту доставки</h1>
          <p>Читаем CSV и собираем временные срезы по кольцам Москвы.</p>
        </section>
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="page-shell">
        <section className="state-card error-card">
          <p className="eyebrow">Ошибка</p>
          <h1>Не удалось получить данные</h1>
          <p>{error ?? "API не вернуло ожидаемый ответ."}</p>
        </section>
      </main>
    );
  }

  const safeFrameIndex = Math.min(selectedFrameIndex, Math.max(data.timeFrames.length - 1, 0));
  const currentFrame = data.timeFrames[safeFrameIndex];
  const currentMetric = data.metrics.find((metric) => metric.id === selectedMetric) ?? data.metrics[0];
  const statCards = [
    {
      label: "Текущий срез",
      value: currentFrame.label,
    },
    {
      label: "Колец на карте",
      value: `${data.rings.length}`,
    },
    {
      label: "Диапазон",
      value: `0-${Math.round(currentMetric.maxValue)} ${currentMetric.unit}`,
    },
  ];

  return (
    <main className="page-shell">
      <div className="deck-surface">
        <header className="deck-nav" aria-label="Разделы презентации">
          {deckSections.map((section, index) => (
            <div className={`deck-nav-item${index === 0 ? " active" : ""}`} key={section}>
              {section}
            </div>
          ))}
        </header>

        <section className="hero-card">
          <div className="hero-copy">
            <p className="eyebrow">Магнит сегодня</p>
            <h1>{data.title}</h1>
            <p className="hero-description">{data.description}</p>
          </div>

          <div className="hero-stats">
            {statCards.map((card) => (
              <article className="stat-card" key={card.label}>
                <span>{card.label}</span>
                <strong>{card.value}</strong>
              </article>
            ))}
          </div>
        </section>

        <section className="control-panel">
          <div className="control-block">
            <p className="section-label">Режим анализа</p>
            <MetricToggle
              metrics={data.metrics}
              value={selectedMetric}
              onChange={setSelectedMetric}
            />
          </div>

          <div className="metric-blurb">
            <p className="section-label">{metricDetails[selectedMetric]?.title ?? currentMetric.label}</p>
            <p>{metricDetails[selectedMetric]?.caption ?? currentMetric.description}</p>
          </div>
        </section>

        <section className="chart-card">
          <CircularChart
            geoJson={data.geoJson}
            rings={data.rings}
            timeFrame={currentFrame}
            metric={currentMetric}
          />
        </section>

        <section className="slider-card">
          <div className="slider-header">
            <div>
              <p className="section-label">Время</p>
              <h2>{currentFrame.label}</h2>
            </div>
            <p className="slider-meta">
              Срез {safeFrameIndex + 1} из {data.timeFrames.length}
            </p>
          </div>

          <TimeSlider
            frames={data.timeFrames}
            value={safeFrameIndex}
            onChange={setSelectedFrameIndex}
          />
        </section>
      </div>
    </main>
  );
}
