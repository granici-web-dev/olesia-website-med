# Структура страницы «Monitorizare 3 luni» (apps/web · /ro)

> **Портальная услуга-подписка**, не Calendly-консультация. Механика записи и структура отличаются от посадочных видеоуслуг.
> Запись: заявка через портал → подтверждение → оплата переводом → старт.
> Пояснения — по-русски. Текст — на **румынском** (основной локаль). Локализуется в `en`/`ru`.
> ⚠ **Реальный состав абонемента не подтверждён** — секция «что входит» дана как каркас с плейсхолдерами. Заполни сам, ничего не выдумано.

---

## 0. Контекст и допущения

- Localhost не открывал — сверь сам.
- **`⚠ уточнить`** здесь критично и встречается часто: состав программы, частота контактов, каналы, входят ли созвоны, нужна ли стартовая консультация, отмена/возврат, оплата, цена, аудитория.
- Копирайт на RO. Скажи — выдам EN/RU.

---

## 1. Кому адресована страница (гипотезы → проверить)

Рамка `user-research` / JTBD. Гипотезы, не данные исследования.

| Сегмент                              | JTBD                                                 |
| ------------------------------------ | ---------------------------------------------------- |
| Длительная / хроническая ситуация    | «Нужен не разовый совет, а сопровождение во времени» |
| Нужна уверенность между приёмами     | «Хочу, чтобы было к кому обратиться по ходу»         |
| После интегративной консультации     | «Дали план — теперь ведите меня по нему»             |
| Случай с постоянными корректировками | «План надо подстраивать по мере изменений»           |

**Вывод:** главная задача страницы — **оправдать 3-месячное обязательство**. Это делается двумя секциями: «кому подходит» (отсечь не своих) и «что входит» (осязаемая конкретика, а не «ведение клиента»).

---

## 2. Структура страницы сверху вниз

```
1. Hero                 — H1 + подзаголовок + бейдж (3 luni · portal) + CTA «Solicită un loc»
2. Кому подходит         — «alege dacă…»
3. Что входит за 3 мес   — ЯДРО, осязаемые пункты (⚠ плейсхолдеры → заполнить)
4. Как записаться        — flow заявки (не мгновенная бронь!)
5. Чем отличается        — разовая консультация vs интегративная vs 3 luni
6. О враче               — доверие (тут оно важнее всего: обязательство на месяцы)
7. Чего НЕ заменяет       — безопасность, 112
8. FAQ
9. CTA финал + кросс-ссылки
```

---

## 3. Текст страницы (RO)

### 1. Hero

```
Eyebrow:    Monitorizare 3 luni
H1:         Monitorizare și sprijin timp de 3 luni
Subhead:    Îndrumare continuă pe parcursul a trei luni — medicul îți
            urmărește progresul între consultații.
Badge:      Program de 3 luni · prin portal
CTA primar: Solicită un loc
Trust line: Medic pediatru cu master în nutriție umană — sprijin
            constant, adaptat situației tale
```

### 2. Кому подходит

```
Heading: Pentru cine este potrivit

Alege monitorizarea de 3 luni dacă:
• Situația cere urmărire în timp, nu un singur sfat.
• Vrei să ajustezi planul pe măsură ce lucrurile evoluează.
• Vrei să ai la cine apela între consultații.
• Treci printr-o perioadă în care sprijinul constant contează.
```

### 3. Что входит (ЯДРО — ⚠ каркас, заменить реальным составом)

```
Heading: Ce include programul

⚠ ВНИМАНИЕ: пункты ниже — шаблон. Замени реальным составом абонемента.
   Не публиковать как есть.

• Urmărirea cazului timp de 3 luni
• Verificări periodice ale progresului              ⚠ частота (раз в неделю/мес?)
• Ajustarea planului în funcție de evoluție
• Acces prioritar pentru întrebări                  ⚠ канал и лимиты
• [Consultații video incluse?]                      ⚠ входят ли и сколько
• [Materiale / recomandări scrise?]                 ⚠ что ещё
```

> Это самая важная секция и самая рискованная. Пока состав не подтверждён — страница к публикации не готова.

### 4. Как записаться (flow, не мгновенная бронь)

```
Heading: Cum funcționează înscrierea

1. Trimiți o solicitare prin portal.
2. Confirmăm împreună dacă programul ți se potrivește.   ⚠ нужна ли стартовая консультация
3. Achiți prin transfer bancar.                          ⚠ полностью / частями
4. Programul începe și primești acces în portal.
```

> Ключевой бизнес-вопрос: **требуется ли консультация ДО входа в программу** (часто да — чтобы оценить случай). Зафиксируй.

### 5. Чем отличается

```
Heading: Prin ce diferă de o consultație

• O consultație (50–90 min) — un singur moment de evaluare și sfat.
• Consultația integrativă — evaluare aprofundată plus îndrumare
  inițială de urmărire.
• Monitorizare 3 luni — sprijin și urmărire continuă, pe parcursul
  mai multor luni.
```

### 6. О враче

```
Heading: Despre medic

Dr. Olesea Jalba este medic pediatru cu master în Sănătate Publică –
Nutriție Umană. Pe parcursul celor trei luni, beneficiezi de o
urmărire care ține cont atât de sănătate, cât și de alimentație.

→ Vezi profilul complet
```

### 7. Чего не заменяет (безопасность)

```
Heading: Ce nu poate înlocui programul

Monitorizarea online nu este pentru urgențe medicale și nu înlocuiește
îngrijirea medicală în persoană atunci când este necesară. Pentru
urgențe, sună la 112. Dacă o situație necesită examinare fizică sau
investigații, îți vom spune clar.
```

### 8. FAQ

```
• Ce include exact programul?                     ⚠
• Cum comunicăm pe parcursul celor 3 luni?        ⚠ канал связи
• Cât de repede primesc răspuns la întrebări?     ⚠ внутренний SLA
• Trebuie o consultație înainte de înscriere?     ⚠ prerequisite
• Pot să mă retrag înainte de final?              ⚠ возврат/отмена
• Cum se face plata?  → Prin transfer bancar.     ⚠ единоразово/частями
• În ce limbi pot comunica?  → Română, Rusă, Engleză.
```

### 9. CTA финал + кросс-ссылки

```
Heading:    Solicită un loc în programul de 3 luni
CTA primar: Solicită un loc
Helper:     Nu ești sigur că ai nevoie de un program complet?
            Începe cu o consultație.

Cross-link:
• O evaluare aprofundată, o singură dată → Consultație integrativă
• Ai o singură întrebare → Întreabă medicul (48h)
```

---

## 4. Техническая заметка для реализации

- CTA «Solicită un loc» НЕ ведёт на Calendly. Это заявка, которая постит в `apps/api` и создаёт запись для обработки в back-office (ручное подтверждение + перевод).
- Нужны: форма заявки (минимум полей), состояния success/error, понятный текст «мы свяжемся для подтверждения».
- Поскольку оплата ручная и вход не мгновенный — текст должен честно задавать ожидание: это заявка, а не моментальная покупка.
- Это Group B (портал), отдельно от Calendly-логики Group A.

---

## 5. SEO (RO)

```
Meta title:       Monitorizare și sprijin 3 luni | Dr. Olesea Jalba
Meta description: Program de monitorizare de 3 luni pentru sănătatea și
                  alimentația copilului: urmărire continuă, ajustarea
                  planului, acces prioritar.   ⚠ свериться с реальным составом
H1:               один, как в Hero.
```

> Это больше страница доверия/конверсии, чем SEO — поисковый объём низкий.

---

## 6. Поля контента для CMS / back-office (RO/EN/RU)

```
page_monitoring_3m:
  hero_title / hero_subhead / hero_badge / hero_trust
  for_whom[]              # «alege dacă…»
  includes[]              # ⚠ реальный состав
  enrollment_steps[]      # flow заявки
  compare[]               # отличие от консультаций
  doctor_blurb
  limits_text
  faq[]
  cta_label / cta_target  # портальный роут заявки (не Calendly)
  seo_title / seo_description
```

---

## 7. Что подтвердить перед публикацией (блокеры)

1. **Точный состав программы** — без него секция «что входит» нерабочая.
2. Частота и формат контактов (проверки, созвоны, переписка).
3. Канал связи внутри программы и срок ответа (внутренний SLA).
4. Входят ли видеоконсультации и сколько.
5. Нужна ли консультация ДО записи (prerequisite).
6. Условия отмены/возврата.
7. Оплата: единоразово или частями; цена.
8. Аудитория: дети / дети + взрослые.

```

```
