package com.example.visualization;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class Visualization {

    @GetMapping("/visualize")
    public String visualize() {
        return "SWoT Visualization Service";
    }
}