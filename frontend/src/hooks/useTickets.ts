import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export type Ticket = {
  id: string;
  created_at: string;
  description: string;
  category: string | null;
  sentiment: string | null;
  processed: boolean;
};

export function useTickets() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  const addOptimisticTicket = useCallback((ticket: Ticket) => {
    setTickets((prev) => [ticket, ...prev]);
  }, []);

  useEffect(() => {
    // Initial load
    supabase
      .from("tickets")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (!error && data) setTickets(data);
        setLoading(false);
      });

    // Realtime: ONLY UPDATES
    const channel = supabase
      .channel("tickets-realtime")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "tickets" },
        (payload) => {
          const updated = payload.new as Ticket;
          setTickets((prev) =>
            prev.map((t) => (t.id === updated.id ? updated : t))
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { tickets, loading, addOptimisticTicket };
}
