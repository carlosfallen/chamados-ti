'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';

interface Ticket {
  id: string;
  requesterName: string;
  department: string;
  issueType: string;
  description: string;
  status: 'open' | 'in_progress' | 'closed';
  date: string;
  priority: 'high' | 'medium' | 'low';
}

const TicketsPage = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filteredTickets, setFilteredTickets] = useState<Ticket[]>([]);
  const [statusFilter, setStatusFilter] = useState<'open' | 'in_progress' | 'closed' | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<'high' | 'medium' | 'low' | 'all'>('all');

  const fetchTickets = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'tickets'));
      const fetchedTickets: Ticket[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        fetchedTickets.push({
          id: doc.id,
          requesterName: data.requesterName,
          department: data.department,
          issueType: data.issueType,
          description: data.description,
          status: data.status,
          date: data.date,
          priority: data.priority,
        });
      });
      fetchedTickets.sort((a, b) => {
        const priorityOrder = { high: 1, medium: 2, low: 3 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      });
      setTickets(fetchedTickets);
      setFilteredTickets(fetchedTickets);
    } catch (error) {
      console.error('Erro ao buscar chamados:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateTicketStatus = async (id: string, newStatus: 'in_progress' | 'closed') => {
    try {
      const ticketRef = doc(db, 'tickets', id);
      await updateDoc(ticketRef, { status: newStatus });
      setTickets(prevTickets =>
        prevTickets.map(ticket =>
          ticket.id === id ? { ...ticket, status: newStatus } : ticket
        )
      );
      filterTickets();
    } catch (error) {
      console.error('Erro ao atualizar o status do chamado:', error);
    }
  };

  const filterTickets = useCallback(() => {
    let filtered = [...tickets];

    if (statusFilter !== 'all') {
      filtered = filtered.filter(ticket => ticket.status === statusFilter);
    }

    if (priorityFilter !== 'all') {
      filtered = filtered.filter(ticket => ticket.priority === priorityFilter);
    }

    setFilteredTickets(filtered);
  }, [tickets, statusFilter, priorityFilter]);

  useEffect(() => {
    filterTickets();
  }, [statusFilter, priorityFilter, filterTickets]);

  useEffect(() => {
    fetchTickets();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6 sm:p-10">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">Gerenciamento de Chamados</h1>
        </div>

        <div className="mb-6 flex flex-col sm:flex-row sm:justify-center gap-4">
          <select
            className="px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 w-full sm:w-auto"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'open' | 'in_progress' | 'closed' | 'all')}
          >
            <option value="all">Todos os Status</option>
            <option value="open">Abertos</option>
            <option value="in_progress">Em Andamento</option>
            <option value="closed">Concluídos</option>
          </select>

          <select
            className="px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 w-full sm:w-auto"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value as 'high' | 'medium' | 'low' | 'all')}
          >
            <option value="all">Todas as Prioridades</option>
            <option value="high">Alta</option>
            <option value="medium">Média</option>
            <option value="low">Baixa</option>
          </select>
        </div>

        {loading ? (
          <div className="text-center text-gray-500">Carregando chamados...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTickets.length > 0 ? (
              filteredTickets.map((ticket) => (
                <div key={ticket.id} className="p-6 bg-white border rounded-lg shadow-lg hover:shadow-xl transition-shadow">
                  <div className="flex justify-between items-center mb-4">
                    <p className="font-medium text-xl sm:text-2xl">{ticket.requesterName}</p>
                    <p className="text-sm text-gray-500">{ticket.date}</p>
                  </div>

                  <div className="text-sm text-gray-600 mb-4">
                    <p><strong>Departamento:</strong> {ticket.department}</p>
                    <p><strong>Tipo de Problema:</strong> {ticket.issueType}</p>
                    <p><strong>Descrição:</strong> {ticket.description}</p>
                  </div>

                  <div className="flex justify-between items-center text-sm">
                    <p className={`font-semibold ${ticket.status === 'open' ? 'text-green-600' : ticket.status === 'in_progress' ? 'text-yellow-600' : 'text-red-600'}`}>
                      {ticket.status}
                    </p>
                    <p className={`font-semibold ${ticket.priority === 'high' ? 'text-red-600' : ticket.priority === 'medium' ? 'text-yellow-600' : 'text-green-600'}`}>
                      {ticket.priority === 'high' ? 'Alta' : ticket.priority === 'medium' ? 'Média' : 'Baixa'}
                    </p>
                  </div>

                  <div className="mt-4 flex justify-center gap-4">
                    {ticket.status === 'open' && (
                      <button
                        onClick={() => updateTicketStatus(ticket.id, 'in_progress')}
                        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none"
                      >
                        Aceitar
                      </button>
                    )}

                    {ticket.status === 'in_progress' && (
                      <button
                        onClick={() => updateTicketStatus(ticket.id, 'closed')}
                        className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none"
                      >
                        Concluir
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500">Nenhum chamado encontrado.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TicketsPage;
