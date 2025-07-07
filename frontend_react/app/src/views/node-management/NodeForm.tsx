import { Label, TextInput, Select, Button, Modal } from "flowbite-react";
import { useState, useEffect } from "react";
import axios from "axios";
import { FaEdit, FaTrash } from "react-icons/fa";
import { logActivity, setStartTime, clearStartTime } from "../../utils/theme/activityLogger";

const NodeForm = () => {
  const [nodeType, setNodeType] = useState<string>("");
  const [properties, setProperties] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [nodes, setNodes] = useState<any[]>([]);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [relatedNodes, setRelatedNodes] = useState<Record<string, any[]>>({});

  const nodeTypes = [
    "Datacenter",
    "Cluster",
    "Server",
    "VM",
    "Datastore",
    "DVPort",
    "Network",
    "Switch",
  ];
useEffect(() => {
    setStartTime();
    logActivity("VIEW_NODE_FORM", "NodeManagement");

    return () => {
      logActivity("LEAVE_NODE_FORM", "NodeManagement");
      clearStartTime();
    };
  }, []);
  const relationFields: Record<string, { field: string; relatedType: string }[]> = {
    Server: [
      { field: "Datacenter", relatedType: "Datacenter" },
       { field: "cluster", relatedType: "Cluster" },
      { field: "datastores", relatedType: "Datastore" },
      { field: "Cluster", relatedType: "Cluster" },
       { field: "VMs", relatedType: "VM" },
    ],
    VM: [
      { field: "server", relatedType: "Server" },
      { field: "datastore", relatedType: "Datastore" },
      { field: "Cluster", relatedType: "Cluster" },
      { field: "Datacenter", relatedType: "Datacenter" },
    ],
    Cluster: [{ field: "datacenter", relatedType: "Datacenter" }],
    Datastore: [{ field: "cluster_name", relatedType: "Cluster" }],
    DVPort: [
      { field: "server", relatedType: "Server" },
      { field: "network", relatedType: "Network" },
    ],
  };

 // Define required fields for each node type
  const requiredFields: Record<string, string[]> = {
    Datacenter: [ "id","name", "place", "label"],
    Cluster: [
      "name",
      "datacenter",
      "config",
      "status",
      "OverallStatus",
      "NumHosts",
      "TotalCpu",
      "NumCpuCores",
      "EffectiveCpu",
      "TotalMemory",
      "EffectiveMemory",
      "HAenabled",
      "AdmissionControlEnabled",
      "Hostmonitoring",
      "IsolationResponse",
      "RestartPriority",
      "ClusterSettings",
      "FailureInterval",
      "MinUpTime",
      "VMMonitoring",
    ],
    Server: [
      "name",
      "cluster",
      "Host",
      "Datacenter",
      "Cluster",
      "Configstatus",
      "MaintenanceMode",
      "QuarantineMode",
      "CPUModel",
      "Speed",
      "HTAvailable",
      "CoresperCPU",
      "Cores",
      "CPUusage",
      "Memory",
      "Memoryusage",
      "NICs",
      "HBAs",
      "VMstotal",
      "VMs",
      "VMsperCore",
      "vCPUs",
      "vCPUsperCore",
      "vRAM",
      "VMUsedmemory",
      "ESXVersion",
      "DNSServers",
      "DHCP",
      "Domain",
      "DNSSearchOrder",
      "NTPServer",
      "ObjectID",
      "UUID",
      "VISDKServer",
      "VISDKUUID",
      "datastores",
    ],
    VM: [
      
      "name",
      "server",
      "DNSName",
      "Powerstate",
      "OSaccordingtotheconfigurationfile",
      "Disks",
      "NICs",
      "CPUs",
      "Memory",
      "TotaldiskcapacityMiB",
      "PrimaryIPAddress",
      "Network1",
      "Datacenter",
      "Cluster",
      "Host",
      "VMID",
      "VISDKServertypee",
      "VISDKAPIVersion",
      "VISDKServer",
      "datastore",
    ],
    Datastore: [
      
      "Name",
      "cluster_name",
      "In_Use_MiB",
      "Free_MiB",
      "Free_Percent",
      "SIOC_enabled",
      "SIOC_Threshold",
      "Num_Hosts",
      "Cluster_capacity_MiB",
      "Cluster_free_space_MiB",
      "Block_size",
      "Max_Blocks",
      "Num_Extents",
      "Major_Version",
      "Version",
      "VMFS_Upgradeable",
      "MHA",
      "URL",
      "Object_ID",
      "VI_SDK_Server",
      "VI_SDK_UUID",
    ],
    DVPort: [
      
      "Port",
      "server",
      "switch",
      "Switch",
      "Type",
      "Num_Ports",
      "VLAN",
      "Speed",
      "Full_Duplex",
      "Blocked",
      "Allow_Promiscuous",
      "Mac_Changes",
      "Policy",
      "Forged_Transmits",
      "In_Traffic_Shaping",
      "network",
    ],
    Network: [
      
      "name",
      "vm",
      "disk",
      "memory",
      "dns",
      "cpu",
      "label",
    ],
    Switch: [
      
      "Datacenter",
      "Switch",
      "Datacenter",
      "Name",
      "Vendor",
      "Version",
      "Max_Ports",
      "Num_Ports",
      "Num_VMs",
      "In_Avg",
      "In_Peak",
      "Out_Avg",
      "Out_Peak",
      "CDP_Type",
      "CDP_Operation",
    ],
  };


  const fetchNodes = async (type: string) => {
    try {
      const response = await axios.get(`http://localhost:8000/list-nodes/${type}`);
      setNodes(response.data.nodes || []);
    } catch (err) {
      console.error("Failed to fetch nodes:", err);
      setNodes([]);
    }
  };

  const fetchRelatedNodes = async (relatedType: string) => {
    try {
      const response = await axios.get(`http://localhost:8000/list-nodes/${relatedType}`);
      setRelatedNodes((prev) => ({
        ...prev,
        [relatedType]: response.data.nodes || [],
      }));
    } catch (err) {
      console.error(`Failed to fetch related nodes for ${relatedType}:`, err);
    }
  };

  useEffect(() => {
    if (nodeType) {
      fetchNodes(nodeType);
      const relations = relationFields[nodeType] || [];
      relations.forEach(({ relatedType }) => fetchRelatedNodes(relatedType));
    } else {
      setNodes([]);
      setRelatedNodes({});
    }
  }, [nodeType]);

  const handleInputChange = (key: string, custom_value: string) => {
    setProperties((prev) => ({ ...prev, [key]: custom_value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!properties.name) {
      setError(" Name is required.");
      return;
    }
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      const nodeData = {
        node_type: nodeType,
        properties: { ...properties, id: properties.id || Date.now().toString() },
      };

      const response = await axios.post("http://localhost:8000/add-node/", nodeData);
      setSuccess(response.data.message || "Node added successfully");
      setProperties({});
      fetchNodes(nodeType);
    } catch (err: any) {
      setError(err.response?.data.detail || "Failed to add node.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!selectedNode.id || !selectedNode.name) {
      setError("ID and Name are required.");
      return;
    }
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      const nodeData = {
        node_type: nodeType,
        properties: selectedNode,
      };

      const response = await axios.put("http://localhost:8000/update-node/", nodeData);
      setSuccess(response.data.message || "Node updated successfully");
      setShowUpdateModal(false);
      fetchNodes(nodeType);
    } catch (err: any) {
      setError(err.response?.data.detail || "Failed to update node.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (nodeId: string) => {
    if (!window.confirm("Are you sure you want to delete this node?")) return;

    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      const nodeData = {
        node_type: nodeType,
        properties: { id: nodeId },
      };

      const response = await axios.delete("http://localhost:8000/delete-node/", {
        data: nodeData,
      });
      setSuccess(response.data.message || "Node deleted successfully");
      fetchNodes(nodeType);
    } catch (err: any) {
      setError(err.response?.data.detail || "Failed to delete node.");
    } finally {
      setIsLoading(false);
    }
  };

  const openUpdateModal = (node: any) => {
    setSelectedNode({ ...node });
    setShowUpdateModal(true);
  };

  const isRelationField = (field: string) => {
    return (relationFields[nodeType] || []).some((rel) => rel.field === field);
  };

  const getRelatedTypeForField = (field: string) => {
    const relation = (relationFields[nodeType] || []).find((rel) => rel.field === field);
    return relation?.relatedType || "";
  };

  return (
    <div className="rounded-xl shadow-md bg-white–

 dark:bg-darkgray p-6 w-full">
      <h5 className="card-title mb-6">Node Management</h5>

      {/* Node Creation Form */}
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="grid grid-cols-12 gap-6">
          <div className="lg:col-span-6 col-span-12">
            <Label htmlFor="nodeType" value="Node Type" />
            <Select
              id="nodeType"
              required
              value={nodeType}
              onChange={(e) => setNodeType(e.target.value)}
            >
              <option value="">Select Node Type</option>
              {nodeTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </Select>
          </div>

          {nodeType && (
            <div className="col-span-12">
              <div className="grid grid-cols-12 gap-6">
                {requiredFields[nodeType]?.map((field) => (
                  <div key={field} className="lg:col-span-6 col-span-12">
                    <Label htmlFor={field} value={field} />
                    {isRelationField(field) ? (
                      <Select
                        id={field}
                        value={properties[field] || ""}
                        onChange={(e) => handleInputChange(field, e.target.value)}
                      >
                        <option value="">Select {getRelatedTypeForField(field)}</option>
                        {(relatedNodes[getRelatedTypeForField(field)] || []).map((node) => (
                          <option key={node.id} value={node.name}>
                            {node.name}
                          </option>
                        ))}
                      </Select>
                    ) : (
                      <TextInput
                        id={field}
                        type="text"
                        placeholder={`Enter ${field}`}
                        value={properties[field] || ""}
                        onChange={(e) => handleInputChange(field, e.target.value)}
                        required={field === "id" || field === "name" || field === "Name"}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {error && <p className="text-red-500 text-sm mt-4 col-span-12">{error}</p>}
          {success && <p className="text-green-500 text-sm mt-4 col-span-12">{success}</p>}

          <div className="col-span-12 flex gap-3 mt-4">
            <Button type="submit" color="primary" disabled={isLoading || !nodeType}>
              {isLoading ? "Processing..." : "Add Node"}
            </Button>
            <Button
              color="error"
              onClick={() => {
                setProperties({});
                setNodeType("");
                setError(null);
                setSuccess(null);
              }}
            >
              Clear
            </Button>
          </div>
        </div>
      </form>

      {/* Nodes Table */}
      {nodeType && nodes.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full table-auto border-collapse">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-700">
                {Object.keys(nodes[0]).map((key) => (
                  <th key={key} className="p-3 text-left text-sm font-semibold">
                    {key}
                  </th>
                ))}
                <th className="p-3 text-left text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {nodes.map((node, index) => (
                <tr
                  key={index}
                  className="border-b hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                  {Object.values(node).map((value: any, i) => (
                    <td key={i} className="p-3 text-sm">
                      {value?.toString() || ""}
                    </td>
                  ))}
                  <td className="p-3 flex gap-2">
                    <Button
                      size="xs"
                      color="failure" // Changed from "warning" to "success"
                      onClick={() => openUpdateModal(node)}
                      
                    >
                      <FaEdit />
                    </Button>
                    <Button
                      size="xs"
                      color="info"
                      onClick={() => handleDelete(node.id)}
                    >
                      <FaTrash />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Update Modal */}
      <Modal show={showUpdateModal} onClose={() => setShowUpdateModal(false)}>
        <Modal.Header>Update Node</Modal.Header>
        <Modal.Body>
          {selectedNode && (
            <div className="grid grid-cols-12 gap-6">
              {requiredFields[nodeType]?.map((field) => (
                <div key={field} className="lg:col-span-6 col-span-12">
                  <Label htmlFor={`update-${field}`} value={field} />
                  {isRelationField(field) ? (
                    <Select
                      id={`update-${field}`}
                      value={selectedNode[field] || ""}
                      onChange={(e) =>
                        setSelectedNode((prev: any) => ({
                          ...prev,
                          [field]: e.target.value,
                        }))
                      }
                    >
                      <option value="">Select {getRelatedTypeForField(field)}</option>
                      {(relatedNodes[getRelatedTypeForField(field)] || []).map((node) => (
                        <option key={node.id} value={node.name}>
                          {node.name}
                        </option>
                      ))}
                    </Select>
                  ) : (
                    <TextInput
                      id={`update-${field}`}
                      type="text"
                      value={selectedNode[field] || ""}
                      onChange={(e) =>
                        setSelectedNode((prev: any) => ({
                          ...prev,
                          [field]: e.target.value,
                        }))
                      }
                      required={field === "id" || field === "name" || field === "Name"}
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={handleUpdate} color="success" disabled={isLoading}>
            {isLoading ? "Updating..." : "Update"}
          </Button>
          <Button color="gray" onClick={() => setShowUpdateModal(false)}>
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default NodeForm;