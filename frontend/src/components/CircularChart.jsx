import Plot from "react-plotly.js";

function formatValue(metricId, rawValue) {
  if (metricId === "orderCount") {
    return Math.round(rawValue).toLocaleString("ru-RU");
  }

  return rawValue.toFixed(1).replace(".", ",");
}

export function CircularChart({ geoJson, rings, timeFrame, metric }) {
  const ringValueMap = {};
  timeFrame.values.forEach((entry) => {
    ringValueMap[entry.ringId] = entry;
  });

  const zValues = rings.map((ring) => {
    const value = ringValueMap[ring.id];
    if (!value) {
      return 0;
    }

    return value[metric.id];
  });

  const colorscale = metric.colorScale.map((color, index, palette) => [
    index / Math.max(palette.length - 1, 1),
    color,
  ]);

  const customData = rings.map((ring) => {
    const value = ringValueMap[ring.id] ?? {
      lateRate: 0,
      deliveryTime: 0,
      orderCount: 0,
    };

    return [
      ring.label,
      formatValue("lateRate", value.lateRate),
      formatValue("deliveryTime", value.deliveryTime),
      formatValue("orderCount", value.orderCount),
      formatValue(metric.id, value[metric.id]),
    ];
  });

  return (
    <Plot
      data={[
        {
          type: "choroplethmapbox",
          geojson: geoJson,
          featureidkey: "id",
          locations: rings.map((ring) => ring.id),
          z: zValues,
          zmin: metric.minValue,
          zmax: metric.maxValue || 1,
          colorscale,
          marker: {
            opacity: 0.72,
            line: {
              color: "#f8fafc",
              width: 1.5,
            },
          },
          customdata: customData,
          colorbar: {
            title: {
              text: metric.label,
              font: {
                color: "#dbeafe",
              },
            },
            tickfont: {
              color: "#dbeafe",
            },
          },
          hovertemplate:
            "<b>%{customdata[0]}</b><br>" +
            `${metric.label}: %{customdata[4]} ${metric.unit}<br>` +
            "Опоздания: %{customdata[1]} %<br>" +
            "Время доставки: %{customdata[2]} мин<br>" +
            "Заказов: %{customdata[3]}<extra></extra>",
        },
      ]}
      layout={{
        autosize: true,
        height: 640,
        margin: { l: 0, r: 0, t: 20, b: 0 },
        paper_bgcolor: "rgba(0,0,0,0)",
        plot_bgcolor: "rgba(0,0,0,0)",
        font: {
          family: '"Segoe UI Variable Text", "Segoe UI", sans-serif',
          color: "#f8fafc",
        },
        mapbox: {
          style: "carto-darkmatter",
          center: {
            lat: 55.7522,
            lon: 37.6175,
          },
          zoom: 8.7,
        },
      }}
      config={{
        displayModeBar: false,
        responsive: true,
      }}
      style={{ width: "100%", height: "100%" }}
      useResizeHandler
    />
  );
}
