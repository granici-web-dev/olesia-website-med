/**
 * Generate site imagery with Google's Gemini 2.5 Flash Image ("Nano Banana").
 * One-time generation → PNGs saved under public/assets/{blog,menus}/<slug>.png,
 * then referenced from the placeholder content. No runtime cost.
 *
 *   GEMINI_API_KEY=... pnpm --filter @olesia/frontend gen:images          # missing only
 *   GEMINI_API_KEY=... pnpm --filter @olesia/frontend gen:images -- --force  # regenerate all
 *
 * The key is read from apps/frontend/.env.local (GEMINI_API_KEY) or the env.
 * Model override: GEMINI_IMAGE_MODEL (default gemini-2.5-flash-image).
 */
import { GoogleGenAI } from '@google/genai';
import { config as loadEnv } from 'dotenv';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PLACEHOLDER_POSTS } from '../lib/placeholder-posts';
import { PLACEHOLDER_MENUS } from '../lib/placeholder-menus';

const here = dirname(fileURLToPath(import.meta.url));
loadEnv({ path: join(here, '../.env.local') });
loadEnv({ path: join(here, '../.env') });

const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
if (!apiKey) {
  console.error('✖ Set GEMINI_API_KEY (in apps/frontend/.env.local or the env).');
  process.exit(1);
}

const MODEL = process.env.GEMINI_IMAGE_MODEL || 'gemini-2.5-flash-image';
const FORCE = process.argv.includes('--force');
const ai = new GoogleGenAI({ apiKey });
const publicDir = join(here, '../public/assets');

/* Shared art direction — matches the brand: warm, calm, editorial; never
   clinical or stocky; no text in the image. */
const STYLE =
  'Soft, warm editorial photograph. Cream, beige and muted sage-green palette, gentle natural daylight, calm and reassuring mood, shallow depth of field, generous negative space. Absolutely no text, words, letters, numbers, logos or watermarks. Not clinical, not corporate stock.';

const BLOG_PROMPTS: Record<string, string> = {
  'diversificarea-cand-si-cum':
    'A baby starting solids: a small bowl of softly mashed vegetables and a tiny spoon on a light wooden high-chair tray, a few fresh vegetables nearby, soft morning light.',
  'copilul-frecvent-bolnav':
    'A cozy, comforting scene: a child’s bed with a soft folded blanket, a mug of warm tea and a couple of citrus fruits on a side table near a window. Gentle, reassuring, not clinical.',
  'alergiile-alimentare-la-copii':
    'A calm still life of common food allergens — eggs, a few nuts, a small fish, a glass of milk and a slice of bread — arranged gently on a cream linen surface.',
  'cum-sustii-imunitatea':
    'A wholesome flat lay of fresh fruit, leafy vegetables, a bowl of yogurt and nuts on a cream surface in soft daylight, fresh and healthy.',
  'mofturos-la-masa':
    'A child’s plate with colorful vegetables arranged playfully into a friendly pattern, a small wooden fork beside it, on a light table.',
  'repere-de-dezvoltare':
    'Soft natural-wood baby blocks and a knitted toy on a cream blanket, a gentle developmental-play scene in warm daylight.',
};

const MENU_PROMPTS: Record<string, string> = {
  'meniu-echilibrat-familie':
    'A balanced family dinner on a warm wooden table seen from above: roast chicken, a bowl of vegetables, a green salad and sliced bread. Homestyle and inviting.',
  'meniu-scoala-copii':
    'A healthy packed school lunch in an open lunchbox on a light surface: a wholegrain sandwich, cut fruit, baby carrots and a small yogurt.',
  'meniu-copii-mofturosi':
    'A playful, colorful kids’ plate with vegetables arranged in fun friendly shapes, appetizing and bright on a light table.',
  'meniu-gustari-sanatoase':
    'A flat lay of healthy snacks on cream linen: apple slices with peanut butter, carrot and cucumber sticks, a small bowl of yogurt, and a handful of nuts. No added sugar look.',
  'meniu-copii-mici':
    'Gentle toddler meals: small bowls of softly mashed vegetables, little fruit pieces and plain yogurt on a light wooden table, wholesome and soft.',
  'meniu-sezon-familie':
    'A seasonal family meal in a rustic warm kitchen: a platter of roasted seasonal vegetables and a bowl of seasonal fruit, fresh and colorful.',
};

async function generate(prompt: string, ratio: string, outPath: string) {
  if (existsSync(outPath) && !FORCE) {
    console.log('· skip (exists):', outPath.replace(publicDir, 'assets'));
    return;
  }
  const fullPrompt = `${prompt}\n\n${STYLE}\nComposition: ${ratio} aspect ratio.`;
  try {
    const res = await ai.models.generateContent({
      model: MODEL,
      contents: fullPrompt,
      config: { responseModalities: ['IMAGE'] },
    });
    const parts = res.candidates?.[0]?.content?.parts ?? [];
    const img = parts.find((p) => p.inlineData?.data);
    if (!img?.inlineData?.data) {
      console.error('✖ no image returned for', outPath, '—', JSON.stringify(parts).slice(0, 160));
      return;
    }
    mkdirSync(dirname(outPath), { recursive: true });
    writeFileSync(outPath, Buffer.from(img.inlineData.data, 'base64'));
    console.log('✓ saved:', outPath.replace(publicDir, 'assets'));
  } catch (err) {
    console.error('✖ failed for', outPath, '—', (err as Error).message);
  }
}

async function main() {
  console.log(`Generating with ${MODEL}${FORCE ? ' (force)' : ''}…\n`);

  for (const p of PLACEHOLDER_POSTS) {
    const prompt = BLOG_PROMPTS[p.slug] ?? `Editorial image about: ${p.title.en}.`;
    await generate(prompt, '16:9', join(publicDir, 'blog', `${p.slug}.png`));
  }
  for (const m of PLACEHOLDER_MENUS) {
    const prompt = MENU_PROMPTS[m.slug] ?? `Appetizing food photo: ${m.title.en}.`;
    await generate(prompt, '4:3', join(publicDir, 'menus', `${m.slug}.png`));
  }

  console.log('\nDone. Review public/assets/{blog,menus}/ then commit the PNGs.');
}

main();
