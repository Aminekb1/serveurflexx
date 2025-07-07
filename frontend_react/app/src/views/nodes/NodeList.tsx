
export default function NodeList() {
  const nodes = [
    { id: 'node-1', name: 'Server A', status: 'Active', type: 'EC2' },
    { id: 'node-2', name: 'Server B', status: 'Inactive', type: 'Lambda' },
  ];

  return (
    <div className="p-6">
      <h3 className="text-lg font-semibold mb-4">Node List</h3>
      <div className="bg-white dark:bg-dark p-6 rounded-lg shadow-md">
        <table className="w-full">
          <thead>
            <tr>
              <th className="text-left p-2">ID</th>
              <th className="text-left p-2">Name</th>
              <th className="text-left p-2">Status</th>
              <th className="text-left p-2">Type</th>
            </tr>
          </thead>
          <tbody>
            {nodes.map((node) => (
              <tr key={node.id}>
                <td className="p-2">{node.id}</td>
                <td className="p-2">{node.name}</td>
                <td className="p-2">{node.status}</td>
                <td className="p-2">{node.type}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}