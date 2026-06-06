import type React from "react";
import {
  LayoutGrid,
  CheckSquare,
  ShoppingBag,
  Image,
  ShieldAlert,
  Infinity as InfinityIcon,
  TrafficCone,
  Kanban,
  FolderClosed,
  Compass,
  Film,
  MessageSquare,
  Binary,
  Star,
  BarChart3,
  Timer as TimerIcon,
  ScrollText,
  Calculator as CalculatorIcon,
  FileText,
  LockKeyhole,
  Activity,
  Palette,
  Plus,
  Network,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Home } from "./pages/Home";
import { Login } from "./pages/Login";
import { Todos } from "./pages/Todos";
import { Products } from "./pages/Products";
import { Memes } from "./pages/Memes";
import { InfiniteScroll } from "./pages/InfiniteScroll";
import { ProductDetail } from "./pages/ProductDetail";
import { Checkout } from "./pages/Checkout";
import { Admin } from "./pages/Admin";
import { Unauthorized } from "./pages/Unauthorized";

// Import Wired Pages
import { TrafficLight } from "./pages/TrafficLight";
import { Trello } from "./pages/Trello";

// Import Standalone Interview components
import { Accordions } from "./pages/interview/Accordions";
import { Autocomplete } from "./pages/interview/Autocomplete";
import { Carousel } from "./pages/interview/Carousel";
import { Movies } from "./pages/interview/Movies";
import { NestedComments } from "./pages/interview/NestedComments";
import { Stack } from "./pages/interview/Stack";
import { StarRating } from "./pages/interview/StarRating";
import { StockWatch } from "./pages/interview/StockWatch";
import { Timer } from "./pages/interview/Timer";
import { Virtualization } from "./pages/interview/Virtualization";
import { Calculator } from "./pages/interview/Calculator";
import { Notepad } from "./pages/interview/Notepad";
import { PasswordChecker } from "./pages/interview/PasswordChecker";
import { ScrollTracker } from "./pages/interview/ScrollTracker";
import { ThemeSwitchShowcase } from "./pages/interview/ThemeSwitchShowcase";
import Counter from "./pages/Counter";
import { FiberWorkloop } from "./pages/interview/FiberWorkloop";

import type { translations } from "@statelab/theme";

export interface FeatureRoute {
  path: string;
  element: React.ComponentType;
  access: "public" | "public-redirect-login" | "protected" | "private";
  sidebar: boolean;
  labelKey?: keyof typeof translations.en;
  icon?: LucideIcon;
}

export const featureRegistry: FeatureRoute[] = [
  {
    path: "/",
    element: Home,
    access: "public",
    sidebar: true,
    labelKey: "navHome",
    icon: LayoutGrid,
  },
  {
    path: "/login",
    element: Login,
    access: "public-redirect-login",
    sidebar: false,
  },
  {
    path: "/todos",
    element: Todos,
    access: "protected",
    sidebar: true,
    labelKey: "navTodos",
    icon: CheckSquare,
  },
  {
    path: "/products",
    element: Products,
    access: "protected",
    sidebar: true,
    labelKey: "navProducts",
    icon: ShoppingBag,
  },
  {
    path: "/products/:id",
    element: ProductDetail,
    access: "protected",
    sidebar: false,
  },
  {
    path: "/checkout",
    element: Checkout,
    access: "protected",
    sidebar: false,
  },
  {
    path: "/memes",
    element: Memes,
    access: "protected",
    sidebar: true,
    labelKey: "navMemes",
    icon: Image,
  },
  {
    path: "/infinite-scroll",
    element: InfiniteScroll,
    access: "protected",
    sidebar: true,
    labelKey: "navInfinite",
    icon: InfinityIcon,
  },
  {
    path: "/traffic-light",
    element: TrafficLight,
    access: "protected",
    sidebar: true,
    labelKey: "navTrafficLight",
    icon: TrafficCone,
  },
  {
    path: "/trello",
    element: Trello,
    access: "protected",
    sidebar: true,
    labelKey: "navTrello",
    icon: Kanban,
  },
  // Standalone LLD Interview components routes
  {
    path: "/interview/accordions",
    element: Accordions,
    access: "protected",
    sidebar: true,
    labelKey: "navAccordions",
    icon: FolderClosed,
  },
  {
    path: "/interview/autocomplete",
    element: Autocomplete,
    access: "protected",
    sidebar: true,
    labelKey: "navAutocomplete",
    icon: Compass,
  },
  {
    path: "/interview/carousel",
    element: Carousel,
    access: "protected",
    sidebar: true,
    labelKey: "navCarousel",
    icon: Image,
  },
  {
    path: "/interview/movies",
    element: Movies,
    access: "protected",
    sidebar: true,
    labelKey: "navMovies",
    icon: Film,
  },
  {
    path: "/interview/nested-comments",
    element: NestedComments,
    access: "protected",
    sidebar: true,
    labelKey: "navNestedComments",
    icon: MessageSquare,
  },
  {
    path: "/interview/stack",
    element: Stack,
    access: "protected",
    sidebar: true,
    labelKey: "navStack",
    icon: Binary,
  },
  {
    path: "/interview/star-rating",
    element: StarRating,
    access: "protected",
    sidebar: true,
    labelKey: "navStarRating",
    icon: Star,
  },
  {
    path: "/interview/stock-watch",
    element: StockWatch,
    access: "protected",
    sidebar: true,
    labelKey: "navStockWatch",
    icon: BarChart3,
  },
  {
    path: "/interview/timer",
    element: Timer,
    access: "protected",
    sidebar: true,
    labelKey: "navTimer",
    icon: TimerIcon,
  },
  {
    path: "/interview/virtualization",
    element: Virtualization,
    access: "protected",
    sidebar: true,
    labelKey: "navVirtualization",
    icon: ScrollText,
  },
  {
    path: "/interview/calculator",
    element: Calculator,
    access: "protected",
    sidebar: true,
    labelKey: "navCalculator",
    icon: CalculatorIcon,
  },
  {
    path: "/interview/notepad",
    element: Notepad,
    access: "protected",
    sidebar: true,
    labelKey: "navNotepad",
    icon: FileText,
  },
  {
    path: "/interview/password-checker",
    element: PasswordChecker,
    access: "protected",
    sidebar: true,
    labelKey: "navPasswordChecker",
    icon: LockKeyhole,
  },
  {
    path: "/interview/scroll-tracker",
    element: ScrollTracker,
    access: "protected",
    sidebar: true,
    labelKey: "navScrollTracker",
    icon: Activity,
  },
  {
    path: "/interview/theme-switch",
    element: ThemeSwitchShowcase,
    access: "protected",
    sidebar: true,
    labelKey: "navThemeSwitch",
    icon: Palette,
  },
  {
    path: "/interview/counter",
    element: Counter,
    access: "protected",
    sidebar: true,
    labelKey: "navCounter",
    icon: Plus,
  },
  {
    path: "/interview/fiber-workloop",
    element: FiberWorkloop,
    access: "protected",
    sidebar: true,
    labelKey: "navFiberWorkloop",
    icon: Network,
  },
  {
    path: "/admin",
    element: Admin,
    access: "private",
    sidebar: true,
    labelKey: "navAdmin",
    icon: ShieldAlert,
  },
  {
    path: "/unauthorized",
    element: Unauthorized,
    access: "public",
    sidebar: false,
  },
];
