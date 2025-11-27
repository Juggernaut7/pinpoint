import { MongoClient, Db } from 'mongodb';

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

const options = {
  serverSelectionTimeoutMS: 10000, // Increased to 10s
  socketTimeoutMS: 45000,
  connectTimeoutMS: 10000,
};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

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

// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
export default clientPromise;

export async function getDb(): Promise<Db> {
  const client = await clientPromise;
  return client.db('pinpoint');
}

