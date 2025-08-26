import { useState, useEffect, useCallback } from 'react';
import { 
  Client, 
  SupportTicket, 
  CustomerSuccessFilters, 
  TicketFilters,
  ClientUpdatePayload,
  TicketUpdatePayload 
} from '../types/customer-success';
import { 
  getClients, 
  getTickets, 
  updateClientHealth, 
  updateTicket, 
  deleteTicket 
} from '../services/customer-success.api';

export interface UseCustomerSuccessReturn {
  // Clientes
  clients: Client[];
  clientsLoading: boolean;
  clientsError: string | null;
  clientsFilters: CustomerSuccessFilters;
  updateClientsFilters: (filters: Partial<CustomerSuccessFilters>) => void;
  updateClientHealthStatus: (clientId: string, data: ClientUpdatePayload) => Promise<boolean>;
  refreshClients: () => Promise<void>;
  
  // Tickets
  tickets: SupportTicket[];
  ticketsLoading: boolean;
  ticketsError: string | null;
  ticketsFilters: TicketFilters;
  updateTicketsFilters: (filters: Partial<TicketFilters>) => void;
  updateTicketStatus: (ticketId: string, data: TicketUpdatePayload) => Promise<boolean>;
  deleteTicketById: (ticketId: string) => Promise<boolean>;
  refreshTickets: () => Promise<void>;
}

export function useCustomerSuccess(): UseCustomerSuccessReturn {
  // Estados dos clientes
  const [clients, setClients] = useState<Client[]>([]);
  const [clientsLoading, setClientsLoading] = useState(true);
  const [clientsError, setClientsError] = useState<string | null>(null);
  const [clientsFilters, setClientsFilters] = useState<CustomerSuccessFilters>({});

  // Estados dos tickets
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [ticketsLoading, setTicketsLoading] = useState(true);
  const [ticketsError, setTicketsError] = useState<string | null>(null);
  const [ticketsFilters, setTicketsFilters] = useState<TicketFilters>({});

  // Carregar clientes
  const loadClients = useCallback(async () => {
    try {
      setClientsLoading(true);
      setClientsError(null);
      
      const response = await getClients(clientsFilters);
      setClients(response.data);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
      setClientsError('Erro ao carregar clientes');
    } finally {
      setClientsLoading(false);
    }
  }, [clientsFilters]);

  // Carregar tickets
  const loadTickets = useCallback(async () => {
    try {
      setTicketsLoading(true);
      setTicketsError(null);
      
      const response = await getTickets(ticketsFilters);
      setTickets(response.data);
    } catch (error) {
      console.error('Erro ao carregar tickets:', error);
      setTicketsError('Erro ao carregar tickets');
    } finally {
      setTicketsLoading(false);
    }
  }, [ticketsFilters]);

  // Efeito para carregar dados iniciais
  useEffect(() => {
    loadClients();
  }, [loadClients]);

  useEffect(() => {
    loadTickets();
  }, [loadTickets]);

  // Funções para atualizar filtros
  const updateClientsFilters = useCallback((filters: Partial<CustomerSuccessFilters>) => {
    setClientsFilters(prev => ({ ...prev, ...filters }));
  }, []);

  const updateTicketsFilters = useCallback((filters: Partial<TicketFilters>) => {
    setTicketsFilters(prev => ({ ...prev, ...filters }));
  }, []);

  // Função para atualizar saúde do cliente
  const updateClientHealthStatus = useCallback(async (clientId: string, data: ClientUpdatePayload): Promise<boolean> => {
    try {
      const success = await updateClientHealth(clientId, data);
      
      if (success) {
        // Atualizar o cliente local
        setClients(prev => prev.map(client => 
          client.id === clientId 
            ? { ...client, ...data, updated_at: new Date().toISOString() }
            : client
        ));
        console.log('✅ Saúde do cliente atualizada com sucesso');
        return true;
      } else {
        console.error('❌ Falha ao atualizar saúde do cliente');
        return false;
      }
    } catch (error) {
      console.error('❌ Erro ao atualizar saúde do cliente:', error);
      return false;
    }
  }, []);

  // Função para atualizar status do ticket
  const updateTicketStatus = useCallback(async (ticketId: string, data: TicketUpdatePayload): Promise<boolean> => {
    try {
      const success = await updateTicket(ticketId, data);
      
      if (success) {
        // Atualizar o ticket local
        setTickets(prev => prev.map(ticket => 
          ticket.id === ticketId 
            ? { ...ticket, ...data, updated_at: new Date().toISOString() }
            : ticket
        ));
        console.log('✅ Ticket atualizado com sucesso');
        return true;
      } else {
        console.error('❌ Falha ao atualizar ticket');
        return false;
      }
    } catch (error) {
      console.error('❌ Erro ao atualizar ticket:', error);
      return false;
    }
  }, []);

  // Função para deletar ticket
  const deleteTicketById = useCallback(async (ticketId: string): Promise<boolean> => {
    try {
      const success = await deleteTicket(ticketId);
      
      if (success) {
        // Remover o ticket local
        setTickets(prev => prev.filter(ticket => ticket.id !== ticketId));
        console.log('✅ Ticket deletado com sucesso');
        return true;
      } else {
        console.error('❌ Falha ao deletar ticket');
        return false;
      }
    } catch (error) {
      console.error('❌ Erro ao deletar ticket:', error);
      return false;
    }
  }, []);

  // Funções para refresh
  const refreshClients = useCallback(async () => {
    await loadClients();
  }, [loadClients]);

  const refreshTickets = useCallback(async () => {
    await loadTickets();
  }, [loadTickets]);

  return {
    // Clientes
    clients,
    clientsLoading,
    clientsError,
    clientsFilters,
    updateClientsFilters,
    updateClientHealthStatus,
    refreshClients,
    
    // Tickets
    tickets,
    ticketsLoading,
    ticketsError,
    ticketsFilters,
    updateTicketsFilters,
    updateTicketStatus,
    deleteTicketById,
    refreshTickets,
  };
}