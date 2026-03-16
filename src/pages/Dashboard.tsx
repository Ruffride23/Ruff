import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { format } from 'date-fns';
import { Ticket, Clock, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

export default function Dashboard() {
  const { user, token, loading } = useAuth();
  const [tickets, setTickets] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (token) {
      fetch('/api/user/tickets', {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => setTickets(data))
      .finally(() => setFetching(false));
    }
  }, [token]);

  if (loading || fetching) return <div className="text-center py-20 text-white/50">Loading dashboard...</div>;
  if (!user) return <Navigate to="/login" />;

  const activeTickets = tickets.filter(t => t.status === 'active');
  const pastTickets = tickets.filter(t => t.status === 'ended');

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12 max-w-6xl mx-auto">
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b border-white/10 pb-8">
        <div>
          <h1 className="text-4xl font-bold tracking-tighter mb-2">My Dashboard</h1>
          <p className="text-white/60">Welcome back, {user.name}</p>
        </div>
        <div className="flex gap-4 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
          <div className="bg-zinc-900/50 border border-white/10 rounded-2xl p-4 text-center min-w-[120px] flex-1 md:flex-none">
            <p className="text-sm text-white/40 mb-1">Active</p>
            <p className="text-3xl font-bold text-yellow-500">{activeTickets.length}</p>
          </div>
          <div className="bg-zinc-900/50 border border-white/10 rounded-2xl p-4 text-center min-w-[120px] flex-1 md:flex-none">
            <p className="text-sm text-white/40 mb-1">Past</p>
            <p className="text-3xl font-bold text-white/80">{pastTickets.length}</p>
          </div>
        </div>
      </header>

      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Clock className="text-yellow-500" />
            Active Raffles
          </h2>
          
          {activeTickets.length === 0 ? (
            <div className="text-center py-12 bg-zinc-900/30 border border-white/5 rounded-2xl text-white/40">
              You have no active entries.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeTickets.map(ticket => (
                <div key={ticket.id} className="bg-zinc-900/50 border border-white/10 rounded-2xl overflow-hidden flex flex-col">
                  <div className="h-32 relative overflow-hidden">
                    <img src={ticket.prize_image} alt={ticket.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                      <h3 className="font-bold text-lg leading-tight">{ticket.title}</h3>
                    </div>
                  </div>
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-white/40">Ticket Number</span>
                        <span className="font-mono text-yellow-500 font-bold">{ticket.ticket_number}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-white/40">Purchased</span>
                        <span>{format(new Date(ticket.purchase_date), 'MMM d, yyyy')}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-white/40">Draw Date</span>
                        <span>{format(new Date(ticket.draw_date), 'MMM d, yyyy')}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <CheckCircle2 className="text-white/40" />
            Past Raffles
          </h2>
          
          {pastTickets.length === 0 ? (
            <div className="text-center py-12 bg-zinc-900/30 border border-white/5 rounded-2xl text-white/40">
              You have no past entries.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-60">
              {pastTickets.map(ticket => (
                <div key={ticket.id} className="bg-zinc-900/50 border border-white/10 rounded-2xl overflow-hidden flex flex-col grayscale hover:grayscale-0 transition-all">
                  <div className="h-24 relative overflow-hidden">
                    <img src={ticket.prize_image} alt={ticket.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 to-transparent" />
                    <div className="absolute bottom-2 left-4 right-4">
                      <h3 className="font-bold text-sm leading-tight">{ticket.title}</h3>
                    </div>
                  </div>
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-white/40">Ticket Number</span>
                        <span className="font-mono">{ticket.ticket_number}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-white/40">Draw Date</span>
                        <span>{format(new Date(ticket.draw_date), 'MMM d, yyyy')}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </motion.div>
  );
}
