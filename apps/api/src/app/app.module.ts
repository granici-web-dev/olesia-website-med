import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { HealthModule } from './health/health.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ServicesModule } from './services/services.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { ContactsModule } from './contacts/contacts.module';
import { ContactMessagesModule } from './contact-messages/contact-messages.module';
import { AboutModule } from './about/about.module';
import { FaqModule } from './faq/faq.module';
import { BlogModule } from './blog/blog.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { QuickQuestionsModule } from './quick-questions/quick-questions.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { PatientsModule } from './patients/patients.module';
import { StorageModule } from './storage/storage.module';
import { MailModule } from './mail/mail.module';
import { LeadsModule } from './leads/leads.module';
import { CaptchaModule } from './common/captcha/captcha.module';

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
    AboutModule,
    FaqModule,
    BlogModule,
    SubscriptionsModule,
    QuickQuestionsModule,
    DashboardModule,
    PatientsModule,
    StorageModule,
    MailModule,
    LeadsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Applies the default limit everywhere; per-route @Throttle overrides it.
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
