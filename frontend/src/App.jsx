import { useState } from "react";
import magnitLogoMark from "./assets/magnit-logo-mark.png";
import { CircularChart } from "./components/CircularChart";
import { MetricToggle } from "./components/MetricToggle";
import { TimeSlider } from "./components/TimeSlider";
import { useStatsData } from "./hooks/useStatsData";

const metricDetails = {
  lateRate: {
    title: "Процент опозданий",
    caption:
      "Опозданием считаем заказ, у которого фактическое время доставки превысило обещанный клиенту интервал.",
  },
  deliveryTime: {
    title: "Время доставки",
    caption:
      "Показывает, сколько в среднем занимает доставка в выбранный момент времени и в каких зонах она едет дольше обычного.",
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
  const metrics = data.metrics.map((metric) =>
    metric.id === "orderCount"
      ? { ...metric, label: "Количество заказов" }
      : metric,
  );
  const currentMetric = metrics.find((metric) => metric.id === selectedMetric) ?? metrics[0];

  return (
    <main className="page-shell">
      <div className="deck-surface">
        <section className="hero-card">
          <div className="hero-copy">
            <div className="hero-brand" aria-label="MAGNIT OMNI">
              <img className="hero-logo-mark" src={magnitLogoMark} alt="Логотип Магнит" />
              <div className="hero-brand-text">
                <span>MAGNIT</span>
                <span>OMNI</span>
              </div>
            </div>
            <p className="hero-kicker">ИНФОГРАФИКА ДОСТАВКИ</p>
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

        <section className="control-panel">
          <div className="control-block">
            <MetricToggle
              metrics={metrics}
              value={selectedMetric}
              onChange={setSelectedMetric}
            />
          </div>

          <div className="metric-blurb">
            <p className="section-label">{metricDetails[selectedMetric]?.title ?? currentMetric.label}</p>
            <p>{metricDetails[selectedMetric]?.caption ?? currentMetric.description}</p>
          </div>
        </section>
      </div>
    </main>
  );
}
