import { db } from '../src/lib/db.server';

const slug = `scratch-${Date.now()}`;

const { error: insertError } = await db.from('roasts').insert({
  slug,
  title: 'Stage 0 round-trip test',
  source: 'synthetic',
  raw_trace: { spans: [] },
  normalized: { traceId: 'scratch', workflow: 'scratch', spans: [] },
  findings: [],
  cost: { totalTokensIn: 0, totalTokensOut: 0, totalUsd: 0 },
  score: 100,
  tier: 'Rare',
});

if (insertError) {
  throw new Error(`insert failed: ${insertError.message}`);
}

const { data, error: selectError } = await db
  .from('roasts')
  .select('*')
  .eq('slug', slug)
  .single();

if (selectError) {
  throw new Error(`select failed: ${selectError.message}`);
}

console.log('round-trip row:', data);

const { error: deleteError } = await db.from('roasts').delete().eq('slug', slug);
if (deleteError) {
  throw new Error(`cleanup delete failed: ${deleteError.message}`);
}

console.log('round-trip OK, cleanup row removed');
