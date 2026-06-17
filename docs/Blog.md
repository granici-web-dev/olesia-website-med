# Структура страницы «Blog» (apps/web · /ro)

> **SEO-движок сайта.** Тот же контент-раздел, что Ghiduri/Meniuri. Верх воронки: органический трафик → доверие → мягкая конверсия.
> Две страницы: **листинг** + **детальная статья** (реальная индексируемая единица — статья).
> CMS-управляемая, билингва. Пояснения — по-русски. Текст — на **румынском**. Локализуется в `en`/`ru`.

---

## 0. Контекст и допущения

- Раздел контента (`/ro/articles`) объединяет Ghiduri, Meniuri и Blog. ⚠ уточнить роуты (`/ro/blog` или `/ro/articles/blog`).
- Localhost не открывал — сверь сам.
- **`⚠ уточнить`**: категории, кадэнс/автор, готовые посты или старт пустым, языки поста, комментарии, рассылка, источники/медревизия.
- Копирайт на RO. Скажи — выдам EN/RU.

---

## 1. Зачем сюда приходят (гипотезы → проверить)

| Сегмент | JTBD |
|---|---|
| Загуглил конкретную тему | «Хочу надёжную статью, не форумы» |
| Изучает перед записью | «Почитаю её статьи — оценю экспертизу» |
| Регулярный читатель | «Полезный источник по детскому здоровью/питанию» |
| Не готов платить | «Возьму бесплатную пользу, вернусь под консультацию» |

**Вывод:** задача блога — приводить органический трафик и подтверждать экспертизу, затем мягко конвертировать в услуги. Это работает только при качественном SEO и доверии к автору.

---

## 2. Ключевое для медицинского блога: E-E-A-T / YMYL

Контент о здоровье ребёнка = YMYL («Your Money or Your Life»). Google ранжирует его строже — по экспертности, точности, свежести. Поэтому на странице статьи обязательны:
- **Подпись автора с регалиями** (Dr. Olesea Jalba, medic pediatru) + ссылка на Despre
- **Даты** публикации и обновления
- **Источники / референсы** где уместно
- **Дисклеймер** (информативно, не заменяет консультацию)

Это влияет и на доверие родителя, и на позиции в поиске. Не косметика.

---

## 3. Структура — ЛИСТИНГ (страница /blog)

```
1. Hero               — H1 + подзаголовок (+ поиск опц.)
2. Featured / последний пост
3. Категории           — фильтр (= SEO-кластеры)
4. Сетка постов         — карточки
5. Пагинация / load more
6. (опц.) Рассылка
7. CTA конверсии        — нужен личный совет? → услуги
```

### Текст листинга (RO)
```
Eyebrow:  Blog
H1:       Blog
Subhead:  Articole despre sănătatea și alimentația copilului, scrise de
          un medic pediatru. Informații în care poți avea încredere.

Heading категорий: Categorii
• Nutriție · Sănătatea copilului · Alimentația sugarului ·
  Copilul frecvent bolnav · Dezvoltare · Alergii         ⚠ согласовать

CTA конверсии:
Heading: Ai nevoie de un sfat personalizat?
• O întrebare punctuală → Întreabă medicul (răspuns în 48h)
• O evaluare → Vezi consultațiile
```

**Пустое состояние (вероятный старт):**
```
Heading: Primele articole vin în curând
Lucrăm la primele articole. Între timp, dacă ai o întrebare, o poți
adresa direct medicului.
CTA: Întreabă medicul
```

### Карточка поста (компонент)
```
[ Cover ]
Categorie tag
Title
Excerpt                   ← 1–2 строки
[Data] · [X min de citit]
(вся карточка — ссылка на статью)
```

---

## 4. Структура — СТАТЬЯ (страница /blog/[slug]) — индексируемая единица

```
1. Хедер     — категория, H1, подпись автора, даты, время чтения, cover
2. Тело      — текст (заголовки h2/h3, изображения, списки)
3. Дисклеймер — информативно, не заменяет консультацию
4. Источники  — референсы (опц., но для медконтента ценно)
5. Об авторе  — мини-био + ссылка на Despre (E-E-A-T)
6. Похожие статьи
7. Полезные гайды/меню — кросс-ссылки на скачиваемые ресурсы
8. CTA       — вопрос по теме → Întreabă medicul / консультация
9. (опц.) Кнопки шеринга
```

### Текст статьи (RO, шаблон)
```
Хедер:
[Categorie]
H1: [Titlul articolului]
De Dr. Olesea Jalba, medic pediatru · Publicat [data] · [X min de citit]
[Cover]

Дисклеймер (в конце тела):
Acest articol are scop informativ și nu înlocuiește o consultație
medicală. Pentru situația specifică a copilului tău, programează o
consultație.

Об авторе:
Despre autor
Dr. Olesea Jalba, medic pediatru cu master în nutriție umană.
→ Vezi profilul complet

Похожие / кросс-ссылки:
Articole similare:   [3 поста]
Ghiduri utile:       [связанные гайды → download]

CTA:
Ai o întrebare despre acest subiect? → Întreabă medicul (răspuns în 48h)
```

---

## 5. SEO и разметка (важно для блога)

```
Каждый пост = отдельный индексируемый URL.
• Meta title / description per пост
• Structured data: Article / MedicalWebPage + author markup
• Breadcrumbs, canonical, hreflang (ro/en/ru)
• Reading time, дата обновления (свежесть)
```
> Категории — это и навигация, и SEO-кластеры. Имена категорий = реальные поисковые темы родителей.

---

## 6. Техническая заметка для реализации

- CMS-управляемый: листинг + детальная страница + страницы категорий.
- Пагинация / load more; фильтр по категории; (опц.) поиск.
- Логика «похожих статей» (по категории/тегам); reading-time расчёт.
- Пустое состояние; адаптив; доступные заголовки и изображения с alt.
- **Комментарии:** рекомендую отключить — модерация медицинских обсуждений = нагрузка и риск. ⚠
- Schema-разметка статьи и автора.

---

## 7. Поля контента для CMS / back-office (RO/EN/RU)

```
page_blog:
  hero_title / hero_subhead
  empty_state_text
  conversion_cta
  newsletter_block?

post:                      # сущность, повторяется
  slug
  title_ro/en  excerpt_ro/en  body_ro/en
  cover_image
  category / tags[]
  author                   # Dr. Olesea Jalba
  published_at / updated_at
  reading_time             # расчётно
  sources[]?               # референсы
  related_posts[]?
  related_guides[]?        # кросс на Ghiduri/Meniuri
  seo_title / seo_description
```

---

## 8. Что подтвердить перед публикацией

1. Роуты раздела: `/ro/blog` vs `/ro/articles/blog`; единый хаб с Ghiduri/Meniuri.
2. Список категорий.
3. Кадэнс публикаций и кто пишет.
4. Готовые посты или старт с пустым состоянием.
5. Языки поста: RO только или RO+RU+EN.
6. Комментарии: off (рекомендую) / on.
7. Источники/процесс медицинской выверки контента.
```