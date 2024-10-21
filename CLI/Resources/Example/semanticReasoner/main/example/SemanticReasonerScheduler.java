package PackagePlaceHolder.example;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class SemanticReasonerScheduler {

    @Autowired
    SemanticReasoner semanticReasoner;

    @Scheduled(fixedRate = 3600000) // Ejecutar cada hora
    public void scheduleReasoning() {
        semanticReasoner.performReasoning();
    }
}