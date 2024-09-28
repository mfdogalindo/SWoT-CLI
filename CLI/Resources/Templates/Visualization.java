package com.example.visualization;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class Visualization {

    @GetMapping("/visualize")
    public String visualize() {
        return "SWoT Visualization Service";
    }
}