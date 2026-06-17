# Структура страницы «FAQ» (apps/web · /ro)

> **Точка консолидации.** Сводит воедино кросс-сайтовые вопросы и закрывает большую часть накопленных `⚠`.
> CMS-управляемая. Пояснения — по-русски. Текст — на **румынском** (основной локаль). Локализуется в `en`/`ru`.

---

## 0. Контекст и допущения

- Localhost не открывал — сверь сам.
- **`⚠ заполнить`** = ответ зависит от твоих решений (цены, отмена, рецепты, 48ч, аудитория, приватность). Дан черновик-шаблон.
- ✓ = можно публиковать как есть.
- Копирайт на RO. Скажи — выдам EN/RU.

---

## 1. Зачем сюда приходят (гипотезы → проверить)

| Сегмент | JTBD |
|---|---|
| Перед записью, есть сомнения | «Сниму вопросы, прежде чем платить» |
| Не понимает онлайн-формат | «Как это вообще проходит» |
| Сравнивает услуги | «Какую выбрать / в чём разница» |
| Беспокоится об оплате/данных | «Как платить, безопасно ли» |

**Вывод:** задача FAQ — снять трение и возражения до конверсии, разгрузить поддержку и правильно маршрутизировать (112, Quick question).

---

## 2. Два ключевых решения по этой странице

**A. Единый источник правды.** Контекстные FAQ на посадочных + общий FAQ не должны расходиться.
Рекомендация: FAQ-запись = CMS-сущность `{question, answer, category, service_tags}`. Посадочные подтягивают свои по тегу; общая страница показывает все по категориям. Одна правка — везде.

**B. Эта страница консолидирует открытые вопросы сайта.** Почти каждый `⚠` из других структур — это ответ FAQ. Заполнение FAQ ≈ закрытие открытых решений всего проекта.

---

## 3. Структура страницы

```
1. Hero               — H1 + подзаголовок (+ поиск опц.)
2. Навигация по категориям — якоря/табы
3. Аккордеон по категориям (6 групп ниже)
4. «Остался вопрос?» → Contact / Întreabă medicul
5. CTA — Vezi serviciile
```

---

## 4. Текст страницы (RO)

### Hero
```
Eyebrow:  Întrebări frecvente
H1:       Întrebări frecvente
Subhead:  Răspunsuri la cele mai des întâlnite întrebări despre
          consultații, programare, plată și servicii.
```

### Категория 1 — Consultații online
```
• Cum decurge o consultație online?
  → Consultația are loc prin apel video, la ora programată.    ⚠ инструмент/детали
• De ce am nevoie pentru consultație?
  → Un dispozitiv cu cameră, conexiune la internet și un loc
    liniștit. Pregătește analizele și documentele relevante.   ✓
• În ce limbi pot avea consultația?
  → În română, rusă și engleză.                                ✓
• Trebuie să fie copilul prezent la consultație?
  → [Recomandat da]                                            ⚠ заполнить
• Ce nu poate înlocui o consultație online?
  → Consultația online nu este pentru urgențe. Unele situații
    pot necesita examinare fizică — îți vom spune clar.        ✓
```

### Категория 2 — Programare, anulare, reprogramare
```
• Cum programez o consultație?
  → Alegi serviciul din „Servicii" și selectezi o oră liberă.  ✓
• Pot anula sau reprograma?
  → [политика отмены/переноса]                                 ⚠ заполнить
• Ce se întâmplă dacă întârzii la consultație?
  → [правило опоздания]                                        ⚠ заполнить
```

### Категория 3 — Plată
```
• Cum se face plata?
  → Prin transfer bancar (deocamdată fără plată online).       ✓
• Când achit consultația?
  → [до консультации?]                                         ⚠ заполнить
• Primesc o factură / confirmare?
  → [да/нет, формат]                                           ⚠ заполнить
• Există posibilitatea de rambursare?
  → [условия возврата]                                         ⚠ заполнить
```

### Категория 4 — Servicii
```
• Care este diferența dintre consultații?
  → Pediatrică (sănătate, 50 min) · Nutriție (alimentație,
    60 min) · Integrativă (situații complexe + monitorizare,
    90 min).                                                   ✓
• Cum aleg serviciul potrivit?
  → Vezi ghidul scurt din pagina „Servicii".                  ✓
• Primesc o rețetă în urma consultației?
  → [зависит от регуляторики РМ]                               ⚠ заполнить
• Pentru ce vârste sunt consultațiile?
  → [диапазон]                                                 ⚠ заполнить
• Consultațiile sunt și pentru adulți?
  → [нутриция — да; уточнить остальное]                        ⚠ заполнить
```

### Категория 5 — Servicii prin portal
```
• Cum funcționează „Întreabă medicul"?
  → Scrii întrebarea, achiți prin transfer și primești un
    răspuns scris în 48 de ore.                                ✓
• „48 de ore" înseamnă zile lucrătoare?
  → [рабочих/календарных]                                      ⚠ заполнить
• Ce include „Monitorizare 3 luni"?
  → [состав программы]                                         ⚠ заполнить
• Trebuie o consultație înainte de a intra în program?
  → [prerequisite да/нет]                                      ⚠ заполнить
```

### Категория 6 — Confidențialitate și urgențe
```
• Datele mele sunt în siguranță?
  → [политика обработки + ссылка на Politica de confidențialitate] ⚠ заполнить
• Este o urgență medicală — ce fac?
  → Sună la 112 sau mergi la cel mai apropiat serviciu de
    urgență. Nu folosi platforma pentru urgențe.              ✓
• Pot atașa poze sau analize la „Întreabă medicul"?
  → [разрешены ли вложения + безопасность]                     ⚠ заполнить
```

### «Остался вопрос?»
```
Heading: Nu ai găsit răspunsul?
• Pentru o întrebare generală → Contact
• Pentru o întrebare medicală → Întreabă medicul (răspuns în 48h)
```

---

## 5. SEO и разметка

```
• FAQPage structured data (JSON-LD) → rich-сниппеты в выдаче
• Meta title / description
• Якоря на категории (deep links)
```
```
Meta title:       Întrebări frecvente | Dr. Olesea Jalba
Meta description: Răspunsuri despre consultațiile online, programare,
                  plată prin transfer și servicii — pediatrie și nutriție.
```

---

## 6. Техническая заметка для реализации

- FAQ-записи — CMS-сущности; посадочные подтягивают по `service_tags` (единый источник правды).
- Аккордеон: доступный (aria-expanded, клавиатура), якоря категорий, опц. поиск.
- FAQPage JSON-LD генерится из записей.
- Маршрутизация консистентна с Contact: ургенции → 112, медицинское → Quick question.

---

## 7. Поля контента для CMS / back-office (RO/EN/RU)

```
page_faq:
  hero_title / hero_subhead
  categories[]            # порядок и названия
  still_question_block
  seo_title / seo_description

faq_item:                 # сущность, повторяется; источник правды
  question_ro/en
  answer_ro/en
  category
  service_tags[]          # для подтяжки на посадочные
  order
```

---

## 8. Что подтвердить (= закрывает открытые вопросы всего сайта)

Заполнение этих ответов закрывает большинство `⚠` по проекту:
1. Отмена / перенос / опоздание.
2. Оплата: когда, фактура, возврат.
3. Рецепты (регуляторика РМ).
4. Возраст и аудитория по каждой услуге.
5. «48 часов» — рабочих/календарных.
6. Состав «Monitorizare 3 luni» + нужна ли стартовая консультация.
7. Приватность данных + наличие «Politica de confidențialitate».
8. Вложения в «Întreabă medicul» + их безопасное хранение.
9. Деталь онлайн-формата (инструмент видеозвонка).
```