// Import only essential icons to reduce bundle size and compilation time
import type { LucideIcon } from 'lucide-react'
import * as Icons from 'lucide-react'

const {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Users,
  LoaderCircle,
  Loader2,
  Phone,
  Mail,
  CheckCircle,
  Check,
  Home,
  Plus,
  Calendar,
  CalendarX,
  X,
  XCircle,
  Menu,
  ChevronDown,
  Star,
  Heart,
  MapPin,
  Clock,
  DollarSign,
  Settings,
  User,
  UserPlus,
  Search,
  ArrowDown,
  RotateCcw,
  Briefcase,
  Sparkles,
  Circle,
  Wallet,
  Target,
  CreditCard,
  Activity,
  ClipboardList,
  Folder,
  Edit,
  Trash,
  MessageCircle,
  Eye,
  Image,
  Palette,
  Lightbulb,
  Share,
} = Icons

export const iconRegistry = {
  // Essential icons only
  alertCircle: AlertCircle,
  'alert-circle': AlertCircle, // Backward compatibility
  'alert-triangle': AlertTriangle,
  alertTriangle: AlertTriangle,
  arrowRight: ArrowRight,
  arrowLeft: ArrowLeft,
  users: Users,
  loader: LoaderCircle,
  'loader-2': Loader2,
  phone: Phone,
  mail: Mail,
  checkCircle: CheckCircle,
  'check-circle': CheckCircle, // Backward compatibility
  check: Check,
  home: Home,
  plus: Plus,
  calendar: Calendar,
  'calendar-x': CalendarX,
  calendarX: CalendarX,
  x: X,
  menu: Menu,
  chevronDown: ChevronDown,
  star: Star,
  heart: Heart,
  mapPin: MapPin,
  clock: Clock,
  dollarSign: DollarSign,
  settings: Settings,
  user: User,
  'user-plus': UserPlus,
  userPlus: UserPlus,
  search: Search,
  arrowDown: ArrowDown,
  refresh: RotateCcw,
  briefcase: Briefcase,
  sparkles: Sparkles,
  circle: Circle,
  wallet: Wallet,
  target: Target,
  'credit-card': CreditCard,
  creditCard: CreditCard,
  activity: Activity,
  'clipboard-list': ClipboardList,
  clipboardList: ClipboardList,
  folder: Folder,
  edit: Edit,
  trash: Trash,
  'message-circle': MessageCircle,
  messageCircle: MessageCircle,
  'x-circle': XCircle,
  xCircle: XCircle,
  // Moodboard specific icons
  eye: Eye,
  image: Image,
  palette: Palette,
  lightbulb: Lightbulb,
  share: Share,
} as const

export type IconName = keyof typeof iconRegistry

export interface IconProps {
  name: IconName
  className?: string
  size?: number | string
  strokeWidth?: number
}

export function getIcon(name: IconName): LucideIcon {
  return iconRegistry[name]
}