# Структура страницы «Consultație integrativă» (apps/web)

> Посадочная страница самой комплексной видеоуслуги: 90 мин · видео · с мониторингом.
> Конвертит в Calendly `event_type` услуги `integrative-consultation`.
> Пояснения — по-русски. Текст — на **румынском** (основной локаль). Локализуется в `en`/`ru`.
> Главная задача страницы: **оправдать 90 мин + мониторинг** против одиночных консультаций.

---

## 0. Контекст и допущения

- Ссылка дана как якорь `/ro/services#integrative`. Pediatrie/Nutriție — отдельные страницы.
  **Рекомендация:** вынести на свой роут `/ro/integrative` для единообразия. ⚠ решение за тобой.
- Localhost не открывал — сверь сам.
- **`⚠ уточнить`** — объём мониторинга, срок сопровождения, аудитория, граница с «3-month monitoring», перенос, цена.
- Копирайт на RO. Скажи — выдам EN/RU.

---

## 1. Кому адресована страница (гипотезы → проверить)

Рамка `user-research` / JTBD. Гипотезы, не данные исследования.

| Сегмент                           | JTBD                                                         |
| --------------------------------- | ------------------------------------------------------------ |
| Сложный / многофакторный случай   | «Несколько проблем сразу — нужен цельный взгляд, а не куски» |
| Здоровье + питание переплетены    | «Не хочу бегать между специалистами»                         |
| Нужно ведение, не разовый приём   | «Хочу, чтобы план потом скорректировали»                     |
| Длительная / хроническая ситуация | «Давно не можем разобраться — нужен глубокий разбор»         |

**Вывод:** ядро страницы — не «с чем поможем», а **«когда выбрать именно эту»** + **«чем отличается»**. Здесь острее всего стоит вопрос дифференциации, и именно тут работает дуэт «педиатр + нутрициолог».

---

## 2. Структура страницы сверху вниз

```
1. Hero                 — H1 + подзаголовок + бейдж (90 min + мониторинг) + CTA + доверие
2. Когда выбрать         — «alege dacă…» (ядро дифференциации)
3. Что входит            — комбинированная оценка + план + мониторинг
4. Как проходит          — 4 шага, включая follow-up
5. Чем отличается        — мини-сравнение трёх консультаций
6. О враче               — дуэт педиатр+нутрициолог = причина, почему это работает
7. Нужно дольше?         — связь с «Monitorizare 3 luni»
8. Чего НЕ заменяет       — безопасность, 112
9. FAQ
10. CTA финал + кросс-ссылки
```

---

## 3. Текст страницы (RO, готов к публикации)

### 1. Hero

```
Eyebrow:    Consultație integrativă
H1:         Consultație integrativă și monitorizare
Subhead:    O evaluare aprofundată care îmbină expertiza pediatrică și
            nutrițională, cu un plan de urmărit în timp.
Badge:      Apel video · 90 min · cu monitorizare       ⚠ объём
CTA primar: Programează o consultație
Trust line: Medic pediatru cu master în nutriție umană — o privire de
            ansamblu asupra sănătății și alimentației
```

### 2. Когда выбрать (ядро)

```
Heading: Când să alegi această consultație

Alege consultația integrativă dacă:
• Situația este complexă sau durează de mai mult timp.
• Ai mai multe preocupări deodată — sănătate și alimentație împreună.
• Vrei o evaluare aprofundată, cu mai mult timp de discuție.
• Ai nevoie nu doar de un sfat unic, ci de urmărire în timp.
```

### 3. Что входит

```
Heading: Ce include

• Apel video aprofundat de 90 de minute
• Evaluare combinată: pediatrică și nutrițională
• Un plan de acțiune personalizat
• Îndrumare inițială de monitorizare și urmărire          ⚠ объём/срок
```

### 4. Как проходит

```
Heading: Cum decurge

1. Programezi o oră și completezi un formular detaliat despre copil
   (sau despre tine) — istoric, simptome, alimentație.
2. Te conectezi la apelul video de 90 de minute, unde analizăm
   situația în ansamblu.
3. Primești un plan de acțiune și recomandări scrise.
4. Urmărim împreună progresul și ajustăm planul la nevoie.   ⚠ формат/срок
```

### 5. Чем отличается (мини-сравнение)

```
Heading: Prin ce diferă de celelalte consultații

• Consultație pediatrică (50 min) — o problemă de sănătate, evaluare
  focusată.
• Consultație de nutriție (60 min) — alimentație și hrănire.
• Consultație integrativă (90 min) — situații complexe care îmbină
  sănătatea și nutriția, cu mai mult timp și cu monitorizare.
```

### 6. О враче

```
Heading: Despre medic

Dr. Olesea Jalba este medic pediatru cu master în Sănătate Publică –
Nutriție Umană. Tocmai această dublă expertiză face posibilă o
consultație integrativă — o evaluare care privește copilul (sau
adultul) ca pe un întreg, nu pe bucăți.

→ Vezi profilul complet
```

### 7. Нужно дольше?

```
Heading: Ai nevoie de sprijin pe termen mai lung?
Dacă vrei urmărire continuă timp de mai multe luni, vezi programul
de monitorizare de 3 luni.
→ Monitorizare 3 luni
```

> Важно развести: интегративная = глубокая разовая оценка + _начальное_ сопровождение; «3 luni» = отдельный длительный абонемент. ⚠ зафиксируй точную границу.

### 8. Чего не заменяет (безопасность)

```
Heading: Ce nu poate înlocui consultația online

Consultația integrativă online nu este pentru urgențe medicale. Dacă
starea este gravă sau se agravează rapid, sună la 112 sau mergi la cel
mai apropiat serviciu de urgență. Unele situații pot necesita o
examinare fizică sau investigații — îți vom spune clar.
```

### 9. FAQ

```
• Ce include monitorizarea?                          ⚠ объём
• Cât durează urmărirea după consultație?            ⚠ срок
• Este pentru copii sau și pentru adulți?            ⚠ аудитория
• În ce limbi pot discuta?  → Română, Rusă, Engleză.
• Cum se face plata?  → Prin transfer bancar (deocamdată fără plată online).
• Pot reprograma sau anula?                          ⚠ политика
```

### 10. CTA финал + кросс-ссылки

```
Heading:    Programează o consultație integrativă
CTA primar: Programează o oră (90 min, video)
Helper:     Nu ești sigur ce ți se potrivește? → Vezi toate serviciile

Cross-link:
• Doar o problemă de sănătate? → Consultație pediatrică
• Doar alimentație? → Consultație de nutriție
• Sprijin pe mai multe luni? → Monitorizare 3 luni
```

---

## 4. SEO (RO)

```
Meta title:       Consultație integrativă și monitorizare | Dr. Olesea Jalba
Meta description: Consultație video aprofundată (90 min) care îmbină
                  pediatria și nutriția, cu plan personalizat și
                  monitorizare. Pentru situații complexe.
Ключевые фразы:   consultație integrativă · evaluare completă copil ·
                  pediatrie și nutriție · monitorizare copil online
H1:               один, как в Hero. Заголовки секций — h2.
```

---

## 5. Поля контента для CMS / back-office (RO/EN/RU)

Тот же компонент-шаблон посадочной + два уникальных блока (сравнение, связь с 3 luni):

```
page_integrative:
  hero_title / hero_subhead / hero_badge / hero_trust
  choose_when[]           # «alege dacă…»
  includes[]              # что входит
  steps[]                 # 4 шага (вкл. follow-up)
  compare[]               # мини-сравнение 3 консультаций
  doctor_blurb
  longterm_cta            # связь с 3-month monitoring
  limits_text
  faq[]
  cta_label / cta_target  # = Calendly URI услуги integrative-consultation
  seo_title / seo_description
```

---

## 6. Что подтвердить перед публикацией

1. Роут: оставляем якорь на /services или выносим в `/ro/integrative` (рекомендую второе).
2. Точный объём «мониторинга», входящего в эту услугу.
3. Срок сопровождения/урмэрире после консультации.
4. Граница между этой услугой и абонементом «3 luni».
5. Аудитория: дети, или дети + взрослые.
6. Политика отмены/переноса; цена (со страницы услуг).

```

```
