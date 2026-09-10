# ТЗ: монорепа — сайт консультаций, back office и backend

> Задание для Claude Code. Описывает монорепозиторий: существующий фронтенд + новый **back office (React + Vite)** + полный **backend (NestJS)**, с авторизацией, дашбордом, блогом, CRUD тарифов, страницами Contacts и About us, и интеграцией записи через Calendly.
>
> **Дизайн back office:** дизайн-система **shadcn/ui**; при сборке UI использовать скил **`impeccable`**.
> **Деплой backend:** через **Docker**.
> **Оплата:** ⚠️ **это утверждение отменено 2026-09-10.** Онлайн-оплата вошла в scope (ответы клиента v2, §11.8), построен модуль maib e-Commerce Checkout. Источник правды — `docs/payments-maib-checkout.md`; §12 ниже переписан.
>
> Решения, помеченные `[DEFAULT]`, выбраны по умолчанию — их можно изменить до старта.

---

## 0. Решения по умолчанию (подтвердить или изменить)

| Тема | Значение `[DEFAULT]` |
|------|----------------------|
| Менеджер монорепы | pnpm workspaces + Turborepo |
| БД | PostgreSQL |
| ORM | Prisma |
| Авторизация | JWT (access + refresh), роли `admin` / `editor` |
| Регистрация | закрытая — пользователей создаёт только `admin` |
| Сброс пароля | отложен (заложить место, реализовать позже) |
| Формат контента блога | Markdown |
| Хранилище загружаемых изображений | локальная папка `uploads/` за абстракцией storage-сервиса (позже — S3/Cloudinary) |
| Контент-страницы (Contacts/About/тарифы) | отдаются на фронт через API (фронт динамический) |
| Фронтенд сайта | **входит в монорепу** как `apps/web`; типизирует ответы API через DTO из `packages/shared` |
| Язык документации/комментариев в коде | румынский + английские технические термины |
| Язык интерфейса back office | **румынский (RO)** |
| i18n контента | двуязычность RO / EN |

---

## 1. Структура монорепы

```
repo/
├─ apps/
│  ├─ web/             # фронтенд сайта (потребляет API, типы из shared)
│  ├─ back-office/     # React + Vite + shadcn/ui (админка)
│  └─ api/             # NestJS backend (Docker)
├─ packages/
│  └─ shared/          # общие TS-типы, DTO, enum (service codes, roles, статусы)
├─ docker/             # Dockerfile(ы), docker-compose
├─ turbo.json
├─ pnpm-workspace.yaml
└─ package.json
```

- Фронтенд сайта (`apps/web`), back office (`apps/back-office`) и backend (`apps/api`) находятся **в одной монорепе**.
- `packages/shared` — единый источник типов для всех трёх приложений: DTO ответов/запросов API, enum (service codes, роли, статусы записей и т.д.). И `apps/web`, и `apps/back-office` импортируют отсюда **DTO из NestJS** для типизации ответов API — никакого ручного дублирования типов на фронте.

---

## 2. Backend — NestJS (`apps/api`)

### 2.1 Базовый стек
- NestJS (модульная архитектура: каждый домен — отдельный модуль).
- PostgreSQL + Prisma `[DEFAULT]`.
- Валидация через `class-validator` + `ValidationPipe` (whitelist, forbidNonWhitelisted).
- Конфиг через `@nestjs/config`, секреты только в env.
- Swagger (`@nestjs/swagger`) для документации API на `/api/docs`.
- CORS настроить под домены фронта и back office.

### 2.2 Модули backend
1. `auth` — авторизация back office (см. §4).
2. `users` — пользователи back office (CRUD, только admin).
3. `services` — каталог услуг/тарифов (CRUD, см. §6).
4. `appointments` — записи на видеоконсультации + приём webhook Calendly (см. §8).
5. `subscriptions` — подписка «Monitorizare 3 luni» (услуга 04).
6. `quick-questions` — тикеты «Întrebare rapidă» (услуга 05).
7. `blog` — посты, категории/теги, загрузка изображений (см. §7).
8. `contacts` — контактные блоки/записи (см. §9).
9. `about` — контент страницы About us (см. §10).
10. `dashboard` — агрегированная статистика (см. §11).
11. `storage` — абстракция загрузки файлов (локально → позже S3).
12. `health` — healthcheck для Docker/orchestration.

### 2.3 Общие требования
- Все мутирующие эндпоинты защищены JWT + проверкой роли (`@Roles('admin' | 'editor')`).
- Публичные (для сайта) GET-эндпоинты контента (услуги, блог published, контакты, about) — без авторизации, но read-only.
- Единый формат ошибок (exception filter), пагинация на списках.
- Idempotency на webhook Calendly (по `scheduled_event.uri`).

---

## 3. Back office — React + Vite (`apps/back-office`)

> Интерфейс полностью на **румынском языке (RO)**.

### 3.1 Стек
- React + Vite + TypeScript.
- **Дизайн-система: shadcn/ui** (компоненты Button, Input, Table, Dialog, Form, Tabs, Card, Toast и т.д.). Tailwind как основа.
- **При сборке UI использовать скил `impeccable`** — для качества верстки, состояний (loading/empty/error), доступности и аккуратной композиции компонентов.
- Роутинг: React Router. Запросы: TanStack Query (кеш, инвалидация). Формы: React Hook Form + zod.
- Типы DTO импортировать из `packages/shared`.

### 3.2 Разделы (страницы) back office
1. **Login** — форма входа (email + пароль).
2. **Dashboard** — статистика (см. §11; конкретные метрики уточним позже, заложить каркас с карточками и графиками).
3. **Записи (Appointments)** — список видеоконсультаций, фильтры по услуге/статусу/дате, карточка записи, статус оплаты (зеркало `Payment`, см. §12), загрузка письменного плана, отметка no-show.
4. **Подписки (Subscriptions)** — список подписок 04, статус, остаток квоты видеозвонков.
5. **Быстрые вопросы (Quick questions)** — тикеты 05, дедлайн 48 ч, ответ.
6. **Блог** — список постов, создание/редактирование (markdown-редактор с превью), категории/теги, загрузка обложки, статус draft/published, RO/EN.
7. **Тарифы (Services)** — CRUD услуг/тарифов (см. §6).
8. **Контакты (Contacts)** — отдельная страница: список контактов, добавление новых, редактирование (см. §9).
9. **About us** — отдельная страница: редактирование контента (см. §10).
10. **Пользователи (Users)** — только для `admin`: создание/блокировка пользователей back office.

### 3.3 Общие требования UI
- **Весь интерфейс back office — на румынском языке (RO).** Все подписи, кнопки, заголовки разделов, тексты ошибок и тостов, плейсхолдеры — по-румынски. Строки UI держать в одном месте (словарь/i18n-файл), даже если язык один, чтобы не хардкодить по компонентам.
- Единый layout: боковое меню + хедер с текущим пользователем и выходом.
- Везде состояния loading / empty / error (через shadcn + skeleton).
- Защищённые роуты: неавторизованного редиректить на `/login`; разделы по ролям (например Users — только admin).
- Тосты на успех/ошибку мутаций.

---

## 4. Авторизация back office (модуль `auth` + `users`)

`[DEFAULT]` — email + пароль, JWT.

- Хранение паролей: `argon2` или `bcrypt` (хеш + соль), пароли в открытом виде не логировать.
- Токены: short-lived **access** (например 15 мин) + **refresh** (например 7 дней). Refresh — httpOnly cookie или защищённое хранилище; access — в памяти приложения.
- Роли `[DEFAULT]`: `admin` (полный доступ + управление пользователями) и `editor` (контент: блог, тарифы, контакты, about, записи — без управления пользователями).
- Регистрация **закрытая** `[DEFAULT]`: пользователей заводит только `admin` через раздел Users (email, имя, роль, стартовый пароль или ссылка-инвайт).
- Эндпоинты: `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout`, `GET /auth/me`.
- Guard'ы: `JwtAuthGuard` + `RolesGuard`.
- Сброс пароля — заложить место, реализация позже `[DEFAULT]`.

### Модель `User`
| поле | тип | описание |
|------|-----|----------|
| id | uuid pk | |
| email | string unique | |
| password_hash | string | |
| name | string | |
| role | enum | `admin` / `editor` |
| is_active | bool | блокировка |
| created_at, updated_at | datetime | |

---

## 5. Каталог услуг (контекст бизнеса)

5 услуг, две группы по тому, нужен ли слот в календаре.

### Группа A — видеовстреча (через Calendly)
| № | Услуга | Длительность | Цена | `service_code` | Calendly event type |
|---|--------|-------------|------|----------------|---------------------|
| 01 | Consultație pediatrică | 50 мин | 600 lei | `pediatric` | `pediatric` |
| 02 | Consultație nutrițională | 60 мин | 700 lei | `nutrition` | `nutrition` |
| 03 | Consultație integrativă & monitorizare | 90 мин | 1 100 lei | `integrative` | `integrative` |

### Группа B — без слота (только портал/back office)
| № | Услуга | Тип | Цена | `service_code` |
|---|--------|-----|------|----------------|
| 04 | Monitorizare 3 luni | подписка 3 мес (мессенджер + корректировки + 2 видеозвонка/мес) | от 2 400 lei | `monitoring` |
| 05 | Întrebare rapidă | письменный ответ за 48 ч (форма + вложения) | 180 lei | `quick_question` |

**Принцип:** услуги 04 и 05 **не** создают запись в Calendly. Кнопка `Rezervă` у них ведёт во внутренний поток (подписка / форма), а не в календарь.

---

## 6. Тарифы — CRUD (модуль `services`)

- CRUD услуг/тарифов из back office.
- Публичный GET для вывода тарифов на сайт (тот блок с карточками 01–05).
- Поддержка RO/EN полей.

### Модель `Service`
| поле | тип | описание |
|------|-----|----------|
| id | uuid pk | |
| code | string unique | `pediatric` / `nutrition` / `integrative` / `monitoring` / `quick_question` |
| group | enum | `A_booking` / `B_portal` |
| title_ro, title_en | string | название |
| description_ro, description_en | text | описание |
| duration_min | int\|null | для группы A |
| price | int | в lei |
| price_label_ro, price_label_en | string\|null | напр. «de la 2.400 lei», «3 luni», «48h · scris» |
| calendly_event_type_uri | string\|null | только группа A |
| sort_order | int | порядок на сайте |
| active | bool | |

Эндпоинты: `GET /services` (public), `GET /services/:id`, `POST/PATCH/DELETE /services/:id` (admin/editor).

---

## 7. Блог (модуль `blog`)

«Полный kit для написания блога».

### Возможности
- CRUD постов; markdown-контент `[DEFAULT]` с превью в редакторе.
- Статусы `draft` / `published`, дата публикации.
- Категории и/или теги.
- Загрузка обложки и изображений в контент (через модуль `storage`).
- Двуязычность RO/EN.
- Публичные GET только для `published`.

### Модель `Post`
| поле | тип | описание |
|------|-----|----------|
| id | uuid pk | |
| slug | string unique | для URL |
| title_ro, title_en | string | |
| excerpt_ro, excerpt_en | text\|null | анонс |
| content_ro, content_en | text | markdown |
| cover_image_url | string\|null | |
| status | enum | `draft` / `published` |
| published_at | datetime\|null | |
| author_id | fk User | |
| created_at, updated_at | datetime | |

### Модель `Category` (или `Tag`)
| поле | тип |
|------|-----|
| id | uuid pk |
| slug | string unique |
| name_ro, name_en | string |

Связь Post ↔ Category — many-to-many.

Эндпоинты: публичные `GET /blog/posts?status=published`, `GET /blog/posts/:slug`, `GET /blog/categories`; защищённые CRUD для постов и категорий; `POST /blog/upload` (изображения).

---

## 8. Интеграция Calendly (модуль `appointments`) — группа A

Подробности по записи на видеоконсультации.

### 8.1 Предусловия Calendly
Нужен **платный план** (минимум Standard): несколько event types и webhooks (на Free — 1 event type, без webhooks).
1. Создать 3 event type (50/60/90 мин, видео) под услуги 01–03.
2. Подключить **Google Calendar** (заголовок event type попадёт в событие) и видео-провайдер (Google Meet / Zoom) — ссылка генерируется автоматически.
3. Настроить кастомный вопрос при бронировании (`a1` = «motivul vizitei» / причина визита).
4. Personal Access Token (или OAuth-приложение) — в env.
5. Webhook-подписка на `invitee.created` и `invitee.canceled` (scope = organization).

### 8.2 Env
```
CALENDLY_API_TOKEN=
CALENDLY_ORG_URI=
CALENDLY_WEBHOOK_SIGNING_KEY=
```

### 8.3 Prefill типа услуги (на стороне сайта/фронта)
Тип услуги подставляется автоматически, клиент ничего не вводит.

Ссылка:
```
https://calendly.com/<account>/pediatric?a1=Consultatie%20pediatrica
```
Inline embed:
```javascript
Calendly.initInlineWidget({
  url: 'https://calendly.com/<account>/pediatric',
  parentElement: document.getElementById('calendly-embed'),
  prefill: { customAnswers: { a1: 'Consultatie pediatrica' } }
});
```
Правила: значения чувствительны к регистру; номер `a1` зависит от порядка вопросов; prefill — подсказка, **не** источник истины (поле редактируемо клиентом).

### 8.4 Webhook handler (`POST /webhooks/calendly`)
1. Верифицировать подпись по `CALENDLY_WEBHOOK_SIGNING_KEY`. Невалидные — 401.
2. Тип события: `invitee.created` / `invitee.canceled`.
3. Достать из payload: `scheduled_event.uri` (idempotency key), `scheduled_event.event_type` (**источник истины об услуге**), `start_time`, `end_time`, `location` (видеоссылка), `name`, `email`, `questions_and_answers` (причина визита), `cancel_url`, `reschedule_url`.
4. Сопоставить `event_type` URI → `service_code` по справочнику `Service.calendly_event_type_uri`.
5. Идемпотентно создать/обновить `Appointment` (по `calendly_event_uri`). На `invitee.canceled` — `status = canceled`.
6. Поставить задачу «подготовка за 24 ч» (см. §8.6).
7. Быстро вернуть 200; тяжёлую работу — в фоне.

> Маппинг услуги — **только** по `event_type` URI, не по тексту `a1` (его клиент может изменить).

### 8.5 Backup-синхронизация
Cron-джоб опрашивает `GET /scheduled_events` за период (`min_start_time`/`max_start_time`, scope=organization) + по каждому `GET /scheduled_events/{uuid}/invitees`, сверяет с БД и дозаписывает пропущенное (на случай потери webhook).

### 8.6 Подготовка и план
- **За 24 ч до** `start_time`: шедулер шлёт клиенту инструкции/чек-лист, **зависящие от `service_id`** (нутрициология — дневник питания/анализы; педиатрия — свой набор). Проставляет `prep_sent_at`.
- **После встречи:** специалист загружает письменный план в карточку записи через back office; клиент скачивает в ЛК; `plan_uploaded_at`, `status=completed`. Неявка → `status=no_show`.

### Модель `Appointment`
| поле | тип | описание |
|------|-----|----------|
| id | uuid pk | |
| service_id | fk | |
| calendly_event_uri | string unique | idempotency key |
| client_name | string | |
| client_email | string | |
| reason | text\|null | причина визита |
| start_time, end_time | datetime | |
| video_url | string\|null | |
| status | enum | `scheduled` / `canceled` / `completed` / `no_show` |
| payment_status | enum | `pending` / `confirmed` — **зеркало строки `Payment`**, не ручное поле (см. §12) |
| cancel_url, reschedule_url | string | |
| prep_sent_at | datetime\|null | |
| plan_uploaded_at | datetime\|null | |
| created_at, updated_at | datetime | |

---

## 9. Контакты (модуль `contacts`)

Отдельная страница в back office: список контактов, добавление новых, редактирование.

### Модель `Contact`
| поле | тип | описание |
|------|-----|----------|
| id | uuid pk | |
| type | enum | напр. `phone` / `email` / `address` / `social` / `other` |
| label_ro, label_en | string | подпись |
| value | string | значение (номер, email, ссылка, адрес) |
| sort_order | int | |
| active | bool | |
| created_at, updated_at | datetime | |

Эндпоинты: публичный `GET /contacts` (для сайта), защищённые `POST/PATCH/DELETE`.

---

## 10. About us (модуль `about`)

Отдельная страница: редактирование контента «О нас». Обычно это singleton-документ (одна запись), но с версионностью полей RO/EN и блоками.

### Модель `AboutPage` (singleton)
| поле | тип | описание |
|------|-----|----------|
| id | uuid pk | один экземпляр |
| title_ro, title_en | string | |
| content_ro, content_en | text | markdown `[DEFAULT]` |
| images | json\|null | ссылки на изображения |
| updated_at | datetime | |

Эндпоинты: публичный `GET /about`, защищённый `PATCH /about` (admin/editor).

---

## 11. Dashboard / статистика (модуль `dashboard`)

Конкретные метрики **уточним позже** — заложить каркас и базовый набор:
- Кол-во записей по каждой услуге за период (group by `service`).
- Конверсия `scheduled → completed`, доля `no_show`, доля `canceled`.
- Активные подписки + использование квоты видеозвонков.
- Тикеты: кол-во и SLA (доля ответов в пределах 48 ч).
- Выручка по `payment_status=confirmed`. Деньги считать по таблице `Payment` (`state`, `amount`, `refundedAmount`), а не по зеркалу.

Backend: эндпоинт(ы) `GET /dashboard/stats?from=&to=`. Front: карточки + графики (shadcn + chart-библиотека). Сделать так, чтобы новые метрики добавлялись без переписывания каркаса.

---

## 12. Оплата — maib e-Commerce Checkout

⚠️ **Переписано 2026-09-10.** Прежняя редакция говорила «оплата вне scope, подтверждение
ручное». Это больше не так: клиент запросил онлайн-оплату (ответы v2, §11.8), и платёжный
модуль построен. **Единственный источник правды — `docs/payments-maib-checkout.md`**: там
API банка, четыре расхождения песочницы с документацией, схема ledger'а и то, что ещё
закрыто клиентом.

- Отдельная сущность **`Payment`** (+ `PaymentRefund`) хранит состояние платежа:
  `created` / `pending` / `paid` / `failed` / `expired` / `abandoned` / `cancelled` /
  `refunded` / `partially_refunded`, суммы, RRN, маску карты, сырой callback.
- `payment_status` на `Appointment`, `Subscription`, `QuickQuestion` и `DeliverableOrder`
  остаётся, но теперь это **зеркало**: `markTargetPaid()` проставляет `confirmed`, когда
  платёж перешёл в `paid`. Руками его не ставят. Считать деньги по зеркалу нельзя —
  оно не знает про возвраты.
- Callback банка проверяется по подписи (HMAC над `{rawBody}.{timestamp}`, base64 —
  порядок и кодировка **обратные** нашему вебхуку Calendly, не «чинить» одно под другое),
  идемпотентно по `payId`.
- ⛔ **Поток ещё не подключён:** `PaymentsService.start()` никто не вызывает, страниц
  возврата на сайте нет, callback ни разу не приходил — нет публичного HTTPS-хоста.
  Пока это не сделано, каждая платная поверхность работает как раньше, вручную.
- SEPA остаётся ручным по определению: показываем IBAN, подтверждаем в back office.

---

## 13. Docker / деплой backend

- **Dockerfile** для `apps/api` (multi-stage build: install → build → runtime, минимальный production-образ на slim/alpine Node).
- **docker-compose** для локалки и деплоя: сервисы `api`, `postgres`, (опц.) `adminer`/`pgadmin`. Тома для данных Postgres и для `uploads/`.
- Переменные окружения через `.env` (в репе — `.env.example` без секретов).
- `HEALTHCHECK` на `/health`.
- Миграции Prisma запускать на старте контейнера (entrypoint) или отдельным шагом деплоя.
- Back office (Vite) — статическая сборка, отдавать через nginx или хостинг статики (можно отдельным контейнером `web` в compose, опционально).

---

## 14. Общие нефункциональные требования

- TypeScript строгий режим во всех пакетах.
- DTO и enum (роли, статусы, service codes) — в `packages/shared`, импортируются всеми тремя приложениями: `apps/api`, `apps/back-office` и `apps/web`. Фронтенд и back office типизируют ответы API именно этими DTO из NestJS (single source of truth, без ручного дублирования типов).
- Линт/формат: ESLint + Prettier, единый конфиг на монорепу.
- Все списки — с пагинацией; контентные сущности — с RO/EN.
- Логирование без персональных данных в открытом виде.
- **GDPR:** в портал попадают имена/email/вложения (анализы) — продумать согласие и хранение (контекст ЕС/Молдова).

---

## 15. Порядок реализации (предлагаемый)

1. Поднять монорепу (pnpm + Turborepo), `packages/shared`, `apps/api`, `apps/back-office`, `apps/web`.
2. Backend: Prisma-схема всех моделей + миграции; Docker + docker-compose с Postgres.
3. `auth` + `users` + Login в back office + защищённые роуты и роли.
4. Layout back office на shadcn (использовать скил `impeccable`).
5. `services` (CRUD тарифов) + страница в back office + публичный GET.
6. `blog` (kit) + редактор + публичные GET.
7. `contacts` и `about` + страницы редактирования.
8. `appointments` + webhook Calendly + backup-cron + подготовка/план.
9. `subscriptions` (04) и `quick-questions` (05).
10. `dashboard` — каркас + базовые метрики.
11. Платежи: ledger `Payment` + страница «Plăți» в back office. Подключение к потокам оплаты — по `docs/payments-maib-checkout.md` §10.

---

## 16. Открытые вопросы (если у Claude Code появятся уточнения)

1. Менеджер монорепы и имена пакетов — оставить `[DEFAULT]` или иначе?
2. PostgreSQL + Prisma — ок, или MySQL/TypeORM?
3. ~~Текущий фронт — внешний или в репе~~ → **решено: в монорепе как `apps/web`, типизирует ответы API через DTO из `packages/shared`.**
4. Роли `admin`/`editor` достаточно, или нужен ещё уровень?
5. Блог: markdown или rich-text (HTML)? Категории, теги или оба?
6. Куда грузить изображения сразу — локально или S3/Cloudinary с первого дня?
7. Какие именно метрики на Dashboard в первой версии?
8. Что делает скил `impeccable` в вашей среде — подтвердить, что он доступен в Claude Code и как его вызывать.