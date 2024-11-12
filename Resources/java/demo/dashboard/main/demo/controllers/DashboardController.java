package PackagePlaceHolder.demo.controllers;

import PackagePlaceHolder.demo.enums.SensorType;
import PackagePlaceHolder.demo.services.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;


@Controller
@RequiredArgsConstructor
public class DashboardController {

    @Autowired
    private DashboardService dashboardService;

    @GetMapping("/")
    public String dashboard(Model model) {
        // Lecturas recientes
        for (SensorType type : SensorType.values()) {
            model.addAttribute(
                    type.getAlias() + "Readings",
                    dashboardService.getSensorReadings(type, 0, 10)
            );

            model.addAttribute(
                    type.getAlias() + "Alerts",
                    dashboardService.getSensorAlerts(type, 0, 5)
            );
        }

        return "dashboard";
    }

    @GetMapping("/sensors")
    public String sensors(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Model model) {
        model.addAttribute("sensors", dashboardService.getAllSensors(page, size));
        model.addAttribute("sensorTypes", SensorType.values());
        return "sensors";
    }

    @GetMapping("/sensor/{sensorId}")
    public String sensorDetail(@PathVariable String sensorId, Model model) {
        model.addAttribute("sensor", dashboardService.getSensorById(sensorId));
        model.addAttribute("sensorTypes", SensorType.values());

        // Obtener últimas lecturas para cada tipo de sensor
        for (SensorType type : SensorType.values()) {
            model.addAttribute(
                    type.getEndpoint() + "Readings",
                    dashboardService.getSensorReadings(type, 0, 5)
            );
        }

        return "sensor-detail";
    }
}
