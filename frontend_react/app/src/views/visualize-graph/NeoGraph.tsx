import { useEffect, useRef } from "react";
import PropTypes from "prop-types";
import Neovis, { NonFlatNeovisConfig } from "neovis.js";
import useResizeObserver from "./useResizeObserver";

// Define props interface for NeoGraph
interface NeoGraphProps {
  width?: number;
  height?: number;
  containerId: string;
  backgroundColor?: string;
  neo4jUri: string;
  neo4jUser: string;
  neo4jPassword: string;
}

// Define props interface for ResponsiveNeoGraph
interface ResponsiveNeoGraphProps {
  containerId: string;
  backgroundColor?: string;
  neo4jUri: string;
  neo4jUser: string;
  neo4jPassword: string;
}

const NeoGraph: React.FC<NeoGraphProps> = ({
  width = 600,
  height = 600,
  containerId,
  backgroundColor = "#d3d3d3",
  neo4jUri,
  neo4jUser,
  neo4jPassword,
}) => {
  const visRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const config = {
      containerId: visRef.current?.id,
      nonFlat: true, // Explicitly set to true
      neo4j: {
        serverUrl: neo4jUri,
        serverUser: neo4jUser,
        serverPassword: neo4jPassword,
      },
      labels: {
        Datacenter: { label: "name", size: "3.0" },
        Cluster: { label: "name", size: "2.5" },
        Server: { label: "name", size: "2.0" },
        VM: { label: "name", size: "1.5" },
        Datastore: { label: "Name", size: "1.5" },
        DVPort: { label: "Port", size: "1.2" },
        Network: { label: "name", size: "1.2" },
        Switch: { label: "id", size: "2.0" },
      },
      relationships: {
        CONTAINS: { label: "CONTAINS" },
        USES_DATASTORE: { label: "USES_DATASTORE" },
        HOSTS: { label: "HOSTS" },
        STORED_ON: { label: "STORED_ON" },
        ACCESSES: { label: "ACCESSES" },
        USES_DVPORT: { label: "USES_DVPORT" },
        CONNECTS_TO: { label: "CONNECTS_TO" },
        MANAGES: { label: "MANAGES" },
        CONNECTED_TO: { label: "CONNECTED_TO" },
      },
      initialCypher: `
        MATCH (n)-[r]->(m)
        WHERE type(r) IN [
          'CONTAINS',
          'USES_DATASTORE',
          'HOSTS',
          'STORED_ON',
          'ACCESSES',
          'USES_DVPORT',
          'CONNECTS_TO',
          'MANAGES',
          'CONNECTED_TO'
        ]
        RETURN n, r, m
      `,
      visConfig: {
        edges: {
          arrows: {
            to: { enabled: true },
          },
        },
        physics: {
          enabled: true,
          barnesHut: {
            gravitationalConstant: -2000,
            centralGravity: 0.3,
            springLength: 95,
            springConstant: 0.04,
          },
        },
      },
    };

    const vis = new Neovis(config as NonFlatNeovisConfig);    vis.render();

    // Log nodes and edges after rendering
    setTimeout(() => {
      console.log("Nodes:", vis.nodes);
      console.log("Edges:", vis.edges);
    }, 2000);

    return () => {
      vis.clearNetwork();
    };
  }, [neo4jUri, neo4jUser, neo4jPassword]);

  return (
    <div
      id={containerId}
      ref={visRef}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        backgroundColor: backgroundColor,
      }}
    />
  );
};

NeoGraph.propTypes = {
  width: PropTypes.number,
  height: PropTypes.number,
  containerId: PropTypes.string.isRequired,
  backgroundColor: PropTypes.string,
  neo4jUri: PropTypes.string.isRequired,
  neo4jUser: PropTypes.string.isRequired,
  neo4jPassword: PropTypes.string.isRequired,
};

const ResponsiveNeoGraph: React.FC<ResponsiveNeoGraphProps> = ({
  containerId,
  backgroundColor = "#d3d3d3",
  neo4jUri,
  neo4jUser,
  neo4jPassword,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const dimensions = useResizeObserver(containerRef);

  const side = Math.max(dimensions.width || 600, dimensions.height || 600) / 2;
  const neoGraphProps = {
    width: side,
    height: side,
    containerId,
    backgroundColor,
    neo4jUri,
    neo4jUser,
    neo4jPassword,
  };

  return (
    <div
      ref={containerRef}
      style={{ position: "relative", width: "100%", height: "600px" }}
    >
      <NeoGraph {...neoGraphProps} />
    </div>
  );
};

ResponsiveNeoGraph.propTypes = {
  containerId: PropTypes.string.isRequired,
  backgroundColor: PropTypes.string,
  neo4jUri: PropTypes.string.isRequired,
  neo4jUser: PropTypes.string.isRequired,
  neo4jPassword: PropTypes.string.isRequired,
};

export { NeoGraph, ResponsiveNeoGraph };