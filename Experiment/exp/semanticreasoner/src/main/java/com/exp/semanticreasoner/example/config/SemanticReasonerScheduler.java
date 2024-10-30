package com.exp.semanticreasoner.example.config;

import com.exp.semanticreasoner.example.services.SemanticReasoner;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class SemanticReasonerScheduler {

    @Autowired
    SemanticReasoner semanticReasoner;

    @Scheduled(initialDelay = 2000, fixedRate = 60000) // Ejecutar cada minuto con un retardo inicial de 2 segundos
    public void scheduleReasoning() {
        semanticReasoner.performReasoning();
    }
}