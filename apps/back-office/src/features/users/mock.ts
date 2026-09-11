import type {
  User,
  CreateUserInput,
  UpdateUserInput,
} from '@/features/users/types';
import type { Role } from '@/types';
import { generatePassword } from '@/features/users/format';

/* ------------------------------------------------------------------ *
 * Mock data layer — in-memory CRUD, shaped like the eventual REST API.
 * Passwords are never stored or returned here; create just registers the
 * account. Real hashing is argon2 on the backend. See module_calendly.md §4.
 * ------------------------------------------------------------------ */

let store: User[] = [
  {
    id: 'u1',
    email: 'olesia@olesia.md',
    name: 'Olesia Pediatru',
    role: 'admin',
    isActive: true,
    createdAt: '2026-01-15T09:00:00+03:00',
  },
  {
    id: 'u2',
    email: 'maria@olesia.md',
    name: 'Maria Editor',
    role: 'editor',
    isActive: true,
    createdAt: '2026-02-03T10:30:00+03:00',
  },
  {
    id: 'u3',
    email: 'andrei@olesia.md',
    name: 'Andrei Conținut',
    role: 'editor',
    isActive: true,
    createdAt: '2026-03-20T14:00:00+03:00',
  },
  {
    id: 'u4',
    email: 'ana@olesia.md',
    name: 'Ana Temporar',
    role: 'editor',
    isActive: false,
    createdAt: '2026-04-11T11:15:00+03:00',
  },
];

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function mutate(id: string, patch: Partial<User>): User {
  let updated: User | undefined;
  store = store.map((u) => {
    if (u.id !== id) return u;
    updated = { ...u, ...patch };
    return updated;
  });
  if (!updated) throw new Error(`User ${id} not found`);
  return updated;
}

export async function fetchUsers(): Promise<User[]> {
  await delay(500);
  // Admins first, then by name.
  const rank: Record<Role, number> = { admin: 0, editor: 1 };
  return store
    .slice()
    .sort(
      (a, b) => rank[a.role] - rank[b.role] || a.name.localeCompare(b.name),
    );
}

export async function createUser(input: CreateUserInput): Promise<User> {
  await delay(550);
  const created: User = {
    id: crypto.randomUUID(),
    email: input.email.trim().toLowerCase(),
    name: input.name.trim(),
    role: input.role,
    isActive: true,
    createdAt: new Date().toISOString(),
  };
  store = [...store, created];
  return created;
}

export async function updateUser(
  id: string,
  input: UpdateUserInput,
): Promise<User> {
  await delay(500);
  return mutate(id, { name: input.name.trim(), role: input.role });
}

export async function setUserActive(
  id: string,
  isActive: boolean,
): Promise<User> {
  await delay(400);
  return mutate(id, { isActive });
}

/** Mock password reset — backend generates + emails; here we just return one. */
export async function resetPassword(id: string): Promise<string> {
  await delay(450);
  const user = store.find((u) => u.id === id);
  if (!user) throw new Error(`User ${id} not found`);
  return generatePassword();
}
