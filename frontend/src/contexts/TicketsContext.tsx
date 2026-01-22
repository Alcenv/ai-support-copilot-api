import { createContext, useContext, ReactNode } from "react";
import { useTickets } from "../hooks/useTickets";
import type { Ticket } from "../hooks/useTickets";

interface TicketsContextType {
  tickets: Ticket[];
  loading: boolean;
  addOptimisticTicket: (ticket: Ticket) => void;
}

const TicketsContext = createContext<TicketsContextType | undefined>(undefined);

export function TicketsProvider({ children }: { children: ReactNode }) {
  const ticketsData = useTickets();
  return <TicketsContext.Provider value={ticketsData}>{children}</TicketsContext.Provider>;
}

export function useTicketsContext() {
  const context = useContext(TicketsContext);
  if (!context) {
    throw new Error("useTicketsContext must be used within TicketsProvider");
  }
  return context;
}
