package PackagePlaceHolder.demo.controller;

import PackagePlaceHolder.demo.models.*;
import PackagePlaceHolder.demo.services.SensorReadingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/enviroment")
public class EnvironmentalController {


    @Autowired
    private SensorReadingService readingService;

    @GetMapping("/temperature")
    public ResponseEntity<Page<SensorReading>> getTemperatureReadings(
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size) {
        return ResponseEntity.ok(readingService.getTemperatureReadings(page, size));
    }

    @GetMapping("/humidity")
    public ResponseEntity<Page<SensorReading>> getHumidityReadings(
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size) {
        return ResponseEntity.ok(readingService.getHumidityReadings(page, size));
    }

    @GetMapping("/noise")
    public ResponseEntity<Page<SensorReading>> getNoiseReadings(
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size) {
        return ResponseEntity.ok(readingService.getNoiseReadings(page, size));
    }

    @GetMapping("/air-quality")
    public ResponseEntity<Page<SensorReading>> getAirQualityReadings(
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size) {
        return ResponseEntity.ok(readingService.getAirQualityReadings(page, size));
    }

}
