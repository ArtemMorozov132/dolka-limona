package com.magnit.dashboard.model

data class DashboardResponse(
    val title: String,
    val description: String,
    val metrics: List<MetricDefinition>,
    val rings: List<RingDefinition>,
    val timeFrames: List<TimeFrameDto>,
    val geoJson: GeoJsonFeatureCollection,
)

data class MetricDefinition(
    val id: String,
    val label: String,
    val description: String,
    val minValue: Double,
    val maxValue: Double,
    val unit: String,
    val colorScale: List<String>,
)

data class RingDefinition(
    val id: String,
    val label: String,
)

data class TimeFrameDto(
    val key: String,
    val label: String,
    val dayOfWeek: Int,
    val hour: Int,
    val values: List<RingMetricDto>,
)

data class RingMetricDto(
    val ringId: String,
    val lateRate: Double,
    val deliveryTime: Double,
    val orderCount: Int,
)

data class GeoJsonFeatureCollection(
    val type: String = "FeatureCollection",
    val features: List<GeoJsonFeature>,
)

data class GeoJsonFeature(
    val type: String = "Feature",
    val id: String,
    val geometry: GeoJsonGeometry,
    val properties: Map<String, String>,
)

data class GeoJsonGeometry(
    val type: String = "Polygon",
    val coordinates: List<List<List<Double>>>,
)
