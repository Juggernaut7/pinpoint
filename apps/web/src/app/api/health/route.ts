import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

// GET /api/health - Check MongoDB connection and env vars
export async function GET() {
  const mongoUri = process.env.MONGODB_URI || '';
  // Mask the URI for security but show if it's a placeholder
  const uriPreview = mongoUri 
    ? mongoUri.replace(/mongodb\+srv:\/\/([^:]+):([^@]+)@/, 'mongodb+srv://***:***@')
    : 'NOT SET';
  
  // Check if URI format is correct
  const uriFormatOk = mongoUri && mongoUri.includes('?') && !mongoUri.endsWith('/');
  const uriNeedsFix = mongoUri && (mongoUri.endsWith('/') || !mongoUri.includes('?'));
  
  const checks: Record<string, any> = {
    mongodb_uri: mongoUri ? uriPreview : 'NOT SET',
    uri_format: uriFormatOk ? 'OK' : uriNeedsFix ? 'NEEDS FIX (missing db name or query params)' : 'UNKNOWN',
    is_placeholder: mongoUri.includes('xxxxx') ? 'YES - Replace with real cluster!' : 'NO',
    wc_project_id: process.env.NEXT_PUBLIC_WC_PROJECT_ID ? 'SET' : 'NOT SET',
    issuer_key: process.env.MINIPAY_ISSUER_PRIVATE_KEY ? 'SET' : 'NOT SET',
    issuer_address: process.env.MINIPAY_ISSUER_ADDRESS ? 'SET' : 'NOT SET',
  };
  
  if (uriNeedsFix) {
    checks.fix_hint = 'URI should end with: /pinpoint?retryWrites=true&w=majority';
  }

  try {
    const db = await getDb();
    await db.admin().ping();
    checks.mongodb_connection = 'CONNECTED';
    
    // Test a simple query
    const collections = await db.listCollections().toArray();
    checks.collections = collections.map((c) => c.name);
    
    // Count documents in each collection
    const counts: Record<string, number> = {};
    for (const coll of collections) {
      counts[coll.name] = await db.collection(coll.name).countDocuments();
    }
    checks.document_counts = counts;
    
    return NextResponse.json({ status: 'healthy', checks }, { status: 200 });
  } catch (error) {
    checks.mongodb_connection = 'FAILED';
    const err = error instanceof Error ? error : new Error(String(error));
    checks.error = err.message;
    checks.error_code = (error as any)?.code;
    
    // Provide helpful hints
    if (err.message.includes('ETIMEOUT') || err.message.includes('ENOTFOUND')) {
      checks.hint = 'Check: 1) MongoDB Atlas IP whitelist (add 0.0.0.0/0 for testing), 2) Cluster is not paused, 3) Network connectivity';
    }
    
    return NextResponse.json({ status: 'unhealthy', checks }, { status: 500 });
  }
}

