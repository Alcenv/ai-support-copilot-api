import { useState } from "react";
import { supabase } from "../lib/supabase";
import type { Ticket } from "../hooks/useTickets";

const N8N_WEBHOOK_URL = import.meta.env.VITE_N8N_WEBHOOK_URL as string;

interface NewTicketFormProps {
  onOptimisticAdd: (ticket: Ticket) => void;
}

export default function NewTicketForm({ onOptimisticAdd }: NewTicketFormProps) {
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    const optimisticTicket: Ticket = {
      id,
      created_at: now,
      description,
      processed: false,
      category: null,
      sentiment: null,
    };

    onOptimisticAdd(optimisticTicket);

    try {
      // 1) Insert ticket in Supabase
      const { error: insertError } = await supabase.from("tickets").insert([
        {
          id,
          description,
          processed: false,
          category: null,
          sentiment: null,
        },
      ]);

      if (insertError) throw new Error(insertError.message);

      // 2) Trigger n8n webhook (event-driven)
      const res = await fetch(N8N_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticket_id: id, description }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`n8n webhook error: ${text}`);
      }

      setDescription("");
    } catch (err: any) {
      setError(err.message ?? "Unexpected error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200/80 shadow-sm">
      <div className="px-6 pt-6 pb-4 border-b border-gray-100/80">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-sm font-semibold text-gray-900">Create New Ticket</h2>
            <p className="text-xs text-gray-500 mt-0.5">AI will analyze and categorize automatically</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-5">
        <div>
          <textarea
            className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-900 placeholder-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-gray-900/20 focus:border-gray-300 disabled:bg-gray-50/50 disabled:text-gray-500 disabled:cursor-not-allowed transition-all resize-none leading-relaxed"
            rows={6}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your issue or question in detail..."
            required
            disabled={loading}
          />
        </div>

        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-gray-400">
            {description.trim().length > 0 ? `${description.trim().length} characters` : ""}
          </p>
          <button
            className="px-5 py-2.5 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 active:bg-gray-950 focus:outline-none focus:ring-2 focus:ring-gray-900/20 focus:ring-offset-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-gray-900 transition-all duration-150"
            disabled={loading || !description.trim()}
            type="submit"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : (
              "Submit Ticket"
            )}
          </button>
        </div>

        {error && (
          <div className="p-3.5 bg-red-50/80 border border-red-200/60 rounded-lg">
            <p className="text-xs text-red-700 font-medium">{error}</p>
          </div>
        )}
      </div>
    </form>
  );
}
