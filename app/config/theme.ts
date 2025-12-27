export const theme = {
  colors: {
    border: {
      light: "border-black/[.08]",
      dark: "dark:border-white/[.145]",
      default: "border-gray-300 dark:border-gray-700",
    },
    background: {
      hover: "hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a]",
      hoverAlt: "hover:bg-gray-100 dark:hover:bg-gray-800",
      primary: "bg-foreground text-background",
      white: "bg-white dark:bg-gray-800",
      blue: "bg-blue-100 dark:bg-blue-900",
      blueHover: "hover:bg-blue-200 dark:hover:bg-blue-800",
      red: "bg-red-100 dark:bg-red-900",
      redHover: "hover:bg-red-200 dark:hover:bg-red-900",
      green: "bg-green-100 dark:bg-green-900",
      purple: "bg-purple-100 dark:purple-900",
    },
    text: {
      primary: "text-gray-900 dark:text-gray-100",
      secondary: "text-gray-600 dark:text-gray-400",
      muted: "text-gray-500 dark:text-gray-500",
      blue: "text-blue-600 dark:text-blue-400",
      blueAlt: "text-blue-700 dark:text-blue-300",
      red: "text-red-700 dark:text-red-300",
      redAlt: "text-red-600 dark:text-red-400",
      green: "text-green-700 dark:text-green-300",
      greenAlt: "text-green-800 dark:text-green-200",
      purple: "text-purple-800 dark:text-purple-200",
    },
  },
  spacing: {
    xs: "p-1",
    sm: "p-2",
    md: "p-4",
    lg: "p-6",
    xl: "p-8",
  },
  rounded: {
    sm: "rounded",
    md: "rounded-lg",
    lg: "rounded-2xl",
    full: "rounded-full",
  },
  shadow: {
    sm: "shadow",
    md: "shadow-lg",
    lg: "shadow-xl",
  },
  text: {
    xs: "text-xs",
    sm: "text-sm",
    base: "text-base",
    lg: "text-lg",
    xl: "text-xl",
    "2xl": "text-2xl",
    "3xl": "text-3xl",
    "4xl": "text-4xl",
  },
} as const;

// Alert variants
export const alertVariants = {
  info: "bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200",
  success:
    "bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200",
  warning:
    "bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200",
  error:
    "bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200",
} as const;

// Badge variants
export const badgeVariants = {
  default: "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200",
  primary: "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200",
  success: "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200",
  warning:
    "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200",
  danger: "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200",
} as const;

// Badge sizes
export const badgeSizes = {
  sm: "px-1.5 py-0.5 text-xs",
  md: "px-2 py-0.5 text-sm",
  lg: "px-2.5 py-1 text-sm",
} as const;

// Card variants
export const cardVariants = {
  default:
    "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700",
  elevated: "bg-white dark:bg-gray-900 shadow-lg",
  outlined: "bg-transparent border border-gray-300 dark:border-gray-600",
} as const;

// Card padding
export const cardPadding = {
  none: "p-0",
  sm: "p-3",
  md: "p-4",
  lg: "p-6",
} as const;

// Heading sizes
export const headingSizes = {
  h1: "text-4xl font-bold",
  h2: "text-3xl font-bold",
  h3: "text-2xl font-semibold",
  h4: "text-xl font-semibold",
  h5: "text-lg font-medium",
  h6: "text-base font-medium",
} as const;

// Text sizes
export const textSizes = {
  xs: "text-xs",
  sm: "text-sm",
  base: "text-base",
  lg: "text-lg",
  xl: "text-xl",
} as const;

// Text colors
export const textColors = {
  default: "text-gray-900 dark:text-gray-100",
  muted: "text-gray-500 dark:text-gray-400",
  primary: "text-blue-600 dark:text-blue-400",
  success: "text-green-600 dark:text-green-400",
  warning: "text-yellow-600 dark:text-yellow-400",
  danger: "text-red-600 dark:text-red-400",
} as const;

// Stack/layout gaps
export const gapSizes = {
  none: "gap-0",
  xs: "gap-1",
  sm: "gap-2",
  md: "gap-4",
  lg: "gap-6",
  xl: "gap-8",
} as const;

// Container max widths
export const containerSizes = {
  sm: "max-w-screen-sm",
  md: "max-w-screen-md",
  lg: "max-w-screen-lg",
  xl: "max-w-screen-xl",
  full: "max-w-full",
} as const;

// Spinner sizes
export const spinnerSizes = {
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-8 w-8",
  xl: "h-12 w-12",
} as const;

// Avatar sizes
export const avatarSizes = {
  xs: "h-6 w-6 text-xs",
  sm: "h-8 w-8 text-sm",
  md: "h-10 w-10 text-base",
  lg: "h-12 w-12 text-lg",
  xl: "h-16 w-16 text-xl",
} as const;

// Progress sizes
export const progressSizes = {
  sm: "h-1",
  md: "h-2",
  lg: "h-3",
} as const;

// Progress colors
export const progressColors = {
  default: "bg-gray-600 dark:bg-gray-400",
  primary: "bg-blue-600 dark:bg-blue-400",
  success: "bg-green-600 dark:bg-green-400",
  warning: "bg-yellow-600 dark:bg-yellow-400",
  danger: "bg-red-600 dark:bg-red-400",
} as const;

export const buttonVariants = {
  primary:
    "bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed",
  secondary:
    "border border-solid border-black/[.08] dark:border-white/[.145] hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent",
  danger: "bg-red-500 text-white hover:bg-red-600",
  success: "bg-green-600 text-white hover:bg-green-700",
  ghost:
    "border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800",
  link: "text-blue-600 dark:text-blue-400 hover:underline",
} as const;

export const buttonSizes = {
  sm: "px-3 py-1 text-sm",
  md: "px-4 py-2 text-sm sm:text-base",
  lg: "px-6 py-3 text-base sm:text-lg",
} as const;
