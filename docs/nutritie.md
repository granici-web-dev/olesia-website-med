# Структура страницы «Nutriție» (apps/web · /ro/nutrition)

> Посадочная страница одной услуги (Nutrition consultation · 60 мин · видео), не обзор.
> Пояснения — по-русски. Текст для страницы — на **румынском** (основной локаль). Локализуется в `en` и `ru`.
> Конвертит в тот же Calendly `event_type`, что услуга `nutrition-consultation`.
> Две аудитории: **дети** (кормление, прикорм, трудности) и **взрослые** (персональный план).
> Козырь врача: педиатр + магистр по питанию человека (USMF) + спец. подготовка по детскому кормлению.

---

## 0. Контекст и допущения

- Localhost не открывал — сверь тон/блоки сам.
- **`⚠ уточнить`** — предположения (аудитория/возраст, формат плана, граница по РПП, перенос, цена).
- Копирайт на RO. Скажи — выдам EN и RU.

---

## 1. Кому адресована страница (гипотезы → проверить)

Рамка `user-research` / JTBD. Гипотезы, обоснованные профилем врача, не данные исследования.

| Сегмент | JTBD | Зацепка из CV |
|---|---|---|
| Родитель малыша, проблемы кормления | «Ребёнок не ест / отказывается — что делать» | серты по трудностям кормления, bottle aversion |
| Родитель на этапе прикорма | «Как правильно вводить прикорм» | детское питание, диверсификация |
| Родитель мофтуна | «Ребёнок мало и выборочно ест» | питание + педиатрия |
| Взрослый за планом питания | «Хочу персональный план на доказательной базе» | магистр по питанию человека |
| Взрослый по весу/привычкам | «Наладить здоровое питание» | нутрициология |

**Вывод:** секцию «с чем поможем» делим на два понятных блока — *для детей* и *для взрослых*. Ведём с детского (он сильнее подкреплён), но взрослых обслуживаем явно.

---

## 2. Структура страницы сверху вниз

```
1. Hero               — H1 + подзаголовок (дети+взрослые) + бейдж + CTA + строка доверия
2. С чем поможем       — два блока: Pentru copii / Pentru adulți (ядро + SEO)
3. Как проходит        — 4 шага консультации
4. О враче (доверие)   — рамка «педиатр + нутрициолог» + ссылка на профиль
5. Для кого            — дети (вкл. грудничков) + взрослые ⚠
6. Чего НЕ заменяет     — безопасность, граница по РПП и диагнозам
7. FAQ                 — подготовка (пищевой дневник), язык, оплата, план, перенос
8. CTA финал + кросс-ссылки
```

---

## 3. Текст страницы (RO, готов к публикации)

### 1. Hero
```
Eyebrow:    Nutriție
H1:         Consultații de nutriție online
Subhead:    Un plan alimentar personalizat și bazat pe dovezi —
            pentru copii și adulți.
Badge:      Apel video · 60 min
CTA primar: Programează o consultație
Trust line: Medic pediatru cu master în nutriție umană (USMF) —
            o combinație rară de expertiză
```

### 2. С чем поможем (ядро, два блока)
```
Heading: Cu ce te poate ajuta o consultație de nutriție

Pentru copii:
• Dificultăți de hrănire și refuzul mâncării
• Refuzul alimentației, inclusiv refuzul biberonului
• Introducerea diversificării (trecerea la alimente solide)
• Copilul mofturos la mâncare
• Alimentația pentru o creștere sănătoasă

Pentru adulți:
• Plan alimentar personalizat
• Greutate și obiceiuri alimentare sănătoase
• Alimentație echilibrată, bazată pe dovezi
```
> Детский блок подкреплён реальными сертификатами врача — это её самая сильная зона. Не добавляй темы вне её компетенций.

### 3. Как проходит
```
Heading: Cum decurge consultația

1. Programezi o oră și completezi un scurt formular despre alimentația
   actuală.
2. Te conectezi la apelul video de 60 de minute.
3. Analizăm împreună obiceiurile alimentare și dificultățile întâmpinate.
4. Primești un plan personalizat și recomandări scrise.
```

### 4. О враче
```
Heading: Despre medic

Dr. Olesea Jalba este medic pediatru cu master în Sănătate Publică –
Nutriție Umană (USMF „Nicolae Testemițanu"), cu pregătire dedicată în
alimentația copilului și dificultățile de hrănire.

Această combinație — medic pediatru și specialist în nutriție — îți
oferă o evaluare care ține cont atât de sănătate, cât și de alimentație.

→ Vezi profilul complet
```

### 5. Для кого
```
Heading: Pentru cine
Copii (inclusiv sugari) și adulți.        ⚠ подтвердить аудиторию
```

### 6. Чего не заменяет (безопасность)
```
Heading: Ce nu poate înlocui consultația online

Consultația de nutriție nu este pentru urgențe medicale și nu înlocuiește
tratamentul unei afecțiuni diagnosticate.

Pentru tulburări de alimentație diagnosticate sau afecțiuni care necesită
îngrijire specializată, îți vom recomanda sprijinul potrivit.
```

### 7. FAQ
```
• Cum mă pregătesc?  → Notează timp de câteva zile ce mănâncă copilul
  (sau tu) — un mic jurnal alimentar — și adu rezultatele analizelor
  recente, dacă există.
• În ce limbi pot discuta?  → Română, Rusă, Engleză.
• Primesc un plan scris?  → Da, după consultație primești un plan
  personalizat și recomandări scrise.
• Cum se face plata?  → Prin transfer bancar (deocamdată fără plată online).
• Pot reprograma sau anula?                    ⚠ политика переноса
```

### 8. CTA финал + кросс-ссылки
```
Heading:    Programează o consultație de nutriție
CTA primar: Programează o oră (60 min, video)
Helper:     Ai o singură întrebare? → Întreabă medicul (răspuns în 48h)

Cross-link:
• Probleme de sănătate ale copilului? → Consultație pediatrică
• Caz complex sau monitorizare pe termen lung? → Consultație integrativă
```

---

## 4. SEO (RO)

```
Meta title:       Consultații de nutriție online | Dr. Olesea Jalba
Meta description: Consultație de nutriție video pentru copii și adulți:
                  dificultăți de hrănire, diversificare, plan alimentar
                  personalizat. Programează online.   (~150 знаков)
Ключевые фразы:   nutriționist online · consultație nutriție online ·
                  nutriție copii · dificultăți de hrănire ·
                  nutriționist Chișinău/Moldova
H1:               один, как в Hero. Заголовки секций — h2.
```

---

## 5. Поля контента для CMS / back-office (RO/EN/RU)

Тот же компонент-шаблон, что у Pediatrie (различается только контент):

```
page_nutrition:
  hero_title / hero_subhead / hero_badge / hero_trust
  help_children[]         # блок «для детей»
  help_adults[]           # блок «для взрослых»
  steps[]                 # 4 шага
  doctor_blurb
  audience
  limits_text
  faq[]                   # {question, answer}
  cta_label / cta_target  # = Calendly URI услуги nutrition-consultation
  seo_title / seo_description
```

---

## 6. Что подтвердить перед публикацией

1. Аудитория: дети + взрослые, или ограничиваем (напр. только дети)?
2. Формат плана питания (документ, длительность применимости).
3. Граница по РПП / диагнозам — как формулируем и куда направляем.
4. Пищевой дневник — обязателен ли как подготовка.
5. Политика отмены/переноса.
6. Цена (берётся со страницы услуг).
```