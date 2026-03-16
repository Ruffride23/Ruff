import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Shield, Users, Ticket, Plus, Play, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

export default function AdminDashboard() {
  const { user, token, loading } = useAuth();
  const [raffles, setRaffles] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingRaffleId, setEditingRaffleId] = useState<number | null>(null);
  
  // New/Edit Raffle Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [prizeImage, setPrizeImage] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [ticketPrice, setTicketPrice] = useState('');
  const [totalTickets, setTotalTickets] = useState('');
  const [drawDate, setDrawDate] = useState('');
  const [status, setStatus] = useState('active');
  const [yocoLink, setYocoLink] = useState('');

  useEffect(() => {
    if (token && user?.role === 'admin') {
      fetchData();
    }
  }, [token, user]);

  const fetchData = () => {
    Promise.all([
      fetch('/api/raffles').then(res => res.json()),
      fetch('/api/admin/users', { headers: { Authorization: `Bearer ${token}` } }).then(res => res.json())
    ])
    .then(([rafflesData, usersData]) => {
      setRaffles(rafflesData);
      setUsers(usersData);
    })
    .finally(() => setFetching(false));
  };

  if (loading || fetching) return <div className="text-center py-20 text-white/50">Loading admin...</div>;
  if (!user || user.role !== 'admin') return <Navigate to="/" />;

  const handleDraw = async (raffleId: number) => {
    if (!confirm('Are you sure you want to draw a winner for this raffle?')) return;

    try {
      const res = await fetch(`/api/admin/raffles/${raffleId}/draw`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      
      if (res.ok) {
        alert(`Winner drawn! Ticket: ${data.winner.ticket_number}`);
        setRaffles(raffles.map(r => r.id === raffleId ? { ...r, status: 'ended' } : r));
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert('Failed to draw winner');
    }
  };

  const openCreateModal = () => {
    setTitle('');
    setDescription('');
    setPrizeImage('');
    setImageFile(null);
    setTicketPrice('');
    setTotalTickets('');
    setDrawDate('');
    setStatus('active');
    setYocoLink('');
    setEditingRaffleId(null);
    setEditMode(false);
    setShowModal(true);
  };

  const openEditModal = (raffle: any) => {
    setTitle(raffle.title);
    setDescription(raffle.description);
    setPrizeImage(raffle.prize_image);
    setImageFile(null);
    setTicketPrice(raffle.ticket_price.toString());
    setTotalTickets(raffle.total_tickets.toString());
    setYocoLink(raffle.yoco_link || '');
    
    // Format date for datetime-local input
    const date = new Date(raffle.draw_date);
    const formattedDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    setDrawDate(formattedDate);
    
    setStatus(raffle.status);
    setEditingRaffleId(raffle.id);
    setEditMode(true);
    setShowModal(true);
  };

  const handleSubmitRaffle = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let finalImageUrl = prizeImage;

      if (imageFile) {
        const formData = new FormData();
        formData.append('image', imageFile);
        
        const uploadRes = await fetch('/api/admin/upload', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`
          },
          body: formData
        });
        
        if (!uploadRes.ok) {
          throw new Error('Failed to upload image');
        }
        
        const uploadData = await uploadRes.json();
        finalImageUrl = uploadData.url;
      }

      if (!finalImageUrl) {
        throw new Error('Please provide an image URL or upload a file');
      }

      const url = editMode ? `/api/admin/raffles/${editingRaffleId}` : '/api/admin/raffles';
      const method = editMode ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({
          title,
          description,
          prize_image: finalImageUrl,
          ticket_price: parseFloat(ticketPrice),
          total_tickets: parseInt(totalTickets),
          draw_date: new Date(drawDate).toISOString(),
          status: editMode ? status : 'active',
          yoco_link: yocoLink
        })
      });
      
      if (res.ok) {
        setShowModal(false);
        fetchData();
        // Reset form
        setTitle('');
        setDescription('');
        setPrizeImage('');
        setImageFile(null);
        setTicketPrice('');
        setTotalTickets('');
        setDrawDate('');
        setStatus('active');
        setYocoLink('');
      } else {
        const data = await res.json();
        alert(data.error || `Failed to ${editMode ? 'update' : 'create'} raffle`);
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : `Failed to ${editMode ? 'update' : 'create'} raffle`);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12 max-w-6xl mx-auto relative">
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b border-white/10 pb-8">
        <div className="flex items-center gap-4">
          <Shield className="text-yellow-500" size={48} />
          <div>
            <h1 className="text-4xl font-bold tracking-tighter mb-2">Admin Control</h1>
            <p className="text-white/60">Manage raffles and users</p>
          </div>
        </div>
        <div className="flex gap-4 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
          <div className="bg-zinc-900/50 border border-white/10 rounded-2xl p-4 text-center min-w-[120px] flex-1 md:flex-none">
            <p className="text-sm text-white/40 mb-1">Revenue</p>
            <p className="text-3xl font-bold text-emerald-500">
              R{raffles.reduce((acc, r) => acc + (r.ticket_price * r.tickets_sold), 0).toFixed(2)}
            </p>
          </div>
          <div className="bg-zinc-900/50 border border-white/10 rounded-2xl p-4 text-center min-w-[120px] flex-1 md:flex-none">
            <p className="text-sm text-white/40 mb-1">Users</p>
            <p className="text-3xl font-bold text-white">{users.length}</p>
          </div>
          <div className="bg-zinc-900/50 border border-white/10 rounded-2xl p-4 text-center min-w-[120px] flex-1 md:flex-none">
            <p className="text-sm text-white/40 mb-1">Active</p>
            <p className="text-3xl font-bold text-yellow-500">{raffles.filter(r => r.status === 'active').length}</p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <section>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Ticket className="text-yellow-500" />
                Manage Raffles
              </h2>
              <button 
                onClick={openCreateModal}
                className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-xl text-sm font-bold hover:bg-yellow-500 transition-colors w-full sm:w-auto justify-center"
              >
                <Plus size={16} /> New Raffle
              </button>
            </div>
            
            <div className="bg-zinc-900/50 border border-white/10 rounded-2xl overflow-x-auto">
              <table className="w-full text-left min-w-[800px]">
                <thead className="bg-black/50 border-b border-white/10 text-white/40 text-sm">
                  <tr>
                    <th className="p-4 font-medium">Title</th>
                    <th className="p-4 font-medium">Ticket Price</th>
                    <th className="p-4 font-medium">Total Value</th>
                    <th className="p-4 font-medium">Revenue</th>
                    <th className="p-4 font-medium">Sold</th>
                    <th className="p-4 font-medium">Status</th>
                    <th className="p-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {raffles.map(raffle => (
                    <tr key={raffle.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-4 font-medium">{raffle.title}</td>
                      <td className="p-4 text-yellow-500">R{raffle.ticket_price.toFixed(2)}</td>
                      <td className="p-4 text-white/80">R{(raffle.ticket_price * raffle.total_tickets).toFixed(2)}</td>
                      <td className="p-4 text-emerald-500">R{(raffle.ticket_price * raffle.tickets_sold).toFixed(2)}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-black rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-yellow-500" 
                              style={{ width: `${(raffle.tickets_sold / raffle.total_tickets) * 100}%` }}
                            />
                          </div>
                          <span className="text-xs text-white/60">{raffle.tickets_sold}/{raffle.total_tickets}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${raffle.status === 'active' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                          {raffle.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => openEditModal(raffle)}
                            className="flex items-center gap-1 bg-white/10 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-white/20 transition-colors"
                          >
                            Edit
                          </button>
                          {raffle.status === 'active' && (
                            <button 
                              onClick={() => handleDraw(raffle.id)}
                              className="flex items-center gap-1 bg-yellow-500 text-black px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-yellow-400 transition-colors"
                            >
                              <Play size={12} /> Draw Winner
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Users className="text-white/40" />
              Recent Users
            </h2>
            
            <div className="bg-zinc-900/50 border border-white/10 rounded-2xl overflow-hidden divide-y divide-white/5">
              {users.slice(0, 5).map(u => (
                <div key={u.id} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                  <div>
                    <p className="font-medium">{u.name}</p>
                    <p className="text-xs text-white/40">{u.email}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${u.role === 'admin' ? 'bg-yellow-500/20 text-yellow-500' : 'bg-white/10 text-white/60'}`}>
                    {u.role}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-zinc-900 border border-white/10 rounded-3xl p-6 md:p-8 max-w-md w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">{editMode ? 'Edit Raffle' : 'Create Raffle'}</h2>
              <button onClick={() => setShowModal(false)} className="text-white/60 hover:text-white">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmitRaffle} className="space-y-4">
              <div>
                <label className="text-sm text-white/60 mb-1 block">Title</label>
                <input type="text" required value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-black border border-white/10 rounded-xl px-4 py-2" />
              </div>
              <div>
                <label className="text-sm text-white/60 mb-1 block">Description</label>
                <textarea required value={description} onChange={e => setDescription(e.target.value)} className="w-full bg-black border border-white/10 rounded-xl px-4 py-2 h-24" />
              </div>
              <div>
                <label className="text-sm text-white/60 mb-1 block">Image</label>
                <div className="flex flex-col gap-2">
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={e => {
                      if (e.target.files && e.target.files[0]) {
                        setImageFile(e.target.files[0]);
                        setPrizeImage('');
                      }
                    }} 
                    className="w-full bg-black border border-white/10 rounded-xl px-4 py-2 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-yellow-500 file:text-black hover:file:bg-yellow-400" 
                  />
                  <div className="text-center text-xs text-white/40 font-bold">OR</div>
                  <input 
                    type="url" 
                    placeholder="Image URL"
                    value={prizeImage} 
                    onChange={e => {
                      setPrizeImage(e.target.value);
                      setImageFile(null);
                    }} 
                    className="w-full bg-black border border-white/10 rounded-xl px-4 py-2" 
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-white/60 mb-1 block">Ticket Price (R)</label>
                  <input type="number" step="0.01" required value={ticketPrice} onChange={e => setTicketPrice(e.target.value)} className="w-full bg-black border border-white/10 rounded-xl px-4 py-2" />
                </div>
                <div>
                  <label className="text-sm text-white/60 mb-1 block">Total Tickets</label>
                  <input type="number" required value={totalTickets} onChange={e => setTotalTickets(e.target.value)} className="w-full bg-black border border-white/10 rounded-xl px-4 py-2" />
                </div>
              </div>
              <div>
                <label className="text-sm text-white/60 mb-1 block">Draw Date</label>
                <input type="datetime-local" required value={drawDate} onChange={e => setDrawDate(e.target.value)} className="w-full bg-black border border-white/10 rounded-xl px-4 py-2" />
              </div>

              <div>
                <label className="text-sm text-white/60 mb-1 block">Yoco Payment Link (Optional)</label>
                <input type="url" placeholder="https://pay.yoco.com/..." value={yocoLink} onChange={e => setYocoLink(e.target.value)} className="w-full bg-black border border-white/10 rounded-xl px-4 py-2" />
              </div>

              {editMode && (
                <div>
                  <label className="text-sm text-white/60 mb-1 block">Status</label>
                  <select value={status} onChange={e => setStatus(e.target.value)} className="w-full bg-black border border-white/10 rounded-xl px-4 py-2">
                    <option value="active">Active</option>
                    <option value="ended">Ended</option>
                  </select>
                </div>
              )}
              
              <button type="submit" className="w-full bg-yellow-500 text-black font-bold py-3 rounded-xl mt-4 hover:bg-yellow-400 transition-colors">
                {editMode ? 'Save Changes' : 'Create Raffle'}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
