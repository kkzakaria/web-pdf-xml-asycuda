# Composant UserAvatar

## Vue d'ensemble

Le composant `UserAvatar` affiche l'avatar de l'utilisateur connecté dans l'angle supérieur droit de toutes les pages. Il inclut un dropdown menu avec les informations de l'utilisateur et un bouton de déconnexion.

## Emplacement

```
components/UserAvatar.tsx
```

## Intégration

Le composant est intégré dans le layout principal (`app/layout.tsx`) et apparaît sur toutes les pages:

```typescript
<header className="fixed top-0 right-0 z-50 p-4">
  <UserAvatar />
</header>
```

## Fonctionnalités

### 1. Avatar utilisateur

- **Affichage**: Cercle avec initiales de l'utilisateur
- **Initiales**: Extraites de l'email (ex: "john.doe@example.com" → "JD")
- **Image**: Support des avatars personnalisés via `user_metadata.avatar_url`
- **Style**: Anneau coloré avec effet hover et focus

### 2. Dropdown menu

Le menu déroulant s'ouvre au clic sur l'avatar et contient:

#### Informations utilisateur
- **Label**: "Mon compte"
- **Email**: Email de l'utilisateur connecté (tronqué si trop long)

#### Action de déconnexion
- **Bouton**: "Déconnexion" avec icône
- **Style**: Texte rouge (destructive)
- **Action**: Appelle la Server Action `logout()`

## Comportement

### Visibilité

- ✅ **Utilisateur connecté**: Avatar visible
- ❌ **Utilisateur non connecté**: Avatar caché
- ⏳ **Chargement**: Avatar caché pendant la vérification

### Réactivité

Le composant écoute les changements d'état d'authentification en temps réel:

```typescript
supabase.auth.onAuthStateChange((_event, session) => {
  setUser(session?.user ?? null)
})
```

### Déconnexion

Lorsque l'utilisateur clique sur "Déconnexion":
1. Appel de la Server Action `logout()`
2. Supabase déconnecte l'utilisateur
3. Redirection automatique vers `/login`
4. Avatar disparaît

## Composants utilisés

### shadcn/ui

- **Avatar**: Composant d'avatar avec fallback
- **DropdownMenu**: Menu déroulant avec items et séparateurs

### Icônes (lucide-react)

- **LogOut**: Icône de déconnexion
- **UserIcon**: Icône de fallback si pas d'initiales

## Styling

### Position

```css
position: fixed
top: 0
right: 0
z-index: 50 /* Au-dessus du contenu */
padding: 1rem
```

### Avatar

```css
height: 2.5rem (40px)
width: 2.5rem (40px)
border-radius: 9999px (cercle complet)
ring-2 ring-primary/20 (anneau avec opacité)
hover:ring-primary/40 (anneau plus visible au survol)
```

### Menu

```css
width: 14rem (224px)
align: end (aligné à droite)
```

## Code exemple

### Utilisation basique (déjà intégré)

```typescript
import { UserAvatar } from "@/components/UserAvatar"

export default function Layout({ children }) {
  return (
    <div>
      <header className="fixed top-0 right-0 z-50 p-4">
        <UserAvatar />
      </header>
      {children}
    </div>
  )
}
```

### Personnalisation des initiales

Le composant génère automatiquement les initiales:

```typescript
const getInitials = (email: string) => {
  const name = email.split("@")[0]
  return name
    .split(/[._-]/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase()
}
```

**Exemples**:
- `john.doe@example.com` → "JD"
- `alice_smith@example.com` → "AS"
- `bob-jones@example.com` → "BJ"
- `user@example.com` → "U"

## Accessibilité

### Focus

- ✅ Anneau de focus visible (ring-2 ring-primary)
- ✅ Offset pour meilleure visibilité (ring-offset-2)

### Navigation clavier

- ✅ Tab pour accéder à l'avatar
- ✅ Enter/Space pour ouvrir le menu
- ✅ Flèches pour naviguer dans le menu
- ✅ Enter pour sélectionner un item
- ✅ Escape pour fermer le menu

### ARIA

Les composants shadcn/ui incluent automatiquement:
- Labels appropriés
- Rôles ARIA
- États ARIA (expanded, disabled, etc.)

## Sécurité

### Session client-side

Le composant utilise le client Supabase browser:
- Cookies gérés automatiquement
- Session synchronisée avec le serveur
- Pas de tokens exposés en JavaScript

### Déconnexion sécurisée

La déconnexion utilise une Server Action:
- Traitement server-side
- Invalidation de session Supabase
- Nettoyage des cookies
- Redirection sécurisée

## Personnalisation

### Changer la position

Modifier le `header` dans `app/layout.tsx`:

```typescript
// Centré en haut
<header className="fixed top-0 left-1/2 -translate-x-1/2 z-50 p-4">

// En bas à droite
<header className="fixed bottom-0 right-0 z-50 p-4">

// En haut à gauche
<header className="fixed top-0 left-0 z-50 p-4">
```

### Ajouter des items au menu

Modifier `components/UserAvatar.tsx`:

```typescript
<DropdownMenuContent>
  <DropdownMenuLabel>...</DropdownMenuLabel>
  <DropdownMenuSeparator />

  {/* Nouvel item */}
  <DropdownMenuItem>
    <Settings className="mr-2 h-4 w-4" />
    <span>Paramètres</span>
  </DropdownMenuItem>

  <DropdownMenuSeparator />
  <DropdownMenuItem onClick={handleLogout}>...</DropdownMenuItem>
</DropdownMenuContent>
```

### Changer la taille de l'avatar

```typescript
// Avatar plus grand
<Avatar className="h-12 w-12">

// Avatar plus petit
<Avatar className="h-8 w-8">
```

## Limitations

### Avatar personnalisé

Pour utiliser un avatar personnalisé, l'utilisateur doit avoir `avatar_url` dans `user_metadata`:

```typescript
// Lors de l'inscription ou mise à jour du profil
await supabase.auth.updateUser({
  data: { avatar_url: "https://example.com/avatar.jpg" }
})
```

### Email requis

Le composant nécessite que l'utilisateur ait un email. Si l'authentification est faite via téléphone uniquement, il faudra adapter le code.

## Dépannage

### Avatar ne s'affiche pas

**Vérifier**:
1. L'utilisateur est-il connecté?
2. Le composant est-il dans le layout?
3. Le z-index est-il suffisant?
4. Y a-t-il des erreurs dans la console?

**Solution**:
```typescript
// Ajouter des logs pour déboguer
useEffect(() => {
  console.log("User:", user)
}, [user])
```

### Menu dropdown ne s'ouvre pas

**Vérifier**:
1. Les composants shadcn/ui sont-ils installés?
2. Les styles Tailwind sont-ils chargés?
3. Y a-t-il des conflits CSS?

### Déconnexion ne fonctionne pas

**Vérifier**:
1. La Server Action `logout()` existe?
2. Les cookies Supabase sont-ils présents?
3. Y a-t-il des erreurs dans les logs serveur?

## Ressources

- [shadcn/ui Avatar](https://ui.shadcn.com/docs/components/avatar)
- [shadcn/ui DropdownMenu](https://ui.shadcn.com/docs/components/dropdown-menu)
- [Supabase Auth Client](https://supabase.com/docs/reference/javascript/auth-getuser)
- [Lucide Icons](https://lucide.dev/icons/)
