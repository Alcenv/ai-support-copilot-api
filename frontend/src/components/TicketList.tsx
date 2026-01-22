import { useTicketsContext } from "../contexts/TicketsContext";
import type { Ticket } from "../hooks/useTickets";

function TicketCard({ ticket }: { ticket: Ticket }) {
  const getSentimentColor = (sentiment: string | null) => {
    if (!sentiment) return "bg-gray-50/80 text-gray-600 border-gray-200/60";
    const lower = sentiment.toLowerCase();
    if (lower.includes("negative")) return "bg-red-50/80 text-red-700 border-red-200/60";
    if (lower.includes("positive")) return "bg-green-50/80 text-green-700 border-green-200/60";
    return "bg-gray-50/80 text-gray-600 border-gray-200/60";
  };

  const statusConfig = ticket.processed
    ? {
        label: "Processed",
        className: "bg-emerald-50 text-emerald-700 border-emerald-200/60",
        dot: "bg-emerald-500",
      }
    : {
        label: "Pending",
        className: "bg-amber-50 text-amber-700 border-amber-200/60",
        dot: "bg-amber-500",
      };

  return (
    <div className="bg-white rounded-xl border border-gray-200/60 p-5 transition-all duration-200 hover:border-gray-300/80 hover:shadow-sm">
      <div className="flex items-start justify-between mb-3.5">
        <time className="text-xs text-gray-500 font-medium">
          {new Date(ticket.created_at).toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </time>
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${statusConfig.className}`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`}></span>
          {statusConfig.label}
        </span>
      </div>

      <p className="text-gray-900 text-sm leading-relaxed mb-4">{ticket.description}</p>

      <div className="flex flex-wrap gap-2 pt-3.5 border-t border-gray-100/80">
        <span className="px-2.5 py-1 rounded-md bg-gray-50/80 text-gray-700 text-xs font-medium border border-gray-200/60">
          {ticket.category ?? "Uncategorized"}
        </span>
        {ticket.sentiment && (
          <span className={`px-2.5 py-1 rounded-md text-xs font-medium border ${getSentimentColor(ticket.sentiment)}`}>
            {ticket.sentiment}
          </span>
        )}
      </div>
    </div>
  );
}

function TicketSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-200/60 p-5 animate-pulse">
      <div className="flex items-start justify-between mb-3.5">
        <div className="h-3 w-32 bg-gray-200/60 rounded"></div>
        <div className="h-6 w-20 bg-gray-200/60 rounded-md"></div>
      </div>
      <div className="space-y-2 mb-4">
        <div className="h-4 bg-gray-200/60 rounded w-full"></div>
        <div className="h-4 bg-gray-200/60 rounded w-5/6"></div>
        <div className="h-4 bg-gray-200/60 rounded w-4/6"></div>
      </div>
      <div className="pt-3.5 border-t border-gray-100/80 flex gap-2">
        <div className="h-6 w-24 bg-gray-200/60 rounded-md"></div>
        <div className="h-6 w-20 bg-gray-200/60 rounded-md"></div>
      </div>
    </div>
  );
}

export default function TicketList() {
  const { tickets, loading } = useTicketsContext();

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <TicketSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (tickets.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200/60 p-12 text-center">
        <div className="max-w-sm mx-auto">
          <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-gray-100/80 flex items-center justify-center">
            <svg
              className="w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h3 className="text-sm font-semibold text-gray-900 mb-1.5">No tickets yet</h3>
          <p className="text-xs text-gray-500">
            Create your first ticket to get started. AI will process it automatically.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3.5">
      {tickets.map((ticket) => (
        <TicketCard key={ticket.id} ticket={ticket} />
      ))}
    </div>
  );
}
