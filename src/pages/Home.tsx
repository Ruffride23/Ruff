import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { formatDistanceToNow } from 'date-fns';
import { Ticket } from 'lucide-react';

export default function Home() {
  const [raffles, setRaffles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/raffles')
      .then(res => res.json())
      .then(data => setRaffles(data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-20 text-white/50">Loading raffles...</div>;

  const activeRaffles = raffles.filter(r => r.status === 'active');

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12">
      <section className="text-center py-12 md:py-20 px-4 bg-gradient-to-b from-yellow-900/20 to-black rounded-3xl border border-white/5">
        <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-6">
          Win <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">Luxury</span>
        </h1>
        <p className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto">
          Enter our exclusive raffles for a chance to win premium cars, cash, and the latest tech.
        </p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {activeRaffles.map(raffle => {
          const progress = (raffle.tickets_sold / raffle.total_tickets) * 100;
          const drawDate = new Date(raffle.draw_date);
          
          return (
            <motion.div 
              key={raffle.id}
              whileHover={{ y: -5 }}
              className="bg-zinc-900/50 border border-white/10 rounded-2xl overflow-hidden flex flex-col"
            >
              <div className="aspect-video relative overflow-hidden">
                <img src={raffle.prize_image} alt={raffle.title} className="w-full h-full object-cover" />
                <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-md px-3 py-1 rounded-full text-sm font-medium text-yellow-500 border border-yellow-500/30">
                  R{raffle.ticket_price.toFixed(2)}
                </div>
              </div>
              
              <div className="p-6 flex-1 flex flex-col">
                <h3 className="text-2xl font-bold mb-2">{raffle.title}</h3>
                
                <div className="mt-auto space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-white/60">
                      <span>{raffle.tickets_sold} sold</span>
                      <span>{raffle.total_tickets} total</span>
                    </div>
                    <div className="h-2 bg-black rounded-full overflow-hidden border border-white/5">
                      <div 
                        className="h-full bg-gradient-to-r from-yellow-600 to-yellow-400" 
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-white/40">Draws in</span>
                    <span className="font-mono text-yellow-500">
                      {formatDistanceToNow(drawDate)}
                    </span>
                  </div>
                  
                  <Link 
                    to={`/raffle/${raffle.id}`}
                    className="w-full flex items-center justify-center gap-2 bg-white text-black py-3 rounded-xl font-bold hover:bg-yellow-500 transition-colors"
                  >
                    <Ticket size={18} />
                    Enter Now
                  </Link>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
