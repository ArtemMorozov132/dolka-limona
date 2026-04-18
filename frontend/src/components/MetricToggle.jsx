export function MetricToggle({ metrics, value, onChange }) {
  return (
    <div className="toggle-group" role="tablist" aria-label="Выбор метрики">
      {metrics.map((metric) => {
        const active = metric.id === value;

        return (
          <button
            type="button"
            key={metric.id}
            className={`toggle-pill${active ? " active" : ""}`}
            onClick={() => onChange(metric.id)}
          >
            {metric.label}
          </button>
        );
      })}
    </div>
  );
}
