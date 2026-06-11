/**
 * English translations
 */
export const en = {
  // Site
  site: {
    name: 'Astro Business Stack',
    description: 'Self-hosted Astro SSR sites with Docker, GitHub OAuth CMS, and CI/CD to VPS.',
  },

  // Navigation
  nav: {
    home: 'Home',
    about: 'About',
    blog: 'Features',
    contact: 'Contact',
    features: 'Features',
    process: 'Architecture',
    work: 'Deployments',
    faq: 'FAQ',
    components: 'Components',
    docs: 'Docs',
    getStarted: 'View on GitHub',
    portfolio: 'Deployments',
    serviceWeb: 'Websites',
    serviceAutomation: 'Automation',
    serviceFullSystem: 'Full system',
    servicesHub: 'Services hub',
    servicesMenu: 'Services',
  },

  // Common
  common: {
    readMore: 'Read more',
    loading: 'Loading...',
    error: 'An error occurred',
    notFound: 'Page not found',
    backHome: 'Back to home',
    copied: 'Copied!',
    copy: 'Copy',
  },

  // Hero Section
  hero: {
    badge: 'Production engineering showcase',
    title: 'Self-hosted Astro business stack on',
    titleHighlight: 'your VPS.',
    description:
      'Dockerized SSR sites with GitHub OAuth CMS, CI/CD via GitHub Actions, and optional Notion, Supabase, Resend, and Cal.com integrations.',
    cta: 'View on GitHub',
    secondaryCta: 'Live deployments',
    github: 'View on GitHub',
    socialProof: 'Multi-tenant platform running on Hetzner VPS',
  },

  trustBar: {
    label: 'Built with',
    item1: 'Astro 6 SSR + Node adapter',
    item2: 'Docker multi-stage builds',
    item3: 'GitHub Actions SSH deploy',
    item4: 'Self-hosted Decap OAuth',
    item5: 'Optional production integrations',
  },

  demoVideo: {
    badge: 'Walkthrough',
    title: 'See the stack in action',
    description:
      'A short demo of the deploy pipeline, CMS auth flow, and integration layer. Record your walkthrough and set PUBLIC_DEMO_VIDEO_URL when ready.',
    placeholder: 'Demo video coming soon',
  },

  realityCheck: {
    title: 'Why this stack <strong>exists</strong>.',
    left: {
      webTitle: '<strong>Template sites are not enough.</strong>',
      webBody:
        'Boilerplates prove UI. <strong>This repo proves deployment, CMS auth, and real integrations.</strong>',
      autoTitle: '<strong>Platform thinking.</strong>',
      autoBody:
        'One VPS runs multiple client sites on a shared Docker network with repeatable CI/CD.',
    },
    right: {
      authorityTitle: '<strong>Self-hosted by default.</strong>',
      authorityBody: 'You own the containers, the secrets, and the deploy pipeline — <strong>no vendor lock-in.</strong>',
      opportunityTitle: '<strong>Engineering evidence.</strong>',
      opportunityBody:
        'Recruiters and collaborators see <strong>architecture decisions</strong>, not just screenshots.',
    },
    cta: 'Read the <strong>architecture</strong> docs',
  },

  leakToFlow: {
    title: 'How the <span class="text-brand-500"><strong>platform</strong></span> works.',
    steps: {
      step1: {
        title: '<strong>Push</strong> to GitHub.',
        body: 'main → production, develop → test. GitHub Actions SSHs into the VPS and rebuilds containers.',
      },
      step2: {
        title: 'Containers on <strong>web-public</strong>.',
        body: 'Astro app (SSR) + OAuth gateway share an external Docker network. Nginx Proxy Manager routes TLS.',
      },
      step3: {
        title: '<strong>Edit content</strong> via Decap.',
        body: 'GitHub OAuth gateway issues CMS tokens. Content commits flow back to the repo branch.',
      },
    },
    badges: {
      web: 'App: Astro SSR',
      automation: 'Auth: OAuth gateway',
    },
    cta: 'See <strong>deployment</strong> guide',
  },

  techEdge: {
    title: 'Stack capabilities',
    metrics: {
      ssr: 'Rendering',
      ssrValue: 'Astro SSR',
      locales: 'Locales',
      localesValue: '4',
      containers: 'Deploy',
      containersValue: '2 containers',
    },
    web: {
      title: 'Astro SSR + Design System',
      body: 'Server-rendered pages, i18n routing, typed content collections, and a full component library.',
      metrics: {
        title: '',
        competitor: '',
        us: '',
        mobileNote: '',
      },
      cta: 'Multi-locale SSR article',
    },
    automation: {
      title: 'CI/CD + Docker',
      body: 'Multi-stage Dockerfile with BuildKit cache. Rolling image tags for quick rollback on the VPS.',
      cta: 'CMS workflow article',
    },
    bridge: {
      title: 'Business Integrations',
      body: 'Lead capture with Notion CRM, Resend email, Supabase analytics, and Cal.com booking per locale.',
      cta: 'Lead funnel article',
    },
  },

  servicesSection: {
    title: 'Services built for growth, not vanity metrics.',
    description:
      'Each service is engineered to increase qualified demand and reduce friction from first click to signed client.',
    cards: {
      websites: {
        title: 'Conversion-First Websites',
        description: 'Strategic architecture, persuasive copy flow, and performance tuned for lead generation.',
      },
      funnels: {
        title: 'Lead Funnels and Automation',
        description: 'Capture, qualify, and nurture leads with clear handoffs into your sales workflow.',
      },
      optimization: {
        title: 'CRO and Iteration',
        description: 'Ongoing tests and UX improvements that compound conversion gains over time.',
      },
    },
  },

  comparisonSection: {
    title: 'Why teams switch from traditional agencies to Iluro Digital.',
    traditional: 'Traditional agencies',
    iluro: 'Iluro Digital',
    rows: {
      speed: {
        label: 'Delivery speed',
        traditional: 'Slow timelines and bloated approval loops',
        iluro: 'Fast sprints with clear milestones',
      },
      communication: {
        label: 'Communication',
        traditional: 'Jargon-heavy updates with little clarity',
        iluro: 'Straightforward reporting tied to outcomes',
      },
      roi: {
        label: 'Business impact',
        traditional: 'Activity-focused metrics',
        iluro: 'Revenue and pipeline-focused decisions',
      },
    },
  },

  selectedWorkSection: {
    title: 'Selected work and measurable outcomes.',
    items: {
      one: {
        title: 'B2B services landing overhaul',
        result: '+42% qualified call bookings in 90 days',
      },
      two: {
        title: 'Local brand lead flow redesign',
        result: '2.1x increase in lead-to-meeting rate',
      },
      three: {
        title: 'Offer positioning and funnel rebuild',
        result: 'Shorter sales cycle and higher intent leads',
      },
    },
  },

  homeFaq: {
    title: 'Frequently asked questions before we start.',
  },

  // Tech Stack Section
  techStack: {
    astro: {
      name: 'Astro 6',
      desc: 'Server islands & content layer',
    },
    tailwind: {
      name: 'Tailwind v4',
      desc: 'Zero-runtime CSS engine',
    },
    typescript: {
      name: 'TypeScript',
      desc: 'Strict type safety defaults',
    },
    motion: {
      name: 'Motion',
      desc: 'Declarative animations',
    },
  },

  // Feature Tabs Section
  features: {
    sectionTitle: 'Everything you need.',
    sectionTitleHighlight: "Nothing you don't.",
    sectionDescription:
      'We stripped away the bloat and kept the primitives that actually speed up development for agencies and freelancers.',
    tabs: {
      design: {
        label: 'Design System',
        desc: 'Global tokens & typography',
        title: 'CSS-First Design Tokens',
        content:
          "Velocity implements a complete design system using Tailwind v4's new CSS-first configuration. No messy JavaScript config files for theme values.",
      },
      seo: {
        label: 'SEO & Meta',
        desc: 'OpenGraph & sitemaps',
        title: 'Automated SEO Handling',
        content:
          "Astro's content collections power strictly typed metadata injection for every page. Social share images are generated automatically.",
      },
      perf: {
        label: 'Performance',
        desc: '100/100 Core Web Vitals',
        title: 'Zero JS by Default',
        content:
          "We utilize Astro's island architecture to ensure your marketing pages ship 0kb of JavaScript to the client unless explicitly interactive.",
      },
      components: {
        label: 'Components',
        desc: 'Reusable UI primitives',
        title: 'Type-Safe Components',
        content:
          'Build with confidence using TypeScript-first components. Full prop validation and IDE autocompletion out of the box.',
      },
      i18n: {
        label: 'Internationalization',
        desc: 'Multi-language support',
        title: 'Built-in Internationalization',
        content:
          'First-class support for multi-language sites with type-safe translations, automatic locale detection, and SEO-friendly URL structures.',
      },
    },
  },

  // Credibility Section
  credibility: {
    badge: 'Production Tested',
    title: 'Built by Southwell Media. Born from',
    titleHighlight: 'deadline pressure',
    paragraph1:
      "We're a digital agency that ships high-performance marketing sites. We got tired of spending the first 3 days of every project setting up the same tooling, SEO configs, and type definitions.",
    paragraph2:
      "Velocity isn't a theoretical exercise. It's the exact codebase we use to deliver client projects in 14-21 days instead of the industry standard 60.",
    stats: {
      lighthouse: {
        score: 'Perfect',
        label: 'Lighthouse Scores',
      },
      delivery: {
        days: '14 Days',
        label: 'Avg. Delivery Time',
      },
    },
    standard: {
      title: 'The Velocity Standard',
      items: [
        'No unused CSS in production',
        'Images optimized at build time',
        'Type-safe Content Collections',
        'Accessible primitives pre-configured',
      ],
    },
    testimonial: {
      quote: "\"The cleanest boilerplate I've seen in 2024. It cuts the fluff.\"",
      author: '— Alex C., Senior Frontend Dev',
    },
  },

  // CTA Section
  cta: {
    title: 'Explore the',
    titleHighlight: 'repository',
    description:
      'Clone the stack, read the deployment docs, and adapt it to your own VPS or client projects.',
    docs: 'Read documentation',
    command: 'View on GitHub',
    guaranteeBadge: 'MIT License',
    privacyNotePrefix:
      'By continuing, you accept our',
    privacyNoteLink: 'Privacy Policy',
    privacyNoteSuffix:
      'which explains how we process your data with Supabase, Notion, Resend and Cal.com to manage your audit.',
    funnel: {
      step1Title: 'Your name',
      nameLabel: 'Name',
      namePlaceholder: 'Full name',
      step2Title: 'How can we reach you?',
      emailLabel: 'Email',
      emailPlaceholder: 'you@company.com',
      phoneLabel: 'Phone',
      phoneOptional: 'optional',
      phonePlaceholder: '+34 …',
      honeypotLabel: 'Company',
      next: 'Continue',
      back: 'Back',
      step3Title: 'Pick a time',
      leadError: 'Something went wrong. Please try again.',
      nameError: 'Please enter your name (at least 2 characters).',
      emailError: 'Please enter a valid email address.',
      savingHint: 'Saving your details…',
    },
  },

  // Footer
  footer: {
    copyright: '© {year} Astro Business Stack. MIT License.',
    madeWith: 'Made with',
    maintainedBy: 'Maintained by',
    links: {
      documentation: 'Docs',
      github: 'GitHub',
      twitter: 'GitHub',
      license: 'License',
      privacy: 'Privacy',
    },
  },

  // Home page
  home: {
    title: 'Welcome to Velocity',
    subtitle: 'The opinionated Astro starter you actually want to use',
    cta: 'Get Started',
  },

  // About page
  about: {
    meta: {
      title: 'About the Stack',
      description: 'What Astro Business Stack demonstrates and how it maps to production engineering.',
    },
    hero: {
      badge: 'Engineering showcase',
      title: 'A platform,',
      titleHighlight: 'not just a site.',
      description:
        'This repository documents and demonstrates a repeatable pattern for client-facing Astro sites: containerized, self-hosted, and deployed via GitHub Actions to a Hetzner VPS.',
    },
    mission: {
      title: 'What it proves',
      description:
        'Full-stack delivery with SSR, CMS auth, CI/CD, and optional CRM, analytics, email, and booking integrations — the same pattern used for live agency and client deployments.',
    },
    values: {
      title: 'Design principles',
      performance: {
        title: 'Repeatable deploys',
        description: 'Branch-to-environment mapping, Docker Compose, and shared networking make adding a new site a known procedure.',
      },
      simplicity: {
        title: 'Secrets stay on the server',
        description: '.env lives on the VPS, never in git. GitHub Actions only pulls code and rebuilds containers.',
      },
      openSource: {
        title: 'Documented architecture',
        description: 'README and docs/ explain VPS topology, OAuth flow, and integration setup so the engineering story is visible.',
      },
    },
  },

  // Contact page
  contact: {
    meta: {
      title: 'Contact Us',
      description: 'Get in touch with the Velocity team.',
    },
    hero: {
      badge: 'Get in Touch',
      title: "Let's",
      titleHighlight: 'connect.',
      description: 'Have a question, suggestion, or just want to say hello? We would love to hear from you.',
    },
    form: {
      title: 'Send us a message',
      name: 'Your Name',
      namePlaceholder: 'John Doe',
      email: 'Email Address',
      emailPlaceholder: 'john@example.com',
      subject: 'Subject',
      subjectPlaceholder: 'How can we help?',
      message: 'Message',
      messagePlaceholder: 'Tell us more about your project or question...',
      submit: 'Send Message',
      sending: 'Sending...',
      success: 'Message sent successfully! We will get back to you soon.',
      error: 'Failed to send message. Please try again later.',
    },
    info: {
      title: 'Other ways to reach us',
      email: {
        label: 'Email',
        value: 'hello@velocity.dev',
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
    name: 'Name',
    email: 'Email',
    message: 'Message',
    submit: 'Submit',
    sending: 'Sending...',
    success: 'Message sent successfully!',
    error: 'Failed to send message. Please try again.',
  },

  // Blog
  blog: {
    title: 'Systems that scale your business',
    description: 'Elite digital solutions built to increase qualified demand and operational speed.',
    allPosts: 'Case studies and insights',
    featured: 'Core solutions',
    noPosts: 'No solutions found',
    relatedPosts: 'Related solutions',
    backToBlog: 'Back to services',
    filterLabel: 'Filter by',
    filterAll: 'All',
    filter: {
      integrations: 'Integrations',
      ssr: 'SSR & i18n',
      cms: 'CMS & deploy',
      web: 'Web',
      automation: 'Automation',
      'full-system': 'Full system',
    },
    updatedPrefix: 'Updated',
    readTime: '{minutes} min read',
    shareLabel: 'Share:',
    shareTwitter: 'Share on Twitter',
    shareLinkedIn: 'Share on LinkedIn',
    copyLink: 'Copy link',
    subscribe: 'Subscribe',
    subscribeDescription: 'Get the latest articles and updates delivered to your inbox.',
    emailPlaceholder: 'Enter your email',
    subscribeButton: 'Subscribe',
    servicesTerminal: {
      chromeLabel: 'deploy',
      line1: '> Starting Iluro Digital system...',
      line2: '',
      line3: '[OK] High-speed website built (Score 100%)',
      line4: '[OK] AI agent configured (Claude + n8n)',
      line5: '',
      line6: '> Processing client emails...',
      line7: '  - Categorizing emails by priority: Done.',
      line8: '  - Creating response drafts: Done.',
      line9: '  - Syncing with calendar: Done.',
      line10: '',
      line11: '> SYSTEM RESULTS:',
      line12: '    - Time saved: 40 hours/week down',
      line13: '    - Money saved: Operating costs down',
      line14: '    - Conversion: New clients up',
      line15: '> STATUS: System generating benefits.',
    },
  },

  portfolio: {
    title: 'Stack articles',
    description: 'Technical write-ups on deploy workflow, integrations, and multi-locale SSR.',
    breadcrumb: 'Articles',
    backToIndex: 'Back to articles',
  },

  servicesHubPage: {
    metaTitle: 'Services — Iluro Digital',
    metaDescription:
      'Pick web performance, automation, or a full integrated system — then validate everything in the portfolio.',
    title: 'Choose your growth lever',
    subtitle:
      'Three conversion pillars and a proof library. Start where you are bleeding time or demand.',
    cardWebTitle: 'Websites & speed',
    cardWebBody: 'Astro, CWV, and SEO as acquisition infrastructure — not decoration.',
    cardAutomationTitle: 'Automation & AI',
    cardAutomationBody: 'Self-hosted n8n + LLMs that recover executive and ops hours weekly.',
    cardFullTitle: 'Full system',
    cardFullBody: 'Demand capture, qualification, and pipeline motion in one compounding loop.',
    cardPortfolioTitle: 'Portfolio',
    cardPortfolioBody: 'Case studies with the metrics that matter to operators and buyers.',
    explore: 'Open',
    heroBadge: 'Services hub · Pillars & portfolio',
  },

  /** Shared pillar hero CTAs (terminal lives only on the services hub index). */
  salesCommon: {
    heroCtaAudit: 'Book free audit',
    heroCtaCases: 'View case studies',
  },

  salesWeb: {
    metaTitle: 'Websites & performance — Iluro Digital',
    metaDescription:
      'Fast Astro sites, straightforward editing for your team, reliable forms—with a zero-cost audit to map fixes first.',
    heroTitleAccent: 'Instant-loading Astro',
    heroTitleRest: 'for day-to-day edits without babysitting fragile plugins.',
    heroSubtitle:
      'Leaks and sequencing come first on a zero-cost audit; paid work only starts once the plan is clear.',
    heroCtaFeaturedCase: 'Featured case study: Envilo →',
    smackdownTitle: 'Local competitor sites vs Iluro',
    smackdownLegacyLabel: 'Heavy WP-style stack',
    smackdownLegacyCaption:
      'Plugins, messy themes, runtime calls, chat widgets—together they crawl on mobile.',
    smackdownOurLabel: 'Iluro Astro build',
    smackdownOurCaption:
      'Mostly static pages, deliberate motion, assets sized for LTE—readable code you can evolve.',
    smackdownDisclaimerLead: 'Illustrative scores — verify with ',
    smackdownLighthouseLinkLabel: 'Google Lighthouse',
    smackdownDisclaimerTrail: '. Small variance by device or test setup is normal.',
    stackStripLabel: 'Performance stack we ship',
    stackStripAria: 'Technologies used on Iluro web performance projects',
    ctaPrepTitle: 'What the free audit covers',
    ctaPrepSubtitle: 'Before any invoice—one concise read-out.',
    ctaPrepPoint1: 'Leak map: friction and sluggish paths that quietly cost enquiries.',
    ctaPrepPoint2: 'Roadmap in plain priorities: what to rebuild or tune first.',
    ctaPrepPoint3: 'Honest take on fit; no pressure to engage beyond recommendations.',
    enviloFeaturedEyebrow: 'Featured proof',
    enviloFeaturedLink: 'Read case study →',
    proofTitle: 'Proof: web & performance cases',
    proofMicrocopy: 'Operational wins with metrics you can reconcile—browse the builds after Envilo.',
    proofEmpty: 'More case studies are on the way.',
    mechanismTitle: 'What we build',
    mechanismCard1Title: 'Astro websites that stay quick and polished',
    mechanismCard1Body:
      'Pages built with Astro + Tailwind so first paint arrives fast even on middling LTE, typography stays disciplined, visuals feel intentional—not a brittle theme packed with sliders you never configured.',
    mechanismCard2Title: 'Menus, banners, specials—edited without ticketing IT',
    mechanismCard2Body:
      'We wire a sensible editing flow—including Decap when it suits—so you refresh copy, banners, openings, rotating menus or price tweaks from everyday tools (spreadsheet workflows when that makes sense mid-shift). Goal: tweak your site almost as casually as texting the team.',
    mechanismCard3Title: 'Lead & contact flows that reliably hit the inbox',
    mechanismCard3Body:
      'Customer-facing forms tied to dependable deliverability through Resend, with pragmatic anti-spam handling so confirmations and enquiries do not silently vanish behind plugin SMTP roulette.',
    closeTitle: 'Book your free audit',
    closeDescription:
      'Pick a time below—we create a plan together. If it does not work in the first month, we give you your money back.',
  },

  salesAutomation: {
    metaTitle: 'Automation & AI systems — Iluro Digital',
    metaDescription:
      'Self-hosted n8n workflows and LLM copilots that recover leadership time and compress operational drag.',
    heroTitleAccent: 'Self-hosted n8n bridges',
    heroTitleRest: 'from inbox to CRM—with grounded assistants, not AI theatre.',
    heroSubtitle:
      'Throughput and hand-off clarity first on a zero-cost audit; scope stays shut until that map is settled.',
    riskLine: 'Throughput, classification quality, and SLAs—not slide-deck novelty.',
    stackStripLabel: 'Automation stack we ship',
    stackStripAria: 'Technologies used on Iluro automation projects',
    ctaPrepTitle: 'What the free audit covers',
    ctaPrepSubtitle: 'Before any invoice—one concrete read-back.',
    ctaPrepPoint1:
      'Throughput map: which loops burn hours versus quietly dropping leads.',
    ctaPrepPoint2: 'Safeguards in plain words: human gates, retention, redaction boundaries.',
    ctaPrepPoint3:
      'Honest tooling fit—we do not bury you in licences before you see value.',
    tableTitle: 'Human cost vs agent cost (typical mid-market ops)',
    tableDimension: 'Dimension',
    tableHuman: 'Human-led',
    tableAgent: 'Agent + Iluro stack',
    tableRow1Dim: 'Lead triage & routing',
    tableRow1Human: 'Hours daily across roles; inconsistent SLA',
    tableRow1Agent: 'Seconds-level classification + CRM-ready tasks',
    tableRow2Dim: 'Follow-up drafting',
    tableRow2Human: 'Copy/paste + context switching',
    tableRow2Agent: 'Grounded drafts from your historical data',
    tableRow3Dim: 'Cross-tool sync',
    tableRow3Human: 'Manual exports and spreadsheet bridges',
    tableRow3Agent: 'Event-driven sync with retries and observability',
    proofTitle: 'Proof: automation cases',
    proofEmpty: 'More automation stories are landing soon.',
    mechanismTitle: 'What we automate first',
    mechanismCard1Title: 'Inbox → pipeline',
    mechanismCard1Body: 'Qualification, tagging, and calendar-aware routing before humans touch the thread.',
    mechanismCard2Title: 'CRM hygiene',
    mechanismCard2Body: 'Dedupe, enrichment triggers, and SLA timers so revenue teams trust the database.',
    mechanismCard3Title: 'Operator guardrails',
    mechanismCard3Body: 'Human-in-the-loop checkpoints for anything customer-facing or legally sensitive.',
    terminalChrome: 'automate',
    terminalLine1: '> iluro automation bootstrap…',
    terminalLine2: '',
    terminalLine3: '[OK] n8n workflow graph validated',
    terminalLine4: '[OK] Claude tool policies + redaction rules',
    terminalLine5: '',
    terminalLine6: '> simulating weekly ops load…',
    terminalLine7: '  - Lead classification: 412 msgs → 0 manual sorts',
    terminalLine8: '  - CRM updates: 318 field writes automated',
    terminalLine9: '  - Draft assists: 96% accepted with light edits',
    terminalLine10: '',
    terminalLine11: '> STATUS: Automation net-positive vs baseline week.',
    closeTitle: 'Want workflows that <strong>compound</strong>?',
    closeDescription:
      'Pick a slot below—we dismantle the highest-friction loop first. If month one misses what we aligned on, fees go back.',
  },

  salesFullSystem: {
    metaTitle: 'Full-stack growth systems — Iluro Digital',
    metaDescription:
      'Combine high-performance acquisition surfaces with autonomous backend motion — one revenue infrastructure.',
    heroTitleAccent: 'Demand + orchestration as one spine',
    heroTitleRest: 'fast Astro up front, autonomous motion behind—not two vendors arguing.',
    heroSubtitle:
      'Acquisition and throughput are read on the same zero-cost audit; integrations follow the revenue story, not the tool list.',
    riskLine: 'Signals on throughput, cost-to-acquire hygiene, and cycle time—not feature quotas.',
    stackStripLabel: 'Integrated stack reference',
    stackStripAria: 'Typical layers on Iluro full-system engagements',
    ctaPrepTitle: 'What the free audit aligns',
    ctaPrepSubtitle: 'One pass across surface and backends—still no upfront fee.',
    ctaPrepPoint1:
      'Acquisition truth: friction on the Astro surface versus traffic you already pay for.',
    ctaPrepPoint2:
      'Operational spine: which automations unblock pipeline truth and SLA visibility.',
    ctaPrepPoint3: 'Investment guardrails so spend follows proof, not a laundry list.',
    revenueTitle: 'The revenue loop (integrated)',
    revenueIntro:
      'Three synchronized stages keep demand, intelligence, and sales motion aligned without heroics.',
    revenueStep1: 'Capture: frictionless Astro surface converts attention into intent.',
    revenueStep2: 'Qualify: AI + automation triage, enrich, and prepare the deal room.',
    revenueStep3: 'Close: humans spend cycles only on qualified, warm opportunities.',
    revenueNote: 'Diagram is illustrative; your stack, data residency, and compliance constraints shape the final architecture.',
    proofTitle: 'Proof: full-system engagements',
    proofEmpty: 'More integrated builds are being written up.',
    mechanismTitle: 'How the pillars stack',
    mechanismCard1Title: 'Demand layer',
    mechanismCard1Body: 'Pages, content, and performance budgets tuned for acquisition and trust.',
    mechanismCard2Title: 'Systems layer',
    mechanismCard2Body: 'Workflows, integrations, and observability that keep data honest in motion.',
    mechanismCard3Title: 'Revenue layer',
    mechanismCard3Body: 'CRM truth, SLAs, and leadership reporting tied to pipeline outcomes.',
    closeTitle: 'Build <strong>revenue infrastructure</strong>, not features',
    closeDescription:
      'Book below—we align the combined plan before heavy spend. If month one misses what we agreed, fees go back.',
  },

  // Components Page
  components: {
    meta: {
      title: 'Components',
      description: "Explore Velocity's comprehensive UI component library. Production-ready, accessible, and beautifully designed.",
    },
    hero: {
      badge: 'Production Components',
      title: 'Component',
      titleHighlight: 'Library',
      description: 'Production-ready UI primitives built with accessibility and performance in mind. Copy, paste, and customize to match your brand.',
      browseComponents: 'Browse Components',
      viewSource: 'View Source',
    },
    categories: {
      buttons: 'Buttons',
      inputs: 'Form Inputs',
      feedback: 'Feedback',
      overlays: 'Overlays',
      data: 'Data Display',
      loading: 'Loading',
    },
    sections: {
      buttons: {
        title: 'Buttons',
        description: 'Interactive elements for actions and navigation. All variants support icons, loading states, and full accessibility.',
        variants: 'Variants',
        variantsHint: '6 styles for different contexts',
        sizes: 'Sizes',
        sizesHint: 'Responsive scaling',
        states: 'States',
        withIcons: 'With Icons',
        primary: 'Primary',
        secondary: 'Secondary',
        outline: 'Outline',
        ghost: 'Ghost',
        link: 'Link',
        destructive: 'Destructive',
        small: 'Small',
        medium: 'Medium',
        large: 'Large',
        default: 'Default',
        loading: 'Loading',
        disabled: 'Disabled',
        send: 'Send',
        export: 'Export',
        star: 'Star',
      },
      inputs: {
        title: 'Form Inputs',
        description: 'Text fields, selects, checkboxes, and more. Built with native validation and ARIA support.',
        textInput: 'Text Input',
        textInputHint: 'With labels & validation',
        textarea: 'Textarea',
        textareaHint: 'Multi-line text input',
        select: 'Select',
        selectHint: 'Native dropdown',
        checkboxes: 'Checkboxes',
        checkboxesHint: 'Multi-select controls',
        planSelection: 'Plan Selection',
        planSelectionHint: 'Card-style radio options',
        emailLabel: 'Email address',
        emailPlaceholder: 'you@example.com',
        passwordLabel: 'Password',
        passwordPlaceholder: '••••••••',
        passwordHint: 'Must be at least 8 characters',
        disabledLabel: 'Disabled',
        disabledPlaceholder: 'Cannot edit',
        messageLabel: 'Message',
        messagePlaceholder: 'Write your message here...',
        messageHint: 'Supports markdown formatting',
        countryLabel: 'Country',
        selectCountry: 'Select a country...',
        termsLabel: 'I agree to the terms of service',
        updatesLabel: 'Send me product updates',
        notificationsLabel: 'Enable notifications',
        notificationsDesc: 'Receive alerts for important updates',
        planFree: 'Free',
        planFreeDesc: 'Basic features for personal projects',
        planPro: 'Pro',
        planProDesc: 'Advanced tools for professionals',
        planTeam: 'Team',
        planTeamDesc: 'Collaboration features for teams',
      },
      feedback: {
        title: 'Feedback',
        description: 'Badges, alerts, and status indicators to communicate state and guide user actions.',
        badges: 'Badges',
        badgesHint: 'Status indicators',
        alerts: 'Alerts',
        alertsHint: 'Contextual messages',
        default: 'Default',
        success: 'Success',
        warning: 'Warning',
        error: 'Error',
        info: 'Info',
        tipTitle: 'Tip',
        tipContent: 'Use keyboard shortcuts to navigate faster. Press',
        tipKey: '⌘K',
        tipEnd: 'to open the command palette.',
        deployTitle: 'Deployment successful',
        deployContent: 'Your changes are now live at',
        limitTitle: 'Approaching limit',
        limitContent: "You've used 80% of your monthly API quota. Consider upgrading your plan.",
        buildTitle: 'Build failed',
        buildContent: 'Error in',
        buildError: '— missing required prop "variant"',
      },
      overlays: {
        title: 'Overlays',
        description: 'Dialogs, dropdowns, tooltips, and tabs. Full keyboard navigation and focus management.',
        dialog: 'Dialog',
        dialogHint: 'Modal overlay',
        dropdown: 'Dropdown',
        dropdownHint: 'Action menu',
        tooltips: 'Tooltips',
        tooltipsHint: 'Contextual hints',
        tabs: 'Tabs',
        tabsHint: 'Content organization',
        openDialog: 'Open Dialog',
        deleteTitle: 'Delete project?',
        deleteDesc: 'This action cannot be undone.',
        deleteConfirm: 'Are you sure you want to delete',
        deleteWarning: 'All files, deployments, and analytics data will be permanently removed.',
        cancel: 'Cancel',
        deleteProject: 'Delete Project',
        actions: 'Actions',
        edit: 'Edit',
        duplicate: 'Duplicate',
        share: 'Share',
        archive: 'Archive',
        delete: 'Delete',
        top: 'Top',
        bottom: 'Bottom',
        left: 'Left',
        right: 'Right',
        tooltipTop: 'Tooltip on top',
        tooltipBottom: 'Tooltip on bottom',
        tooltipLeft: 'Tooltip on left',
        tooltipRight: 'Tooltip on right',
        overview: 'Overview',
        analytics: 'Analytics',
        settings: 'Settings',
        overviewContent: 'Project overview with key metrics and recent activity. Tabs support full keyboard navigation.',
        analyticsContent: 'Analytics data with charts and performance insights. Press arrow keys to navigate between tabs.',
        settingsContent: 'Configure your project settings. Use Home/End to jump to first/last tab.',
      },
      data: {
        title: 'Data Display',
        description: 'Cards, avatars, and icons for presenting content and user information.',
        cards: 'Cards',
        cardsHint: 'Content containers',
        avatars: 'Avatars',
        avatarsHint: 'User representations',
        icons: 'Icons',
        iconsHint: 'Lucide icon set — 24 included',
        stacked: 'Stacked',
        performance: 'Performance',
        performanceScore: '100/100 Lighthouse',
        performanceDesc: 'Zero JavaScript by default. Islands architecture with selective hydration for optimal speed.',
        typeSafe: 'Type-Safe',
        typeSafeScore: 'Full TypeScript',
        typeSafeDesc: 'Strict types throughout with IDE autocompletion and compile-time error checking.',
        i18nReady: 'i18n Ready',
        i18nScore: 'Multi-language',
        i18nDesc: 'Built-in translation system with SEO-friendly URLs and automatic locale detection.',
      },
      loading: {
        title: 'Loading',
        description: 'Skeleton loaders for perceived performance while content is being fetched.',
        skeletonTypes: 'Skeleton Types',
        skeletonTypesHint: 'Text, circular, rectangular',
        cardSkeleton: 'Card Skeleton',
        cardSkeletonHint: 'Composite loading state',
      },
    },
    cta: {
      title: 'Ready to build?',
      description: 'These components are just the beginning. Clone Velocity and start shipping faster.',
      cloneRepo: 'Clone Repository',
      readDocs: 'Read Documentation',
    },
  },

  // Consent Banner
  consent: {
    heading: 'Cookie Preferences',
    description: 'We use cookies to enhance your browsing experience, serve personalized content, and analyze our traffic.',
    acceptAll: 'Accept All',
    declineAll: 'Decline All',
    customize: 'Customize',
    savePreferences: 'Save Preferences',
    settingsHeading: 'Privacy Settings',
    privacyPolicyLabel: 'Privacy Policy',
    alwaysOn: 'Always on',
  },
} as const;

type WidenTranslationValues<T> = {
  [K in keyof T]: T[K] extends string ? string : WidenTranslationValues<T[K]>;
};

export type TranslationKeys = WidenTranslationValues<typeof en>;
