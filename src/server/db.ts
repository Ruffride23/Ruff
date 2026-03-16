import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

// Create a connection pool
export const db = mysql.createPool({
  uri: process.env.DATABASE_URL || 'mysql://root:password@localhost:3306/ticketlux',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  decimalNumbers: true
});

export async function initDb() {
  try {
    // Initialize database schema
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS raffles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        prize_image VARCHAR(255),
        ticket_price DECIMAL(10, 2) NOT NULL,
        total_tickets INT NOT NULL,
        tickets_sold INT DEFAULT 0,
        draw_date DATETIME NOT NULL,
        status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'ended')),
        yoco_link VARCHAR(255)
      )
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS tickets (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        raffle_id INT NOT NULL,
        ticket_number VARCHAR(50) NOT NULL,
        purchase_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (raffle_id) REFERENCES raffles(id)
      )
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS winners (
        id INT AUTO_INCREMENT PRIMARY KEY,
        raffle_id INT NOT NULL,
        ticket_id INT NOT NULL,
        user_id INT NOT NULL,
        draw_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (raffle_id) REFERENCES raffles(id),
        FOREIGN KEY (ticket_id) REFERENCES tickets(id),
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    // Add yoco_link column if it doesn't exist (migration)
    try {
      await db.query('ALTER TABLE raffles ADD COLUMN yoco_link VARCHAR(255)');
    } catch (err: any) {
      // Ignore error if column already exists
      if (!err.message.includes('Duplicate column name')) {
        console.error('Migration error:', err);
      }
    }

    // Seed initial admin user if not exists
    const adminEmail = 'admin@ticketlux.com';
    const [adminRows]: any = await db.execute('SELECT * FROM users WHERE email = ?', [adminEmail]);
    if (adminRows.length === 0) {
      const hash = bcrypt.hashSync('admin123', 10);
      await db.execute('INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)', ['Admin', adminEmail, hash, 'admin']);
    }

    // Seed some initial raffles if none exist
    const [raffleCountRows]: any = await db.query('SELECT COUNT(*) as count FROM raffles');
    if (raffleCountRows[0].count === 0) {
      const raffles = [
        { title: 'BMW M3', price: 51.30, total: 10000, image: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&q=80&w=800' },
        { title: 'VW Polo GTI', price: 25.20, total: 5000, image: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&q=80&w=800' },
        { title: 'Toyota Fortuner GD-6', price: 36.50, total: 8000, image: 'https://images.unsplash.com/photo-1626668893632-6f3a4466d22f?auto=format&fit=crop&q=80&w=800' },
        { title: 'Ford Ranger Wildtrak', price: 45.10, total: 9000, image: 'https://images.unsplash.com/photo-1559416523-140ddc3d238c?auto=format&fit=crop&q=80&w=800' },
        { title: 'iPhone 17 Pro 256GB', price: 19.20, total: 3000, image: 'https://images.unsplash.com/photo-1696446701796-da61225697cc?auto=format&fit=crop&q=80&w=800' },
        { title: 'iPhone 16 Pro 256GB', price: 15.60, total: 2500, image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&q=80&w=800' },
        { title: 'iPhone 15 Pro 512GB', price: 13.10, total: 2000, image: 'https://images.unsplash.com/photo-1695048064952-1f4134812f86?auto=format&fit=crop&q=80&w=800' },
        { title: 'iPhone 14 Pro 128GB', price: 11.05, total: 1500, image: 'https://images.unsplash.com/photo-1663465373015-322f54165115?auto=format&fit=crop&q=80&w=800' },
      ];
      
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      const formattedDate = nextMonth.toISOString().slice(0, 19).replace('T', ' ');
      
      for (const r of raffles) {
        await db.execute(
          'INSERT INTO raffles (title, description, prize_image, ticket_price, total_tickets, draw_date) VALUES (?, ?, ?, ?, ?, ?)',
          [r.title, 'Win this amazing prize!', r.image, r.price, r.total, formattedDate]
        );
      }
    }
  } catch (err) {
    console.error('Database initialization failed:', err);
  }
}
