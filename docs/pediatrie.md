# Структура страницы «Pediatrie» (apps/web · /ro/pediatrics)

> Это **посадочная страница одной услуги** (Pediatric consultation · 50 мин · видео), не обзор.
> Пояснения — по-русски. Готовый текст для страницы — на **румынском** (основной локаль). Локализуется в `en` и `ru`.
> Конвертит в тот же Calendly `event_type`, что услуга `pediatric-consultation`.
> Врач: Olesea Jalba — педиатр + магистр по питанию, спец. фокус: ЖКТ у детей, часто болеющий ребёнок, аллергология, питание.

---

## 0. Контекст и допущения

- Localhost не открывал — сверь тон/блоки с реальной страницей сам.
- **`⚠ уточнить`** — предположения (возраст пациентов, рецепты, политика переноса, стаж). Подтверди до публикации.
- Копирайт на RO. Скажи — выдам EN и RU.

---

## 1. Кому адресована страница (гипотезы → проверить)

Рамка `user-research` / JTBD. Это **гипотезы**, обоснованные профилем врача, а не данные исследования.

| Сегмент | JTBD | Зацепка из CV |
|---|---|---|
| Заболел ребёнок прямо сейчас | «Понять, что это и что делать, без очереди» | педиатрия, неотложные навыки |
| Проблемы с животом/стулом | «Разобраться с ЖКТ» | диплом по ВЗК, статьи про диарею/запор |
| Часто болеющий ребёнок | «Почему постоянно болеет» | свежие серты «copilul frecvent bolnav» 2022–2026 |
| Аллергия / высыпания | «Разобраться с реакциями» | статья про аллергический ринит |
| Рост и развитие | «Нормально ли развивается» | серт. UNICEF по мониторингу развития |
| Второе мнение | «Перепроверить диагноз/лечение» | широкий клинический бэкграунд |

**Вывод:** ядро страницы — секция «с чем поможем», построенная на реальных сильных сторонах врача. Это даёт и доверие, и SEO.

---

## 2. Структура страницы сверху вниз

```
1. Hero               — H1 + подзаголовок + бейдж формата + CTA + строка доверия
2. С чем поможем       — поводы обратиться (ядро + SEO)
3. Как проходит        — 4 шага консультации
4. О враче (доверие)   — кратко из CV + фокус-области + ссылка на профиль
5. Для какого возраста — диапазон ⚠
6. Чего НЕ заменяет     — лимиты + безопасность (не для экстренных)
7. FAQ                 — рецепты, язык, присутствие ребёнка, оплата, перенос
8. CTA финал + кросс-ссылки на другие услуги
```

---

## 3. Текст страницы (RO, готов к публикации)

### 1. Hero
```
Eyebrow:    Pediatrie
H1:         Consultații pediatrice online
Subhead:    Discută cu un medic pediatru despre sănătatea copilului tău —
            din confortul casei tale, fără sală de așteptare.
Badge:      Apel video · 50 min
CTA primar: Programează o consultație
Trust line: Medic pediatru · experiență în spital și ambulatoriu ·   ⚠ стаж уточнить
            membru al Societății de Pediatrie
```

### 2. С чем поможем (ядро)
```
Heading: Cu ce te poate ajuta o consultație pediatrică

• Simptome acute — febră, tuse, dureri, erupții: ce să faci și când
  să te îngrijorezi.
• Probleme digestive — dureri abdominale, colici, constipație, diaree.
• Copilul care se îmbolnăvește des — infecții respiratorii repetate.
• Alergii — erupții, rinită alergică, reacții alimentare.
• Creștere și dezvoltare — evaluarea progresului copilului.
• Alimentație și apetit — dificultăți de hrănire, refuzul mâncării.
• A doua opinie — verificarea unui diagnostic sau a unui tratament.
```
> Это не случайный список — каждый пункт подкреплён квалификацией врача (ЖКТ, часто болеющий ребёнок, аллергология, развитие, питание). Не добавляй сюда то, чего нет в её компетенциях.

### 3. Как проходит
```
Heading: Cum decurge consultația

1. Alegi o oră potrivită și completezi un scurt formular despre copil.
2. Te conectezi la apelul video de 50 de minute.
3. Discutăm împreună simptomele, istoricul și documentele pregătite.
4. Primești o evaluare clară și un rezumat scris cu recomandări.
```

### 4. О враче
```
Heading: Despre medic

Dr. Olesea Jalba este medic pediatru, cu pregătire suplimentară în
nutriția copilului și gastroenterologie pediatrică. A lucrat în spital
și în ambulatoriu și participă constant la conferințe și cursuri de
specialitate.

Domenii de focus:
nutriție și dificultăți de hrănire · probleme digestive ·
copilul frecvent bolnav · alergologie

→ Vezi profilul complet
```

### 5. Для какого возраста
```
Heading: Pentru ce vârste
De la nou-născuți până la adolescenți.        ⚠ подтвердить диапазон
```

### 6. Чего не заменяет (безопасность)
```
Heading: Ce nu poate înlocui consultația online

Consultația video nu este destinată urgențelor medicale. Dacă starea
copilului este gravă sau se agravează rapid, sună la 112 sau mergi la
cel mai apropiat serviciu de urgență.

Unele situații pot necesita o examinare fizică sau investigații
suplimentare — în acest caz îți vom spune clar și te vom îndruma.
```

### 7. FAQ
```
• Pot primi o rețetă în urma consultației?     ⚠ зависит от регуляторики РМ
• În ce limbi pot discuta cu medicul?  → Română, Rusă, Engleză.
• Trebuie să fie copilul prezent la apel?      ⚠ уточнить (рекоменд. да)
• Cum se face plata?  → Prin transfer bancar (deocamdată fără plată online).
• Pot reprograma sau anula?                    ⚠ политика переноса
• Ce documente să pregătesc?  → Analize recente, rezultate anterioare,
  lista medicamentelor administrate.
```

### 8. CTA финал + кросс-ссылки
```
Heading:    Programează o consultație pediatrică
CTA primar: Programează o oră (50 min, video)
Helper:     Ai o singură întrebare? → Întreabă medicul (răspuns în 48h)

Cross-link:
• Probleme de alimentație? → Consultație de nutriție
• Caz complex sau ai nevoie de monitorizare? → Consultație integrativă
```

---

## 4. SEO (RO)

```
Meta title:       Consultații pediatrice online | Dr. Olesea Jalba
Meta description: Consultație pediatrică video cu un medic pediatru:
                  simptome, digestie, copilul frecvent bolnav, alergii,
                  creștere. Programează online.   (~150 знаков)
Ключевые фразы:   medic pediatru online · consultație pediatrică online ·
                  pediatru online Chișinău/Moldova · consult pediatru video
H1:               один, как в Hero. Заголовки секций — h2.
```

---

## 5. Поля контента для CMS / back-office (RO/EN/RU)

Под модель `*_ro/*_en/*_ru`. Переиспользуй компоненты со страницы услуг:

```
page_pediatrics:
  hero_title / hero_subhead / hero_badge / hero_trust
  help_items[]            # массив: {icon?, label, text}
  steps[]                 # массив из 4 шагов
  doctor_blurb / doctor_focus[]
  age_range
  limits_text
  faq[]                   # {question, answer}
  cta_label / cta_target  # = Calendly URI услуги pediatric-consultation
  seo_title / seo_description
```

---

## 6. Что подтвердить перед публикацией

1. Возрастной диапазон пациентов (нов. → подростки?).
2. Выдаются ли рецепты при онлайн-консультации (регуляторика РМ).
3. Должен ли ребёнок присутствовать на звонке.
4. Точный стаж/формулировка строки доверия в Hero.
5. Политика отмены/переноса.
6. Цена (берётся со страницы услуг).
```