package com.exp.semanticmapper.example.service;


import java.io.IOException;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.Base64;

import org.apache.jena.atlas.web.HttpException;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdfconnection.RDFConnection;
import org.apache.jena.rdfconnection.RDFConnectionFuseki;
import org.apache.jena.web.HttpSC;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class TripleStoreService {

  @Value("${TRIPLESTORE_URL:http://localhost:3030}")
  private String triplestoreEndpoint;

  @Value("${TRIPLESTORE_DATASET:swot}")
  private String triplestoreDataset;

  @Value("${TRIPLESTORE_USERNAME}")
  private String triplestoreUsername;

  @Value("${TRIPLESTORE_PASSWORD}")
  private String triplestorePassword;

  private boolean initialized = false;

  public void saveModel(Model model) throws IOException {
    String url = triplestoreEndpoint + "/" + triplestoreDataset;
    createDataset();
    try (RDFConnection conn =
        RDFConnection.connectPW(url, triplestoreUsername, triplestorePassword)) {
      conn.load(model);
    } catch (Exception e) {
      System.out.println("MODEL: " + model.toString());
      throw new RuntimeException("Error saving data to triplestore", e);
    }
  }

  private void createDataset() throws IOException {
    if (initialized) {
      return;
    }

      // Crea una conexión RDF a Fuseki para gestionar el dataset
    RDFConnection connection =
        RDFConnectionFuseki.create().destination(triplestoreEndpoint).build();

    try {
      // Envía solicitud POST para crear el dataset
      String postUrl = triplestoreEndpoint + "/$/datasets";
      String datasetParams = "dbName=" + triplestoreDataset + "&dbType=tdb2";
      HttpURLConnection postConnection = (HttpURLConnection) new URL(postUrl).openConnection();
      postConnection.setRequestMethod("POST");
      postConnection.setDoOutput(true);
      setAuthHeader(postConnection, triplestoreUsername, triplestorePassword);
      postConnection.getOutputStream().write(datasetParams.getBytes());

      int responseCode = postConnection.getResponseCode();
      if (responseCode == HttpSC.OK_200 || responseCode == HttpSC.CREATED_201 || responseCode == HttpSC.CONFLICT_409) {
        System.out.println("Dataset creado exitosamente.");
        initialized = true;
      } else {
        throw new HttpException("Error al crear el dataset: " + responseCode);
      }
    } finally {
      connection.close();
    }
  }

  private static void setAuthHeader(HttpURLConnection connection, String username, String password) {
    String auth = username + ":" + password;
    String encodedAuth = Base64.getEncoder().encodeToString(auth.getBytes());
    String authHeader = "Basic " + encodedAuth;
    connection.setRequestProperty("Authorization", authHeader);
  }
}