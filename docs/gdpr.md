# Структура страницы «GDPR / Politica de confidențialitate» (apps/web · /ro)

> ⚠⚠ **ЭТО НЕ ГОТОВАЯ ПОЛИТИКА И НЕ ЮРИДИЧЕСКАЯ КОНСУЛЬТАЦИЯ.** ⚠⚠
> Это структура + бизнес-специфичный каркас. Финальный текст ОБЯЗАН проверить квалифицированный юрист по защите данных — особенно из-за данных о здоровье (особая категория) и данных детей.
> Пояснения — по-русски. Текст — на **румынском**. Локализуется в `en`/`ru`.

---

## 0. Правовая рамка (актуально, проверь у юриста)

- Сейчас действует **Legea nr. 133/2011** privind protecția datelor cu caracter personal.
- **Legea nr. 195/2024** (GDPR-совместимый) вступает в силу **23 августа 2026** — строить политику сразу под этот стандарт.
- Надзорный орган: **Centrul Național pentru Protecția Datelor cu Caracter Personal (CNPDCP)**.
- Если есть пользователи из ЕС (диаспора) — может применяться и **GDPR (Reg. 2016/679)**.
- Точные ссылки на статьи, основания и сроки хранения — за юристом.

---

## 1. Зачем сюда приходят (гипотезы → проверить)

| Сегмент | JTBD |
|---|---|
| Осторожный родитель | «Что вы делаете с данными моими и ребёнка?» |
| Перед загрузкой фото/анализов | «Безопасно ли отправлять медицинское?» |
| Хочет реализовать право | «Как удалить/получить мои данные» |
| Проверка доверия | «Серьёзно ли они относятся к данным» |

**UX-вывод:** юридический текст плохо читается. Поэтому — **двухслойно**: короткое резюме простым языком сверху + полные разделы ниже. Это и доверие, и реальная прозрачность.

---

## 2. Два узла, специфичных для этой практики

**A. Данные о здоровье = особая категория.** Симптомы, история, загруженные документы/фото, содержание консультаций, данные мониторинга. Требуют усиленного основания (явное согласие + оказание медуслуг). ⚠ юрист.

**B. Данные детей.** Большинство субъектов — дети; данные предоставляет родитель/законный представитель. Нужен отдельный раздел и особая осторожность. ⚠ юрист.

---

## 3. Структура страницы сверху вниз

```
1. Заголовок + дата обновления + кто оператор (контролёр) данных
2. Резюме простым языком (TL;DR)
3. Какие данные собираем
4. Зачем / правовое основание
5. Кому передаём / процессоры + трансграничные передачи
6. Сколько храним
7. Твои права + как реализовать
8. Данные детей
9. Безопасность
10. Cookies (ссылка на cookie-политику/баннер)
11. Изменения политики
12. Контакт по вопросам данных
```

---

## 4. Каркас текста (RO, ЧЕРНОВИК — требует юридической проверки)

### 1. Заголовок
```
H1: Politica de confidențialitate
Ultima actualizare: [data]
Operator de date: Dr. Olesea Jalba / [denumire juridică]      ⚠ юр. лицо/ИП
Contact pentru date: [email]                                   ⚠
```

### 2. Резюме простым языком (TL;DR)
```
Heading: Pe scurt
• Colectăm datele necesare pentru a-ți oferi consultații și a răspunde
  întrebărilor tale.
• Unele date sunt despre sănătate și despre copilul tău — le tratăm cu
  grijă deosebită.
• Nu vindem datele tale.
• Ai dreptul să le accesezi, corectezi sau ștergi.
• Pentru orice întrebare despre date: [contact].
```

### 3. Какие данные собираем (бизнес-инвентаризация — РЕАЛЬНО под твой сайт)
```
Heading: Ce date colectăm

• Date de identificare și contact — nume, email, telefon
  (la programare, prin formularul de contact, la „Întreabă medicul").
• Date despre sănătate (categorie specială) — simptome, istoric,
  documente sau poze încărcate, conținutul consultațiilor, date de
  monitorizare.                                                ⚠ особая категория
• Date despre copil — furnizate de părinte / reprezentant legal.  ⚠ дети
• Date de programare — gestionate prin Calendly.               ⚠ третья сторона
• Date de plată — suma, moneda, referința comenzii, starea plății și,
  de la bancă, ultimele cifre ale cardului + codurile tranzacției.
  Datele complete ale cardului NU ajung la noi (pagina securizată maib).
• Date tehnice — cookie-uri, adresă IP, statistici de utilizare. ⚠ если есть analytics
• Email — dacă te abonezi la ghiduri sau newsletter.           ⚠ если gated
```

### 4. Зачем / правовое основание
```
Heading: De ce prelucrăm datele și pe ce temei

• Pentru a presta serviciul (executarea contractului).
• Pentru date de sănătate — pe baza consimțământului explicit și a
  prestării de servicii de sănătate.                          ⚠ точное основание — юрист
• Pentru obligații legale — păstrarea documentației.          ⚠ юрист
• Pentru plăți — executarea contractului + obligație contabilă/fiscală
  de păstrare a documentelor de plată.                        ⚠ срок — юрист
• Pe baza consimțământului — pentru newsletter/ghiduri.
```

### 5. Кому передаём / процессоры
```
Heading: Cui transmitem datele

Lucrăm cu furnizori care ne ajută să oferim serviciul:
• Calendly — programări (poate implica transfer în afara Moldovei). ⚠ трансгранично
• Furnizor de găzduire — [hosting]                              ⚠
• Furnizor de email — [email]                                  ⚠
• Statistici — [analytics, dacă există]                        ⚠
• BC „MAIB" S.A. — plăți online cu cardul și prin MIA. Banca primește
  datele cardului direct, în calitate de operator propriu.     ⚠ не процессор!
• Banca — pentru plățile prin transfer bancar.

Nu vindem datele tale și nu le transmitem în scopuri de marketing
ale terților.
```
> Трансграничные передачи (Calendly = вне РМ/ЕС) — отдельный режим по 195/2024 и GDPR. ⚠ юрист.

### 6. Сколько храним
```
Heading: Cât timp păstrăm datele
Păstrăm datele doar atât cât este necesar [+ termenele legale pentru
documentația medicală].                                        ⚠ сроки — юрист
```

### 7. Права
```
Heading: Drepturile tale

Ai dreptul la: acces, rectificare, ștergere, restricționarea
prelucrării, portabilitate, opoziție și retragerea consimțământului.

Poți depune o plângere la Centrul Național pentru Protecția Datelor
cu Caracter Personal (CNPDCP).

Pentru a-ți exercita drepturile, scrie-ne la [contact].
```

### 8. Данные детей
```
Heading: Datele copiilor
Serviciile noastre privesc adesea copii. Datele despre copil sunt
furnizate de părinte sau de reprezentantul legal, care confirmă că are
dreptul să le ofere. Tratăm aceste date cu grijă deosebită.   ⚠ юрист
```

### 9. Безопасность
```
Heading: Securitatea datelor
Aplicăm măsuri tehnice și organizatorice pentru a proteja datele.  ⚠ конкретика
```

### 10. Cookies
```
Heading: Cookie-uri
Folosim cookie-uri pentru funcționarea site-ului [și statistici].
Vezi Politica de cookie-uri / gestionează preferințele.        ⚠ нужен баннер согласия
```

### 11–12. Изменения + контакт
```
Heading: Modificări
Putem actualiza această politică; data ultimei actualizări este sus.

Heading: Contact
Pentru orice întrebare despre datele tale: [email / responsabil].  ⚠
```

---

## 5. Техническая заметка для реализации

- Статичная контент-страница (можно из CMS), но **текст утверждает юрист**.
- Нужен **баннер согласия на cookies** (привязан к этой политике) + отдельная Cookie-политика.
- Формы по сайту (контакт, Quick question, newsletter) должны ссылаться на эту политику + чекбокс согласия — что уже заложено в структурах Contact/Ghiduri/Quick question.
- Язык: какая версия (RO/EN/RU) юридически приоритетна. ⚠ юрист.
- Логировать согласия (когда/на что) — для подотчётности по 195/2024. ⚠

---

## 6. SEO

```
Meta title:       Politica de confidențialitate | Dr. Olesea Jalba
Meta description: Cum colectăm, folosim și protejăm datele tale, inclusiv
                  datele despre sănătate și despre copil. Drepturile tale.
noindex? — обычно индексируется; решает [owner].
```

---

## 7. Что подтвердить (с юристом)

1. Юр. лицо/статус оператора + ответственный за данные / контакт.
2. Точные правовые основания, особенно для данных о здоровье.
3. Сроки хранения (медицинская документация по праву РМ).
4. Полный список процессоров и трансграничных передач (Calendly и др.).
5. Режим данных детей и подтверждения родителя.
6. Применяется ли GDPR (диаспора ЕС) и нужен ли представитель.
7. Какая языковая версия приоритетна.
8. Cookie-баннер + Cookie-политика.
```