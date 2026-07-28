import {
  ShieldCheck,
  LayoutDashboard,
  CalendarCheck,
  Repeat2,
  MessagesSquare,
  Mail,
  Newspaper,
  Tags,
  Contact,
  BookOpenText,
  HelpCircle,
  Quote,
  Clapperboard,
  Library,
  Users,
  Stethoscope,
  type LucideIcon,
} from 'lucide-react';

import { ro } from '@/i18n/ro';
import { paths } from '@/config/routes';
import type { Role } from '@/types';

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  /** End-match for the index route so it isn't always active. */
  end?: boolean;
  /** When set, the item is only shown to these roles. */
  roles?: Role[];
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export const navGroups: NavGroup[] = [
  {
    label: ro.nav.sectionMain,
    items: [
      { to: paths.dashboard, label: ro.nav.dashboard, icon: LayoutDashboard, end: true },
      { to: paths.appointments, label: ro.nav.appointments, icon: CalendarCheck },
      { to: paths.subscriptions, label: ro.nav.subscriptions, icon: Repeat2 },
      { to: paths.quickQuestions, label: ro.nav.quickQuestions, icon: MessagesSquare },
      { to: paths.messages, label: ro.nav.messages, icon: Mail },
    ],
  },
  {
    label: ro.nav.sectionContent,
    items: [
      { to: paths.blog, label: ro.nav.blog, icon: Newspaper },
      { to: paths.services, label: ro.nav.services, icon: Tags },
      { to: paths.contacts, label: ro.nav.contacts, icon: Contact },
      { to: paths.about, label: ro.nav.about, icon: BookOpenText },
      { to: paths.faq, label: ro.nav.faq, icon: HelpCircle },
      { to: paths.testimonials, label: ro.nav.testimonials, icon: Quote },
      { to: paths.media, label: ro.nav.media, icon: Clapperboard },
      { to: paths.library, label: ro.nav.library, icon: Library },
    ],
  },
  {
    label: ro.nav.sectionAdmin,
    items: [
      { to: paths.patients, label: ro.nav.patients, icon: Stethoscope },
      { to: paths.users, label: ro.nav.users, icon: Users, roles: ['admin'] },
      { to: paths.security, label: ro.nav.security, icon: ShieldCheck },
    ],
  },
];
