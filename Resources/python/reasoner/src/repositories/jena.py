import logging
from functools import lru_cache
from typing import Optional, Dict, Any

import requests
from rdflib import Graph, URIRef, Literal, BNode

from config.settings import get_settings


class JenaRepository:
    def __init__(self, logger: Optional[logging.Logger] = None):
        self.config = get_settings()
        self.logger = logger or logging.getLogger(__name__)
        self.base_url = f"{self.config.TRIPLESTORE_URL}/{self.config.TRIPLESTORE_DATASET}"
        self.sparql_url = f"{self.base_url}/sparql"
        self.update_url = f"{self.base_url}/update"
        self.data_url = f"{self.base_url}/data"
        self.session = requests.Session()
        self.session.auth = (self.config.TRIPLESTORE_USERNAME, self.config.TRIPLESTORE_PASSWORD)

    def query_model(self, query: str) -> Optional[Graph]:
        """
        Ejecuta una consulta SPARQL CONSTRUCT y devuelve un modelo RDF (Graph).
        """
        try:
            response = self.session.post(
                self.sparql_url,
                data=query,
                headers={'Content-Type': 'application/sparql-query', 'Accept': 'application/n-triples'}
            )
            response.raise_for_status()

            graph = Graph()

            graph.parse(data=response.text, format='nt')
            return graph

        except requests.exceptions.RequestException as e:
            self.logger.error(f"Error querying triplestore: {e}")
            return None
        except Exception as e:
            self.logger.error(f"Error parsing RDF data: {e}")
            return None

    def load_model(self, graph: Graph) -> bool:
        """
        Carga un modelo RDF (Graph) al triplestore.
        """
        try:
            # Serializar como N-Triples que es más robusto
            rdf_data = graph.serialize(format='nt')
            response = self.session.post(
                self.data_url,
                data=rdf_data,
                headers={'Content-Type': 'application/n-triples'}
            )
            response.raise_for_status()
            self.logger.info("Model loaded successfully")
            return True

        except requests.exceptions.RequestException as e:
            self.logger.error(f"Error loading model into triplestore: {e}")
            return False
        except Exception as e:
            self.logger.error(f"Error serializing RDF data: {e}")
            return False

    def query_result_set(self, query: str) -> list[Dict[str, Any]]:
        """
        Ejecuta una consulta SPARQL SELECT y devuelve una lista de soluciones (bindings).
        """
        try:
            response = self.session.post(
                self.sparql_url,
                data=query,
                headers={'Content-Type': 'application/sparql-query', 'Accept': 'application/sparql-results+json'}
            )
            response.raise_for_status()

            results = response.json()
            solutions = []

            for binding in results['results']['bindings']:
                processed_binding = {}
                for var, value in binding.items():
                    processed_binding[var] = self._process_sparql_value(value)
                solutions.append(processed_binding)

            return solutions

        except requests.exceptions.RequestException as e:
            self.logger.error(f"Error querying triplestore: {e}")
            return []
        except Exception as e:
            self.logger.error(f"Error processing SPARQL results: {e}")
            return []

    def _process_sparql_value(self, value: Dict[str, str]) -> Any:
        """
        Convierte valores SPARQL a tipos Python/RDFLib apropiados.
        """
        try:
            if value['type'] == 'uri':
                return URIRef(value['value'])
            elif value['type'] == 'literal':
                datatype = value.get('datatype')
                if datatype:
                    return Literal(value['value'], datatype=URIRef(datatype))
                lang = value.get('xml:lang')
                if lang:
                    return Literal(value['value'], lang=lang)
                return Literal(value['value'])
            elif value['type'] == 'bnode':
                return BNode(value['value'])
            else:
                return value['value']

        except Exception as e:
            self.logger.error(f"Error processing SPARQL value: {e}")
            return None

    def test_connection(self):
        """
        Verifica si la conexión al triplestore es válida.
        """
        ask_query = "ASK {}"
        try:
            response = self.session.post(
                self.sparql_url,
                data=ask_query,
                headers={'Content-Type': 'application/sparql-query'}
            )
            response.raise_for_status()
            return response.json().get("boolean", False)
        except requests.exceptions.RequestException as e:
            self.logger.error(f"Error testing connection to triplestore: {e}")
            return False


@lru_cache()
def get_repository(logger: Optional[logging.Logger] = None) -> JenaRepository:
    """
    Retorna una instancia cacheada del repositorio Jena.
    El decorador lru_cache asegura que solo se crea una instancia.
    """
    return JenaRepository(logger)
