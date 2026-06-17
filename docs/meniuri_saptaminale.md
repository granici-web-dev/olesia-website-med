# Структура страницы «Meniuri săptămânale» (apps/web · /ro)

> **Контентный хаб** недельных меню (тот же раздел `/ro/articles`, что гайды). Верх воронки по питанию → переход в нутри-консультацию.
> CMS-управляемая. Две специфики меню: **сегментация по возрасту** и **граница generic vs персональный план**.
> Пояснения — по-русски. Текст — на **румынском** (основной локаль). Локализуется в `en`/`ru`.

---

## 0. Контекст и допущения

- Ссылка снова `/ro/articles` — то есть «meniuri» и «ghiduri», вероятно, два типа контента в одном разделе. ⚠ уточнить структуру роутов (`/ro/articles/meniuri`?).
- Localhost не открывал — сверь сам.
- **`⚠ уточнить`**: generic vs привязка к услуге, сегменты по возрасту, грудничковые меню, free/gated, формат (на странице/PDF), языки, есть ли готовые меню.
- Копирайт на RO. Скажи — выдам EN/RU.

---

## 1. Зачем сюда приходят (гипотезы → проверить)

| Сегмент | JTBD |
|---|---|
| «Что готовить ребёнку» | «Дай готовые идеи на неделю, не придумывать каждый день» |
| Родитель мофтуна | «Идеи, чтобы разнообразить и накормить» |
| Семья за здоровым питанием | «Сбалансированное меню на неделю» |
| На этапе прикорма | «Что давать малышу» — ⚠ индивидуально, уводим в консультацию |

**Вывод:** задача — снять родителю ментальную нагрузку готовыми идеями, подтвердить экспертизу и увести за персональным планом в консультацию. Не медицинский совет, а вдохновение.

---

## 2. Две ключевые специфики этой страницы

**A. Сегментация по возрасту — обязательна.** Меню без возраста бессмысленно. Ядро страницы — выбор группы, не плоская сетка.

**B. Граница generic vs персональный план.**
| | Общее меню (эта страница) | Персональный план |
|---|---|---|
| Что это | идеи-вдохновение | план под конкретного ребёнка |
| Учитывает аллергии/состояния | нет | да |
| Где | бесплатный контент | услуга «Consultație de nutriție» |

Если не развести — бесплатные меню каннибализируют платную услугу, а родитель примет generic за медсовет. **Грудничковые меню generic-форматом не публиковать** — прикорм индивидуален. ⚠

---

## 3. Структура страницы сверху вниз

```
1. Hero               — H1 + подзаголовок + лёгкий дисклеймер
2. Выбор по возрасту   — сегменты (ядро IA)
3. Сетка меню          — карточки (или пустое состояние)
4. Как использовать     — это общие идеи, адаптируй под ребёнка
5. Когда нужен план     — scope → Consultație de nutriție
6. Безопасность         — аллергии/состояния/грудничкам → консультация
7. Кто составляет        — доверие → Despre
8. CTA конверсии        — персональный план / вопрос
9. (опц.) Рассылка
```

---

## 4. Текст страницы (RO)

### 1. Hero
```
Eyebrow:  Meniuri
H1:       Meniuri săptămânale
Subhead:  Idei practice de meniuri pentru copii și familie, pregătite de
          un medic pediatru cu specializare în nutriție — inspirație
          pentru o săptămână întreagă.
```

### 2. Выбор по возрасту (ядро)
```
Heading: Alege în funcție de vârstă
• Copii mici
• Copii
• Familie / adulți

Pentru sugari: diversificarea se face individual — recomandăm o
consultație de nutriție în loc de un meniu general.    ⚠ грудничков уводим в консультацию
```

### 3. Сетка меню / пустое состояние
```
Heading: Meniurile săptămânii
[карточки — см. анатомию ниже]
```
**Пустое состояние (вероятный старт):**
```
Heading: Meniurile vin în curând
Pregătim primele meniuri săptămânale. Între timp, pentru un plan
adaptat copilului tău, programează o consultație de nutriție.
CTA: Consultație de nutriție
```

### 4. Как использовать
```
Heading: Cum să folosești meniurile
Acestea sunt idei generale, gândite să-ți ușureze planificarea
săptămânii. Adaptează-le la preferințele, vârsta și nevoile copilului tău.
```

### 5. Когда нужен персональный план
```
Heading: Când ai nevoie de un plan personalizat
Un meniu general nu ține cont de situația specifică a copilului tău.
Dacă ai nevoie de un plan adaptat — pentru alergii, dificultăți de
hrănire sau o afecțiune — programează o consultație de nutriție.
→ Consultație de nutriție
```

### 6. Безопасность (дисклеймер)
```
Meniurile au scop informativ și nu înlocuiesc sfatul medical
personalizat. Dacă copilul are alergii, intoleranțe sau o afecțiune,
consultă medicul înainte de a aplica un meniu. Pentru sugari,
diversificarea se stabilește individual.
```

### 7. Кто составляет
```
Heading: Cine pregătește meniurile
Meniurile sunt realizate de Dr. Olesea Jalba, medic pediatru cu master
în nutriție umană.
→ Despre medic
```

### 8. CTA конверсии
```
Heading: Vrei un plan făcut pentru copilul tău?
• Pentru un plan personalizat → Consultație de nutriție
• Pentru o întrebare punctuală → Întreabă medicul (răspuns în 48h)
```

---

## 5. Анатомия карточки меню (переиспользуемый компонент)

```
[ Cover / preview săptămână ]
Vârstă tag                ← Copii mici / Copii / Familie
Title                     ← напр. „Meniu echilibrat pentru o săptămână"
Short description
Format                    ← Vezi pe pagină · PDF printabil
[ Vezi meniul ]  / [ Descarcă ]
```
> Деталь меню (на странице или PDF) — сетка 7 дней × приёмы пищи (mic dejun · gustare · prânz · gustare · cină) с идеями блюд.

---

## 6. Контент-правило (важно)

Меню = **идеи блюд**, БЕЗ точных граммовок, калорий и предписанных порций. Это:
- безопаснее (порции индивидуальны, особенно у детей),
- не залезает на территорию персонального плана (= платная услуга).
  Точные количества — только в консультации.

---

## 7. Техническая заметка для реализации

- Меню = CMS-сущности, управляются в back-office.
- Формат: рендер на странице (сетка 7×приёмы) и/или печатный PDF. ⚠ выбрать.
- Free vs gated — как у гайдов; рекомендую free. Гейт = согласие + хранение данных (закон РМ).
- Фильтр по возрасту обязателен; пустое состояние; адаптив; печатная версия.
- Грудничковый сегмент ведёт на консультацию, а не на generic-файл.

---

## 8. SEO (RO)

```
Meta title:       Meniuri săptămânale pentru copii și familie
Meta description: Idei de meniuri echilibrate pentru o săptămână, pe
                  grupe de vârstă, pregătite de un medic pediatru cu
                  specializare în nutriție.
Ключевые фразы:   meniu săptămânal copii · idei meniu copil ·
                  meniu echilibrat familie · alimentația copilului
```

---

## 9. Поля контента для CMS / back-office (RO/EN/RU)

```
page_menus:
  hero_title / hero_subhead
  age_segments[]          # группы выбора
  empty_state_text
  how_to_use_text
  personalized_cta
  safety_text
  author_blurb
  conversion_cta

menu:                     # сущность, повторяется
  slug
  title_ro/en  description_ro/en
  age_segment             # copii mici / copii / familie
  cover_image
  week_structure?         # 7 дней × приёмы (если рендер на странице)
  file_ro / file_en       # PDF (если скачивание)
  is_gated (bool)
  featured (bool) / order
  published_at
```

---

## 10. Что подтвердить перед публикацией

1. Общие меню или привязка к платной услуге — где граница.
2. Сегменты по возрасту (какие группы).
3. Грудничковые меню: generic или только через консультацию (рекомендую второе).
4. Free или email-гейт.
5. Формат: на странице, PDF, или оба.
6. Есть ли готовые меню или старт с пустым состоянием; языки.
```