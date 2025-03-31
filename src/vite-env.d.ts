/// <reference types="vite/client" />

// Fix missing React type declarations
declare module 'react' {
  export = React;
}

declare module 'react/jsx-runtime' {
  export const jsx: any;
  export const jsxs: any;
  export const Fragment: any;
}

// Updated react-router-dom type declarations with onClick support for Link
declare module 'react-router-dom' {
  import React from 'react';
  
  export interface RouteProps {
    path?: string;
    element?: React.ReactNode;
    children?: React.ReactNode;
  }

  export interface LinkProps {
    to: string; 
    className?: string; 
    children: React.ReactNode;
    onClick?: (event: React.MouseEvent<HTMLAnchorElement>) => void;
  }
  
  export const BrowserRouter: React.FC<{ children: React.ReactNode }>;
  export const Routes: React.FC<{ children: React.ReactNode }>;
  export const Route: React.FC<RouteProps>;
  export const Link: React.FC<LinkProps>;
  export const useNavigate: () => (path: string, options?: { replace?: boolean }) => void;
  export const useParams: () => Record<string, string>;
  export const useLocation: () => { pathname: string };
  export const Navigate: React.FC<{ to: string; replace?: boolean }>;
}

// Fix missing Lucide React type declarations
declare module 'lucide-react' {
  import React from 'react';
  
  interface LucideProps extends React.SVGProps<SVGSVGElement> {
    size?: number | string;
    color?: string;
    strokeWidth?: number | string;
  }
  
  type LucideIcon = React.FC<LucideProps>;
  
  export const VideoIcon: LucideIcon;
  export const MessageSquare: LucideIcon;
  export const MessageCircle: LucideIcon;
  export const Flame: LucideIcon;
  export const TrendingUp: LucideIcon;
  export const Heart: LucideIcon;
  export const Share: LucideIcon;
  export const ChevronLeft: LucideIcon;
  export const ChevronRight: LucideIcon;
  export const ChevronDown: LucideIcon;
  export const ChevronUp: LucideIcon;
  export const MoreHorizontal: LucideIcon;
  export const BookmarkIcon: LucideIcon;
  export const Loader2: LucideIcon;
  export const Shield: LucideIcon;
  export const Lock: LucideIcon;
  export const Zap: LucideIcon;
  export const ArrowRight: LucideIcon;
  export const ArrowLeft: LucideIcon;
  export const X: LucideIcon;
  export const Menu: LucideIcon;
  export const Edit: LucideIcon;
  export const Camera: LucideIcon;
  export const Mail: LucideIcon;
  export const User: LucideIcon;
  export const UserRound: LucideIcon;
  export const Calendar: LucideIcon;
  export const CalendarDays: LucideIcon;
  export const MapPin: LucideIcon;
  export const SwitchCamera: LucideIcon;
  export const HelpCircle: LucideIcon;
  export const LayoutDashboard: LucideIcon;
  export const Users: LucideIcon;
  export const Compass: LucideIcon;
  export const Settings: LucideIcon;
  export const LogOut: LucideIcon;
  export const Monitor: LucideIcon;
  export const Upload: LucideIcon;
  export const Search: LucideIcon;
  export const Minimize2: LucideIcon;
  export const Maximize2: LucideIcon;
  export const Trash2: LucideIcon;
  export const Send: LucideIcon;
  export const Plus: LucideIcon;
  export const FileText: LucideIcon;
  export const AlertCircle: LucideIcon;
  export const Image: LucideIcon;
  export const Film: LucideIcon;
  export const Smile: LucideIcon;
  export const Bold: LucideIcon;
  export const Italic: LucideIcon;
  export const Underline: LucideIcon;
  export const Heading: LucideIcon;
  export const List: LucideIcon;
  export const ListOrdered: LucideIcon;
  export const Hash: LucideIcon;
  export const Check: LucideIcon;
  export const Circle: LucideIcon;
  export const Dot: LucideIcon;
  export const PanelLeft: LucideIcon;
  export const GripVertical: LucideIcon;
  export const Eye: LucideIcon;
  export const Clock: LucideIcon;
  export const CheckCircle2: LucideIcon;
  export const Info: LucideIcon;
  export const FileVideo: LucideIcon;
  export const AlertTriangle: LucideIcon;
  export const Sliders: LucideIcon;
  export const Filter: LucideIcon;
  export const Play: LucideIcon;
  export const Pause: LucideIcon;
  export const Volume2: LucideIcon;
  export const VolumeX: LucideIcon;
  export const Maximize: LucideIcon;
  export const SkipBack: LucideIcon;
  export const SkipForward: LucideIcon;
  export const Flag: LucideIcon;
  export const Tag: LucideIcon;
  export const FolderOpen: LucideIcon;
  export const ExternalLink: LucideIcon;
  export const CreditCard: LucideIcon;
}

// Fix missing date-fns type declarations
declare module 'date-fns' {
  export function format(date: Date, format: string): string;
  export function formatDistanceToNow(date: Date, options?: { addSuffix?: boolean }): string;
}

// Fix missing sonner type declarations
declare module 'sonner' {
  import { ReactNode } from 'react';
  
  export const toast: {
    success: (message: string) => void;
    error: (message: string) => void;
    (message: string): void;
  };
  
  export interface ToasterProps {
    position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'top-center' | 'bottom-center';
    expand?: boolean;
    visibleToasts?: number;
    toastOptions?: Record<string, any>;
    className?: string;
    style?: React.CSSProperties;
    theme?: 'light' | 'dark' | 'system';
    hotkey?: string[];
    richColors?: boolean;
    closeButton?: boolean;
  }
  
  export const Toaster: React.FC<ToasterProps>;
}

// Fix missing supabase type declarations
declare module '@/lib/supabase' {
  import { SupabaseClient } from '@supabase/supabase-js';
  export const supabase: SupabaseClient;
}
