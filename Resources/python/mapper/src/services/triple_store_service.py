import base64
import logging
from typing import Protocol
from urllib.parse import urljoin

import requests
from config.settings import get_settings
from rdflib import Graph


class TripleStoreProtocol(Protocol):
    def save_model(self, model: Graph) -> None:
        ...

    def create_dataset(self) -> None:
        ...


class TripleStoreService:
    def __init__(self):
        self._settings = get_settings()
        self._initialized = False
        self.logger = logging.getLogger(__name__)
        self.logger.info("Triple store service initialized")

    def _get_auth_header(self) -> dict:
        credentials = f"{self._settings.TRIPLESTORE_USERNAME}:{self._settings.TRIPLESTORE_PASSWORD}"
        encoded = base64.b64encode(credentials.encode()).decode()
        return {"Authorization": f"Basic {encoded}"}

    def save_model(self, model: Graph) -> None:
        """Save RDF model to triple store."""
        if not self._initialized:
            self.create_dataset()

        url = urljoin(self._settings.TRIPLESTORE_URL, self._settings.TRIPLESTORE_DATASET)

        try:
            response = requests.post(
                url,
                data=model.serialize(format='turtle'),
                headers={
                    **self._get_auth_header(),
                    'Content-Type': 'text/turtle'
                }
            )
            response.raise_for_status()
        except requests.RequestException as e:
            raise RuntimeError(f"Error saving data to triplestore: {str(e)}")

    def create_dataset(self) -> None:
        """Create dataset in triple store if it doesn't exist."""
        if self._initialized:
            return

        try:
            url = urljoin(self._settings.TRIPLESTORE_URL, "$/datasets")
            response = requests.post(
                url,
                data={
                    "dbName": self._settings.TRIPLESTORE_DATASET,
                    "dbType": "tdb2"
                },
                headers=self._get_auth_header()
            )

            if response.status_code in (200, 201, 409):  # OK, Created, or Already Exists
                self._initialized = True
            else:
                raise RuntimeError(f"Failed to create dataset: {response.status_code}")

        except requests.RequestException as e:
            raise RuntimeError(f"Error creating dataset: {str(e)}")
