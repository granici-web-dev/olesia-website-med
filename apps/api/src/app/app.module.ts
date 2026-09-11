import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { RolesGuard } from './auth/guards/roles.guard';
import { MustChangePasswordGuard } from './auth/guards/must-change-password.guard';
import { PrismaModule } from './prisma/prisma.module';
import { HealthModule } from './health/health.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ServicesModule } from './services/services.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { ContactsModule } from './contacts/contacts.module';
import { ContactMessagesModule } from './contact-messages/contact-messages.module';
import { DeliverableOrdersModule } from './deliverable-orders/deliverable-orders.module';
import { UploadsModule } from './uploads/uploads.module';
import { WorkingHoursModule } from './working-hours/working-hours.module';
import { AboutModule } from './about/about.module';
import { FaqModule } from './faq/faq.module';
import { TestimonialsModule } from './testimonials/testimonials.module';
import { MediaAppearancesModule } from './media-appearances/media-appearances.module';
import { MaterialsModule } from './materials/materials.module';
import { SiteMediaModule } from './site-media/site-media.module';
import { BlogModule } from './blog/blog.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { QuickQuestionsModule } from './quick-questions/quick-questions.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { PatientsModule } from './patients/patients.module';
import { StorageModule } from './storage/storage.module';
import { MailModule } from './mail/mail.module';
import { LeadsModule } from './leads/leads.module';
import { NewsletterModule } from './newsletter/newsletter.module';
import { PaymentsModule } from './payments/payments.module';
import { CaptchaModule } from './common/captcha/captcha.module';
import { SentryReportingFilter } from './common/sentry-reporting.filter';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    /**
     * Rate limiting (client answers v2 §10, "protecție împotriva atacurilor").
     * A generous default for ordinary browsing of the public content; the
     * routes worth attacking — login and the public lead forms — tighten it
     * further with their own @Throttle. Storage is in-memory, which is correct
     * for a single instance; a multi-instance deployment needs a shared store
     * (Redis) or the limit becomes per-instance.
     */
    ThrottlerModule.forRoot([{ name: 'default', ttl: 60_000, limit: 120 }]),
    CaptchaModule,
    PrismaModule,
    HealthModule,
    AuthModule,
    UsersModule,
    ServicesModule,
    AppointmentsModule,
    ContactsModule,
    ContactMessagesModule,
    DeliverableOrdersModule,
    UploadsModule,
    WorkingHoursModule,
    AboutModule,
    FaqModule,
    TestimonialsModule,
    MediaAppearancesModule,
    MaterialsModule,
    SiteMediaModule,
    BlogModule,
    SubscriptionsModule,
    QuickQuestionsModule,
    DashboardModule,
    PatientsModule,
    StorageModule,
    MailModule,
    LeadsModule,
    NewsletterModule,
    PaymentsModule,
  ],
  /**
   * All four global guards, in one place and in this order (audit A5, F15).
   *
   * Nest runs APP_GUARD providers in registration order, and registration
   * order across modules is import order — so with the throttler declared here
   * and the auth guards declared in AuthModule, the sequence was an
   * accident of where `AuthModule` happened to sit in the imports above.
   * Spelling them all out here makes it a decision:
   *
   * 1. Throttler — a flood is refused before it costs a token verification.
   * 2. JwtAuthGuard — establishes who is asking.
   * 3. RolesGuard — decides whether they may, which needs step 2 to have run.
   * 4. MustChangePasswordGuard — holds a starter-password account to the three
   *    routes that get it out of that state, which needs step 2 as well.
   *
   * The per-route limit still overrides the default through `@Throttle`.
   */
  providers: [
    /**
     * Nest catches every exception a handler throws, so without this filter
     * nothing an endpoint fails with would reach Sentry — only a crash that
     * took the process down with it (audit A11, H3).
     */
    { provide: APP_FILTER, useClass: SentryReportingFilter },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_GUARD, useClass: MustChangePasswordGuard },
  ],
})
export class AppModule {}
