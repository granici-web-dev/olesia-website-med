/**
 * Initial FAQ content for the public /faq page.
 *
 * Lifted verbatim from the hardcoded `CATEGORIES` array that used to live in
 * `apps/frontend/app/[locale]/faq/page.tsx` — this is the copy that has been
 * live on the site, not a fresh draft. Kept in its own file because it is bulk
 * content, not seeding logic.
 *
 * ⚠ Several answers are still drafts pending the client's decisions
 * (cancellation window, refunds, prescriptions, data policy). They are seeded
 * as-is so the page keeps working; she edits them in the back office.
 */

export interface SeedFaqItem {
  questionRo: string;
  questionEn: string;
  questionRu: string;
  answerRo: string;
  answerEn: string;
  answerRu: string;
}

export interface SeedFaqCategory {
  slug: string;
  titleRo: string;
  titleEn: string;
  titleRu: string;
  items: SeedFaqItem[];
}

export const FAQ_SECTIONS: SeedFaqCategory[] = [
  {
    slug: 'consultatii',
    titleRo: 'Consultații online',
    titleEn: 'Online consultations',
    titleRu: 'Онлайн-консультации',
    items: [
      {
        questionRo: 'Cum decurge o consultație online?',
        questionEn: 'How does an online consultation work?',
        questionRu: 'Как проходит онлайн-консультация?',
        answerRo:
          'Consultația are loc pe Google Meet, la ora programată — primești linkul automat în e-mailul de confirmare, fără să instalezi nimic. La cerere, putem folosi și WhatsApp, Viber sau Instagram video. Instrucțiunile vin cu 24 de ore înainte.',
        answerEn:
          'The consultation takes place on Google Meet at the scheduled time — you get the link automatically in the confirmation email, with nothing to install. On request, we can also use WhatsApp, Viber, or Instagram video. Instructions arrive 24 hours ahead.',
        answerRu:
          'Консультация проходит в Google Meet в назначенное время — ссылку вы получаете автоматически в письме-подтверждении, ничего устанавливать не нужно. По желанию можем использовать WhatsApp, Viber или Instagram video. Инструкции придут за 24 часа.',
      },
      {
        questionRo: 'De ce am nevoie pentru consultație?',
        questionEn: 'What do I need for the consultation?',
        questionRu: 'Что нужно для консультации?',
        answerRo:
          'Un dispozitiv cu cameră, conexiune la internet și un loc liniștit. Pregătește analizele și documentele relevante.',
        answerEn:
          'A device with a camera, an internet connection, and a quiet spot. Have any relevant test results and documents ready.',
        answerRu:
          'Устройство с камерой, интернет и тихое место. Заранее подготовьте анализы и нужные документы.',
      },
      {
        questionRo: 'În ce limbi pot avea consultația?',
        questionEn: 'Which languages can I have the consultation in?',
        questionRu: 'На каких языках можно пройти консультацию?',
        answerRo: 'În română, rusă și engleză.',
        answerEn: 'Romanian, Russian, and English.',
        answerRu: 'На румынском, русском и английском.',
      },
      {
        questionRo: 'Trebuie să fie copilul prezent la consultație?',
        questionEn: 'Does my child need to be present?',
        questionRu: 'Нужно ли, чтобы ребёнок был на консультации?',
        answerRo:
          'Da, recomandăm ca cel mic să fie prezent — ajută la o evaluare cât mai bună.',
        answerEn:
          'Yes — we recommend the child is present, as it helps with the most accurate assessment.',
        answerRu:
          'Да, лучше, чтобы ребёнок был рядом, — так врачу проще точно оценить состояние.',
      },
      {
        questionRo: 'Ce nu poate înlocui o consultație online?',
        questionEn: 'What can’t an online consultation replace?',
        questionRu: 'Что онлайн-консультация не может заменить?',
        answerRo:
          'Consultația online nu este pentru urgențe. Unele situații pot necesita o examinare fizică — îți vom spune clar când e cazul.',
        answerEn:
          'Online consultations aren’t for emergencies. Some situations need a physical exam — we’ll tell you clearly when that’s the case.',
        answerRu:
          'Онлайн-консультация не подходит для экстренных ситуаций. Иногда нужен очный осмотр — и мы прямо скажем, когда именно.',
      },
    ],
  },
  {
    slug: 'programare',
    titleRo: 'Programare și anulare',
    titleEn: 'Booking & cancellation',
    titleRu: 'Запись и отмена',
    items: [
      {
        questionRo: 'Cum programez o consultație?',
        questionEn: 'How do I book a consultation?',
        questionRu: 'Как записаться на консультацию?',
        answerRo:
          'Alegi serviciul din „Servicii" și selectezi o oră liberă din calendar.',
        answerEn:
          'Choose the service under “Services” and pick an available time from the calendar.',
        answerRu:
          'Выберите услугу в разделе «Услуги» и свободное время в календаре.',
      },
      {
        questionRo: 'Pot anula sau reprograma?',
        questionEn: 'Can I cancel or reschedule?',
        questionRu: 'Можно ли отменить или перенести?',
        answerRo:
          'Da. Poți anula sau reprograma cu cel puțin 24 de ore înainte, din linkul de confirmare.',
        answerEn:
          'Yes. You can cancel or reschedule at least 24 hours ahead, from your confirmation link.',
        answerRu:
          'Да. Отменить или перенести запись можно минимум за 24 часа — по ссылке из письма-подтверждения.',
      },
      {
        questionRo: 'Ce se întâmplă dacă întârzii la consultație?',
        questionEn: 'What if I’m late?',
        questionRu: 'Что если я опоздаю на консультацию?',
        answerRo:
          'Te rugăm să ne anunți. Putem reprograma dacă întârzierea este prea mare pentru a desfășura consultația.',
        answerEn:
          'Please let us know. We can reschedule if the delay is too long to hold the consultation.',
        answerRu:
          'Пожалуйста, предупредите нас. Если опоздание слишком большое и консультацию уже не успеть провести, мы её перенесём.',
      },
    ],
  },
  {
    slug: 'plata',
    titleRo: 'Plată',
    titleEn: 'Payment',
    titleRu: 'Оплата',
    items: [
      {
        questionRo: 'Cum se face plata?',
        questionEn: 'How do I pay?',
        questionRu: 'Как происходит оплата?',
        answerRo:
          'Prin transfer bancar (deocamdată fără plată online). Primești detaliile după confirmarea programării.',
        answerEn:
          'By bank transfer (no online payment for now). You’ll get the details once your booking is confirmed.',
        answerRu:
          'Банковским переводом (пока без онлайн-оплаты). Реквизиты вы получите после подтверждения записи.',
      },
      {
        questionRo: 'Când achit consultația?',
        questionEn: 'When do I pay?',
        questionRu: 'Когда я оплачиваю консультацию?',
        answerRo: 'Înainte de consultație, după confirmarea programării.',
        answerEn: 'Before the consultation, once your booking is confirmed.',
        answerRu: 'До консультации, после подтверждения записи.',
      },
      {
        questionRo: 'Primesc o factură sau o confirmare?',
        questionEn: 'Do I get an invoice or confirmation?',
        questionRu: 'Получу ли я счёт или подтверждение?',
        answerRo: 'Da, primești o confirmare pe email.',
        answerEn: 'Yes, you receive a confirmation by email.',
        answerRu: 'Да, подтверждение придёт на электронную почту.',
      },
      {
        questionRo: 'Există posibilitatea de rambursare?',
        questionEn: 'Are refunds possible?',
        questionRu: 'Возможен ли возврат средств?',
        answerRo:
          'Da, dacă anulezi în timp util, conform politicii de anulare.',
        answerEn: 'Yes, if you cancel in good time, per the cancellation policy.',
        answerRu: 'Да, если отменить запись вовремя — по правилам отмены.',
      },
    ],
  },
  {
    slug: 'servicii',
    titleRo: 'Servicii',
    titleEn: 'Services',
    titleRu: 'Услуги',
    items: [
      {
        questionRo: 'Care este diferența dintre consultații?',
        questionEn: 'What’s the difference between the consultations?',
        questionRu: 'В чём разница между консультациями?',
        answerRo:
          'Pediatrică (sănătate, 30 min) · Nutriție (alimentație, 60 min) · Integrativă (situații complexe + monitorizare, 90 min).',
        answerEn:
          'Pediatric (health, 30 min) · Nutrition (feeding, 60 min) · Integrative (complex cases + monitoring, 90 min).',
        answerRu:
          'Педиатрическая (здоровье, 30 мин) · Нутрициологическая (питание, 60 мин) · Интегративная (сложные случаи + наблюдение, 90 мин).',
      },
      {
        questionRo: 'Cum aleg serviciul potrivit?',
        questionEn: 'How do I choose the right service?',
        questionRu: 'Как выбрать подходящую услугу?',
        answerRo:
          'Vezi ghidul scurt din pagina „Servicii", care te ajută să alegi în funcție de situație.',
        answerEn:
          'See the short helper on the “Services” page that guides you by situation.',
        answerRu:
          'На странице «Услуги» есть короткая подсказка — она поможет выбрать под вашу ситуацию.',
      },
      {
        questionRo: 'Primesc o rețetă în urma consultației?',
        questionEn: 'Will I get a prescription?',
        questionRu: 'Получу ли я рецепт после консультации?',
        answerRo:
          'În funcție de situație. Unele recomandări pot necesita o evaluare suplimentară — îți spunem clar la consultație.',
        answerEn:
          'It depends on the situation. Some recommendations may need further assessment — we’ll tell you clearly during the consultation.',
        answerRu:
          'Смотря по ситуации. Иногда, прежде чем что-то назначить, нужно дообследование — об этом мы прямо скажем на консультации.',
      },
      {
        questionRo: 'Pentru ce vârste sunt consultațiile?',
        questionEn: 'What ages are the consultations for?',
        questionRu: 'Для какого возраста консультации?',
        answerRo: 'De la naștere până la adolescență.',
        answerEn: 'From birth through adolescence.',
        answerRu: 'От рождения до подросткового возраста.',
      },
      {
        questionRo: 'Consultațiile sunt și pentru adulți?',
        questionEn: 'Are consultations also for adults?',
        questionRu: 'Подходят ли консультации и для взрослых?',
        answerRo: 'Consultația de nutriție este disponibilă și pentru adulți.',
        answerEn: 'The nutrition consultation is also available for adults.',
        answerRu: 'Консультация по нутрициологии доступна и для взрослых.',
      },
    ],
  },
  {
    slug: 'portal',
    titleRo: 'Servicii prin portal',
    titleEn: 'Portal services',
    titleRu: 'Услуги через портал',
    items: [
      {
        questionRo: 'Cum funcționează „Întreabă medicul"?',
        questionEn: 'How does “Ask the doctor” work?',
        questionRu: 'Как работает «Спросить врача»?',
        answerRo:
          'Scrii întrebarea, achiți prin transfer și primești un răspuns scris în ~1 oră în timpul programului de lucru.',
        answerEn:
          'You write your question, pay by transfer, and get a written answer within ~1 hour during working hours.',
        answerRu:
          'Вы пишете вопрос, оплачиваете переводом и в течение ~1 часа в рабочее время получаете письменный ответ.',
      },
      {
        questionRo: '„~1 oră" înseamnă timp de lucru?',
        questionEn: 'Does “~1 hour” mean working hours?',
        questionRu: '«~1 час» — это в рабочее время?',
        answerRo:
          'Da — aproximativ o oră în timpul programului de lucru. Întrebările trimise în afara programului primesc răspuns în următorul interval de lucru.',
        answerEn:
          'Yes — about an hour during working hours. Questions sent outside the schedule are answered in the next working interval.',
        answerRu:
          'Да, примерно час в рабочее время. На вопросы, отправленные вне графика, ответ приходит в следующий рабочий интервал.',
      },
      {
        questionRo: 'Ce include „Monitorizare și abonamente"?',
        questionEn: 'What does “Monitoring & subscriptions” include?',
        questionRu: 'Что включает «Наблюдение и абонементы»?',
        answerRo:
          'Sunt 4 tipuri de abonament (Pediatrie, Nutriție copii, Nutriție adulți, Complex), pe 1, 2, 3 sau 6 luni: monitorizare periodică, ajustarea planului pe parcurs și comunicare directă cu medicul. Durata și prețul le stabilim individual — lași o solicitare și te contactăm.',
        answerEn:
          'There are 4 subscription types (Pediatrics, Child nutrition, Adult nutrition, Complex), over 1, 2, 3, or 6 months: periodic monitoring, plan adjustments along the way, and direct communication with the doctor. Duration and price are set individually — leave a request and we’ll get in touch.',
        answerRu:
          'Есть 4 типа абонемента (педиатрия, питание детей, питание взрослых, комплекс) на 1, 2, 3 или 6 месяцев: периодическое наблюдение, корректировка плана и прямая связь с врачом. Длительность и цену согласуем индивидуально — оставьте заявку, и мы свяжемся с вами.',
      },
      {
        questionRo: 'Trebuie o consultație înainte de a intra în program?',
        questionEn: 'Do I need a consultation before joining the program?',
        questionRu: 'Нужна ли консультация перед началом программы?',
        answerRo:
          'Recomandăm o consultație inițială, ca planul să fie adaptat copilului.',
        answerEn:
          'We recommend an initial consultation so the plan is tailored to your child.',
        answerRu:
          'Советуем начать с первой консультации — так план получится подобрать под ребёнка.',
      },
    ],
  },
  {
    slug: 'confidentialitate',
    titleRo: 'Confidențialitate și urgențe',
    titleEn: 'Privacy & emergencies',
    titleRu: 'Конфиденциальность и неотложные случаи',
    items: [
      {
        questionRo: 'Datele mele sunt în siguranță?',
        questionEn: 'Is my data safe?',
        questionRu: 'Мои данные в безопасности?',
        answerRo:
          'Da. Datele tale sunt folosite doar pentru consultație și sunt păstrate în siguranță, conform legii.',
        answerEn:
          'Yes. Your data is used only for the consultation and is kept securely, in line with the law.',
        answerRu:
          'Да. Данные нужны только для консультации, хранятся надёжно и по закону.',
      },
      {
        questionRo: 'Este o urgență medicală — ce fac?',
        questionEn: 'It’s a medical emergency — what do I do?',
        questionRu: 'Это неотложный медицинский случай — что делать?',
        answerRo:
          'Sună la 112 sau mergi la cel mai apropiat serviciu de urgență. Nu folosi platforma pentru urgențe.',
        answerEn:
          'Call 112 or go to the nearest emergency service. Don’t use the platform for emergencies.',
        answerRu:
          'Звоните 112 или обращайтесь в ближайшую службу неотложной помощи. Не используйте платформу для экстренных случаев.',
      },
      {
        questionRo: 'Pot atașa poze sau analize la „Întreabă medicul"?',
        questionEn: 'Can I attach photos or test results to “Ask the doctor”?',
        questionRu: 'Можно ли прикрепить фото или анализы к «Спросить врача»?',
        answerRo:
          'Da, poți atașa poze și documente. Sunt stocate în siguranță și folosite doar pentru a-ți răspunde.',
        answerEn:
          'Yes — you can attach photos and documents. They’re stored securely and used only to answer you.',
        answerRu:
          'Да, фото и документы прикрепить можно. Они хранятся надёжно и нужны только для того, чтобы вам ответить.',
      },
    ],
  },
];
