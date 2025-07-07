import { useEffect, useRef } from 'react';
import NeoVis, { NonFlatNeovisConfig, NeoVisEvents } from 'neovis.js';

const VisualizeGraph = () => {
  const vizRef = useRef<NeoVis | null>(null);

  useEffect(() => {
    const config: NonFlatNeovisConfig = {
      containerId: 'viz',
      nonFlat: true,
      neo4j: {
        serverUrl: 'bolt://localhost:7687',
        serverUser: 'neo4j',
        serverPassword: 'rootroot',
      },
      labels: {
        Datacenter: {
          property: { label: 'name' },
          function: {
            title: (node: any) => {
              console.log('Datacenter node:', node);
              return node.properties.name || 'Unknown Datacenter';
            },
          },
        } as any,
        Cluster: {
          property: { label: 'name' },
          function: {
            title: (node: any) => {
              console.log('Cluster node:', node);
              return node.properties.name || 'Unknown Cluster';
            },
          },
        } as any,
        Server: {
          property: { label: 'name' },
          function: {
            title: (node: any) => {
              console.log('Server node:', node);
              return node.properties.name || 'Unknown Server';
            },
          },
        } as any,
        VM: {
          property: { label: 'name' },
          function: {
            title: (node: any) => {
              console.log('VM node:', node);
              return node.properties.name || 'Unknown VM';
            },
          },
        } as any,
        Datastore: {
          property: { label: 'Name' },
          function: {
            title: (node: any) => {
              console.log('Datastore node:', node);
              return node.properties.Name || 'Unknown Datastore';
            },
          },
        } as any,
        DVPort: {
          property: { label: 'Port' },
          function: {
            title: (node: any) => {
              console.log('DVPort node:', node);
              return node.properties.Port || 'Unknown DVPort';
            },
          },
        } as any,
        Network: {
          property: { label: 'name' },
          function: {
            title: (node: any) => {
              console.log('Network node:', node);
              return node.properties.name || 'Unknown Network';
            },
          },
        } as any,
        Switch: {
          property: { label: 'id' },
          function: {
            title: (node: any) => {
              console.log('Switch node:', node);
              return node.properties.id || 'Unknown Switch';
            },
          },
        } as any,
      },
      relationships: {
        CONTAINS: {
          width: 2,
          caption: true,
          function: {
            title: (edge: any) => {
              console.log('CONTAINS edge:', edge);
              return edge.type || 'CONTAINS';
            },
            id: (edge: any) => {
              // Prioritize rel_id from Cypher query
              if (edge.properties?.rel_id != null) {
                return edge.properties.rel_id;
              }
              // Fallback to identity, handling Neo4j integer or Infinity
              if (edge.identity && typeof edge.identity === 'object' && 'low' in edge.identity && 'high' in edge.identity) {
                return edge.identity.high === 0 ? edge.identity.low : `${edge.identity.high}${edge.identity.low}`;
              }
              if (edge.identity === Infinity) {
                console.warn('Infinity detected for edge ID, using custom_id as fallback:', edge);
                return edge.properties?.custom_id || `fallback-${Math.random()}`;
              }
              return edge.identity || edge.id || `fallback-${Math.random()}`;
            },
          },
        } as any,
        USES_DATASTORE: {
          width: 2,
          caption: true,
          function: {
            title: (edge: any) => {
              console.log('USES_DATASTORE edge:', edge);
              return edge.type || 'USES_DATASTORE';
            },
            id: (edge: any) => {
              if (edge.properties?.rel_id != null) {
                return edge.properties.rel_id;
              }
              if (edge.identity && typeof edge.identity === 'object' && 'low' in edge.identity && 'high' in edge.identity) {
                return edge.identity.high === 0 ? edge.identity.low : `${edge.identity.high}${edge.identity.low}`;
              }
              if (edge.identity === Infinity) {
                console.warn('Infinity detected for edge ID, using custom_id as fallback:', edge);
                return edge.properties?.custom_id || `fallback-${Math.random()}`;
              }
              return edge.identity || edge.id || `fallback-${Math.random()}`;
            },
          },
        } as any,
        HOSTS: {
          width: 2,
          caption: true,
          function: {
            title: (edge: any) => {
              console.log('HOSTS edge:', edge);
              return edge.type || 'HOSTS';
            },
            id: (edge: any) => {
              if (edge.properties?.rel_id != null) {
                return edge.properties.rel_id;
              }
              if (edge.identity && typeof edge.identity === 'object' && 'low' in edge.identity && 'high' in edge.identity) {
                return edge.identity.high === 0 ? edge.identity.low : `${edge.identity.high}${edge.identity.low}`;
              }
              if (edge.identity === Infinity) {
                console.warn('Infinity detected for edge ID, using custom_id as fallback:', edge);
                return edge.properties?.custom_id || `fallback-${Math.random()}`;
              }
              return edge.identity || edge.id || `fallback-${Math.random()}`;
            },
          },
        } as any,
        STORED_ON: {
          width: 2,
          caption: true,
          function: {
            title: (edge: any) => {
              console.log('STORED_ON edge:', edge);
              return edge.type || 'STORED_ON';
            },
            id: (edge: any) => {
              if (edge.properties?.rel_id != null) {
                return edge.properties.rel_id;
              }
              if (edge.identity && typeof edge.identity === 'object' && 'low' in edge.identity && 'high' in edge.identity) {
                return edge.identity.high === 0 ? edge.identity.low : `${edge.identity.high}${edge.identity.low}`;
              }
              if (edge.identity === Infinity) {
                console.warn('Infinity detected for edge ID, using custom_id as fallback:', edge);
                return edge.properties?.custom_id || `fallback-${Math.random()}`;
              }
              return edge.identity || edge.id || `fallback-${Math.random()}`;
            },
          },
        } as any,
        ACCESSES: {
          width: 2,
          caption: true,
          function: {
            title: (edge: any) => {
              console.log('ACCESSES edge:', edge);
              return edge.type || 'ACCESSES';
            },
            id: (edge: any) => {
              if (edge.properties?.rel_id != null) {
                return edge.properties.rel_id;
              }
              if (edge.identity && typeof edge.identity === 'object' && 'low' in edge.identity && 'high' in edge.identity) {
                return edge.identity.high === 0 ? edge.identity.low : `${edge.identity.high}${edge.identity.low}`;
              }
              if (edge.identity === Infinity) {
                console.warn('Infinity detected for edge ID, using custom_id as fallback:', edge);
                return edge.properties?.custom_id || `fallback-${Math.random()}`;
              }
              return edge.identity || edge.id || `fallback-${Math.random()}`;
            },
          },
        } as any,
        USES_DVPORT: {
          width: 2,
          caption: true,
          function: {
            title: (edge: any) => {
              console.log('USES_DVPORT edge:', edge);
              return edge.type || 'USES_DVPORT';
            },
            id: (edge: any) => {
              if (edge.properties?.rel_id != null) {
                return edge.properties.rel_id;
              }
              if (edge.identity && typeof edge.identity === 'object' && 'low' in edge.identity && 'high' in edge.identity) {
                return edge.identity.high === 0 ? edge.identity.low : `${edge.identity.high}${edge.identity.low}`;
              }
              if (edge.identity === Infinity) {
                console.warn('Infinity detected for edge ID, using custom_id as fallback:', edge);
                return edge.properties?.custom_id || `fallback-${Math.random()}`;
              }
              return edge.identity || edge.id || `fallback-${Math.random()}`;
            },
          },
        } as any,
        CONNECTS_TO: {
          width: 2,
          caption: true,
          function: {
            title: (edge: any) => {
              console.log('CONNECTS_TO edge:', edge);
              return edge.type || 'CONNECTS_TO';
            },
            id: (edge: any) => {
              if (edge.properties?.rel_id != null) {
                return edge.properties.rel_id;
              }
              if (edge.identity && typeof edge.identity === 'object' && 'low' in edge.identity && 'high' in edge.identity) {
                return edge.identity.high === 0 ? edge.identity.low : `${edge.identity.high}${edge.identity.low}`;
              }
              if (edge.identity === Infinity) {
                console.warn('Infinity detected for edge ID, using custom_id as fallback:', edge);
                return edge.properties?.custom_id || `fallback-${Math.random()}`;
              }
              return edge.identity || edge.id || `fallback-${Math.random()}`;
            },
          },
        } as any,
        MANAGES: {
          width: 2,
          caption: true,
          function: {
            title: (edge: any) => {
              console.log('MANAGES edge:', edge);
              return edge.type || 'MANAGES';
            },
            id: (edge: any) => {
              if (edge.properties?.rel_id != null) {
                return edge.properties.rel_id;
              }
              if (edge.identity && typeof edge.identity === 'object' && 'low' in edge.identity && 'high' in edge.identity) {
                return edge.identity.high === 0 ? edge.identity.low : `${edge.identity.high}${edge.identity.low}`;
              }
              if (edge.identity === Infinity) {
                console.warn('Infinity detected for edge ID, using custom_id as fallback:', edge);
                return edge.properties?.custom_id || `fallback-${Math.random()}`;
              }
              return edge.identity || edge.id || `fallback-${Math.random()}`;
            },
          },
        } as any,
        CONNECTED_TO: {
          width: 2,
          caption: true,
          function: {
            title: (edge: any) => {
              console.log('CONNECTED_TO edge:', edge);
              return edge.type || 'CONNECTED_TO';
            },
            id: (edge: any) => {
              if (edge.properties?.rel_id != null) {
                return edge.properties.rel_id;
              }
              if (edge.identity && typeof edge.identity === 'object' && 'low' in edge.identity && 'high' in edge.identity) {
                return edge.identity.high === 0 ? edge.identity.low : `${edge.identity.high}${edge.identity.low}`;
              }
              if (edge.identity === Infinity) {
                console.warn('Infinity detected for edge ID, using custom_id as fallback:', edge);
                return edge.properties?.custom_id || `fallback-${Math.random()}`;
              }
              return edge.identity || edge.id || `fallback-${Math.random()}`;
            },
          },
        } as any,
      },
      initialCypher: `
        MATCH (n)-[r]->(m)
        RETURN n, r, m, id(r) AS rel_id
      `,
      visConfig: {
        interaction: { hover: true },
        nodes: {
          shape: 'circle',
          font: {
            size: 14,
            color: '#343434',
            background: 'none',
            face: 'arial',
            strokeWidth: 2,
            strokeColor: '#ffffff',
            align: 'horizontal',
            multi: false,
            vadjust: 0,
          },
        },
        edges: {
          arrows: { to: { enabled: true, scaleFactor: 0.5 } },
          font: {
            size: 14,
            color: 'red',
            face: 'sans',
            background: 'white',
            strokeWidth: 3,
            align: 'middle',
          },
        },
        layout: { hierarchical: { enabled: false, sortMethod: 'directed' } },
        physics: {
          enabled: true,
          barnesHut: {
            gravitationalConstant: -2000,
            centralGravity: 0.3,
            springLength: 95,
            springConstant: 0.04,
          },
          stabilization: { enabled: true, iterations: 200, fit: true },
        },
        manipulation: { enabled: true, initiallyActive: true, addNode: false },
      },
    };

    const vizInstance = new NeoVis(config);

    // Log raw query results using CompletionEvent
    vizInstance.registerOnEvent(NeoVisEvents.CompletionEvent, (event: any) => {
      console.log('Raw query results:', event.recordCount, event);
      if (event.records) {
        event.records.forEach((record: any, index: number) => {
          const relationship = record.get('r');
          console.log(`Record ${index}:`, {
            node1: record.get('n'),
            relationship: relationship,
            node2: record.get('m'),
            rel_id: record.get('rel_id'),
            identity: relationship?.identity,
            identity_type: typeof relationship?.identity,
            identity_details: relationship?.identity,
          });
        });
      }
    });

    vizRef.current = vizInstance;
    vizInstance.render();

    vizInstance.network?.on('stabilizationIterationsDone', () => {
      console.log('Nodes:', vizInstance.nodes.length);
      console.log('Relationships:', vizInstance.edges.length);
      vizInstance.edges.forEach((edge: any) => {
        console.log(`Relationship: ${edge.label}`, edge);
      });
    });

    return () => {
      if (vizRef.current) {
        vizRef.current.clearNetwork();
      }
    };
  }, []);

  return (
    <div
      id="viz"
      style={{
        width: '100%',
        height: '600px',
        border: '1px solid #ddd',
        borderRadius: '4px',
      }}
    />
  );
};

export default VisualizeGraph;