import * as esbuild from 'esbuild';

esbuild.build({
  entryPoints: ['server.ts'],
  bundle: true,
  platform: 'node',
  target: 'node20',
  outfile: 'dist/server.cjs',
  format: 'cjs',
  external: ['express', 'better-sqlite3', 'bcryptjs', 'jsonwebtoken', 'dotenv', 'vite'],
}).catch(() => process.exit(1));
