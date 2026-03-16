import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { format } from 'date-fns';
import { Trophy, Star } from 'lucide-react';

export default function Winners() {
  const [winners, setWinners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/winners')
      .then(res => res.json())
      .then(data => setWinners(data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-20 text-white/50">Loading winners...</div>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12 max-w-6xl mx-auto">
      <header className="text-center py-12 md:py-16 px-4 bg-gradient-to-b from-yellow-900/20 to-black rounded-3xl border border-white/5">
        <Trophy className="mx-auto text-yellow-500 mb-6" size={64} />
        <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mb-4">
          Hall of <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">Fame</span>
        </h1>
        <p className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto">
          Meet the lucky winners of our exclusive luxury raffles.
        </p>
      </header>

      {winners.length === 0 ? (
        <div className="text-center py-20 bg-zinc-900/30 border border-white/5 rounded-3xl text-white/40">
          <Star className="mx-auto mb-4 opacity-50" size={48} />
          <p className="text-xl">No winners yet. Be the first!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {winners.map(winner => (
            <motion.div 
              key={winner.id}
              whileHover={{ y: -5 }}
              className="bg-zinc-900/50 border border-yellow-500/20 rounded-2xl overflow-hidden flex flex-col relative"
            >
              <div className="absolute top-4 right-4 bg-yellow-500 text-black px-3 py-1 rounded-full text-xs font-bold z-10 flex items-center gap-1 shadow-lg shadow-yellow-500/20">
                <Trophy size={12} /> Winner
              </div>
              
              <div className="aspect-video relative overflow-hidden">
                <img src={winner.prize_image} alt={winner.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 to-transparent" />
              </div>
              
              <div className="p-6 flex-1 flex flex-col -mt-12 relative z-10">
                <div className="bg-black/80 backdrop-blur-md border border-white/10 rounded-xl p-4 mb-4">
                  <p className="text-sm text-white/40 mb-1">Prize</p>
                  <h3 className="text-xl font-bold">{winner.title}</h3>
                </div>
                
                <div className="space-y-3 mt-auto">
                  <div className="flex justify-between items-center border-b border-white/5 pb-3">
                    <span className="text-white/40 text-sm">Winner</span>
                    <span className="font-bold text-lg">{winner.winner_name}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-white/5 pb-3">
                    <span className="text-white/40 text-sm">Winning Ticket</span>
                    <span className="font-mono text-yellow-500 font-bold">{winner.ticket_number}</span>
                  </div>
                  <div className="flex justify-between items-center pt-1">
                    <span className="text-white/40 text-sm">Draw Date</span>
                    <span className="text-sm">{format(new Date(winner.draw_date), 'MMMM d, yyyy')}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
