import { supabase } from './supabaseClient';
import { logger } from '../utils/logger';

export type RoutingMode = 'manual' | 'auto' | 'hybrid';
export type TicketStatus = 'waiting' | 'in_progress' | 'closed';

interface Company {
  id: string;
  routing_mode: RoutingMode;
}

interface Agent {
  id: string;
  company_id: string;
  status: 'active' | 'inactive';
  role: 'admin' | 'agent';
}

interface Ticket {
  id: string;
  company_id: string;
  customer_number: string;
  last_message: string;
  status: TicketStatus;
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Find next available agent using round-robin
 */
async function findNextAvailableAgent(companyId: string): Promise<string | null> {
  try {
    // Get all active agents from company
    const { data: agents, error: agentsError } = await supabase
      .from('users')
      .select('id')
      .eq('company_id', companyId)
      .eq('role', 'agent')
      .eq('status', 'active');

    if (agentsError || !agents || agents.length === 0) {
      logger.warn({ companyId }, 'No active agents found');
      return null;
    }

    // Get ticket count for each agent (to find least busy)
    const { data: ticketCounts, error: countError } = await supabase
      .from('tickets')
      .select('assigned_to')
      .eq('company_id', companyId)
      .in('status', ['waiting', 'in_progress'])
      .not('assigned_to', 'is', null);

    if (countError) {
      logger.error(countError, 'Error counting tickets');
      return agents[0].id; // Fallback to first agent
    }

    // Count tickets per agent
    const agentTicketCount = new Map<string, number>();
    agents.forEach(agent => agentTicketCount.set(agent.id, 0));
    
    ticketCounts?.forEach(ticket => {
      if (ticket.assigned_to) {
        const count = agentTicketCount.get(ticket.assigned_to) || 0;
        agentTicketCount.set(ticket.assigned_to, count + 1);
      }
    });

    // Find agent with least tickets
    let minCount = Infinity;
    let selectedAgent = agents[0].id;

    agentTicketCount.forEach((count, agentId) => {
      if (count < minCount) {
        minCount = count;
        selectedAgent = agentId;
      }
    });

    logger.info({ selectedAgent, ticketCount: minCount }, 'Selected agent for routing');
    return selectedAgent;
  } catch (error) {
    logger.error(error, 'Error finding available agent');
    return null;
  }
}

/**
 * Route ticket based on company routing mode
 */
export async function routeTicket(
  companyId: string,
  customerNumber: string,
  lastMessage: string
): Promise<{ ticket: Ticket; routed: boolean }> {
  try {
    // Get company routing mode
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('id, routing_mode')
      .eq('id', companyId)
      .single();

    if (companyError || !company) {
      throw new Error('Company not found');
    }

    const routingMode = company.routing_mode as RoutingMode;
    logger.info({ companyId, routingMode }, 'Routing ticket');

    let assignedTo: string | null = null;
    let status: TicketStatus = 'waiting';

    switch (routingMode) {
      case 'manual':
        // Manual mode: always put in waiting queue
        assignedTo = null;
        status = 'waiting';
        break;

      case 'auto':
        // Auto mode: always try to assign
        assignedTo = await findNextAvailableAgent(companyId);
        status = assignedTo ? 'in_progress' : 'waiting';
        break;

      case 'hybrid':
        // Hybrid mode: assign if agent available, otherwise waiting
        assignedTo = await findNextAvailableAgent(companyId);
        status = assignedTo ? 'in_progress' : 'waiting';
        break;

      default:
        assignedTo = null;
        status = 'waiting';
    }

    // Create ticket
    const { data: ticket, error: ticketError } = await supabase
      .from('tickets')
      .insert({
        company_id: companyId,
        customer_number: customerNumber,
        last_message: lastMessage,
        status,
        assigned_to: assignedTo,
      })
      .select()
      .single();

    if (ticketError || !ticket) {
      throw new Error('Failed to create ticket');
    }

    logger.info({ ticketId: ticket.id, assignedTo, status }, 'Ticket routed successfully');

    return {
      ticket: ticket as Ticket,
      routed: assignedTo !== null,
    };
  } catch (error) {
    logger.error(error, 'Error routing ticket');
    throw error;
  }
}

/**
 * Assign ticket to agent
 */
export async function assignTicket(ticketId: string, agentId: string): Promise<Ticket> {
  try {
    const { data: ticket, error } = await supabase
      .from('tickets')
      .update({
        assigned_to: agentId,
        status: 'in_progress',
      })
      .eq('id', ticketId)
      .select()
      .single();

    if (error || !ticket) {
      throw new Error('Failed to assign ticket');
    }

    logger.info({ ticketId, agentId }, 'Ticket assigned');
    return ticket as Ticket;
  } catch (error) {
    logger.error(error, 'Error assigning ticket');
    throw error;
  }
}

/**
 * Close ticket and mark agent as available
 */
export async function closeTicket(ticketId: string): Promise<Ticket> {
  try {
    const { data: ticket, error } = await supabase
      .from('tickets')
      .update({
        status: 'closed',
      })
      .eq('id', ticketId)
      .select()
      .single();

    if (error || !ticket) {
      throw new Error('Failed to close ticket');
    }

    logger.info({ ticketId }, 'Ticket closed');
    return ticket as Ticket;
  } catch (error) {
    logger.error(error, 'Error closing ticket');
    throw error;
  }
}

/**
 * Get waiting tickets for company
 */
export async function getWaitingTickets(companyId: string): Promise<Ticket[]> {
  try {
    const { data: tickets, error } = await supabase
      .from('tickets')
      .select('*')
      .eq('company_id', companyId)
      .eq('status', 'waiting')
      .order('created_at', { ascending: true });

    if (error) {
      throw new Error('Failed to get waiting tickets');
    }

    return (tickets || []) as Ticket[];
  } catch (error) {
    logger.error(error, 'Error getting waiting tickets');
    throw error;
  }
}
