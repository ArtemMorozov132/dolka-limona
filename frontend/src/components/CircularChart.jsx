import Plot from "react-plotly.js";

function formatValue(metricId, rawValue) {
  if (metricId === "orderCount") {
    return Math.round(rawValue).toLocaleString("ru-RU");
  }

  return rawValue.toFixed(1).replace(".", ",");
}

function formatLegendTick(metricId, rawValue) {
  if (metricId === "orderCount") {
    return Math.round(rawValue).toLocaleString("ru-RU");
  }

  if (Number.isInteger(rawValue)) {
    return rawValue.toLocaleString("ru-RU");
  }

  return rawValue.toFixed(1).replace(".", ",");
}

function getChartLayout() {
  if (typeof window === "undefined") {
    return {
      height: 650,
      mapZoom: 8.7,
      isMobile: false,
      colorbarThickness: 26,
      colorbarLength: 0.9,
      colorbarTitleSide: "top",
    };
  }

  const width = window.innerWidth;

  if (width <= 420) {
    return {
      height: 452,
      mapZoom: 8.95,
      isMobile: true,
      colorbarThickness: 18,
      colorbarLength: 0.72,
      colorbarTitleSide: "top",
    };
  }

  if (width <= 760) {
    return {
      height: 520,
      mapZoom: 8.75,
      isMobile: true,
      colorbarThickness: 20,
      colorbarLength: 0.8,
      colorbarTitleSide: "top",
    };
  }

  return {
    height: 650,
    mapZoom: 8.7,
    isMobile: false,
    colorbarThickness: 26,
    colorbarLength: 0.9,
    colorbarTitleSide: "top",
  };
}

export function CircularChart({ geoJson, rings, timeFrame, metric }) {
  const chartLayout = getChartLayout();
  const legendStops = Array.from({ length: 5 }, (_, index) => {
    const ratio = index / 4;
    const rawValue = metric.minValue + (metric.maxValue - metric.minValue) * ratio;

    return {
      id: ratio,
      value: formatLegendTick(metric.id, rawValue),
    };
  });

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
    <div className="chart-figure">
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
            showscale: !chartLayout.isMobile,
            marker: {
              opacity: 0.62,
              line: {
                color: "rgba(255, 255, 255, 0.24)",
                width: 1.2,
              },
            },
            customdata: customData,
            colorbar: {
              title: {
                text: metric.label,
                side: chartLayout.colorbarTitleSide,
                font: {
                  color: "#f4f1ef",
                },
              },
              thickness: chartLayout.colorbarThickness,
              len: chartLayout.colorbarLength,
              tickfont: {
                color: "#f4f1ef",
              },
            },
            hoverlabel: {
              bgcolor: "#050505",
              bordercolor: "#ff0912",
              font: {
                color: "#f4f1ef",
              },
            },
            hovertemplate:
              "<b>%{customdata[0]}</b><br>" +
              `${metric.label}: %{customdata[4]} ${metric.unit}<br>` +
              "РћРїРѕР·РґР°РЅРёСЏ: %{customdata[1]} %<br>" +
              "Р’СЂРµРјСЏ РґРѕСЃС‚Р°РІРєРё: %{customdata[2]} РјРёРЅ<br>" +
              "Р—Р°РєР°Р·РѕРІ: %{customdata[3]}<extra></extra>",
          },
        ]}
        layout={{
          autosize: true,
          height: chartLayout.height,
          margin: { l: 0, r: 0, t: 16, b: chartLayout.isMobile ? 8 : 0 },
          paper_bgcolor: "rgba(0,0,0,0)",
          plot_bgcolor: "rgba(0,0,0,0)",
          font: {
            family: '"Segoe UI Variable Text", "Segoe UI", sans-serif',
            color: "#f4f1ef",
          },
          mapbox: {
            style: "carto-darkmatter",
            center: {
              lat: 55.7522,
              lon: 37.6175,
            },
            zoom: chartLayout.mapZoom,
          },
        }}
        config={{
          displayModeBar: false,
          responsive: true,
        }}
        style={{ width: "100%", height: "100%" }}
        useResizeHandler
      />

      {chartLayout.isMobile ? (
        <div className="mobile-chart-legend" aria-label={`Легенда: ${metric.label}`}>
          <div className="mobile-chart-legend-header">
            <span>{metric.label}</span>
            <span>{metric.unit}</span>
          </div>

          <div
            className="mobile-chart-legend-bar"
            style={{
              background: `linear-gradient(90deg, ${metric.colorScale.join(", ")})`,
            }}
          />

          <div className="mobile-chart-legend-ticks">
            {legendStops.map((stop) => (
              <span key={stop.id}>{stop.value}</span>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
