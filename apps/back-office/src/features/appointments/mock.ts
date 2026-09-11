import type { Appointment } from '@/features/appointments/types';

/* ------------------------------------------------------------------ *
 * Mock data layer — an in-memory store shaped like the real REST calls:
 * an async read plus three async mutations. See module_calendly.md §8.
 * ------------------------------------------------------------------ */

let store: Appointment[] = [
  {
    id: 'a1',
    calendlyEventUri: 'https://api.calendly.com/scheduled_events/AAA111',
    service: 'pediatric',
    clientName: 'Maria Ionescu',
    clientEmail: 'maria.ionescu@gmail.com',
    reason: 'Evaluare somn și alimentație, bebeluș 8 luni.',
    startTime: '2026-06-12T10:00:00+03:00',
    endTime: '2026-06-12T10:50:00+03:00',
    videoUrl: 'https://us02web.zoom.us/j/8841120453',
    status: 'scheduled',
    paymentStatus: 'pending',
    cancelUrl: 'https://calendly.com/cancellations/AAA111',
    rescheduleUrl: 'https://calendly.com/reschedulings/AAA111',
    prepSentAt: '2026-06-11T09:00:00+03:00',
    planText: null,
    planFileName: null,
    planUploadedAt: null,
    rescheduledFromId: null,
  },
  {
    id: 'a2',
    calendlyEventUri: 'https://api.calendly.com/scheduled_events/BBB222',
    service: 'nutrition_copii',
    clientName: 'Andrei Popa',
    clientEmail: 'andrei.popa@outlook.com',
    reason: 'Plan alimentar pentru copil cu intoleranță la lactoză.',
    startTime: '2026-06-12T14:30:00+03:00',
    endTime: '2026-06-12T15:30:00+03:00',
    videoUrl: 'https://meet.google.com/abc-defg-hij',
    status: 'scheduled',
    paymentStatus: 'confirmed',
    cancelUrl: 'https://calendly.com/cancellations/BBB222',
    rescheduleUrl: 'https://calendly.com/reschedulings/BBB222',
    prepSentAt: '2026-06-11T09:05:00+03:00',
    planText: null,
    planFileName: null,
    planUploadedAt: null,
    rescheduledFromId: null,
  },
  {
    id: 'a3',
    calendlyEventUri: 'https://api.calendly.com/scheduled_events/CCC333',
    service: 'integrative',
    clientName: 'Elena Rusu',
    clientEmail: 'elena.rusu@gmail.com',
    reason: null,
    startTime: '2026-06-13T09:00:00+03:00',
    endTime: '2026-06-13T10:30:00+03:00',
    videoUrl: 'https://us02web.zoom.us/j/7720094412',
    status: 'scheduled',
    paymentStatus: 'pending',
    cancelUrl: 'https://calendly.com/cancellations/CCC333',
    rescheduleUrl: 'https://calendly.com/reschedulings/CCC333',
    prepSentAt: null,
    planText: null,
    planFileName: null,
    planUploadedAt: null,
    rescheduledFromId: null,
  },
  {
    id: 'a4',
    calendlyEventUri: 'https://api.calendly.com/scheduled_events/DDD444',
    service: 'pediatric',
    clientName: 'Cristina Moraru',
    clientEmail: 'cristina.moraru@gmail.com',
    reason: 'Control dezvoltare neuromotorie.',
    startTime: '2026-06-09T11:00:00+03:00',
    endTime: '2026-06-09T11:50:00+03:00',
    videoUrl: 'https://us02web.zoom.us/j/5510092231',
    status: 'completed',
    paymentStatus: 'confirmed',
    cancelUrl: 'https://calendly.com/cancellations/DDD444',
    rescheduleUrl: 'https://calendly.com/reschedulings/DDD444',
    prepSentAt: '2026-06-08T09:00:00+03:00',
    planText:
      'Continuați diversificarea treptată. Reevaluare neuromotorie peste 4 săptămâni. Vitamina D 400 UI/zi.',
    planFileName: 'plan-cristina-moraru.pdf',
    planUploadedAt: '2026-06-09T13:20:00+03:00',
    rescheduledFromId: null,
  },
  {
    id: 'a5',
    calendlyEventUri: 'https://api.calendly.com/scheduled_events/EEE555',
    service: 'nutrition_adulti',
    clientName: 'Victor Ceban',
    clientEmail: 'victor.ceban@yahoo.com',
    reason: 'Recomandări diversificare, copil 6 luni.',
    startTime: '2026-06-05T16:00:00+03:00',
    endTime: '2026-06-05T17:00:00+03:00',
    videoUrl: 'https://meet.google.com/klm-nopq-rst',
    status: 'completed',
    paymentStatus: 'confirmed',
    cancelUrl: 'https://calendly.com/cancellations/EEE555',
    rescheduleUrl: 'https://calendly.com/reschedulings/EEE555',
    prepSentAt: '2026-06-04T09:00:00+03:00',
    planText: null,
    planFileName: null,
    planUploadedAt: null,
    rescheduledFromId: null,
  },
  {
    id: 'a6',
    calendlyEventUri: 'https://api.calendly.com/scheduled_events/FFF666',
    service: 'integrative',
    clientName: 'Diana Lungu',
    clientEmail: 'diana.lungu@gmail.com',
    reason: 'Monitorizare integrativă, plan trimestrial.',
    startTime: '2026-06-08T13:00:00+03:00',
    endTime: '2026-06-08T14:30:00+03:00',
    videoUrl: 'https://us02web.zoom.us/j/3391120945',
    status: 'no_show',
    paymentStatus: 'pending',
    cancelUrl: 'https://calendly.com/cancellations/FFF666',
    rescheduleUrl: 'https://calendly.com/reschedulings/FFF666',
    prepSentAt: '2026-06-07T09:00:00+03:00',
    planText: null,
    planFileName: null,
    planUploadedAt: null,
    rescheduledFromId: null,
  },
  {
    id: 'a7',
    calendlyEventUri: 'https://api.calendly.com/scheduled_events/GGG777',
    service: 'pediatric',
    clientName: 'Ana Cojocaru',
    clientEmail: 'ana.cojocaru@gmail.com',
    reason: 'Consult dermatită atopică.',
    startTime: '2026-06-07T10:00:00+03:00',
    endTime: '2026-06-07T10:50:00+03:00',
    videoUrl: null,
    status: 'canceled',
    paymentStatus: 'pending',
    cancelUrl: 'https://calendly.com/cancellations/GGG777',
    rescheduleUrl: 'https://calendly.com/reschedulings/GGG777',
    prepSentAt: null,
    planText: null,
    planFileName: null,
    planUploadedAt: null,
    rescheduledFromId: null,
  },
  {
    id: 'a8',
    calendlyEventUri: 'https://api.calendly.com/scheduled_events/HHH888',
    service: 'nutrition_copii',
    clientName: 'Sergiu Bivol',
    clientEmail: 'sergiu.bivol@outlook.com',
    reason: 'Reechilibrare meniu pentru adolescent sportiv.',
    startTime: '2026-06-14T12:00:00+03:00',
    endTime: '2026-06-14T13:00:00+03:00',
    videoUrl: 'https://meet.google.com/uvw-xyz0-123',
    status: 'scheduled',
    paymentStatus: 'confirmed',
    cancelUrl: 'https://calendly.com/cancellations/HHH888',
    rescheduleUrl: 'https://calendly.com/reschedulings/HHH888',
    prepSentAt: '2026-06-12T09:00:00+03:00',
    planText: null,
    planFileName: null,
    planUploadedAt: null,
    rescheduledFromId: null,
  },
  {
    id: 'a9',
    calendlyEventUri: 'https://api.calendly.com/scheduled_events/III999',
    service: 'pediatric',
    clientName: 'Natalia Gurău',
    clientEmail: 'natalia.gurau@gmail.com',
    reason: 'Evaluare creștere și apetit.',
    startTime: '2026-06-06T15:00:00+03:00',
    endTime: '2026-06-06T15:50:00+03:00',
    videoUrl: 'https://us02web.zoom.us/j/1120945583',
    status: 'completed',
    paymentStatus: 'pending',
    cancelUrl: 'https://calendly.com/cancellations/III999',
    rescheduleUrl: 'https://calendly.com/reschedulings/III999',
    prepSentAt: '2026-06-05T09:00:00+03:00',
    planText:
      'Apetit în limite normale pentru vârstă. Menținere ritm mese. Control creștere peste 3 luni.',
    planFileName: null,
    planUploadedAt: '2026-06-06T17:10:00+03:00',
    rescheduledFromId: null,
  },
  {
    id: 'a10',
    calendlyEventUri: 'https://api.calendly.com/scheduled_events/JJJ000',
    service: 'integrative',
    clientName: 'Vlad Țurcanu',
    clientEmail: 'vlad.turcanu@gmail.com',
    reason: 'Abordare integrativă pentru somn fragmentat.',
    startTime: '2026-06-15T17:30:00+03:00',
    endTime: '2026-06-15T19:00:00+03:00',
    videoUrl: 'https://us02web.zoom.us/j/9945583120',
    status: 'scheduled',
    paymentStatus: 'pending',
    cancelUrl: 'https://calendly.com/cancellations/JJJ000',
    rescheduleUrl: 'https://calendly.com/reschedulings/JJJ000',
    prepSentAt: null,
    planText: null,
    planFileName: null,
    planUploadedAt: null,
    rescheduledFromId: null,
  },
];

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function mutate(id: string, patch: Partial<Appointment>): Appointment {
  let updated: Appointment | undefined;
  store = store.map((a) => {
    if (a.id !== id) return a;
    updated = { ...a, ...patch };
    return updated;
  });
  if (!updated) throw new Error(`Appointment ${id} not found`);
  return updated;
}

export async function fetchAppointments(): Promise<Appointment[]> {
  await delay(550);
  return store
    .slice()
    .sort((a, b) => b.startTime.localeCompare(a.startTime));
}

export async function markNoShow(id: string): Promise<Appointment> {
  await delay(450);
  return mutate(id, { status: 'no_show' });
}

export async function uploadPlan(args: {
  id: string;
  planText: string;
  file: File | null;
}): Promise<Appointment> {
  await delay(700);
  // Saving the written plan also closes the appointment (§8). A new file
  // replaces the previous one; with no file, the existing name is kept.
  const patch: Partial<Appointment> = {
    planText: args.planText,
    planUploadedAt: new Date().toISOString(),
    status: 'completed',
  };
  if (args.file) patch.planFileName = args.file.name;
  return mutate(args.id, patch);
}

export async function downloadPlanFile(
  _id: string,
  _fileName: string,
): Promise<void> {
  // No real file in mock mode — succeed silently.
  await delay(300);
}
