import React, { useState, useEffect } from 'react';
import { Badge, Dropdown, Table } from "flowbite-react";
import { HiOutlineDotsVertical } from "react-icons/hi";
import { Icon } from "@iconify/react";
import { useNavigate } from 'react-router-dom';

// Définition du type Resource basé sur ressourceModel.js
interface Resource {
  _id: string;
  id: string;
  nom: string;
  cpu: string;
  ram: string;
  stockage: string;
  nombreHeure: number;
  disponibilite: boolean;
  statut: 'En cours' | 'Prêt' | 'Arrêté';
  typeRessource: 'server' | 'vm';
}

const ResourceTable: React.FC = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const navigate = useNavigate();

  // Récupération des ressources au montage du composant
  useEffect(() => {
    const fetchResources = async () => {
      const token = localStorage.getItem('token');
      try {
        const response = await fetch('/api/resources', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error('Échec de la récupération des ressources');
        }
        const data = await response.json();
        setResources(data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchResources();
  }, []);

  // Fonction de suppression d'une ressource
  const handleDelete = async (id: string) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`/api/resources/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error('Échec de la suppression de la ressource');
      }
      setResources(resources.filter(resource => resource._id !== id));
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="rounded-xl dark:shadow-dark-md shadow-md bg-white dark:bg-darkgray p-6 relative w-full break-words">
      <h5 className="card-title">Ressources</h5>
      <div className="mt-3">
        <div className="overflow-x-auto">
          <Table hoverable>
            <Table.Head>
              <Table.HeadCell className="p-6">Ressource</Table.HeadCell>
              <Table.HeadCell>Type</Table.HeadCell>
              <Table.HeadCell>CPU</Table.HeadCell>
              <Table.HeadCell>RAM</Table.HeadCell>
              <Table.HeadCell>Stockage</Table.HeadCell>
              <Table.HeadCell>Heures</Table.HeadCell>
              <Table.HeadCell>Disponibilité</Table.HeadCell>
              <Table.HeadCell>Statut</Table.HeadCell>
              <Table.HeadCell></Table.HeadCell>
            </Table.Head>
            <Table.Body className="divide-y divide-border dark:divide-darkborder">
              {resources.map((resource) => (
                <Table.Row key={resource._id}>
                  <Table.Cell className="whitespace-nowrap ps-6">
                    <div className="flex gap-3 items-center">
                      <Icon
                        icon={resource.typeRessource === 'server' ? 'mdi:server' : 'mdi:virtual-machine'}
                        height={24}
                      />
                      <span>{resource.nom}</span>
                    </div>
                  </Table.Cell>
                  <Table.Cell>{resource.typeRessource}</Table.Cell>
                  <Table.Cell>{resource.cpu}</Table.Cell>
                  <Table.Cell>{resource.ram}</Table.Cell>
                  <Table.Cell>{resource.stockage}</Table.Cell>
                  <Table.Cell>{resource.nombreHeure}</Table.Cell>
                  <Table.Cell>
                    <Badge
                      color={resource.disponibilite ? 'success' : 'error'}
                    >
                      {resource.disponibilite ? 'Disponible' : 'Non disponible'}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell>
                    <Badge
                      color={
                        resource.statut === 'Prêt'
                          ? 'success'
                          : resource.statut === 'En cours'
                          ? 'warning'
                          : 'error'
                      }
                    >
                      {resource.statut}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell>
                    <Dropdown
                      label=""
                      dismissOnClick={false}
                      renderTrigger={() => (
                        <span className="h-9 w-9 flex justify-center items-center rounded-full hover:bg-lightprimary hover:text-primary cursor-pointer">
                          <HiOutlineDotsVertical size={22} />
                        </span>
                      )}
                    >
                      <Dropdown.Item onClick={() => navigate(`/admin/resources/edit/${resource._id}`)}>
                        <Icon icon="solar:pen-new-square-broken" height={18} />
                        <span>Modifier</span>
                      </Dropdown.Item>
                      <Dropdown.Item onClick={() => handleDelete(resource._id)}>
                        <Icon icon="solar:trash-bin-minimalistic-outline" height={18} />
                        <span>Supprimer</span>
                      </Dropdown.Item>
                    </Dropdown>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </div>
      </div>
    </div>
  );
};

export { ResourceTable };