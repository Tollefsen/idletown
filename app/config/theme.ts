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
