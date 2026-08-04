import { Routes, Route } from 'react-router-dom';

import { ProtectedRoute } from '@/auth/protected-route';
import { RequireRole } from '@/auth/require-role';
import { AppShell } from '@/components/layout/app-shell';
import { paths } from '@/config/routes';

import { LoginPage } from '@/pages/login';
import { DashboardPage } from '@/pages/dashboard';
import { AppointmentsPage } from '@/pages/appointments';
import { SubscriptionsPage } from '@/pages/subscriptions';
import { QuickQuestionsPage } from '@/pages/quick-questions';
import { OrdersPage } from '@/pages/orders';
import { MessagesPage } from '@/pages/messages';
import { PatientsPage } from '@/pages/patients';
import { PatientDetailPage } from '@/pages/patient-detail';
import { BlogPage } from '@/pages/blog';
import { BlogEditorPage } from '@/pages/blog-editor';
import { ServicesPage } from '@/pages/services';
import { ContactsPage } from '@/pages/contacts';
import { AboutPage } from '@/pages/about';
import { FaqPage } from '@/pages/faq';
import { TestimonialsPage } from '@/pages/testimonials';
import { MediaPage } from '@/pages/media';
import { LibraryPage } from '@/pages/library';
import { SiteMediaPage } from '@/pages/site-media';
import { UsersPage } from '@/pages/users';
import { WorkingHoursPage } from '@/pages/working-hours';
import { SecurityPage } from '@/pages/security';
import { NotFoundPage } from '@/pages/not-found';

export function App() {
  return (
    <Routes>
      <Route path={paths.login} element={<LoginPage />} />

      {/* Everything below requires a session. */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route index element={<DashboardPage />} />
          <Route path={paths.appointments} element={<AppointmentsPage />} />
          <Route path={paths.subscriptions} element={<SubscriptionsPage />} />
          <Route
            path={paths.quickQuestions}
            element={<QuickQuestionsPage />}
          />
          <Route path={paths.orders} element={<OrdersPage />} />
          <Route path={paths.messages} element={<MessagesPage />} />
          <Route path={paths.patients} element={<PatientsPage />} />
          <Route path="/pacienti/:id" element={<PatientDetailPage />} />
          <Route path={paths.blog} element={<BlogPage />} />
          <Route path={paths.blogNew} element={<BlogEditorPage />} />
          <Route path="/blog/:id" element={<BlogEditorPage />} />
          <Route path={paths.services} element={<ServicesPage />} />
          <Route path={paths.contacts} element={<ContactsPage />} />
          <Route path={paths.about} element={<AboutPage />} />
          <Route path={paths.faq} element={<FaqPage />} />
          <Route path={paths.testimonials} element={<TestimonialsPage />} />
          <Route path={paths.media} element={<MediaPage />} />
          <Route path={paths.library} element={<LibraryPage />} />
          <Route path={paths.siteMedia} element={<SiteMediaPage />} />
          <Route
            path={paths.users}
            element={
              <RequireRole roles={['admin']}>
                <UsersPage />
              </RequireRole>
            }
          />
          <Route path={paths.workingHours} element={<WorkingHoursPage />} />
          <Route path={paths.security} element={<SecurityPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
