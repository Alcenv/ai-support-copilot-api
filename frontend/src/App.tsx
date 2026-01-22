import NewTicketForm from "./components/NewTicketForm";
import TicketList from "./components/TicketList";
import { TicketsProvider, useTicketsContext } from "./contexts/TicketsContext";

function AppContent() {
  const { addOptimisticTicket } = useTicketsContext();

  return (
    <div className="min-h-screen bg-gray-50/50">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-baseline justify-between py-5">
            <div>
              <h1 className="text-xl font-semibold text-gray-900 tracking-tight">AI Support Copilot</h1>
              <p className="text-xs text-gray-500 mt-1">Real-time ticket processing</p>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-gray-400">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
              <span>Live</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="lg:sticky lg:top-[100px] lg:self-start">
            <NewTicketForm onOptimisticAdd={addOptimisticTicket} />
          </div>

          <div>
            <div className="mb-5">
              <h2 className="text-base font-semibold text-gray-900">Tickets</h2>
              <p className="text-xs text-gray-500 mt-0.5">Processed automatically with AI</p>
            </div>
            <TicketList />
          </div>
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <TicketsProvider>
      <AppContent />
    </TicketsProvider>
  );
}
