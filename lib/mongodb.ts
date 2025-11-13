import { MongoClient } from 'mongodb'

const options = {}

let clientPromise: Promise<MongoClient> | null = null

function getClientPromise(): Promise<MongoClient> {
  if (clientPromise) {
    return clientPromise
  }

  const uri = process.env.MONGODB_URI
  
  if (!uri) {
    throw new Error('MONGODB_URI is not defined in environment variables')
  }

  if (process.env.NODE_ENV === 'development') {
    // Development mode with HMR support
    let globalWithMongo = global as typeof globalThis & {
      _mongoClientPromise?: Promise<MongoClient>
    }

    if (!globalWithMongo._mongoClientPromise) {
      const client = new MongoClient(uri, options)
      globalWithMongo._mongoClientPromise = client.connect()
    }
    clientPromise = globalWithMongo._mongoClientPromise
  } else {
    // Production mode
    const client = new MongoClient(uri, options)
    clientPromise = client.connect()
  }

  return clientPromise
}

// Export a function that returns the promise, not the promise itself
// This way it's only created when actually called
export default getClientPromise()
