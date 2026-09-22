export type MissionStatus = "todo" | "active" | "done" | "paid" | "archived";

export const statusLabels: Record<MissionStatus, string> = {
  todo: "À faire",
  active: "En cours",
  done: "Terminé",
  paid: "Payé",
  archived: "Archivé",
};

export type Mission = {
  id: string;
  title: string;
  company: string;
  team: string;
  category: "Backend" | "Frontend" | "Data" | "Automatisation" | "Mobile" | "Maintenance";
  summary: string;
  description: string;
  deliverables: string[];
  skills: string[];
  budget: number;
  duration: string;
  status: MissionStatus;
  progress: number;
  freelanceId?: string;
  applicants: number;
  postedAt: string;
};

export type Freelance = {
  id: string;
  name: string;
  initials: string;
  title: string;
  city: string;
  available: boolean;
  rate: number;
  rating: number;
  reviews: number;
  missions: number;
  skills: string[];
  bio: string;
  portfolio: { title: string; client: string; year: string; result: string }[];
  testimonials: { author: string; company: string; text: string; rating: number }[];
};

export const freelances: Freelance[] = [
  {
    id: "lea-martin",
    name: "Léa Martin",
    initials: "LM",
    title: "Senior Frontend Engineer",
    city: "Paris",
    available: true,
    rate: 650,
    rating: 4.9,
    reviews: 38,
    missions: 38,
    skills: ["React", "TypeScript", "Next.js", "Design systems"],
    bio: "Dix ans d'interfaces produit pour des scale-ups B2B. Spécialiste des design systems et des refontes à fort trafic.",
    portfolio: [
      { title: "Design system multi-produit", client: "Atelier Nord", year: "2025", result: "-40 % de temps d'intégration" },
      { title: "Refonte espace client", client: "Vela", year: "2024", result: "+22 % de conversion" },
    ],
    testimonials: [
      { author: "Camille Lefèvre", company: "Atelier Nord", text: "Livraison nette, communication irréprochable.", rating: 5 },
    ],
  },
  {
    id: "karim-benali",
    name: "Karim Benali",
    initials: "KB",
    title: "Backend & Platform Engineer",
    city: "Lyon",
    available: true,
    rate: 720,
    rating: 4.8,
    reviews: 41,
    missions: 41,
    skills: ["Go", "gRPC", "PostgreSQL", "Kubernetes"],
    bio: "Architecte de plateformes à haute disponibilité. Intégrations API, event-driven et fiabilité opérationnelle.",
    portfolio: [
      { title: "Pipeline d'intégration API", client: "Solvia", year: "2025", result: "99,99 % de disponibilité" },
      { title: "Migration event-driven", client: "Nordwind", year: "2024", result: "-60 % de latence" },
    ],
    testimonials: [
      { author: "Hugo Nassif", company: "Solvia", text: "Rigueur d'ingénieur senior, zéro surprise sur le budget.", rating: 5 },
    ],
  },
  {
    id: "sofia-reyes",
    name: "Sofia Reyes",
    initials: "SR",
    title: "Data Engineer",
    city: "Bordeaux",
    available: false,
    rate: 600,
    rating: 5,
    reviews: 27,
    missions: 27,
    skills: ["Python", "dbt", "Airflow", "BigQuery"],
    bio: "Pipelines de données et reporting automatisé pour les équipes finance et growth.",
    portfolio: [
      { title: "Dashboard analytique temps réel", client: "Vela", year: "2025", result: "Reporting J+0" },
    ],
    testimonials: [
      { author: "Inès Roche", company: "Vela", text: "Elle a rendu nos données enfin lisibles.", rating: 5 },
    ],
  },
  {
    id: "thomas-guerin",
    name: "Thomas Guérin",
    initials: "TG",
    title: "Automatisation & intégrations",
    city: "Nantes",
    available: true,
    rate: 520,
    rating: 4.7,
    reviews: 33,
    missions: 33,
    skills: ["Node.js", "API", "Zapier", "Airtable"],
    bio: "Micro-logiciels sur mesure et automatisations d'outils internes pour PME et ETI.",
    portfolio: [
      { title: "Automatisation du reporting", client: "Atelier Nord", year: "2025", result: "12 h économisées / semaine" },
    ],
    testimonials: [
      { author: "Camille Lefèvre", company: "Atelier Nord", text: "Un vrai gain de temps pour l'équipe ops.", rating: 5 },
    ],
  },
  {
    id: "amelie-dubois",
    name: "Amélie Dubois",
    initials: "AD",
    title: "Mobile Engineer",
    city: "Lille",
    available: true,
    rate: 610,
    rating: 4.8,
    reviews: 19,
    missions: 19,
    skills: ["React Native", "Swift", "Kotlin"],
    bio: "Applications mobiles internes et grand public, du prototype au store.",
    portfolio: [
      { title: "Application mobile interne", client: "Solvia", year: "2024", result: "4,7 sur les stores" },
    ],
    testimonials: [
      { author: "Hugo Nassif", company: "Solvia", text: "Excellente autonomie produit.", rating: 5 },
    ],
  },
  {
    id: "yanis-perrot",
    name: "Yanis Perrot",
    initials: "YP",
    title: "Maintenance & legacy",
    city: "Toulouse",
    available: false,
    rate: 480,
    rating: 4.6,
    reviews: 52,
    missions: 52,
    skills: ["PHP", "MySQL", "Symfony", "Tests"],
    bio: "Reprise de code existant, correction de bugs critiques et maintenance long terme.",
    portfolio: [
      { title: "Correction bugs legacy", client: "Nordwind", year: "2025", result: "Backlog divisé par 3" },
    ],
    testimonials: [
      { author: "Sarah Klein", company: "Nordwind", text: "Fiable sur des sujets peu glamour mais critiques.", rating: 4 },
    ],
  },
];

export const missions: Mission[] = [
  {
    id: "api-integration",
    title: "Pipeline d'intégration API",
    company: "Atelier Nord",
    team: "Équipe Plateforme",
    category: "Backend",
    summary: "Connecter nos outils internes à un bus d'événements fiable et documenté.",
    description:
      "Nous cherchons un développeur backend expérimenté pour concevoir un pipeline d'intégration entre notre ERP, notre CRM et notre facturation. L'objectif est de fiabiliser les échanges et de réduire les ressaisies manuelles.",
    deliverables: ["Schéma d'architecture", "Services d'intégration", "Documentation technique", "Tests de charge"],
    skills: ["Go", "gRPC", "PostgreSQL"],
    budget: 15000,
    duration: "5 sem.",
    status: "active",
    progress: 64,
    freelanceId: "karim-benali",
    applicants: 7,
    postedAt: "12 juin",
  },
  {
    id: "mobile-app",
    title: "Application mobile interne",
    company: "Solvia",
    team: "Équipe Ops",
    category: "Mobile",
    summary: "Application terrain pour les équipes de maintenance, mode hors-ligne inclus.",
    description:
      "Application mobile destinée à 120 techniciens terrain : saisie d'interventions, photos, synchronisation hors-ligne et export vers l'outil de planification.",
    deliverables: ["Prototype cliquable", "App iOS & Android", "Synchronisation hors-ligne", "Recette"],
    skills: ["React Native", "Swift"],
    budget: 32000,
    duration: "10 sem.",
    status: "todo",
    progress: 8,
    applicants: 12,
    postedAt: "3 juin",
  },
  {
    id: "analytics-dashboard",
    title: "Dashboard analytique",
    company: "Vela",
    team: "Équipe Data",
    category: "Data",
    summary: "Centraliser les KPI produit et finance dans un tableau de bord unique.",
    description:
      "Mise en place d'un entrepôt de données léger, de transformations dbt et d'un tableau de bord temps réel pour le comité de direction.",
    deliverables: ["Modèle de données", "Transformations dbt", "Dashboard", "Alertes"],
    skills: ["TypeScript", "dbt", "BigQuery"],
    budget: 21500,
    duration: "6 sem.",
    status: "done",
    progress: 100,
    freelanceId: "sofia-reyes",
    applicants: 9,
    postedAt: "2 mai",
  },
  {
    id: "legacy-bugs",
    title: "Correction bugs legacy",
    company: "Nordwind",
    team: "Équipe Support",
    category: "Maintenance",
    summary: "Réduire le backlog de bugs critiques sur une application Symfony.",
    description:
      "Reprise d'une base de code historique : triage du backlog, correction des anomalies bloquantes et mise en place de tests de non-régression.",
    deliverables: ["Triage du backlog", "Correctifs", "Tests de non-régression"],
    skills: ["PHP", "MySQL"],
    budget: 6800,
    duration: "2 sem.",
    status: "paid",
    progress: 100,
    freelanceId: "yanis-perrot",
    applicants: 5,
    postedAt: "18 avril",
  },
  {
    id: "reporting-automation",
    title: "Automatisation du reporting",
    company: "Atelier Nord",
    team: "Équipe Data",
    category: "Automatisation",
    summary: "Supprimer douze heures de reporting manuel par semaine.",
    description:
      "Automatiser la collecte, le nettoyage et la diffusion des rapports hebdomadaires vers Slack et l'espace de direction.",
    deliverables: ["Scripts d'extraction", "Planification", "Diffusion automatique"],
    skills: ["Node.js", "API"],
    budget: 12000,
    duration: "4 sem.",
    status: "done",
    progress: 100,
    freelanceId: "thomas-guerin",
    applicants: 6,
    postedAt: "20 avril",
  },
  {
    id: "internal-tool",
    title: "Micro-logiciel interne",
    company: "Atelier Nord",
    team: "Équipe Ops",
    category: "Automatisation",
    summary: "Un outil sur mesure pour piloter les plannings atelier.",
    description:
      "Développement d'un micro-logiciel web pour la planification des postes de travail, avec gestion des droits et export comptable.",
    deliverables: ["Cadrage fonctionnel", "Application web", "Formation des équipes"],
    skills: ["React", "Node.js"],
    budget: 24000,
    duration: "8 sem.",
    status: "todo",
    progress: 12,
    applicants: 4,
    postedAt: "28 juin",
  },
  {
    id: "crm-integration",
    title: "Intégration CRM",
    company: "Atelier Nord",
    team: "Équipe Growth",
    category: "Automatisation",
    summary: "Synchroniser le CRM avec les outils marketing.",
    description: "Synchronisation bidirectionnelle HubSpot, nettoyage des doublons et tableaux de suivi des leads.",
    deliverables: ["Connecteur", "Dédoublonnage", "Tableau de suivi"],
    skills: ["Node.js", "HubSpot"],
    budget: 9750,
    duration: "3 sem.",
    status: "archived",
    progress: 100,
    freelanceId: "thomas-guerin",
    applicants: 3,
    postedAt: "10 mars",
  },
  {
    id: "checkout-refonte",
    title: "Refonte du tunnel de paiement",
    company: "Vela",
    team: "Équipe Plateforme",
    category: "Frontend",
    summary: "Repenser le parcours de paiement et l'intégration Stripe.",
    description:
      "Refonte complète du tunnel de paiement : nouvelle interface, intégration Stripe, tests A/B et suivi des abandons.",
    deliverables: ["Maquettes", "Tunnel refondu", "Intégration Stripe", "Suivi analytique"],
    skills: ["React", "TypeScript", "Stripe"],
    budget: 18500,
    duration: "6 sem.",
    status: "active",
    progress: 48,
    freelanceId: "lea-martin",
    applicants: 11,
    postedAt: "1 juin",
  },
];

export type Payment = {
  id: string;
  missionId: string;
  label: string;
  counterpart: string;
  amount: number;
  date: string;
  state: "pending" | "paid" | "scheduled";
};

export const payments: Payment[] = [
  { id: "p1", missionId: "api-integration", label: "Jalon 2 · Intégration", counterpart: "Karim Benali", amount: 5000, date: "30 juin", state: "pending" },
  { id: "p2", missionId: "checkout-refonte", label: "Jalon 1 · Maquettes", counterpart: "Léa Martin", amount: 4750, date: "22 juin", state: "pending" },
  { id: "p3", missionId: "analytics-dashboard", label: "Solde final", counterpart: "Sofia Reyes", amount: 10750, date: "14 juin", state: "paid" },
  { id: "p4", missionId: "legacy-bugs", label: "Facture unique", counterpart: "Yanis Perrot", amount: 6800, date: "2 juin", state: "paid" },
  { id: "p5", missionId: "reporting-automation", label: "Solde final", counterpart: "Thomas Guérin", amount: 6000, date: "28 mai", state: "paid" },
  { id: "p6", missionId: "internal-tool", label: "Acompte 30 %", counterpart: "À attribuer", amount: 7200, date: "5 juillet", state: "scheduled" },
];

export type Conversation = {
  id: string;
  name: string;
  initials: string;
  role: string;
  mission: string;
  unread: number;
  messages: { from: "me" | "them"; text: string; time: string }[];
};

export const conversations: Conversation[] = [
  {
    id: "c1",
    name: "Karim Benali",
    initials: "KB",
    role: "Backend & Platform Engineer",
    mission: "Pipeline d'intégration API",
    unread: 2,
    messages: [
      { from: "them", text: "Bonjour, j'ai poussé la première version du connecteur ERP.", time: "09:12" },
      { from: "me", text: "Parfait, on teste ça aujourd'hui avec l'équipe plateforme.", time: "09:20" },
      { from: "them", text: "Je propose un point de 20 min demain pour valider le schéma d'événements.", time: "09:41" },
    ],
  },
  {
    id: "c2",
    name: "Léa Martin",
    initials: "LM",
    role: "Senior Frontend Engineer",
    mission: "Refonte du tunnel de paiement",
    unread: 0,
    messages: [
      { from: "them", text: "Les maquettes du tunnel sont prêtes pour relecture.", time: "Hier" },
      { from: "me", text: "Super, je fais un retour avant vendredi.", time: "Hier" },
    ],
  },
  {
    id: "c3",
    name: "Sofia Reyes",
    initials: "SR",
    role: "Data Engineer",
    mission: "Dashboard analytique",
    unread: 0,
    messages: [
      { from: "them", text: "Mission clôturée, merci pour la collaboration !", time: "14 juin" },
      { from: "me", text: "Merci à toi, on revient vers toi au prochain trimestre.", time: "14 juin" },
    ],
  },
];

export type Notification = { id: string; title: string; detail: string; time: string; kind: "mission" | "candidature" | "paiement" | "message" };

export const notifications: Notification[] = [
  { id: "n1", title: "Nouvelle candidature", detail: "Amélie Dubois sur Application mobile interne", time: "il y a 12 min", kind: "candidature" },
  { id: "n2", title: "Jalon validé", detail: "Pipeline d'intégration API · jalon 2", time: "il y a 2 h", kind: "mission" },
  { id: "n3", title: "Paiement programmé", detail: "7 200 € · Micro-logiciel interne", time: "hier", kind: "paiement" },
  { id: "n4", title: "Nouveau message", detail: "Karim Benali", time: "hier", kind: "message" },
];

export const collaborations = [
  { freelanceId: "karim-benali", missions: 4, total: 52000, lastMission: "Pipeline d'intégration API", period: "2024 – 2026", rating: 4.9 },
  { freelanceId: "lea-martin", missions: 3, total: 41500, lastMission: "Refonte du tunnel de paiement", period: "2025 – 2026", rating: 5 },
  { freelanceId: "sofia-reyes", missions: 2, total: 33500, lastMission: "Dashboard analytique", period: "2025", rating: 5 },
  { freelanceId: "thomas-guerin", missions: 5, total: 38750, lastMission: "Automatisation du reporting", period: "2023 – 2026", rating: 4.7 },
  { freelanceId: "yanis-perrot", missions: 2, total: 12300, lastMission: "Correction bugs legacy", period: "2025 – 2026", rating: 4.6 },
];

export const monthlySpend = [
  { month: "Jan", value: 38 },
  { month: "Fév", value: 52 },
  { month: "Mar", value: 64 },
  { month: "Avr", value: 78 },
  { month: "Mai", value: 90 },
  { month: "Juin", value: 100 },
];

export function formatEuro(value: number) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(value);
}

export function getFreelance(id?: string) {
  return freelances.find((f) => f.id === id);
}

export function getMission(id: string) {
  return missions.find((m) => m.id === id);
}
