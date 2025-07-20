
import React from 'react';
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface Client {
  id: string;
  name: string;
  username: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  created_at: string;
}

interface ClientExportButtonProps {
  clients: Client[];
  filteredClients: Client[];
}

const ClientExportButton = ({ clients, filteredClients }: ClientExportButtonProps) => {
  const exportToCSV = () => {
    const dataToExport = filteredClients.length > 0 ? filteredClients : clients;
    
    const headers = [
      'Nome',
      'Usuário',
      'Email',
      'Telefone',
      'Endereço',
      'Cidade',
      'Estado',
      'Data de Cadastro'
    ];

    const csvContent = [
      headers.join(','),
      ...dataToExport.map(client => [
        `"${client.name}"`,
        `"${client.username}"`,
        `"${client.email || ''}"`,
        `"${client.phone || ''}"`,
        `"${client.address || ''}"`,
        `"${client.city || ''}"`,
        `"${client.state || ''}"`,
        `"${new Date(client.created_at).toLocaleDateString('pt-BR')}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `clientes_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Button onClick={exportToCSV} variant="outline" size="sm">
      <Download className="h-4 w-4 mr-2" />
      Exportar CSV
    </Button>
  );
};

export default ClientExportButton;
