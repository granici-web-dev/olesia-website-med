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
import { BlogPage } from '@/pages/blog';
import { BlogEditorPage } from '@/pages/blog-editor';
import { ServicesPage } from '@/pages/services';
import { ContactsPage } from '@/pages/contacts';
import { AboutPage } from '@/pages/about';
import { UsersPage } from '@/pages/users';
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
          <Route path={paths.blog} element={<BlogPage />} />
          <Route path={paths.blogNew} element={<BlogEditorPage />} />
          <Route path="/blog/:id" element={<BlogEditorPage />} />
          <Route path={paths.services} element={<ServicesPage />} />
          <Route path={paths.contacts} element={<ContactsPage />} />
          <Route path={paths.about} element={<AboutPage />} />
          <Route
            path={paths.users}
            element={
              <RequireRole roles={['admin']}>
                <UsersPage />
              </RequireRole>
            }
          />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
