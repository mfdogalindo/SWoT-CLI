import logging
from datetime import datetime
from typing import Optional, Any

from rdflib import Namespace

from config.settings import get_settings
from repositories.jena import get_repository
from scheduler.interfaces import TaskHandler
from services.rules import get_rules


class SemanticReasoner(TaskHandler):
    SOSA_NS = Namespace("http://www.w3.org/ns/sosa/")

    def __init__(self, logger: Optional[logging.Logger] = None):
        self.logger = logger or logging.getLogger(__name__)
        self.repository = get_repository(logger)
        self.config = get_settings()
        self.inference_ns = Namespace(f"{self.config.SWOT_URL_PREFIX}inference#")
        self.alert_ns = Namespace(f"{self.config.SWOT_URL_PREFIX}alert#")
        self.rules = get_rules(self.alert_ns, self.inference_ns)

    def execute(self, *args: Any, **kwargs: Any) -> None:
        """Execute the example task."""
        current_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        self.logger.info(f"Reasoning process start at: {current_time}")
        elapsed_time = datetime.now()
        try:

            # Ejecutar cada regla de inferencia
            for rule_query in self.rules:
                # Obtener nuevas inferencias
                new_inferences = self.repository.query_model(rule_query)

                if new_inferences and len(new_inferences) > 0:
                    # Almacenar las inferencias
                    self.repository.load_model(new_inferences)
                    self.logger.info(f"Generated {len(new_inferences)} new inferences")

            # Marcar observaciones como procesadas
            self._mark_observations_processed()

            elapsed_time = (datetime.now() - elapsed_time).total_seconds()
            self.logger.info(f"Reasoning process completed in {elapsed_time} seconds")

        except Exception as e:
            self.logger.error(f"Error executing reasoning process: {str(e)}")
            self.handle_error(e)

    def _mark_observations_processed(self) -> None:
        """Marca todas las observaciones no procesadas como procesadas."""
        mark_query = """
           PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
           PREFIX sosa: <http://www.w3.org/ns/sosa/>
           PREFIX inference: <%s>

           CONSTRUCT {
               ?obs inference:processed true .
           }
           WHERE {
               ?obs rdf:type sosa:Observation .
               FILTER NOT EXISTS { ?obs inference:processed true }
           }
           """ % self.inference_ns

        processed_marks = self.repository.query_model(mark_query)
        if processed_marks and len(processed_marks) > 0:
            self.repository.load_model(processed_marks)
            self.logger.info(f"Marked {len(processed_marks)} observations as processed")

    def handle_error(self, error: Exception) -> None:
        """Handle any errors in the example task."""
        self.logger.error(f"Task error: {str(error)}")
