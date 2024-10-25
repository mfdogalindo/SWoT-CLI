package PackagePlaceHolder.example;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class SemanticReasonerScheduler {

    @Autowired
    SemanticReasoner semanticReasoner;

    @Scheduled(initialDelay = 30000, fixedRate = 3600000) // Ejecutar cada hora con un retardo inicial de 30 segundos
    public void scheduleReasoning() {
        semanticReasoner.performReasoning();
    }
}