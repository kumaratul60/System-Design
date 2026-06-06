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
  Type,
  List,
  Search,
  Cookie,
  Percent,
  Clock,
  User,
  Folder,
  Key,
  Calendar,
  DollarSign,
  Video,
  Mail,
  Quote,
  Gamepad2,
  Tags,
  MousePointer,
  Table,
  Braces,
  GitCompare,
  Link,
  Globe,
  Grid,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Home } from "./pages/Home";
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

// New Standalone LLD Interview components
import { SmartTextarea } from "./pages/interview/SmartTextarea";
import { Dropdown } from "./pages/interview/Dropdown";
import { Autosuggest } from "./pages/interview/Autosuggest";
import { CookieConsent } from "./pages/interview/CookieConsent";
import { ProgressBar } from "./pages/interview/ProgressBar";
import { CountdownTimer } from "./pages/interview/CountdownTimer";
import { FeedbackModal } from "./pages/interview/FeedbackModal";
import { MultistepForm } from "./pages/interview/MultistepForm";
import { ToastNotification } from "./pages/interview/ToastNotification";
import { ProfileCard } from "./pages/interview/ProfileCard";
import { AccordionComponent } from "./pages/interview/AccordionComponent";
import { OtpVerification } from "./pages/interview/OtpVerification";
import { CalendarViewer } from "./pages/interview/CalendarViewer";
import { PricingCardPage } from "./pages/interview/PricingCardPage";
import { TypeaheadSearch } from "./pages/interview/TypeaheadSearch";
import { VideoPlayer } from "./pages/interview/VideoPlayer";
import { ContactUsForm } from "./pages/interview/ContactUsForm";
import { RandomQuoteGenerator } from "./pages/interview/RandomQuoteGenerator";

import { FileExplorer } from "./pages/interview/FileExplorer";
import { GuessNumber } from "./pages/interview/GuessNumber";
import { TicTacToe } from "./pages/interview/TicTacToe";
import { ChessBoard } from "./pages/interview/ChessBoard";
import { ChipsInput } from "./pages/interview/ChipsInput";
import { AreaSelector } from "./pages/interview/AreaSelector";
import { ColumnTable } from "./pages/interview/ColumnTable";
import { ColumnGrid } from "./pages/interview/ColumnGrid";
import { StringTransformers } from "./pages/interview/StringTransformers";
import { JsonViewer } from "./pages/interview/JsonViewer";
import { DiffChecker } from "./pages/interview/DiffChecker";
import { UrlStateSync } from "./pages/interview/UrlStateSync";
import { UrlInspector } from "./pages/interview/UrlInspector";

import type { translations } from "@statelab/theme";

export interface FeatureRoute {
  path: string;
  element: React.ComponentType;
  access: "public" | "protected" | "private";
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
    path: "/todos",
    element: Todos,
    access: "public",
    sidebar: true,
    labelKey: "navTodos",
    icon: CheckSquare,
  },
  {
    path: "/products",
    element: Products,
    access: "public",
    sidebar: true,
    labelKey: "navProducts",
    icon: ShoppingBag,
  },
  {
    path: "/products/:id",
    element: ProductDetail,
    access: "public",
    sidebar: false,
  },
  {
    path: "/checkout",
    element: Checkout,
    access: "public",
    sidebar: false,
  },
  {
    path: "/memes",
    element: Memes,
    access: "public",
    sidebar: true,
    labelKey: "navMemes",
    icon: Image,
  },
  {
    path: "/infinite-scroll",
    element: InfiniteScroll,
    access: "public",
    sidebar: true,
    labelKey: "navInfinite",
    icon: InfinityIcon,
  },
  {
    path: "/traffic-light",
    element: TrafficLight,
    access: "public",
    sidebar: true,
    labelKey: "navTrafficLight",
    icon: TrafficCone,
  },
  {
    path: "/trello",
    element: Trello,
    access: "public",
    sidebar: true,
    labelKey: "navTrello",
    icon: Kanban,
  },
  // Standalone LLD Interview components routes
  {
    path: "/interview/accordions",
    element: Accordions,
    access: "public",
    sidebar: true,
    labelKey: "navAccordions",
    icon: FolderClosed,
  },
  {
    path: "/interview/autocomplete",
    element: Autocomplete,
    access: "public",
    sidebar: true,
    labelKey: "navAutocomplete",
    icon: Compass,
  },
  {
    path: "/interview/carousel",
    element: Carousel,
    access: "public",
    sidebar: true,
    labelKey: "navCarousel",
    icon: Image,
  },
  {
    path: "/interview/movies",
    element: Movies,
    access: "public",
    sidebar: true,
    labelKey: "navMovies",
    icon: Film,
  },
  {
    path: "/interview/nested-comments",
    element: NestedComments,
    access: "public",
    sidebar: true,
    labelKey: "navNestedComments",
    icon: MessageSquare,
  },
  {
    path: "/interview/stack",
    element: Stack,
    access: "public",
    sidebar: true,
    labelKey: "navStack",
    icon: Binary,
  },
  {
    path: "/interview/star-rating",
    element: StarRating,
    access: "public",
    sidebar: true,
    labelKey: "navStarRating",
    icon: Star,
  },
  {
    path: "/interview/stock-watch",
    element: StockWatch,
    access: "public",
    sidebar: true,
    labelKey: "navStockWatch",
    icon: BarChart3,
  },
  {
    path: "/interview/timer",
    element: Timer,
    access: "public",
    sidebar: true,
    labelKey: "navTimer",
    icon: TimerIcon,
  },
  {
    path: "/interview/virtualization",
    element: Virtualization,
    access: "public",
    sidebar: true,
    labelKey: "navVirtualization",
    icon: ScrollText,
  },
  {
    path: "/interview/calculator",
    element: Calculator,
    access: "public",
    sidebar: true,
    labelKey: "navCalculator",
    icon: CalculatorIcon,
  },
  {
    path: "/interview/notepad",
    element: Notepad,
    access: "public",
    sidebar: true,
    labelKey: "navNotepad",
    icon: FileText,
  },
  {
    path: "/interview/password-checker",
    element: PasswordChecker,
    access: "public",
    sidebar: true,
    labelKey: "navPasswordChecker",
    icon: LockKeyhole,
  },
  {
    path: "/interview/scroll-tracker",
    element: ScrollTracker,
    access: "public",
    sidebar: true,
    labelKey: "navScrollTracker",
    icon: Activity,
  },
  {
    path: "/interview/theme-switch",
    element: ThemeSwitchShowcase,
    access: "public",
    sidebar: true,
    labelKey: "navThemeSwitch",
    icon: Palette,
  },
  {
    path: "/interview/counter",
    element: Counter,
    access: "public",
    sidebar: true,
    labelKey: "navCounter",
    icon: Plus,
  },
  {
    path: "/interview/fiber-workloop",
    element: FiberWorkloop,
    access: "public",
    sidebar: true,
    labelKey: "navFiberWorkloop",
    icon: Network,
  },
  {
    path: "/interview/smart-textarea",
    element: SmartTextarea,
    access: "public",
    sidebar: true,
    labelKey: "navSmartTextarea",
    icon: Type,
  },
  {
    path: "/interview/dropdown",
    element: Dropdown,
    access: "public",
    sidebar: true,
    labelKey: "navDropdown",
    icon: List,
  },
  {
    path: "/interview/autosuggest",
    element: Autosuggest,
    access: "public",
    sidebar: true,
    labelKey: "navAutosuggest",
    icon: Search,
  },
  {
    path: "/interview/cookie-consent",
    element: CookieConsent,
    access: "public",
    sidebar: true,
    labelKey: "navCookieConsent",
    icon: Cookie,
  },
  {
    path: "/interview/progress-bar",
    element: ProgressBar,
    access: "public",
    sidebar: true,
    labelKey: "navProgressBar",
    icon: Percent,
  },
  {
    path: "/interview/countdown-timer",
    element: CountdownTimer,
    access: "public",
    sidebar: true,
    labelKey: "navCountdownTimer",
    icon: Clock,
  },
  {
    path: "/interview/feedback-modal",
    element: FeedbackModal,
    access: "public",
    sidebar: true,
    labelKey: "navFeedbackModal",
    icon: MessageSquare,
  },
  {
    path: "/interview/multistep-form",
    element: MultistepForm,
    access: "public",
    sidebar: true,
    labelKey: "navMultistepForm",
    icon: List,
  },
  {
    path: "/interview/toast-notification",
    element: ToastNotification,
    access: "public",
    sidebar: true,
    labelKey: "navToastNotification",
    icon: Activity,
  },
  {
    path: "/interview/profile-card",
    element: ProfileCard,
    access: "public",
    sidebar: true,
    labelKey: "navProfileCard",
    icon: User,
  },
  {
    path: "/interview/accordion-component",
    element: AccordionComponent,
    access: "public",
    sidebar: true,
    labelKey: "navAccordionComponent",
    icon: Folder,
  },
  {
    path: "/interview/otp-verification",
    element: OtpVerification,
    access: "public",
    sidebar: true,
    labelKey: "navOtpVerification",
    icon: Key,
  },
  {
    path: "/interview/calendar-viewer",
    element: CalendarViewer,
    access: "public",
    sidebar: true,
    labelKey: "navCalendarViewer",
    icon: Calendar,
  },
  {
    path: "/interview/pricing-card",
    element: PricingCardPage,
    access: "public",
    sidebar: true,
    labelKey: "navPricingCard",
    icon: DollarSign,
  },
  {
    path: "/interview/typeahead-search",
    element: TypeaheadSearch,
    access: "public",
    sidebar: true,
    labelKey: "navTypeaheadSearch",
    icon: Search,
  },
  {
    path: "/interview/video-player",
    element: VideoPlayer,
    access: "public",
    sidebar: true,
    labelKey: "navVideoPlayer",
    icon: Video,
  },
  {
    path: "/interview/contact-us",
    element: ContactUsForm,
    access: "public",
    sidebar: true,
    labelKey: "navContactUs",
    icon: Mail,
  },
  {
    path: "/interview/quote-generator",
    element: RandomQuoteGenerator,
    access: "public",
    sidebar: true,
    labelKey: "navQuoteGenerator",
    icon: Quote,
  },
  {
    path: "/interview/file-explorer",
    element: FileExplorer,
    access: "public",
    sidebar: true,
    labelKey: "navFileExplorer",
    icon: Folder,
  },
  {
    path: "/interview/guess-number",
    element: GuessNumber,
    access: "public",
    sidebar: true,
    labelKey: "navGuessNumber",
    icon: Gamepad2,
  },
  {
    path: "/interview/tic-tac-toe",
    element: TicTacToe,
    access: "public",
    sidebar: true,
    labelKey: "navTicTacToe",
    icon: LayoutGrid,
  },
  {
    path: "/interview/chess-board",
    element: ChessBoard,
    access: "public",
    sidebar: true,
    labelKey: "navChessBoard",
    icon: Grid,
  },
  {
    path: "/interview/chips-input",
    element: ChipsInput,
    access: "public",
    sidebar: true,
    labelKey: "navChipsInput",
    icon: Tags,
  },
  {
    path: "/interview/area-selector",
    element: AreaSelector,
    access: "public",
    sidebar: true,
    labelKey: "navAreaSelector",
    icon: MousePointer,
  },
  {
    path: "/interview/column-table",
    element: ColumnTable,
    access: "public",
    sidebar: true,
    labelKey: "navColumnTable",
    icon: Table,
  },
  {
    path: "/interview/column-grid",
    element: ColumnGrid,
    access: "public",
    sidebar: true,
    labelKey: "navColumnGrid",
    icon: Grid,
  },
  {
    path: "/interview/string-transformers",
    element: StringTransformers,
    access: "public",
    sidebar: true,
    labelKey: "navStringTransformers",
    icon: Type,
  },
  {
    path: "/interview/json-viewer",
    element: JsonViewer,
    access: "public",
    sidebar: true,
    labelKey: "navJsonViewer",
    icon: Braces,
  },
  {
    path: "/interview/diff-checker",
    element: DiffChecker,
    access: "public",
    sidebar: true,
    labelKey: "navDiffChecker",
    icon: GitCompare,
  },
  {
    path: "/interview/url-sync",
    element: UrlStateSync,
    access: "public",
    sidebar: true,
    labelKey: "navUrlSync",
    icon: Link,
  },
  {
    path: "/interview/url-inspector",
    element: UrlInspector,
    access: "public",
    sidebar: true,
    labelKey: "navUrlInspector",
    icon: Globe,
  },
  {
    path: "/admin",
    element: Admin,
    access: "public",
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
