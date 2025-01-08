'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { db, collection, addDoc, query, where, getDocs } from '../firebase';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

interface Ticket {
  id: string;
  requesterName: string;
  department: string;
  issueType: string;
  description: string;
  priority?: string;
  status: 'open' | 'in_progress' | 'closed';
}

const TicketForm = () => {
  const [requesterName, setRequesterName] = useState<string>('');
  const [department, setDepartment] = useState<string>('');
  const [issueType, setIssueType] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [priority, setPriority] = useState<string>(''); // Prioridade (opcional)
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [userTickets, setUserTickets] = useState<Ticket[]>([]); // Chamados do usuário
  const [departmentTickets, setDepartmentTickets] = useState<Ticket[]>([]); // Chamados do setor

  // Tipos de problemas
  const issueTypes = ['Software', 'Hardware', 'Rede', 'Outro'];
  // Prioridades
  const priorities = ['Baixa', 'Média', 'Alta'];

  // Carregar dados do usuário logado do localStorage
  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      const parsedUser = JSON.parse(user);
      setRequesterName(parsedUser.name); // Preenche com o nome do usuário
      setDepartment(parsedUser.department); // Preenche com o departamento do usuário
    }
  }, []);

  // Função para buscar chamados do usuário e do seu setor
  const fetchUserAndDepartmentTickets = useCallback(async () => {
    try {
      const ticketsQuery = query(
        collection(db, 'tickets'),
        where('requesterName', '==', requesterName)
      );
      const departmentQuery = query(
        collection(db, 'tickets'),
        where('department', '==', department)
      );

      const userTicketsSnapshot = await getDocs(ticketsQuery);
      const departmentTicketsSnapshot = await getDocs(departmentQuery);

      const userTickets: Ticket[] = [];
      const departmentTickets: Ticket[] = [];

      userTicketsSnapshot.forEach((doc) => {
        const data = doc.data();
        userTickets.push({
          id: doc.id,
          requesterName: data.requesterName,
          department: data.department,
          issueType: data.issueType,
          description: data.description,
          priority: data.priority,
          status: data.status,
        });
      });

      departmentTicketsSnapshot.forEach((doc) => {
        const data = doc.data();
        departmentTickets.push({
          id: doc.id,
          requesterName: data.requesterName,
          department: data.department,
          issueType: data.issueType,
          description: data.description,
          priority: data.priority,
          status: data.status,
        });
      });

      setUserTickets(userTickets);
      setDepartmentTickets(departmentTickets);
    } catch (error) {
      console.error('Erro ao buscar chamados:', error);
    }
  }, [requesterName, department]); // As dependências da função

  // Chama a função para buscar os chamados sempre que o requesterName ou department mudar
  useEffect(() => {
    if (requesterName && department) {
      fetchUserAndDepartmentTickets();
    }
  }, [requesterName, department, fetchUserAndDepartmentTickets]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!issueType || !description) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    setIsLoading(true);

    try {
      const newTicket: Ticket = {
        id: '', // Será preenchido pelo Firestore
        requesterName,
        department,
        issueType,
        description,
        priority, // Prioridade opcional
        status: 'open',
      };

      const docRef = await addDoc(collection(db, 'tickets'), newTicket);

      alert(`Chamado criado com sucesso! ID: ${docRef.id}`);
      setIssueType('');
      setDescription('');
      setPriority(''); // Limpa o campo de prioridade
      fetchUserAndDepartmentTickets(); // Atualiza os chamados
    } catch (error) {
      console.error('Erro ao criar o chamado:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Função para renderizar o status do chamado
  const renderStatusMessage = (status: 'open' | 'in_progress' | 'closed') => {
    switch (status) {
      case 'open':
        return 'Aguardando Técnico';
      case 'in_progress':
        return 'Técnico está a caminho';
      case 'closed':
        return 'Problema Resolvido';
      default:
        return '';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Novo Chamado</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Tipo de Problema
                  </label>
                  <Select value={issueType} onValueChange={setIssueType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {issueTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Descrição
                  </label>
                  <Input
                    type="text"
                    placeholder="Descreva o problema"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Prioridade (opcional)
                  </label>
                  <Select value={priority} onValueChange={setPriority}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a prioridade" />
                    </SelectTrigger>
                    <SelectContent>
                      {priorities.map((level) => (
                        <SelectItem key={level} value={level}>
                          {level}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button type="submit" className="w-full mt-4" disabled={isLoading}>
                {isLoading ? 'Registrando...' : 'Registrar Chamado'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Exibindo os Chamados do Usuário */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold">Meus Chamados</h2>
          <div className="space-y-4 mt-4">
            {userTickets.length > 0 ? (
              userTickets.map((ticket) => (
                <div key={ticket.id} className="p-4 bg-white border rounded-md shadow-md">
                  <h3 className="text-lg font-medium">{ticket.issueType}</h3>
                  <p>{ticket.description}</p>
                  <p className="text-sm text-gray-500">
                    Status: {renderStatusMessage(ticket.status)}
                  </p>
                </div>
              ))
            ) : (
              <p>Nenhum chamado encontrado.</p>
            )}
          </div>
        </div>

        {/* Exibindo os Chamados do Setor */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold">Chamados do Setor</h2>
          <div className="space-y-4 mt-4">
            {departmentTickets.length > 0 ? (
              departmentTickets.map((ticket) => (
                <div key={ticket.id} className="p-4 bg-white border rounded-md shadow-md">
                  <h3 className="text-lg font-medium">{ticket.issueType}</h3>
                  <p>{ticket.description}</p>
                  <p className="text-sm text-gray-500">
                    Status: {renderStatusMessage(ticket.status)}
                  </p>
                </div>
              ))
            ) : (
              <p>Nenhum chamado encontrado.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketForm;
