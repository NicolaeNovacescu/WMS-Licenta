import type { DeepPartialMessages } from "@/lib/i18n/messages";

export const ro: DeepPartialMessages = {
  common: {
    unknownRole: "Necunoscut",
    openPage: "Deschide pagina",
    working: "Se proceseaza...",
    yes: "Da",
    no: "Nu",
    backendUnavailable: "Backend indisponibil",
    notes: "Note",
    quantity: "Cantitate",
    performed: "Efectuat",
    performedBy: "Efectuat de",
    reference: "Referinta",
    source: "Sursa",
    destination: "Destinatie",
    notRecorded: "Neinregistrat",
    notLinked: "Nelinkat",
    states: {
      active: "Activ",
      inactive: "Inactiv",
      blocked: "Blocat",
      unblocked: "Neblocat",
      occupied: "Ocupat",
      empty: "Gol",
      selectable: "Selectabil",
      notSelectableWhileInactive: "Neselectabil cat timp este inactiv",
    },
  },
  roles: {
    Sales: "Vanzari",
    Warehouse: "Depozit",
    Admin: "Admin",
  },
  localeSwitcher: {
    label: "Limba",
    english: "Engleza",
    romanian: "Romana",
    englishShort: "EN",
    romanianShort: "RO",
  },
  navigation: {
    sections: {
      overview: "Privire generala",
      visibility: "Vizibilitate",
      operations: "Operatiuni",
      management: "Administrare",
    },
    items: {
      dashboard: {
        label: "Tablou de bord",
        summary: "Punct de pornire adaptat rolului pentru spatiul autentificat.",
      },
      barcodeLookup: {
        label: "Cautare cod de bare",
        summary:
          "Cautare asistata manual, cu potrivire exacta, pentru produsele existente.",
      },
      products: {
        label: "Produse",
        summary:
          "Vizibilitate catalog, detalii si fluxuri administrative pentru date master.",
      },
      customers: {
        label: "Clienti",
        summary:
          "Administrare date master clienti doar pentru Admin, folosita la redactarea comenzilor de vanzare.",
      },
      suppliers: {
        label: "Furnizori",
        summary:
          "Administrare date master furnizori doar pentru Admin, folosita la redactarea documentelor de intrare.",
      },
      warehouseMap: {
        label: "Harta depozitului",
        summary:
          "Harta depozitului in regim doar citire, cu ierarhia structurii si vizibilitate pe stocul din locatii.",
      },
      warehouseSetup: {
        label: "Configurare depozit",
        summary: "Creeaza si mentine depozite, zone si locatii.",
      },
      inventory: {
        label: "Stoc",
        summary: "Stoc disponibil si vizibilitate a stocului in functie de locatie.",
      },
      inboundOrders: {
        label: "Comenzi de intrare",
        summary: "Planificarea marfii asteptate si pregatirea receptiilor.",
      },
      receipts: {
        label: "Receptii",
        summary: "Executia receptiilor inainte de fluxul ulterior de putaway.",
      },
      putawayTasks: {
        label: "Taskuri de putaway",
        summary:
          "Miscarea post-receptie din zona de receiving catre stocare finala sau picking.",
      },
      transferTasks: {
        label: "Taskuri de transfer",
        summary:
          "Miscarea interna a stocului intre locatii normale, care nu sunt de receiving.",
      },
      replenishmentRules: {
        label: "Reguli de replenishment",
        summary:
          "Praguri administrate de Admin pentru momentul in care stocul de picking trebuie refacut.",
      },
      salesOrders: {
        label: "Comenzi de vanzare",
        summary:
          "Introducere cerere si vizibilitate pe rezervari inainte de picking sau expediere.",
      },
      pickingTasks: {
        label: "Taskuri de picking",
        summary:
          "Executia cererii rezervate inainte ca fluxul de expediere sa fie finalizat.",
      },
      shipments: {
        label: "Expedieri",
        summary: "Scaderea finala pe iesire din cerere pickata explicit.",
      },
      replenishmentTasks: {
        label: "Taskuri de replenishment",
        summary:
          "Lucru manual de replenishment bazat pe regulile de picking administrate de Admin.",
      },
      inventoryCounts: {
        label: "Inventare",
        summary:
          "Flux explicit de inventariere cu vizibilitate pe cantitatea asteptata, numarata si varianta.",
      },
      auditLogs: {
        label: "Jurnal audit",
        summary: "Trasabilitate business append-only pentru actiunile importante din fluxuri.",
      },
      users: {
        label: "Utilizatori",
        summary:
          "Administrare operationala a utilizatorilor doar pentru Admin, peste modelul actual de autentificare.",
      },
    },
    hidden: {
      productDetails: {
        label: "Detalii produs",
        summary:
          "Detalii pentru produsul selectat si fluxul administrativ de mentenanta.",
      },
      customerDetails: {
        label: "Detalii client",
        summary: "Detalii client si mentenanta a starii de activare doar pentru Admin.",
      },
      supplierDetails: {
        label: "Detalii furnizor",
        summary:
          "Detalii furnizor si mentenanta a starii de activare doar pentru Admin.",
      },
      inboundOrderDetails: {
        label: "Detalii comanda de intrare",
        summary:
          "Detalii document de intrare, mentenanta de Admin si pregatirea receptiilor.",
      },
      locations: {
        label: "Locatii",
        summary: "Lista de locatii, vizibilitate pe stare si detaliere.",
      },
      locationDetails: {
        label: "Detalii locatie",
        summary: "Vizualizare detaliata a locatiei din depozit, cu coordonate si stare.",
      },
      receiptDetails: {
        label: "Detalii receptie",
        summary:
          "Detalii receptie cu tranzitii de flux si linii din zona de receiving.",
      },
      putawayTaskDetails: {
        label: "Detalii task putaway",
        summary:
          "Detalii task de putaway cu sursa, destinatie si stare de executie.",
      },
      transferTaskDetails: {
        label: "Detalii task transfer",
        summary:
          "Detalii task de transfer cu sursa interna, destinatie si stare de executie.",
      },
      replenishmentRuleDetails: {
        label: "Detalii regula replenishment",
        summary:
          "Detalii si mentenanta pentru regula de praguri de picking administrata de Admin.",
      },
      replenishmentTaskDetails: {
        label: "Detalii task replenishment",
        summary:
          "Detalii task manual de replenishment cu sursa, tinta si stare de executie.",
      },
      salesOrderDetails: {
        label: "Detalii comanda de vanzare",
        summary:
          "Detalii comanda de vanzare cu rezultatele rezervarii si actiuni adaptate rolului.",
      },
      pickingTaskDetails: {
        label: "Detalii task picking",
        summary:
          "Detalii task de picking cu linii de cerere rezervata si stare de executie a pickingului.",
      },
      shipmentDetails: {
        label: "Detalii expediere",
        summary:
          "Detalii expediere cu legatura la cererea pickata si stare de finalizare pe iesire.",
      },
      inventoryCountDetails: {
        label: "Detalii inventar",
        summary:
          "Detalii inventar cu cantitatea asteptata, cantitatea numarata, varianta si starea fluxului.",
      },
      auditLogDetails: {
        label: "Detalii jurnal audit",
        summary:
          "Detaliu business in regim doar citire pentru o singura inregistrare append-only.",
      },
      userDetails: {
        label: "Detalii utilizator",
        summary:
          "Detalii utilizator doar pentru Admin, cu asignare de roluri si gestionarea starii de acces.",
      },
      warehouseSetup: {
        label: "Configurare depozit",
        summary: "Zona de configurare Admin pentru depozite, zone si locatii.",
      },
    },
  },
  shell: {
    topbar: {
      toggleNavigation: "Comuta navigarea",
      defaultLabel: "Spatiu de lucru",
      defaultSummary: "Aplicatie WMS autentificata",
    },
    sidebar: {
      title: "Spatiu de lucru autentificat",
      description:
        "Navigarea ramane adaptata rolului, astfel incat fiecare utilizator sa vada doar zonele care corespund responsabilitatilor aprobate.",
      signedInAs: "Autentificat ca",
      roleCountSingular: "{count} rol",
      roleCountPlural: "{count} roluri",
    },
    logout: {
      idle: "Deconectare",
      pending: "Se inchide sesiunea...",
    },
  },
  auth: {
    heroTitle:
      "Acces adaptat rolului pentru un sistem WMS construit in jurul claritatii.",
    heroDescription:
      "Frontend-ul foloseste acum API-ul existent de autentificare din backend pentru a proteja spatiul de lucru, a incarca utilizatorul curent si a mentine navigarea aliniata responsabilitatilor aprobate pentru fiecare rol.",
    roleHighlights: {
      Sales:
        "Vizibilitate pe catalog, stoc disponibil si introducerea comenzilor de vanzare.",
      Warehouse:
        "Receptii, executia miscarilor, picking, replenishment si inventare.",
      Admin:
        "Produse, configurarea intrarilor, utilizatori, vizibilitate audit si structura depozitului.",
    },
    foundationNotesEyebrow: "Note despre fundatie",
    foundationNotes: [
      "Doar utilizatorii autentificati pot accesa paginile protejate.",
      "Navigarea se schimba in functie de rol, astfel incat operatorii sa nu vada module irelevante.",
      "Navigarea protejata ramane aliniata cu rolul operational al utilizatorului.",
    ],
    signInEyebrow: "Autentificare",
    signInTitle: "Continua catre shell-ul protejat al aplicatiei.",
    signInDescription:
      "Foloseste un cont activ din magazia de autentificare a backend-ului. O autentificare reusita incarca bara laterala adaptata rolului si rutele protejate.",
    userNameLabel: "Nume utilizator",
    passwordLabel: "Parola",
    passwordPlaceholder: "Introdu parola",
    submitIdle: "Autentificare",
    submitPending: "Se autentifica...",
    errors: {
      requiredFields: "Numele de utilizator si parola sunt obligatorii.",
      invalidCredentials:
        "Numele de utilizator sau parola sunt invalide ori contul este inactiv.",
      generic: "Autentificarea nu este disponibila acum.",
    },
  },
  accessDenied: {
    eyebrow: "Acces restrictionat",
    titleTemplate:
      "{title} nu este disponibil pentru setul tau curent de roluri.",
    description:
      "Shell-ul autentificat este activ, dar aceasta pagina este ascunsa pentru rolul tau. Astfel, navigarea ramane aliniata responsabilitatilor aprobate si nu expune ecrane care nu apartin profilului operatorului curent.",
    yourRoles: "Rolurile tale",
    allowedRoles: "Roluri permise",
  },
  workflowStatus: {
    inboundOrder: {
      Draft: "Ciorna",
      ReadyForReceipt: "Pregatita pentru receptie",
      PartiallyReceived: "Receptionata partial",
      FullyReceived: "Receptionata complet",
      Cancelled: "Anulata",
    },
    receipt: {
      Draft: "Ciorna",
      InProgress: "In desfasurare",
      Confirmed: "Confirmata",
      Cancelled: "Anulata",
    },
    salesOrder: {
      Draft: "Ciorna",
      Confirmed: "Confirmata",
      PartiallyReserved: "Rezervata partial",
      FullyReserved: "Rezervata complet",
      Cancelled: "Anulata",
    },
    inventoryCount: {
      Draft: "Ciorna",
      InProgress: "In desfasurare",
      Completed: "Finalizata",
      Cancelled: "Anulata",
    },
    execution: {
      Pending: "In asteptare",
      InProgress: "In desfasurare",
      Completed: "Finalizat",
      Cancelled: "Anulat",
    },
  },
  dashboard: {
    header: {
      eyebrow: "Tablou operational",
      title:
        "Privire generala adaptata rolului asupra starii curente a depozitului si a business-ului",
      description:
        "Acest tablou rezuma modelele curente de citire WMS si te directioneaza catre paginile corecte de flux.",
    },
    quickLinks: {
      eyebrow: "Navigare rapida",
      title: "Deschide pagina de flux potrivita pentru semnalul curent",
      description:
        "Aceste linkuri raman limitate la rutele pe care rolul curent le poate accesa deja. Foloseste-le pentru a trece de la privirea generala la ecranele operationale dedicate, fara a transforma tabloul de bord intr-o suprafata de editare.",
      emptyTitle: "Nu exista linkuri rapide disponibile.",
      emptyMessage:
        "Nu au fost vizibile elemente de navigare protejata pentru rolul curent.",
    },
    recentActivity: {
      eyebrow: "Activitate recenta",
      title: "Urma compacta de audit pentru actiunile business recente",
      description:
        "Aceasta este o privire scurta, doar pentru Admin, asupra jurnalului de audit append-only; nu este un al doilea ecran de audit si nici registrul de stoc.",
      emptyTitle: "Nu exista inregistrari recente de audit.",
      emptyMessage:
        "Activitatea recenta va aparea aici dupa ce actiunile business reusite sunt inregistrate prin fundatia existenta de jurnal audit.",
    },
    section: {
      emptyTitle: "Nu exista date sumare vizibile.",
      emptyMessage:
        "Nimic din aceasta sectiune de privire generala nu este disponibil momentan pentru rolul tau sau pentru raspunsul curent din backend.",
      emptyEyebrow: "Stare tablou",
      openPage: "Deschide pagina",
      inventory: {
        eyebrow: "Privire generala stoc",
        title: "Pozitionarea curenta a stocului si starea locatiilor",
        description:
          "Vizibilitatea stocului este rezumata din modelele existente de citire pentru locatii si balante. Aceasta este o suprafata de privire generala si nu inlocuieste registrul de stoc.",
      },
      inventorySales: {
        title: "Disponibilitate curenta la nivel de produs",
        description:
          "Vizibilitatea pentru Vanzari ramane limitata la nivel de produs. Aceasta privire generala evidentiaza disponibilitatea curenta si presiunea cererii pe iesire, fara a expune detalii restrictionate despre locatii.",
      },
      inbound: {
        eyebrow: "Privire generala intrari",
        title: "Documentele curente de intrare si progresul receptiilor",
        description:
          "Rezumatul intrarilor ramane doar in regim de citire si reflecta starea curenta a fluxurilor de planificare si receptie deja implementate in alta parte.",
      },
      internal: {
        eyebrow: "Operatiuni interne",
        title: "Executia din depozit in fluxurile de miscare si control",
        description:
          "Aceste rezumate reflecta starea curenta a lucrului operational din depozit deja implementat pe pagini dedicate de flux.",
      },
      outbound: {
        eyebrow: "Privire generala iesiri",
        title: "Starea cererii, a pickingului si a expedierilor",
        description:
          "Rezumatul iesirilor ramane doar in regim de citire si directioneaza utilizatorii catre paginile existente de vanzari, picking si expediere pentru detalii complete.",
      },
    },
    metrics: {
      balanceRows: {
        label: "Randuri de balanta",
        helper: "randuri brute de stoc produs-locatie vizibile in prezent",
      },
      occupiedLocations: {
        label: "Locatii ocupate",
        helper: "locatii care contin in prezent stoc on-hand",
        highlightHelper: "pozitii curente care contin stoc on-hand",
      },
      emptyLocations: {
        label: "Locatii goale",
        helper: "pozitii configurate fara stoc on-hand curent",
      },
      attentionLocations: {
        label: "Locatii cu atentie",
        helper: "locatii inactive sau blocate, inca vizibile in structura",
      },
      visibleProducts: {
        label: "Produse vizibile",
        helper: "rezumate de stoc la nivel de produs vizibile in prezent",
      },
      availableNow: {
        label: "Disponibile acum",
        helper: "produse cu o anumita cantitate disponibila in prezent",
      },
      unavailable: {
        label: "Indisponibile",
        helper: "produse fara cantitate disponibila in prezent",
      },
      demandPressure: {
        label: "Presiune de cerere",
        helper: "produse care au cerere rezervata sau deja pickata",
        highlightHelper: "produse care au cerere rezervata sau pickata",
      },
      availableProducts: {
        label: "Produse disponibile",
        helper: "rezumate de produs cu o anumita disponibilitate vizibila",
      },
      inboundOrders: {
        label: "Comenzi de intrare",
        helper:
          "documente vizibile in prezent in planificarea intrarilor",
      },
      awaitingReceipt: {
        label: "In asteptarea receptiei",
        helper: "comenzi pregatite pentru receptie sau receptionate partial",
      },
      fullyReceived: {
        label: "Receptionate complet",
        helper: "documente de intrare deja finalizate prin executia receptiei",
      },
      openReceipts: {
        label: "Receptii deschise",
        helper: "documente de receptie care asteapta inca confirmarea",
      },
      receiptsInProgress: {
        label: "Receptii in desfasurare",
        helper: "documente de receptie executate in prezent",
      },
      openWork: {
        label: "Lucru deschis",
        helper: "documente interne din depozit aflate in asteptare sau active",
      },
      inProgress: {
        label: "In desfasurare",
        helper: "lucru intern din depozit aflat in executie",
      },
      completed: {
        label: "Finalizate",
        helper: "documente deja finalizate in fluxurile interne",
      },
      cancelled: {
        label: "Anulate",
        helper: "documente oprite intentionat inainte de finalizare",
      },
      activeSalesOrders: {
        label: "Comenzi de vanzare active",
        helper:
          "documente de cerere vizibile, inca relevante pentru operatiuni",
        highlightHelper: "documente de cerere vizibile, inca active",
      },
      fullyReserved: {
        label: "Rezervate complet",
        helper: "comenzi a caror cerere curenta este rezervata complet",
      },
      awaitingCompletion: {
        label: "In asteptarea finalizarii",
        helper:
          "comenzi vizibile care nu sunt inca rezervate complet sau anulate",
      },
      openPickingTasks: {
        label: "Taskuri picking deschise",
        helper:
          "taskuri de cerere rezervata care asteapta finalizarea in depozit",
      },
      openShipments: {
        label: "Expedieri deschise",
        helper: "documente de expediere care asteapta finalizarea pe iesire",
      },
      inboundAttention: {
        label: "Atentie pe intrari",
        helper:
          "documente de intrare vizibile care asteapta progres in depozit",
      },
      warehouseWorkOpen: {
        label: "Lucru deschis in depozit",
        helper: "documente interne din depozit aflate in asteptare sau active",
      },
      outboundWorkOpen: {
        label: "Lucru deschis pe iesire",
        helper:
          "documente de picking si expediere care asteapta finalizarea",
      },
    },
    statusGroups: {
      inboundOrders: {
        title: "Comenzi de intrare",
        summary: "Starea planificarii pentru documentele de intrare.",
      },
      receipts: {
        title: "Receptii",
        summary: "Executia receptiilor vizibila pentru acest rol.",
      },
      putawayTasks: {
        title: "Taskuri de putaway",
        summary: "Miscari post-receptie din zona de receiving.",
      },
      transferTasks: {
        title: "Taskuri de transfer",
        summary: "Relocare interna intre locatii care nu sunt de receiving.",
      },
      replenishmentTasks: {
        title: "Taskuri de replenishment",
        summary: "Executie manuala pentru refacerea stocului de picking.",
      },
      inventoryCounts: {
        title: "Inventare",
        summary: "Documente de control al stocului cu asteptat versus numarat.",
      },
      salesOrders: {
        title: "Comenzi de vanzare",
        summary:
          "Vizibilitate pe cerere inainte sau alaturi de executia din depozit.",
      },
      pickingTasks: {
        title: "Taskuri de picking",
        summary: "Executia cererii rezervate inainte de expediere.",
      },
      shipments: {
        title: "Expedieri",
        summary: "Scaderea finala pe iesire din cererea pickata explicit.",
      },
    },
    dataLabels: {
      productInventory: "Stoc pe produse",
      rawInventoryBalances: "Balante brute de stoc",
      warehouseLocations: "Locatii din depozit",
      inboundOrders: "Comenzi de intrare",
      receipts: "Receptii",
      putawayTasks: "Taskuri de putaway",
      transferTasks: "Taskuri de transfer",
      replenishmentTasks: "Taskuri de replenishment",
      salesOrders: "Comenzi de vanzare",
      pickingTasks: "Taskuri de picking",
      shipments: "Expedieri",
      inventoryCounts: "Inventare",
      auditLog: "Jurnal audit",
      loadFailedTemplate: "Nu s-au putut incarca datele pentru {label}",
    },
    audit: {
      unknownActor: "Context necunoscut/de sistem",
    },
  },
  inventory: {
    route: {
      unavailableEyebrow: "Stoc indisponibil",
      unavailableTitle: "Vizibilitatea stocului nu a putut fi incarcata",
      unavailableFallback:
        "Backend-ul nu a returnat un raspuns utilizabil pentru stoc.",
    },
    header: {
      eyebrow: "Vizibilitate stoc",
      title:
        "Vizibilitate doar in regim de citire, bazata pe cantitati explicite",
      description:
        "Aceasta pagina foloseste direct endpoint-urile protejate de stoc din backend. Disponibilitatea la nivel de produs este vizibila pentru toate rolurile aprobate, iar vizualizarile pe locatie, balante brute si istoric de miscari raman limitate la operatorii de depozit si Admin.",
    },
    views: {
      product: "Pe produs",
      location: "Pe locatie",
      balance: "Randuri de balanta",
      movement: "Istoric miscari",
    },
    export: {
      productLabel: "Exporta snapshot pe produse",
      locationLabel: "Exporta snapshot pe locatii",
      balanceLabel: "Exporta snapshot de balanta",
      emptyLabel: "Nu exista randuri pentru export",
      columns: {
        productSku: "SKU produs",
        productName: "Nume produs",
        onHand: "On hand",
        reserved: "Rezervat",
        picked: "Pickat",
        available: "Disponibil",
        updatedAt: "Actualizat la",
        warehouse: "Depozit",
        zone: "Zona",
        locationCode: "Cod locatie",
        locationName: "Nume locatie",
        locationType: "Tip locatie",
        locationActive: "Locatie activa",
        locationBlocked: "Locatie blocata",
      },
    },
    filters: {
      searchLabel: "Cautare",
      searchPlaceholderProduct: "Cauta dupa SKU sau nume produs",
      searchPlaceholderLocation:
        "Cauta dupa depozit, zona, locatie sau tip",
      searchPlaceholderBalance: "Cauta dupa produs sau locatie",
      searchPlaceholderMovement:
        "Cauta dupa produs, locatie, referinta sau note",
      locationStateLabel: "Stare locatie",
      locationStates: {
        all: "Toate locatiile",
        active: "Doar active",
        inactive: "Doar inactive",
        blocked: "Doar blocate",
        unblocked: "Doar neblocate",
      },
      resultsLabel: "Rezultate",
      resultsTemplate: "Se afiseaza {filtered} din {total}",
    },
    summary: {
      productsVisible: "Produse vizibile",
      onHand: "On hand",
      reserved: "Rezervat",
      available: "Disponibil",
      availabilityRuleLabel: "Regula disponibilitate",
      availabilityRuleBody:
        "cantitatea disponibila este derivata din on hand minus rezervat.",
      locationAwareTemplate:
        "Vizibilitatea dependenta de locatie acopera acum {count} locatii de stoc.",
      salesVisibilityNote:
        "Vizibilitatea pentru Vanzari ramane la nivel de produs.",
    },
    productView: {
      emptyEyebrow: "Fara randuri pe produse",
      emptyMessage:
        "Niciun rand de stoc pe produs nu s-a potrivit cu filtrele curente.",
      derivedBadge: "Disponibilul este derivat",
      openProduct: "Deschide produsul",
      updatedTemplate: "Actualizat {value}",
    },
    locationView: {
      unavailableTitle: "Stocul pe locatii este indisponibil",
      emptyEyebrow: "Fara randuri pe locatii",
      emptyMessage:
        "Niciun rand de stoc pe locatie nu s-a potrivit cu filtrele curente.",
      openLocation: "Deschide locatia",
      updatedTemplate: "Actualizat {value}",
    },
    balanceView: {
      unavailableTitle: "Randurile de balanta sunt indisponibile",
      emptyEyebrow: "Fara randuri de balanta",
      emptyMessage:
        "Niciun rand de balanta nu s-a potrivit cu filtrele curente.",
      productSection: "Produs",
      locationSection: "Locatie",
      balanceRowBadge: "Rand de balanta",
      updatedTemplate: "Actualizat {value}",
    },
    movementHistory: {
      filters: {
        product: "Produs",
        location: "Locatie",
        movementType: "Tip miscare",
        allProducts: "Toate produsele",
        allLocations: "Toate locatiile",
        allMovementTypes: "Toate tipurile de miscare",
      },
      types: {
        Addition: "Adaugare",
        Removal: "Scadere",
        Relocation: "Relocare",
      },
      unavailableTitle: "Istoricul de miscari este indisponibil",
      emptyEyebrow: "Fara randuri de miscari",
      emptyMessage:
        "Niciun rand de miscare nu s-a potrivit cu filtrele curente pentru istoric.",
      noSourceLocation: "Fara locatie sursa",
      noDestinationLocation: "Fara locatie destinatie",
      notRecorded: "Neinregistrat",
      notLinked: "Nelinkat",
    },
  },
  warehouseMap: {
    route: {
      unavailableEyebrow: "Harta indisponibila",
      unavailableTitle: "Harta depozitului nu a putut fi incarcata.",
      unavailableFallback:
        "Backend-ul nu a returnat un raspuns utilizabil pentru harta depozitului.",
    },
    header: {
      eyebrow: "Harta depozitului",
      title:
        "Structura si pozitionarea stocului in regim doar citire in tot depozitul",
      openSetup: "Administreaza structura",
      description:
        "Aceasta pagina este o suprafata de vizibilitate construita din structura curenta a depozitului si balantele de stoc. Arata ierarhia depozit-zona-locatie, evidentiaza pozitiile goale fata de cele ocupate si pastreaza explicite starile de blocat sau inactiv fara sa schimbe stocul.",
    },
    metrics: {
      warehouses: "Depozite",
      zones: "Zone",
      occupiedLocations: "Locatii ocupate",
      productSlots: "Sloturi de produs",
      visibleTemplate: "{visible} vizibile / {total} total",
    },
    filters: {
      searchLabel: "Cautare",
      searchPlaceholder: "Depozit, zona, locatie, tip sau produs",
      warehouseLabel: "Depozit",
      allWarehouses: "Toate depozitele",
      zoneLabel: "Zona",
      allZones: "Toate zonele",
      occupancyLabel: "Ocupare",
      allLocations: "Toate locatiile",
      occupiedOnly: "Doar ocupate",
      emptyOnly: "Doar goale",
      statusLabel: "Stare",
      allStates: "Toate starile",
      activeOnly: "Doar active",
      inactiveOnly: "Doar inactive",
      blockedOnly: "Doar blocate",
      unblockedOnly: "Doar neblocate",
    },
    empty: {
      eyebrow: "Stare harta",
      title: "Nicio locatie nu s-a potrivit cu filtrele curente.",
      message:
        "Incearca sa largesti filtrele de depozit, zona, ocupare sau stare pentru a readuce in vizualizare mai multa structura.",
    },
    warehouse: {
      statusDescription:
        "Structurata pe zone si pe ocuparea curenta a locatiilor. Aceasta ramane o harta doar de vizibilitate si nu schimba stocul.",
      visibleZones: "Zone vizibile",
      visibleLocations: "Locatii vizibile",
      occupied: "Ocupate",
    },
    zone: {
      coordinateDescription:
        "Harta locatiilor bazata pe coordonate. Celulele goale indica faptul ca nu exista o locatie configurata la acea coordonata in vizualizarea curenta.",
      visibleLocations: "Locatii vizibile",
      occupied: "Ocupate",
      sharedCells: "Celule partajate",
      rowLabel: "Rand",
      columnTemplate: "Col {column}",
      emptyCell: "Celula goala",
      emptyCellTemplate:
        "Nu exista locatie configurata la randul {row}, coloana {column}.",
      sharedCellTemplate: "{count} locatii impart aceeasi celula",
      productRows: "Randuri produs",
      onHand: "On hand",
      available: "Disponibil",
      picked: "Pickat",
    },
    detail: {
      eyebrow: "Detaliu locatie",
      titleSelectedTemplate: "Snapshot {code}",
      titleEmpty: "Selecteaza o locatie",
      description:
        "Acest panou ramane doar in regim de citire si rezuma starea curenta a locatiei plus randurile de stoc vizibile. Nu modifica structura sau inventarul.",
      noSelectionTitle: "Nicio locatie selectata.",
      noSelectionMessage:
        "Alege o locatie din harta pentru a inspecta ierarhia, starea si stocul curent intr-un singur loc.",
      coordinates: "Coordonate",
      balanceRows: "Randuri de balanta",
      onHand: "On hand",
      available: "Disponibil",
      reserved: "Rezervat",
      picked: "Pickat",
      lastUpdatedTemplate: "Ultima actualizare {value}",
      noBalanceRows:
        "Nu exista in prezent randuri de balanta stocate pentru aceasta locatie.",
      locationEmptyTitle: "Locatia este goala.",
      locationEmptyMessage:
        "Nu exista randuri curente de balanta in aceasta locatie.",
      visibleStockRows: "Randuri de stoc vizibile",
    },
  },
  warehouseSetup: {
    route: {
      unavailableEyebrow: "Configurare indisponibila",
      unavailableTitle:
        "Datele pentru configurarea depozitului nu au putut fi incarcate.",
      unavailableFallback:
        "Backend-ul nu a returnat datele necesare pentru configurare.",
    },
    header: {
      eyebrow: "Configurare depozit",
      title: "Mentenanta Admin pentru structura reala a depozitului",
      description:
        "Mentine depozitele, zonele si locatiile intr-un singur flux practic de administrare. Aceste inregistrari de structura alimenteaza harta depozitului si suprafetele de vizibilitate pe locatii, dar aceasta pagina nu muta stoc si nu devine un designer vizual de layout.",
      openWarehouseMap: "Deschide harta depozitului",
      openLocations: "Deschide locatiile",
      metrics: {
        warehouses: "Depozite",
        zones: "Zone",
        locations: "Locatii",
      },
    },
    sections: {
      warehouses: {
        eyebrow: "Depozite",
        title: "Administrare depozite",
        description:
          "Creeaza si actualizeaza identitatea depozitului plus starea activa fara sa parasesti fluxul de configurare.",
      },
      zones: {
        eyebrow: "Zone",
        title: "Administrare zone",
        description:
          "Mentine alocarea la depozit, identitatea zonei si starea activa in aceeasi pagina care sustine ierarhia hartii.",
      },
      locations: {
        eyebrow: "Locatii",
        title: "Administrare locatii",
        description:
          "Creeaza si actualizeaza locatii, pastreaza coordonatele pe harta explicite si controleaza starea activa plus blocata fara sa parasesti pagina de configurare Admin.",
      },
    },
    editor: {
      create: "Creare",
      update: "Actualizare",
      warehouseToEdit: "Depozit de editat",
      zoneToEdit: "Zona de editat",
      locationToEdit: "Locatie de editat",
      noWarehouses: "Nu exista depozite disponibile",
      noZones: "Nu exista zone disponibile",
      noLocations: "Nu exista locatii disponibile",
      firstWarehouseMessage:
        "Creeaza primul depozit pentru a debloca editarea depozitelor aici.",
      firstZoneMessage:
        "Creeaza prima zona pentru a debloca editarea zonelor aici.",
      firstLocationMessage:
        "Creeaza prima locatie pentru a debloca editarea locatiilor aici.",
      rowColumnTemplate: "Rand {row}, Col {column}",
    },
    forms: {
      saving: "Se salveaza...",
      warehouseCode: "Cod depozit",
      warehouseName: "Nume depozit",
      warehouseIsActive: "Depozitul este activ",
      createWarehouse: "Creeaza depozit",
      saveWarehouse: "Salveaza depozit",
      zoneWarehouse: "Depozit",
      selectWarehouse: "Selecteaza un depozit",
      zoneCode: "Cod zona",
      zoneName: "Nume zona",
      zoneIsActive: "Zona este activa",
      createZone: "Creeaza zona",
      saveZone: "Salveaza zona",
      locationWarehouse: "Depozit",
      locationZone: "Zona",
      selectZone: "Selecteaza o zona",
      locationCode: "Cod locatie",
      locationName: "Nume locatie",
      locationType: "Tip locatie",
      mapRow: "Rand harta",
      mapColumn: "Coloana harta",
      locationIsActive: "Locatia este activa",
      createLocation: "Creeaza locatie",
      saveLocation: "Salveaza modificari",
      locationTypes: {
        PICKING: "Picking",
        BULK: "Bulk",
        RECEIVING: "Receiving",
        STAGING: "Staging",
      },
      blockStateTitle: "Stare blocare",
      blockStateDescription:
        "Pastreaza explicita starea blocat versus neblocat pentru operatiunile ulterioare din depozit si pentru harta depozitului.",
      blockLocation: "Blocheaza locatia",
      unblockLocation: "Deblocheaza locatia",
      validation: {
        warehouseRequired:
          "Codul depozitului si numele depozitului sunt obligatorii.",
        zoneRequired:
          "Depozitul, codul zonei si numele zonei sunt obligatorii.",
        locationRequired:
          "Depozitul, zona, codul, numele si tipul locatiei sunt obligatorii.",
        mapWholeNumbers:
          "Randul si coloana de pe harta trebuie sa fie numere intregi.",
      },
      success: {
        warehouseCreated: "Depozitul {code} a fost creat.",
        warehouseUpdated: "Depozitul {code} a fost actualizat.",
        zoneCreated: "Zona {code} a fost creata.",
        zoneUpdated: "Zona {code} a fost actualizata.",
        locationCreated: "Locatia {code} a fost creata.",
        locationUpdated: "Locatia {code} a fost actualizata.",
        locationBlocked: "Locatia este acum blocata.",
        locationUnblocked: "Locatia este acum deblocata.",
      },
      errors: {
        createWarehouse: "Depozitul nu poate fi creat acum.",
        createZone: "Zona nu poate fi creata acum.",
        updateWarehouse: "Depozitul nu poate fi actualizat acum.",
        updateZone: "Zona nu poate fi actualizata acum.",
        createLocation: "Locatia nu poate fi creata acum.",
        updateLocation: "Modificarile locatiei nu pot fi salvate acum.",
        blockLocation: "Locatia nu poate fi blocata acum.",
        unblockLocation: "Locatia nu poate fi deblocata acum.",
      },
    },
  },
  barcodeLookup: {
    header: {
      eyebrow: "Cautare cod de bare",
      title: "Cautare manuala asistata de cod de bare pentru produsele existente",
      description:
        "Aceasta pagina executa doar o cautare exacta de cod de bare in backend, pe baza unei introduceri manuale. Ramane compacta si in regim doar citire si nu este o suita generala de cautare, un scanner cu camera sau un flux care modifica stocul.",
    },
    form: {
      label: "Valoare cod de bare",
      placeholder: "Introdu sau lipeste o valoare exacta de cod de bare",
      submit: "Cauta codul de bare",
      pending: "Se cauta...",
      helper:
        "Potrivirea ramane exacta. Campul gol este blocat local inainte de orice cerere catre backend.",
      requiredEyebrow: "Valoare necesara",
        requiredMessage:
          "Introdu sau lipeste o valoare de cod de bare inainte sa pornesti cautarea exacta.",
    },
    assist: {
      eyebrow: "Asistare cod de bare",
      description:
        "Introducerea produsului asistata de cod de bare ramane optionala aici. Cautarea este exacta, pastreaza selectia manuala disponibila, suporta scanere keyboard-wedge care trimit cu Enter si foloseste regula aprobata de aplicare: prima linie goala, altfel o linie noua preselectata.",
      inputLabel: "Cod de bare produs",
      inputPlaceholder: "Introdu sau lipeste un cod de bare exact al produsului",
      requiredError:
        "Introdu sau lipeste o valoare de cod de bare inainte de a rezolva produsul.",
      applyDescriptionTemplate:
        "Codul de bare exact {value} a fost rezolvat catre un produs existent. Aplicarea lui pastreaza intact fluxul curent pentru {contextLabel} si doar preselecteaza campul de produs.",
      applyButton: "Aplica produsul",
      appliedButton: "Aplicat",
      unavailableProductTemplate:
        "Produsul rezolvat {code} nu este prezent in optiunile de produse incarcate pentru formularul curent, asa ca nu poate fi aplicat automat.",
    },
    states: {
      idleEyebrow: "In asteptarea codului de bare",
      idleMessage:
        "Introdu sau lipeste mai sus un cod de bare de produs pentru a rula o cautare exacta compacta si pentru a naviga in siguranta catre fluxul existent de detaliu produs.",
      matchFound: "Potrivire gasita",
      lookupTypes: {
        Product: "Produs",
      },
      lookupType: "Tip cautare",
      code: "Cod",
      displayName: "Nume afisat",
      barcode: "Cod de bare",
      activeState: "Stare activa",
      active: "Activ",
      inactive: "Inactiv",
      openProduct: "Deschide produsul",
      exactMatchTemplate:
        "Cautarea exacta a potrivit codul de bare {value} cu un rezultat de produs existent.",
      notFoundEyebrow: "Negasit",
      notFoundTitle: "Niciun produs nu s-a potrivit cu acel cod de bare exact",
      notFoundFallbackTemplate:
        "Codul de bare '{value}' nu s-a rezolvat catre un produs cunoscut.",
      conflictEyebrow: "Conflict de duplicat",
      conflictTitle: "Acest cod de bare nu poate fi rezolvat in mod unic",
      conflictFallbackTemplate:
        "Codul de bare '{value}' este asignat la mai mult de un produs, asa ca sistemul nu va alege unul in mod arbitrar.",
      errorEyebrow: "Eroare de cautare",
      errorTitle: "Cautarea codului de bare nu a putut fi finalizata",
      errorFallback:
        "Backend-ul nu a returnat un raspuns utilizabil pentru cautarea codului de bare.",
    },
  },
  suppliers: {
    route: {
      listUnavailableTitle: "Furnizorii nu au putut fi incarcati",
      listUnavailableFallback:
        "Backend-ul nu a returnat un raspuns utilizabil pentru furnizori.",
      detailUnavailableTitle: "Furnizorul nu a putut fi incarcat",
      detailUnavailableFallback:
        "Backend-ul nu a returnat furnizorul cerut.",
    },
    list: {
      eyebrow: "Administrare furnizori",
      title: "Date master de furnizori doar pentru Admin, folosite la intrari",
      description:
        "Mentine inregistrarile de furnizori folosite de comenzile de intrare, astfel incat redactarea sa nu mai depinda de id-uri hardcodate sau doar din seed.",
      actionBlockedEyebrow: "Actiune de flux blocata",
      searchLabel: "Cautare",
      searchPlaceholder: "Cauta dupa cod, nume, stare sau id",
      visibleSuppliers: "Furnizori vizibili",
      activeSuppliers: "Furnizori activi",
      inactiveSuppliers: "Furnizori inactivi",
      viewDetail: "Vezi detalii",
      deactivate: "Dezactiveaza",
      activate: "Activeaza",
      supplierCode: "Cod furnizor",
      supplierName: "Nume furnizor",
      operationalState: "Stare operationala",
      supplierId: "Id furnizor",
      inactiveNote:
        "Furnizorii inactivi raman vizibili pentru referinta, dar nu ar trebui selectati pentru noi intrari.",
      createTitle: "Flux de creare Admin",
      createDescription:
        "Creeaza o inregistrare de furnizor pe care redactarea intrarilor o poate folosi imediat.",
      createSubmit: "Creeaza furnizor",
      emptyEyebrow: "Niciun furnizor potrivit",
      emptyMessage:
        "Ajusteaza cautarea curenta pentru a readuce in vizualizare inregistrarile master-data ale furnizorilor.",
    },
    detail: {
      backToList: "Inapoi la furnizori",
      description:
        "Mentenanta furnizorilor ramane concentrata pe eligibilitatea pentru redactarea intrarilor, fara procurement, preturi sau contacte.",
      referenceEyebrow: "Referinta furnizor",
      inboundEligibility: "Eligibilitate pentru redactarea intrarilor",
      usageEyebrow: "Utilizare in comenzi de intrare",
      referencedInboundOrders: "Comenzi de intrare referentiate",
      activeReferencedInboundOrders:
        "Comenzi de intrare active referentiate",
      accessStateEyebrow: "Stare acces",
      deactivate: "Dezactiveaza furnizorul",
      activate: "Activeaza furnizorul",
      editTitle: "Flux de editare Admin",
      editDescription:
        "Actualizeaza codul si numele furnizorului, pastrand starea de activare ca actiune operationala explicita.",
      editSubmit: "Salveaza modificarile furnizorului",
      words: {
        orderSingular: "comanda de intrare",
        orderPlural: "comenzi de intrare",
      },
      templates: {
        usageActive:
          "Acest furnizor este deja referentiat de {referencedCount} {referencedWord}, iar {activeCount} raman active operational. Dezactivarea opreste doar selectia viitoare pentru intrari; nu elimina legaturile istorice din documente.",
        usageHistorical:
          "Acest furnizor este referentiat de {referencedCount} {referencedWord}, dar niciuna nu mai este activa operational. Dezactivarea afecteaza in continuare doar redactarea viitoare a intrarilor, nu referintele existente.",
        usageNone:
          "Acest furnizor nu este referentiat in prezent de comenzi de intrare. Dezactivarea ar afecta doar selectia viitoare pentru redactarea intrarilor.",
        accessActive:
          "Acest furnizor este inca legat de {activeCount} {activeWord} active. Dezactivarea opreste doar selectia viitoare pentru noile intrari si nu elimina legatura din comenzile existente.",
        accessHistorical:
          "Furnizorii inactivi raman vizibili pentru referinta, iar comenzile de intrare existente isi pastreaza legatura stocata cu furnizorul. Dezactivarea impiedica doar selectia viitoare in redactarea intrarilor.",
        accessNone:
          "Furnizorii inactivi raman vizibili pentru referinta, dar nu ar trebui folositi la redactarea comenzilor de intrare. Foloseste aceste controale pentru a reactiva sau dezactiva explicit furnizorul curent.",
      },
    },
    form: {
      scopeEyebrow: "Scope",
      scopeDescription:
        "Aceasta este doar mentenanta de date master pentru furnizori. Sustine redactarea intrarilor si nu adauga procurement, preturi, contacte sau comportament CRM.",
      codeLabel: "Cod furnizor",
      nameLabel: "Nume furnizor",
      pending: "Se salveaza...",
    },
    actions: {
      codeNameRequired:
        "Codul furnizorului si numele furnizorului sunt obligatorii.",
      createFallback: "Furnizorul nu poate fi creat acum.",
      updateFallback: "Furnizorul nu poate fi actualizat acum.",
      activateFallback: "Furnizorul nu poate fi activat acum.",
      deactivateFallback: "Furnizorul nu poate fi dezactivat acum.",
      idRequired: "Id-ul furnizorului este obligatoriu.",
    },
  },
  customers: {
    route: {
      listUnavailableTitle: "Clientii nu au putut fi incarcati",
      listUnavailableFallback:
        "Backend-ul nu a returnat un raspuns utilizabil pentru clienti.",
      detailUnavailableTitle: "Clientul nu a putut fi incarcat",
      detailUnavailableFallback:
        "Backend-ul nu a returnat clientul cerut.",
    },
    list: {
      eyebrow: "Administrare clienti",
      title:
        "Date master de clienti doar pentru Admin, folosite la comenzile de vanzare",
      description:
        "Mentine inregistrarile de clienti folosite de comenzile de vanzare, astfel incat redactarea sa nu mai depinda de id-uri hardcodate sau fragile.",
      actionBlockedEyebrow: "Actiune de flux blocata",
      searchLabel: "Cautare",
      searchPlaceholder: "Cauta dupa cod, nume, stare sau id",
      visibleCustomers: "Clienti vizibili",
      activeCustomers: "Clienti activi",
      inactiveCustomers: "Clienti inactivi",
      viewDetail: "Vezi detalii",
      deactivate: "Dezactiveaza",
      activate: "Activeaza",
      customerCode: "Cod client",
      customerName: "Nume client",
      operationalState: "Stare operationala",
      customerId: "Id client",
      inactiveNote:
        "Clientii inactivi raman vizibili pentru referinta, dar nu ar trebui selectati pentru noi comenzi de vanzare.",
      createTitle: "Flux de creare Admin",
      createDescription:
        "Creeaza o inregistrare de client pe care redactarea comenzilor de vanzare o poate folosi imediat.",
      createSubmit: "Creeaza client",
      emptyEyebrow: "Niciun client potrivit",
      emptyMessage:
        "Ajusteaza cautarea curenta pentru a readuce in vizualizare inregistrarile master-data ale clientilor.",
    },
    detail: {
      backToList: "Inapoi la clienti",
      description:
        "Mentenanta clientilor ramane concentrata pe eligibilitatea pentru redactarea comenzilor de vanzare, fara CRM, contacte, preturi sau facturare.",
      referenceEyebrow: "Referinta client",
      salesEligibility: "Eligibilitate pentru redactarea comenzilor de vanzare",
      usageEyebrow: "Utilizare in comenzi de vanzare",
      referencedSalesOrders: "Comenzi de vanzare referentiate",
      activeReferencedSalesOrders:
        "Comenzi de vanzare active referentiate",
      accessStateEyebrow: "Stare acces",
      deactivate: "Dezactiveaza clientul",
      activate: "Activeaza clientul",
      editTitle: "Flux de editare Admin",
      editDescription:
        "Actualizeaza codul si numele clientului, pastrand starea de activare ca actiune operationala explicita.",
      editSubmit: "Salveaza modificarile clientului",
      words: {
        orderSingular: "comanda de vanzare",
        orderPlural: "comenzi de vanzare",
      },
      templates: {
        usageActive:
          "Acest client este deja referentiat de {referencedCount} {referencedWord}, iar {activeCount} raman active operational. Dezactivarea opreste doar selectia viitoare a clientului; nu elimina legaturile istorice din documente.",
        usageHistorical:
          "Acest client este referentiat de {referencedCount} {referencedWord}, dar niciuna nu mai este activa operational. Dezactivarea afecteaza in continuare doar redactarea viitoare a comenzilor de vanzare, nu referintele existente.",
        usageNone:
          "Acest client nu este referentiat in prezent de comenzi de vanzare. Dezactivarea ar afecta doar selectia viitoare pentru redactarea comenzilor de vanzare.",
        accessActive:
          "Acest client este inca legat de {activeCount} {activeWord} active. Dezactivarea opreste doar selectia viitoare pentru noile comenzi de vanzare si nu elimina legatura din comenzile existente.",
        accessHistorical:
          "Clientii inactivi raman vizibili pentru referinta, iar comenzile de vanzare existente isi pastreaza legatura stocata cu clientul. Dezactivarea impiedica doar selectia viitoare in redactarea comenzilor de vanzare.",
        accessNone:
          "Clientii inactivi raman vizibili pentru referinta, dar nu ar trebui folositi in noi comenzi de vanzare. Foloseste aceste controale pentru a reactiva sau dezactiva explicit clientul curent.",
      },
    },
    form: {
      scopeEyebrow: "Scope",
      scopeDescription:
        "Aceasta este doar mentenanta de date master pentru clienti. Sustine redactarea comenzilor de vanzare si nu adauga CRM, preturi, facturare, credit sau comportament pentru contacte.",
      codeLabel: "Cod client",
      nameLabel: "Nume client",
      pending: "Se salveaza...",
    },
    actions: {
      codeNameRequired:
        "Codul clientului si numele clientului sunt obligatorii.",
      createFallback: "Clientul nu poate fi creat acum.",
      updateFallback: "Clientul nu poate fi actualizat acum.",
      activateFallback: "Clientul nu poate fi activat acum.",
      deactivateFallback: "Clientul nu poate fi dezactivat acum.",
      idRequired: "Id-ul clientului este obligatoriu.",
    },
  },
  inboundOrders: {
    route: {
      listUnavailableTitle:
        "Comenzile de intrare nu au putut fi incarcate",
      listUnavailableFallback:
        "Backend-ul nu a returnat un raspuns utilizabil pentru comenzile de intrare.",
      detailUnavailableTitle:
        "Comanda de intrare nu a putut fi incarcata",
      detailUnavailableFallback:
        "Backend-ul nu a returnat comanda de intrare ceruta.",
      createProductsFallback:
        "Optiunile de produse pentru crearea comenzii de intrare nu au putut fi incarcate.",
      createSuppliersFallback:
        "Optiunile de furnizori pentru crearea comenzii de intrare nu au putut fi incarcate.",
      editProductsFallback:
        "Optiunile de produse pentru editarea comenzii de intrare nu au putut fi incarcate.",
      editSuppliersFallback:
        "Optiunile de furnizori pentru editarea comenzii de intrare nu au putut fi incarcate.",
    },
    list: {
      eyebrow: "Flux de intrare",
      title:
        "Planificarea marfii asteptate inainte de confirmarea receptiei in depozit",
      description:
        "Comenzile de intrare captureaza ceea ce ar trebui sa soseasca de la un furnizor. Ele nu modifica direct stocul. Fluxul de receptie din depozit gestioneaza ulterior intrarea efectiva in stoc, doar in locatii de receiving.",
      warehouseFocus:
        "Vizualizarea pentru Depozit se concentreaza pe comenzile pregatite pentru receptie si receptionate partial, astfel incat munca de receptie sa ramana usor de urmarit.",
      searchLabel: "Cautare",
      searchPlaceholder: "Cauta dupa factura, furnizor, SKU sau produs",
      statusLabel: "Stare",
      allOrders: "Toate comenzile de intrare",
      receivableFirst: "Cu prioritate la receptie",
      resultsLabel: "Rezultate",
      resultsTemplate: "Se afiseaza {filtered} din {total}",
      receiptQueue: "Coada de receptie",
      noNotes: "Nu exista note pentru aceasta comanda de intrare.",
      viewDetails: "Vezi detalii",
      createReceipt: "Creeaza receptie",
      metrics: {
        lines: "Linii",
        expected: "Asteptat",
        confirmedReceived: "Receptionat confirmat",
        remaining: "Ramas",
      },
      createTitle: "Flux de creare Admin",
      createDescription:
        "Captureaza asteptarile din factura furnizorului, mentinand documentul neutru fata de stoc pana cand o receptie din depozit este confirmata.",
      createSubmit: "Creeaza comanda de intrare",
      emptyEyebrow: "Nicio comanda de intrare potrivita",
      emptyMessage:
        "Ajusteaza filtrele curente pentru a readuce in vizualizare comenzile de intrare.",
    },
    detail: {
      fallbackDescription:
        "Aceasta comanda de intrare captureaza marfa asteptata si ramane neutra fata de stoc pana cand o receptie din depozit este confirmata.",
      backToList: "Inapoi la comenzile de intrare",
      createReceipt: "Creeaza receptie",
      metrics: {
        supplier: "Furnizor",
        expected: "Asteptat",
        confirmedReceived: "Receptionat confirmat",
        remaining: "Ramas",
      },
      actionBlockedEyebrow: "Actiune de flux blocata",
      linesEyebrow: "Linii comanda",
      linesDescription:
        "Cantitatile asteptate sunt stocate aici. Cantitatile receptionate confirmat cresc doar dupa confirmarea unei receptii in depozit.",
      lineSingular: "linie",
      linePlural: "linii",
      productLabel: "Produs",
      expectedLabel: "Asteptat",
      receivedLabel: "Receptionat",
      remainingLabel: "Ramas",
      workflowMeaningEyebrow: "Sensul fluxului",
      workflowMeaning: {
        inboundOrder:
          "Comanda de intrare: doar planificare si marfa asteptata.",
        confirmedReceipt:
          "Receptie confirmata: pasul ulterior de intrare in stoc intr-o locatie de receiving.",
        putaway:
          "Putaway: flux separat de continuare dupa confirmarea receptiei.",
      },
      summaryEyebrow: "Rezumat document",
      supplierId: "Id furnizor",
      created: "Creat",
      updated: "Actualizat",
      cancelled: "Anulat",
      notCancelled: "Neanulat",
      adminActionsEyebrow: "Actiuni Admin",
      adminActionsDescription:
        "Doar comenzile de intrare aflate in Ciorna pot fi editate sau mutate in Pregatita pentru receptie. Anularea ramane blocata imediat ce exista orice cantitate receptionata confirmat.",
      markReady: "Marcheaza ca pregatita pentru receptie",
      cancel: "Anuleaza comanda de intrare",
      editTitle: "Flux de editare Admin",
      editDescription:
        "Ajusteaza documentul cu marfa asteptata cat timp este inca in Ciorna.",
      editSubmit: "Salveaza comanda de intrare",
      draftClosedEyebrow: "Editarea ciornei este inchisa",
      draftClosedDescription:
        "Aceasta comanda de intrare nu mai este in Ciorna, astfel ca frontend-ul o pastreaza doar pentru citire si lasa executia receptiei in fluxul de depozit.",
      warehouseNextEyebrow: "Pasul urmator pentru Depozit",
      warehouseNextDescription:
        "Depozitul poate revizui aici cantitatile asteptate si apoi poate crea o receptie doar cand comanda este pregatita pentru receptie si mai are cantitate ramasa.",
    },
    form: {
      stockImpactEyebrow: "Impact asupra stocului",
      stockImpactDescription:
        "Comenzile de intrare planifica doar marfa asteptata. Ele nu modifica stocul. Stocul intra in sistem mai tarziu, cand o receptie din depozit este confirmata intr-o locatie de receiving.",
      readinessEyebrow: "Pregatire pentru redactare",
      readinessDescription:
        "Redactarea comenzilor de intrare foloseste acum direct furnizori administrati. Pentru documentele noi sau actualizate ar trebui folosite doar produse administrate si furnizori activi.",
      noActiveSuppliers:
        "Nu exista furnizori activi disponibili in acest moment. Creeaza sau reactiveaza un furnizor inainte sa salvezi modificarile comenzii de intrare.",
      noProducts:
        "Nu exista produse administrate disponibile in acest moment. Adauga produse inainte de a crea sau actualiza linii ale comenzii de intrare.",
      selectedInactiveSupplier:
        "Aceasta ciorna face referire in prezent la furnizorul inactiv {code}. Alege un furnizor activ inainte de salvare.",
      barcodeContextLabel: "linie de comanda de intrare",
      barcodeApplied:
        "Produsul a fost aplicat pe linia {lineNumber} a comenzii de intrare.",
      barcodeAdded:
        "Produsul a fost adaugat ca linie noua {lineNumber} in comanda de intrare.",
      supplierLabel: "Furnizor",
      selectSupplier: "Selecteaza un furnizor",
      noActiveSuppliersOption: "Nu exista furnizori activi disponibili",
      inactiveSuffix: "(inactiv)",
      invoiceReferenceLabel: "Referinta factura furnizor",
      invoiceReferencePlaceholder: "INV-2026-0001",
      notesLabel: "Note",
      notesPlaceholder: "Context optional pentru receptie sau note despre factura",
      linesTitle: "Linii comanda de intrare",
      linesDescription:
        "Adauga produsele si cantitatile asteptate. Confirmarea receptiei va decide ulterior ce intra efectiv in stoc.",
      productsRequired:
        "Produsele sunt necesare inainte ca liniile comenzii de intrare sa poata fi adaugate.",
      addLine: "Adauga linie",
      productLabel: "Produs {index}",
      selectProduct: "Selecteaza un produs",
      noProductsOption: "Nu exista produse disponibile",
      expectedQuantityLabel: "Cantitate asteptata",
      quantityPlaceholder: "12",
      removeLine: "Elimina",
      pending: "Se salveaza...",
    },
    actions: {
      createFallback:
        "Comanda de intrare nu poate fi creata acum.",
      updateFallback:
        "Modificarile comenzii de intrare nu pot fi salvate acum.",
      readyFallback:
        "Comanda de intrare nu poate fi mutata acum in Pregatita pentru receptie.",
      cancelFallback:
        "Comanda de intrare nu poate fi anulata acum.",
      supplierReferenceRequired:
        "Furnizorul si referinta facturii furnizorului sunt obligatorii.",
      lineRequired:
        "Este necesara cel putin o linie pentru comanda de intrare.",
      validLineRequired:
        "Adauga cel putin o linie valida pentru comanda de intrare.",
      productRequired:
        "Fiecare linie a comenzii de intrare trebuie sa selecteze un produs.",
      quantityValid:
        "Cantitatile asteptate trebuie sa fie numere valide mai mari decat zero.",
    },
  },
  receipts: {
    route: {
      listUnavailableTitle: "Receptiile nu au putut fi incarcate",
      listUnavailableFallback:
        "Backend-ul nu a returnat un raspuns utilizabil pentru receptii.",
      detailUnavailableTitle: "Receptia nu a putut fi incarcata",
      detailUnavailableFallback:
        "Backend-ul nu a returnat receptia ceruta.",
      createInboundOrdersFallback:
        "Comenzile de intrare pentru crearea receptiei nu au putut fi incarcate.",
      createLocationsFallback:
        "Locatiile pentru crearea receptiei nu au putut fi incarcate.",
    },
    list: {
      eyebrow: "Flux de receptie",
      title:
        "Executia receptiilor in depozit cu confirmare explicita a intrarii in stoc",
      description:
        "Crearea sau pornirea unei receptii nu modifica stocul. Doar o receptie confirmata introduce stocul intr-o locatie de receiving, iar putaway continua ulterior ca flux separat.",
      searchLabel: "Cautare",
      searchPlaceholder:
        "Cauta dupa factura, furnizor, SKU sau locatie de receiving",
      statusLabel: "Stare",
      allReceipts: "Toate receptiile",
      resultsLabel: "Rezultate",
      resultsTemplate: "Se afiseaza {filtered} din {total}",
      linkedInboundStatus: "Stare comanda de intrare legata: {status}",
      noNotes: "Nu exista note pentru aceasta receptie.",
      viewReceipt: "Vezi receptia",
      continueReceipt: "Continua receptia",
      metrics: {
        lines: "Linii",
        created: "Creata",
        started: "Pornita",
        confirmed: "Confirmata",
      },
      notStarted: "Nepornita",
      notConfirmed: "Neconfirmata",
      emptyEyebrow: "Nicio receptie potrivita",
      emptyMessage:
        "Ajusteaza cautarea curenta sau filtrul de stare pentru a readuce receptiile in vizualizare.",
    },
    form: {
      emptyEyebrow: "Creeaza receptie",
      emptyMessage:
        "Nu exista in acest moment comenzi de intrare in Pregatita pentru receptie sau Receptionata partial cu cantitate ramasa. Marcheaza o comanda in ciorna ca pregatita sau finalizeaza mai intai receptiile deja deschise.",
      eyebrow: "Creeaza receptie",
      description:
        "Crearea receptiei ramane neutra fata de stoc. Stocul se modifica doar cand o receptie trece ulterior in Confirmata.",
      receivingRuleEyebrow: "Regula pentru locatia de receiving",
      receivingRuleDescription:
        "Aici sunt afisate doar locatiile RECEIVING active si neblocate. Confirmarea receptiei muta stocul in acele locatii de receiving, iar putaway continua dupa aceea in propriul sau flux.",
      inboundOrderLabel: "Comanda de intrare",
      selectedOrderSummary:
        "Comanda de intrare {orderId} este in prezent {status} si mai are {remaining} de receptionat.",
      notesLabel: "Note",
      notesPlaceholder: "Note optionale de receptie pentru echipa din depozit",
      noReceivingLocations:
        "Nu exista in prezent locatii RECEIVING active si neblocate. Adauga sau reactiveaza o locatie de receiving in configurarea depozitului inainte de a crea o receptie din aceasta interfata.",
      linesTitle: "Linii receptie",
      linesDescription:
        "Seteaza cantitatea la 0 pe orice linie pe care vrei sa o sari in aceasta receptie.",
      productLabel: "Produs",
      orderQuantitiesLabel: "Cantitati din comanda",
      expected: "Asteptat",
      confirmed: "Confirmat",
      remaining: "Ramas",
      receivingLocationLabel: "Locatie de receiving",
      receiptQuantityLabel: "Cantitate receptionata",
      createSubmit: "Creeaza receptie",
      pending: "Se salveaza...",
    },
    detail: {
      title: "Receptie pentru {reference}",
      description:
        "Acest ecran ramane doar pentru citire, cu exceptia tranzitiilor de flux. Singurul pas care modifica stocul este Confirma receptia, care introduce stocul in locatiile de receiving selectate.",
      backToList: "Inapoi la receptii",
      openInboundOrder: "Deschide comanda de intrare",
      metrics: {
        inboundOrderStatus: "Stare comanda de intrare",
        created: "Creata",
        started: "Pornita",
        confirmed: "Confirmata",
      },
      notStarted: "Nepornita",
      notConfirmed: "Neconfirmata",
      actionBlockedEyebrow: "Actiune de flux blocata",
      workflowActionsEyebrow: "Actiuni de flux",
      workflowActionsDescription:
        "Ciorna si In desfasurare raman neutre fata de stoc. Confirmarea este pasul final al receptiei in acest task si scrie stocul in locatiile de receiving selectate. Putaway ramane ulterior un flux separat.",
      start: "Porneste receptia",
      confirm: "Confirma receptia",
      cancel: "Anuleaza receptia",
      summaryEyebrow: "Rezumat receptie",
      receiptId: "Id receptie",
      inboundOrderId: "Id comanda de intrare",
      supplier: "Furnizor",
      cancelled: "Anulata",
      notCancelled: "Neanulata",
      notesEyebrow: "Note",
      linesEyebrow: "Linii receptie",
      linesDescription:
        "Fiecare linie arata asteptarea legata din comanda de intrare, cantitatea receptionata confirmat in prezent pe comanda si locatia de receiving selectata pentru aceasta receptie.",
      lineSingular: "linie",
      linePlural: "linii",
      linkedInboundUnavailable:
        "Comanda de intrare legata nu a putut fi incarcata, astfel incat cantitatile asteptate sunt temporar indisponibile pe aceasta pagina.",
      productLabel: "Produs",
      inboundOrderLine: "Linie comanda de intrare {id}",
      quantitiesEyebrow: "Cantitati",
      thisReceipt: "Aceasta receptie",
      expected: "Asteptat",
      confirmedReceivedOnOrder:
        "Receptionat confirmat pe comanda",
      remaining: "Ramas",
      unavailable: "Indisponibil",
      receivingLocationEyebrow: "Locatie de receiving",
    },
    actions: {
      createFallback: "Receptia nu poate fi creata acum.",
      startFallback:
        "Receptia nu poate fi mutata acum in In desfasurare.",
      confirmFallback:
        "Receptia nu poate fi confirmata. Verifica cantitatile si locatiile de receiving.",
      cancelFallback: "Receptia nu poate fi anulata acum.",
      inboundOrderRequired:
        "Selecteaza comanda de intrare pentru care vrei sa receptionezi.",
      lineRequired:
        "Adauga cel putin o linie de receptie cu o cantitate mai mare decat zero.",
      receivingLocationRequired:
        "Fiecare linie de receptie cu cantitate trebuie sa selecteze o locatie de receiving.",
      quantityValid:
        "Cantitatile din receptie trebuie sa fie numere valide mai mari decat zero.",
    },
  },
  putawayTasks: {
    route: {
      listUnavailableTitle:
        "Taskurile de putaway nu au putut fi incarcate",
      listUnavailableFallback:
        "Backend-ul nu a returnat un raspuns utilizabil pentru taskurile de putaway.",
      detailUnavailableTitle:
        "Taskul de putaway nu a putut fi incarcat",
      detailUnavailableFallback:
        "Backend-ul nu a returnat taskul de putaway cerut.",
      createBalancesFallback:
        "Randurile de stoc din receiving pentru crearea taskului de putaway nu au putut fi incarcate.",
      createDestinationsFallback:
        "Locatiile de destinatie pentru crearea taskului de putaway nu au putut fi incarcate.",
    },
    list: {
      eyebrow: "Flux de putaway",
      title:
        "Miscare controlata din receiving catre stocare finala sau picking",
      description:
        "Confirmarea receptiei creeaza stoc intr-o locatie de receiving. Putaway planifica si executa urmatoarea miscare; finalizarea modifica stocul.",
      actionBlockedEyebrow: "Actiune de flux blocata",
      searchLabel: "Cautare",
      searchPlaceholder:
        "Cauta dupa produs, sursa, destinatie sau id de receptie",
      statusLabel: "Stare",
      openTasksFirst: "Taskurile deschise mai intai",
      allTasks: "Toate taskurile",
      resultsLabel: "Rezultate",
      resultsTemplate: "Se afiseaza {filtered} din {total}",
      sourceDestination: "Sursa {source} -> destinatie {destination}",
      quantityLabel: "Cantitate {quantity}",
      receiptTraceability:
        "Trasabilitate receptie: receptia {receiptId}{receiptLine}",
      receiptLineSuffix: ", linia {receiptLineId}",
      noNotes: "Nu exista note pentru acest task de putaway.",
      viewDetails: "Vezi detalii",
      metrics: {
        created: "Creat",
        started: "Pornit",
        completed: "Finalizat",
        cancelled: "Anulat",
      },
      notStarted: "Nepornit",
      notCompleted: "Nefinalizat",
      notCancelled: "Neanulat",
      start: "Porneste taskul",
      complete: "Finalizeaza putaway",
      cancel: "Anuleaza taskul",
      emptyEyebrow: "Niciun task de putaway potrivit",
      emptyMessage:
        "Ajusteaza cautarea curenta sau filtrul de stare pentru a readuce in vizualizare munca de putaway.",
    },
    form: {
      emptyEyebrow: "Creeaza task de putaway",
      emptyMessage:
        "Nu exista in acest moment randuri de stoc din receiving cu disponibil pozitiv, deci nu exista nimic de planificat pentru putaway din aceasta interfata.",
      eyebrow: "Creeaza task de putaway",
      description:
        "Crearea taskului de putaway ramane neutra fata de stoc. Finalizeaza putaway muta stocul din receiving in stocarea finala sau in picking.",
      meaningEyebrow: "Sensul fluxului",
      meaningDescription:
        "Confirmarea receptiei creeaza stoc intr-o locatie RECEIVING. Putaway planifica apoi miscarea controlata in afara receiving-ului, catre o destinatie finala care nu este de receiving.",
      sourceBalanceLabel: "Stoc din receiving de mutat",
      availableTemplate: "disponibil {value}",
      sourceLabel: "Sursa",
      availableToMoveLabel: "Disponibil de mutat",
      locationTypeTemplate: "{path} | tip {type}",
      quantitySummaryTemplate: "On hand {onHand} | rezervat {reserved}",
      destinationLocationLabel: "Locatie de destinatie",
      noValidDestinations: "Nu exista locatii de destinatie valide",
      quantityLabel: "Cantitate de putaway",
      notesLabel: "Note",
      notesPlaceholder: "Indicatii optionale pentru operatorul din depozit",
      noValidDestinationMessage:
        "Nu exista locatii de destinatie valide pentru aceasta sursa. Destinatia trebuie sa fie activa, neblocata, diferita de sursa si sa nu fie de tip RECEIVING.",
      createSubmit: "Creeaza task de putaway",
      pending: "Se salveaza...",
    },
    detail: {
      title: "Task de putaway pentru {productName}",
      description:
        "Acest task muta stocul dintr-o locatie de receiving in stocare finala sau picking. Finalizeaza putaway modifica stocul.",
      backToList: "Inapoi la taskurile de putaway",
      metrics: {
        quantity: "Cantitate",
        created: "Creat",
        started: "Pornit",
        completed: "Finalizat",
      },
      notStarted: "Nepornit",
      notCompleted: "Nefinalizat",
      actionBlockedEyebrow: "Actiune de flux blocata",
      workflowActionsEyebrow: "Actiuni de flux",
      workflowActionsDescription:
        "Pornirea sau anularea taskului nu muta stocul. Finalizarea taskului scrie relocarea din receiving in destinatia finala selectata.",
      start: "Porneste taskul",
      complete: "Finalizeaza putaway",
      cancel: "Anuleaza taskul",
      noFurtherAction:
        "Nu mai este disponibila nicio actiune de executie pentru rolul curent si starea taskului.",
      traceabilityEyebrow: "Trasabilitate",
      putawayTaskId: "Id task putaway",
      receiptId: "Id receptie",
      receiptLineId: "Id linie receptie",
      noLinkedReceipt: "Fara receptie legata",
      noLinkedReceiptLine: "Fara linie de receptie legata",
      cancelled: "Anulat",
      notCancelled: "Neanulat",
      notesEyebrow: "Note",
      sourceLocationEyebrow: "Locatie sursa",
      sourceLocationDescription:
        "Sursa trebuie sa fie o locatie RECEIVING pentru executia putaway.",
      destinationLocationEyebrow: "Locatie destinatie",
      destinationLocationDescription:
        "Destinatia este locatia finala de stocare sau picking pentru aceasta miscare si nu trebuie sa fie RECEIVING.",
    },
    actions: {
      createFallback:
        "Taskul de putaway nu poate fi creat acum.",
      startFallback:
        "Taskul de putaway nu poate fi pornit acum.",
      completeFallback:
        "Taskul de putaway nu poate fi finalizat. Verifica stocul sursa si regulile pentru destinatie.",
      cancelFallback:
        "Taskul de putaway nu poate fi anulat acum.",
      idRequired: "Id-ul taskului de putaway este obligatoriu.",
      fieldsRequired:
        "Stocul sursa, locatia de destinatie si cantitatea sunt obligatorii.",
      destinationDifferent:
        "Locatia de destinatie trebuie sa fie diferita de locatia sursa.",
      quantityValid:
        "Cantitatea de putaway trebuie sa fie un numar valid mai mare decat zero.",
    },
  },
  transferTasks: {
    route: {
      listUnavailableTitle: "Taskurile de transfer nu au putut fi incarcate",
      listUnavailableFallback:
        "Backend-ul nu a returnat un raspuns utilizabil pentru taskurile de transfer.",
      detailUnavailableTitle: "Taskul de transfer nu a putut fi incarcat",
      detailUnavailableFallback:
        "Backend-ul nu a returnat taskul de transfer cerut.",
      createBalancesFallback:
        "Randurile de stoc sursa pentru crearea taskului de transfer nu au putut fi incarcate.",
      createDestinationsFallback:
        "Locatiile de destinatie pentru crearea taskului de transfer nu au putut fi incarcate.",
    },
    list: {
      eyebrow: "Flux de transfer",
      title: "Relocare interna intre locatii normale din depozit",
      description:
        "Transferul muta stocul intre locatii active care nu sunt de receiving. Ramane distinct de putaway; finalizarea modifica stocul.",
      actionBlockedEyebrow: "Actiune de flux blocata",
      searchLabel: "Cautare",
      searchPlaceholder: "Cauta dupa produs, sursa, destinatie sau motiv",
      statusLabel: "Stare",
      openTasksFirst: "Taskurile deschise mai intai",
      allTasks: "Toate taskurile",
      resultsLabel: "Rezultate",
      resultsTemplate: "Se afiseaza {filtered} din {total}",
      sourceDestination: "Sursa {source} -> destinatie {destination}",
      quantityLabel: "Cantitate {quantity}",
      noReason: "Nu exista motiv inregistrat pentru transfer.",
      viewDetails: "Vezi detalii",
      metrics: {
        created: "Creat",
        started: "Pornit",
        completed: "Finalizat",
        cancelled: "Anulat",
      },
      notStarted: "Nepornit",
      notCompleted: "Nefinalizat",
      notCancelled: "Neanulat",
      start: "Porneste taskul",
      complete: "Finalizeaza transferul",
      cancel: "Anuleaza taskul",
      emptyEyebrow: "Niciun task de transfer potrivit",
      emptyMessage:
        "Ajusteaza cautarea curenta sau filtrul de stare pentru a readuce in vizualizare munca de transfer.",
    },
    form: {
      emptyEyebrow: "Creeaza task de transfer",
      emptyMessage:
        "Nu exista in acest moment balante sursa active, care nu sunt de receiving, cu stoc disponibil pozitiv, deci nu exista nimic de planificat pentru transfer intern din aceasta interfata.",
      eyebrow: "Creeaza task de transfer",
      description:
        "Crearea taskului de transfer ramane neutra fata de stoc. Finalizeaza transferul muta stocul intre locatii normale care nu sunt de receiving.",
      meaningEyebrow: "Sensul fluxului",
      meaningDescription:
        "Transferul este o miscare interna intre locatii normale din depozit. Ramane distinct de putaway, care muta stocul dintr-o locatie de receiving dupa confirmarea receptiei.",
      sourceBalanceLabel: "Stoc sursa de mutat",
      availableTemplate: "disponibil {value}",
      blockedSource: "sursa blocata",
      unblockedSource: "sursa neblocata",
      sourceLabel: "Sursa",
      availableToMoveLabel: "Disponibil de mutat",
      locationTypeTemplate: "{path} | tip {type} | {sourceState}",
      quantitySummaryTemplate: "On hand {onHand} | rezervat {reserved}",
      destinationLocationLabel: "Locatie de destinatie",
      noValidDestinations: "Nu exista locatii de destinatie valide",
      quantityLabel: "Cantitate de transfer",
      reasonLabel: "Motiv",
      reasonPlaceholder: "Motiv optional pentru relocarea interna",
      noValidDestinationMessage:
        "Nu exista locatii de destinatie valide pentru aceasta sursa. Destinatia trebuie sa fie activa, neblocata, diferita de sursa si sa nu fie de tip RECEIVING.",
      createSubmit: "Creeaza task de transfer",
      pending: "Se salveaza...",
    },
    detail: {
      title: "Task de transfer pentru {productName}",
      description:
        "Acest task gestioneaza o miscare interna intre locatii normale care nu sunt de receiving. Finalizeaza transferul modifica stocul.",
      backToList: "Inapoi la taskurile de transfer",
      metrics: {
        quantity: "Cantitate",
        created: "Creat",
        started: "Pornit",
        completed: "Finalizat",
      },
      notStarted: "Nepornit",
      notCompleted: "Nefinalizat",
      actionBlockedEyebrow: "Actiune de flux blocata",
      workflowActionsEyebrow: "Actiuni de flux",
      workflowActionsDescription:
        "Crearea, pornirea sau anularea taskului nu muta stocul. Finalizarea taskului scrie relocarea interna intre locatiile normale selectate.",
      start: "Porneste taskul",
      complete: "Finalizeaza transferul",
      cancel: "Anuleaza taskul",
      noFurtherAction:
        "Nu mai este disponibila nicio actiune de executie pentru rolul curent si starea taskului.",
      summaryEyebrow: "Rezumat transfer",
      transferTaskId: "Id task transfer",
      cancelled: "Anulat",
      notCancelled: "Neanulat",
      reason: "Motiv",
      noReason: "Nu exista motiv inregistrat pentru transfer.",
      sourceLocationEyebrow: "Locatie sursa",
      sourceLocationDescription:
        "Sursa trebuie sa fie o locatie normala activa in acest flux. Transferurile nu pornesc din RECEIVING.",
      destinationLocationEyebrow: "Locatie destinatie",
      destinationLocationDescription:
        "Destinatia trebuie sa fie o locatie normala activa si neblocata si ramane distincta de fluxul de putaway.",
    },
    actions: {
      createFallback: "Taskul de transfer nu poate fi creat acum.",
      startFallback: "Taskul de transfer nu poate fi pornit acum.",
      completeFallback:
        "Taskul de transfer nu poate fi finalizat. Verifica stocul sursa si regulile pentru destinatie.",
      cancelFallback: "Taskul de transfer nu poate fi anulat acum.",
      idRequired: "Id-ul taskului de transfer este obligatoriu.",
      fieldsRequired:
        "Stocul sursa, locatia de destinatie si cantitatea sunt obligatorii.",
      destinationDifferent:
        "Locatia de destinatie trebuie sa fie diferita de locatia sursa.",
      quantityValid:
        "Cantitatea de transfer trebuie sa fie un numar valid mai mare decat zero.",
    },
  },
  replenishmentRules: {
    route: {
      listUnavailableTitle:
        "Regulile de replenishment nu au putut fi incarcate",
      listUnavailableFallback:
        "Backend-ul nu a returnat un raspuns utilizabil pentru regulile de replenishment.",
      detailUnavailableTitle:
        "Regula de replenishment nu a putut fi incarcata",
      detailUnavailableFallback:
        "Backend-ul nu a returnat regula de replenishment ceruta.",
      createProductsFallback:
        "Optiunile de produse pentru administrarea regulilor de replenishment nu au putut fi incarcate.",
      createLocationsFallback:
        "Locatiile de picking pentru administrarea regulilor de replenishment nu au putut fi incarcate.",
      editProductsFallback:
        "Optiunile de produse pentru editarea regulii nu au putut fi incarcate.",
      editLocationsFallback:
        "Locatiile valide de picking pentru editarea regulii nu au putut fi incarcate.",
    },
    list: {
      eyebrow: "Reguli de replenishment",
      title: "Praguri de picking si niveluri tinta administrate de Admin",
      description:
        "Regulile definesc momentul in care este necesar replenishment pentru o locatie de picking. Raman separate de transfer si putaway, taskurile sunt manuale, iar doar finalizarea modifica stocul.",
      searchLabel: "Cautare",
      searchPlaceholder: "Cauta dupa produs sau dupa locatia tinta de picking",
      stateLabel: "Stare regula",
      activeFirst: "Regulile active mai intai",
      allRules: "Toate regulile",
      inactiveOnly: "Doar inactive",
      resultsLabel: "Rezultate",
      resultsTemplate: "Se afiseaza {filtered} din {total}",
      targetLabel: "Tinta {path} - {name}",
      viewDetails: "Vezi detalii",
      metrics: {
        minimumThreshold: "Prag minim",
        targetQuantity: "Cantitate tinta",
        updated: "Actualizat",
      },
      emptyEyebrow: "Nicio regula de replenishment potrivita",
      emptyMessage:
        "Ajusteaza cautarea curenta sau filtrul de stare pentru a readuce in vizualizare definitiile de reguli.",
    },
    form: {
      workflowMeaningEyebrow: "Sensul fluxului",
      workflowMeaningDescription:
        "Regulile de replenishment definesc cand o locatie de picking are nevoie de refacerea stocului. Ele nu creeaza automat lucru si nu muta stocul. Taskurile raman manuale, iar doar Finalizeaza replenishment modifica stocul.",
      targetLocationRuleEyebrow: "Regula pentru locatia tinta",
      targetLocationRuleDescription:
        "Locatiile tinta din acest flux trebuie sa fie active, neblocate si de tip PICKING. Replenishment ramane distinct de transfer si putaway.",
      createTitle: "Creeaza regula de replenishment",
      createDescription:
        "Defineste pragul si nivelul tinta de stoc pentru o locatie de picking. Crearea taskurilor ramane manuala.",
      createSubmit: "Creeaza regula",
      productLabel: "Produs",
      selectProduct: "Selecteaza un produs",
      targetLocationLabel: "Locatie tinta de picking",
      selectTargetLocation: "Selecteaza o locatie PICKING",
      minimumThresholdLabel: "Prag minim",
      minimumThresholdPlaceholder: "4",
      targetQuantityLabel: "Cantitate tinta",
      targetQuantityPlaceholder: "10",
      optionsRequired:
        "O regula de replenishment are nevoie atat de optiuni de produse, cat si de locatii PICKING valide, active si neblocate. Incarca aceste intrari inainte de a crea sau edita o regula.",
      pending: "Se salveaza...",
    },
    detail: {
      title: "Regula de replenishment pentru {productName}",
      description:
        "Aceasta regula defineste cand o locatie tinta de picking trebuie refacuta si la ce nivel de stoc ar trebui sa revina. Taskurile raman explicite si doar finalizarea lor modifica stocul.",
      backToList: "Inapoi la reguli",
      metrics: {
        minimumThreshold: "Prag minim",
        targetQuantity: "Cantitate tinta",
        created: "Creat",
        updated: "Actualizat",
      },
      actionBlockedEyebrow: "Actiune asupra regulii blocata",
      summaryEyebrow: "Rezumat regula",
      ruleId: "Id regula",
      targetPath: "Traseu tinta",
      targetLocationName: "Nume locatie tinta",
      lifecycleEyebrow: "Ciclul de viata al regulii",
      lifecycleDescription:
        "Dezactivarea unei reguli opreste taskurile manuale noi de replenishment sa se bazeze pe ea. Nu modifica stocul si nu elimina taskurile istorice de replenishment.",
      deactivate: "Dezactiveaza regula",
      inactiveMessage: "Aceasta regula este deja inactiva.",
      editTitle: "Editeaza regula de replenishment",
      editDescription:
        "Pastreaza regula aliniata cu produsul corect si cu locatia tinta de picking. Crearea taskurilor ramane manuala.",
      editSubmit: "Salveaza modificarile regulii",
      targetLocationEyebrow: "Locatie tinta de picking",
      targetLocationDescription:
        "Tintele de replenishment trebuie sa ramana active, neblocate si de tip PICKING, astfel incat acest flux sa ramana distinct de transfer si putaway.",
    },
    actions: {
      createFallback:
        "Regula de replenishment nu poate fi creata acum.",
      updateFallback:
        "Modificarile regulii de replenishment nu pot fi salvate acum.",
      deactivateFallback:
        "Regula de replenishment nu poate fi dezactivata.",
      fieldsRequired:
        "Produsul, locatia tinta, pragul minim si cantitatea tinta sunt obligatorii.",
      minimumThresholdValid:
        "Pragul minim trebuie sa fie zero sau mai mare.",
      targetQuantityValid:
        "Cantitatea tinta trebuie sa fie mai mare decat pragul minim.",
    },
  },
  replenishmentTasks: {
    route: {
      listUnavailableTitle:
        "Taskurile de replenishment nu au putut fi incarcate",
      listUnavailableFallback:
        "Backend-ul nu a returnat un raspuns utilizabil pentru taskurile de replenishment.",
      detailUnavailableTitle:
        "Taskul de replenishment nu a putut fi incarcat",
      detailUnavailableFallback:
        "Backend-ul nu a returnat taskul de replenishment cerut.",
      createBalancesFallback:
        "Randurile de stoc sursa pentru crearea taskului de replenishment nu au putut fi incarcate.",
      createLocationsFallback:
        "Locatiile tinta de picking pentru crearea taskului de replenishment nu au putut fi incarcate.",
      ruleDataWarning:
        "Pragurile regulilor nu au putut fi incarcate pentru imbogatirea paginii pentru Admin.",
    },
    list: {
      eyebrow: "Flux de replenishment",
      title: "Refacerea manuala a stocului in locatiile de picking",
      description:
        "Replenishment ramane distinct de putaway si transfer. Taskurile sunt manuale, iar Finalizeaza replenishment modifica stocul.",
      actionBlockedEyebrow: "Actiune de flux blocata",
      ruleContextUnavailableEyebrow: "Contextul regulii este indisponibil",
      searchLabel: "Cautare",
      searchPlaceholder:
        "Cauta dupa produs, sursa, tinta sau id-ul regulii",
      statusLabel: "Stare",
      openTasksFirst: "Taskurile deschise mai intai",
      allTasks: "Toate taskurile",
      resultsLabel: "Rezultate",
      resultsTemplate: "Se afiseaza {filtered} din {total}",
      sourceTarget: "Sursa {source} -> tinta {target}",
      quantityLabel: "Cantitate {quantity}",
      linkedRule: "Regula legata {ruleId}",
      ruleSummary:
        "Regula prag minim {minimumThreshold} -> tinta {targetQuantity}",
      viewDetails: "Vezi detalii",
      metrics: {
        created: "Creat",
        started: "Pornit",
        completed: "Finalizat",
        cancelled: "Anulat",
      },
      notStarted: "Nepornit",
      notCompleted: "Nefinalizat",
      notCancelled: "Neanulat",
      start: "Porneste taskul",
      complete: "Finalizeaza replenishment",
      cancel: "Anuleaza taskul",
      emptyEyebrow: "Niciun task de replenishment potrivit",
      emptyMessage:
        "Ajusteaza cautarea curenta sau filtrul de stare pentru a readuce in vizualizare munca de replenishment.",
    },
    form: {
      emptyEyebrow: "Creeaza task de replenishment",
      emptyMessage:
        "Nu exista in acest moment randuri de stoc sursa active, cu disponibil pozitiv, pregatite pentru planificarea manuala a replenishmentului.",
      eyebrow: "Creeaza task de replenishment",
      description:
        "Crearea taskului ramane manuala si neutra fata de stoc. Finalizeaza replenishment muta stocul in locatia de picking selectata.",
      meaningEyebrow: "Sensul fluxului",
      meaningDescription:
        "Replenishment este separat de transfer si putaway. Regulile definesc cand o locatie de picking trebuie refacuta, taskurile sunt explicite si doar finalizarea modifica stocul.",
      sourceStockLabel: "Stoc sursa",
      availableTemplate: "disponibil {value}",
      sourceLabel: "Sursa",
      availableToMoveLabel: "Disponibil de mutat",
      sourceCaptionTemplate: "{path} | tip {type}",
      quantitySummaryTemplate: "On hand {onHand} | rezervat {reserved}",
      targetLocationLabel: "Locatie tinta de picking",
      noValidTargets: "Nu exista locatii PICKING valide",
      quantityLabel: "Cantitate de mutat",
      quantityPlaceholder:
        "Introdu cantitatea manuala pentru replenishment",
      targetAvailableNowLabel: "Disponibil acum in tinta",
      targetBalanceCaptionTemplate:
        "On hand {onHand} | rezervat {reserved}",
      noTargetBalance:
        "Nu exista in prezent un rand de balanta pentru acest produs in locatia tinta.",
      matchedRuleLabel: "Regula potrivita",
      matchedRuleValue:
        "Prag minim {minimumThreshold} -> tinta {targetQuantity}",
      matchedRuleCaption:
        "Produsul si locatia tinta selectate corespund unei reguli active de replenishment.",
      ruleCheckLabel: "Verificare regula",
      ruleValidationLabel: "Validare bazata pe regula",
      noMatchingRule: "Nu exista regula activa potrivita",
      validatedByBackend: "Validat de backend la trimitere",
      ruleCheckCaption:
        "Crearea taskului necesita in continuare o regula activa pentru acest produs si aceasta locatie tinta.",
      backendValidationCaption:
        "Crearea taskului pentru Depozit ramane manuala, iar backend-ul confirma regula potrivita si conditiile de prag.",
      noValidTargetMessage:
        "Nu exista locatii tinta de picking valide pentru aceasta sursa. Tinta trebuie sa fie activa, neblocata, diferita de sursa si de tip PICKING.",
      createSubmit: "Creeaza task de replenishment",
      pending: "Se salveaza...",
    },
    detail: {
      title: "Task de replenishment pentru {productName}",
      description:
        "Acest task reface stocul intr-o locatie de picking si ramane distinct de putaway si transfer. Finalizeaza replenishment modifica stocul aici.",
      backToList: "Inapoi la taskurile de replenishment",
      metrics: {
        quantity: "Cantitate de mutat",
        created: "Creat",
        started: "Pornit",
        completed: "Finalizat",
      },
      notStarted: "Nepornit",
      notCompleted: "Nefinalizat",
      actionBlockedEyebrow: "Actiune de flux blocata",
      workflowActionsEyebrow: "Actiuni de flux",
      workflowActionsDescription:
        "Crearea, pornirea sau anularea taskului nu muta stocul. Finalizarea taskului scrie relocarea in locatia tinta de picking.",
      start: "Porneste taskul",
      complete: "Finalizeaza replenishment",
      cancel: "Anuleaza taskul",
      noFurtherAction:
        "Nu mai este disponibila nicio actiune de executie pentru rolul curent si starea taskului.",
      ruleContextEyebrow: "Context bazat pe regula",
      taskId: "Id task",
      linkedRuleId: "Id regula legata",
      minimumThreshold: "Prag minim",
      targetQuantity: "Cantitate tinta",
      ruleDetailVisibility: "Vizibilitate detaliu regula",
      ruleDetailVisibilityMessage:
        "Contractul actual din backend expune detaliul regulii de replenishment doar pentru Admin.",
      sourceLocationEyebrow: "Locatie sursa",
      sourceLocationDescription:
        "Stocul sursa ramane explicit in acest flux. Sursa trebuie sa fie activa, dar replenishment nu adauga o regula mai stricta pentru sursa blocata.",
      targetLocationEyebrow: "Locatie tinta de picking",
      targetLocationDescription:
        "Tinta trebuie sa fie o locatie PICKING activa si neblocata, astfel incat replenishment sa ramana distinct de transferul generic si de putaway.",
    },
    actions: {
      createFallback:
        "Taskul de replenishment nu poate fi creat acum.",
      startFallback:
        "Taskul de replenishment nu poate fi pornit acum.",
      completeFallback:
        "Taskul de replenishment nu poate fi finalizat. Verifica stocul sursa si conditiile regulii pentru tinta.",
      cancelFallback:
        "Taskul de replenishment nu poate fi anulat acum.",
      idRequired: "Id-ul taskului de replenishment este obligatoriu.",
      fieldsRequired:
        "Stocul sursa, locatia tinta de picking si cantitatea sunt obligatorii.",
      targetDifferent:
        "Locatia tinta trebuie sa fie diferita de locatia sursa.",
      quantityValid:
        "Cantitatea de replenishment trebuie sa fie un numar valid mai mare decat zero.",
    },
  },
  salesOrders: {
    route: {
      listUnavailableTitle:
        "Comenzile de vanzare nu au putut fi incarcate",
      listUnavailableFallback:
        "Backend-ul nu a returnat un raspuns utilizabil pentru comenzile de vanzare.",
      createProductsFallback:
        "Produsele pentru crearea comenzii de vanzare nu au putut fi incarcate acum.",
      createCustomersFallback:
        "Clientii pentru crearea comenzii de vanzare nu au putut fi incarcati acum.",
      detailUnavailableTitle:
        "Comanda de vanzare nu a putut fi incarcata",
      detailUnavailableFallback:
        "Backend-ul nu a returnat comanda de vanzare ceruta.",
      editProductsFallback:
        "Produsele pentru editarea ciornei nu au putut fi incarcate acum.",
      editCustomersFallback:
        "Clientii pentru editarea ciornei nu au putut fi incarcati acum.",
    },
    list: {
      eyebrow: "Flux comenzi de vanzare",
      title: "Introducere cerere cu rezultate explicite ale rezervarii",
      description:
        "Comenzile de vanzare inregistreaza cererea fara sa mute stocul. Confirmarea incearca rezervarea si modifica doar cantitatea rezervata si disponibilitatea.",
      actionBlockedEyebrow: "Actiune de flux blocata",
      searchLabel: "Cautare",
      searchPlaceholder: "Cauta dupa id comanda, produs sau stare",
      statusLabel: "Stare",
      activeOrdersFirst: "Comenzile active mai intai",
      allOrders: "Toate comenzile",
      resultsLabel: "Rezultate",
      resultsTemplate: "Se afiseaza {filtered} din {total}",
      exportLabel: "Exporta comenzile de vanzare",
      exportEmptyLabel:
        "Nu exista randuri de comenzi de vanzare pentru export",
      orderBadgeTemplate: "Comanda {id}",
      customerSummaryTemplate: "Client {customer}",
      lineCountTemplate: "{count} linie{suffix} de produs",
      moreTemplate: "{preview} +{count} in plus",
      legacyUnassigned: "Legacy / nealocat",
      unknownCustomerState: "Necunoscut",
      viewDetails: "Vezi detalii",
      metrics: {
        ordered: "Comandat",
        reserved: "Rezervat",
        unreserved: "Nerezervat",
        confirmed: "Confirmat",
        cancelled: "Anulat",
      },
      notConfirmed: "Neconfirmat",
      notCancelled: "Neanulat",
      confirm: "Confirma si incearca rezervarea",
      cancel: "Anuleaza comanda",
      emptyEyebrow: "Nu exista comenzi de vanzare potrivite",
      emptyMessage:
        "Ajusteaza cautarea curenta sau filtrul de stare pentru a readuce in vizualizare cererea si munca de rezervare.",
      createTitle: "Creeaza comanda de vanzare",
      createDescription:
        "Inregistreaza cererea cu un client mentinut explicit si linii de produse. Rezervarea are loc mai tarziu, cand Vanzari confirma comanda.",
      createSubmit: "Creeaza comanda de vanzare",
      exportColumns: {
        orderId: "Id comanda",
        status: "Stare",
        customerCode: "Cod client",
        customerName: "Nume client",
        customerIsActive: "Client activ",
        createdAtUtc: "Creat la",
        updatedAtUtc: "Actualizat la",
        confirmedAtUtc: "Confirmat la",
        cancelledAtUtc: "Anulat la",
        productSku: "SKU produs",
        productName: "Nume produs",
        orderedQuantity: "Cantitate comandata",
        reservedQuantity: "Cantitate rezervata",
        pickedQuantity: "Cantitate pickata",
        unreservedQuantity: "Cantitate nerezervata",
        reservationRowCount: "Randuri de rezervare",
      },
    },
      form: {
        stockImpactEyebrow: "Impact asupra stocului",
        stockImpactDescription:
          "Redactarea comenzii de vanzare este neutra fata de stoc. Confirmarea ulterioara a comenzii incearca rezervarea pe baza stocului curent, ceea ce modifica cantitatea rezervata si disponibilitatea, dar nu stocul on-hand.",
      readinessEyebrow: "Pregatire pentru redactare",
      readinessDescription:
        "Redactarea comenzii de vanzare are nevoie de un client mentinut activ si de cel putin o linie cu produs mentinut.",
      noActiveCustomers:
        "Nu exista clienti activi disponibili acum. Creeaza sau reactiveaza un client inainte de a salva modificarile comenzii de vanzare.",
      noProducts:
        "Nu exista produse mentinute disponibile acum. Adauga produse inainte de a crea sau actualiza linii de comanda de vanzare.",
      inactiveCustomerRequired:
        "Aceasta ciorna are nevoie de selectarea unui client mentinut activ inainte sa poata fi salvata din nou.",
      customerLabel: "Client",
      selectCustomer: "Selecteaza un client",
      noActiveCustomersOption: "Nu exista clienti activi disponibili",
      legacyInactiveCustomerTemplate:
        "Client legacy / inactiv: {customer} (necesita reselectare)",
      legacyWithoutCustomerOption:
        "Comanda legacy fara client mentinut (selecteaza un client)",
      customerHelp:
        "Selecteaza un client mentinut activ. Clientii legacy sau inactivi raman vizibili pentru referinta, dar nu ar trebui reutilizati pentru redactarea de comenzi noi.",
      linesTitle: "Linii ale comenzii de vanzare",
        linesDescription:
          "Adauga produse si cantitati comandate. Rezultatele rezervarii apar mai tarziu pe pagina de detaliu, dupa o incercare de confirmare.",
        productsRequired:
          "Sunt necesare produse inainte ca liniile comenzii de vanzare sa poata fi adaugate.",
        barcodeContextLabel: "linia comenzii de vanzare",
        barcodeApplied:
          "Produsul a fost aplicat pe linia {lineNumber} a comenzii de vanzare.",
        barcodeAdded:
          "Produsul a fost adaugat ca linie noua {lineNumber} in comanda de vanzare.",
        addLine: "Adauga linie",
        productLabel: "Produs {index}",
      selectProduct: "Selecteaza un produs",
      noProductsOption: "Nu exista produse disponibile",
      orderedQuantityLabel: "Cantitate comandata",
      quantityPlaceholder: "10",
      removeLine: "Elimina",
      pending: "Se salveaza...",
    },
    detail: {
      titleTemplate: "Comanda de vanzare {id}",
      headerBadge: "Comanda de vanzare",
      description:
        "Aceasta comanda face inca parte din planificarea cererii si a rezervarii. Nu muta fizic stocul. Confirmarea incearca rezervarea pe baza stocului curent, rezervarea modifica cantitatea rezervata, iar pickingul sau expedierea nu au avut loc inca.",
      backToList: "Inapoi la comenzile de vanzare",
      metrics: {
        lines: "Linii",
        customer: "Client",
        ordered: "Comandat",
        reserved: "Rezervat",
        confirmed: "Confirmat",
        cancelled: "Anulat",
      },
      notConfirmed: "Neconfirmat",
      notCancelled: "Neanulat",
      actionBlockedEyebrow: "Actiune de flux blocata",
      workflowActionsEyebrow: "Actiuni de flux",
      workflowActionsDescription:
        "Editarea ciornei ramane neutra fata de stoc. Confirmarea ruleaza din nou alocarea rezervarii pentru aceasta comanda. Anularea elibereaza orice rezervari care exista deja.",
      confirm: "Confirma si incearca rezervarea",
      cancel: "Anuleaza comanda",
      noFurtherAction:
        "Nu mai este disponibila nicio actiune de flux pentru rolul curent si starea comenzii.",
      summaryEyebrow: "Rezumat comanda",
      salesOrderId: "Id comanda de vanzare",
      customer: "Client",
      updated: "Actualizat",
      unreservedQuantity: "Cantitate nerezervata",
      editTitle: "Editeaza ciorna comenzii de vanzare",
      editDescription:
        "Modificarile ciornei raman neutre fata de stoc. Pastreaza clientul mentinut explicit inainte ca detaliul rezervarii sa fie generat prin incercarile de confirmare.",
      editSubmit: "Actualizeaza ciorna",
      lineMetrics: {
        ordered: "Comandat",
        reserved: "Rezervat",
        unreserved: "Nerezervat",
      },
      reservationDetailEyebrow: "Detaliu rezervare",
      reservationDetailDescription:
        "Randurile de rezervare sunt doar pentru afisare in aceasta interfata. Ele arata ce randuri de balanta poarta in prezent angajamentul logic de stoc pentru aceasta linie de comanda.",
      noReservationRows:
        "In prezent nu exista randuri de rezervare alocate pentru aceasta linie.",
      reservedQuantityTemplate: "Cantitate rezervata {quantity}",
      balanceRowTemplate: "Rand balanta {id}",
      legacyWithoutCustomer:
        "Comanda legacy fara client mentinut",
    },
    actions: {
      createFallback:
        "Comanda de vanzare nu poate fi creata acum.",
      updateFallback:
        "Ciorna comenzii de vanzare nu poate fi actualizata acum.",
      confirmFallback:
        "Comanda de vanzare nu poate fi confirmata acum. Rezervarea nu a putut fi finalizata.",
      cancelFallback:
        "Comanda de vanzare nu poate fi anulata acum.",
      idRequired:
        "Id-ul comenzii de vanzare este obligatoriu.",
      customerRequired: "Clientul este obligatoriu.",
      atLeastOneLine:
        "Este necesara cel putin o linie pentru comanda de vanzare.",
      lineParseError:
        "Liniile comenzii de vanzare nu au putut fi interpretate corect.",
      productRequired: "Produsul {index} este obligatoriu.",
      orderedQuantityValid:
        "Cantitatea comandata pentru linia {index} trebuie sa fie mai mare decat zero.",
    },
  },
  pickingTasks: {
    route: {
      listUnavailableTitle:
        "Taskurile de picking nu au putut fi incarcate",
      listUnavailableFallback:
        "Backend-ul nu a returnat un raspuns utilizabil pentru taskurile de picking.",
      detailUnavailableTitle:
        "Taskul de picking nu a putut fi incarcat",
      detailUnavailableFallback:
        "Backend-ul nu a returnat taskul de picking cerut.",
      createSalesOrdersFallback:
        "Cererea rezervata din comenzile de vanzare pentru crearea taskului de picking nu a putut fi incarcata.",
    },
    list: {
      eyebrow: "Flux de picking",
      title: "Executia in depozit a cererii rezervate pe iesire",
      description:
        "Pickingul executa cererea rezervata explicit. Finalizarea muta cantitatea din rezervat in pickat-dar-neexpediat, iar on hand ramane neschimbat.",
      actionBlockedEyebrow: "Actiune de flux blocata",
      searchLabel: "Cautare",
      searchPlaceholder:
        "Cauta dupa comanda, produs, sursa sau rezervare",
      statusLabel: "Stare",
      openTasksFirst: "Taskurile deschise mai intai",
      allTasks: "Toate taskurile",
      resultsLabel: "Rezultate",
      resultsTemplate: "Se afiseaza {filtered} din {total}",
      orderBadgeTemplate: "Comanda {id}",
      lineCountTemplate: "{count} linie{suffix} de picking",
      moreTemplate: "{preview} +{count} in plus",
      sourceSummaryTemplate: "Surse {sources}",
      executionBoundary:
        "Pickingul ramane doar in starea rezervat si pickat. Aici nu a avut loc nicio expediere.",
      viewDetails: "Vezi detalii",
      metrics: {
        toPick: "De pickat",
        picked: "Pickat",
        created: "Creat",
        started: "Pornit",
        completed: "Finalizat",
      },
      notStarted: "Nepornit",
      notCompleted: "Nefinalizat",
      start: "Porneste taskul",
      complete: "Finalizeaza pickingul",
      cancel: "Anuleaza taskul",
      emptyEyebrow: "Niciun task de picking potrivit",
      emptyMessage:
        "Ajusteaza cautarea curenta sau filtrul de stare pentru a readuce in vizualizare executia cererii rezervate.",
    },
    form: {
      emptyEyebrow: "Creeaza task de picking",
      emptyMessage:
        "Nicio comanda de vanzare nu expune in prezent cerere ramasa bazata pe rezervari pentru un nou task de picking.",
      eyebrow: "Creeaza task de picking",
      description:
        "Taskurile de picking raman explicite si bazate pe rezervari. Crearea unui task nu modifica stocul. Finalizeaza pickingul este singurul pas care muta cantitatea din rezervat in pickat-dar-neexpediat.",
      meaningEyebrow: "Sensul fluxului",
      meaningDescription:
        "Pickingul executa cererea rezervata. Nu este expediere, nu reduce on hand si nu introduce comportament de wave, batch sau optimizare de traseu.",
      salesOrderLabel:
        "Comanda de vanzare cu cerere rezervata ramasa",
      salesOrderOptionTemplate:
        "Comanda {id} | {status} | {count} linie bazata pe rezervare{suffix}",
      summary: {
        orderStatus: "Stare comanda",
        currentReservedQuantity: "Cantitate rezervata curenta",
        alreadyPickedQuantity: "Cantitate deja pickata",
        orderStatusCaption:
          "Pickingul ramane separat de rezervare si expediere.",
        currentReservedQuantityCaption:
          "Cantitatea rezervata ramane un angajament logic, nu expediere.",
        alreadyPickedQuantityCaption:
          "Cantitatea pickata ramane explicita pana cand expedierea exista mai tarziu.",
      },
      linesTitle: "Linii de task bazate pe rezervari",
      linesDescription:
        "Selecteaza cantitatile rezervate pe care Depozit ar trebui sa le execute acum. Cantitatea pickabila ramasa este afisata conservator dupa scaderea cantitatilor deja atribuite taskurilor deschise.",
      selectedCountTemplate:
        "{count} linie{suffix} selectata",
      includeInTask: "Include in task",
      metrics: {
        reservationQuantity: "Cantitate rezervata",
        alreadyPicked: "Deja pickata",
        openTaskAssigned: "Asignata taskurilor deschise",
        pickableNow: "Pickabila acum",
        quantityToPick: "Cantitate de pickat",
      },
      captions: {
        reservationQuantity:
          "Cantitatea rezervata curenta ramasa pe acest rand de rezervare.",
        alreadyPicked:
          "Cantitatea istorica deja pickata din aceasta rezervare.",
        openTaskAssigned:
          "Scadere conservatoare pe client din taskurile de picking deschise.",
        pickableNow:
          "Cantitatea ramasa disponibila pentru o noua linie de task.",
        selectToSet:
          "Selecteaza acest rand pentru a seta cantitatea de pickat.",
      },
      sourceTemplate: "Sursa {path} - {name}",
      reservationTemplate: "Rezervare {id}",
      createSubmit: "Creeaza task de picking",
      pending: "Se salveaza...",
    },
    detail: {
      titleTemplate: "Task de picking {id}",
      orderBadgeTemplate: "Comanda {id}",
      description:
        "Pickingul executa cererea rezervata si ramane separat de expediere. Finalizarea acestui task muta cantitatea doar in starea pickat-dar-neexpediat, in timp ce on hand ramane neschimbat.",
      viewSalesOrder: "Vezi comanda de vanzare",
      backToList: "Inapoi la taskurile de picking",
      metrics: {
        lines: "Linii",
        toPick: "De pickat",
        picked: "Pickat",
        created: "Creat",
        completed: "Finalizat",
      },
      notCompleted: "Nefinalizat",
      actionBlockedEyebrow: "Actiune de flux blocata",
      workflowActionsEyebrow: "Actiuni de flux",
      workflowActionsDescription:
        "Crearea, pornirea sau anularea taskului nu modifica starea stocului. Finalizeaza pickingul reduce cantitatea rezervata si creste cantitatea pickata.",
      start: "Porneste taskul",
      complete: "Finalizeaza pickingul",
      cancel: "Anuleaza taskul",
      noFurtherAction:
        "Nu mai este disponibila nicio actiune de executie pentru rolul curent si starea taskului.",
      summaryEyebrow: "Rezumat picking",
      pickingTaskId: "Id task picking",
      salesOrderId: "Id comanda de vanzare",
      started: "Pornit",
      cancelled: "Anulat",
      notStarted: "Nepornit",
      notCancelled: "Neanulat",
      sourceTemplate: "Sursa {path} - {name}",
      lineExecutionBoundary:
        "Pickingul executa exact aceasta cantitate rezervata si nu reprezinta expediere.",
      lineMetrics: {
        toPick: "De pickat",
        picked: "Pickat",
        reservation: "Rezervare",
        balanceRow: "Rand balanta",
      },
      reservationId: "Id rezervare",
      inventoryBalanceId: "Id balanta stoc",
      salesOrderLineId: "Id linie comanda de vanzare",
    },
    actions: {
      createFallback:
        "Taskul de picking nu poate fi creat acum.",
      startFallback:
        "Taskul de picking nu poate fi pornit acum.",
      completeFallback:
        "Taskul de picking nu poate fi finalizat. Verifica daca cererea rezervata este inca disponibila.",
      cancelFallback:
        "Taskul de picking nu poate fi anulat acum.",
      idRequired: "Id-ul taskului de picking este obligatoriu.",
      salesOrderRequired:
        "Trebuie selectata o comanda de vanzare inainte de a crea un task de picking.",
      lineRequired:
        "Selecteaza cel putin o linie bazata pe rezervare pentru picking.",
      lineParseError:
        "Liniile taskului de picking nu au putut fi interpretate corect.",
      reservationRequired: "Rezervarea {index} este obligatorie.",
      reservationUnique:
        "Fiecare rezervare poate fi adaugata o singura data in task.",
      quantityValid:
        "Cantitatea de pickat pentru linia {index} trebuie sa fie mai mare decat zero.",
    },
  },
  shipments: {
    route: {
      listUnavailableTitle: "Expedierile nu au putut fi incarcate",
      listUnavailableFallback:
        "Backend-ul nu a returnat un raspuns utilizabil pentru expediere.",
      detailUnavailableTitle: "Expedierea nu a putut fi incarcata",
      detailUnavailableFallback:
        "Backend-ul nu a returnat expedierea ceruta.",
      createPickingTasksFallback:
        "Lucrul finalizat de picking pentru crearea expedierii nu a putut fi incarcat.",
    },
    list: {
      eyebrow: "Flux de expediere",
      title: "Scaderea finala pe iesire din cerere pickata explicit",
      description:
        "Expedierea ramane separata de picking. Finalizarea reduce atat stocul pickat, cat si on hand; facturarea, plata, curierul, etichetele si dispatch-ul sunt in afara acestui UI.",
      actionBlockedEyebrow: "Actiune de flux blocata",
      searchLabel: "Cautare",
      searchPlaceholder:
        "Cauta dupa expediere, comanda, picking, produs sau sursa",
      statusLabel: "Stare",
      openShipmentsFirst: "Expedierile deschise mai intai",
      allShipments: "Toate expedierile",
      resultsLabel: "Rezultate",
      resultsTemplate: "Se afiseaza {filtered} din {total}",
      orderBadgeTemplate: "Comanda {id}",
      lineCountTemplate: "{count} linie{suffix} de expediere",
      moreTemplate: "{preview} +{count} in plus",
      pickingTasksTemplate: "Taskuri picking {tasks}",
      sourceTemplate: "Surse {sources}",
      workflowBoundary:
        "Expedierea este pasul final de scadere pe iesire, nu o actiune de picking sau un flux financiar.",
      viewDetails: "Vezi detalii",
      metrics: {
        toShip: "De expediat",
        shipped: "Expediat",
        created: "Creat",
        started: "Pornit",
        completed: "Finalizat",
      },
      notStarted: "Nepornit",
      notCompleted: "Nefinalizat",
      start: "Porneste expedierea",
      complete: "Finalizeaza expedierea",
      cancel: "Anuleaza expedierea",
      emptyEyebrow: "Nicio expediere potrivita",
      emptyMessage:
        "Ajusteaza cautarea curenta sau filtrul de stare pentru a readuce in vizualizare munca de expediere pe iesire.",
    },
    form: {
      emptyEyebrow: "Creeaza expediere",
      emptyMessage:
        "Nicio linie din taskurile de picking finalizate nu expune in prezent cantitate ramasa expediabila.",
      eyebrow: "Creeaza expediere",
      description:
        "Expedierea ramane explicita si bazata pe cerere pickata. Crearea unei expedieri nu modifica stocul. Finalizeaza expedierea este singurul pas care reduce atat stocul pickat, cat si on hand.",
      meaningEyebrow: "Sensul fluxului",
      meaningDescription:
        "Expedierea nu este picking. Este pasul final de scadere a stocului pe iesire si nu include facturare, plata, curieri, etichete sau orchestrare de dispatch.",
      salesOrderLabel:
        "Comanda de vanzare cu cerere pickata ramasa",
      salesOrderOptionTemplate:
        "Comanda {id} | {status} | {count} linie expediabila{suffix}",
      summary: {
        orderStatus: "Stare comanda",
        pickedQuantity: "Cantitate pickata",
        shippableNow: "Expediabila acum",
        orderStatusCaption:
          "Expedierea ramane separata de modificarile de stare ale comenzii de vanzare.",
        pickedQuantityCaption:
          "Cantitatea pickata este starea curenta a stocului pregatit pentru iesire.",
        shippableNowCaption:
          "Cantitate conservatoare dupa istoricul expedierilor si alocarile deschise de expediere.",
      },
      linesTitle: "Linii de expediere din cerere pickata",
      linesDescription:
        "Selecteaza doar liniile pickate pe care Depozit ar trebui sa le expedieze acum. Cantitatea expediabila ramasa este afisata conservator dupa scaderea istoricului expedierilor finalizate si a alocarilor din expedierile deschise.",
      selectedCountTemplate:
        "{count} linie{suffix} selectata",
      includeInShipment: "Include in expediere",
      sourceTemplate: "Sursa {path} - {name}",
      pickingTaskTemplate: "Task picking {id}",
      pickingTaskLineTemplate: "Linie task picking {id}",
      completedPickingTemplate: "Picking {status}",
      metrics: {
        pickedQuantity: "Cantitate pickata",
        alreadyShipped: "Deja expediata",
        openShipmentAssigned: "Asignata expedierilor deschise",
        shippableNow: "Expediabila acum",
        quantityToShip: "Cantitate de expediat",
      },
      captions: {
        pickedQuantity:
          "Cantitatea istorica pickata pe aceasta linie din taskul de picking finalizat.",
        alreadyShipped:
          "Istoricul expedierilor finalizate deja executate din aceasta linie pickata.",
        openShipmentAssigned:
          "Scadere conservatoare din expedierile aflate in asteptare si in desfasurare.",
        shippableNow:
          "Cantitatea ramasa disponibila pentru o noua linie de expediere.",
        selectToSet:
          "Selecteaza acest rand pentru a seta cantitatea de expediat.",
      },
      createSubmit: "Creeaza expediere",
      pending: "Se salveaza...",
    },
    detail: {
      titleTemplate: "Expediere {id}",
      orderBadgeTemplate: "Comanda {id}",
      description:
        "Expedierea este pasul final de scadere a stocului pe iesire. Finalizarea reduce atat stocul pickat, cat si on hand.",
      viewSalesOrder: "Vezi comanda de vanzare",
      backToList: "Inapoi la expedieri",
      metrics: {
        lines: "Linii",
        toShip: "De expediat",
        shipped: "Expediat",
        created: "Creat",
        completed: "Finalizat",
      },
      notCompleted: "Nefinalizat",
      actionBlockedEyebrow: "Actiune de flux blocata",
      workflowActionsEyebrow: "Actiuni de flux",
      workflowActionsDescription:
        "Crearea, pornirea sau anularea expedierii nu modifica starea stocului. Finalizeaza expedierea este singura actiune de aici care reduce cantitatea pickata si on hand.",
      start: "Porneste expedierea",
      complete: "Finalizeaza expedierea",
      cancel: "Anuleaza expedierea",
      noFurtherAction:
        "Nu mai este disponibila nicio actiune de executie pentru rolul curent si starea expedierii.",
      summaryEyebrow: "Rezumat expediere",
      shipmentId: "Id expediere",
      salesOrderId: "Id comanda de vanzare",
      pickingTasks: "Taskuri de picking",
      started: "Pornit",
      cancelled: "Anulat",
      notStarted: "Nepornit",
      notCancelled: "Neanulat",
      sourceTemplate: "Sursa {path} - {name}",
      lineWorkflowBoundary:
        "Legatura cu taskul de picking si cu cererea pickata ramane vizibila aici, dar aceasta pagina nu se transforma intr-un banc de lucru pentru curier, etichete, dispatch sau finante.",
      lineMetrics: {
        toShip: "De expediat",
        shipped: "Expediat",
        pickingTask: "Task picking",
        pickingLine: "Linie picking",
      },
      pickingTaskId: "Id task picking",
      pickingTaskLineId: "Id linie task picking",
      reservationId: "Id rezervare",
      inventoryBalanceId: "Id balanta stoc",
    },
    actions: {
      createFallback:
        "Expedierea nu poate fi creata acum.",
      startFallback:
        "Expedierea nu poate fi pornita acum.",
      completeFallback:
        "Expedierea nu poate fi finalizata. Verifica daca cantitatea pickata este inca disponibila.",
      cancelFallback:
        "Expedierea nu poate fi anulata acum.",
      idRequired: "Id-ul expedierii este obligatoriu.",
      salesOrderRequired:
        "Trebuie selectata o comanda de vanzare inainte de a crea o expediere.",
      lineRequired:
        "Selecteaza cel putin o linie pickata pentru a o include in expediere.",
      lineParseError:
        "Liniile expedierii nu au putut fi interpretate corect.",
      pickedLineRequired:
        "Linia pickata {index} este obligatorie.",
      pickedLineUnique:
        "Fiecare linie pickata poate fi adaugata o singura data in expediere.",
      quantityValid:
        "Cantitatea de expediat pentru linia {index} trebuie sa fie mai mare decat zero.",
    },
  },
  products: {
    route: {
      listUnavailableTitle: "Produsele nu au putut fi incarcate",
      listUnavailableFallback:
        "Backend-ul nu a returnat un raspuns utilizabil pentru produse.",
      categoriesFallback:
        "Categoriile de produse nu au putut fi incarcate pentru actiunile de Admin.",
      unitsFallback:
        "Unitatile de masura nu au putut fi incarcate pentru actiunile de Admin.",
      detailUnavailableTitle:
        "Produsul solicitat nu a putut fi incarcat",
      detailUnavailableFallback:
        "Backend-ul nu a returnat produsul solicitat.",
    },
    shared: {
      barcode: "Cod de bare",
      category: "Categorie",
      unitOfMeasure: "Unitate de masura",
      pickingBaseline: "Baza de picking",
      notSet: "Nesetat",
      noDescription: "Nu a fost furnizata nicio descriere.",
      pickingBaselineTemplate: "Min {min} / Tinta {target}",
    },
    list: {
      eyebrow: "Catalog produse",
      title:
        "Vizibilitate conectata asupra produselor, cu fluxuri administrative de mentenanta",
      description:
        "Aceasta pagina foloseste direct API-urile protejate de produse din backend. Vanzari, Depozit si Admin pot citi produsele, iar Admin poate crea si mentine date master fara a folosi stergere hard.",
      viewDetails: "Vezi detalii",
      emptyEyebrow: "Niciun produs nu s-a potrivit",
      emptyMessage:
        "Ajusteaza cautarea sau filtrul de stare pentru a readuce produsele in vizualizare.",
      createTitle: "Flux de creare pentru Admin",
      createDescription:
        "Creeaza un nou produs folosind datele master existente pentru categorie si unitate de masura.",
      createSubmit: "Creeaza produs",
    },
    setup: {
      eyebrow: "Prerechizite produs",
      title: "Configurare catalog",
      categoriesLabel: "Categorii",
      unitsLabel: "Unitati",
      countTemplate: "{count} configurate",
      missingBoth:
        "Creeaza cel putin o categorie si o unitate de masura inainte de a adauga produse.",
      missingCategories:
        "Creeaza cel putin o categorie inainte de a adauga produse.",
      missingUnits:
        "Creeaza cel putin o unitate de masura inainte de a adauga produse.",
      ready:
        "Prerechizitele de categorie si unitate sunt pregatite. Crearea produselor este disponibila mai jos.",
      productCreationLocked:
        "Crearea produselor se deblocheaza dupa ce exista cel putin o categorie si o unitate de masura.",
      categoryNameLabel: "Categorie noua",
      categoryNamePlaceholder: "Produse finite",
      unitNameLabel: "Unitate de masura noua",
      unitNamePlaceholder: "Bucata",
      createCategorySubmit: "Adauga categorie",
      createUnitSubmit: "Adauga unitate",
      pending: "Se salveaza...",
      categoryNameRequired: "Numele categoriei este obligatoriu.",
      unitNameRequired: "Numele unitatii de masura este obligatoriu.",
      categoryCreateFallback: "Categoria nu poate fi creata acum.",
      unitCreateFallback:
        "Unitatea de masura nu poate fi creata acum.",
    },
    filters: {
      searchLabel: "Cautare",
      searchPlaceholder:
        "Cauta dupa SKU, nume, cod de bare, categorie sau unitate",
      statusLabel: "Stare",
      all: "Toate",
      activeOnly: "Doar active",
      inactiveOnly: "Doar inactive",
      showingTemplate: "Se afiseaza {filtered} din {total} produse",
    },
    detail: {
      backToProducts: "Inapoi la produse",
      referenceEyebrow: "Referinta produs",
      imageUrl: "URL imagine",
      productId: "Id produs",
      categoryId: "Id categorie",
      unitOfMeasureId: "Id unitate de masura",
      editTitle: "Flux de editare pentru Admin",
      editDescription:
        "Actualizeaza datele master ale produsului, pastrand dezactivarea ca singura cale de retragere suportata.",
      saveChangesSubmit: "Salveaza modificarile produsului",
      deactivationEyebrow: "Dezactivare",
      deactivationDescription:
        "Aceasta pagina suporta doar dezactivarea. In UI nu este expusa nicio actiune de stergere hard a produsului.",
      deactivateButton: "Dezactiveaza produsul",
      alreadyInactive: "Produs deja inactiv",
    },
    form: {
      skuLabel: "SKU",
      skuPlaceholder: "FG-1000",
      barcodeLabel: "Cod de bare",
      barcodePlaceholder: "5940000000011",
      barcodeHint:
        "Optional. Sistemul taie spatiile din jur, pastreaza potrivirea exacta si cere o valoare unica atunci cand este setat un cod de bare.",
      nameLabel: "Nume produs",
      namePlaceholder: "Produs finit demo",
      descriptionLabel: "Descriere",
      descriptionPlaceholder: "Descriere operationala scurta",
      categoryLabel: "Categorie",
      unitOfMeasureLabel: "Unitate de masura",
      imageUrlLabel: "URL imagine",
      imageUrlPlaceholder: "https://example.local/images/product.png",
      defaultMinPickingThresholdLabel:
        "Prag minim implicit de picking",
      defaultTargetPickingQuantityLabel:
        "Cantitate tinta implicita pentru picking",
      isActiveLabel:
        "Produsul este activ si vizibil pentru operatiunile normale",
      pending: "Se salveaza...",
    },
    actions: {
      createFallback: "Produsul nu poate fi creat acum.",
      updateFallback: "Produsul nu poate fi actualizat acum.",
      requiredFields:
        "SKU-ul, numele, categoria si unitatea de masura sunt obligatorii.",
      barcodeMax:
        "Codul de bare trebuie sa aiba cel mult 100 de caractere.",
      thresholdsNumeric:
        "Pragurile de picking trebuie sa fie valori numerice valide.",
      thresholdsNonNegative:
        "Pragurile de picking trebuie sa fie zero sau mai mari.",
    },
  },
  users: {
    route: {
      listUnavailableTitle: "Utilizatorii nu au putut fi incarcati",
      listUnavailableFallback:
        "Backend-ul nu a returnat un raspuns utilizabil pentru administrarea utilizatorilor.",
      detailUnavailableTitle: "Utilizatorul nu a putut fi incarcat",
      detailUnavailableFallback:
        "Backend-ul nu a returnat utilizatorul solicitat.",
    },
    list: {
      eyebrow: "Administrare utilizatori",
      title: "Control operational doar pentru Admin asupra utilizatorilor aplicatiei",
      description:
        "Administrarea utilizatorilor suporta asignarea rolurilor Admin, Warehouse si Sales. Activarea si dezactivarea controleaza starea de acces operational; stergerea nu este suportata aici.",
      actionBlockedEyebrow: "Actiune de flux blocata",
      searchLabel: "Cautare",
      searchPlaceholder:
        "Cauta dupa nume utilizator, rol, stare sau id",
      visibleUsers: "Utilizatori vizibili",
      activeUsers: "Utilizatori activi",
      inactiveUsers: "Utilizatori inactivi",
      createdTemplate: "Creat {timestamp}.",
      accessStateDescription:
        "Activarea sau dezactivarea schimba starea de acces operational fara a redesena modelul de autentificare existent.",
      viewDetail: "Vezi detalii",
      deactivateButton: "Dezactiveaza",
      activateButton: "Activeaza",
      userName: "Nume utilizator",
      state: "Stare",
      roles: "Roluri",
      created: "Creat",
      emptyEyebrow: "Niciun utilizator nu s-a potrivit",
      emptyMessage:
        "Ajusteaza cautarea curenta pentru a readuce in vedere conturile operationale de utilizator.",
      createTitle: "Flux de creare pentru Admin",
      createDescription:
        "Creeaza un utilizator operational cu o parola initiala si una sau mai multe asignari de rol aprobate.",
      createSubmit: "Creeaza utilizator",
    },
    detail: {
      description:
        "Administrarea operationala a utilizatorilor controleaza starea de acces si rotirea optionala a parolei. Stergerea nu este disponibila aici.",
      backToUsers: "Inapoi la utilizatori",
      userName: "Nume utilizator",
      state: "Stare",
      assignedRoles: "Roluri asignate",
      created: "Creat",
      actionBlockedEyebrow: "Actiune de flux blocata",
      referenceEyebrow: "Referinta utilizator",
      userId: "Id utilizator",
      operationalAccessState: "Stare acces operational",
      createdAt: "Creat la",
      accessStateEyebrow: "Stare acces",
      accessStateDescription:
        "Activarea sau dezactivarea schimba starea de acces operational in fundatia existenta de autentificare. Stergerea nu este suportata, iar aceasta pagina nu introduce MFA, SSO, resetare de parola sau fluxuri de recuperare cont.",
      deactivateButton: "Dezactiveaza utilizatorul",
      activateButton: "Activeaza utilizatorul",
      editTitle: "Flux de editare pentru Admin",
      editDescription:
        "Actualizeaza numele utilizatorului, ajusteaza rolurile operationale aprobate si roteste parola doar atunci cand furnizezi explicit una noua.",
      saveChangesSubmit: "Salveaza modificarile utilizatorului",
    },
    form: {
      scopeEyebrow: "Domeniu",
      scopeDescription:
        "Acest UI suporta doar asignarea rolurilor Admin, Warehouse si Sales. Stergerea nu este suportata.",
      userNameLabel: "Nume utilizator",
      userNamePlaceholder: "warehouse.supervisor",
      assignedRolesLegend: "Roluri asignate",
      assignedRolesDescription:
        "Doar rolurile operationale aprobate in prezent pot fi asignate aici.",
      initialPasswordLabel: "Parola initiala",
      optionalPasswordRotationLabel: "Rotire optionala a parolei",
      initialPasswordPlaceholder: "Introdu o parola initiala",
      optionalPasswordRotationPlaceholder:
        "Lasa gol pentru a pastra parola curenta",
      pending: "Se salveaza...",
    },
    actions: {
      createFallback: "Utilizatorul nu poate fi creat acum.",
      updateFallback: "Utilizatorul nu poate fi actualizat acum.",
      activateFallback: "Utilizatorul nu poate fi activat acum.",
      deactivateFallback: "Utilizatorul nu poate fi dezactivat acum.",
      userIdRequired: "Id-ul utilizatorului este obligatoriu.",
      userNameRequired: "Numele utilizatorului este obligatoriu.",
      initialPasswordRequired:
        "Parola initiala este obligatorie la crearea utilizatorului.",
      atLeastOneRole:
        "Atribuie cel putin un rol operational suportat.",
      unsupportedRoleTemplate:
        "Valoare de rol nesuportata: {role}.",
    },
  },
  locations: {
    route: {
      listUnavailableTitle: "Locatiile nu au putut fi incarcate",
      listUnavailableFallback:
        "Backend-ul nu a returnat un raspuns utilizabil pentru locatii.",
      detailUnavailableTitle:
        "Locatia solicitata nu a putut fi incarcata",
      detailUnavailableFallback:
        "Backend-ul nu a returnat locatia solicitata.",
      warehousesFallback:
        "Depozitele nu au putut fi incarcate pentru editarea locatiei.",
      zonesFallback:
        "Zonele nu au putut fi incarcate pentru editarea locatiei.",
    },
    list: {
      eyebrow: "Locatii",
      title: "Exploreaza in detaliu structura locatiilor din depozit",
      description:
        "Vizibilitatea locatiilor ramane doar in regim de citire pentru Warehouse si editabila pentru Admin, cu starea de blocare si coordonatele mentinute explicit pentru claritate operationala.",
      backToStructureOverview: "Inapoi la privirea generala a structurii",
      openSetup: "Creeaza/administreaza in configurare",
      searchLabel: "Cautare",
      searchPlaceholder:
        "Cod, nume, depozit, zona sau tip",
      warehouseLabel: "Depozit",
      allWarehouses: "Toate depozitele",
      blockStatusLabel: "Stare blocare",
      allLocations: "Toate locatiile",
      blockedOnly: "Doar blocate",
      unblockedOnly: "Doar neblocate",
      coordinates: "Coordonate",
      coordinatesTemplate: "Rand {row}, coloana {column}",
      locationId: "Id locatie",
      emptyEyebrow: "Nu au fost gasite locatii",
      emptyMessage:
        "Ajusteaza filtrele pentru a largi lista vizibila de locatii.",
    },
    detail: {
      backToLocations: "Inapoi la locatii",
      structureOverview: "Privire generala structura",
      openSetup: "Creeaza/administreaza locatii",
      descriptionTemplate:
        "{warehouse} / {zone} cu coordonate explicite pe rand si coloana pentru randarea viitoare a hartii depozitului.",
      activeStatus: "Stare activare",
      blockStatus: "Stare blocare",
      mapRow: "Rand harta",
      mapColumn: "Coloana harta",
      referenceEyebrow: "Referinta locatie",
      warehouse: "Depozit",
      zone: "Zona",
      locationId: "Id locatie",
      ruleNote: "Nota regula",
      ruleNoteValue:
        "Locatiile pot fi active sau inactive si blocate sau neblocate.",
      editEyebrow: "Flux de editare pentru Admin",
      editTitle: "Actualizeaza datele master ale locatiei",
      blockLocation: "Blocheaza locatia",
      unblockLocation: "Deblocheaza locatia",
    },
  },
  auditLogs: {
    route: {
      listUnavailableTitle: "Jurnalul de audit nu a putut fi incarcat",
      listUnavailableFallback:
        "Backend-ul nu a returnat un raspuns utilizabil pentru jurnalul de audit.",
      detailUnavailableTitle:
        "Inregistrarea din jurnalul de audit nu a putut fi incarcata",
      detailUnavailableFallback:
        "Backend-ul nu a returnat inregistrarea de audit solicitata.",
    },
    shared: {
      metadataBadge: "Metadate",
      systemOrUnknownContext: "Context de sistem sau necunoscut",
      unknownActorTemplate: "Actor necunoscut ({id})",
      actionTypes: {
        UserCreated: "Utilizator creat",
        UserUpdated: "Utilizator actualizat",
        UserActivated: "Utilizator activat",
        UserDeactivated: "Utilizator dezactivat",
        ReceiptConfirmed: "Receptie confirmata",
        PutawayCompleted: "Putaway finalizat",
        TransferCompleted: "Transfer finalizat",
        ReplenishmentCompleted: "Reaprovizionare finalizata",
        SalesOrderConfirmed: "Comanda de vanzare confirmata",
        SalesOrderCancelled: "Comanda de vanzare anulata",
        PickingCompleted: "Picking finalizat",
        ShipmentCompleted: "Expediere finalizata",
        InventoryCountCompleted: "Inventariere finalizata",
      },
      entityTypes: {
        User: "Utilizator",
        Receipt: "Receptie",
        PutawayTask: "Sarcina putaway",
        TransferTask: "Sarcina transfer",
        ReplenishmentTask: "Sarcina reaprovizionare",
        SalesOrder: "Comanda de vanzare",
        PickingTask: "Sarcina picking",
        Shipment: "Expediere",
        InventoryCount: "Inventariere",
      },
    },
    list: {
      eyebrow: "Trasabilitate audit",
      title: "Vizibilitate append-only pentru actiunile business importante",
      description:
        "Jurnalul de audit este un strat de trasabilitate business doar in regim de citire. Este append-only, nu este registrul de stoc si nu inlocuieste tabelele de flux sau paginile operationale live.",
      searchLabel: "Cautare",
      searchPlaceholder: "Cauta dupa actor, actiune, entitate, rezumat sau id",
      resultsLabel: "Rezultate",
      resultsTemplate: "Se afiseaza {filtered} din {total}",
      exportLabel: "Exporta jurnalul de audit",
      exportEmptyLabel: "Nu exista randuri de audit pentru export",
      viewDetail: "Vezi detalii",
      performedByTemplate: "Efectuat la {timestamp} de {actor}.",
      entityTemplate: "Entitate {entityType} / {entityId}",
      traceabilityDescription:
        "Aceasta intrare este date de trasabilitate doar in regim de citire. Istoricul de audit sustine vizibilitatea business, iar istoricul miscarilor de stoc ramane registrul de stoc.",
      emptyEyebrow: "Nicio intrare de audit nu s-a potrivit",
      emptyMessage:
        "Ajusteaza cautarea curenta pentru a readuce in vedere intrarile append-only de trasabilitate business.",
      metrics: {
        performed: "Efectuat",
        actor: "Actor",
        actionType: "Tip actiune",
        entityType: "Tip entitate",
        entityId: "Id entitate",
      },
      exportColumns: {
        performedAtUtc: "Efectuat la",
        actorUserId: "Id utilizator actor",
        actorUserName: "Nume utilizator actor",
        actorRolesSummary: "Roluri actor",
        actionType: "Tip actiune",
        entityType: "Tip entitate",
        entityId: "Id entitate",
        summary: "Rezumat",
        metadataJson: "JSON metadate",
      },
    },
    detail: {
      titleTemplate: "Intrare audit {id}",
      description:
        "Jurnalul de audit este un strat append-only de trasabilitate business. Ramane doar in regim de citire aici, nu inlocuieste tabelele de flux si nu este registrul de stoc.",
      backToAuditLogs: "Inapoi la jurnalul de audit",
      summaryEyebrow: "Rezumat trasabilitate business",
      summaryDescription:
        "Aceasta intrare inregistreaza o actiune business reusita sau o tranzitie importanta de stare. Foloseste-o pentru trasabilitate operationala, apoi foloseste paginile de flux legate si istoricul miscarilor de stoc pentru procesul live si detaliile de stoc.",
      actorContextEyebrow: "Context actor",
      actorDisplay: "Afisare actor",
      actorUserName: "Nume utilizator actor",
      actorRoles: "Roluri actor",
      actorUserId: "Id utilizator actor",
      entityContextEyebrow: "Context entitate",
      auditEntryId: "Id intrare audit",
      performedAt: "Efectuat la",
      metadataEyebrow: "Metadate",
      metadataDescription:
        "Metadatele raman compacte si doar in regim de citire aici. Cand exista JSON valid, este formatat pentru lizibilitate. In caz contrar, sirul brut de metadate este afisat neschimbat.",
      noMetadata: "Nu au fost inregistrate metadate pentru aceasta intrare de audit.",
      notRecorded: "Neinregistrat",
      metrics: {
        performed: "Efectuat",
        actor: "Actor",
        actionType: "Tip actiune",
        entityType: "Tip entitate",
        entityId: "Id entitate",
      },
    },
  },
  inventoryCounts: {
    route: {
      listUnavailableTitle: "Inventarele nu au putut fi incarcate",
      listUnavailableFallback:
        "Backend-ul nu a returnat un raspuns utilizabil pentru inventare.",
      createProductsFallback:
        "Produsele necesare pentru crearea inventarului nu pot fi incarcate acum.",
      createLocationsFallback:
        "Locatiile necesare pentru crearea inventarului nu pot fi incarcate acum.",
      expectedPreviewFallback:
        "Previzualizarea curenta pentru cantitatea asteptata nu este disponibila. Snapshot-ul din backend la creare ramane sursa autoritara.",
      detailUnavailableTitle: "Inventarul nu a putut fi incarcat",
      detailUnavailableFallback:
        "Backend-ul nu a returnat inventarul cerut.",
    },
    list: {
      eyebrow: "Flux de inventariere",
      title:
        "Inventare explicite cu vizibilitate pentru cantitatea asteptata, numarata si varianta",
      description:
        "Inventarele raman separate de transfer, replenishment, picking si expediere. Crearea, pornirea si anularea sunt neutre fata de stoc; finalizarea posteaza reconcilierea.",
      actionBlockedEyebrow: "Actiune de flux blocata",
      searchLabel: "Cautare",
      searchPlaceholder: "Cauta dupa inventar, produs, locatie sau stare",
      statusLabel: "Stare",
      openCountsFirst: "Mai intai inventarele deschise",
      allCounts: "Toate inventarele",
      resultsLabel: "Rezultate",
      resultsTemplate: "Se afiseaza {filtered} din {total}",
      exportLabel: "Exporta inventarele",
      exportEmptyLabel: "Nu exista randuri de inventar pentru export",
      countBadgeTemplate: "Inventar {id}",
      lineCountTemplate: "{count} linie de inventar{suffix}",
      moreTemplate: "{preview} +{count} in plus",
      locationsTemplate: "Locatii {locations}",
      workflowBoundary:
        "Doar finalizarea inventarului posteaza ajustari. Varianta pozitiva adauga stoc, varianta negativa scade stoc, iar cantitatile rezervate si pickate nu sunt editate direct aici.",
      viewDetails: "Vezi detalii",
      enterCountedQuantities: "Introdu cantitatile numarate",
      metrics: {
        expected: "Asteptat",
        counted: "Numarat",
        netVariance: "Varianta neta",
        created: "Creat",
        completed: "Finalizat",
      },
      notCompleted: "Nefinalizat",
      start: "Porneste inventarul",
      cancel: "Anuleaza inventarul",
      emptyEyebrow: "Niciun inventar nu s-a potrivit",
      emptyMessage:
        "Ajusteaza cautarea curenta sau filtrul de stare pentru a readuce in vedere lucrul de inventariere.",
      exportColumns: {
        inventoryCountId: "Id inventar",
        status: "Stare",
        createdAtUtc: "Creat la",
        startedAtUtc: "Pornit la",
        completedAtUtc: "Finalizat la",
        cancelledAtUtc: "Anulat la",
        productSku: "SKU produs",
        productName: "Nume produs",
        warehouseCode: "Depozit",
        zoneCode: "Zona",
        locationCode: "Cod locatie",
        locationName: "Nume locatie",
        locationType: "Tip locatie",
        locationIsActive: "Locatie activa",
        locationIsBlocked: "Locatie blocata",
        expectedSystemQuantity: "Cantitate asteptata",
        countedQuantity: "Cantitate numarata",
        varianceQuantity: "Varianta",
      },
    },
      form: {
        eyebrow: "Creeaza inventar",
        description:
          "Inventarele raman explicite si neutre fata de stoc pana la finalizare. Finalizarea inventarului posteaza ajustari de reconciliere.",
      meaningEyebrow: "Semnificatia inventarului",
      meaningDescription:
        "Fiecare linie pastreaza explicit cantitatea asteptata/din sistem, cantitatea numarata si varianta. Varianta pozitiva adauga stoc, varianta negativa scade stoc, iar cantitatile rezervate si pickate nu sunt editate direct aici.",
      readinessEyebrow: "Pregatire pentru inventariere",
      readinessDescription:
        "Redactarea inventarului are nevoie de produse mentinute si locatii mentinute, astfel incat fiecare linie de inventar sa ramana explicita.",
      noProductsWarning:
        "Nu exista produse mentinute disponibile acum. Adauga produse inainte de a crea linii de inventar.",
      noLocationsWarning:
        "Nu exista locatii mentinute disponibile acum. Finalizeaza configurarea depozitului inainte de a crea un inventar din aceasta interfata.",
      linesTitle: "Linii de inventar",
      linesDescription:
        "Adauga perechi explicite produs-locatie. Previzualizarea curenta foloseste randurile existente de balanta cand sunt disponibile, dar snapshot-ul luat de backend la creare ramane sursa autoritara.",
        linesBlockedWarning:
          "Atat produsele, cat si locatiile sunt necesare inainte ca liniile de inventar sa poata fi adaugate si salvate.",
        barcodeContextLabel: "linia de inventar",
        barcodeApplied:
          "Produsul a fost aplicat pe linia {lineNumber} a inventarului.",
        barcodeAdded:
          "Produsul a fost adaugat ca linie noua {lineNumber} in inventar.",
        addLine: "Adauga linie",
        remove: "Elimina",
      productLabelTemplate: "Produs {index}",
      locationLabelTemplate: "Locatie {index}",
      productPlaceholder: "Selecteaza un produs",
      productUnavailable: "Nu exista produse disponibile",
      locationPlaceholder: "Selecteaza o locatie",
      locationUnavailable: "Nu exista locatii disponibile",
      summary: {
        expectedSystemPreview: "Previzualizare asteptat/din sistem",
        productState: "Stare produs",
        locationPath: "Traseu locatie",
        locationState: "Stare locatie",
        previewUnavailable: "Indisponibil",
        previewUnavailableCaption:
          "Previzualizarea curenta nu a putut fi incarcata. Snapshot-ul din backend la creare ramane sursa autoritara.",
        previewCurrentBalanceCaption:
          "Snapshot curent de on-hand din randul existent de balanta.",
        previewNoBalanceCaption:
          "Nu exista rand curent de balanta. Aceasta linie poate reprezenta in continuare stoc gasit neasteptat.",
        selectProduct: "Selecteaza produs",
        selectProductCaption:
          "Alege produsul care este inventariat pe aceasta linie.",
        selectLocation: "Selecteaza locatie",
        selectLocationCaption:
          "Alege locatia exacta care este inventariata.",
        notSelected: "Neselectat",
        locationStateCaptionTemplate:
          "Starea locatiei de tip {type} ramane vizibila si nu este ascunsa.",
        locationStateCaptionUnselected:
          "Starea locatiei va aparea dupa ce este selectata o locatie.",
      },
      createSubmit: "Creeaza inventar",
      pending: "Se salveaza...",
    },
    detail: {
      countBadgeTemplate: "Inventar {id}",
      titleTemplate: "Inventar {id}",
      description:
        "Inventarul ramane separat de transfer, replenishment, picking si expediere. Crearea, pornirea si anularea inventarului sunt neutre fata de stoc. Finalizarea inventarului este pasul explicit de reconciliere care poate ajusta doar on hand.",
      backToList: "Inapoi la inventare",
      metrics: {
        lines: "Linii",
        expected: "Asteptat",
        counted: "Numarat",
        netVariance: "Varianta neta",
        completed: "Finalizat",
      },
      notCompleted: "Nefinalizat",
      actionBlockedEyebrow: "Actiune de flux blocata",
      workflowActionsEyebrow: "Actiuni de flux",
      workflowActionsDescription:
        "Crearea, pornirea si anularea sunt neutre fata de stoc. Finalizarea inventarului posteaza ajustari de stoc. Varianta pozitiva adauga stoc, varianta negativa scade stoc, iar cantitatile rezervate si pickate nu sunt editate direct.",
      start: "Porneste inventarul",
      cancel: "Anuleaza inventarul",
      noFurtherAction:
        "Nu mai exista nicio actiune de executie disponibila pentru rolul si starea curenta a inventarului.",
      summaryEyebrow: "Rezumat inventar",
      inventoryCountId: "Id inventar",
      created: "Creat",
      started: "Pornit",
      cancelled: "Anulat",
      notStarted: "Nepornit",
      notCancelled: "Neanulat",
      completionGuardEyebrow: "Protectie la finalizare",
      completionGuardDescription:
        "Finalizarea inventarului poate fi respinsa daca stocul on-hand din sistem s-a modificat dupa crearea inventarului sau daca on-hand-ul rezultat ar cobori sub cantitatea curenta rezervata plus pickata. Frontend-ul afiseaza direct aceste validari din backend in loc sa incerce sa le ocoleasca.",
      countedQuantitiesEyebrow: "Cantitati numarate",
      countedQuantitiesDescription:
        "Introdu cantitatea numarata fizic pentru fiecare linie. Previzualizarea variantei este explicita aici, dar stocul nu este ajustat pana cand nu finalizezi inventarul.",
      completeSubmit: "Finalizeaza si posteaza ajustarile",
      posting: "Se posteaza...",
      locationActive: "Locatie activa",
      locationInactive: "Locatie inactiva",
      locationBlocked: "Locatie blocata",
      locationUnblocked: "Locatie neblocata",
      locationTemplate: "Locatie {path} - {name}",
      lineWorkflowBoundary:
        "Finalizarea acestui inventar posteaza doar reconcilierea pe on-hand. Cantitatile rezervate si pickate raman separate si nu sunt editate direct aici.",
      lineMetrics: {
        expected: "Asteptat",
        countedQuantity: "Cantitate numarata",
        variancePreview: "Previzualizare varianta",
        balanceRow: "Rand de balanta",
        counted: "Numarat",
        variance: "Varianta",
      },
      countedQuantityPlaceholder: "Introdu cantitatea numarata",
      pendingEntry: "In asteptarea introducerii",
      pendingPreview: "Previzualizare in asteptare",
      notRecorded: "Neinregistrat",
      notPosted: "Nepostata",
      none: "Niciunul",
      countLineId: "Id linie de inventar",
      inventoryBalanceId: "Id balanta de stoc",
      missingBalanceEditable:
        "Nu exista un rand de balanta. Aceasta linie poate reprezenta stoc gasit neasteptat.",
      missingBalanceReadonly:
        "Nu a existat un rand de balanta. Aceasta linie a reprezentat stoc gasit neasteptat.",
    },
    actions: {
      createFallback: "Inventarul nu poate fi creat acum.",
      completeFallback:
        "Inventarul nu poate fi finalizat acum. Verifica starea curenta a stocului si incearca din nou.",
      startFallback: "Inventarul nu poate fi pornit acum.",
      cancelFallback: "Inventarul nu poate fi anulat acum.",
      idRequired: "Id-ul inventarului este obligatoriu.",
      atLeastOneLine:
        "Adauga cel putin o pereche produs-locatie inainte de a crea un inventar.",
      lineParseError: "Liniile de inventar nu au putut fi interpretate corect.",
      productRequired: "Produsul {index} este obligatoriu.",
      locationRequired: "Locatia {index} este obligatorie.",
      countedLinesRequired:
        "Fiecare linie de inventar are nevoie de o cantitate numarata explicita inainte de finalizare.",
      countedLineMatchError:
        "Cantitatile numarate nu au putut fi asociate cu liniile curente de inventar.",
      countedLineIdMissing:
        "Liniei de inventar {index} ii lipseste identificatorul.",
      countedQuantityRequired:
        "Cantitatea numarata pentru linia {index} este obligatorie.",
      countedQuantityValid:
        "Cantitatea numarata pentru linia {index} trebuie sa fie zero sau mai mare.",
    },
  },
};
