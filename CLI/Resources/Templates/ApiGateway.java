package com.example.apigateway;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class ApiGateway {

    @GetMapping("/")
    public String hello() {
        return "Welcome to the SWoT API Gateway";
    }
}