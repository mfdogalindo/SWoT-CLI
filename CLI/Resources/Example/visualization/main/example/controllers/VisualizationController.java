package PackagePlaceHolder.example.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import PackagePlaceHolder.example.models.DashboardResponse;
import PackagePlaceHolder.example.services.DataService;

@Controller
@RequestMapping("/dashboard")
public class VisualizationController {

    @Autowired
    DataService dataService;

    @GetMapping
    public String showDashboard(Model model) {
        DashboardResponse dashboard = dataService.getDashboardData();
        model.addAttribute("dashboard", dashboard);
        return "dashboard";
    }

    @GetMapping("/data")
    @ResponseBody
    public DashboardResponse getDashboardData() {
        return dataService.getDashboardData();
    }
}