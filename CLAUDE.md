# 🤖 CLAUDE DEVELOPMENT GUIDE - It's a Yes

> **IMPORTANT**: Lis TOUJOURS ce fichier avant de commencer toute modification !

## 🏗️ **ARCHITECTURE DU PROJET**

### **Stack Technique**
- **Next.js 15** avec App Router
- **TypeScript** en mode strict  
- **Tailwind CSS v4** (configuration moderne)
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
- ❌ Hardcoded User ID: `'00000000-0000-0000-0000-000000000001'` (en attente auth)
- ❌ Structure DB Supabase
- ❌ API routes existantes



