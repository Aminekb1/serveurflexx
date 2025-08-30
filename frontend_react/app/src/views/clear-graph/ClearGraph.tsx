// src/views/clear-graph/ClearGraph.tsx
/* import React, { useState } from 'react';
import { useEffect } from "react";
import axios from 'axios';
import Neo4jConnectionForm from '../../components/connection/Neo4jConnectionForm';
import { logActivity, setStartTime, clearStartTime } from "../../utils/theme/activityLogger";

const ClearGraph: React.FC = () => {
  useEffect(() => {
    setStartTime();
    logActivity("VIEW_CLEAR_GRAPH", "GraphOperations");

    return () => {
      logActivity("LEAVE_CLEAR_GRAPH", "GraphOperations");
      clearStartTime();
    };
  }, []);
  const [neo4jCredentials, setNeo4jCredentials] = useState<{
    uri: string;
    database: string;
    user: string;
    password: string;
  } | null>(null);
  const [isClearing, setIsClearing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleNeo4jConnect = (credentials: {
    uri: string;
    database: string;
    user: string;
    password: string;
  }) => {
    setNeo4jCredentials(credentials);
    setError(null);
    setSuccess(null);
  };

  const handleClearGraph = async () => {
    if (!neo4jCredentials) {
      setError('Please connect to Neo4j first.');
      return;
    }

    if (!window.confirm('Are you sure you want to clear the graph? This will delete all nodes and relationships.')) {
      return;
    }

    setIsClearing(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await axios.post('http://localhost:8000/clear-graph/', {}, {
        headers: {
          'neo4j-uri': neo4jCredentials.uri,
          'neo4j-database': neo4jCredentials.database,
          'neo4j-user': neo4jCredentials.user,
          'neo4j-password': neo4jCredentials.password,
          Authorization: `Bearer ${localStorage.getItem('token')}`, // Ajouter le token d'authentification
        },
      });
      setSuccess(response.data.message);
    } catch (error: any) {
      console.error('Error clearing graph:', error);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
        setError(error.response.data.detail || 'Failed to clear graph.');
      } else if (error.request) {
        console.error('No response received:', error.request);
        setError('Failed to clear graph: No response from server.');
      } else {
        console.error('Error setting up request:', error.message);
        setError(`Failed to clear graph: ${error.message}`);
      }
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <div className="p-6">
      <h3 className="text-lg font-semibold mb-4">Clear Graph</h3>

      {/* Formulaire de connexion Neo4j */
      {/* <Neo4jConnectionForm onConnect={handleNeo4jConnect} /> */}

      {/* Bouton pour supprimer le graphe */}
      {/* <div className="bg-white dark:bg-dark p-6 rounded-lg shadow-md">
        <h4 className="text-md font-medium mb-4">Clear Graph in Neo4j</h4>
        <p className="text-sm text-gray-600 mb-4">
          This action will delete all nodes and relationships in the Neo4j database. Proceed with caution.
        </p>
        <button
          onClick={handleClearGraph}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 disabled:bg-red-300"
          disabled={isClearing || !neo4jCredentials}
        >
          {isClearing ? 'Clearing...' : 'Clear Graph'}
        </button>
        {error && <p className="text-red-500 mt-2">{error}</p>}
        {success && <p className="text-green-500 mt-2">{success}</p>}
      </div>
    </div>
  );
};

export default ClearGraph; */}