from functools import lru_cache
from typing import List, Union, Any


class RuleService:
    def __init__(self):
        self.inference_ns = None
        self.alert_ns = None
        self.rules = []

    def get_inference_rules(self, alert_ns: str = None, inference_ns: str = None) -> List[str]:
        self.alert_ns = alert_ns
        self.inference_ns = inference_ns
        """Define las reglas de inferencia usando SPARQL CONSTRUCT."""
        return [
            # Regla para temperatura alta
            """
            PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
            PREFIX sosa: <http://www.w3.org/ns/sosa/>
            PREFIX qudt: <http://qudt.org/schema/qudt#>
            PREFIX alert: <%s>
            PREFIX inference: <%s>

            CONSTRUCT {
                ?obs alert:hasAlert "HighTemperature" .
                ?obs alert:severity "High" .
                ?obs alert:message "Temperature exceeds 35°C" .
            }
            WHERE {
                ?obs rdf:type sosa:Observation ;
                     sosa:observedProperty sosa:Temperature ;
                     sosa:hasResult ?result .
                ?result qudt:numericValue ?value .
                FILTER (?value > 35.0)
                FILTER NOT EXISTS { ?obs inference:processed true }
            }
            """ % (self.alert_ns, self.inference_ns),

            # Regla para calidad del aire deficiente
            """
            PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
            PREFIX sosa: <http://www.w3.org/ns/sosa/>
            PREFIX qudt: <http://qudt.org/schema/qudt#>
            PREFIX alert: <%s>
            PREFIX inference: <%s>

            CONSTRUCT {
                ?obs alert:hasAlert "PoorAirQuality" .
                ?obs alert:severity "Critical" .
                ?obs alert:message "Air Quality Index exceeds 300" .
            }
            WHERE {
                ?obs rdf:type sosa:Observation ;
                     sosa:observedProperty sosa:AirQuality ;
                     sosa:hasResult ?result .
                ?result qudt:numericValue ?value .
                FILTER (?value > 300.0)
                FILTER NOT EXISTS { ?obs inference:processed true }
            }
            """ % (self.alert_ns, self.inference_ns),

            # Regla para nivel de ruido alto
            """
            PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
            PREFIX sosa: <http://www.w3.org/ns/sosa/>
            PREFIX qudt: <http://qudt.org/schema/qudt#>
            PREFIX alert: <%s>
            PREFIX inference: <%s>

            CONSTRUCT {
                ?obs alert:hasAlert "HighNoise" .
                ?obs alert:severity "Medium" .
                ?obs alert:message "Noise level exceeds 85dB" .
            }
            WHERE {
                ?obs rdf:type sosa:Observation ;
                     sosa:observedProperty sosa:NoiseLevel ;
                     sosa:hasResult ?result .
                ?result qudt:numericValue ?value .
                FILTER (?value > 85.0)
                FILTER NOT EXISTS { ?obs inference:processed true }
            }
            """ % (self.alert_ns, self.inference_ns),

            # Regla para humedad alta
            """
            PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
            PREFIX sosa: <http://www.w3.org/ns/sosa/>
            PREFIX qudt: <http://qudt.org/schema/qudt#>
            PREFIX alert: <%s>
            PREFIX inference: <%s>

            CONSTRUCT {
                ?obs alert:hasAlert "HighHumidity" .
                ?obs alert:severity "Medium" .
                ?obs alert:message "Humidity exceeds 80%%" .
            }
            WHERE {
                ?obs rdf:type sosa:Observation ;
                     sosa:observedProperty sosa:Humidity ;
                     sosa:hasResult ?result .
                ?result qudt:numericValue ?value .
                FILTER (?value > 80.0)
                FILTER NOT EXISTS { ?obs inference:processed true }
            }
            """ % (self.alert_ns, self.inference_ns)
        ]


ruleService = RuleService()


@lru_cache()
def get_rules(alert_ns, inference_ns) -> Union[list[str], list[Any]]:
    if not ruleService.rules:
        ruleService.rules = ruleService.get_inference_rules(alert_ns, inference_ns)
    return ruleService.rules
