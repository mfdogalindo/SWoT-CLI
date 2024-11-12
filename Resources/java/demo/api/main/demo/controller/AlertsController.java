package PackagePlaceHolder.demo.controller;

import PackagePlaceHolder.demo.models.*;
import PackagePlaceHolder.demo.services.AlertsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/alerts")
public class AlertsController {


    @Autowired
    private AlertsService alertsService;

    @GetMapping("/temperature")
    public ResponseEntity<Page<SensorReadingAlert>> getTemperatureReadings(
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size) {
        return ResponseEntity.ok(alertsService.getTemperatureAlerts(page, size));
    }

    @GetMapping("/humidity")
    public ResponseEntity<Page<SensorReadingAlert>> getHumidityReadings(
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size) {
        return ResponseEntity.ok(alertsService.getHumidityAlerts(page, size));
    }

    @GetMapping("/noise")
    public ResponseEntity<Page<SensorReadingAlert>> getNoiseReadings(
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size) {
        return ResponseEntity.ok(alertsService.getNoiseAlerts(page, size));
    }

    @GetMapping("/air-quality")
    public ResponseEntity<Page<SensorReadingAlert>> getAirQualityReadings(
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size) {
        return ResponseEntity.ok(alertsService.getAirQualityAlerts(page, size));
    }

}