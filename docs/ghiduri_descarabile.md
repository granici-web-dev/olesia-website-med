# Структура страницы «Ghiduri descărcabile» (apps/web · /ro)

> **Контентный хаб** скачиваемых гайдов. Верх воронки: доверие + SEO → мягкий переход в услуги.
> CMS-управляемая (гайды добавляются из back-office). Тип страницы отличается от посадочных и утилитарных.
> Пояснения — по-русски. Текст — на **румынском** (основной локаль). Локализуется в `en`/`ru`.

---

## 0. Контекст и допущения

- Ссылка дана как `/ro/articles`, заголовок — «Ghiduri descărcabile». ⚠ Уточнить: это библиотека гайдов или более широкий раздел статей/блог? Я делаю как **библиотеку гайдов**; роут стоит назвать `/ro/ghiduri`, если это только гайды.
- Localhost не открывал — сверь сам.
- **`⚠ уточнить`**: бесплатно/гейт, есть ли уже гайды или запуск пустым, языки файлов, рассылка, бэклог тем.
- Копирайт на RO. Скажи — выдам EN/RU.

---

## 1. Зачем сюда приходят (гипотезы → проверить)

Рамка `user-research` / JTBD. Гипотезы, не данные исследования.

| Сегмент                 | JTBD                                                     |
| ----------------------- | -------------------------------------------------------- |
| Родитель ищет ответы    | «Разобраться в теме сам, бесплатно и быстро»             |
| Перед записью           | «Почитаю её материалы — пойму, можно ли доверять»        |
| Не готов платить сейчас | «Возьму бесплатный гайд, вернусь под консультацию позже» |
| Тревожный родитель      | «Нужна надёжная информация, не форумы»                   |

**Вывод:** задача страницы — лёгкий доступ к гайдам, подтверждение авторитета и мягкий переход в услуги. Не продажа, а доверие.

---

## 2. Центральное решение: бесплатно или с email-гейтом

|                   | Бесплатно  | С email-гейтом                       |
| ----------------- | ---------- | ------------------------------------ |
| Трение            | нет        | есть (форма)                         |
| Охват / SEO       | максимум   | ниже                                 |
| База для рассылки | нет        | да                                   |
| Данные/комплаенс  | просто     | согласие + хранение лидов (закон РМ) |
| Доставка          | отдать PDF | механизм отправки на email           |

**Рекомендация:** стартовать **бесплатно** (меньше трения, быстрее доверие, ноль оверхеда по данным). Гейт добавить позже, если появится email-маркетинг. ⚠ решение за тобой — структура поддерживает оба.

---

## 3. Структура страницы сверху вниз

```
1. Hero               — H1 + подзаголовок (бесплатно?) + featured-гайд
2. Сетка гайдов        — карточки (или пустое состояние)
3. Фильтр по темам     — если гайдов много (иначе скрыть)
4. Как работает        — что получаешь (free/gated)
5. Кто пишет           — короткий блок доверия → Despre
6. Дисклеймер          — информативно, не заменяет консультацию
7. CTA конверсии        — нужен личный совет? → услуги / вопрос
8. (опц.) Рассылка      — только если есть email-программа
```

---

## 4. Текст страницы (RO)

### 1. Hero

```
Eyebrow:  Ghiduri
H1:       Ghiduri descărcabile
Subhead:  Materiale practice despre sănătatea și alimentația copilului,
          scrise de un medic pediatru. Descarcă-le gratuit.    ⚠ gratuit?
```

### 2. Сетка гайдов / пустое состояние

```
Heading: Alege un ghid
[карточки — см. анатомию ниже]
```

**Пустое состояние (если гайдов ещё нет):**

```
Heading: Ghidurile vin în curând
Lucrăm la primele ghiduri. Între timp, dacă ai o întrebare, o poți
adresa direct medicului.
CTA: Întreabă medicul
```

> Заложить обязательно — вероятен запуск без гайдов.

### 4. Как работает

```
Heading: Cum funcționează
Alegi ghidul, apeși „Descarcă" și primești fișierul PDF.
Fără cont, fără cost.                                   ⚠ если free/без регистрации
```

_(вариант с гейтом: «Lasă-ți adresa de email și îți trimitem ghidul.»)_

### 5. Кто пишет

```
Heading: Cine scrie ghidurile
Ghidurile sunt realizate de Dr. Olesea Jalba, medic pediatru cu master
în nutriție umană.
→ Despre medic
```

### 6. Дисклеймер

```
Ghidurile au scop informativ și nu înlocuiesc o consultație medicală.
Pentru situația specifică a copilului tău, programează o consultație.
```

### 7. CTA конверсии

```
Heading: Ai nevoie de un sfat personalizat?
• Pentru o întrebare punctuală → Întreabă medicul (răspuns în 48h)
• Pentru o evaluare → Vezi consultațiile
```

### 8. (опционально) Рассылка

```
Heading: Primește ghiduri noi pe email
[email] [ ] Sunt de acord cu prelucrarea datelor
CTA: Abonează-te                                       ⚠ только при наличии рассылки
```

---

## 5. Анатомия карточки гайда (переиспользуемый компонент)

```
[ Cover / thumbnail ]
Topic tag                 ← Nutriție / Sănătate / Dezvoltare / Alergii
Title
Short description         ← одна строка
PDF · [X] pagini · RO     ← формат + объём + язык
[ Descarcă ghidul ]       ← или «Primește ghidul» при гейте
```

---

## 6. Бэклог тем (предложение, на базе CV — НЕ существующие гайды)

Темы, подкреплённые её экспертизой:

```
• Diversificarea alimentației — primii pași           (нутрициология младенцев)
• Copilul mofturos: dificultăți de hrănire             (программа 2026)
• Copilul care se îmbolnăvește des                     (серты по frecvent bolnav)
• Constipația și diareea la copii                      (статья + диплом по ЖКТ)
• Alergiile la copii: ce trebuie să știi               (статья по аллергии)
• Dezvoltarea copilului pe etape                       (серт UNICEF)
```

> Это приоритезированный бэклог, а не утверждение, что гайды готовы. ⚠ согласуй темы.

---

## 7. Техническая заметка для реализации

- Гайды = CMS-сущности, управляются в back-office; PDF-файлы в файловом хранилище, по одному на локаль.
- **Free:** просто отдать PDF по ссылке. Опционально — счётчик скачиваний.
- **Gated:** email + согласие → доставка файла → запись лида. Это персональные данные: согласие, цель, хранение по закону РМ. ⚠ не включать гейт без этого.
- Сетка + фильтр по темам; пустое состояние; адаптив.
- На перспективу: каждый гайд может стать отдельной индексируемой страницей (сильный SEO).

---

## 8. SEO (RO)

```
Meta title:       Ghiduri descărcabile despre sănătatea și nutriția copilului
Meta description: Ghiduri practice gratuite scrise de un medic pediatru:
                  alimentație, dificultăți de hrănire, copilul frecvent
                  bolnav și altele.
Ключевые фразы:   ghid alimentația copilului · diversificare ·
                  copil frecvent bolnav · sfaturi pediatru
```

> Самый SEO-ценный тип страницы — темы совпадают с родительскими поисковыми запросами.

---

## 9. Поля контента для CMS / back-office (RO/EN/RU)

```
page_guides:
  hero_title / hero_subhead
  empty_state_text
  how_it_works_text
  author_blurb
  disclaimer_text
  conversion_cta
  newsletter_block?       # опционально

guide:                    # сущность, повторяется
  slug
  title_ro/en  description_ro/en
  cover_image
  topic
  file_ro / file_en       # PDF по локали
  is_gated (bool)
  featured (bool) / order
  published_at
```

---

## 10. Что подтвердить перед публикацией

1. **Бесплатно или с email-гейтом** (главное решение).
2. Это библиотека гайдов или широкий раздел статей? Роут: `/ro/articles` vs `/ro/ghiduri`.
3. Есть ли готовые гайды, или запуск с пустым состоянием.
4. Бэклог тем и приоритет.
5. Языки файлов: только RO или RO+RU+EN.
6. Нужна ли email-рассылка (и инфраструктура под неё).

```

```
