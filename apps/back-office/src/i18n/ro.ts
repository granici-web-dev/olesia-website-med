/**
 * Single source of every UI string in the back office.
 * The panel is Romanian-only, but strings are centralized here (never hardcoded
 * in components) so copy stays consistent and a second locale stays cheap.
 * See PRODUCT.md → "Romanian, centralized".
 */
export const ro = {
  app: {
    name: 'Olesia',
    tagline: 'Panou de administrare',
  },

  nav: {
    sectionMain: 'Operațional',
    sectionContent: 'Conținut',
    sectionAdmin: 'Administrare',
    dashboard: 'Tablou de bord',
    appointments: 'Programări',
    subscriptions: 'Abonamente',
    quickQuestions: 'Întrebări rapide',
    messages: 'Mesaje',
    patients: 'Pacienți',
    blog: 'Blog',
    services: 'Servicii',
    contacts: 'Contacte',
    about: 'Despre noi',
    faq: 'Întrebări frecvente',
    testimonials: 'Recenzii',
    media: 'Apariții media',
    library: 'Biblioteca digitală',
    users: 'Utilizatori',
    security: 'Securitate',
  },

  header: {
    search: 'Caută…',
    openMenu: 'Deschide meniul',
    closeMenu: 'Închide meniul',
    notifications: 'Notificări',
  },

  userMenu: {
    account: 'Cont',
    profile: 'Profilul meu',
    settings: 'Setări',
    logout: 'Deconectare',
  },

  roles: {
    admin: 'Administrator',
    editor: 'Editor',
  },

  security: {
    title: 'Securitate',
    subtitle: 'Autentificare în doi pași pentru contul tău.',
    cardTitle: 'Autentificare în doi pași',
    cardDescription:
      'La fiecare autentificare vei introduce, pe lângă parolă, un cod de 6 cifre generat de aplicația de pe telefon.',
    statusOn: 'Activată',
    statusOff: 'Dezactivată',
    enableCta: 'Activează',
    qrAlt: 'Cod QR pentru aplicația de autentificare',
    scanHint:
      'Scanează codul cu Google Authenticator, Microsoft Authenticator, 1Password sau orice aplicație TOTP.',
    manualHint: 'Dacă nu poți scana, introdu manual această cheie:',
    codeLabel: 'Codul din aplicație',
    confirmCta: 'Confirmă',
    cancel: 'Renunță',
    recoveryTitle: 'Coduri de recuperare',
    recoveryHint:
      'Notează-le acum — se afișează o singură dată. Fiecare cod poate fi folosit o singură dată, dacă pierzi accesul la telefon.',
    copy: 'Copiază',
    copied: 'Copiate',
    disableLabel: 'Introdu un cod pentru a dezactiva',
    disableCta: 'Dezactivează',
    disableHint: 'Cerem un cod valid și la dezactivare, ca o sesiune furată să nu fie suficientă.',
    enabledToast: 'Autentificarea în doi pași este activă.',
    disabledToast: 'Autentificarea în doi pași a fost dezactivată.',
    invalidCode: 'Cod incorect. Mai încearcă o dată.',
    errorGeneric: 'A apărut o eroare. Încearcă din nou.',
  },
  login: {
    title: 'Autentificare',
    subtitle: 'Accesează panoul de administrare Olesia.',
    emailLabel: 'Email',
    emailPlaceholder: 'nume@exemplu.ro',
    passwordLabel: 'Parolă',
    passwordPlaceholder: '••••••••',
    submit: 'Intră în cont',
    submitting: 'Se autentifică…',
    forgot: 'Ai uitat parola?',
    errorInvalid: 'Email sau parolă incorecte.',
    errorGeneric: 'Autentificarea a eșuat. Încearcă din nou.',
    success: 'Bine ai revenit!',
    totpLabel: 'Cod de verificare',
    totpPlaceholder: '123456',
    totpHint:
      'Deschide aplicația de autentificare și introdu codul de 6 cifre. Poți folosi și un cod de recuperare.',
    totpError: 'Cod incorect. Mai încearcă o dată.',
    footnote: 'Acces restricționat. Conturile sunt create de administrator.',
  },

  common: {
    loading: 'Se încarcă…',
    save: 'Salvează',
    saving: 'Se salvează…',
    cancel: 'Anulează',
    delete: 'Șterge',
    edit: 'Editează',
    create: 'Adaugă',
    search: 'Caută',
    filter: 'Filtrează',
    retry: 'Reîncearcă',
    confirm: 'Confirmă',
    back: 'Înapoi',
    all: 'Toate',
    new: 'Nou',
    none: '—',
    /** Shown under every RU field: the site degrades to RO, it never blanks. */
    ruFallbackHint:
      'Opțional. Dacă lasi gol, pe site se afișează textul în română.',
  },

  // Shared payment-status vocabulary (manual, offline payments). Used by the
  // inline status switcher in lists; the per-module blocks keep their own copies
  // for the detail sheets.
  payment: {
    pending: 'În așteptare',
    confirmed: 'Confirmată',
    free: 'Gratuit',
    change: 'Schimbă statusul plății',
    confirmedToast: 'Plata a fost confirmată.',
    revertedToast: 'Plata a fost marcată drept neplătită.',
    error: 'Acțiunea a eșuat. Încearcă din nou.',
  },

  states: {
    errorTitle: 'A apărut o eroare',
    errorBody: 'Nu am putut încărca datele. Verifică conexiunea și reîncearcă.',
    emptyTitle: 'Nimic aici încă',
    emptyBody: 'Nu există înregistrări de afișat deocamdată.',
    comingSoonTitle: 'Secțiune în construcție',
    comingSoonBody:
      'Scheletul acestei secțiuni este pregătit. Funcționalitatea se conectează la API în pașii următori.',
    notFoundTitle: 'Pagina nu a fost găsită',
    notFoundBody: 'Adresa accesată nu există sau a fost mutată.',
    notFoundCta: 'Înapoi la tabloul de bord',
    forbiddenTitle: 'Acces interzis',
    forbiddenBody: 'Nu ai permisiunile necesare pentru această secțiune.',
  },

  dashboard: {
    title: 'Tablou de bord',
    subtitle: 'Privire de ansamblu asupra activității.',
    period: 'Ultimele 30 de zile',
    metricAppointments: 'Programări',
    metricAppointmentsHint: 'Consultații video înregistrate',
    metricPendingPayments: 'Plăți în așteptare',
    metricPendingPaymentsHint: 'De confirmat manual',
    metricSubscriptions: 'Abonamente active',
    metricSubscriptionsHint: 'Monitorizare în curs',
    metricQuickQuestions: 'Întrebări deschise',
    metricQuickQuestionsHint: 'Termen 48 de ore',
    upcomingTitle: 'Programări apropiate',
    upcomingEmpty: 'Nicio programare apropiată.',
    activityTitle: 'Activitate recentă',
    activityEmpty: 'Nicio activitate recentă.',
    trendTitle: 'Evoluția programărilor',
    loadError: 'Nu am putut încărca statisticile.',
    retry: 'Reîncearcă',
  },

  sections: {
    appointments: {
      title: 'Programări',
      subtitle: 'Consultații video, plăți și planuri scrise.',
    },
    subscriptions: {
      title: 'Abonamente',
      subtitle: 'Pachete de monitorizare și cota de apeluri video.',
    },
    quickQuestions: {
      title: 'Întrebări rapide',
      subtitle: 'Tichete cu răspuns în maximum 48 de ore.',
    },
    patients: {
      title: 'Pacienți',
      subtitle: 'Dosare medicale și istoricul consultațiilor.',
    },
    blog: {
      title: 'Blog',
      subtitle: 'Articole bilingve (RO/EN), categorii și status de publicare.',
    },
    services: {
      title: 'Servicii',
      subtitle: 'Tarife și pachete afișate pe site.',
    },
    contacts: {
      title: 'Contacte',
      subtitle: 'Datele de contact afișate public.',
    },
    about: {
      title: 'Despre noi',
      subtitle: 'Conținutul paginii „Despre noi”.',
    },
    users: {
      title: 'Utilizatori',
      subtitle: 'Conturi de back office. Doar administratorii pot gestiona.',
    },
  },

  appointments: {
    title: 'Programări',
    subtitle: 'Consultații video, plăți și planuri scrise.',
    refresh: 'Reîmprospătează',

    service: {
      pediatric: 'Consultație pediatrică',
      nutrition: 'Consultație nutrițională',
      integrative: 'Consultație integrativă',
      free_consult: 'Consultație gratuită',
    },

    status: {
      scheduled: 'Programată',
      completed: 'Finalizată',
      no_show: 'Neprezentare',
      canceled: 'Anulată',
    },

    payment: {
      pending: 'În așteptare',
      confirmed: 'Confirmată',
    },

    tabs: {
      all: 'Toate',
      scheduled: 'Programate',
      completed: 'Finalizate',
      no_show: 'Neprezentări',
      canceled: 'Anulate',
    },

    filters: {
      searchPlaceholder: 'Caută după nume sau email…',
      service: 'Serviciu',
      allServices: 'Toate serviciile',
      reset: 'Resetează',
    },

    columns: {
      client: 'Client',
      service: 'Serviciu',
      when: 'Programare',
      status: 'Status',
      payment: 'Plată',
    },

    empty: {
      title: 'Nicio programare',
      body: 'Programările apar automat aici după rezervarea unei consultații prin Calendly.',
      filteredTitle: 'Niciun rezultat',
      filteredBody: 'Nicio programare nu corespunde filtrelor selectate.',
    },

    detail: {
      title: 'Detalii programare',
      client: 'Client',
      appointment: 'Programare',
      payment: 'Plată',
      email: 'Email',
      reason: 'Motivul vizitei',
      noReason: 'Fără detalii',
      when: 'Data și ora',
      duration: 'Durată',
      video: 'Link video',
      joinCall: 'Deschide apelul',
      noVideo: 'Indisponibil',
      prepSent: 'Pregătire trimisă',
      notYet: 'Încă nu',
      calendlyRef: 'Referință Calendly',
      cancelLink: 'Anulează în Calendly',
      rescheduleLink: 'Reprogramează',
    },

    actions: {
      confirmPayment: 'Confirmă plata',
      revertPayment: 'Marchează drept neplătită',
      markNoShow: 'Marchează neprezentare',
      markCompleted: 'Marchează finalizată',
      processing: 'Se procesează…',
    },

    plan: {
      title: 'Plan de tratament',
      empty: 'Niciun plan adăugat încă.',
      savedAt: 'Salvat la',
      add: 'Adaugă plan',
      edit: 'Editează planul',
      textLabel: 'Plan de tratament',
      textPlaceholder:
        'Scrie planul de tratament și recomandările pentru client…',
      attachmentLabel: 'Atașament (opțional)',
      attachmentHint: 'PDF, DOC sau DOCX, până la 20 MB — ex. o rețetă.',
      attach: 'Atașează un fișier',
      changeFile: 'Schimbă fișierul',
      removeFile: 'Elimină',
      attachment: 'Atașament',
      download: 'Descarcă',
      save: 'Salvează planul',
      cancel: 'Anulează',
      downloadError: 'Descărcarea a eșuat. Încearcă din nou.',
    },

    confirm: {
      paymentTitle: 'Confirmi încasarea plății?',
      paymentBody:
        'Marchezi manual plata ca încasată pentru această programare. Poți reveni asupra acțiunii ulterior.',
      paymentCta: 'Confirmă plata',
      paymentRevertTitle: 'Marchezi plata drept neplătită?',
      paymentRevertBody:
        'Statusul plății revine la „În așteptare”. Poți confirma din nou oricând.',
      paymentRevertCta: 'Marchează drept neplătită',
      noShowTitle: 'Marchezi neprezentarea?',
      noShowBody:
        'Clientul nu s-a prezentat la consultație. Statusul programării devine „Neprezentare”.',
      noShowCta: 'Marchează neprezentare',
    },

    toast: {
      paymentConfirmed: 'Plata a fost confirmată.',
      paymentReverted: 'Plata a fost marcată drept neplătită.',
      noShowMarked: 'Programarea a fost marcată ca neprezentare.',
      planUploaded: 'Planul de tratament a fost salvat.',
      completed: 'Programarea a fost finalizată.',
      error: 'Acțiunea a eșuat. Încearcă din nou.',
    },
  },

  services: {
    title: 'Servicii',
    subtitle: 'Tarifele și pachetele afișate pe site.',
    newService: 'Serviciu nou',
    refresh: 'Reîmprospătează',

    group: {
      A_booking: 'Cu programare',
      B_portal: 'Fără programare',
    },
    groupHint: {
      A_booking: 'Slot video prin Calendly',
      B_portal: 'Doar portal / formular',
    },

    active: {
      on: 'Activ',
      off: 'Inactiv',
    },

    columns: {
      order: '#',
      service: 'Serviciu',
      group: 'Tip',
      price: 'Preț',
      active: 'Vizibil',
    },

    empty: {
      title: 'Niciun serviciu',
      body: 'Adaugă primul tarif care va fi afișat pe site.',
    },

    form: {
      createTitle: 'Serviciu nou',
      editTitle: 'Editează serviciul',
      createSubtitle: 'Adaugă un tarif afișat public pe site.',
      editSubtitle: 'Modifică detaliile tarifului.',
      code: 'Cod serviciu',
      codeHint: 'Identificator unic. Nu se mai poate schimba după creare.',
      group: 'Tip serviciu',
      content: 'Conținut',
      titleField: 'Titlu',
      description: 'Descriere',
      priceLabelField: 'Etichetă preț',
      priceLabelHint: 'Ex.: „Preț la cerere”, „48 h · scris”. Opțional.',
      price: 'Preț (EUR)',
      duration: 'Durată (min)',
      calendly: 'Calendly event type (URI)',
      calendlyHint: 'Doar grupul cu programare — sursa de adevăr pentru mapare.',
      calendlyUrl: 'Link Calendly de rezervare',
      calendlyUrlHint: 'Link public deschis în embed-ul de pe site (ex. calendly.com/cont/serviciu).',
      sortOrder: 'Ordine pe site',
      activeField: 'Afișat pe site',
      activeHint: 'Serviciile inactive nu apar public.',
      langRo: 'Română',
      langEn: 'Engleză',
      langRu: 'Rusă',
      optional: 'opțional',
      placeholderSelectCode: 'Alege codul…',
      save: 'Salvează',
      saving: 'Se salvează…',
      required: 'Câmp obligatoriu',
      invalidNumber: 'Valoare invalidă',
      allCodesUsed: 'Toate codurile de serviciu sunt deja folosite.',
    },

    delete: {
      title: 'Ștergi serviciul?',
      body: 'Serviciul va fi eliminat definitiv și nu va mai apărea pe site.',
      cta: 'Șterge serviciul',
    },

    toast: {
      created: 'Serviciul a fost adăugat.',
      updated: 'Serviciul a fost actualizat.',
      deleted: 'Serviciul a fost șters.',
      activated: 'Serviciul este afișat pe site.',
      deactivated: 'Serviciul a fost ascuns de pe site.',
      error: 'Acțiunea a eșuat. Încearcă din nou.',
    },
  },

  blog: {
    title: 'Blog',
    subtitle: 'Articole bilingve (RO/EN), categorii și status de publicare.',
    newPost: 'Articol nou',
    refresh: 'Reîmprospătează',
    manageCategories: 'Categorii',

    status: {
      draft: 'Ciornă',
      published: 'Publicat',
    },

    tabs: {
      all: 'Toate',
      published: 'Publicate',
      draft: 'Ciorne',
    },

    filters: {
      searchPlaceholder: 'Caută după titlu…',
      allCategories: 'Toate categoriile',
      reset: 'Resetează',
    },

    columns: {
      post: 'Articol',
      categories: 'Categorii',
      status: 'Status',
      date: 'Data',
    },

    uncategorized: 'Fără categorie',
    untitled: 'Fără titlu',

    empty: {
      title: 'Niciun articol',
      body: 'Scrie primul articol pentru blogul afișat pe site.',
      filteredTitle: 'Niciun rezultat',
      filteredBody: 'Niciun articol nu corespunde filtrelor selectate.',
    },

    delete: {
      title: 'Ștergi articolul?',
      body: 'Articolul va fi eliminat definitiv, împreună cu conținutul bilingv.',
      cta: 'Șterge articolul',
    },

    toast: {
      created: 'Articolul a fost creat.',
      updated: 'Articolul a fost salvat.',
      published: 'Articolul a fost publicat.',
      deleted: 'Articolul a fost șters.',
      error: 'Acțiunea a eșuat. Încearcă din nou.',
      coverTooLarge: 'Imaginea depășește 5 MB.',
      coverUploadError: 'Încărcarea imaginii a eșuat. Încearcă din nou.',
    },

    editor: {
      backToList: 'Înapoi la articole',
      newTitle: 'Articol nou',
      editTitle: 'Editează articolul',
      saveDraft: 'Salvează ciorna',
      publish: 'Publică',
      saveChanges: 'Salvează',
      saving: 'Se salvează…',
      langRo: 'Română',
      langEn: 'Engleză',
      langRu: 'Rusă',
      titleField: 'Titlu',
      titlePlaceholder: 'Titlul articolului…',
      excerpt: 'Rezumat',
      excerptPlaceholder: 'Scurt anunț afișat în listă…',
      content: 'Conținut',
      settings: 'Setări',
      status: 'Status',
      slug: 'Slug (URL)',
      slugHint: 'Generat din titlul RO. Poate fi editat.',
      cover: 'Imagine de copertă',
      coverHint: 'JPG sau PNG, până la 5 MB.',
      uploadCover: 'Încarcă imagine',
      uploadingCover: 'Se încarcă…',
      replaceCover: 'Înlocuiește',
      removeCover: 'Elimină',
      categories: 'Categorii',
      noCategories: 'Nicio categorie definită.',
      publishedAt: 'Data publicării',
      required: 'Câmp obligatoriu',
      missingTitle: 'Adaugă un titlu (RO) înainte de a salva.',
    },

    categories: {
      title: 'Categorii',
      subtitle: 'Etichetele afișate pe articole.',
      nameRo: 'Nume (RO)',
      nameEn: 'Nume (EN)',
      nameRu: 'Nume (RU)',
      add: 'Adaugă',
      addTitle: 'Categorie nouă',
      empty: 'Nicio categorie încă.',
      deleteTitle: 'Ștergi categoria?',
      deleteBody:
        'Categoria va fi eliminată și scoasă de pe articolele asociate.',
      deleteCta: 'Șterge',
      toast: {
        created: 'Categoria a fost adăugată.',
        updated: 'Categoria a fost actualizată.',
        deleted: 'Categoria a fost ștearsă.',
        error: 'Acțiunea a eșuat. Încearcă din nou.',
      },
    },
  },

  subscriptions: {
    title: 'Abonamente',
    subtitle: 'Pachete de monitorizare și cota de apeluri video.',
    refresh: 'Reîmprospătează',
    serviceName: 'Monitorizare 3 luni',

    status: {
      active: 'Activ',
      expired: 'Expirat',
      canceled: 'Anulat',
    },

    payment: {
      pending: 'În așteptare',
      confirmed: 'Confirmată',
    },

    tabs: {
      all: 'Toate',
      active: 'Active',
      expired: 'Expirate',
      canceled: 'Anulate',
    },

    filters: {
      searchPlaceholder: 'Caută după nume sau email…',
      reset: 'Resetează',
    },

    columns: {
      client: 'Client',
      period: 'Perioadă',
      quota: 'Apeluri video',
      status: 'Status',
      payment: 'Plată',
    },

    quota: {
      remaining: 'rămase',
      used: 'folosite',
      depleted: 'Cotă epuizată',
    },

    period: {
      daysLeft: 'zile rămase',
      lastDay: 'Ultima zi',
      expired: 'Expirat',
      to: '—',
    },

    empty: {
      title: 'Niciun abonament',
      body: 'Abonamentele „Monitorizare 3 luni” apar aici după activare.',
      filteredTitle: 'Niciun rezultat',
      filteredBody: 'Niciun abonament nu corespunde filtrelor selectate.',
    },

    detail: {
      title: 'Detalii abonament',
      client: 'Client',
      email: 'Email',
      phone: 'Telefon',
      message: 'Mesaj',
      service: 'Serviciu',
      period: 'Perioadă',
      quota: 'Apeluri video',
      price: 'Preț',
      remaining: 'rămase',
    },

    actions: {
      confirmPayment: 'Confirmă plata',
      revertPayment: 'Marchează drept neplătită',
      logCall: 'Înregistrează apel video',
      cancel: 'Anulează abonamentul',
    },

    confirm: {
      paymentTitle: 'Confirmi încasarea plății?',
      paymentBody:
        'Marchezi manual plata ca încasată pentru acest abonament. Poți reveni asupra acțiunii ulterior.',
      paymentCta: 'Confirmă plata',
      paymentRevertTitle: 'Marchezi plata drept neplătită?',
      paymentRevertBody:
        'Statusul plății revine la „În așteptare”. Poți confirma din nou oricând.',
      paymentRevertCta: 'Marchează drept neplătită',
      cancelTitle: 'Anulezi abonamentul?',
      cancelBody:
        'Abonamentul va fi marcat ca anulat și nu va mai consuma cotă de apeluri.',
      cancelCta: 'Anulează abonamentul',
    },

    toast: {
      paymentConfirmed: 'Plata a fost confirmată.',
      paymentReverted: 'Plata a fost marcată drept neplătită.',
      callLogged: 'Apel video înregistrat.',
      canceled: 'Abonamentul a fost anulat.',
      noQuota: 'Nu mai sunt apeluri disponibile.',
      error: 'Acțiunea a eșuat. Încearcă din nou.',
    },
  },

  patients: {
    title: 'Pacienți',
    subtitle: 'Dosare medicale și istoricul consultațiilor.',
    refresh: 'Reîmprospătează',
    addPatient: 'Adaugă pacient',
    backToList: 'Înapoi la pacienți',

    consent: {
      given: 'Consimțământ GDPR',
      missing: 'Fără consimțământ',
      record: 'Înregistrează consimțământul',
      recordedOn: 'Consimțământ înregistrat pe',
    },

    payment: {
      pending: 'În așteptare',
      confirmed: 'Confirmată',
    },

    gender: {
      male: 'Masculin',
      female: 'Feminin',
      other: 'Altul',
      unset: 'Nespecificat',
    },

    entryType: {
      anamnesis: 'Anamneză',
      note: 'Notă',
      prescription: 'Rețetă',
      document: 'Document',
    },

    filters: {
      searchPlaceholder: 'Caută după nume sau email…',
      reset: 'Resetează',
    },

    columns: {
      patient: 'Pacient',
      contact: 'Contact',
      lastInteraction: 'Ultima interacțiune',
      entries: 'Înregistrări',
    },

    list: {
      entriesCount: 'înregistrări',
      noInteraction: 'Fără interacțiuni',
    },

    empty: {
      title: 'Niciun pacient',
      body: 'Pacienții apar aici după ce un lead plătit este adăugat sau după ce creezi manual un dosar.',
      filteredTitle: 'Niciun rezultat',
      filteredBody: 'Niciun pacient nu corespunde căutării.',
    },

    detail: {
      contact: 'Date de contact',
      email: 'Email',
      phone: 'Telefon',
      birthDate: 'Data nașterii',
      age: 'ani',
      gender: 'Gen',
      notes: 'Note administrative',
      noNotes: 'Nicio notă administrativă.',
      createdAt: 'Creat',
      edit: 'Editează profilul',
      delete: 'Șterge pacientul',
      notFoundTitle: 'Pacientul nu a fost găsit',
      notFoundBody: 'Dosarul accesat nu există sau a fost șters.',
    },

    tabs: {
      profile: 'Profil',
      history: 'Istoric',
      anamnesis: 'Anamneză',
      prescriptions: 'Rețete',
      documents: 'Documente',
      interactions: 'Interacțiuni',
    },

    timeline: {
      title: 'Istoric medical',
      empty: 'Niciun istoric încă',
      emptyBody: 'Anamnezele, notele, rețetele și documentele apar aici, în ordine cronologică.',
      addEntry: 'Adaugă înregistrare',
      interactionLabel: 'Interacțiune',
    },

    anamnesis: {
      empty: 'Nicio anamneză',
      emptyBody: 'Adaugă prima anamneză pentru acest pacient.',
      add: 'Adaugă anamneză',
    },

    prescriptions: {
      empty: 'Nicio rețetă',
      emptyBody: 'Rețetele și planurile prescrise apar aici.',
      add: 'Adaugă rețetă',
    },

    documents: {
      empty: 'Niciun document',
      emptyBody: 'Încarcă analize, scrisori medicale sau alte documente (PDF, DOC).',
      upload: 'Încarcă document',
      uploading: 'Se încarcă…',
      download: 'Descarcă',
      private: 'Documentele medicale sunt private și accesibile doar autentificat.',
    },

    interactions: {
      empty: 'Nicio interacțiune',
      emptyBody: 'Programările, abonamentele și întrebările legate de acest pacient apar aici.',
      source: {
        appointment: 'Programare',
        subscription: 'Abonament',
        quick_question: 'Întrebare EXPRESS',
      },
    },

    form: {
      createTitle: 'Pacient nou',
      createSubtitle: 'Creează manual un dosar de pacient.',
      editTitle: 'Editează pacientul',
      editSubtitle: 'Actualizează datele de profil.',
      fullName: 'Nume complet',
      email: 'Email',
      phone: 'Telefon',
      birthDate: 'Data nașterii',
      gender: 'Gen',
      notes: 'Note administrative',
      notesHint: 'Note interne, non-medicale (nu apar în istoricul medical).',
      required: 'Câmp obligatoriu',
      invalidEmail: 'Adresă de email invalidă',
      save: 'Salvează',
      saving: 'Se salvează…',
    },

    entryForm: {
      addTitle: 'Adaugă înregistrare',
      editTitle: 'Editează înregistrarea',
      subtitle: 'Anamneză, notă sau rețetă în istoricul medical.',
      type: 'Tip',
      titleLabel: 'Titlu',
      titlePlaceholder: 'Opțional',
      body: 'Conținut',
      bodyPlaceholder: 'Scrie detaliile (markdown acceptat)…',
      occurredAt: 'Data clinică',
      occurredAtHint: 'Lasă gol pentru data de azi.',
      save: 'Salvează',
      saving: 'Se salvează…',
    },

    docForm: {
      title: 'Încarcă document',
      subtitle: 'Document medical privat (PDF, DOC, DOCX).',
      titleLabel: 'Titlu',
      titlePlaceholder: 'Opțional — implicit numele fișierului',
      file: 'Fișier',
      choose: 'Alege fișier',
      save: 'Încarcă',
      saving: 'Se încarcă…',
      noFile: 'Alege un fișier pentru încărcare.',
    },

    fromLead: {
      action: 'Adaugă ca pacient',
      adding: 'Se adaugă…',
    },

    confirm: {
      deleteTitle: 'Ștergi pacientul?',
      deleteBody:
        'Dosarul, toate înregistrările medicale și documentele vor fi șterse definitiv, iar programările și abonamentele asociate vor fi anonimizate (dreptul de a fi uitat). Acțiunea nu poate fi anulată.',
      deleteCta: 'Șterge definitiv',
      deleteEntryTitle: 'Ștergi înregistrarea?',
      deleteEntryBody: 'Înregistrarea va fi eliminată din istoricul medical.',
      deleteEntryCta: 'Șterge',
      consentTitle: 'Înregistrezi consimțământul GDPR?',
      consentBody:
        'Confirmi că pacientul (sau reprezentantul legal) și-a dat consimțământul pentru prelucrarea datelor. Se înregistrează data și ora curentă.',
      consentCta: 'Înregistrează',
    },

    toast: {
      created: 'Pacientul a fost creat.',
      updated: 'Profilul a fost actualizat.',
      deleted: 'Pacientul a fost șters.',
      emailTaken: 'Există deja un pacient cu acest email.',
      consentRecorded: 'Consimțământul a fost înregistrat.',
      entryAdded: 'Înregistrarea a fost adăugată.',
      entryUpdated: 'Înregistrarea a fost actualizată.',
      entryDeleted: 'Înregistrarea a fost ștearsă.',
      documentUploaded: 'Documentul a fost încărcat.',
      downloadStarted: 'Descărcarea a început.',
      downloadFailed: 'Descărcarea a eșuat.',
      mockNoFile: 'Fișier indisponibil în modul demo.',
      leadAdded: 'Lead-ul a fost adăugat ca pacient.',
      error: 'Acțiunea a eșuat. Încearcă din nou.',
    },
  },

  quickQuestions: {
    title: 'Întrebări rapide',
    subtitle: 'Tichete cu răspuns scris în maximum 48 de ore.',
    refresh: 'Reîmprospătează',

    status: {
      open: 'Deschis',
      overdue: 'Întârziat',
      answered: 'Răspuns trimis',
    },

    payment: {
      pending: 'În așteptare',
      confirmed: 'Confirmată',
    },

    tabs: {
      all: 'Toate',
      open: 'Deschise',
      overdue: 'Întârziate',
      answered: 'Răspunse',
    },

    filters: {
      searchPlaceholder: 'Caută după nume, email sau întrebare…',
      reset: 'Resetează',
    },

    columns: {
      client: 'Client',
      question: 'Întrebare',
      deadline: 'Termen (48 h)',
      status: 'Status',
      payment: 'Plată',
    },

    deadline: {
      left: 'rămase',
      overdueBy: 'Întârziat cu',
      withinSla: 'în termen',
      lateSla: 'cu întârziere',
    },

    empty: {
      title: 'Nicio întrebare',
      body: 'Tichetele „Întrebare EXPRESS” apar aici după trimiterea formularului de pe site.',
      filteredTitle: 'Niciun rezultat',
      filteredBody: 'Niciun tichet nu corespunde filtrelor selectate.',
    },

    detail: {
      title: 'Detalii tichet',
      client: 'Client',
      email: 'Email',
      received: 'Primit',
      deadline: 'Termen',
      question: 'Întrebarea clientului',
      attachments: 'Atașamente',
      sensitive: 'Date medicale sensibile — manipulează conform GDPR.',
      yourAnswer: 'Răspunsul tău',
      answerPlaceholder: 'Scrie răspunsul pentru client…',
      answer: 'Răspuns trimis',
      answeredAt: 'Trimis',
    },

    actions: {
      confirmPayment: 'Confirmă plata',
      revertPayment: 'Marchează drept neplătită',
      sendAnswer: 'Trimite răspunsul',
      sending: 'Se trimite…',
    },

    confirm: {
      paymentTitle: 'Confirmi încasarea plății?',
      paymentBody:
        'Marchezi manual plata ca încasată pentru acest tichet. Poți reveni asupra acțiunii ulterior.',
      paymentCta: 'Confirmă plata',
      paymentRevertTitle: 'Marchezi plata drept neplătită?',
      paymentRevertBody:
        'Statusul plății revine la „În așteptare”. Poți confirma din nou oricând.',
      paymentRevertCta: 'Marchează drept neplătită',
    },

    toast: {
      paymentConfirmed: 'Plata a fost confirmată.',
      paymentReverted: 'Plata a fost marcată drept neplătită.',
      answerSent: 'Răspunsul a fost trimis clientului.',
      answerRequired: 'Scrie un răspuns înainte de a-l trimite.',
      attachmentMock:
        'Descărcarea atașamentelor va fi disponibilă după conectarea la API.',
      error: 'Acțiunea a eșuat. Încearcă din nou.',
    },
  },

  messages: {
    title: 'Mesaje',
    subtitle: 'Mesajele trimise prin formularul de contact de pe site.',
    refresh: 'Reîmprospătează',

    status: {
      new: 'Nou',
      read: 'Citit',
      replied: 'Răspuns trimis',
    },

    subjects: {
      appointment: 'Programare',
      payment: 'Plată',
      how_it_works: 'Cum funcționează',
      other: 'Altă întrebare',
    },

    tabs: {
      all: 'Toate',
      new: 'Noi',
      read: 'Citite',
    },

    filters: {
      searchPlaceholder: 'Caută după nume, email sau mesaj…',
      reset: 'Resetează',
    },

    columns: {
      client: 'Expeditor',
      subject: 'Subiect',
      message: 'Mesaj',
      received: 'Primit',
      status: 'Status',
    },

    empty: {
      title: 'Niciun mesaj',
      body: 'Mesajele trimise din formularul de contact de pe site apar aici.',
      filteredTitle: 'Niciun rezultat',
      filteredBody: 'Niciun mesaj nu corespunde filtrelor selectate.',
    },

    detail: {
      title: 'Detalii mesaj',
      received: 'Primit',
      message: 'Mesajul clientului',
      reply: 'Răspuns',
      replyHint:
        'Trimiterea răspunsului direct din portal se activează după configurarea email-ului. Până atunci, poți răspunde din contul tău de email.',
    },

    actions: {
      replyByEmail: 'Răspunde prin email',
      delete: 'Șterge mesajul',
    },

    confirm: {
      deleteTitle: 'Ștergi acest mesaj?',
      deleteBody:
        'Mesajul va fi șters definitiv. Această acțiune nu poate fi anulată.',
      deleteCta: 'Șterge',
    },

    toast: {
      deleted: 'Mesajul a fost șters.',
      error: 'Acțiunea a eșuat. Încearcă din nou.',
    },
  },

  contacts: {
    title: 'Contacte',
    subtitle: 'Datele de contact afișate public pe site.',
    newContact: 'Contact nou',
    refresh: 'Reîmprospătează',

    type: {
      phone: 'Telefon',
      email: 'Email',
      address: 'Adresă',
      social: 'Rețea socială',
      other: 'Altul',
    },

    active: {
      on: 'Vizibil',
      off: 'Ascuns',
    },

    columns: {
      order: '#',
      contact: 'Contact',
      value: 'Valoare',
      active: 'Vizibil',
    },

    empty: {
      title: 'Niciun contact',
      body: 'Adaugă primul bloc de contact afișat pe site.',
    },

    form: {
      createTitle: 'Contact nou',
      editTitle: 'Editează contactul',
      createSubtitle: 'Adaugă un bloc de contact afișat public.',
      editSubtitle: 'Modifică detaliile blocului de contact.',
      type: 'Tip',
      labelRo: 'Etichetă (RO)',
      labelEn: 'Etichetă (EN)',
      labelRu: 'Etichetă (RU)',
      labelHint: 'Textul afișat lângă valoare (ex.: „Recepție”, „Program”).',
      value: 'Valoare',
      sortOrder: 'Ordine pe site',
      activeField: 'Afișat pe site',
      activeHint: 'Contactele ascunse nu apar public.',
      save: 'Salvează',
      saving: 'Se salvează…',
      required: 'Câmp obligatoriu',
      invalidNumber: 'Valoare invalidă',
      placeholder: {
        phone: '+373 60 000 000',
        email: 'contact@exemplu.ro',
        address: 'str. Exemplu 1, Chișinău',
        social: 'https://instagram.com/...',
        other: 'Valoarea contactului',
      },
    },

    delete: {
      title: 'Ștergi contactul?',
      body: 'Blocul de contact va fi eliminat și nu va mai apărea pe site.',
      cta: 'Șterge contactul',
    },

    toast: {
      created: 'Contactul a fost adăugat.',
      updated: 'Contactul a fost actualizat.',
      deleted: 'Contactul a fost șters.',
      activated: 'Contactul este afișat pe site.',
      deactivated: 'Contactul a fost ascuns de pe site.',
      error: 'Acțiunea a eșuat. Încearcă din nou.',
    },
  },

  users: {
    title: 'Utilizatori',
    subtitle: 'Conturi de back office. Doar administratorii pot gestiona.',
    newUser: 'Utilizator nou',
    refresh: 'Reîmprospătează',
    you: 'Tu',

    roleHint: {
      admin: 'Acces complet, inclusiv gestionarea utilizatorilor.',
      editor: 'Conținut: blog, tarife, contacte, about, programări.',
    },

    statusLabel: {
      active: 'Activ',
      blocked: 'Blocat',
    },

    columns: {
      user: 'Utilizator',
      role: 'Rol',
      status: 'Status',
      created: 'Creat',
    },

    empty: {
      title: 'Niciun utilizator',
      body: 'Adaugă primul cont de back office.',
    },

    actions: {
      menu: 'Acțiuni',
      edit: 'Editează',
      resetPassword: 'Resetează parola',
      block: 'Blochează',
      unblock: 'Deblochează',
    },

    confirm: {
      blockTitle: 'Blochezi utilizatorul?',
      blockBody:
        'Utilizatorul nu se va mai putea autentifica până la deblocare.',
      blockCta: 'Blochează',
    },

    form: {
      createTitle: 'Utilizator nou',
      editTitle: 'Editează utilizatorul',
      createSubtitle: 'Creează un cont de back office.',
      editSubtitle: 'Modifică numele și rolul.',
      email: 'Email',
      emailReadonly: 'Emailul nu poate fi schimbat după creare.',
      name: 'Nume',
      role: 'Rol',
      password: 'Parolă de pornire',
      passwordHint:
        'Minimum 8 caractere. Comunic-o utilizatorului în siguranță.',
      generate: 'Generează',
      save: 'Salvează',
      saving: 'Se salvează…',
      required: 'Câmp obligatoriu',
      invalidEmail: 'Email invalid',
      passwordMin: 'Minimum 8 caractere',
    },

    toast: {
      created: 'Utilizatorul a fost creat.',
      updated: 'Utilizatorul a fost actualizat.',
      blocked: 'Utilizatorul a fost blocat.',
      unblocked: 'Utilizatorul a fost deblocat.',
      passwordReset: 'Parolă nouă generată — comunic-o utilizatorului.',
      error: 'Acțiunea a eșuat. Încearcă din nou.',
    },
  },

  markdown: {
    write: 'Scrie',
    preview: 'Previzualizare',
    bold: 'Îngroșat',
    italic: 'Cursiv',
    heading: 'Titlu',
    quote: 'Citat',
    bulletList: 'Listă',
    numberedList: 'Listă numerotată',
    link: 'Link',
    code: 'Cod',
    previewEmpty: 'Nimic de previzualizat încă.',
    placeholder: 'Scrie conținutul în Markdown…',
  },

  about: {
    title: 'Despre noi',
    subtitle: 'Conținutul paginii „Despre noi” afișate pe site.',
    save: 'Salvează',
    saving: 'Se salvează…',
    lastUpdated: 'Actualizat',
    langRo: 'Română',
    langEn: 'Engleză',
    langRu: 'Rusă',
    titleField: 'Titlu',
    titlePlaceholder: 'Titlul paginii…',
    content: 'Conținut',
    images: 'Imagini',
    imagesHint: 'JPG sau PNG, până la 5 MB fiecare.',
    addImage: 'Adaugă imagine',
    uploading: 'Se încarcă…',
    removeImage: 'Elimină imaginea',
    noImages: 'Nicio imagine adăugată.',
    required: 'Câmp obligatoriu',
    missingTitle: 'Adaugă un titlu (RO) înainte de a salva.',
    toast: {
      saved: 'Pagina „Despre noi” a fost salvată.',
      imageTooLarge: 'Imaginea depășește 5 MB.',
      uploadError: 'Încărcarea imaginii a eșuat. Încearcă din nou.',
      error: 'Acțiunea a eșuat. Încearcă din nou.',
    },
    stats: {
      title: 'Cifre & realizări',
      hint: 'Afișate ca un rând de statistici pe pagina publică.',
      add: 'Adaugă o cifră',
      empty: 'Nicio cifră adăugată.',
      value: 'Cifră',
      valuePlaceholder: 'ex. 12+',
      labelRo: 'Etichetă (RO)',
      labelEn: 'Etichetă (EN)',
      labelRu: 'Etichetă (RU)',
      labelPlaceholderRo: 'ex. ani de practică',
      labelPlaceholderEn: 'ex. years in practice',
      labelPlaceholderRu: 'ex. лет практики',
    },
    credentials: {
      title: 'Calificări',
      hint: 'Lista de diplome și competențe afișate sub statistici.',
      add: 'Adaugă o calificare',
      empty: 'Nicio calificare adăugată.',
      ro: 'Text (RO)',
      en: 'Text (EN)',
      ru: 'Text (RU)',
      placeholderRo: 'ex. Medic pediatru, diplomă USMF',
      placeholderEn: 'ex. Pediatrician, USMF degree',
      placeholderRu: 'ex. Врач-педиатр, диплом USMF',
    },
    blocks: {
      moveUp: 'Mută în sus',
      moveDown: 'Mută în jos',
      remove: 'Elimină',
    },
  },

  faq: {
    title: 'Întrebări frecvente',
    subtitle: 'Secțiunile și întrebările de pe pagina publică /faq.',
    refresh: 'Reîmprospătează',
    langRo: 'Română',
    langEn: 'Engleză',
    langRu: 'Rusă',
    newCategory: 'Secțiune nouă',
    newItem: 'Adaugă întrebare',
    moveUp: 'Mută mai sus',
    moveDown: 'Mută mai jos',
    anchor: 'Ancoră',
    /** Shown next to a section that the public page will not render. */
    hiddenSection: 'Ascunsă pe site',
    /** A section is only rendered when at least one question is visible. */
    noVisibleItems: 'Fără întrebări vizibile — secțiunea nu apare pe site.',
    /**
     * Romanian counts in three shapes: 1 → singular, 2–19 → bare plural,
     * 20 and up → "de" + plural (decided by the last two digits, so 101 is
     * "101 întrebări" again).
     */
    questionCount: (n: number) => {
      if (n === 0) return 'nicio întrebare';
      if (n === 1) return 'o întrebare';
      return n % 100 === 0 || n % 100 >= 20
        ? `${n} de întrebări`
        : `${n} întrebări`;
    },
    empty: {
      title: 'Nicio secțiune încă',
      body: 'Pagina de întrebări frecvente este goală. Începe cu o secțiune — de exemplu „Programare și anulare” — și adaugă întrebările în ea.',
    },
    emptyItems: {
      body: 'Nicio întrebare în această secțiune.',
    },
    active: {
      on: 'Vizibilă pe site',
      off: 'Ascunsă de pe site',
    },
    deleteCategory: {
      title: 'Ștergi secțiunea?',
      body: 'Secțiunea dispare de pe site împreună cu toate întrebările din ea. Acțiunea nu poate fi anulată.',
      withItems: (n: number) =>
        n === 1
          ? 'Se șterge și o întrebare din ea.'
          : `Se șterg și cele ${n} întrebări din ea.`,
      cta: 'Șterge secțiunea',
    },
    deleteItem: {
      title: 'Ștergi întrebarea?',
      body: 'Întrebarea dispare de pe site. Acțiunea nu poate fi anulată.',
      cta: 'Șterge întrebarea',
    },
    toast: {
      created: 'Secțiunea a fost adăugată.',
      updated: 'Secțiunea a fost salvată.',
      deleted: 'Secțiunea a fost ștearsă.',
      itemCreated: 'Întrebarea a fost adăugată.',
      itemUpdated: 'Întrebarea a fost salvată.',
      itemDeleted: 'Întrebarea a fost ștearsă.',
      shown: 'Acum este vizibilă pe site.',
      hidden: 'Acum este ascunsă de pe site.',
      reordered: 'Ordinea a fost actualizată.',
      error: 'Acțiunea a eșuat. Încearcă din nou.',
    },
    categoryForm: {
      createTitle: 'Secțiune nouă',
      createSubtitle:
        'Un grup de întrebări, cu titlu propriu pe pagina publică.',
      editTitle: 'Editează secțiunea',
      editSubtitle: 'Titlul secțiunii, în cele trei limbi ale site-ului.',
      titleRo: 'Titlu (RO)',
      titleEn: 'Titlu (EN)',
      titleRu: 'Titlu (RU)',
      titlePlaceholderRo: 'ex. Programare și anulare',
      titlePlaceholderEn: 'ex. Booking & cancellation',
      titlePlaceholderRu: 'ex. Запись и отмена',
      anchorHint:
        'Ancora din adresă se generează din titlul în română la creare și rămâne neschimbată după redenumire, ca linkurile deja trimise să funcționeze.',
      activeField: 'Vizibilă pe site',
      activeHint: 'Ascunsă, secțiunea rămâne aici, dar nu apare pe pagina publică.',
      required: 'Câmp obligatoriu',
      save: 'Salvează',
      saving: 'Se salvează…',
    },
    itemForm: {
      createTitle: 'Întrebare nouă',
      createSubtitle: 'Se adaugă la finalul secțiunii alese.',
      editTitle: 'Editează întrebarea',
      editSubtitle: 'Întrebarea și răspunsul, în cele trei limbi.',
      category: 'Secțiune',
      question: 'Întrebare',
      answer: 'Răspuns',
      questionPlaceholderRo: 'ex. Cum decurge o consultație online?',
      questionPlaceholderEn: 'ex. How does an online consultation work?',
      questionPlaceholderRu: 'ex. Как проходит онлайн-консультация?',
      answerPlaceholderRo: 'Răspunsul în română…',
      answerPlaceholderEn: 'Răspunsul în engleză…',
      answerPlaceholderRu: 'Răspunsul în rusă…',
      activeField: 'Vizibilă pe site',
      activeHint: 'Ascunsă, întrebarea rămâne aici, dar nu apare pe pagina publică.',
      required: 'Câmp obligatoriu',
      missingRequired: 'Completează întrebarea și răspunsul în română și engleză.',
      save: 'Salvează',
      saving: 'Se salvează…',
    },
  },

  testimonials: {
    title: 'Recenzii',
    subtitle: 'Recenziile părinților, afișate pe pagina principală.',
    refresh: 'Reîmprospătează',
    newItem: 'Recenzie nouă',
    moveUp: 'Mută mai sus',
    moveDown: 'Mută mai jos',
    langRo: 'Română',
    langEn: 'Engleză',
    langRu: 'Rusă',
    anonymous: 'Nesemnată',
    /** The one rule that matters on this page, kept in front of her eyes. */
    integrityNote:
      'Publică doar recenzii primite de la pacienți. Dacă o recenzie nu este semnată, lasă câmpul „Autor” gol — pe site apare „Părinte”, nu un nume inventat.',
    empty: {
      title: 'Nicio recenzie încă',
      body: 'Adaugă recenziile primite de la părinți. Secțiunea de pe pagina principală apare doar dacă există cel puțin una.',
    },
    active: {
      on: 'Vizibilă pe site',
      off: 'Ascunsă de pe site',
    },
    delete: {
      title: 'Ștergi recenzia?',
      body: 'Recenzia dispare de pe site. Acțiunea nu poate fi anulată.',
      cta: 'Șterge recenzia',
    },
    toast: {
      created: 'Recenzia a fost adăugată.',
      updated: 'Recenzia a fost salvată.',
      deleted: 'Recenzia a fost ștearsă.',
      shown: 'Acum este vizibilă pe site.',
      hidden: 'Acum este ascunsă de pe site.',
      error: 'Acțiunea a eșuat. Încearcă din nou.',
    },
    form: {
      createTitle: 'Recenzie nouă',
      createSubtitle: 'Textul recenziei, în cele trei limbi ale site-ului.',
      editTitle: 'Editează recenzia',
      editSubtitle: 'Textul recenziei, în cele trei limbi ale site-ului.',
      quote: 'Textul recenziei',
      role: 'Context (opțional)',
      quotePlaceholderRo: 'Textul, exact cum l-a scris părintele…',
      quotePlaceholderEn: 'Traducerea în engleză…',
      quotePlaceholderRu: 'Traducerea în rusă…',
      rolePlaceholderRo: 'ex. mamă, Chișinău',
      rolePlaceholderEn: 'ex. mother, Chișinău',
      rolePlaceholderRu: 'ex. мама, Кишинёв',
      author: 'Autor',
      authorPlaceholder: 'ex. Cociu Felicia',
      authorHint:
        'Lasă gol dacă recenzia nu este semnată — pe site apare „Părinte”.',
      source: 'Sursă',
      sourcePlaceholder: 'ex. DoctorChat',
      sourceHint:
        'Platforma de pe care provine recenzia, dacă e cazul. Apare lângă autor.',
      originalHint:
        'Păstrează formularea autorului. Tradu în celelalte două limbi fără să schimbi sensul.',
      activeField: 'Vizibilă pe site',
      activeHint:
        'Ascunsă, recenzia rămâne aici, dar nu apare pe pagina principală.',
      required: 'Câmp obligatoriu',
      missingRequired: 'Completează textul recenziei în română și engleză.',
      save: 'Salvează',
      saving: 'Se salvează…',
    },
  },

  media: {
    title: 'Apariții media',
    subtitle: 'Emisiuni TV, radio și conferințe, afișate pe pagina /media.',
    refresh: 'Reîmprospătează',
    newItem: 'Apariție nouă',
    moveUp: 'Mută mai sus',
    moveDown: 'Mută mai jos',
    langRo: 'Română',
    langEn: 'Engleză',
    langRu: 'Rusă',
    /** The constraint the whole module is built around. */
    embedNote:
      'Înregistrările nu se încarcă pe site — drepturile aparțin televiziunilor. Lipești linkul publicării, iar materialul este redat de acolo, doar după ce vizitatorul apasă play.',
    noDate: 'Fără dată',
    kind: {
      tv: 'TV',
      radio: 'Radio',
      conference: 'Conferință',
      press: 'Presă scrisă',
    },
    provider: {
      youtube: 'YouTube',
      facebook: 'Facebook',
    },
    empty: {
      title: 'Nicio apariție încă',
      body: 'Adaugă emisiunile și interviurile. Lipești linkul de pe YouTube sau Facebook, iar restul completezi aici.',
    },
    active: {
      on: 'Vizibilă pe site',
      off: 'Ascunsă de pe site',
    },
    delete: {
      title: 'Ștergi apariția?',
      body: 'Apariția dispare de pe pagina /media. Înregistrarea originală rămâne, evident, neatinsă. Acțiunea nu poate fi anulată.',
      cta: 'Șterge apariția',
    },
    toast: {
      created: 'Apariția a fost adăugată.',
      updated: 'Apariția a fost salvată.',
      deleted: 'Apariția a fost ștearsă.',
      shown: 'Acum este vizibilă pe site.',
      hidden: 'Acum este ascunsă de pe site.',
      thumbFetched: 'Imaginea a fost preluată de pe YouTube.',
      thumbFetchFailed:
        'Nu am putut prelua imaginea. Încarc-o manual, din calculator.',
      thumbUploaded: 'Imaginea a fost încărcată.',
      thumbTooLarge: 'Imaginea depășește 5 MB.',
      error: 'Acțiunea a eșuat. Încearcă din nou.',
    },
    form: {
      createTitle: 'Apariție nouă',
      createSubtitle: 'Începe cu linkul publicării — restul se completează aici.',
      editTitle: 'Editează apariția',
      editSubtitle: 'Datele apariției, în cele trei limbi ale site-ului.',
      url: 'Linkul publicării',
      urlPlaceholder: 'https://www.youtube.com/watch?v=…',
      urlHint:
        'Linkul de pe YouTube sau Facebook. Din el se determină automat de unde este redat materialul.',
      urlInvalid: 'Link invalid. Folosește un link YouTube sau Facebook.',
      provider: 'Redat de pe',
      embedRef: 'Identificator video',
      embedRefHintYoutube: 'Se completează automat din link.',
      embedRefHintFacebook:
        'Permalinkul canonic al videoclipului (forma /videos/…), nu /watch/?v=…',
      kind: 'Tip',
      outlet: 'Instituția media',
      outletPlaceholder: 'ex. Moldova 1',
      show: 'Emisiunea',
      showPlaceholder: 'ex. Bună dimineața',
      date: 'Data difuzării',
      dateHint: 'Opțional. Lasă gol dacă publicarea nu are o dată anunțată.',
      duration: 'Durata',
      durationPlaceholder: 'ex. 13:19',
      title: 'Titlu',
      titlePlaceholderRo: 'ex. Inapetența la copii',
      titlePlaceholderEn: 'ex. Poor appetite in children',
      titlePlaceholderRu: 'ex. Плохой аппетит у детей',
      summary: 'Descriere',
      summaryPlaceholderRo: 'Despre ce s-a discutat…',
      summaryPlaceholderEn: 'Descrierea în engleză…',
      summaryPlaceholderRu: 'Descrierea în rusă…',
      thumb: 'Imaginea de previzualizare',
      thumbHint:
        'Se păstrează pe serverul nostru: altfel YouTube sau Facebook ar fi contactate înainte ca vizitatorul să accepte cookie-urile.',
      thumbFetch: 'Preia de pe YouTube',
      thumbUpload: 'Încarcă din calculator',
      thumbFetching: 'Se preia…',
      thumbUploading: 'Se încarcă…',
      thumbMissing: 'Adaugă o imagine de previzualizare.',
      activeField: 'Vizibilă pe site',
      activeHint:
        'Ascunsă, apariția rămâne aici, dar nu apare pe pagina /media.',
      required: 'Câmp obligatoriu',
      missingRequired:
        'Completează linkul, instituția media, titlul și descrierea în română și engleză.',
      save: 'Salvează',
      saving: 'Se salvează…',
    },
  },

  library: {
    title: 'Biblioteca digitală',
    subtitle: 'Materialele descărcabile de pe pagina /guides.',
    refresh: 'Reîmprospătează',
    newItem: 'Material nou',
    categories: 'Categorii',
    moveUp: 'Mută mai sus',
    moveDown: 'Mută mai jos',
    langRo: 'Română',
    langEn: 'Engleză',
    langRu: 'Rusă',
    /** The state the whole library is in right now — worth stating plainly. */
    missingFilesNote: (n: number) =>
      n === 1
        ? 'Un material nu are încă fișier atașat: pe site apare „În curând”, fără link de descărcare.'
        : `${n} materiale nu au încă fișier atașat: pe site apar „În curând”, fără link de descărcare.`,
    noFile: 'Fără fișier',
    allAges: 'Toate vârstele',
    access: {
      free: 'Gratuit',
      paid: 'Cu plată',
    },
    flag: {
      recommended: 'Recomandat',
      popular: 'Popular',
      new: 'Nou',
    },
    age: {
      '0-6m': '0–6 luni',
      '6-12m': '6–12 luni',
      '1-3y': '1–3 ani',
      '3-6y': '3–6 ani',
      '6-12y': '6–12 ani',
      adolescent: 'Adolescent',
    },
    empty: {
      title: 'Niciun material încă',
      body: 'Adaugă ghidurile și materialele PDF. Poți crea fișa acum și încărca fișierul mai târziu.',
    },
    active: {
      on: 'Vizibil pe site',
      off: 'Ascuns de pe site',
    },
    delete: {
      title: 'Ștergi materialul?',
      body: 'Materialul dispare din bibliotecă. Acțiunea nu poate fi anulată.',
      cta: 'Șterge materialul',
    },
    toast: {
      created: 'Materialul a fost adăugat.',
      updated: 'Materialul a fost salvat.',
      deleted: 'Materialul a fost șters.',
      shown: 'Acum este vizibil pe site.',
      hidden: 'Acum este ascuns de pe site.',
      fileUploaded: 'Fișierul a fost încărcat.',
      fileTooLarge: 'Fișierul depășește 20 MB.',
      fileType: 'Sunt acceptate doar fișiere PDF, DOC sau DOCX.',
      categoryCreated: 'Categoria a fost adăugată.',
      categoryUpdated: 'Categoria a fost salvată.',
      categoryDeleted: 'Categoria a fost ștearsă.',
      categoryInUse:
        'Categoria are materiale. Mută-le în altă categorie înainte de a o șterge.',
      error: 'Acțiunea a eșuat. Încearcă din nou.',
    },
    form: {
      createTitle: 'Material nou',
      createSubtitle: 'Fișa materialului, în cele trei limbi ale site-ului.',
      editTitle: 'Editează materialul',
      editSubtitle: 'Fișa materialului, în cele trei limbi ale site-ului.',
      slug: 'Adresa (slug)',
      slugPlaceholder: 'ex. febra-la-copii',
      slugHint:
        'Litere mici, fără diacritice, cuvinte legate prin liniuță. Nu o schimba după publicare — linkurile deja trimise se rup.',
      slugInvalid: 'Doar litere mici, cifre și liniuțe.',
      slugTaken: 'Există deja un material cu această adresă.',
      category: 'Categorie',
      ages: 'Vârste',
      agesHint: 'Nimic bifat = materialul apare la orice vârstă.',
      title: 'Titlu',
      description: 'Descriere',
      titlePlaceholderRo: 'ex. Febra la copii — ghid pas cu pas',
      titlePlaceholderEn: 'ex. Fever in children — a step-by-step guide',
      titlePlaceholderRu: 'ex. Температура у детей — пошаговый гайд',
      descriptionPlaceholderRo: 'Ce conține materialul…',
      descriptionPlaceholderEn: 'Descrierea în engleză…',
      descriptionPlaceholderRu: 'Descrierea în rusă…',
      file: 'Fișierul',
      fileHint:
        'PDF, DOC sau DOCX, până la 20 MB. Poți salva fișa și fără fișier — pe site va apărea „În curând”.',
      fileUpload: 'Încarcă fișierul',
      fileUploading: 'Se încarcă…',
      fileReplace: 'Înlocuiește',
      fileRemove: 'Elimină fișierul',
      pageCount: 'Număr de pagini',
      fileLang: 'Limba fișierului',
      fileLangPlaceholder: 'ex. RO',
      accessField: 'Acces',
      price: 'Preț (€)',
      priceHint:
        'Deocamdată plata nu se face pe site: butonul duce clientul la pagina de contact.',
      flags: 'Etichete',
      activeField: 'Vizibil pe site',
      activeHint:
        'Ascuns, materialul rămâne aici, dar nu apare în bibliotecă.',
      required: 'Câmp obligatoriu',
      missingRequired:
        'Completează adresa, titlul și descrierea în română și engleză.',
      save: 'Salvează',
      saving: 'Se salvează…',
    },
    categoryForm: {
      title: 'Categoriile bibliotecii',
      subtitle:
        'Grupele după care se filtrează materialele pe pagina publică.',
      nameRo: 'Nume (RO)',
      nameEn: 'Nume (EN)',
      nameRu: 'Nume (RU)',
      add: 'Adaugă categoria',
      adding: 'Se adaugă…',
      count: (n: number) =>
        n === 1 ? 'un material' : `${n} materiale`,
      empty: 'Nicio categorie încă.',
      required: 'Câmp obligatoriu',
      close: 'Închide',
    },
  },
} as const;

export type Dictionary = typeof ro;
