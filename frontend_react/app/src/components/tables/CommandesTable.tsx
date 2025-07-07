import React, { useState, useEffect } from 'react';
import { Badge, Dropdown, Table } from "flowbite-react";
import { HiOutlineDotsVertical } from "react-icons/hi";
import { Icon } from "@iconify/react";
import { useNavigate } from 'react-router-dom';

// Définition du type Order basé sur commandeModel.js
interface Order {
  _id: string;
  client: {
    _id: string;
    name: string;
    email: string;
  };
  ressources: Array<{
    _id: string;
    nom: string;
  }>;
  dateCommande: string;
}

const OrderTable: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const navigate = useNavigate();

  // Récupération des commandes au montage du composant
  useEffect(() => {
    const fetchOrders = async () => {
      const token = localStorage.getItem('token');
      try {
        const response = await fetch('/api/commandes', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error('Échec de la récupération des commandes');
        }
        const data = await response.json();
        setOrders(data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchOrders();
  }, []);

  // Fonction de suppression d'une commande
  const handleDelete = async (id: string) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`/api/commandes/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error('Échec de la suppression de la commande');
      }
      setOrders(orders.filter(order => order._id !== id));
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="rounded-xl dark:shadow-dark-md shadow-md bg-white dark:bg-darkgray p-6 relative w-full break-words">
      <h5 className="card-title">Commandes</h5>
      <div className="mt-3">
        <div className="overflow-x-auto">
          <Table hoverable>
            <Table.Head>
              <Table.HeadCell className="p-6">Client</Table.HeadCell>
              <Table.HeadCell>Date de Commande</Table.HeadCell>
              <Table.HeadCell>Ressources</Table.HeadCell>
              <Table.HeadCell></Table.HeadCell>
            </Table.Head>
            <Table.Body className="divide-y divide-border dark:divide-darkborder">
              {orders.map((order) => (
                <Table.Row key={order._id}>
                  <Table.Cell className="whitespace-nowrap ps-6">
                    <div className="flex gap-3 items-center">
                      <Icon icon="mdi:account" height={24} />
                      <span>{order.client.name}</span>
                    </div>
                  </Table.Cell>
                  <Table.Cell>{new Date(order.dateCommande).toLocaleDateString()}</Table.Cell>
                  <Table.Cell>
                    {order.ressources.map((ressource, index) => (
                      <span key={index}>
                        {ressource.nom}
                        {index < order.ressources.length - 1 && ', '}
                      </span>
                    ))}
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
                      <Dropdown.Item onClick={() => navigate(`/admin/orders/edit/${order._id}`)}>
                        <Icon icon="solar:pen-new-square-broken" height={18} />
                        <span>Modifier</span>
                      </Dropdown.Item>
                      <Dropdown.Item onClick={() => handleDelete(order._id)}>
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

export { OrderTable };