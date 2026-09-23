-- ============ ROLES / PROFILES ============
create type public.account_role as enum ('entreprise', 'freelance');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role public.account_role not null default 'entreprise',
  full_name text not null default '',
  company_name text,
  email text,
  created_at timestamptz not null default now()
);
grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;
create policy "own profile read" on public.profiles for select to authenticated using (auth.uid() = id);
create policy "own profile insert" on public.profiles for insert to authenticated with check (auth.uid() = id);
create policy "own profile update" on public.profiles for update to authenticated using (auth.uid() = id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, role, full_name, company_name, email)
  values (
    new.id,
    coalesce((new.raw_user_meta_data ->> 'role')::public.account_role, 'entreprise'),
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(coalesce(new.email, ''), '@', 1)),
    new.raw_user_meta_data ->> 'company_name',
    new.email
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- ============ FREELANCE PROFILES ============
create table public.freelance_profiles (
  id text primary key,
  user_id uuid unique references auth.users(id) on delete set null,
  name text not null,
  initials text not null default '',
  title text not null default '',
  city text not null default '',
  available boolean not null default true,
  rate integer not null default 500,
  rating numeric(2,1) not null default 5,
  reviews integer not null default 0,
  missions_count integer not null default 0,
  skills text[] not null default '{}',
  bio text not null default '',
  portfolio jsonb not null default '[]',
  testimonials jsonb not null default '[]',
  created_at timestamptz not null default now()
);
grant select on public.freelance_profiles to anon;
grant select, insert, update on public.freelance_profiles to authenticated;
grant all on public.freelance_profiles to service_role;
alter table public.freelance_profiles enable row level security;
create policy "freelances are public" on public.freelance_profiles for select using (true);
create policy "own freelance insert" on public.freelance_profiles for insert to authenticated with check (auth.uid() = user_id);
create policy "own freelance update" on public.freelance_profiles for update to authenticated using (auth.uid() = user_id);

-- ============ MISSIONS ============
create table public.missions (
  id text primary key,
  owner_id uuid references auth.users(id) on delete cascade,
  title text not null,
  company text not null default '',
  team text not null default '',
  category text not null default 'Backend',
  summary text not null default '',
  description text not null default '',
  deliverables text[] not null default '{}',
  skills text[] not null default '{}',
  budget integer not null default 0,
  duration text not null default '',
  status text not null default 'todo',
  progress integer not null default 0,
  freelance_id text references public.freelance_profiles(id) on delete set null,
  applicants integer not null default 0,
  posted_at text not null default '',
  paused boolean not null default false,
  recommended text[] not null default '{}',
  created_at timestamptz not null default now()
);
grant select on public.missions to anon;
grant select, insert, update, delete on public.missions to authenticated;
grant all on public.missions to service_role;
alter table public.missions enable row level security;
create policy "missions are public" on public.missions for select using (true);
create policy "own mission insert" on public.missions for insert to authenticated with check (auth.uid() = owner_id);
create policy "own mission update" on public.missions for update to authenticated using (auth.uid() = owner_id);
create policy "own mission delete" on public.missions for delete to authenticated using (auth.uid() = owner_id);

-- ============ APPLICATIONS ============
create table public.applications (
  id uuid primary key default gen_random_uuid(),
  mission_id text not null references public.missions(id) on delete cascade,
  mission_title text not null default '',
  freelance_id text not null references public.freelance_profiles(id) on delete cascade,
  freelance_user_id uuid references auth.users(id) on delete set null,
  company_id uuid references auth.users(id) on delete cascade,
  status text not null default 'recue',
  pitch text not null default '',
  rate integer not null default 0,
  availability text not null default '',
  created_at timestamptz not null default now(),
  unique (mission_id, freelance_id)
);
grant select, insert, update, delete on public.applications to authenticated;
grant all on public.applications to service_role;
alter table public.applications enable row level security;
create policy "applications visible to both sides" on public.applications for select to authenticated
  using (auth.uid() = company_id or auth.uid() = freelance_user_id or company_id is null);
create policy "applications insert" on public.applications for insert to authenticated
  with check (auth.uid() = freelance_user_id or auth.uid() = company_id);
create policy "applications update by company" on public.applications for update to authenticated
  using (auth.uid() = company_id or company_id is null);
create policy "applications delete by owner" on public.applications for delete to authenticated
  using (auth.uid() = company_id or auth.uid() = freelance_user_id);

-- ============ MESSAGES ============
create table public.messages (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references auth.users(id) on delete cascade,
  freelance_id text not null references public.freelance_profiles(id) on delete cascade,
  freelance_user_id uuid references auth.users(id) on delete set null,
  sender text not null check (sender in ('entreprise','freelance')),
  subject text not null default '',
  body text not null,
  created_at timestamptz not null default now()
);
grant select, insert on public.messages to authenticated;
grant all on public.messages to service_role;
alter table public.messages enable row level security;
create policy "messages visible to both sides" on public.messages for select to authenticated
  using (auth.uid() = company_id or auth.uid() = freelance_user_id);
create policy "messages insert" on public.messages for insert to authenticated
  with check (auth.uid() = company_id or auth.uid() = freelance_user_id);

-- ============ INTERVIEWS ============
create table public.interviews (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references auth.users(id) on delete cascade,
  freelance_id text not null references public.freelance_profiles(id) on delete cascade,
  freelance_user_id uuid references auth.users(id) on delete set null,
  day date not null,
  time text not null default '10:00',
  duration text not null default '45 min',
  subject text not null default '',
  channel text not null default 'Visio',
  created_at timestamptz not null default now()
);
grant select, insert, delete on public.interviews to authenticated;
grant all on public.interviews to service_role;
alter table public.interviews enable row level security;
create policy "interviews visible to both sides" on public.interviews for select to authenticated
  using (auth.uid() = company_id or auth.uid() = freelance_user_id);
create policy "interviews insert" on public.interviews for insert to authenticated with check (auth.uid() = company_id);
create policy "interviews delete" on public.interviews for delete to authenticated using (auth.uid() = company_id);

-- ============ PAYMENTS ============
create table public.payments (
  id uuid primary key default gen_random_uuid(),
  mission_id text references public.missions(id) on delete set null,
  company_id uuid references auth.users(id) on delete cascade,
  freelance_id text references public.freelance_profiles(id) on delete set null,
  freelance_user_id uuid references auth.users(id) on delete set null,
  label text not null default '',
  counterpart text not null default '',
  amount integer not null default 0,
  due_label text not null default '',
  state text not null default 'pending',
  created_at timestamptz not null default now()
);
grant select, insert, update on public.payments to authenticated;
grant all on public.payments to service_role;
alter table public.payments enable row level security;
create policy "payments visible to both sides" on public.payments for select to authenticated
  using (auth.uid() = company_id or auth.uid() = freelance_user_id or company_id is null);
create policy "payments insert" on public.payments for insert to authenticated with check (auth.uid() = company_id);
create policy "payments update" on public.payments for update to authenticated using (auth.uid() = company_id);

-- ============ SHORTLIST ============
create table public.shortlist (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  freelance_id text not null references public.freelance_profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, freelance_id)
);
grant select, insert, delete on public.shortlist to authenticated;
grant all on public.shortlist to service_role;
alter table public.shortlist enable row level security;
create policy "own shortlist" on public.shortlist for select to authenticated using (auth.uid() = user_id);
create policy "own shortlist insert" on public.shortlist for insert to authenticated with check (auth.uid() = user_id);
create policy "own shortlist delete" on public.shortlist for delete to authenticated using (auth.uid() = user_id);

-- ============ NOTIFICATIONS ============
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  freelance_id text references public.freelance_profiles(id) on delete cascade,
  title text not null,
  detail text not null default '',
  kind text not null default 'mission',
  read boolean not null default false,
  created_at timestamptz not null default now()
);
grant select, insert, update on public.notifications to authenticated;
grant all on public.notifications to service_role;
alter table public.notifications enable row level security;
create policy "own notifications" on public.notifications for select to authenticated
  using (auth.uid() = user_id or (freelance_id is not null and exists (
    select 1 from public.freelance_profiles f where f.id = notifications.freelance_id and f.user_id = auth.uid()
  )));
create policy "notifications insert" on public.notifications for insert to authenticated with check (true);
create policy "notifications update" on public.notifications for update to authenticated
  using (auth.uid() = user_id or (freelance_id is not null and exists (
    select 1 from public.freelance_profiles f where f.id = notifications.freelance_id and f.user_id = auth.uid()
  )));

-- ============ SAVED ALERTS ============
create table public.saved_alerts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  label text not null default '',
  criteria jsonb not null default '{}',
  known_ids text[] not null default '{}',
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.saved_alerts to authenticated;
grant all on public.saved_alerts to service_role;
alter table public.saved_alerts enable row level security;
create policy "own alerts" on public.saved_alerts for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ============ SEED : profils freelances de démonstration ============
insert into public.freelance_profiles (id, name, initials, title, city, available, rate, rating, reviews, missions_count, skills, bio, portfolio, testimonials) values
('lea-martin','Léa Martin','LM','Senior Frontend Engineer','Paris',true,650,4.9,38,38,'{"React","TypeScript","Next.js","Design systems"}','Dix ans d''interfaces produit pour des scale-ups B2B. Spécialiste des design systems et des refontes à fort trafic.','[{"title":"Design system multi-produit","client":"Atelier Nord","year":"2025","result":"-40 % de temps d''intégration"},{"title":"Refonte espace client","client":"Vela","year":"2024","result":"+22 % de conversion"}]','[{"author":"Camille Lefèvre","company":"Atelier Nord","text":"Livraison nette, communication irréprochable.","rating":5}]'),
('karim-benali','Karim Benali','KB','Backend & Platform Engineer','Lyon',true,720,4.8,41,41,'{"Go","gRPC","PostgreSQL","Kubernetes"}','Architecte de plateformes à haute disponibilité. Intégrations API, event-driven et fiabilité opérationnelle.','[{"title":"Pipeline d''intégration API","client":"Solvia","year":"2025","result":"99,99 % de disponibilité"},{"title":"Migration event-driven","client":"Nordwind","year":"2024","result":"-60 % de latence"}]','[{"author":"Hugo Nassif","company":"Solvia","text":"Rigueur d''ingénieur senior, zéro surprise sur le budget.","rating":5}]'),
('sofia-reyes','Sofia Reyes','SR','Data Engineer','Bordeaux',false,600,5.0,27,27,'{"Python","dbt","Airflow","BigQuery"}','Pipelines de données et reporting automatisé pour les équipes finance et growth.','[{"title":"Dashboard analytique temps réel","client":"Vela","year":"2025","result":"Reporting J+0"}]','[{"author":"Inès Roche","company":"Vela","text":"Elle a rendu nos données enfin lisibles.","rating":5}]'),
('thomas-guerin','Thomas Guérin','TG','Automatisation & intégrations','Nantes',true,520,4.7,33,33,'{"Node.js","API","Zapier","Airtable"}','Micro-logiciels sur mesure et automatisations d''outils internes pour PME et ETI.','[{"title":"Automatisation du reporting","client":"Atelier Nord","year":"2025","result":"12 h économisées / semaine"}]','[{"author":"Camille Lefèvre","company":"Atelier Nord","text":"Un vrai gain de temps pour l''équipe ops.","rating":5}]'),
('amelie-dubois','Amélie Dubois','AD','Mobile Engineer','Lille',true,610,4.8,19,19,'{"React Native","Swift","Kotlin"}','Applications mobiles internes et grand public, du prototype au store.','[{"title":"Application mobile interne","client":"Solvia","year":"2024","result":"4,7 sur les stores"}]','[{"author":"Hugo Nassif","company":"Solvia","text":"Excellente autonomie produit.","rating":5}]'),
('yanis-perrot','Yanis Perrot','YP','Maintenance & legacy','Toulouse',false,480,4.6,52,52,'{"PHP","MySQL","Symfony","Tests"}','Reprise de code existant, correction de bugs critiques et maintenance long terme.','[{"title":"Correction bugs legacy","client":"Nordwind","year":"2025","result":"Backlog divisé par 3"}]','[{"author":"Sarah Klein","company":"Nordwind","text":"Fiable sur des sujets peu glamour mais critiques.","rating":4}]');

-- ============ SEED : missions de démonstration (ouvertes à tous) ============
insert into public.missions (id, title, company, team, category, summary, description, deliverables, skills, budget, duration, status, progress, freelance_id, applicants, posted_at) values
('api-integration','Pipeline d''intégration API','Atelier Nord','Équipe Plateforme','Backend','Connecter nos outils internes à un bus d''événements fiable et documenté.','Nous cherchons un développeur backend expérimenté pour concevoir un pipeline d''intégration entre notre ERP, notre CRM et notre facturation. L''objectif est de fiabiliser les échanges et de réduire les ressaisies manuelles.','{"Schéma d''architecture","Services d''intégration","Documentation technique","Tests de charge"}','{"Go","gRPC","PostgreSQL"}',15000,'5 sem.','active',64,'karim-benali',7,'12 juin'),
('mobile-app','Application mobile interne','Solvia','Équipe Ops','Mobile','Application terrain pour les équipes de maintenance, mode hors-ligne inclus.','Application mobile destinée à 120 techniciens terrain : saisie d''interventions, photos, synchronisation hors-ligne et export vers l''outil de planification.','{"Prototype cliquable","App iOS & Android","Synchronisation hors-ligne","Recette"}','{"React Native","Swift"}',32000,'10 sem.','todo',8,null,12,'3 juin'),
('analytics-dashboard','Dashboard analytique','Vela','Équipe Data','Data','Centraliser les KPI produit et finance dans un tableau de bord unique.','Mise en place d''un entrepôt de données léger, de transformations dbt et d''un tableau de bord temps réel pour le comité de direction.','{"Modèle de données","Transformations dbt","Dashboard","Alertes"}','{"TypeScript","dbt","BigQuery"}',21500,'6 sem.','done',100,'sofia-reyes',9,'2 mai'),
('legacy-bugs','Correction bugs legacy','Nordwind','Équipe Support','Maintenance','Réduire le backlog de bugs critiques sur une application Symfony.','Reprise d''une base de code historique : triage du backlog, correction des anomalies bloquantes et mise en place de tests de non-régression.','{"Triage du backlog","Correctifs","Tests de non-régression"}','{"PHP","MySQL"}',6800,'2 sem.','paid',100,'yanis-perrot',5,'18 avril'),
('reporting-automation','Automatisation du reporting','Atelier Nord','Équipe Data','Automatisation','Supprimer douze heures de reporting manuel par semaine.','Automatiser la collecte, le nettoyage et la diffusion des rapports hebdomadaires vers Slack et l''espace de direction.','{"Scripts d''extraction","Planification","Diffusion automatique"}','{"Node.js","API"}',12000,'4 sem.','done',100,'thomas-guerin',6,'20 avril'),
('internal-tool','Micro-logiciel interne','Atelier Nord','Équipe Ops','Automatisation','Un outil sur mesure pour piloter les plannings atelier.','Développement d''un micro-logiciel web pour la planification des postes de travail, avec gestion des droits et export comptable.','{"Cadrage fonctionnel","Application web","Formation des équipes"}','{"React","Node.js"}',24000,'8 sem.','todo',12,null,4,'28 juin'),
('crm-integration','Intégration CRM','Atelier Nord','Équipe Growth','Automatisation','Synchroniser le CRM avec les outils marketing.','Synchronisation bidirectionnelle HubSpot, nettoyage des doublons et tableaux de suivi des leads.','{"Connecteur","Dédoublonnage","Tableau de suivi"}','{"Node.js","HubSpot"}',9750,'3 sem.','archived',100,'thomas-guerin',3,'10 mars'),
('checkout-refonte','Refonte du tunnel de paiement','Vela','Équipe Plateforme','Frontend','Repenser le parcours de paiement et l''intégration Stripe.','Refonte complète du tunnel de paiement : nouvelle interface, intégration Stripe, tests A/B et suivi des abandons.','{"Maquettes","Tunnel refondu","Intégration Stripe","Suivi analytique"}','{"React","TypeScript","Stripe"}',18500,'6 sem.','active',48,'lea-martin',11,'1 juin');

-- ============ SEED : paiements de démonstration ============
insert into public.payments (mission_id, freelance_id, label, counterpart, amount, due_label, state) values
('api-integration','karim-benali','Jalon 2 · Intégration','Karim Benali',5000,'30 juin','pending'),
('checkout-refonte','lea-martin','Jalon 1 · Maquettes','Léa Martin',4750,'22 juin','pending'),
('analytics-dashboard','sofia-reyes','Solde final','Sofia Reyes',10750,'14 juin','paid'),
('legacy-bugs','yanis-perrot','Facture unique','Yanis Perrot',6800,'2 juin','paid'),
('reporting-automation','thomas-guerin','Solde final','Thomas Guérin',6000,'28 mai','paid'),
('internal-tool',null,'Acompte 30 %','À attribuer',7200,'5 juillet','scheduled');
