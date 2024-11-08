package PackagePlaceHolder.demo;

import PackagePlaceHolder.demo.services.SemanticReasoner;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/reasoning")
public class SemanticReasonerController {

    @Autowired
    SemanticReasoner semanticReasoner;

    @PostMapping("/trigger")
    public ResponseEntity<String> triggerReasoning() {
        semanticReasoner.performReasoning();
        return ResponseEntity.ok("Reasoning process initiated");
    }
}
