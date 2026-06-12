/**
 * Calendly setup helper (module_calendly.md §8). Wires the live Calendly
 * account to the backend: discovers org/event-type URIs, maps event types to
 * services by their public scheduling_url, and registers the webhook.
 *
 * Run with CALENDLY_API_TOKEN (+ DATABASE_URL) set:
 *   pnpm exec tsx apps/api/scripts/calendly-setup.ts <command>
 *
 * Commands:
 *   info                        Print the authenticated user + organization URIs.
 *   sync-event-types            Match Calendly event types to services by
 *                               scheduling_url and store their event_type URI
 *                               in Service.calendlyEventTypeUri.
 *   create-webhook <callback>   Create an org-scoped invitee.created/canceled
 *                               subscription pointing at <callback>; prints the
 *                               signing key to put in CALENDLY_WEBHOOK_SIGNING_KEY.
 */
import 'dotenv/config';
import { randomBytes } from 'node:crypto';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client';

const API = 'https://api.calendly.com';
const TOKEN = process.env.CALENDLY_API_TOKEN ?? '';

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL ?? '' }),
});

async function api<T>(
  path: string,
  init?: { method?: string; body?: unknown },
): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    method: init?.method ?? 'GET',
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: init?.body ? JSON.stringify(init.body) : undefined,
  });
  if (!res.ok) {
    throw new Error(`Calendly ${res.status} ${path}: ${await res.text()}`);
  }
  return (await res.json()) as T;
}

interface Me {
  resource: { uri: string; current_organization: string };
}
interface EventType {
  uri: string;
  name: string;
  scheduling_url: string;
  active: boolean;
  duration: number;
}

async function getContext() {
  const me = await api<Me>('/users/me');
  const orgUri = process.env.CALENDLY_ORG_URI || me.resource.current_organization;
  return { userUri: me.resource.uri, orgUri };
}

async function info() {
  const { userUri, orgUri } = await getContext();
  console.log('User URI:        ', userUri);
  console.log('Organization URI:', orgUri);
  console.log('\nSet in apps/api/.env:');
  console.log(`CALENDLY_ORG_URI=${orgUri}`);
}

async function syncEventTypes() {
  const { orgUri } = await getContext();
  const params = new URLSearchParams({ organization: orgUri, count: '100' });
  const { collection } = await api<{ collection: EventType[] }>(
    `/event_types?${params}`,
  );
  console.log(`Fetched ${collection.length} event type(s).\n`);

  const services = await prisma.service.findMany({
    where: { calendlySchedulingUrl: { not: null } },
  });

  let matched = 0;
  for (const et of collection) {
    const svc = services.find((s) => s.calendlySchedulingUrl === et.scheduling_url);
    const tag = svc ? `→ ${svc.code}` : '(no service)';
    console.log(`${et.name} [${et.duration}m] ${et.scheduling_url} ${tag}`);
    if (svc) {
      await prisma.service.update({
        where: { id: svc.id },
        data: { calendlyEventTypeUri: et.uri },
      });
      matched++;
    }
  }
  console.log(`\n✓ Updated calendlyEventTypeUri on ${matched} service(s).`);
}

async function createWebhook(callbackUrl: string) {
  const { orgUri } = await getContext();
  const signingKey = randomBytes(32).toString('hex');
  const { resource } = await api<{ resource: { uri: string } }>(
    '/webhook_subscriptions',
    {
      method: 'POST',
      body: {
        url: callbackUrl,
        events: ['invitee.created', 'invitee.canceled'],
        organization: orgUri,
        scope: 'organization',
        signing_key: signingKey,
      },
    },
  );
  console.log('✓ Webhook subscription created:', resource.uri);
  console.log('\nSet in apps/api/.env (and the compose host env), then restart:');
  console.log(`CALENDLY_WEBHOOK_SIGNING_KEY=${signingKey}`);
}

async function main() {
  if (!TOKEN) throw new Error('CALENDLY_API_TOKEN is not set.');
  const [cmd, arg] = process.argv.slice(2);
  switch (cmd) {
    case 'info':
      return info();
    case 'sync-event-types':
      return syncEventTypes();
    case 'create-webhook':
      if (!arg) throw new Error('Usage: create-webhook <callbackUrl>');
      return createWebhook(arg);
    default:
      console.log('Commands: info | sync-event-types | create-webhook <callbackUrl>');
  }
}

main()
  .catch((err) => {
    console.error(String(err));
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
