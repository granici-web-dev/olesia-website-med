# Структура страницы «Contact» (apps/web · /ro/contact)

> Утилитарная страница, не посадочная. Её работа — **направить по нужному пути**, а не собрать всё в одну форму.
> Пояснения — по-русски. Текст для страницы — на **румынском** (основной локаль). Локализуется в `en`/`ru`.

---

## 0. Контекст и допущения

- Localhost не открывал — сверь сам.
- **`⚠ уточнить`** — каналы (email, телефон, соцсети), часы/срок ответа, куда уходят сообщения, наличие Политики конфиденциальности, география.
- Копирайт на RO. Скажи — выдам EN/RU.

---

## 1. Зачем сюда приходят (гипотезы → проверить)

Рамка `user-research` / JTBD. Гипотезы, не данные исследования.

| Намерение | JTBD | Куда направляем |
|---|---|---|
| Хочу записаться | «Как мне попасть на консультацию» | → Услуги / бронь |
| У меня медицинский вопрос | «Спросить врача про ребёнка/себя» | → «Întreabă medicul» (Quick question, 48h) |
| Вопрос про услугу/оплату/как работает | «Понять детали до покупки» | → форма / email |
| Экстренная ситуация | «Ребёнку плохо прямо сейчас» | → **112**, не форма |
| Партнёрство / пресса / прочее | «Связаться по делу» | → форма / email |

**Ключевое решение:** страница — это **триаж по намерению**. Общая форма принимает только НЕ-медицинские вопросы. Медицинские осознанно уводим в платный структурированный сервис (там корректное согласие и границы), а не в свободную форму. Это и UX, и защита бизнес-модели, и комплаенс по медданным.

---

## 2. Структура страницы сверху вниз

```
1. Hero                 — H1 + подзаголовок, задающий ожидание
2. Экстренный блок       — заметная плашка: не для срочного, звони 112
3. Триаж «Чем помочь?»   — 3–4 маршрута по намерению
4. Форма                 — только не-медицинские вопросы, с дисклеймером
5. Прямые каналы         — email / телефон / соцсети / срок ответа
6. Где найти / география — онлайн, РМ + диаспора
7. Приватность           — ссылка на Политику конфиденциальности
```

---

## 3. Текст страницы (RO, готов к публикации)

### 1. Hero
```
Eyebrow: Contact
H1:      Contactează-ne
Subhead: Ai o întrebare despre servicii, programare sau plată? Scrie-ne.
         Pentru o întrebare medicală, folosește serviciul „Întreabă medicul".
```

### 2. Экстренный блок (заметная плашка вверху)
```
În caz de urgență medicală, nu folosi acest formular.
Sună la 112 sau mergi la cel mai apropiat serviciu de urgență.
```
> Визуально выделить (цветная плашка/иконка). Это медико-правовой минимум.

### 3. Триаж «Чем помочь?»
```
Heading: Cum te putem ajuta?

• Vreau să programez o consultație
  → Vezi serviciile

• Am o întrebare medicală pentru medic
  → Întreabă medicul (răspuns în 48h)

• Am o întrebare despre servicii, plată sau cum funcționează
  → Completează formularul de mai jos
```

### 4. Форма (только не-медицинские вопросы)
```
Heading:  Scrie-ne un mesaj
Subnote:  Pentru întrebări despre servicii, programări sau plată.
          Te rugăm să nu incluzi informații medicale detaliate aici —
          pentru acestea folosește „Întreabă medicul".

Câmpuri:
- Nume          (placeholder: Numele tău)
- Email         (placeholder: adresa.ta@email.com)
- Subiect       (dropdown: Programare · Plată · Cum funcționează · Altă întrebare)
- Mesaj         (placeholder: Cum te putem ajuta?)
- [ ] Sunt de acord cu prelucrarea datelor conform
      Politicii de confidențialitate.

Buton: Trimite mesajul
```

**Состояния формы (UX-копи):**
```
Succes:     Mulțumim! Am primit mesajul tău și îți vom răspunde
            în [X] ore lucrătoare.                         ⚠ срок
Eroare:     Ceva nu a funcționat. Încearcă din nou sau scrie-ne
            direct la [email].                             ⚠ email
Validare:   • „Te rugăm să introduci numele."
            • „Te rugăm să introduci o adresă de email validă."
            • „Te rugăm să scrii un mesaj."
            • „Te rugăm să accepți prelucrarea datelor."
```

### 5. Прямые каналы
```
Heading: Alte modalități de contact
Email:              [email]                    ⚠
Telefon:            [telefon, dacă există]      ⚠
Program de răspuns: [zile / ore lucrătoare]     ⚠
Rețele sociale:     [linkuri]                   ⚠
```

### 6. Где найти / география
```
Heading: Unde ne găsești
Consultațiile au loc online, prin apel video. Lucrăm cu pacienți din
Republica Moldova și din diasporă.              ⚠ подтвердить
```
> Угол «диаспора» — реальная ценность: онлайн-формат удобен молдаванам за рубежом. Если подтвердишь — стоит оставить.

### 7. Приватность
```
Datele trimise prin formular sunt folosite doar pentru a-ți răspunde.
Vezi Politica de confidențialitate.            ⚠ страница должна существовать
```

---

## 4. Техническая заметка для реализации

- Форма постит на эндпоинт в `apps/api` (не отправляй данные напрямую из фронта куда-либо ещё).
- Нужны: валидация полей, анти-спам (honeypot / rate-limit), состояния success/error/loading, доступные `<label>` и сообщения об ошибках.
- **Куда уходят сообщения** — решение: email / запись в back-office / и то и то. ⚠
- Форма НЕ собирает медданные намеренно — дисклеймер обязателен, чтобы не провоцировать ввод чувствительной информации.

---

## 5. SEO (RO)

```
Meta title:       Contact | Dr. Olesea Jalba
Meta description: Contactează-ne pentru întrebări despre consultații
                  online, programări și plată. Pentru întrebări medicale,
                  folosește „Întreabă medicul".
H1:               один, как в Hero.
```

---

## 6. Поля контента для CMS / back-office (RO/EN/RU)

```
page_contact:
  hero_title / hero_subhead
  emergency_text
  triage_items[]          # {label, link}
  form_intro / form_disclaimer
  form_states             # success / error / validation
  channels                # email, phone, hours, social
  location_text
  privacy_text / privacy_link
  seo_title / seo_description
```

---

## 7. Что подтвердить перед публикацией

1. Email, телефон (если есть), соцсети.
2. Срок ответа на форму (X часов/дней) + рабочие часы.
3. Куда падают сообщения формы (почта / back-office / CRM).
4. Есть ли страница «Политика конфиденциальности» (нужна для согласия).
5. География: РМ + диаспора, или иначе.
6. Подтвердить, что медицинские вопросы маршрутизируются в Quick question, а не в форму.
```