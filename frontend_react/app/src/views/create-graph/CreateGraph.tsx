/* import React, { useState, useEffect } from 'react';
import axios from 'axios';
//import Neo4jConnectionForm from '../../components/connection/Neo4jConnectionForm';
import { logActivity, setStartTime, clearStartTime } from "../../utils/theme/activityLogger";

interface Node {
  [key: string]: any;
}

const CreateGraph: React.FC = () => {
  useEffect(() => {
    setStartTime();
    logActivity("VIEW_CREATE_GRAPH", "GraphOperations");

    return () => {
      logActivity("LEAVE_CREATE_GRAPH", "GraphOperations");
      clearStartTime();
    };
  }, []);
  const [files, setFiles] = useState<{
    datacenters: File | null;
    clusters: File | null;
    servers: File | null;
    vms: File | null;
    datastores: File | null;
    dvports: File | null;
    networks: File | null;
    switches: File | null;
  }>({
    datacenters: null,
    clusters: null,
    servers: null,
    vms: null,
    datastores: null,
    dvports: null,
    networks: null,
    switches: null,
  });

  const [nodeType, setNodeType] = useState<string>('Datacenter');
  const [nodes, setNodes] = useState<Node[]>([]);
  const [activeTab, setActiveTab] = useState<'csv' | 'api'>('csv');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [neo4jCredentials, setNeo4jCredentials] = useState<{
    uri: string;
    database: string;
    user: string;
    password: string;
  } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      setFiles((prev) => ({ ...prev, [key]: selectedFiles[0] }));
    }
  };

  const handleUpload = async () => {
    if (!neo4jCredentials) {
      setError('Veuillez d\'abord vous connecter à Neo4j.');
      return;
    }

    setIsUploading(true);
    setError(null);
    if (Object.values(files).every((file) => file !== null)) {
      const formData = new FormData();
      Object.entries(files).forEach(([key, file]) => {
        if (file) {
          formData.append(key, file);
        }
      });

      try {
        const response = await axios.post('http://localhost:8000/upload-csv/', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'neo4j-uri': neo4jCredentials.uri,
            'neo4j-database': neo4jCredentials.database,
            'neo4j-user': neo4jCredentials.user,
            'neo4j-password': neo4jCredentials.password,
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        alert(response.data.message);
        fetchNodes();
      } catch (error: any) {
        console.error('Erreur lors de l\'upload des fichiers:', error);
        if (error.response) {
          setError(error.response.data.detail || 'Échec de l\'upload des fichiers.');
        } else if (error.request) {
          setError('Échec de l\'upload des fichiers : Pas de réponse du serveur.');
        } else {
          setError(`Échec de l\'upload des fichiers : ${error.message}`);
        }
      } finally {
        setIsUploading(false);
      }
    } else {
      setError('Veuillez uploader tous les fichiers CSV requis.');
      setIsUploading(false);
    }
  };

  const handleFetchFromApi = async () => {
    if (!neo4jCredentials) {
      setError('Veuillez d\'abord vous connecter à Neo4j.');
      return;
    }

    setIsFetching(true);
    setError(null);
    try {
      const response = await axios.post('http://localhost:8000/fetch-and-create-graph/', {}, {
        headers: {
          'neo4j-uri': neo4jCredentials.uri,
          'neo4j-database': neo4jCredentials.database,
          'neo4j-user': neo4jCredentials.user,
          'neo4j-password': neo4jCredentials.password,
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      alert(response.data.message);
      fetchNodes();
    } catch (error: any) {
      console.error('Erreur lors de la récupération via API:', error);
      if (error.response) {
        setError(error.response.data.detail || 'Échec de la création du graphe via API.');
      } else if (error.request) {
        setError('Échec de la création du graphe : Pas de réponse du serveur.');
      } else {
        setError(`Échec de la création du graphe : ${error.message}`);
      }
    } finally {
      setIsFetching(false);
    }
  };

  const fetchNodes = async () => {
    if (!neo4jCredentials) {
      setError('Veuillez d\'abord vous connecter à Neo4j.');
      return;
    }

    try {
      const response = await axios.get(`http://localhost:8000/list-nodes/${nodeType}`, {
        headers: {
          'neo4j-uri': neo4jCredentials.uri,
          'neo4j-database': neo4jCredentials.database,
          'neo4j-user': neo4jCredentials.user,
          'neo4j-password': neo4jCredentials.password,
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setNodes(response.data.nodes || []);
    } catch (error: any) {
      console.error('Erreur lors de la récupération des nœuds:', error);
      if (error.response) {
        setError(error.response.data.detail || 'Échec de la récupération des nœuds.');
      } else if (error.request) {
        setError('Échec de la récupération des nœuds : Pas de réponse du serveur.');
      } else {
        setError(`Échec de la récupération des nœuds : ${error.message}`);
      }
      setNodes([]);
    }
  };

  const handleNeo4jConnect = (credentials: {
    uri: string;
    database: string;
    user: string;
    password: string;
  }) => {
    setNeo4jCredentials(credentials);
    fetchNodes();
  };

  useEffect(() => {
    if (neo4jCredentials) {
      fetchNodes();
    }
  }, [nodeType, neo4jCredentials]);

  return (
    <div className="p-6">
      <h3 className="text-lg font-semibold mb-4">Créer un graphe</h3>

      <Neo4jConnectionForm onConnect={handleNeo4jConnect} />

      <div className="bg-white dark:bg-dark p-6 rounded-lg shadow-md mb-6">
        <h4 className="text-md font-medium mb-4">Charger des données</h4>
        <div className="flex mb-4">
          <button
            className={`px-4 py-2 ${activeTab === 'csv' ? 'bg-primary text-white' : 'bg-gray-200'}`}
            onClick={() => setActiveTab('csv')}
          >
            Via CSV
          </button>
          <button
            className={`px-4 py-2 ${activeTab === 'api' ? 'bg-primary text-white' : 'bg-gray-200'}`}
            onClick={() => setActiveTab('api')}
          >
            Via API
          </button>
        </div>

        {activeTab === 'csv' && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.keys(files).map((key) => (
                <div key={key}>
                  <label className="block text-sm font-medium mb-1">
                    Charger le fichier CSV pour {key.charAt(0).toUpperCase() + key.slice(1)}
                  </label>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={(e) => handleFileChange(e, key)}
                    className="w-full p-2 border rounded"
                  />
                </div>
              ))}
            </div>
            <button
              onClick={handleUpload}
              className="mt-4 bg-primary text-white px-4 py-2 rounded hover:bg-primary-emphasis"
              disabled={isUploading || !neo4jCredentials}
            >
              {isUploading ? 'Chargement...' : 'Charger les fichiers CSV'}
            </button>
          </div>
        )}

        {activeTab === 'api' && (
          <div>
            <button
              onClick={handleFetchFromApi}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              disabled={isFetching || !neo4jCredentials}
            >
              {isFetching ? 'Récupération...' : 'Créer le graphe via API'}
            </button>
          </div>
        )}

        {error && <p className="text-red-500 mt-2">{error}</p>}
      </div>

      <div className="bg-white dark:bg-dark p-6 rounded-lg shadow-md">
        <h4 className="text-md font-medium mb-4">Lister les nœuds</h4>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Sélectionner le type de nœud</label>
          <select
            value={nodeType}
            onChange={(e) => setNodeType(e.target.value)}
            className="w-full p-2 border rounded"
          >
            {['Datacenter', 'Cluster', 'Server', 'VM', 'Datastore', 'DVPort', 'Network', 'Switch'].map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
        {nodes.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  {Object.keys(nodes[0]).map((key) => (
                    <th key={key} className="text-left p-2">
                      {key}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {nodes.map((node, index) => (
                  <tr key={index}>
                    {Object.values(node).map((value, idx) => (
                      <td key={idx} className="p-2">
                        {value?.toString() || '-'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>Aucun nœud trouvé pour ce type.</p>
        )}
      </div>
    </div>
  );
};

export default CreateGraph; */