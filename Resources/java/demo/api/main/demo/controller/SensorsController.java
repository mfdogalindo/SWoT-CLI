package PackagePlaceHolder.demo.controller;

import PackagePlaceHolder.demo.models.Page;
import PackagePlaceHolder.demo.models.PageRequest;
import PackagePlaceHolder.demo.models.SensorDetail;
import PackagePlaceHolder.demo.services.SensorsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/sensor")
public class SensorsController {

    @Autowired
    private SensorsService sensorsService;

    @GetMapping("/{sensorId}")
    public ResponseEntity<SensorDetail> getSensorById(
            @PathVariable String sensorId) {
        return ResponseEntity.ok(sensorsService.getSensorById(sensorId));
    }

    @GetMapping
    public ResponseEntity<Page<SensorDetail>> getAllSensors(
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size) {
        return ResponseEntity.ok(
                sensorsService.getAllSensors(PageRequest.of(page, size))
        );
    }

}
