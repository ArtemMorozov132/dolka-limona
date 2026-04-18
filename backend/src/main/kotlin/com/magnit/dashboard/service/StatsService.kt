package com.magnit.dashboard.service

import com.magnit.dashboard.model.DashboardResponse
import com.magnit.dashboard.model.GeoJsonFeature
import com.magnit.dashboard.model.GeoJsonFeatureCollection
import com.magnit.dashboard.model.GeoJsonGeometry
import com.magnit.dashboard.model.MetricDefinition
import com.magnit.dashboard.model.RingDefinition
import com.magnit.dashboard.model.RingMetricDto
import com.magnit.dashboard.model.TimeFrameDto
import jakarta.annotation.PostConstruct
import kotlin.math.cos
import kotlin.math.round
import kotlin.math.sin
import org.springframework.stereotype.Service

@Service
class StatsService {
    private val ringOrder = listOf("< 5 km", "5-10 km", "10-15 km", "15-20 km", "> 20 km")
    private val lateBins = setOf("60-90", "90-120", "> 90")
    private val cteMidpoints = mapOf(
        "< 15" to 12.5,
        "15-20" to 17.5,
        "20-30" to 25.0,
        "30-45" to 37.5,
        "45-60" to 52.5,
        "60-90" to 75.0,
        "90-120" to 105.0,
        "> 90" to 105.0,
    )

    @Volatile
    private lateinit var dashboard: DashboardResponse

    @PostConstruct
    fun init() {
        dashboard = buildDashboard()
    }

    fun getDashboard(): DashboardResponse = dashboard

    private fun buildDashboard(): DashboardResponse {
        val resource = checkNotNull(javaClass.getResourceAsStream("/data/magnit_data.csv")) {
            "CSV file /data/magnit_data.csv was not found"
        }

        val timeBuckets = linkedMapOf<TimeKey, MutableMap<String, AggregateBucket>>()

        resource.bufferedReader().useLines { lines ->
            val iterator = lines.iterator()
            if (!iterator.hasNext()) {
                error("CSV file is empty")
            }

            val header = parseCsvLine(iterator.next())
            val indexMap = header.mapIndexed { index, name -> name to index }.toMap()
            val dayIndex = requireIndex(indexMap, "order_day_of_week")
            val hourIndex = requireIndex(indexMap, "order_hour")
            val distanceIndex = requireIndex(indexMap, "distance_to_kremlin_bin")
            val cteIndex = requireIndex(indexMap, "cte_bin")

            while (iterator.hasNext()) {
                val line = iterator.next()
                if (line.isBlank()) {
                    continue
                }

                val row = parseCsvLine(line)
                val distanceRing = row.getOrNull(distanceIndex)?.trim().orEmpty()
                val cteBin = row.getOrNull(cteIndex)?.trim().orEmpty()
                val day = row.getOrNull(dayIndex)?.trim()?.toIntOrNull()
                val hour = row.getOrNull(hourIndex)?.trim()?.toIntOrNull()
                val deliveryTime = cteMidpoints[cteBin]

                if (distanceRing !in ringOrder || day == null || hour == null || deliveryTime == null) {
                    continue
                }

                val timeKey = TimeKey(day, hour)
                val ringBuckets = timeBuckets.getOrPut(timeKey) { linkedMapOf() }
                val bucket = ringBuckets.getOrPut(distanceRing) { AggregateBucket() }
                bucket.add(
                    isLate = cteBin in lateBins,
                    deliveryTime = deliveryTime,
                )
            }
        }

        val orderedTimeFrames = timeBuckets.entries
            .sortedWith(compareBy({ it.key.dayOfWeek }, { it.key.hour }))
            .map { (timeKey, ringBuckets) ->
                TimeFrameDto(
                    key = "${timeKey.dayOfWeek}-${timeKey.hour}",
                    label = "День ${timeKey.dayOfWeek}, ${timeKey.hour.toString().padStart(2, '0')}:00",
                    dayOfWeek = timeKey.dayOfWeek,
                    hour = timeKey.hour,
                    values = ringOrder.map { ring ->
                        val bucket = ringBuckets[ring] ?: AggregateBucket()
                        RingMetricDto(
                            ringId = ring,
                            lateRate = roundTo(bucket.lateRatePercent()),
                            deliveryTime = roundTo(bucket.avgDeliveryTime()),
                            orderCount = bucket.orderCount,
                        )
                    },
                )
            }

        val allValues = orderedTimeFrames.flatMap { it.values }
        val lateMax = allValues.maxOfOrNull { it.lateRate } ?: 0.0
        val deliveryMax = allValues.maxOfOrNull { it.deliveryTime } ?: 0.0
        val orderMax = allValues.maxOfOrNull { it.orderCount.toDouble() } ?: 0.0

        return DashboardResponse(
            title = "Карта нагрузки Магнит по кольцам Москвы",
            description = "Один график переключается между процентом опозданий, временем доставки и количеством заказов.",
            metrics = listOf(
                MetricDefinition(
                    id = "lateRate",
                    label = "Опоздания",
                    description = "Доля заказов с временем доставки 60+ минут.",
                    minValue = 0.0,
                    maxValue = lateMax,
                    unit = "%",
                    colorScale = listOf("#fff4e6", "#ffbf69", "#ff7b54", "#d7263d"),
                ),
                MetricDefinition(
                    id = "deliveryTime",
                    label = "Время доставки",
                    description = "Среднее оценочное время доставки по корзинам `cte_bin`.",
                    minValue = 0.0,
                    maxValue = deliveryMax,
                    unit = "мин",
                    colorScale = listOf("#eef6ff", "#9ad1ff", "#3f8efc", "#1939b7"),
                ),
                MetricDefinition(
                    id = "orderCount",
                    label = "Кол-во заказов",
                    description = "Количество заказов в выбранном временном срезе.",
                    minValue = 0.0,
                    maxValue = orderMax,
                    unit = "шт",
                    colorScale = listOf("#f3ffe5", "#b8e986", "#4caf50", "#1f6b2c"),
                ),
            ),
            rings = ringOrder.map { RingDefinition(id = it, label = it) },
            timeFrames = orderedTimeFrames,
            geoJson = createRingGeoJson(),
        )
    }

    private fun createRingGeoJson(): GeoJsonFeatureCollection {
        val kremlinLat = 55.7522
        val kremlinLon = 37.6175
        val ringBounds = linkedMapOf(
            "< 5 km" to (0.0 to 5.0),
            "5-10 km" to (5.0 to 10.0),
            "10-15 km" to (10.0 to 15.0),
            "15-20 km" to (15.0 to 20.0),
            "> 20 km" to (20.0 to 30.0),
        )

        fun circleCoords(radiusKm: Double, points: Int = 64): List<List<Double>> {
            return (0..points).map { step ->
                val angle = Math.toRadians(step * 360.0 / points)
                val dx = radiusKm * cos(angle) / (111.32 * cos(Math.toRadians(kremlinLat)))
                val dy = radiusKm * sin(angle) / 110.57
                listOf(kremlinLon + dx, kremlinLat + dy)
            }
        }

        val features = ringBounds.map { (ringId, bounds) ->
            val (innerRadius, outerRadius) = bounds
            val outerRing = circleCoords(outerRadius)
            val innerRing = if (innerRadius > 0.0) circleCoords(innerRadius).reversed() else emptyList()

            GeoJsonFeature(
                id = ringId,
                geometry = GeoJsonGeometry(
                    coordinates = if (innerRing.isEmpty()) {
                        listOf(outerRing)
                    } else {
                        listOf(outerRing, innerRing)
                    },
                ),
                properties = mapOf("name" to ringId),
            )
        }

        return GeoJsonFeatureCollection(features = features)
    }

    private fun parseCsvLine(line: String): List<String> {
        val values = mutableListOf<String>()
        val current = StringBuilder()
        var inQuotes = false
        var index = 0

        while (index < line.length) {
            val char = line[index]
            when {
                char == '"' -> {
                    val escapedQuote = inQuotes && index + 1 < line.length && line[index + 1] == '"'
                    if (escapedQuote) {
                        current.append('"')
                        index++
                    } else {
                        inQuotes = !inQuotes
                    }
                }

                char == ',' && !inQuotes -> {
                    values += current.toString()
                    current.clear()
                }

                else -> current.append(char)
            }
            index++
        }

        values += current.toString()
        return values
    }

    private fun requireIndex(indexMap: Map<String, Int>, field: String): Int {
        return checkNotNull(indexMap[field]) { "CSV column `$field` was not found" }
    }

    private fun roundTo(value: Double): Double = round(value * 10.0) / 10.0

    private data class TimeKey(
        val dayOfWeek: Int,
        val hour: Int,
    )

    private class AggregateBucket {
        var orderCount: Int = 0
            private set
        private var lateCount: Int = 0
        private var deliveryTimeSum: Double = 0.0

        fun add(isLate: Boolean, deliveryTime: Double) {
            orderCount += 1
            if (isLate) {
                lateCount += 1
            }
            deliveryTimeSum += deliveryTime
        }

        fun lateRatePercent(): Double = if (orderCount == 0) 0.0 else (lateCount.toDouble() / orderCount) * 100.0

        fun avgDeliveryTime(): Double = if (orderCount == 0) 0.0 else deliveryTimeSum / orderCount
    }
}
