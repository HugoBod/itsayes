// Import only essential icons to reduce bundle size and compilation time
import {
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Users,
  LoaderCircle,
  Phone,
  Mail,
  CheckCircle,
  Home,
  Plus,
  Calendar,
  X,
  Menu,
  ChevronDown,
  Star,
  Heart,
  MapPin,
  Clock,
  DollarSign,
  Settings,
  User,
  Search,
  ArrowDown,
  RotateCcw,
  Twitter,
  Facebook,
  Instagram,
  Linkedin,
  type LucideIcon,
} from 'lucide-react'

export const iconRegistry = {
  // Essential icons only
  alertCircle: AlertCircle,
  arrowRight: ArrowRight,
  arrowLeft: ArrowLeft,
  users: Users,
  loader: LoaderCircle,
  phone: Phone,
  mail: Mail,
  checkCircle: CheckCircle,
  home: Home,
  plus: Plus,
  calendar: Calendar,
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
  search: Search,
  arrowDown: ArrowDown,
  refresh: RotateCcw,
  twitter: Twitter,
  facebook: Facebook,
  instagram: Instagram,
  linkedin: Linkedin,
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