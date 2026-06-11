import type { TranslationKeys } from './en';
import { en } from './en';

export const ca: TranslationKeys = {
  ...en,
  site: {
    ...en.site,
    name: 'Astro Business Stack',
    description: 'Llocs Astro SSR autoallotjats amb Docker, CMS OAuth de GitHub i CI/CD a VPS.',
  },
  nav: {
    ...en.nav,
    home: 'Inici',
    about: 'Nosaltres',
    blog: 'Funcions',
    contact: 'Contacte',
    features: 'Funcions',
    process: 'Arquitectura',
    work: 'Desplegaments',
    getStarted: 'Veure a <strong>GitHub</strong>',
    portfolio: 'Desplegaments',
    servicesMenu: 'Funcions',
  },
  hero: {
    ...en.hero,
    badge: 'Mostra d’enginyeria en producció',
    title: 'Stack de negoci Astro autoallotjat al',
    titleHighlight: 'teu VPS.',
    description:
      'Llocs SSR en Docker, <strong>CMS amb OAuth de GitHub</strong>, CI/CD amb GitHub Actions i integracions opcionals.',
    cta: 'Veure a GitHub',
    secondaryCta: 'Desplegaments en viu',
    socialProof: 'Plataforma multi-tenant en VPS Hetzner',
  },
  trustBar: {
    label: 'Construït amb',
    item1: 'Astro 6 SSR + adaptador Node',
    item2: 'Builds Docker multi-etapa',
    item3: 'Deploy SSH amb GitHub Actions',
    item4: 'OAuth Decap autoallotjat',
    item5: 'Integracions de producció opcionals',
  },
  realityCheck: {
    title: 'Ignorar aquests problemes <strong>no et surt gratis</strong>.',
    left: {
      webTitle: '<strong>Sense web / web obsoleta.</strong>',
      webBody:
        'Estàs regalant clients a la competència. <strong>No estalvies diners, perds mercat.</strong>',
      autoTitle: '<strong>Sense automatització + IA.</strong>',
      autoBody:
        'El teu equip dedica temps a tasques repetitives. <strong>Estàs malbaratant talent i diners</strong>.',
    },
    right: {
      authorityTitle: "<strong>Pèrdua d'autoritat.</strong>",
      authorityBody: 'El 2026, si no ets digital, <strong>ets invisible.</strong>',
      opportunityTitle: "<strong>Cost d'oportunitat.</strong>",
      opportunityBody:
        "Mentre tu t'ho penses, la <strong>competència captura el mercat</strong> amb sistemes automàtics.",
    },
    cta: 'Vull <strong>diagnosticar</strong> la meva empresa <strong>gratis</strong>.',
  },
  leakToFlow: {
    title: 'Aquesta és la <span class="text-brand-500"><strong>Solució</strong></span>.',
    steps: {
      step1: {
        title: 'Auditoria <strong>Gratis</strong>.',
        body: 'Identifiquem fugues de diners en el procés actual. Mapa de solucions, no promeses.',
      },
      step2: {
        title: 'Desplegament Immediat.',
        body: 'Web en <strong>< 7 dies</strong>. Automatització en <strong>< 10 dies</strong>. Els diners estimen la velocitat.',
      },
      step3: {
        title: 'Escalat Automàtic.',
        body: "El teu equip es pot dedicar a les tasques importants. El client et pot veure.",
      },
    },
    badges: {
      web: 'Web: < 7 dies',
      automation: 'Automatització: < 10 dies',
    },
    cta: 'Reservar Auditoria <strong>Gratis</strong>',
  },
  techEdge: {
    title: 'El nostre avantatge competitiu.',
    web: {
      title: 'Webs d’Alt Rendiment',
      body: 'Webs que carreguen en mil·lisegons. Sense fugues de clients i amb un SEO excel·lent.',
      metrics: {
        title: 'Qualificació de Google (Lighthouse)',
        competitor: 'Competidor local Wordpress',
        us: 'Nosaltres',
        mobileNote:
          '<strong>Aproximadament el 80% dels clients venen des del mòbil</strong>, on aquests resultats són encara més crítics per no perdre clients.',
      },
      cta: 'Llegir més sobre la nostra arquitectura web',
    },
    automation: {
      title: 'Automatització + IA',
      body: 'Desplegament en dies. Sistemes fiables amb les millors eines del mercat per estalviar centenars d’hores.',
      cta: 'Veure projectes d’automatització',
    },
    bridge: {
      title: 'Sistema complet Web + Automatització',
      body: 'Unim web, automatització i IA en un únic sistema. Menys fricció operativa, més capacitat de creixement.',
      cta: 'Veure projectes full system',
    },
  },
  cta: {
    ...en.cta,
    title: 'Continuaràs deixant que el teu sistema perdi diners?',
    titleHighlight: 'El risc és nostre.',
    description:
      'Obté un mapa de solucions en una trucada de 15 min. Si no complim els objectius de conversió pactats, <strong>no pagues ni un cèntim</strong>. Així de simple.',
    docs: 'Veure Casos d’Èxit',
    command: 'Vull la meva Auditoria <strong>Gratis</strong>',
    guaranteeBadge: 'Garantia de Devolució 100%',
    funnel: {
      step1Title: 'El teu nom',
      nameLabel: 'Nom',
      namePlaceholder: 'Nom complet',
      step2Title: 'Com et podem contactar?',
      emailLabel: 'Email',
      emailPlaceholder: 'tu@empresa.com',
      phoneLabel: 'Telèfon',
      phoneOptional: 'opcional',
      phonePlaceholder: '+34 …',
      honeypotLabel: 'Empresa',
      next: 'Continuar',
      back: 'Enrere',
      step3Title: 'Tria una hora',
      leadError: 'Alguna cosa ha anat malament. Torna-ho a provar.',
      nameError: 'Introdueix el teu nom (mínim 2 caràcters).',
      emailError: 'Introdueix un email vàlid.',
      savingHint: 'Desant les teves dades…',
    },
  },
  footer: {
    ...en.footer,
    copyright: '© {year} Astro Business Stack. Llicència MIT.',
    links: {
      ...en.footer.links,
      documentation: 'Docs',
      license: 'Llicència',
    },
  },
  home: {
    ...en.home,
    title: 'Benvingut a Iluro Digital',
  },
  blog: {
    ...en.blog,
    title: 'Sistemes que escalen el teu negoci',
    description: "Solucions digitals premium per accelerar captacio i creixement d'operacions.",
    allPosts: 'Casos i coneixement estratègic',
    featured: 'Solucions principals',
    noPosts: "No s'han trobat solucions",
    relatedPosts: 'Solucions relacionades',
    backToBlog: 'Tornar als serveis',
    filterLabel: 'Filtrar per',
    filterAll: 'Tots',
    filter: {
      web: 'Web',
      automation: 'Automatització',
      'full-system': 'Sistema complet',
    },
    updatedPrefix: 'Actualitzat',
    readTime: '{minutes} min de lectura',
    shareLabel: 'Compartir:',
    shareTwitter: 'Compartir a Twitter',
    shareLinkedIn: 'Compartir a LinkedIn',
    copyLink: 'Copiar enllaç',
    subscribe: "Subscriu-te",
    subscribeDescription: 'Rep els últims articles i actualitzacions al teu correu.',
    emailPlaceholder: 'Introdueix el teu correu',
    subscribeButton: "Subscriure'm",
    servicesTerminal: {
      chromeLabel: 'deploy',
      line1: '> Iniciant sistema Iluro Digital...',
      line2: '',
      line3: '[OK] Web d alta velocitat creada (Puntuacio 100%)',
      line4: '[OK] Agent d IA configurat (Claude + n8n)',
      line5: '',
      line6: '> Processant correus de clients...',
      line7: '  - Classificant correus per prioritat: Fet.',
      line8: '  - Creant esborranys de resposta: Fet.',
      line9: '  - Sincronitzant amb agenda: Fet.',
      line10: '',
      line11: '> RESULTATS DEL SISTEMA:',
      line12: '    - Temps estalviat: 40 hores/setmana a la baixa',
      line13: '    - Diners estalviats: Costos operatius a la baixa',
      line14: '    - Conversio: Nous clients a l alca',
      line15: '> ESTAT: Sistema generant beneficis.',
    },
  },
  portfolio: {
    ...en.portfolio,
    title: 'Portfoli',
    description: 'Casos reals, metriques i resultats.',
    breadcrumb: 'Portfoli',
    backToIndex: 'Tornar al portfoli',
  },
  salesCommon: {
    heroCtaAudit: 'Reservar auditoria gratuita',
    heroCtaCases: 'Veure casos',
  },
  salesWeb: {
    ...en.salesWeb,
    metaTitle: 'Webs i rendiment — Iluro Digital',
    metaDescription:
      "Llocs Astro ràpides, edits senzills pel teu equip, formularis fiables amb auditoria gratuïta abans de desenvolupament de pagament.",
    heroTitleAccent: 'Astro lleuger i immediat',
    heroTitleRest: 'Edicions habituals sense pastitxe de connectors.',
    heroSubtitle:
      'Amb auditoria gratuïta ordenem fugides i prioritats abans de parlar de cost.',
    heroCtaFeaturedCase: 'Cas destacat: Envilo →',
    smackdownTitle: 'Competència local vs Iluro',
    smackdownLegacyLabel: 'Stack tipus WP carregat',
    smackdownLegacyCaption:
      "Plugins antics, widgets de xat, temps real innecessari… en conjunt es nota en pantalla gran i més al mòbil.",
    smackdownOurLabel: 'Build Iluro amb Astro',
    smackdownOurCaption:
      'Contingut sobretot ja servit lleuger, poc “teatre tecnològic” i més ordre sobre el domini.',
    smackdownDisclaimerLead: 'Xifres orientatives — verifica a ',
    smackdownLighthouseLinkLabel: 'Google Lighthouse',
    smackdownDisclaimerTrail: '. Poden variar lleugerament segons dispositiu i condicions del test.',
    stackStripLabel: 'Stack que despleguem en projectes web',
    stackStripAria: 'Tecnologies habituals en projectes Iluro de màxim rendiment',
    ctaPrepTitle: 'Què inclou l’auditoria gratuïta',
    ctaPrepSubtitle: 'Sense factura inicial — un repàs escrit i parlat.',
    ctaPrepPoint1: 'On la velocitat fricciona conversions que ni comptabilitzes.',
    ctaPrepPoint2: 'Pas següents en ordre plausible, sense addons de connectors raríssims.',
    ctaPrepPoint3: 'Valoració discreta sobre encaix; si no casa, tanquem tema amb netedat.',
    enviloFeaturedEyebrow: 'Prova destacada',
    enviloFeaturedLink: 'Llegir cas d’estudi →',
    proofTitle: 'Prova: casos web i rendiment',
    proofMicrocopy:
      'Mètriques que es poden explicar; continua llegint més enllà del cas Envilo.',
    proofEmpty: 'Nous casos en preparació.',
    mechanismTitle: 'Què desenvolupem sobre el teu web',
    mechanismCard1Title: 'Llocs Astro ràpids amb sensació dissenyada',
    mechanismCard1Body:
      'Astro més Tailwind: textos llegibles en mig d’una xarxa feble, visuals equilibrats—sense el pastitxe habitual de sliders del tema.',
    mechanismCard2Title: 'Menú, promotions, cartellera—sense truc al tècnic',
    mechanismCard2Body:
      'Muntem manera natural d’actualitzar (Decap si encaixa, fulls si cal mentre corre el servei) per moure texts, especials caps de setmana, horaris tancats des del dia a dia com si enviess un missatge intern.',
    mechanismCard3Title: 'Contacte i reserves que sí arriben bé',
    mechanismCard3Body:
      'Formularis enllestits amb correu estable via Resend, amb filtres sensats per les bústies no es menjin la feina feta.',
    closeTitle: 'Reserva auditoria gratuïta',
    closeDescription:
      'Tria franja més avall: dibuixem el pla junts. Si el primer mes no encaixa com acordem, et retornem els diners.',
  },
  salesAutomation: {
    ...en.salesAutomation,
    metaTitle: 'Automatització i sistemes IA — Iluro Digital',
    metaDescription:
      "Fluxos n8n allotjats entre tu i proves mesurables que retornen hores — no postureig sobre assistents genèrics.",
    heroTitleAccent: 'n8n sota control teu',
    heroTitleRest: "de correu entrants al CRM—assistència ordenada sobre dades, sense postureig.",
    heroSubtitle:
      "Primer mirem volum i hand‑off amb auditoria gratuïta; el desenvolupament de pagament espera aquest mapa.",
    riskLine: 'Throughput clar, qualitat del triatge i SLAs reals — sense presentacions buïdes sobre IA.',
    stackStripLabel: 'Stack habitual en automatitzacions',
    stackStripAria: "Tecnologies en projectes d'automatització Iluro",
    ctaPrepTitle: "Què inclou l’auditoria gratuïta",
    ctaPrepSubtitle: 'Sense factura inicial — un repàs escrit i sintètic.',
    ctaPrepPoint1:
      'Mapa de càrrega: quins bucles cremen temps i quins esgarrapen conversions.',
    ctaPrepPoint2:
      'Revisions humanes clares sobre el que mai pot enviar‑se sense segona lectura.',
    ctaPrepPoint3: 'Opinió honesta sobre ferramentes — sense enfonsar‑te amb llicències abans del valor.',
    closeDescription:
      "Reserva franja més avall: obrim primer el bucle amb més fricció. Si el primer mes falla sobre el pactat, retornem l’import.",
  },
  salesFullSystem: {
    ...en.salesFullSystem,
    metaTitle: 'Sistemes de creixement integral — Iluro Digital',
    metaDescription:
      "Superfícies Astro ràpides més motion autònom darrere—infraestructura que no et separa dues consultories.",
    heroTitleAccent: 'Demanda i orquestració lligades',
    heroTitleRest:
      'Astro net al davant i automació organitzada al darrere—mateix programa, dues capes alineades.',
    heroSubtitle:
      "L’auditoria gratuïta llegeix captació i operacions juntes; la integració segueix la història d’ingressos — no el catàleg de pantalles.",
    riskLine:
      'Throughput, disciplina sobre cost d’entrada clients i temps de tancament — sense checklist nou de pantalles.',
    stackStripLabel: 'Referència de stack integrades',
    stackStripAria: "Capes habituals en projectes de sistema complet Iluro",
    ctaPrepTitle: 'Què alinea l’auditoria gratuïta',
    ctaPrepSubtitle: 'Safata i internals en el mateix recorregut, sense entrada de pagament inicial.',
    ctaPrepPoint1:
      'Captació: punts de fricció sobre la superfície Astro mesurats davant la teva audiència pagada.',
    ctaPrepPoint2:
      "Medul·la operativa: quina automatització desbloqueja veritat del canal i SLA visible.",
    ctaPrepPoint3: "Riels d’inversió: escalem pressupost quan els senyals ho demanen, no per addons.",
    closeDescription:
      'Reserva a continuació — alinement del conjunt abans del salt gran. Si el primer mes falla conforme pactem, tornem la quota pactada.',
  },
};
