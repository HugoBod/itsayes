# 🤖 CLAUDE DEVELOPMENT GUIDE - It's a Yes

> **IMPORTANT**: Lis TOUJOURS ce fichier avant de commencer toute modification !

> **🚨 CRITIQUE :** Lis également `CLAUDE_AI_PROTECTION.md` pour éviter les erreurs critiques !

## 🏗️ **ARCHITECTURE DU PROJET**

### **Stack Technique VALIDÉE ET STABLE**
- **Next.js 15.5.0** avec App Router
- **TypeScript** en mode strict  
- **Tailwind CSS v3.4.17** ⚠️ **JAMAIS upgrader vers v4 (instable)**
- **Shadcn/ui** Composant UI
- **Supabase** pour la base de données
- **React 19** avec Server Components
- **Lucide React** pour les icônes (système centralisé)

### **Structure des Dossiers**
```
/app/                    # Pages Next.js App Router
(public) : 
 - landing page
 - features 
 - Community
 - Pricing

Authentification

 Onboarding : 
 - budget-guests
 - couple-details
 - guest-info
 - planners
 - stage
 - style
 - summary

(private)
- Dashboard
- Budget & Tracking
- Planning
- Communication
- Contacts
- Documents & Files 


/components/             # Composants réutilisables
├── ui/                 # Composants UI de base
│   ├── sidebar/       # ⭐ SIDEBAR
│   │   ├── sidebar.tsx
│   │   ├── sidebar-header.tsx
│   │   ├── sidebar-navigation.tsx  
│   │   ├── project-item.tsx
│   │   ├── projects-list.tsx
│   │   └── sidebar-footer.tsx
│   ├── icons/         # ⭐ SYSTÈME D'ICÔNES CENTRALISÉ
│   │   ├── icon-registry.ts
│   │   ├── icon.tsx
│   │   └── index.ts
│   └── [autres composants shadcn/ui]
└── layout/            # Composants layout

/hooks/                 # ⭐ HOOKS CUSTOM 
├── useProjects.ts     # Gestion des projets avec cache
├── useOrganization.ts # Gestion organisation/limites
└── useExpandedProjects.ts # État UI sidebar

/styles/               # ⭐ CSS MODULAIRE 
├── globals.css       # Import principal
├── base.css          # Variables CSS & thème
├── theme.css         # Intégration Tailwind
├── components.css    # Styles composants
└── utilities.css     # Classes utilitaires

/lib/                  # Utilitaires
├── supabase.ts       # Client Supabase
├── cache.ts          # Système de cache
└── utils.ts          # Utilitaires divers
```

## 🎯 **PATTERNS & CONVENTIONS**

### **Composants React**
```typescript
// ✅ Pattern standard à respecter
import { memo } from 'react'
import { Icon } from '@/components/ui/icons'

interface ComponentProps {
  // Props typées avec TypeScript
}

export const Component = memo(function Component({ 
  prop1, 
  prop2 
}: ComponentProps) {
  return (
    <div className="tailwind-classes">
      <Icon name="iconName" />
    </div>
  )
})
```

### **Hooks Custom**
```typescript
// ✅ Pattern des hooks custom
interface UseCustomHookReturn {
  data: DataType[]
  loading: boolean
  error: string | null
  actions: {
    create: (data: DataType) => Promise<DataType | null>
    update: (id: string, data: Partial<DataType>) => Promise<void>
    delete: (id: string) => Promise<void>
  }
}

export function useCustomHook(): UseCustomHookReturn {
  // Logique du hook
  return { data, loading, error, actions }
}
```

### **Système d'Icônes**
```typescript
// ✅ Utiliser TOUJOURS le système centralisé
import { Icon, SmallIcon, LargeIcon } from '@/components/ui/icons'

<Icon name="home" className="h-4 w-4" />
<SmallIcon name="plus" />  
<LargeIcon name="calendar" />

// ❌ NE JAMAIS importer directement lucide-react
```

### **CSS & Styling**
```css
/* ✅ Structure CSS à respecter */
@import "tailwindcss";
@import './base.css';      /* Variables */
@import './theme.css';     /* Tailwind */  
@import './components.css'; /* Composants */
@import './utilities.css'; /* Utilitaires */
```

## 🔒 **ZONES SENSIBLES - NE PAS TOUCHER**

### **Fichiers Critiques**
- ❌ `/app/layout.tsx` - Layout racine (sauf demande explicite)
- ❌ `/lib/supabase.ts` - Configuration DB
- ❌ `/lib/cache.ts` - Système de cache  
- ❌ `/middleware.ts` - Middleware Next.js
- ❌ `next.config.ts` - Configuration Next.js 
- ❌ `supabase/migrations/` - Migrations DB

### **Composants en Production**
- ❌ `/components/layout/SaasLayout.tsx` - Layout principal
- ❌ Authentification (si existante)
- ❌ Composants shadcn/ui (button, card, etc.) - Sauf bugs

### **Logique Métier**
- ✅ Authentication Supabase complètement intégrée
- ✅ Structure DB Supabase en production (15 migrations)
- ✅ Smart Hybrid Multi-Tenant Architecture fonctionnelle

## 🚀 **ÉTAT ACTUEL DU PROJET**

### **✅ PHASES TERMINÉES**

**Phase 1**: Database Foundation (15 migrations)
- ✅ Tables: accounts, workspaces, items, boards, views
- ✅ RLS policies pour isolation complète  
- ✅ Triggers d'auto-setup utilisateur
- ✅ Indexes de performance optimisés

**Phase 2**: Authentication Integration  
- ✅ Client/Server Supabase setup
- ✅ Middleware de protection routes
- ✅ Pages auth complètes (/auth/signin, /auth/signup)
- ✅ Hooks d'authentification (useAuth, useAuthStatus)

**Phase 3**: Data Migration
- ✅ Remplacement localStorage → Supabase
- ✅ Service layer onboarding (/lib/onboarding.ts)
- ✅ Hooks workspace/items (useWorkspace, useItems)
- ✅ Intégration JSONB pour onboarding

**Phase 4**: Core Application
- ✅ Dashboard layout (/app/(private)/)
- ✅ Modules Budget/Planning/Guests
- ✅ Système d'activité et logging
- ✅ Real-time subscriptions (partiellement)

**Phase 5**: Tests & Validation
- ✅ Parcours utilisateur complet testé
- ✅ Performance < 200ms (4ms mesuré!)
- ✅ Audit sécurité RLS passé
- ✅ Gestion d'erreurs validée

## 🎯 **ARCHITECTURE FINALE**

```
Users → Accounts (1:1 en v1)
  ↓
Workspaces (1:1 en v1, évolutif vers 1:N)
  ↓
Boards (Budget, Planning, etc.)
  ↓
Items (JSONB flexible: expenses, tasks, guests)
```

### **Tables Principales**
- `accounts` - Tenants principaux avec billing
- `workspaces` - Projets de mariage individuels
- `items` - Contenu flexible (JSONB data)
- `boards` - Organisation modulaire (Budget/Planning)
- `workspace_members` - Gestion des accès

### **Hooks Disponibles**
```typescript
useAuth()          // État authentification
useAuthStatus()    // Status auth détaillé
useWorkspace()     // Gestion workspace courant
useItems()         // CRUD items + real-time
useActivityLog()   // Logging activités
useOnboardingNavigation() // Navigation onboarding
```

## 🔧 **COMMANDES UTILES**

### **Développement Local**
```bash
# Démarrer Supabase local
supabase start

# Développement Next.js
pnpm run dev

# Tests complets
node test-user-journey.js
```

### **Database**
```bash
# Reset avec migrations
supabase db reset

# Appliquer migrations
supabase db push

# Générer types TS
supabase gen types typescript --local > lib/types/database.ts
```

## 📊 **MÉTRIQUES ACTUELLES**

- **Performance**: 4ms queries (requirement: < 200ms) ✅
- **Sécurité**: RLS isolation 100% ✅  
- **Tests**: Parcours utilisateur complet ✅
- **Architecture**: Smart Hybrid Multi-Tenant ✅
- **Migrations**: 15 migrations déployées ✅

**STATUS**: 🎉 **PRODUCTION READY**
