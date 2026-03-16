import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { formatDistanceToNow } from 'date-fns';
import { Ticket, Minus, Plus, ShoppingCart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function RaffleDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  
  const [raffle, setRaffle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [purchasing, setPurchasing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`/api/raffles/${id}`)
      .then(res => res.json())
      .then(data => setRaffle(data))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="text-center py-20 text-white/50">Loading raffle...</div>;
  if (!raffle) return <div className="text-center py-20 text-red-500">Raffle not found</div>;

  const progress = (raffle.tickets_sold / raffle.total_tickets) * 100;
  const drawDate = new Date(raffle.draw_date);
  const remaining = raffle.total_tickets - raffle.tickets_sold;

  const handleBuy = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    setPurchasing(true);
    setError('');

    try {
      const res = await fetch(`/api/raffles/${id}/buy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ quantity })
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Purchase failed');
      }

      if (raffle.yoco_link) {
        window.location.href = raffle.yoco_link;
        return;
      }

      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setPurchasing(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-6">
          <div className="aspect-square rounded-3xl overflow-hidden border border-white/10 bg-zinc-900">
            <img src={raffle.prize_image} alt={raffle.title} className="w-full h-full object-cover" />
          </div>
        </div>

        <div className="space-y-8 flex flex-col justify-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tighter mb-4">{raffle.title}</h1>
            <p className="text-white/60 text-lg">{raffle.description}</p>
          </div>

          <div className="p-6 bg-zinc-900/50 border border-white/10 rounded-2xl space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
              <div>
                <p className="text-sm text-white/40 mb-1">Ticket Price</p>
                <p className="text-4xl font-bold text-yellow-500">R{raffle.ticket_price.toFixed(2)}</p>
              </div>
              <div className="text-left sm:text-right">
                <p className="text-sm text-white/40 mb-1">Draws in</p>
                <p className="text-xl font-mono">{formatDistanceToNow(drawDate)}</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm text-white/60">
                <span>{raffle.tickets_sold} sold</span>
                <span>{remaining} remaining</span>
              </div>
              <div className="h-3 bg-black rounded-full overflow-hidden border border-white/5">
                <div 
                  className="h-full bg-gradient-to-r from-yellow-600 to-yellow-400" 
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {raffle.status === 'active' ? (
              <div className="space-y-4 pt-4 border-t border-white/10">
                <div className="flex items-center justify-between">
                  <span className="text-white/60">Select Entries</span>
                  <div className="flex items-center gap-4 bg-black rounded-xl p-1 border border-white/10">
                    <button 
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                      <Minus size={20} />
                    </button>
                    <span className="w-12 text-center font-mono text-xl">{quantity}</span>
                    <button 
                      onClick={() => setQuantity(Math.min(remaining, quantity + 1))}
                      className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                      <Plus size={20} />
                    </button>
                  </div>
                </div>

                <div className="flex justify-between items-center py-4 text-xl">
                  <span className="text-white/60">Total</span>
                  <span className="font-bold">R{(raffle.ticket_price * quantity).toFixed(2)}</span>
                </div>

                {error && <p className="text-red-500 text-sm">{error}</p>}

                <button 
                  onClick={handleBuy}
                  disabled={purchasing || remaining < 1}
                  className="w-full flex items-center justify-center gap-2 bg-yellow-500 text-black py-4 rounded-xl font-bold text-lg hover:bg-yellow-400 transition-colors disabled:opacity-50"
                >
                  {purchasing ? (
                    'Processing...'
                  ) : (
                    <>
                      <ShoppingCart size={20} />
                      {raffle.yoco_link ? `Pay R${(raffle.ticket_price * quantity).toFixed(2)} with Yoco` : `Buy ${quantity} ${quantity === 1 ? 'Entry' : 'Entries'}`}
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-center font-bold">
                This raffle has ended
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
