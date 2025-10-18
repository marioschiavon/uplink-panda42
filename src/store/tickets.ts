import { create } from "zustand";
import { Ticket, Company } from "@/api/tickets";

interface TicketsState {
  tickets: Ticket[];
  waitingTickets: Ticket[];
  myTickets: Ticket[];
  company: Company | null;
  activeTicketId: string | null;
  
  // Actions
  setTickets: (tickets: Ticket[]) => void;
  addTicket: (ticket: Ticket) => void;
  updateTicket: (ticketId: string, updates: Partial<Ticket>) => void;
  removeTicket: (ticketId: string) => void;
  setCompany: (company: Company) => void;
  setActiveTicket: (ticketId: string | null) => void;
  
  // Computed
  getTicketById: (ticketId: string) => Ticket | undefined;
}

export const useTicketsStore = create<TicketsState>((set, get) => ({
  tickets: [],
  waitingTickets: [],
  myTickets: [],
  company: null,
  activeTicketId: null,

  setTickets: (tickets) => {
    const waitingTickets = tickets.filter((t) => t.status === "waiting");
    const myTickets = tickets.filter(
      (t) => t.status === "in_progress" || t.assigned_to !== null
    );
    set({ tickets, waitingTickets, myTickets });
  },

  addTicket: (ticket) => {
    set((state) => {
      const tickets = [...state.tickets, ticket];
      const waitingTickets =
        ticket.status === "waiting"
          ? [...state.waitingTickets, ticket]
          : state.waitingTickets;
      const myTickets =
        ticket.status === "in_progress" || ticket.assigned_to !== null
          ? [...state.myTickets, ticket]
          : state.myTickets;
      
      return { tickets, waitingTickets, myTickets };
    });
  },

  updateTicket: (ticketId, updates) => {
    set((state) => {
      const tickets = state.tickets.map((t) =>
        t.id === ticketId ? { ...t, ...updates } : t
      );
      const waitingTickets = tickets.filter((t) => t.status === "waiting");
      const myTickets = tickets.filter(
        (t) => t.status === "in_progress" || t.assigned_to !== null
      );
      
      return { tickets, waitingTickets, myTickets };
    });
  },

  removeTicket: (ticketId) => {
    set((state) => ({
      tickets: state.tickets.filter((t) => t.id !== ticketId),
      waitingTickets: state.waitingTickets.filter((t) => t.id !== ticketId),
      myTickets: state.myTickets.filter((t) => t.id !== ticketId),
    }));
  },

  setCompany: (company) => set({ company }),

  setActiveTicket: (ticketId) => set({ activeTicketId: ticketId }),

  getTicketById: (ticketId) => {
    return get().tickets.find((t) => t.id === ticketId);
  },
}));
