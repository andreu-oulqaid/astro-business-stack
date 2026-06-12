import type { TranslationKeys } from './en';

/**
 * Spanish translations
 */
export const es: TranslationKeys = {
  // Site
  site: {
    name: 'Astro Business Stack',
    description: 'Sitios Astro SSR autoalojados con Docker, CMS OAuth de GitHub y CI/CD a VPS.',
  },

  // Navigation
  nav: {
    home: 'Inicio',
    about: 'Acerca de',
    blog: 'Funciones',
    contact: 'Contacto',
    features: 'Funciones',
    process: 'Arquitectura',
    work: 'Despliegues',
    faq: 'FAQ',
    components: 'Componentes',
    docs: 'Documentación',
    getStarted: 'Ver en <strong>GitHub</strong>',
    portfolio: 'Despliegues',
    serviceWeb: 'Webs',
    serviceAutomation: 'Automatización',
    serviceFullSystem: 'Sistema completo',
    servicesHub: 'Servicios',
    servicesMenu: 'Servicios',
  },

  // Common
  common: {
    readMore: 'Leer más',
    loading: 'Cargando...',
    error: 'Ocurrió un error',
    notFound: 'Página no encontrada',
    backHome: 'Volver al inicio',
    copied: '¡Copiado!',
    copy: 'Copiar',
  },

  // Hero Section
  hero: {
    badge: 'Showcase de ingeniería en producción',
    title: 'Stack de negocio Astro autoalojado en',
    titleHighlight: 'tu VPS.',
    description:
      'Sitios SSR en Docker, <strong>CMS con OAuth de GitHub</strong>, CI/CD con GitHub Actions e integraciones opcionales con Notion, Supabase, Resend y Cal.com.',
    cta: 'Ver en GitHub',
    secondaryCta: 'Despliegues en vivo',
    github: 'Ver en GitHub',
    socialProof: 'Plataforma multi-tenant en VPS Hetzner',
  },

  trustBar: {
    label: 'Construido con',
    velocityTitle: 'Velocity — base UI de Southwell Media',
    attributionPrefix: 'Base UI de ',
    attributionLink: 'Velocity',
    attributionSuffix: ' por Southwell Media',
    item1: 'Astro 6 SSR + adaptador Node',
    item2: 'Builds Docker multi-etapa',
    item3: 'Deploy SSH con GitHub Actions',
    item4: 'OAuth Decap autoalojado',
    item5: 'Integraciones de producción opcionales',
  },

  demoVideo: {
    badge: 'Recorrido',
    title: 'El stack en acción',
    description: 'Recorrido breve de deploy, auth CMS e integraciones.',
    placeholder: 'Vídeo demo próximamente',
    posterAlt: 'Recorrido del stack web autoalojado — listo para producción y automatizado',
    playLabel: 'Reproducir vídeo del recorrido',
  },

  liveDemo: {
    badge: 'Pruébalo tú',
    title: 'Sandbox de integraciones en vivo',
    description:
      'Simula un pipeline de formulario lead con Supabase y Notion de demo — mismo patrón que en producción.',
    runButton: 'Ejecutar pipeline',
    running: 'Ejecutando pipeline…',
    attemptsLeft: '{remaining} de {max} ejecuciones / hora',
    captured: 'Leads capturados',
    failed: 'Fallidos',
    recentActivity: 'Actividad reciente',
    noActivity: 'Aún no hay ejecuciones.',
    rateLimited: 'Demasiadas ejecuciones. Inténtalo de nuevo en una hora.',
    pipelineError: 'El pipeline falló. Revisa la configuración de demo.',
    terminal: {
      idle: 'Ejecuta el pipeline para ver la salida.',
      received: 'Lead recibido: {lead}',
      writingAnalytics: '◐ Escribiendo evento de analytics…',
      supabaseOk: 'Supabase: lead_captured',
      syncingNotion: '◐ Sincronizando con Notion CRM…',
      notionOk: 'Notion: fila creada',
      notionFailed: 'Notion: error',
      sendingNotify: '◐ Enviando notificación…',
      resendOk: 'Resend: simulado — sin email',
      resendSkipped: 'Resend: omitido',
      complete: 'Pipeline completado ({ms}ms)',
      failed: 'Pipeline fallido',
    },
  },

  realityCheck: {
    title: 'Ignorar estos problemas <strong>no es gratis</strong>.',
    left: {
      webTitle: '<strong>Sin web / web obsoleta.</strong>',
      webBody:
        'Estás regalando clientes a la competencia. <strong>No ahorras dinero, pierdes mercado.</strong>',
      autoTitle: '<strong>Sin automatización + IA.</strong>',
      autoBody:
        'Tu equipo invierte su tiempo en tareas repetitivas. <strong>Estás Desperdiciando talento y dinero</strong>.',
    },
    right: {
      authorityTitle: '<strong>Pérdida de autoridad.</strong>',
      authorityBody: 'En 2026, si no eres digital, <strong>eres invisible.</strong>',
      opportunityTitle: '<strong>Coste de oportunidad.</strong>',
      opportunityBody:
        "Mientras tú 'te lo piensas', tu <strong>competencia captura el mercado</strong> con sistemas automáticos.",
    },
    cta: 'Quiero <strong>diagnosticar</strong> a mi empresa <strong>gratis</strong>.',
  },

  leakToFlow: {
    title: 'El <span class="text-brand-500"><strong>pipeline de deploy</strong></span> — del CMS al VPS.',
    steps: {
      step1: {
        title: '<strong>Login</strong> con OAuth.',
        body: 'El editor abre /admin. Gateway OAuth autoalojado redirige a GitHub y devuelve un token CMS.',
      },
      step2: {
        title: 'Editar en <strong>Decap CMS</strong>.',
        body: 'Cambios de contenido en el editor visual. Sin SaaS de auth de terceros.',
      },
      step3: {
        title: '<strong>Commit</strong> a GitHub.',
        body: 'Decap guarda en la rama del repo — develop para test, main para producción.',
      },
      step4: {
        title: 'Deploy con <strong>GitHub Actions</strong>.',
        body: 'El workflow hace SSH al VPS, pull del código y dispara el rebuild.',
      },
      step5: {
        title: 'Rebuild <strong>Docker</strong> en VPS.',
        body: 'Build multi-etapa y compose up en la red web-public.',
      },
      step6: {
        title: 'Sitio <strong>en vivo</strong> actualizado.',
        body: 'Nginx Proxy Manager gestiona TLS. Astro SSR sirve el nuevo build.',
      },
    },
    badges: {
      auth: 'Auth: OAuth autoalojado',
      web: 'CI: GitHub Actions',
      automation: 'Runtime: Docker + Astro SSR',
    },
    readDocs: 'Leer docs',
    cta: 'Ver <strong>guías de deploy</strong>',
  },

  docs: {
    title: 'Guías de deploy',
    description: 'Cómo funcionan el pipeline de contenido y el deploy en producción — paso a paso.',
    breadcrumb: 'Docs',
    backToIndex: 'Volver a docs',
  },

  techEdge: {
    title: 'Capacidades del stack',
    metrics: {
      ssr: 'Renderizado',
      ssrValue: 'Astro SSR',
      locales: 'Idiomas',
      localesValue: '4',
      containers: 'Deploy',
      containersValue: '2 contenedores',
    },
    web: {
      title: 'Astro SSR + design system',
      body: 'Páginas SSR, routing i18n, content collections tipadas y librería de componentes.',
      metrics: { title: '', competitor: '', us: '', mobileNote: '' },
      cta: 'Artículo multi-locale SSR',
    },
    automation: {
      title: 'CI/CD + Docker',
      body: 'Deploy SSH con GitHub Actions, builds Docker multi-etapa y rollback por tags en el VPS.',
      cta: 'Guía de deploy en producción',
    },
    bridge: {
      title: 'Integraciones de negocio',
      body: 'Notion CRM, Resend, Supabase analytics y Cal.com — vía rutas API tipadas.',
      cta: 'Artículo lead funnel',
    },
    readGuide: 'Leer guía',
  },

  servicesSection: {
    title: 'Servicios pensados para crecer, no para metricas vanidosas.',
    description:
      'Cada servicio se disena para aumentar la demanda cualificada y reducir friccion desde el primer clic.',
    cards: {
      websites: {
        title: 'Webs Conversion-First',
        description: 'Arquitectura estrategica, copy persuasivo y rendimiento optimizado para generar leads.',
      },
      funnels: {
        title: 'Funnels y automatizacion',
        description: 'Captura, cualifica y nutre leads con un traspaso claro a ventas.',
      },
      optimization: {
        title: 'CRO e iteracion continua',
        description: 'Tests y mejoras UX constantes que elevan la conversion de forma acumulativa.',
      },
    },
  },

  comparisonSection: {
    title: 'Por que los equipos cambian agencias tradicionales por Iluro Digital.',
    traditional: 'Agencias tradicionales',
    iluro: 'Iluro Digital',
    rows: {
      speed: {
        label: 'Velocidad de entrega',
        traditional: 'Plazos lentos y demasiadas capas de aprobacion',
        iluro: 'Sprints rapidos con hitos claros',
      },
      communication: {
        label: 'Comunicacion',
        traditional: 'Jergas y reportes poco claros',
        iluro: 'Comunicacion directa centrada en resultados',
      },
      roi: {
        label: 'Impacto en negocio',
        traditional: 'Metricas de actividad',
        iluro: 'Decisiones guiadas por pipeline e ingresos',
      },
    },
  },

  selectedWorkSection: {
    title: 'Trabajo seleccionado con resultados medibles.',
    items: {
      one: {
        title: 'Rediseño de landing para servicios B2B',
        result: '+42% en reservas de llamadas cualificadas en 90 dias',
      },
      two: {
        title: 'Nuevo flujo de leads para marca local',
        result: '2.1x en ratio lead a reunion',
      },
      three: {
        title: 'Replanteamiento de oferta y funnel',
        result: 'Ciclo comercial mas corto y leads de mayor intencion',
      },
    },
  },

  homeFaq: {
    title: 'Preguntas frecuentes antes de empezar.',
  },

  // Tech Stack Section
  techStack: {
    astro: {
      name: 'Astro 6',
      desc: 'Islas de servidor y capa de contenido',
    },
    tailwind: {
      name: 'Tailwind v4',
      desc: 'Motor CSS sin runtime',
    },
    typescript: {
      name: 'TypeScript',
      desc: 'Seguridad de tipos estricta por defecto',
    },
    motion: {
      name: 'Motion',
      desc: 'Animaciones declarativas',
    },
  },

  // Feature Tabs Section
  features: {
    sectionTitle: 'Todo lo que necesitas.',
    sectionTitleHighlight: 'Nada que no.',
    sectionDescription:
      'Eliminamos el exceso y mantuvimos las primitivas que realmente aceleran el desarrollo para agencias y freelancers.',
    tabs: {
      design: {
        label: 'Sistema de Diseño',
        desc: 'Tokens globales y tipografía',
        title: 'Tokens de Diseño CSS-First',
        content:
          'Velocity implementa un sistema de diseño completo usando la nueva configuración CSS-first de Tailwind v4. Sin archivos de configuración JavaScript desordenados.',
      },
      seo: {
        label: 'SEO y Meta',
        desc: 'OpenGraph y sitemaps',
        title: 'Manejo Automatizado de SEO',
        content:
          'Las colecciones de contenido de Astro potencian la inyección de metadatos tipados para cada página. Las imágenes para compartir se generan automáticamente.',
      },
      perf: {
        label: 'Rendimiento',
        desc: '100/100 Core Web Vitals',
        title: 'Cero JS por Defecto',
        content:
          'Utilizamos la arquitectura de islas de Astro para asegurar que tus páginas de marketing envíen 0kb de JavaScript al cliente a menos que sea explícitamente interactivo.',
      },
      components: {
        label: 'Componentes',
        desc: 'Primitivas de UI reutilizables',
        title: 'Componentes Type-Safe',
        content:
          'Construye con confianza usando componentes TypeScript-first. Validación completa de props y autocompletado del IDE incluidos.',
      },
      i18n: {
        label: 'Internacionalización',
        desc: 'Soporte multilenguaje',
        title: 'Internacionalización Integrada',
        content:
          'Soporte de primera clase para sitios multilenguaje con traducciones type-safe, detección automática de idioma y estructuras de URL amigables para SEO.',
      },
    },
  },

  // Credibility Section
  credibility: {
    badge: 'Probado en Producción',
    title: 'Creado por Southwell Media. Nacido de la',
    titleHighlight: 'presión de plazos',
    paragraph1:
      'Somos una agencia digital que entrega sitios de marketing de alto rendimiento. Nos cansamos de pasar los primeros 3 días de cada proyecto configurando las mismas herramientas, configuraciones SEO y definiciones de tipos.',
    paragraph2:
      'Velocity no es un ejercicio teórico. Es exactamente el código que usamos para entregar proyectos de clientes en 14-21 días en lugar del estándar de la industria de 60.',
    stats: {
      lighthouse: {
        score: 'Perfecto',
        label: 'Puntuaciones Lighthouse',
      },
      delivery: {
        days: '14 Días',
        label: 'Tiempo Promedio de Entrega',
      },
    },
    standard: {
      title: 'El Estándar Velocity',
      items: [
        'Sin CSS no utilizado en producción',
        'Imágenes optimizadas en tiempo de compilación',
        'Content Collections tipadas',
        'Primitivas accesibles preconfiguradas',
      ],
    },
    testimonial: {
      quote: '"El boilerplate más limpio que he visto en 2024. Elimina lo innecesario."',
      author: '— Alex C., Senior Frontend Dev',
    },
  },

  // CTA Section
  cta: {
    title: 'Listo para desplegar el stack',
    titleHighlight: 'stack',
    description:
      'Clona el repositorio, sigue la documentación y adapta el patrón a tu propio VPS o proyectos de clientes.',
    docs: 'Leer documentación',
    reachOut: 'Escríbeme',
    command: 'Ver en GitHub',
    guaranteeBadge: 'Licencia MIT',
    privacyNotePrefix:
      'Al continuar, aceptas nuestra',
    privacyNoteLink: 'Política de Privacidad',
    privacyNoteSuffix:
      'que detalla cómo procesamos tus datos con Supabase, Notion, Resend y Cal.com para gestionar tu auditoría.',
    funnel: {
      step1Title: 'Tu nombre',
      nameLabel: 'Nombre',
      namePlaceholder: 'Nombre completo',
      step2Title: '¿Cómo te contactamos?',
      emailLabel: 'Email',
      emailPlaceholder: 'tu@empresa.com',
      phoneLabel: 'Teléfono',
      phoneOptional: 'opcional',
      phonePlaceholder: '+34 …',
      honeypotLabel: 'Empresa',
      next: 'Continuar',
      back: 'Atrás',
      step3Title: 'Elige una hora',
      leadError: 'Algo salió mal. Inténtalo de nuevo.',
      nameError: 'Introduce tu nombre (mínimo 2 caracteres).',
      emailError: 'Introduce un email válido.',
      savingHint: 'Guardando tus datos…',
    },
  },

  // Footer
  footer: {
    copyright: '© {year} Astro Business Stack. Licencia MIT.',
    madeWith: 'Hecho con',
    maintainedBy: 'Mantenido por',
    links: {
      documentation: 'Docs',
      github: 'GitHub',
      linkedin: 'LinkedIn',
      twitter: 'GitHub',
      license: 'Licencia',
      privacy: 'Privacidad',
    },
  },

  // Home page
  home: {
    title: 'Bienvenido a Velocity',
    subtitle: 'El starter de Astro con opiniones que realmente quieres usar',
    cta: 'Comenzar',
  },

  // About page
  about: {
    meta: {
      title: 'Sobre Nosotros',
      description: 'Conoce Velocity y el equipo detrás del proyecto.',
    },
    hero: {
      badge: 'Nuestra Historia',
      title: 'Creado por desarrolladores,',
      titleHighlight: 'para desarrolladores.',
      description: 'Velocity nació de la frustración de configurar las mismas herramientas una y otra vez. Decidimos crear el starter que siempre quisimos que existiera.',
    },
    mission: {
      title: 'Nuestra Misión',
      description: 'Ayudar a los desarrolladores a crear sitios web hermosos y de alto rendimiento más rápido, eliminando el código repetitivo y proporcionando valores predeterminados sensatos.',
    },
    values: {
      title: 'Lo Que Creemos',
      performance: {
        title: 'Rendimiento Primero',
        description: 'Cada decisión se toma pensando en el rendimiento. Cero JavaScript por defecto, imágenes optimizadas y CSS mínimo.',
      },
      simplicity: {
        title: 'La Simplicidad Importa',
        description: 'Eliminamos la complejidad para que puedas enfocarte en lo que importa: crear excelentes productos para tus usuarios.',
      },
      openSource: {
        title: 'Código Abierto',
        description: 'Velocity es gratuito y de código abierto. Creemos en devolver a la comunidad que hizo esto posible.',
      },
    },
  },

  // Contact page
  contact: {
    meta: {
      title: 'Contáctanos',
      description: 'Ponte en contacto con el equipo de Velocity.',
    },
    hero: {
      badge: 'Ponte en Contacto',
      title: 'Vamos a',
      titleHighlight: 'conectar.',
      description: '¿Tienes una pregunta, sugerencia o simplemente quieres saludar? Nos encantaría saber de ti.',
    },
    form: {
      title: 'Envíanos un mensaje',
      name: 'Tu Nombre',
      namePlaceholder: 'Juan Pérez',
      email: 'Correo Electrónico',
      emailPlaceholder: 'juan@ejemplo.com',
      subject: 'Asunto',
      subjectPlaceholder: '¿Cómo podemos ayudarte?',
      message: 'Mensaje',
      messagePlaceholder: 'Cuéntanos más sobre tu proyecto o pregunta...',
      submit: 'Enviar Mensaje',
      sending: 'Enviando...',
      success: '¡Mensaje enviado con éxito! Te responderemos pronto.',
      error: 'Error al enviar el mensaje. Por favor, inténtalo de nuevo más tarde.',
    },
    info: {
      title: 'Otras formas de contactarnos',
      email: {
        label: 'Correo',
        value: 'hola@velocity.dev',
      },
      github: {
        label: 'GitHub',
        value: 'github.com/velocity',
      },
      twitter: {
        label: 'Twitter',
        value: '@velocity_dev',
      },
    },
  },

  // Forms
  form: {
    name: 'Nombre',
    email: 'Correo electrónico',
    message: 'Mensaje',
    submit: 'Enviar',
    sending: 'Enviando...',
    success: '¡Mensaje enviado con éxito!',
    error: 'Error al enviar el mensaje. Por favor, inténtalo de nuevo.',
  },

  // Blog
  blog: {
    title: 'Sistemas que escalan tu negocio',
    description: 'Soluciones digitales de alto nivel para crecer en ventas y eficiencia operativa.',
    allPosts: 'Casos y recursos estratégicos',
    featured: 'Soluciones clave',
    noPosts: 'No se encontraron soluciones',
    relatedPosts: 'Soluciones relacionadas',
    backToBlog: 'Volver a servicios',
    filterLabel: 'Filtrar por',
    filterAll: 'Todos',
    filter: {
      capabilities: 'Capacidades',
      integrations: 'Integraciones',
      ssr: 'SSR e i18n',
      cms: 'CMS',
      web: 'Web',
      automation: 'Automatización',
      'full-system': 'Sistema completo',
    },
    updatedPrefix: 'Actualizado',
    readTime: '{minutes} min de lectura',
    shareLabel: 'Compartir:',
    shareTwitter: 'Compartir en Twitter',
    shareLinkedIn: 'Compartir en LinkedIn',
    copyLink: 'Copiar enlace',
    subscribe: 'Suscríbete',
    subscribeDescription: 'Recibe los últimos artículos y actualizaciones en tu correo.',
    emailPlaceholder: 'Introduce tu correo',
    subscribeButton: 'Suscribirse',
    servicesTerminal: {
      chromeLabel: 'deploy',
      line1: '> Iniciando sistema Iluro Digital...',
      line2: '',
      line3: '[OK] Web de alta velocidad creada (Puntuacion 100%)',
      line4: '[OK] Agente de IA configurado (Claude + n8n)',
      line5: '',
      line6: '> Procesando correos de clientes...',
      line7: '  - Categorizando correos por prioridad: Hecho.',
      line8: '  - Creando borradores de respuesta: Hecho.',
      line9: '  - Sincronizando con agenda: Hecho.',
      line10: '',
      line11: '> RESULTADOS DEL SISTEMA:',
      line12: '    - Tiempo ahorrado: 40 horas/semana a la baja',
      line13: '    - Dinero ahorrado: Gastos operativos a la baja',
      line14: '    - Conversion: Captando nuevos clientes al alza',
      line15: '> ESTADO: Sistema generando beneficios.',
    },
  },

  portfolio: {
    title: 'Casos',
    description: 'Casos reales, métricas y resultados.',
    breadcrumb: 'Casos',
    backToIndex: 'Volver a casos',
  },

  servicesHubPage: {
    metaTitle: 'Servicios — Iluro Digital',
    metaDescription:
      'Elige rendimiento web, automatización o un sistema integrado completo — y valídalo en el portfolio de casos.',
    title: 'Elige tu palanca de crecimiento',
    subtitle:
      'Tres pilares de conversión y una biblioteca de prueba. Empieza donde pierdes tiempo o demanda.',
    cardWebTitle: 'Web y velocidad',
    cardWebBody: 'Astro, CWV y SEO como infraestructura de captación — no decoración.',
    cardAutomationTitle: 'Automatización e IA',
    cardAutomationBody: 'n8n self-hosted + LLMs que recuperan horas de dirección y operaciones cada semana.',
    cardFullTitle: 'Sistema completo',
    cardFullBody: 'Captación, cualificación y movimiento de pipeline en un bucle que se refuerza solo.',
    cardPortfolioTitle: 'Portfolio',
    cardPortfolioBody: 'Casos con las métricas que importan a operadores y compradores.',
    explore: 'Abrir',
    heroBadge: 'Servicios · Pilares y portfolio',
  },

  salesCommon: {
    heroCtaAudit: 'Reservar auditoría gratuita',
    heroCtaCases: 'Ver casos',
  },

  salesWeb: {
    metaTitle: 'Webs y rendimiento — Iluro Digital',
    metaDescription:
      'Sitios Astro rápidos, cambios sencillos para el equipo y formularios fiables, con auditoría gratuita antes de proyecto de pago.',
    heroTitleAccent: 'Astro ligero y rápido',
    heroTitleRest: 'Ediciones cotidianas sin chapuza de plugins.',
    heroSubtitle:
      'Antes de cobrar, una auditoría gratuita ordena fugas y orden de trabajo.',
    heroCtaFeaturedCase: 'Caso destacado: Envilo →',
    smackdownTitle: 'Competencia local vs Iluro',
    smackdownLegacyLabel: 'Stack tipo WP pesado',
    smackdownLegacyCaption:
      'Plugins, themes desordenadas, tiempo real innecesario, widgets externos: en conjunto frenan hasta en 4G decente.',
    smackdownOurLabel: 'Build Iluro con Astro',
    smackdownOurCaption:
      'Mucho contenido ya servido como HTML ligero y animaciones con intención, no efectos porque “hay que llenar”.',
    smackdownDisclaimerLead: 'Cifras orientativas — verifica en ',
    smackdownLighthouseLinkLabel: 'Google Lighthouse',
    smackdownDisclaimerTrail: '. Pueden variar ligeramente según dispositivo y condiciones del test.',
    stackStripLabel: 'Stack que desplegamos en proyectos web',
    stackStripAria: 'Tecnologías típicas en proyectos Iluro de alto rendimiento',
    ctaPrepTitle: 'Qué entra en la auditoría gratuita',
    ctaPrepSubtitle: 'Antes de facturarte nada — un resumen claro.',
    ctaPrepPoint1: 'Mapa de fugas: dónde la lentitud o la fricción matan conversiones cotidianas.',
    ctaPrepPoint2: 'Roadmap ordenado sin jerga: qué mejorar antes y qué esperar después.',
    ctaPrepPoint3: 'Juicio sincero sobre encaje — sin obligación de seguir con nosotros.',
    enviloFeaturedEyebrow: 'Prueba destacada',
    enviloFeaturedLink: 'Leer caso de estudio →',
    proofTitle: 'Prueba: casos web y rendimiento',
    proofMicrocopy: 'Impacto con números legibles; continúa después del caso Envilo.',
    proofEmpty: 'Más casos de estudio están en camino.',
    mechanismTitle: 'Lo que ponemos sobre tu dominio',
    mechanismCard1Title: 'Webs Astro que parecen marca, no plantilla cansada',
    mechanismCard1Body:
      'Astro + Tailwind para que los textos lleguen rápido con señal mala, fotos proporcionadas y tipografía estable—sin el armazón lleno de módulos que arrastrabas del theme.',
    mechanismCard2Title: 'Carta, carteles de promo, horarios—sin ticket al técnico',
    mechanismCard2Body:
      'Montamos una forma práctica de editar (Decap cuando encaja; hojas de cálculo cuando el equipo va a mil): tu equipo cambia texto, promos u horarios en el día a día, incluso en horas pico detrás del mostrador.',
    mechanismCard3Title: 'Formularios y correos donde deben estar',
    mechanismCard3Body:
      'Formularios conectados a email serio mediante Resend, con filtros útiles contra spam fantasmas—menos mensajes tragados detrás del plugin SMTP de turno.',
    closeTitle: 'Agenda tu auditoría gratuita',
    closeDescription:
      'Elige tu horario abajo: armamos el plan contigo. Si el primer mes no funciona como acordemos, devolvemos el dinero.',
  },

  salesAutomation: {
    metaTitle: 'Automatización e IA — Iluro Digital',
    metaDescription:
      'Flujos n8n self-hosted y copilotos LLM que recuperan tiempo directivo y comprimen la fricción operativa.',
    heroTitleAccent: 'n8n alojado en tu entorno',
    heroTitleRest: 'del inbox al CRM — IA anclada a datos reales, sin postureo.',
    heroSubtitle:
      'Primero ordenamos volumen y hand-off en auditoría gratuita; el proyecto de pago espera ese mapa.',
    riskLine: 'Señales de throughput, SLA y revisión humana — no demos vacías.',
    stackStripLabel: 'Stack habitual en automatización',
    stackStripAria: 'Tecnologías en proyectos de automatización Iluro',
    ctaPrepTitle: 'Qué entra en la auditoría gratuita',
    ctaPrepSubtitle: 'Antes de facturarte nada — un repaso breve y concreto.',
    ctaPrepPoint1:
      'Mapa de carga: qué procesos consumen horas y dónde se pierden conversiones.',
    ctaPrepPoint2:
      'Límites explícitos: revisión humana, retención de datos y redacción responsable.',
    ctaPrepPoint3: 'Valoración sobre encaje de tooling — sin tirarte con licencias inútiles antes de ver valor.',
    tableTitle: 'Coste humano vs coste agente (ops mid-market típico)',
    tableDimension: 'Dimensión',
    tableHuman: 'Liderado humano',
    tableAgent: 'Agente + stack Iluro',
    tableRow1Dim: 'Clasificación y ruteo de leads',
    tableRow1Human: 'Horas diarias entre roles; SLA inconsistente',
    tableRow1Agent: 'Clasificación en segundos + tareas listas para CRM',
    tableRow2Dim: 'Redacción de seguimiento',
    tableRow2Human: 'Copiar/pegar + cambio de contexto',
    tableRow2Agent: 'Borradores fundamentados con tus datos históricos',
    tableRow3Dim: 'Sincronización entre herramientas',
    tableRow3Human: 'Exportaciones manuales y puentes en hojas',
    tableRow3Agent: 'Sync orientado a eventos con reintentos y observabilidad',
    proofTitle: 'Prueba: casos de automatización',
    proofEmpty: 'Más historias de automatización llegan pronto.',
    mechanismTitle: 'Qué automatizamos primero',
    mechanismCard1Title: 'Inbox → pipeline',
    mechanismCard1Body: 'Cualificación, etiquetado y ruteo consciente del calendario antes de que un humano toque el hilo.',
    mechanismCard2Title: 'Higiene del CRM',
    mechanismCard2Body: 'Dedupe, triggers de enriquecimiento y temporizadores SLA para que ventas confíe en la base.',
    mechanismCard3Title: 'Barreras del operador',
    mechanismCard3Body: 'Puntos de control human-in-the-loop para lo sensible con clientes o legal.',
    terminalChrome: 'automatizar',
    terminalLine1: '> arranque de automatización iluro…',
    terminalLine2: '',
    terminalLine3: '[OK] grafo n8n validado',
    terminalLine4: '[OK] políticas Claude + reglas de redacción',
    terminalLine5: '',
    terminalLine6: '> simulando carga semanal de ops…',
    terminalLine7: '  - Clasificación de leads: 412 msgs → 0 clasificaciones manuales',
    terminalLine8: '  - Actualizaciones CRM: 318 escrituras automatizadas',
    terminalLine9: '  - Borradores asistidos: 96% aceptados con ediciones ligeras',
    terminalLine10: '',
    terminalLine11: '> ESTADO: Automatización neto-positiva vs semana base.',
    closeTitle: '¿Quieres flujos que <strong>se acumulen</strong>?',
    closeDescription:
      'Reserva hueco abajo: abrimos el bucle más doloroso primero. Si el primer mes falla respecto lo alineado, devolvemos el importe pactado.',
  },

  salesFullSystem: {
    metaTitle: 'Sistemas de crecimiento full-stack — Iluro Digital',
    metaDescription:
      'Combina superficies de captación de alto rendimiento con backend autónomo: una infraestructura de ingresos.',
    heroTitleAccent: 'Demanda y orquestación a la vez',
    heroTitleRest: 'front Astro rápido y trabajo autónomo detrás — mismo criterio, no dos proveedores reñidos.',
    heroSubtitle:
      'La auditoría gratuita cruza superficie y operaciones; la integración sigue la historia de ingresos, no el inventario de features.',
    riskLine: 'Throughput, control de coste de captación y tiempo de ciclo — no checklist de pantallas nuevas.',
    stackStripLabel: 'Referencias de stack integradas',
    stackStripAria: 'Capas habituales en proyectos sistema completo Iluro',
    ctaPrepTitle: 'Qué alinea la auditoría gratuita',
    ctaPrepSubtitle: 'Superficie y backends en una sola pasada, sin entrada previa.',
    ctaPrepPoint1: 'Captación: roce en Astro frente al tráfico que ya financias.',
    ctaPrepPoint2:
      'Médula operativa: qué automatización desbloquea verdad de pipeline y visibilidad de SLA.',
    ctaPrepPoint3: 'Rieles de inversión: escalar gasto solo tras señales, no tras menús de addons.',
    revenueTitle: 'El bucle de ingresos (integrado)',
    revenueIntro:
      'Tres etapas sincronizadas alinean demanda, inteligencia y ventas sin heroísmos operativos.',
    revenueStep1: 'Captura: superficie Astro sin fricción convierte atención en intención.',
    revenueStep2: 'Cualifica: IA + automatización tria, enriquece y prepara la sala de ventas.',
    revenueStep3: 'Cierra: los humanos invierten tiempo solo en oportunidades calientes y cualificadas.',
    revenueNote:
      'El diagrama es ilustrativo; residencia de datos, compliance y tu stack real definen la arquitectura final.',
    proofTitle: 'Prueba: proyectos sistema completo',
    proofEmpty: 'Más builds integrados están en documentación.',
    mechanismTitle: 'Cómo se apilan los pilares',
    mechanismCard1Title: 'Capa de demanda',
    mechanismCard1Body: 'Páginas, contenido y presupuestos de rendimiento orientados a captación y confianza.',
    mechanismCard2Title: 'Capa de sistemas',
    mechanismCard2Body: 'Flujos, integraciones y observabilidad que mantienen los datos honestos en movimiento.',
    mechanismCard3Title: 'Capa de ingresos',
    mechanismCard3Body: 'Verdad del CRM, SLAs e informes de dirección ligados a resultados de pipeline.',
    closeTitle: 'Construye <strong>infraestructura de ingresos</strong>, no features',
    closeDescription:
      'Reserva abajo: alineamos el conjunto antes de grandes desembolsos. Si el primer mes no cumple lo acordado, devolvemos esa parte.',
  },

  // Components Page
  components: {
    meta: {
      title: 'Componentes',
      description: 'Explora la biblioteca completa de componentes UI de Velocity. Listos para producción, accesibles y bellamente diseñados.',
    },
    hero: {
      badge: 'Componentes de Producción',
      title: 'Biblioteca de',
      titleHighlight: 'Componentes',
      description: 'Primitivas UI listas para producción, construidas con accesibilidad y rendimiento en mente. Copia, pega y personaliza para tu marca.',
      browseComponents: 'Explorar Componentes',
      viewSource: 'Ver Código',
    },
    categories: {
      buttons: 'Botones',
      inputs: 'Campos de Formulario',
      feedback: 'Retroalimentación',
      overlays: 'Superposiciones',
      data: 'Visualización de Datos',
      loading: 'Cargando',
    },
    sections: {
      buttons: {
        title: 'Botones',
        description: 'Elementos interactivos para acciones y navegación. Todas las variantes soportan iconos, estados de carga y accesibilidad completa.',
        variants: 'Variantes',
        variantsHint: '6 estilos para diferentes contextos',
        sizes: 'Tamaños',
        sizesHint: 'Escalado responsivo',
        states: 'Estados',
        withIcons: 'Con Iconos',
        primary: 'Primario',
        secondary: 'Secundario',
        outline: 'Contorno',
        ghost: 'Fantasma',
        link: 'Enlace',
        destructive: 'Destructivo',
        small: 'Pequeño',
        medium: 'Mediano',
        large: 'Grande',
        default: 'Por defecto',
        loading: 'Cargando',
        disabled: 'Deshabilitado',
        send: 'Enviar',
        export: 'Exportar',
        star: 'Favorito',
      },
      inputs: {
        title: 'Campos de Formulario',
        description: 'Campos de texto, selectores, casillas de verificación y más. Construidos con validación nativa y soporte ARIA.',
        textInput: 'Campo de Texto',
        textInputHint: 'Con etiquetas y validación',
        textarea: 'Área de Texto',
        textareaHint: 'Entrada de texto multilínea',
        select: 'Selector',
        selectHint: 'Desplegable nativo',
        checkboxes: 'Casillas',
        checkboxesHint: 'Controles de selección múltiple',
        planSelection: 'Selección de Plan',
        planSelectionHint: 'Opciones tipo tarjeta',
        emailLabel: 'Correo electrónico',
        emailPlaceholder: 'tu@ejemplo.com',
        passwordLabel: 'Contraseña',
        passwordPlaceholder: '••••••••',
        passwordHint: 'Mínimo 8 caracteres',
        disabledLabel: 'Deshabilitado',
        disabledPlaceholder: 'No editable',
        messageLabel: 'Mensaje',
        messagePlaceholder: 'Escribe tu mensaje aquí...',
        messageHint: 'Soporta formato markdown',
        countryLabel: 'País',
        selectCountry: 'Selecciona un país...',
        termsLabel: 'Acepto los términos de servicio',
        updatesLabel: 'Enviarme actualizaciones del producto',
        notificationsLabel: 'Habilitar notificaciones',
        notificationsDesc: 'Recibir alertas de actualizaciones importantes',
        planFree: 'Gratis',
        planFreeDesc: 'Funciones básicas para proyectos personales',
        planPro: 'Pro',
        planProDesc: 'Herramientas avanzadas para profesionales',
        planTeam: 'Equipo',
        planTeamDesc: 'Funciones de colaboración para equipos',
      },
      feedback: {
        title: 'Retroalimentación',
        description: 'Insignias, alertas e indicadores de estado para comunicar estados y guiar acciones del usuario.',
        badges: 'Insignias',
        badgesHint: 'Indicadores de estado',
        alerts: 'Alertas',
        alertsHint: 'Mensajes contextuales',
        default: 'Por defecto',
        success: 'Éxito',
        warning: 'Advertencia',
        error: 'Error',
        info: 'Info',
        tipTitle: 'Consejo',
        tipContent: 'Usa atajos de teclado para navegar más rápido. Presiona',
        tipKey: '⌘K',
        tipEnd: 'para abrir la paleta de comandos.',
        deployTitle: 'Despliegue exitoso',
        deployContent: 'Tus cambios están en vivo en',
        limitTitle: 'Acercándose al límite',
        limitContent: 'Has usado el 80% de tu cuota mensual de API. Considera actualizar tu plan.',
        buildTitle: 'Compilación fallida',
        buildContent: 'Error en',
        buildError: '— falta prop requerida "variant"',
      },
      overlays: {
        title: 'Superposiciones',
        description: 'Diálogos, menús desplegables, tooltips y pestañas. Navegación completa por teclado y gestión de foco.',
        dialog: 'Diálogo',
        dialogHint: 'Superposición modal',
        dropdown: 'Menú',
        dropdownHint: 'Menú de acciones',
        tooltips: 'Tooltips',
        tooltipsHint: 'Sugerencias contextuales',
        tabs: 'Pestañas',
        tabsHint: 'Organización de contenido',
        openDialog: 'Abrir Diálogo',
        deleteTitle: '¿Eliminar proyecto?',
        deleteDesc: 'Esta acción no se puede deshacer.',
        deleteConfirm: '¿Estás seguro de que quieres eliminar',
        deleteWarning: 'Todos los archivos, despliegues y datos analíticos serán eliminados permanentemente.',
        cancel: 'Cancelar',
        deleteProject: 'Eliminar Proyecto',
        actions: 'Acciones',
        edit: 'Editar',
        duplicate: 'Duplicar',
        share: 'Compartir',
        archive: 'Archivar',
        delete: 'Eliminar',
        top: 'Arriba',
        bottom: 'Abajo',
        left: 'Izquierda',
        right: 'Derecha',
        tooltipTop: 'Tooltip arriba',
        tooltipBottom: 'Tooltip abajo',
        tooltipLeft: 'Tooltip izquierda',
        tooltipRight: 'Tooltip derecha',
        overview: 'Resumen',
        analytics: 'Analíticas',
        settings: 'Configuración',
        overviewContent: 'Resumen del proyecto con métricas clave y actividad reciente. Las pestañas soportan navegación completa por teclado.',
        analyticsContent: 'Datos analíticos con gráficos e información de rendimiento. Usa las flechas para navegar entre pestañas.',
        settingsContent: 'Configura los ajustes de tu proyecto. Usa Inicio/Fin para saltar a la primera/última pestaña.',
      },
      data: {
        title: 'Visualización de Datos',
        description: 'Tarjetas, avatares e iconos para presentar contenido e información del usuario.',
        cards: 'Tarjetas',
        cardsHint: 'Contenedores de contenido',
        avatars: 'Avatares',
        avatarsHint: 'Representaciones de usuario',
        icons: 'Iconos',
        iconsHint: 'Set de iconos Lucide — 24 incluidos',
        stacked: 'Apilados',
        performance: 'Rendimiento',
        performanceScore: '100/100 Lighthouse',
        performanceDesc: 'Cero JavaScript por defecto. Arquitectura de islas con hidratación selectiva para velocidad óptima.',
        typeSafe: 'Type-Safe',
        typeSafeScore: 'TypeScript Completo',
        typeSafeDesc: 'Tipos estrictos con autocompletado del IDE y verificación de errores en tiempo de compilación.',
        i18nReady: 'i18n Listo',
        i18nScore: 'Multi-idioma',
        i18nDesc: 'Sistema de traducción integrado con URLs amigables para SEO y detección automática de idioma.',
      },
      loading: {
        title: 'Cargando',
        description: 'Esqueletos de carga para rendimiento percibido mientras se obtiene el contenido.',
        skeletonTypes: 'Tipos de Esqueleto',
        skeletonTypesHint: 'Texto, circular, rectangular',
        cardSkeleton: 'Esqueleto de Tarjeta',
        cardSkeletonHint: 'Estado de carga compuesto',
      },
    },
    cta: {
      title: '¿Listo para construir?',
      description: 'Estos componentes son solo el comienzo. Clona Velocity y empieza a entregar más rápido.',
      cloneRepo: 'Clonar Repositorio',
      readDocs: 'Leer Documentación',
    },
  },

  // Consent Banner
  consent: {
    heading: 'Preferencias de Cookies',
    description: 'Usamos cookies para mejorar tu experiencia de navegación, ofrecer contenido personalizado y analizar nuestro tráfico.',
    acceptAll: 'Aceptar Todo',
    declineAll: 'Rechazar Todo',
    customize: 'Personalizar',
    savePreferences: 'Guardar Preferencias',
    settingsHeading: 'Configuración de Privacidad',
    privacyPolicyLabel: 'Política de Privacidad',
    alwaysOn: 'Siempre activo',
  },
} as const;
