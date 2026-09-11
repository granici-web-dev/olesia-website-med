# Структура страницы «Termeni și condiții» (apps/web · /ro)

> ⚠⚠ **НЕ ГОТОВЫЙ ДОКУМЕНТ И НЕ ЮРКОНСУЛЬТАЦИЯ.** Структура + каркас. Финальный текст утверждает юрист — это договор на медуслугу с оплатой и ответственностью. ⚠⚠
> Пояснения — по-русски. Текст — на **румынском**. Локализуется в `en`/`ru`.
> Termeni — обязывающая версия; правила отмены/оплаты/48ч в FAQ и на страницах услуг должны ей соответствовать.

---

## 0. Контекст

- Бизнес Молдовы. Применимо право РМ + Закон о защите прав потребителей. ⚠ юрист.
- Дистанционный договор (онлайн-услуга): возможны нормы о праве отказа и исключения для уже оказанных/медицинских услуг. ⚠ юрист — не утверждать без проверки.
- Связка с Политикой конфиденциальности (отдельная страница).

---

## 1. Зачем сюда приходят (гипотезы → проверить)

| Сегмент                  | JTBD                                   |
| ------------------------ | -------------------------------------- |
| Перед оплатой            | «На что соглашаюсь, какие правила»     |
| Хочет отменить/перенести | «Вернут ли деньги, можно ли перенести» |
| Понять услугу            | «Что получаю, каковы границы»          |
| Юридически грамотный     | «Какие у меня права как потребителя»   |

**UX-вывод:** Termeni плохо читаются. Делаем **двухслойно** (как GDPR): короткое резюме простым языком сверху (особенно отмена, оплата, «не для экстренных») + полный текст ниже.

---

## 2. Узлы, специфичные для этой практики

**A. Природа и границы медуслуги** — ядро. Телемедицина: онлайн не заменяет очный осмотр, не для экстренных, без гарантии результата, контент = общая информация. Защита практики + честные ожидания.

**B. Дети / согласие родителя** — услуги для ребёнка заказывает и принимает условия родитель/законный представитель.

**C. Отмена / перенос / возврат** — то, что читают в первую очередь. ⚠ до сих пор не определено.

---

## 3. Структура страницы сверху вниз

```
1. Заголовок + дата + кто провайдер
2. Резюме простым языком (TL;DR)
3. Услуги
4. Кто может пользоваться (дети/родитель)
5. Программирование и подтверждение
6. Оплата
7. Отмена, перенос, возврат
8. Природа медуслуги и её границы   ← ядро
9. Обязанности пользователя
10. Ограничение ответственности
11. Интеллектуальная собственность
12. Конфиденциальность (ссылка на Политику)
13. Изменение условий
14. Применимое право и споры
15. Контакт
```

---

## 4. Каркас текста (RO, ЧЕРНОВИК — требует юр. проверки)

### 1. Заголовок

```
H1: Termeni și condiții
Ultima actualizare: [data]
Furnizor: Dr. Olesea Jalba / [denumire juridică]      ⚠ юр. статус
```

### 2. Резюме простым языком

```
Heading: Pe scurt
• Acești termeni reglementează folosirea serviciilor noastre.
• Consultațiile online au limite și nu sunt pentru urgențe — sună la 112.
• Plata se face prin transfer bancar.
• Reguli de anulare și reprogramare: [...].            ⚠ определить
• Pentru copii, serviciile sunt solicitate de părinte / reprezentant legal.
```

### 3. Услуги

```
Heading: Serviciile oferite
Oferim consultații video (pediatrică, de nutriție, integrativă) și
servicii prin portal („Întreabă medicul", monitorizare de 3 luni).
Detaliile și duratele sunt descrise pe pagina Servicii.
```

### 4. Кто может пользоваться

```
Heading: Cine poate folosi serviciile
Pentru serviciile destinate copiilor, programarea și acceptarea acestor
termeni se fac de către părinte sau reprezentantul legal, care confirmă
că are dreptul să acționeze în numele copilului.       ⚠ юрист
```

### 5. Программирование и подтверждение

```
Heading: Programare și confirmare
Programarea consultațiilor video se face prin Calendly; vei primi o
confirmare a orei alese. Pentru serviciile prin portal, trimiți o
solicitare sau o întrebare.
```

### 6. Оплата

```
Heading: Plată
Plata se face pe site cu cardul sau prin MIA (pagina securizată
BC „MAIB" S.A.) ori prin transfer bancar.
[Plata se achită înainte de consultație.]              ⚠ когда
Prețurile sunt afișate la fiecare serviciu.            ⚠ цены
[Factură / confirmare de plată: ...]                   ⚠
```

### 7. Отмена, перенос, возврат

```
Heading: Anulare, reprogramare și rambursare
[Politica de anulare și reprogramare — termene și condiții.]   ⚠ ОПРЕДЕЛИТЬ
[Condițiile de rambursare.]                                    ⚠
```

> Самый практически важный раздел. Без него Termeni неполны. Должен совпадать с FAQ и страницами услуг.

### 8. Природа медуслуги и границы (ЯДРО)

```
Heading: Natura serviciilor medicale și limitele lor

• Consultațiile online au limite și nu înlocuiesc o examinare fizică
  atunci când aceasta este necesară.
• Serviciile nu sunt destinate urgențelor medicale. În caz de urgență,
  sună la 112 sau mergi la cel mai apropiat serviciu de urgență.
• Medicul poate stabili că situația necesită o consultație în persoană
  sau investigații suplimentare și te poate îndruma în acest sens.
• Nu garantăm un anumit rezultat medical.
• Materialele informative (ghiduri, meniuri, articole) au caracter
  general și nu reprezintă sfaturi medicale personalizate.
• [Eliberarea rețetelor: ...]                          ⚠ регуляторика РМ
```

### 9. Обязанности пользователя

```
Heading: Obligațiile tale
Te angajezi să oferi informații corecte și complete despre starea de
sănătate și să folosești serviciile în mod adecvat.
```

### 10. Ограничение ответственности

```
Heading: Limitarea răspunderii
[În limitele permise de lege ...]                      ⚠ юрист (потреб. право ограничивает)
```

### 11. Интеллектуальная собственность

```
Heading: Proprietate intelectuală
Conținutul site-ului — texte, ghiduri, meniuri, articole — ne aparține
și nu poate fi reprodus sau distribuit fără acordul nostru.   ⚠
```

### 12–15. Конфиденциальность / изменения / право / контакт

```
Heading: Confidențialitate
Prelucrarea datelor este descrisă în Politica de confidențialitate.

Heading: Modificarea termenilor
Putem actualiza acești termeni; data ultimei actualizări este afișată sus.

Heading: Legea aplicabilă
Acești termeni sunt guvernați de legislația Republicii Moldova.
[Soluționarea litigiilor / drepturile consumatorului.]   ⚠ юрист

Heading: Contact
Pentru întrebări despre acești termeni: [email].          ⚠
```

---

## 5. Техническая заметка для реализации

- Статичная контент-страница (можно из CMS), но **текст утверждает юрист**.
- При бронировании/оплате — чекбокс принятия Termeni + Политики конфиденциальности (фиксировать согласие: когда/какая версия). ⚠
- **Единый источник правды:** правила отмены/оплаты/48ч на страницах услуг и в FAQ должны совпадать с Termeni (обязывающая версия — здесь).
- Какая языковая версия (RO/EN/RU) юридически приоритетна. ⚠

---

## 6. SEO

```
Meta title:       Termeni și condiții | Dr. Olesea Jalba
Meta description: Condițiile de utilizare a serviciilor de consultații
                  online — programare, plată, anulare și limitele
                  serviciilor medicale.
```

---

## 7. Что подтвердить (с юристом)

1. Политика отмены / переноса / возврата (+ согласование с FAQ и услугами).
2. Оплата: когда, фактура; цены.
3. Рецепты (регуляторика телемедицины РМ).
4. Ограничение ответственности в рамках потребительского права.
5. Право отказа от дистанционного договора и исключения (мед/уже оказанные услуги).
6. Согласие родителя за ребёнка — формулировка.
7. Применимое право, споры, права потребителя.
8. Условия интеллектуальной собственности; приоритетная языковая версия.

```

```
