import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const apiRouter = Router();

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-for-ticketlux';

// Middleware to verify JWT
const authenticate = (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

const requireAdmin = (req: any, res: any, next: any) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  next();
};

// Auth Routes
apiRouter.post('/auth/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'Missing fields' });

  try {
    const hash = bcrypt.hashSync(password, 10);
    const [result]: any = await db.execute('INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)', [name, email, hash]);
    const user = { id: result.insertId, name, email, role: 'user' };
    const token = jwt.sign(user, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user });
  } catch (err: any) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Email already exists' });
    }
    res.status(500).json({ error: 'Server error' });
  }
});

apiRouter.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const [rows]: any = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
  const user = rows[0];

  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const payload = { id: user.id, name: user.name, email: user.email, role: user.role };
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user: payload });
});

apiRouter.get('/auth/me', authenticate, (req: any, res) => {
  res.json({ user: req.user });
});

// Raffles Routes
apiRouter.get('/raffles', async (req, res) => {
  const [raffles] = await db.query('SELECT * FROM raffles ORDER BY draw_date ASC');
  res.json(raffles);
});

apiRouter.get('/raffles/:id', async (req, res) => {
  const [rows]: any = await db.execute('SELECT * FROM raffles WHERE id = ?', [req.params.id]);
  const raffle = rows[0];
  if (!raffle) return res.status(404).json({ error: 'Not found' });
  res.json(raffle);
});

// Buy Tickets
apiRouter.post('/raffles/:id/buy', authenticate, async (req: any, res) => {
  const { quantity } = req.body;
  const raffleId = req.params.id;
  const userId = req.user.id;

  if (!quantity || quantity < 1) return res.status(400).json({ error: 'Invalid quantity' });

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const [rows]: any = await connection.execute('SELECT * FROM raffles WHERE id = ? FOR UPDATE', [raffleId]);
    const raffle = rows[0];
    
    if (!raffle) {
      await connection.rollback();
      return res.status(404).json({ error: 'Raffle not found' });
    }
    if (raffle.status !== 'active') {
      await connection.rollback();
      return res.status(400).json({ error: 'Raffle is not active' });
    }
    if (raffle.tickets_sold + quantity > raffle.total_tickets) {
      await connection.rollback();
      return res.status(400).json({ error: 'Not enough tickets left' });
    }

    const tickets = [];
    for (let i = 0; i < quantity; i++) {
      const ticketNumber = `#${String(raffle.tickets_sold + i + 1).padStart(6, '0')}`;
      await connection.execute('INSERT INTO tickets (user_id, raffle_id, ticket_number) VALUES (?, ?, ?)', [userId, raffleId, ticketNumber]);
      tickets.push(ticketNumber);
    }
    
    await connection.execute('UPDATE raffles SET tickets_sold = tickets_sold + ? WHERE id = ?', [quantity, raffleId]);
    
    await connection.commit();
    res.json({ success: true, tickets });
  } catch (err) {
    await connection.rollback();
    res.status(500).json({ error: 'Purchase failed' });
  } finally {
    connection.release();
  }
});

// User Dashboard
apiRouter.get('/user/tickets', authenticate, async (req: any, res) => {
  const [tickets] = await db.execute(`
    SELECT t.id, t.ticket_number, t.purchase_date, r.title, r.prize_image, r.draw_date, r.status
    FROM tickets t
    JOIN raffles r ON t.raffle_id = r.id
    WHERE t.user_id = ?
    ORDER BY t.purchase_date DESC
  `, [req.user.id]);
  res.json(tickets);
});

// Winners
apiRouter.get('/winners', async (req, res) => {
  const [winners] = await db.query(`
    SELECT w.id, w.draw_date, r.title, r.prize_image, u.name as winner_name, t.ticket_number
    FROM winners w
    JOIN raffles r ON w.raffle_id = r.id
    JOIN users u ON w.user_id = u.id
    JOIN tickets t ON w.ticket_id = t.id
    ORDER BY w.draw_date DESC
  `);
  res.json(winners);
});

// Admin Routes
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', '..', 'uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

apiRouter.post('/admin/upload', authenticate, requireAdmin, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  res.json({ url: `/uploads/${req.file.filename}` });
});

apiRouter.get('/admin/users', authenticate, requireAdmin, async (req, res) => {
  const [users] = await db.query('SELECT id, name, email, role, created_at FROM users');
  res.json(users);
});

apiRouter.post('/admin/raffles', authenticate, requireAdmin, async (req, res) => {
  const { title, description, prize_image, ticket_price, total_tickets, draw_date, yoco_link } = req.body;
  const formattedDate = new Date(draw_date).toISOString().slice(0, 19).replace('T', ' ');
  const [result]: any = await db.execute(`
    INSERT INTO raffles (title, description, prize_image, ticket_price, total_tickets, draw_date, yoco_link)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `, [title, description, prize_image, ticket_price, total_tickets, formattedDate, yoco_link || null]);
  res.json({ id: result.insertId });
});

apiRouter.put('/admin/raffles/:id', authenticate, requireAdmin, async (req, res) => {
  const { title, description, prize_image, ticket_price, total_tickets, draw_date, status, yoco_link } = req.body;
  const formattedDate = new Date(draw_date).toISOString().slice(0, 19).replace('T', ' ');
  await db.execute(`
    UPDATE raffles SET title = ?, description = ?, prize_image = ?, ticket_price = ?, total_tickets = ?, draw_date = ?, status = ?, yoco_link = ?
    WHERE id = ?
  `, [title, description, prize_image, ticket_price, total_tickets, formattedDate, status, yoco_link || null, req.params.id]);
  res.json({ success: true });
});

apiRouter.post('/admin/raffles/:id/draw', authenticate, requireAdmin, async (req, res) => {
  const raffleId = req.params.id;
  
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    
    const [rows]: any = await connection.execute('SELECT * FROM raffles WHERE id = ? FOR UPDATE', [raffleId]);
    const raffle = rows[0];
    
    if (!raffle) {
      await connection.rollback();
      return res.status(404).json({ error: 'Not found' });
    }
    if (raffle.status === 'ended') {
      await connection.rollback();
      return res.status(400).json({ error: 'Already ended' });
    }

    const [tickets]: any = await connection.execute('SELECT * FROM tickets WHERE raffle_id = ?', [raffleId]);
    if (tickets.length === 0) {
      await connection.rollback();
      return res.status(400).json({ error: 'No tickets sold' });
    }

    const winningTicket = tickets[Math.floor(Math.random() * tickets.length)];

    await connection.execute('INSERT INTO winners (raffle_id, ticket_id, user_id) VALUES (?, ?, ?)', [raffleId, winningTicket.id, winningTicket.user_id]);
    await connection.execute('UPDATE raffles SET status = ? WHERE id = ?', ['ended', raffleId]);
    
    await connection.commit();
    res.json({ success: true, winner: winningTicket });
  } catch (err) {
    await connection.rollback();
    res.status(500).json({ error: 'Draw failed' });
  } finally {
    connection.release();
  }
});
