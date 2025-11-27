import { MongoClient, Db } from 'mongodb';

const options = {
  serverSelectionTimeoutMS: 10000, // Increased to 10s
  socketTimeoutMS: 45000,
  connectTimeoutMS: 10000,
};

let client: MongoClient | undefined;
let clientPromise: Promise<MongoClient> | undefined;

function getMongoUri(): string {
  if (!process.env.MONGODB_URI) {
    throw new Error('Please add your Mongo URI to .env or .env.local');
  }

  if (process.env.MONGODB_URI.includes('xxxxx')) {
    throw new Error('MongoDB URI contains placeholder. Please replace cluster0.xxxxx.mongodb.net with your real cluster address from MongoDB Atlas.');
  }

  let uri: string = process.env.MONGODB_URI;

  // Auto-fix URI if it's missing database name or query params
  if (uri) {
    // If URI ends with just /, add database name and query params
    if (uri.endsWith('/') && !uri.includes('?')) {
      uri = uri.replace(/\/$/, '/pinpoint?retryWrites=true&w=majority');
      console.log('[MongoDB] Auto-fixed URI: added database name and query params');
    }
    // If URI doesn't have query params, add them
    else if (!uri.includes('?')) {
      uri = uri + (uri.endsWith('/') ? '' : '/') + '?retryWrites=true&w=majority';
      console.log('[MongoDB] Auto-fixed URI: added query params');
    }
  }

  return uri;
}

function getClientPromise(): Promise<MongoClient> {
  if (clientPromise) {
    return clientPromise;
  }

  const uri = getMongoUri();

  if (process.env.NODE_ENV === 'development') {
    // In development mode, use a global variable so that the value
    // is preserved across module reloads caused by HMR (Hot Module Replacement).
    let globalWithMongo = global as typeof globalThis & {
      _mongoClientPromise?: Promise<MongoClient>;
    };

    if (!globalWithMongo._mongoClientPromise) {
      client = new MongoClient(uri, options);
      globalWithMongo._mongoClientPromise = client.connect();
    }
    clientPromise = globalWithMongo._mongoClientPromise;
  } else {
    // In production mode, it's best to not use a global variable.
    client = new MongoClient(uri, options);
    clientPromise = client.connect();
  }

  return clientPromise;
}

// Export a function that returns the client promise (lazy initialization)
// This prevents errors during build time when MONGODB_URI is not set
export default getClientPromise;

export async function getDb(): Promise<Db> {
  const client = await getClientPromise();
  return client.db('pinpoint');
}

