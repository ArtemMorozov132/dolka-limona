package com.magnit.dashboard.controller

import com.magnit.dashboard.model.DashboardResponse
import com.magnit.dashboard.service.StatsService
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/stats")
class StatsController(
    private val statsService: StatsService,
) {
    @GetMapping("/overview")
    fun getOverview(): DashboardResponse = statsService.getDashboard()
}
