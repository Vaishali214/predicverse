import EmbeddedPostgres from 'embedded-postgres';
import net from 'net';
import dotenv from 'dotenv';

dotenv.config();

let embeddedPgInstance: EmbeddedPostgres | null = null;

export async function ensureDatabaseReady(): Promise<void> {
  const dbUrl = process.env.DATABASE_URL || '';
  const isLocalHost = dbUrl.includes('127.0.0.1') || dbUrl.includes('localhost');

  if (!isLocalHost) {
    console.log('[Database] Remote PostgreSQL configuration detected.');
    return;
  }

  // Check if PostgreSQL port 5432 is accepting connections
  const isPortOpen = await new Promise<boolean>((resolve) => {
    const socket = net.createConnection({ port: 5432, host: '127.0.0.1' });
    socket.on('connect', () => {
      socket.end();
      resolve(true);
    });
    socket.on('error', () => {
      resolve(false);
    });
  });

  if (isPortOpen) {
    console.log('[Database] PostgreSQL is ready on port 5432.');
    return;
  }

  console.log('[Database] Starting Embedded PostgreSQL engine on 127.0.0.1:5432...');
  embeddedPgInstance = new EmbeddedPostgres({
    port: 5432,
    user: 'postgres',
    password: 'postgres_password',
    dataDir: './data/db',
  } as any);

  try {
    await embeddedPgInstance.initialise();
  } catch {
    // Already initialized
  }

  await embeddedPgInstance.start();
  console.log('[Database] Embedded PostgreSQL engine successfully started.');
}

export async function stopDatabaseServer(): Promise<void> {
  if (embeddedPgInstance) {
    try {
      await embeddedPgInstance.stop();
      console.log('[Database] Embedded PostgreSQL engine stopped.');
    } catch {
      // Ignore errors on exit
    }
  }
}
