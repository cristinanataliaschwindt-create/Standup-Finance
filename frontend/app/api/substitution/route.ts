import { NextResponse } from 'next/server';
import { findSubstitution, validateRequest } from '@/src/substitution/engine';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(request: Request) {
  try {
    const input = validateRequest(await request.json());
    return NextResponse.json(findSubstitution(input), { headers: corsHeaders });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Invalid request' }, {
      status: 400,
      headers: corsHeaders,
    });
  }
}
