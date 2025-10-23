// src/pages/Documentation.tsx
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Building2,
  Users,
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  // Info,
  Target,
  Activity,
  Code2,
} from "lucide-react";

export function DocumentationPage() {
  return (
    <div>
      <Header title="Documentation" />
      <div className="p-6 space-y-6">
        {/* En-tête */}
        <div>
          <h2 className="text-3xl font-bold mb-2">
            📊 Guide des Métriques SaaS
          </h2>
          <p className="text-muted-foreground">
            Comprendre vos indicateurs de performance pour piloter votre
            business
          </p>
        </div>

        {/* Onglets principaux */}
        <Tabs defaultValue="metriques" className="space-y-4">
          <TabsList>
            <TabsTrigger value="metriques">📈 Métriques Business</TabsTrigger>
            <TabsTrigger value="alertes">🚨 Alertes & Actions</TabsTrigger>
            <TabsTrigger value="technique">💻 Détails Techniques</TabsTrigger>
          </TabsList>

          {/* Onglet Métriques Business */}
          <TabsContent value="metriques" className="space-y-6">
            {/* Section Clients */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Indicateurs Clients
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <BusinessMetric
                  title="Clients Actifs"
                  icon={<Building2 className="h-5 w-5 text-blue-600" />}
                  definition="Nombre d'hôtels qui paient actuellement leur abonnement"
                  pourquoi="C'est votre base payante réelle. Ces clients génèrent vos revenus mensuels. Une croissance de ce chiffre = croissance de votre business."
                  interpretation={
                    <div className="space-y-2 text-sm">
                      <p className="flex items-center gap-2">
                        <span className="text-green-600">↗️</span>
                        <strong>En croissance :</strong> Votre acquisition
                        fonctionne bien
                      </p>
                      <p className="flex items-center gap-2">
                        <span className="text-red-600">↘️</span>
                        <strong>En baisse :</strong> Plus de clients partent
                        qu'il n'en arrive (churn élevé)
                      </p>
                      <p className="flex items-center gap-2">
                        <span className="text-gray-600">→</span>
                        <strong>Stable :</strong> Équilibre entre nouvelles
                        inscriptions et départs
                      </p>
                    </div>
                  }
                  exemple="Vous avez 35 clients actifs. L'objectif ce trimestre : atteindre 50 clients actifs (+43% de croissance)."
                />

                <BusinessMetric
                  title="Essais Gratuits en Cours"
                  icon={<Target className="h-5 w-5 text-green-600" />}
                  definition="Nombre d'hôtels qui testent actuellement la plateforme (14 jours gratuits)"
                  pourquoi="C'est votre pipeline de ventes. Ces prospects peuvent devenir des clients payants. Plus vous avez de trials, plus vous avez d'opportunités de conversion."
                  interpretation={
                    <div className="space-y-2 text-sm">
                      <p>
                        <strong>Objectif de conversion :</strong> Au moins 30%
                        de vos trials doivent devenir clients payants
                      </p>
                      <p>
                        <strong>Action requise :</strong> Suivre chaque trial
                        activement (calls, démos, support)
                      </p>
                      <p>
                        <strong>Timing critique :</strong> Les 3 derniers jours
                        du trial sont décisifs
                      </p>
                    </div>
                  }
                  exemple="10 trials en cours : si vous convertissez 3 (30%), vous gagnez 3 × 29€ = 87€ de MRR mensuel additionnel."
                />

                <BusinessMetric
                  title="Répartition par Plan"
                  icon={<Building2 className="h-5 w-5 text-purple-600" />}
                  definition="Comment vos clients sont distribués entre les différentes offres (Starter, Professional, Enterprise)"
                  pourquoi="Permet de voir où se concentre votre revenu et d'identifier les opportunités d'upselling (faire monter les clients vers des plans supérieurs)."
                  interpretation={
                    <div className="space-y-2 text-sm">
                      <p>
                        <strong>Idéal :</strong> Une pyramide inversée (plus de
                        clients sur plans élevés)
                      </p>
                      <p>
                        <strong>À éviter :</strong> Trop de clients sur FREE
                        (pas de revenu)
                      </p>
                      <p>
                        <strong>Opportunité :</strong> Clients STARTER qui
                        utilisent beaucoup = cibles pour upgrade PROFESSIONAL
                      </p>
                    </div>
                  }
                  tarifs={
                    <div className="bg-gray-50 p-3 rounded text-sm space-y-1">
                      <p>
                        <strong>STARTER :</strong> 29€/mois (5 utilisateurs max)
                      </p>
                      <p>
                        <strong>PROFESSIONAL :</strong> 79€/mois (20
                        utilisateurs max)
                      </p>
                      <p>
                        <strong>ENTERPRISE :</strong> 199€/mois (illimité)
                      </p>
                    </div>
                  }
                />
              </CardContent>
            </Card>

            {/* Section Engagement */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Engagement & Utilisation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <BusinessMetric
                  title="Taux d'Engagement"
                  icon={<Activity className="h-5 w-5 text-purple-600" />}
                  definition="Pourcentage d'utilisateurs qui utilisent réellement la plateforme chaque mois (qui créent au moins 1 consigne)"
                  pourquoi="UN UTILISATEUR INACTIF = UN CLIENT À RISQUE. Si vos équipes n'utilisent pas la plateforme, elles n'en voient pas la valeur et risquent d'annuler leur abonnement."
                  interpretation={
                    <div className="space-y-2 text-sm">
                      <p className="text-green-600">
                        <strong>&gt; 60% :</strong> ✅ Excellente adoption,
                        clients satisfaits
                      </p>
                      <p className="text-blue-600">
                        <strong>40-60% :</strong> 👍 Bon, mais améliorable
                      </p>
                      <p className="text-orange-600">
                        <strong>20-40% :</strong> ⚠️ Problème d'adoption,
                        formation nécessaire
                      </p>
                      <p className="text-red-600">
                        <strong>&lt; 20% :</strong> ❌ Critique ! Clients vont
                        partir
                      </p>
                    </div>
                  }
                  exemple="150 utilisateurs inscrits, mais seulement 80 créent des consignes = 53% d'engagement. Action : identifier pourquoi 70 utilisateurs n'utilisent pas la plateforme."
                />

                <BusinessMetric
                  title="Total Utilisateurs"
                  icon={<Users className="h-5 w-5 text-blue-600" />}
                  definition="Nombre total de personnes inscrites sur la plateforme, tous hôtels confondus"
                  pourquoi="Mesure l'adoption dans les équipes. Plus il y a d'utilisateurs par hôtel, plus l'outil est ancré dans leur organisation."
                  interpretation={
                    <div className="text-sm space-y-2">
                      <p>
                        <strong>Moyenne par hôtel :</strong> 4-6 utilisateurs
                        est un bon ratio
                      </p>
                      <p>
                        <strong>Trop peu (&lt; 2) :</strong> Adoption limitée,
                        risque de churn
                      </p>
                      <p>
                        <strong>Beaucoup (&gt; 8) :</strong> Bon signe, mais
                        attention aux limites de plan
                      </p>
                    </div>
                  }
                />
              </CardContent>
            </Card>

            {/* Section Financière */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Santé Financière
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <BusinessMetric
                  title="MRR (Revenu Mensuel Récurrent)"
                  icon={<DollarSign className="h-5 w-5 text-green-600" />}
                  definition="Combien d'argent rentre chaque mois de manière prévisible grâce aux abonnements actifs"
                  pourquoi="C'est LA métrique financière principale d'un business SaaS. C'est votre revenu stable et prévisible. Objectif : le faire croître de 10-20% par mois."
                  interpretation={
                    <div className="space-y-2 text-sm">
                      <p>
                        <strong>Calcul simple :</strong> (Nombre de clients
                        STARTER × 29€) + (Nombre PROFESSIONAL × 79€) + (Nombre
                        ENTERPRISE × 199€)
                      </p>
                      <p className="text-green-600">
                        <strong>MRR en croissance :</strong> Votre business se
                        porte bien
                      </p>
                      <p className="text-red-600">
                        <strong>MRR en baisse :</strong> Vous perdez plus de
                        clients que vous n'en gagnez
                      </p>
                    </div>
                  }
                  exemple={
                    <div className="space-y-1">
                      <p>
                        <strong>Situation actuelle :</strong>
                      </p>
                      <p>• 10 clients STARTER = 290€</p>
                      <p>• 5 clients PROFESSIONAL = 395€</p>
                      <p>• 2 clients ENTERPRISE = 398€</p>
                      <p className="font-bold text-green-600 pt-2">
                        → MRR Total = 1 083€/mois
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Si vous gagnez 5 clients STARTER ce mois : +145€ de MRR
                      </p>
                    </div>
                  }
                />

                <BusinessMetric
                  title="ARR (Revenu Annuel Récurrent)"
                  icon={<DollarSign className="h-5 w-5 text-blue-600" />}
                  definition="Projection de votre revenu annuel (MRR × 12)"
                  pourquoi="Vision long terme de votre business. Utilisé pour évaluer la valeur de votre entreprise (valorisation ≈ ARR × 5 à 10 selon la croissance)."
                  exemple="MRR de 1 083€ → ARR de 12 996€. Avec une croissance de 100%/an, valorisation potentielle : 130k à 260k€."
                />
              </CardContent>
            </Card>

            {/* Section Rétention */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Fidélisation Client
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <BusinessMetric
                  title="Taux de Rétention"
                  icon={<TrendingUp className="h-5 w-5 text-green-600" />}
                  definition="Pourcentage de clients qui restent actifs après 90 jours (3 mois)"
                  pourquoi="Mesure la satisfaction client. Un client satisfait reste et paie chaque mois. Un taux élevé = produit qui apporte de la valeur."
                  interpretation={
                    <div className="space-y-2 text-sm">
                      <p className="text-green-600">
                        <strong>&gt; 90% :</strong> ✅ Excellent ! Clients très
                        satisfaits
                      </p>
                      <p className="text-blue-600">
                        <strong>80-90% :</strong> 👍 Bon niveau de satisfaction
                      </p>
                      <p className="text-orange-600">
                        <strong>70-80% :</strong> ⚠️ À améliorer (onboarding,
                        formation, support)
                      </p>
                      <p className="text-red-600">
                        <strong>&lt; 70% :</strong> ❌ Problème grave de produit
                        ou de service
                      </p>
                    </div>
                  }
                  exemple="Sur 15 nouveaux clients ce trimestre, 13 sont toujours actifs = 86.7% de rétention. Objectif : identifier pourquoi 2 sont partis pour éviter que ça se reproduise."
                />

                <BusinessMetric
                  title="Taux de Churn"
                  icon={<TrendingDown className="h-5 w-5 text-red-600" />}
                  definition="Pourcentage de clients perdus (qui annulent leur abonnement)"
                  pourquoi="C'est l'inverse de la rétention. Chaque client perdu = perte de revenu mensuel. UN CHURN ÉLEVÉ TUE VOTRE CROISSANCE même si vous acquérez beaucoup."
                  interpretation={
                    <div className="space-y-2 text-sm">
                      <p className="text-green-600">
                        <strong>&lt; 2% :</strong> ✅ Excellent, très peu de
                        départs
                      </p>
                      <p className="text-blue-600">
                        <strong>2-5% :</strong> 👍 Acceptable pour un SaaS
                      </p>
                      <p className="text-orange-600">
                        <strong>5-8% :</strong> ⚠️ Préoccupant, enquête
                        nécessaire
                      </p>
                      <p className="text-red-600">
                        <strong>&gt; 8% :</strong> ❌ Critique ! Votre
                        croissance est impossible
                      </p>
                    </div>
                  }
                  exemple="3 clients annulés sur 50 total = 6% de churn. Action urgente : appeler ces clients pour comprendre pourquoi ils partent (prix trop élevé ? fonctionnalité manquante ? support insuffisant ?)."
                  actions={
                    <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded text-sm">
                      <p className="font-semibold mb-2">Actions anti-churn :</p>
                      <p>
                        1. Appeler les clients à risque (faible utilisation)
                      </p>
                      <p>2. Proposer de l'aide, de la formation</p>
                      <p>
                        3. Exit interviews : comprendre pourquoi ils partent
                      </p>
                      <p>4. Programme de réussite client (Customer Success)</p>
                    </div>
                  }
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onglet Alertes */}
          <TabsContent value="alertes" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Système d'Alertes Automatiques
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-sm text-muted-foreground mb-4">
                  Le système surveille automatiquement vos clients et vous
                  prévient quand une action est nécessaire. Ces alertes
                  apparaissent en bas du dashboard.
                </p>

                <BusinessAlert
                  type="warning"
                  title="🟠 Client Inactif (14 jours)"
                  probleme="Un client n'a créé aucune consigne depuis 2 semaines"
                  risque="Un client qui n'utilise pas la plateforme va probablement annuler son abonnement dans les semaines qui viennent."
                  action="Appeler le client immédiatement pour comprendre pourquoi il n'utilise plus la plateforme"
                  questions={
                    <div className="text-sm space-y-1">
                      <p>• Y a-t-il un problème technique ?</p>
                      <p>• L'équipe a-t-elle besoin de formation ?</p>
                      <p>• Manque-t-il une fonctionnalité ?</p>
                      <p>• Sont-ils passés à un concurrent ?</p>
                    </div>
                  }
                  exemple="L'hôtel 'Ibis Nice' n'a créé aucune consigne depuis 15 jours → Vous appelez le responsable → Il vous dit que l'équipe ne sait pas comment utiliser une fonction → Vous programmez une formation de 30 min → Le client recommence à utiliser activement."
                />

                <BusinessAlert
                  type="info"
                  title="🔵 Trial se Termine (7 jours)"
                  probleme="Un client en essai gratuit arrive bientôt à la fin de sa période de test"
                  risque="Si vous n'agissez pas maintenant, le client va partir. Les 7 derniers jours du trial sont CRITIQUES pour la conversion."
                  action="Appel commercial pour convertir en client payant"
                  processus={
                    <div className="text-sm space-y-2 bg-blue-50 p-3 rounded">
                      <p className="font-semibold">Process de conversion :</p>
                      <p>
                        1. <strong>Bilan d'usage</strong> : Montrer la valeur
                        créée (X consignes créées, temps gagné)
                      </p>
                      <p>
                        2. <strong>Identifier les bénéfices</strong> : Ce qui a
                        changé pour eux
                      </p>
                      <p>
                        3. <strong>Lever les objections</strong> : Prix,
                        fonctionnalités, intégration
                      </p>
                      <p>
                        4. <strong>Proposer le bon plan</strong> : Adapter selon
                        leur taille et besoins
                      </p>
                      <p>
                        5. <strong>Offre limitée</strong> : Réduction pour
                        conversion immédiate
                      </p>
                    </div>
                  }
                  exemple="L'hôtel 'Royal' a 3 jours de trial restants. Vous appelez : 'Bonjour, j'ai vu que vous avez créé 45 consignes en 2 semaines, super ! Votre équipe a adopté l'outil. Pour continuer, je vous propose STARTER à 29€/mois, et si vous signez aujourd'hui, 1er mois à -50%'. → Conversion réussie !"
                />

                <BusinessAlert
                  type="error"
                  title="🔴 Limite Atteinte"
                  probleme="Un client a atteint la limite maximum de son plan (ex: 5 utilisateurs sur plan STARTER)"
                  risque="Le client est frustré car il ne peut pas ajouter plus de staff. Il peut partir ou rester bloqué dans sa croissance."
                  action="OPPORTUNITÉ D'UPSELLING ! Proposer un upgrade vers le plan supérieur"
                  processus={
                    <div className="text-sm space-y-2 bg-green-50 p-3 rounded">
                      <p className="font-semibold">Comment faire l'upsell :</p>
                      <p>
                        1. <strong>Féliciter</strong> : 'Super ! Votre équipe
                        grandit'
                      </p>
                      <p>
                        2. <strong>Présenter la solution</strong> : 'Passez à
                        PROFESSIONAL pour avoir 20 utilisateurs'
                      </p>
                      <p>
                        3. <strong>Calculer le ROI</strong> : 'Pour seulement
                        50€/mois de plus, vous pouvez embarquer toute l'équipe'
                      </p>
                      <p>
                        4. <strong>Faciliter</strong> : 'Je m'occupe de
                        l'upgrade en 5 minutes'
                      </p>
                    </div>
                  }
                  exemple="Hôtel STARTER (5 users max) a ses 5 utilisateurs. Le manager veut ajouter 3 personnes de la réception → Vous proposez PROFESSIONAL (20 users) à 79€ vs 29€ actuels → Upsell de +50€/mois de MRR = +600€/an !"
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onglet Technique */}
          <TabsContent value="technique" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code2 className="h-5 w-5" />
                  Implémentation Technique
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-2">
                  Cette section est destinée aux développeurs. Elle détaille
                  comment les métriques sont calculées du backend au frontend.
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Architecture */}
                <div className="border-l-4 border-blue-500 pl-4 space-y-3">
                  <h3 className="font-semibold text-lg">
                    Architecture du Système
                  </h3>
                  <div className="bg-gray-50 p-4 rounded space-y-3 text-sm">
                    <div>
                      <p className="font-semibold mb-2">
                        Backend (Node.js + Fastify + Prisma)
                      </p>
                      <p className="text-muted-foreground">
                        📁 backend/src/routes/saas.js - Route principale GET
                        /api/v1/saas/stats
                      </p>
                      <p className="text-muted-foreground">
                        📁 backend/src/config/pricing.js - Configuration des
                        tarifs
                      </p>
                    </div>
                    <div>
                      <p className="font-semibold mb-2">
                        Frontend (React + TypeScript + TanStack Query)
                      </p>
                      <p className="text-muted-foreground">
                        📁 backoffice/src/services/saas.service.ts - Appels API
                      </p>
                      <p className="text-muted-foreground">
                        📁 backoffice/src/hooks/useSaaS.ts - Hook React Query
                      </p>
                      <p className="text-muted-foreground">
                        📁 backoffice/src/pages/Dashboard.tsx - Affichage des
                        métriques
                      </p>
                    </div>
                    <div>
                      <p className="font-semibold mb-2">
                        Base de Données (PostgreSQL via Prisma)
                      </p>
                      <p className="text-muted-foreground">
                        • Table hotel : Informations clients
                      </p>
                      <p className="text-muted-foreground">
                        • Table user : Utilisateurs de la plateforme
                      </p>
                      <p className="text-muted-foreground">
                        • Table shiftLog : Consignes créées (pour l'activité)
                      </p>
                    </div>
                  </div>
                </div>

                {/* Flux de données */}
                <div className="border-l-4 border-green-500 pl-4 space-y-3">
                  <h3 className="font-semibold text-lg">Flux de Données</h3>
                  <div className="bg-gray-900 text-gray-100 p-4 rounded text-xs space-y-2 font-mono">
                    <p>1. Dashboard.tsx appelle useSaaSStats()</p>
                    <p>2. Hook lance saasService.getStats()</p>
                    <p>3. Service fait axios.get('/saas/stats')</p>
                    <p>4. Backend (saas.js) exécute les requêtes Prisma</p>
                    <p>5. Calcule les métriques en temps réel</p>
                    <p>6. Retourne JSON avec toutes les stats</p>
                    <p>7. React Query met en cache 5 minutes</p>
                    <p>8. Dashboard affiche les StatCard</p>
                  </div>
                </div>

                {/* Calculs Backend */}
                <div className="border-l-4 border-purple-500 pl-4 space-y-3">
                  <h3 className="font-semibold text-lg">
                    Calculs Backend (Prisma)
                  </h3>

                  <TechnicalDetail
                    title="Clients Actifs"
                    code={`// Ligne 106 de saas.js
const activeHotels = await prisma.hotel.count({
  where: { status: 'ACTIVE' }
});`}
                    explication="Simple comptage des hôtels avec statut ACTIVE"
                  />

                  <TechnicalDetail
                    title="Utilisateurs Actifs (30 jours)"
                    code={`// Lignes 132-149 de saas.js
const thirtyDaysAgo = new Date();
thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

const activeUsers = await prisma.user.count({
  where: {
    createdShiftLogs: {
      some: {
        createdAt: { gte: thirtyDaysAgo }
      }
    }
  }
});`}
                    explication="Compte les users ayant créé au moins 1 shiftLog dans les 30 derniers jours. Utilise une relation Prisma (createdShiftLogs) pour joindre les tables."
                  />

                  <TechnicalDetail
                    title="Taux d'Engagement"
                    code={`// Lignes 152-155 de saas.js
const engagementRate = totalUsers > 0
  ? parseFloat(((activeUsers / totalUsers) * 100).toFixed(1))
  : 0;`}
                    explication="Calcul simple : (utilisateurs actifs / total) × 100. Arrondi à 1 décimale."
                  />

                  <TechnicalDetail
                    title="MRR (Monthly Recurring Revenue)"
                    code={`// Lignes 157-165 de saas.js
const hotels = await prisma.hotel.findMany({
  where: { status: 'ACTIVE' },
  select: { subscriptionPlan: true }
});

const mrr = hotels.reduce((sum, hotel) => {
  return sum + (PLAN_PRICES[hotel.subscriptionPlan] || 0);
}, 0);

// PLAN_PRICES depuis config/pricing.js
export const PLAN_PRICES = {
  FREE: 0,
  STARTER: 29,
  PROFESSIONAL: 79,
  ENTERPRISE: 199
};`}
                    explication="1. Récupère tous les hôtels ACTIVE. 2. Pour chaque hôtel, ajoute le prix de son plan. 3. Somme totale = MRR."
                  />

                  <TechnicalDetail
                    title="Taux de Rétention (90 jours)"
                    code={`// Lignes 169-201 de saas.js
const ninetyDaysAgo = new Date();
ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

// Hôtels créés dans les 90 derniers jours
const hotelsCreatedLast90Days = await prisma.hotel.count({
  where: { createdAt: { gte: ninetyDaysAgo } }
});

// Hôtels annulés dans cette période
const hotelsCancelledLast90Days = await prisma.hotel.count({
  where: {
    status: 'CANCELLED',
    updatedAt: { gte: ninetyDaysAgo }
  }
});

// Calcul du taux
const retentionRate = hotelsCreatedLast90Days > 0
  ? parseFloat((
      (hotelsCreatedLast90Days - hotelsCancelledLast90Days) / 
      hotelsCreatedLast90Days
    ) * 100).toFixed(1)
  : 100;`}
                    explication="Formule : ((créés - annulés) / créés) × 100. Mesure combien de nouveaux clients restent après 90 jours."
                  />

                  <TechnicalDetail
                    title="Alertes - Hôtels Inactifs"
                    code={`// Lignes 210-239 de saas.js
const fourteenDaysAgo = new Date();
fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

const lowActivityHotels = await prisma.hotel.findMany({
  where: {
    status: 'ACTIVE',
    OR: [
      { lastActivityAt: { lt: fourteenDaysAgo } },
      { lastActivityAt: null }
    ]
  },
  select: { id: true, name: true, lastActivityAt: true },
  take: 10 // Limite à 10 résultats
});`}
                    explication="Cherche les hôtels ACTIVE sans activité depuis 14 jours OU qui n'ont jamais eu d'activité (null). Le champ lastActivityAt est mis à jour automatiquement à chaque création de shiftLog."
                  />
                </div>

                {/* Frontend */}
                <div className="border-l-4 border-orange-500 pl-4 space-y-3">
                  <h3 className="font-semibold text-lg">
                    Frontend (React + TypeScript)
                  </h3>

                  <TechnicalDetail
                    title="Hook useSaaSStats"
                    code={`// backoffice/src/hooks/useSaaS.ts
export const useSaaSStats = () => {
  return useQuery({
    queryKey: ['saas', 'stats'],
    queryFn: async () => {
      const result = await saasService.getStats();
      return result;
    },
    staleTime: 5 * 60 * 1000, // Cache 5 minutes
    refetchInterval: 10 * 60 * 1000, // Revalidation auto 10 min
  });
};`}
                    explication="Utilise TanStack Query pour gérer le cache et les revalidations automatiques. Évite de surcharger le serveur."
                  />

                  <TechnicalDetail
                    title="Service API"
                    code={`// backoffice/src/services/saas.service.ts
export const saasService = {
  async getStats(): Promise<SaaSStats> {
    const response = await api.get('/saas/stats');
    return response.data;
  }
};`}
                    explication="Appel HTTP simple via axios. L'authentification JWT est gérée par l'intercepteur global."
                  />

                  <TechnicalDetail
                    title="Affichage Dashboard"
                    code={`// backoffice/src/pages/Dashboard.tsx
const { data: stats, isLoading, error } = useSaaSStats();

// Puis affichage
<StatCard
  title="Clients Actifs"
  value={stats.activeHotels || 0}
  subtitle={\`\${stats.totalHotels || 0} au total\`}
  trend={stats.activeHotelsTrend}
  icon={Building2}
  color="blue"
/>`}
                    explication="Le hook retourne les données, gérant automatiquement loading, error et cache. Le composant affiche simplement les valeurs."
                  />
                </div>

                {/* Sécurité */}
                <div className="border-l-4 border-red-500 pl-4 space-y-3">
                  <h3 className="font-semibold text-lg">
                    Sécurité & Permissions
                  </h3>
                  <div className="bg-red-50 p-4 rounded space-y-2 text-sm">
                    <p className="font-semibold">Middleware Backend :</p>
                    <code className="block bg-gray-900 text-gray-100 p-2 rounded text-xs">
                      preHandler: [fastify.authenticate,
                      fastify.requireSuperAdmin]
                    </code>
                    <p className="text-muted-foreground">
                      1. <strong>authenticate</strong> : Vérifie le JWT token
                      <br />
                      2. <strong>requireSuperAdmin</strong> : Vérifie que
                      user.role === 'SUPER_ADMIN'
                    </p>
                    <p className="text-red-600 font-semibold mt-3">
                      ⚠️ Un utilisateur ADMIN ou STAFF recevra une erreur 403
                      Forbidden
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// Composant pour métrique business
interface BusinessMetricProps {
  title: string;
  icon: React.ReactNode;
  definition: string;
  pourquoi: string;
  interpretation?: React.ReactNode;
  exemple?: string | React.ReactNode;
  tarifs?: React.ReactNode;
  actions?: React.ReactNode;
}

function BusinessMetric({
  title,
  icon,
  definition,
  pourquoi,
  interpretation,
  exemple,
  tarifs,
  actions,
}: BusinessMetricProps) {
  return (
    <div className="border-l-4 border-blue-500 pl-4 space-y-3">
      <div className="flex items-center gap-2">
        {icon}
        <h3 className="font-semibold text-lg">{title}</h3>
      </div>

      <div>
        <Badge variant="outline" className="mb-2">
          C'est quoi ?
        </Badge>
        <p className="text-sm">{definition}</p>
      </div>

      <div>
        <Badge variant="outline" className="mb-2">
          Pourquoi c'est important ?
        </Badge>
        <p className="text-sm font-medium">{pourquoi}</p>
      </div>

      {interpretation && (
        <div>
          <Badge variant="outline" className="mb-2">
            Comment l'interpréter ?
          </Badge>
          <div>{interpretation}</div>
        </div>
      )}

      {tarifs && (
        <div>
          <Badge variant="outline" className="mb-2">
            Tarifs
          </Badge>
          {tarifs}
        </div>
      )}

      {actions && (
        <div>
          <Badge variant="outline" className="mb-2">
            Actions
          </Badge>
          {actions}
        </div>
      )}

      {exemple && (
        <div className="bg-green-50 border-l-4 border-green-500 p-3 rounded">
          <p className="text-xs font-semibold text-green-900 mb-1">
            💡 Exemple concret :
          </p>
          <div className="text-sm text-green-800">
            {typeof exemple === "string" ? <p>{exemple}</p> : exemple}
          </div>
        </div>
      )}
    </div>
  );
}

// Composant pour alerte business
interface BusinessAlertProps {
  type: "warning" | "info" | "error";
  title: string;
  probleme: string;
  risque: string;
  action: string;
  questions?: React.ReactNode;
  processus?: React.ReactNode;
  exemple: string;
}

function BusinessAlert({
  type,
  title,
  probleme,
  risque,
  action,
  questions,
  processus,
  exemple,
}: BusinessAlertProps) {
  const colors = {
    warning: "border-orange-500 bg-orange-50",
    info: "border-blue-500 bg-blue-50",
    error: "border-red-500 bg-red-50",
  };

  const textColors = {
    warning: "text-orange-900",
    info: "text-blue-900",
    error: "text-red-900",
  };

  return (
    <div className={`border-l-4 ${colors[type]} p-4 rounded space-y-3`}>
      <h3 className={`font-semibold text-lg ${textColors[type]}`}>{title}</h3>

      <div>
        <Badge variant="outline" className="mb-2">
          Le Problème
        </Badge>
        <p className="text-sm">{probleme}</p>
      </div>

      <div>
        <Badge variant="outline" className="mb-2">
          Le Risque
        </Badge>
        <p className="text-sm font-semibold text-red-600">{risque}</p>
      </div>

      <div>
        <Badge variant="outline" className="mb-2">
          Action à Prendre
        </Badge>
        <p className="text-sm font-semibold">{action}</p>
      </div>

      {questions && (
        <div>
          <Badge variant="outline" className="mb-2">
            Questions à Poser
          </Badge>
          {questions}
        </div>
      )}

      {processus && (
        <div>
          <Badge variant="outline" className="mb-2">
            Processus
          </Badge>
          {processus}
        </div>
      )}

      <div className="bg-white p-3 rounded">
        <p className="text-xs font-semibold mb-1">💼 Cas Réel :</p>
        <p className="text-sm">{exemple}</p>
      </div>
    </div>
  );
}

// Composant pour détail technique
interface TechnicalDetailProps {
  title: string;
  code: string;
  explication: string;
}

function TechnicalDetail({ title, code, explication }: TechnicalDetailProps) {
  return (
    <div className="space-y-2">
      <p className="font-semibold text-sm">{title}</p>
      <pre className="text-xs bg-gray-900 text-gray-100 p-3 rounded overflow-x-auto">
        {code}
      </pre>
      <p className="text-xs text-muted-foreground">{explication}</p>
    </div>
  );
}
