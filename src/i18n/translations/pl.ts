import type { TranslationKeys } from './en';
import { en } from './en';

export const pl: TranslationKeys = {
  ...en,
  site: {
    ...en.site,
    name: 'Astro Business Stack',
    description: 'Self-hosted strony Astro SSR z Docker, GitHub OAuth CMS i CI/CD na VPS.',
  },
  nav: {
    ...en.nav,
    home: 'Start',
    about: 'O nas',
    blog: 'Funkcje',
    contact: 'Kontakt',
    features: 'Funkcje',
    process: 'Architektura',
    work: 'Wdrożenia',
    getStarted: 'Zobacz na <strong>GitHub</strong>',
    portfolio: 'Wdrożenia',
    servicesMenu: 'Funkcje',
  },
  hero: {
    ...en.hero,
    badge: 'Prezentacja inżynierii produkcyjnej',
    title: 'Self-hosted stack Astro na',
    titleHighlight: 'Twoim VPS.',
    description:
      'Strony SSR w Dockerze, <strong>CMS z GitHub OAuth</strong>, CI/CD przez GitHub Actions i opcjonalne integracje.',
    cta: 'Zobacz na GitHub',
    secondaryCta: 'Wdrożenia na żywo',
    socialProof: 'Platforma multi-tenant na VPS Hetzner',
  },
  trustBar: {
    label: 'Zbudowane z',
    item1: 'Astro 6 SSR + adapter Node',
    item2: 'Wieloetapowe buildy Docker',
    item3: 'Deploy SSH przez GitHub Actions',
    item4: 'Self-hosted Decap OAuth',
    item5: 'Opcjonalne integracje produkcyjne',
  },
  realityCheck: {
    title: 'Ignorowanie tych problemów <strong>nie jest darmowe</strong>.',
    left: {
      webTitle: '<strong>Brak strony / przestarzała strona.</strong>',
      webBody:
        'Oddajesz klientów konkurencji. <strong>Nie oszczędzasz pieniędzy, tracisz rynek.</strong>',
      autoTitle: '<strong>Brak automatyzacji + AI.</strong>',
      autoBody:
        'Zespół traci czas na powtarzalne zadania. <strong>Marnujesz talent i pieniądze.</strong>',
    },
    right: {
      authorityTitle: '<strong>Utrata autorytetu.</strong>',
      authorityBody: 'W 2026 roku, jeśli nie jesteś cyfrowy, <strong>jesteś niewidzialny.</strong>',
      opportunityTitle: '<strong>Koszt utraconej szansy.</strong>',
      opportunityBody:
        'Kiedy Ty się wahasz, <strong>konkurencja przejmuje rynek</strong> dzięki automatycznym systemom.',
    },
    cta: 'Chcę <strong>bezpłatnie zdiagnozować</strong> moją firmę.',
  },
  leakToFlow: {
    title: 'To jest <span class="text-brand-500"><strong>Rozwiązanie</strong></span>.',
    steps: {
      step1: {
        title: '<strong>Darmowy</strong> audyt.',
        body: 'Identyfikujemy wycieki pieniędzy w obecnym procesie. Mapa rozwiązań, nie obietnice.',
      },
      step2: {
        title: 'Natychmiastowe wdrożenie.',
        body: 'Strona w <strong>< 7 dni</strong>. Automatyzacja w <strong>< 10 dni</strong>. Pieniądze kochają szybkość.',
      },
      step3: {
        title: 'Automatyczne skalowanie.',
        body: 'Twój zespół może skupić się na ważnych zadaniach. Klient może Cię zobaczyć.',
      },
    },
    badges: {
      web: 'Web: < 7 dni',
      automation: 'Automatyzacja: < 10 dni',
    },
    cta: 'Zarezerwuj <strong>Darmowy</strong> Audyt',
  },
  techEdge: {
    title: 'Nasza przewaga konkurencyjna.',
    web: {
      title: 'Wydajne Strony WWW',
      body: 'Strony ładujące się w milisekundach. Bez utraty klientów i ze świetnym SEO.',
      metrics: {
        title: 'Ocena Google (Lighthouse)',
        competitor: 'Lokalny konkurent Wordpress',
        us: 'My',
        mobileNote:
          '<strong>Około 80% klientów pochodzi z telefonu</strong>, gdzie te wyniki są jeszcze ważniejsze, aby nie tracić klientów.',
      },
      cta: 'Czytaj więcej o naszej architekturze webowej',
    },
    automation: {
      title: 'Automatyzacja + AI',
      body: 'Wdrożenie w kilka dni. Niezawodne systemy na najlepszych narzędziach, które oszczędzają setki godzin.',
      cta: 'Zobacz projekty automatyzacji',
    },
    bridge: {
      title: 'Pełny system Web + Automatyzacja',
      body: 'Łączymy stronę, automatyzację i AI w jeden system. Mniej tarcia operacyjnego, większa zdolność wzrostu.',
      cta: 'Zobacz projekty full system',
    },
  },
  cta: {
    ...en.cta,
    title: 'Czy nadal pozwolisz, by Twój system tracił pieniądze?',
    titleHighlight: 'Ryzyko bierzemy na siebie.',
    description:
      'Otrzymaj mapę rozwiązań podczas 15-minutowej rozmowy. Jeśli nie spełnimy uzgodnionych celów konwersji, <strong>nie zapłacisz ani grosza</strong>. Proste.',
    docs: 'Zobacz Case Studies',
    command: 'Chcę mój <strong>Darmowy</strong> Audyt',
    guaranteeBadge: 'Gwarancja Zwrotu 100%',
    funnel: {
      step1Title: 'Twoje imię i nazwisko',
      nameLabel: 'Imię i nazwisko',
      namePlaceholder: 'Pełne imię',
      step2Title: 'Jak możemy się odezwać?',
      emailLabel: 'Email',
      emailPlaceholder: 'ty@firma.pl',
      phoneLabel: 'Telefon',
      phoneOptional: 'opcjonalnie',
      phonePlaceholder: '+48 …',
      honeypotLabel: 'Firma',
      next: 'Dalej',
      back: 'Wstecz',
      step3Title: 'Wybierz termin',
      leadError: 'Coś poszło nie tak. Spróbuj ponownie.',
      nameError: 'Podaj imię (min. 2 znaki).',
      emailError: 'Podaj prawidłowy adres email.',
      savingHint: 'Zapisywanie danych…',
    },
  },
  footer: {
    ...en.footer,
    copyright: '© {year} Astro Business Stack. Licencja MIT.',
    links: {
      ...en.footer.links,
      documentation: 'Docs',
      license: 'Licencja',
    },
  },
  home: {
    ...en.home,
    title: 'Witamy w Iluro Digital',
  },
  blog: {
    ...en.blog,
    title: 'Systemy, ktore skaluja Twoj biznes',
    description: 'Elitarne rozwiazania cyfrowe, ktore zwiekszaja sprzedaz i tempo operacyjne.',
    allPosts: 'Case studies i wiedza',
    featured: 'Glowne rozwiazania',
    noPosts: 'Brak rozwiazan',
    relatedPosts: 'Powiazane rozwiazania',
    backToBlog: 'Powrot do uslug',
    filterLabel: 'Filtruj po',
    filterAll: 'Wszystkie',
    filter: {
      web: 'Web',
      automation: 'Automatyzacja',
      'full-system': 'Pelny system',
    },
    updatedPrefix: 'Zaktualizowano',
    readTime: '{minutes} min czytania',
    shareLabel: 'Udostepnij:',
    shareTwitter: 'Udostepnij na Twitterze',
    shareLinkedIn: 'Udostepnij na LinkedIn',
    copyLink: 'Kopiuj link',
    subscribe: 'Subskrybuj',
    subscribeDescription: 'Otrzymuj najnowsze artykuly i aktualizacje na email.',
    emailPlaceholder: 'Wpisz swój email',
    subscribeButton: 'Subskrybuj',
    servicesTerminal: {
      chromeLabel: 'deploy',
      line1: '> Uruchamianie systemu Iluro Digital...',
      line2: '',
      line3: '[OK] Szybka strona internetowa gotowa (Wynik 100%)',
      line4: '[OK] Agent AI skonfigurowany (Claude + n8n)',
      line5: '',
      line6: '> Przetwarzanie emaili klientow...',
      line7: '  - Kategoryzacja emaili wedlug priorytetu: Zrobione.',
      line8: '  - Tworzenie szkicow odpowiedzi: Zrobione.',
      line9: '  - Synchronizacja z kalendarzem: Zrobione.',
      line10: '',
      line11: '> WYNIKI SYSTEMU:',
      line12: '    - Zaoszczedzony czas: 40 godzin/tydzien mniej',
      line13: '    - Zaoszczedzone pieniadze: Koszty operacyjne mniej',
      line14: '    - Konwersja: Nowi klienci wiecej',
      line15: '> STATUS: System generuje korzysci.',
    },
  },
  portfolio: {
    ...en.portfolio,
    title: 'Realizacje',
    description: 'Case studies i dowody skutecznosci.',
    breadcrumb: 'Realizacje',
    backToIndex: 'Wroc do realizacji',
  },
  salesCommon: {
    heroCtaAudit: 'Zarezerwuj darmowy audyt',
    heroCtaCases: 'Zobacz realizacje',
  },
  salesWeb: {
    ...en.salesWeb,
    metaTitle: 'Strony i wydajność — Iluro Digital',
    metaDescription:
      'Szybkie Astro dla mobile i desktopów, wygodna edycja przez zespół, pewniejsze maile — darmowy audyt zanim przygotujemy płatną fazę.',
    heroTitleAccent: 'Astro ładujące się od razu',
    heroTitleRest: 'Edycje na co dzień — bez kolejnego chorego zestawu wtyczek.',
    heroSubtitle:
      'Na bezpłatnym audycie ustawiamy kolejność napraw nim przechodzisz na płatną fazę.',
    heroCtaFeaturedCase: 'Główny case: Envilo →',
    smackdownTitle: 'Konkurencja lokalna vs Iluro',
    smackdownLegacyLabel: 'Ciężki stack w stylu WordPress',
    smackdownLegacyCaption:
      'Pluginy, motywy nabite widgetami i API w czasie rzeczywistym łącznie potrafią uśpić dowolny dobry LTE.',
    smackdownOurLabel: 'Build Iluro na Astro',
    smackdownOurCaption:
      'Dużo gotowego HTML, animacje tylko gdy mają sens — mniejsza magia, większa przejrzystość.',
    smackdownDisclaimerLead: 'Liczby poglądowe — sprawdź w ',
    smackdownLighthouseLinkLabel: 'Google Lighthouse',
    smackdownDisclaimerTrail:
      '. Mogą się nieznacznie różnić ze względu na urządzenie i ustawienia testu.',
    stackStripLabel: 'Stack wdrażany w projektach webowych',
    stackStripAria:
      'Technologie używane w projektach Iluro nastawionych na prędkość',
    ctaPrepTitle: 'Co zahacza nieodpłatny audyt',
    ctaPrepSubtitle: 'Zanim jakakolwiek faktura — jeden konkretny podsumowujący feedback.',
    ctaPrepPoint1: 'Leak map — gdzie wolniejszy serwis lub klikowy flow usuwa konkretnych leadów.',
    ctaPrepPoint2:
      'Krótki roadmap kolejnych kroków — bez przymuszania zbędnej migracji albo kolejnego hostingu dla szumu.',
    ctaPrepPoint3: 'Nasza opinia pasuje / nie pasuje bez presji kolejnego etapu od razu.',
    enviloFeaturedEyebrow: 'Wyróżniony dowód',
    enviloFeaturedLink: 'Przeczytaj studium przypadku →',
    proofTitle: 'Dowody: web i prędkość',
    proofMicrocopy:
      'Wpływy z rozumialnych metryk — zajrzyj dalej po case Envilo.',
    proofEmpty: 'Kolejne case studies już przygotowujemy.',
    mechanismTitle: 'Co dokładnie robimy na stronie',
    mechanismCard1Title: 'Szybkie strony Astro, które jeszcze estetycznie wyglądają',
    mechanismCard1Body:
      'Astro z Tailwind: pierwszy ekran wciąż czytelny na słabym internecie, zdjęcia i tekst proporcjonalnie zbalansowane — nie szablon pęknięty wieloma modulami których się nie użyjesz.',
    mechanismCard2Title: 'Menu, promki, grafiki zmienisz bez maila „proszę o deploy”',
    mechanismCard2Body:
      'Ustawiamy wygodną edycję (Decap albo arkusze, gdy lepiej przy barze czy kasie): zmienisz dzienny zestaw, cenę czy baner tak naturalnie, jak gdy odpisujecie sobie na czacie zespołu — nie jak z panelu developera.',
    mechanismCard3Title: 'Maile kontaktowe trafiają jak powinny',
    mechanismCard3Body:
      'Formularze powiązane z Resend, sensowna konfiguracja antyspamu — potwierdzenia i zapytania nie giną przy kolejnym SMTP z pluginowej ruletki.',
    closeTitle: 'Umów bezpłatny audyt',
    closeDescription:
      'Wybierz termin niżej — układamy plan wspólnie. Jeśli przez pierwszy miesiąc nie przynosi to zakładanego efektu według porozumienia, oddajemy koszty.',
  },
  salesAutomation: {
    ...en.salesAutomation,
    metaTitle: 'Automatyzacja i AI — Iluro Digital',
    metaDescription:
      'Workflowy n8n u Ciebie i modele dopasowane do Twoich narzędzi, zamiast generycznego spektaklu SaaS.',
    heroTitleAccent: 'Mosty n8n na Twojej infrastrukturze',
    heroTitleRest: 'od poczty do CRM z asystentami opartymi o dane, bez marketingowej paplaniny.',
    heroSubtitle:
      'Najpierw na audycie porządkujemy throughput i jakość przekazań; zakres płatny domykamy przy tym układzie.',
    riskLine: 'Throughput, jakość segregacji i konkretne SLA, zamiast slajdów bez liczb.',
    stackStripLabel: 'Stack automatyzacji, który wdrażamy',
    stackStripAria: 'Technologie typowe w realizacjach automation Iluro',
    ctaPrepTitle: 'Co obejmuje darmowy audyt',
    ctaPrepSubtitle: 'Przed fakturą — jedna spójna lektura, bez ciszy zakupowej.',
    ctaPrepPoint1:
      'Mapa obciążenia gdzie pętle pożerają godziny, a leady przeciekają po drodze.',
    ctaPrepPoint2:
      'Zdefiniowany human-in-the-loop redakcja, retencja danych i strefy compliance.',
    ctaPrepPoint3:
      'Rzetelna ocena toolchainowych kosztów—bez licencyjnego armagedonu nim zobaczysz efekt.',
    closeDescription:
      'Umów się poniżej — zaczynamy od najbardziej frustrującej pętli. Jeśli pierwszy miesiąc nie realizuje ustaleń, oddajemy pobrane koszty.',
  },
  salesFullSystem: {
    ...en.salesFullSystem,
    metaTitle: 'Integracja web + automatyzacji — Iluro Digital',
    metaDescription:
      'Szybkie Astro i automatyzacja pod spodem—jeden plan działania zamiast dwóch firm ciągniętych w przeciwne strony.',
    heroTitleAccent: 'Pozyskanie złączone z orkiestracją',
    heroTitleRest: 'lekki przód Astro i autonomiczne flow z tyłu — jedna strategia dostaw.',
    heroSubtitle:
      'Ta sama bezpłatna analiza wiąże warstwę sprzedażową z operacjami — nie listę kolejnych widoków.',
    riskLine:
      'Throughput, higiena CAC i czas cyklu — zamiast listy ficzerów „na prezentację”.',
    stackStripLabel: 'Referencyjny stack pełnego systemu',
    stackStripAria: 'Warstwy w projektach full-system Iluro',
    ctaPrepTitle: 'Co układa się na darmowym audycie',
    ctaPrepSubtitle: 'Front i backends w jednym przebiegu, bez opłaty wejściowej.',
    ctaPrepPoint1:
      'Kanały pozyskania tarcie na Astro zestawione z kosztami ruchu, który już kupujesz.',
    ctaPrepPoint2:
      'Rdzeń operacji które automatyzacje przywracają prawdę lejka i widoczne SLA.',
    ctaPrepPoint3:
      'Pułapki inwestycyjne — skalowanie kosztów tylko na sygnałach, nie na katalogu dodatkowych modułów.',
    closeDescription:
      'Rezerwuj niżej—najpierw spisujemy jeden harmonogram dla obu światów. Jak pierwszy miesiąc zawali wobec ustaleń, zwrócimy proporcjonalną część.',
  },
};
