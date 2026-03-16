import { Link } from 'react-router-dom';
import { Facebook, Instagram, Music2 } from 'lucide-react'; // Music2 for TikTok

export default function Footer() {
  return (
    <footer className="bg-zinc-950 border-t border-white/10 mt-20 py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold tracking-tighter text-yellow-500 mb-4">TicketLux</h3>
            <p className="text-white/60 text-sm max-w-xs">
              Your premier destination for luxury car and tech raffles. Win big with premium prizes.
            </p>
          </div>
          
          <div>
            <h4 className="font-bold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-white/60">
              <li>
                <Link to="/terms" className="hover:text-yellow-500 transition-colors">Terms & Conditions</Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-yellow-500 transition-colors">Privacy Policy</Link>
              </li>
              <li>
                <Link to="/refund" className="hover:text-yellow-500 transition-colors">Refund Policy</Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4">Socials</h4>
            <ul className="space-y-2 text-sm text-white/60">
              <li>
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-yellow-500 transition-colors">
                  <Facebook size={16} /> Facebook
                </a>
              </li>
              <li>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-yellow-500 transition-colors">
                  <Instagram size={16} /> Instagram
                </a>
              </li>
              <li>
                <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-yellow-500 transition-colors">
                  <Music2 size={16} /> TikTok
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-white/10 text-center text-sm text-white/40">
          <p>&copy; {new Date().getFullYear()} TicketLux. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
