# Структура страницы «Услуги» (Services)

> Пояснения — по-русски. Готовый текст для страницы — на английском (под `/en`), в кавычках/блоках. Локализуется в `ro-MD` (основная) и `ru-MD`.
> Врач: Olesea Jalba — педиатр + магистр по питанию человека (USMF), спец. подготовка по детскому питанию и трудностям кормления.

---

## 0. Контекст и допущения

- Главную страницу (`localhost:3000/en`) не видел — структуру сверь с её тоном/блоками сам.
- **Помечено `⚠ уточнить`** — то, что я предположил (состав абонемента, точный состав «Quick question», цены). Подтверди перед публикацией.
- Язык копирайта: примеры на EN. Скажи — выдам RO (основной локаль) и RU.

---

## 1. Кто приходит на страницу (гипотезы → проверить на клиентах)

Рамка из `user-research` / Jobs-to-be-Done. Это **не данные исследования**, а гипотезы, обоснованные профилем врача. Они объясняют, почему страница устроена именно так.

| Сегмент | Что им нужно (JTBD) | Куда ведём |
|---|---|---|
| Родители малышей 0–3 лет | «Почему ребёнок плохо ест / часто болеет — без записи в клинику на 3 недели» | Pediatric / Nutrition |
| Родители детей постарше | «Получить экспертное мнение / второе мнение онлайн» | Pediatric |
| Взрослые по питанию | «Нужен персональный план питания на доказательной базе» | Nutrition |
| Семьи со сложным/длительным случаем | «Хочу, чтобы врач вёл нас, а не один разовый приём» | Integrative / 3-month |
| Один конкретный вопрос | «У меня всего один вопрос, нужен быстрый надёжный ответ» | Quick question |

**Вывод для IA:** услуги различаются не темой, а **форматом и уровнем вовлечённости** — это и есть главная ось группировки.

---

## 2. Главное решение по группировке

5 услуг делятся на 2 понятных группы (совпадает с архитектурой: Calendly vs портал):

**Группа A — Видеоконсультации** (разовые, живые, бронь через Calendly)
- Pediatric consultation — 50 мин
- Nutrition consultation — 60 мин
- Integrative consultation & monitoring — 90 мин

**Группа B — Сопровождение и быстрая поддержка** (через портал)
- 3-month monitoring — абонемент
- Quick question — ответ за 48 ч

---

## 3. Структура страницы сверху вниз

```
1. Hero / интро            — H1 + подзаголовок + строка доверия
2. Помощник выбора          — «Не уверены, что выбрать?» (мини-гид)
3. Секция A: видеоконсультации (3 карточки)
4. Секция B: сопровождение + быстрый вопрос (2 карточки)
5. Сравнительная таблица    — все 5 услуг рядом
6. Как это работает         — 2 мини-сценария (видео / портал)
7. О враче (доверие)        — кратко из CV + ссылка на About
8. FAQ                       — оплата, язык, отмена, «не для экстренных»
9. Финальный CTA            — «Готовы записаться?» + запасной путь
```

### 1. Hero
```
Eyebrow:   Services
H1:        Pediatric & nutrition care, online
Subhead:   Book a video consultation or get ongoing support from a
           pediatrician and nutrition specialist — wherever you are.
Trust line: Pediatrician · MSc in Human Nutrition · member of pediatric societies
```

### 2. Помощник выбора (блок «Which service fits?»)
Короткий гид на 2–3 строки или мини-таблица. Снимает главный страх — «а мне какую?».
```
Heading:  Not sure which one you need?
- One specific question → Quick question
- Your child's health → Pediatric consultation
- Feeding or diet → Nutrition consultation
- A complex case or ongoing care → Integrative consultation
```

### 6. Как это работает (2 дорожки)
```
Video consultations:
1. Choose a service & time   2. Pay by transfer & confirm
3. Join the video call       4. Get your written summary

Portal services:
1. Choose the service        2. Pay & submit your details
3. The doctor reviews        4. Get your answer / ongoing plan
```

### 7. О враче (из CV, кратко)
```
Olesea Jalba, pediatrician with an MSc in Human Nutrition (USMF
"Nicolae Testemițanu"). Focus areas: child nutrition and feeding
difficulties, pediatric gastroenterology, allergology. Member of the
Society of Pediatrics. → See full profile
```

### 9. Финальный CTA
```
Heading: Ready to start?
Primary: Book a consultation
Helper:  Have a question first? → Ask the doctor (Quick question)
```

---

## 4. Анатомия карточки услуги (переиспользуемый компонент)

Каждая услуга = одна карточка с одинаковыми полями:

```
[ Format badge ]                     ← Video call / Online portal
Service name
Duration / commitment                ← 50 min · 60 min · 90 min · 3 months · 48h reply
One-line value prop                  ← что человек получает
Best for: ...                        ← одной строкой, кому
What's included:                     ← 3–5 пунктов
 • ...
Price                                ← + пометка про оплату переводом
[ Primary CTA ]                      ← глагол + результат
```

---

## 5. Текст для каждой услуги (EN, готов к локализации)

### A1 · Pediatric consultation — 50 min · video
```
Value:    A focused video visit for your child's health — symptoms,
          growth, development, or a second opinion.
Best for: Parents who need expert pediatric guidance without a clinic visit.
Included: • 50-minute video call
          • Review of symptoms, history and any documents you share
          • Clear assessment and next steps
          • Written summary with recommendations after the call
CTA:      Book a time
```

### A2 · Nutrition consultation — 60 min · video
```
Value:    A personalized, evidence-based look at feeding and nutrition —
          for children or adults.
Best for: Anyone working through feeding difficulties, a new diet,
          weight, or healthy-eating goals.
Included: • 60-minute video call
          • Analysis of your current eating / feeding patterns
          • A personalized nutrition plan
          • Written recommendations after the call
CTA:      Book a time
```
> Сильный угол: у врача отдельная подготовка по трудностям кормления и «bottle aversion» — это стоит явно упомянуть как преимущество для родителей малышей.

### A3 · Integrative consultation & monitoring — 90 min · video
```
Value:    An in-depth visit that combines pediatric and nutrition
          expertise, with a plan to follow over time.
Best for: Complex or ongoing situations that need a thorough,
          joined-up assessment.
Included: • 90-minute in-depth video call
          • Combined pediatric + nutrition assessment
          • A tailored action plan
          • Initial follow-up / monitoring guidance
CTA:      Book a time
```

### B1 · 3-month monitoring — subscription · portal
```
Value:    Continuous guidance over three months — the doctor follows
          your progress between consultations.
Best for: Families who want steady support, not a one-off visit.
Included: • Ongoing case monitoring for 3 months          ⚠ уточнить состав
          • Periodic check-ins
          • Plan adjustments as things change
          • Priority messaging with the doctor
CTA:      Request a place
```

### B2 · Quick question — 48h reply · portal
```
Value:    Have one question? Get a written answer from the doctor
          within 48 hours.
Best for: A specific, non-urgent question that doesn't need a full
          consultation.
Included: • Submit your question (with photos / documents if needed)
          • Written reply within 48 hours
          • One round of clarification                    ⚠ уточнить
Note:     Not for emergencies — if it's urgent, contact emergency services.
CTA:      Ask your question
```

---

## 6. Сравнительная таблица (блок на странице)

| | Pediatric | Nutrition | Integrative | 3-month | Quick question |
|---|---|---|---|---|---|
| **Format** | Video | Video | Video | Portal | Portal |
| **Duration** | 50 min | 60 min | 90 min | 3 months | 48h reply |
| **For** | Child health | Feeding / diet | Complex / ongoing | Continuous support | One question |
| **Output** | Summary | Nutrition plan | Action plan | Ongoing plan | Written answer |
| **Price** | ⚠ | ⚠ | ⚠ | ⚠ | ⚠ |
| **Action** | Book a time | Book a time | Book a time | Request a place | Ask your question |

---

## 7. FAQ (черновик вопросов)

- **How do video consultations work?** — браузер/ссылка, без установки (зависит от инструмента).
- **Which languages?** — Romanian, Russian, English.
- **How do I pay?** — Bank transfer only (в этой версии онлайн-оплаты нет). *(из архитектуры)*
- **Can I reschedule or cancel?** — по правилам Calendly. ⚠ задать политику.
- **Is this for emergencies?** — No. Важно указать явно (медико-правовой момент).
- **Will I get a prescription?** — ⚠ уточнить (зависит от регуляторики РМ для телемедицины).
- **Pediatric vs Integrative — в чём разница?** — снимает блок «Помощник выбора».

---

## 8. Поля контента для CMS / back-office (билингва RO/EN)

Под твою модель (`title_ro/title_en`, `content_ro/content_en`):

```
service:
  slug                 # pediatric-consultation
  group                # A_video | B_portal
  order                # порядок в группе
  title_ro / title_en
  format               # video | portal
  duration_label_ro/en # "50 min" / "48h reply"
  value_prop_ro/en
  best_for_ro/en
  included_ro/en[]     # массив пунктов
  price                # + способ оплаты
  cta_label_ro/en
  cta_target           # Calendly event_type URI | портальный route
  is_emergency_safe    # bool → показывать ли дисклеймер
```

---

## 9. Что подтвердить перед публикацией

1. Цены всех 5 услуг + формулировка про оплату переводом.
2. Точный состав **3-month monitoring** (что входит, частота контактов).
3. Точный состав **Quick question** (есть ли уточняющий раунд, лимит на объём).
4. Политика отмены/переноса для видеоконсультаций.
5. Рецепты — выдаются ли при телеконсультации (регуляторика РМ).
6. Язык страницы: оставляем EN-копию или сразу делать RO как основную?
```