import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  ReactNode,
} from "react";
import { ChessTheme, defaultTheme, themes, mergeThemes } from "../theme";

// Theme context type
interface ThemeContextType {
  theme: ChessTheme;
  setTheme: (theme: ChessTheme) => void;
  setThemeByName: (themeName: string) => void;
  mergeCustomTheme: (customTheme: Partial<ChessTheme>) => void;
}

// Create context with default values
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Theme provider props
interface ThemeProviderProps {
  initialTheme?: ChessTheme;
  children: ReactNode;
}

// Theme provider component
export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  initialTheme = defaultTheme,
  children,
}) => {
  const [theme, setTheme] = useState<ChessTheme>(initialTheme);

  // Sync internal theme state when the prop changes (e.g., Storybook controls)
  useEffect(() => {
    setTheme(initialTheme);
  }, [initialTheme]);

  // Set theme by name from presets - memoized to prevent unnecessary re-renders
  const setThemeByName = useCallback((themeName: string) => {
    const selectedTheme = themes[themeName];
    if (selectedTheme) {
      setTheme(selectedTheme);
    } else {
      console.warn(`Theme "${themeName}" not found. Using default theme.`);
      setTheme(defaultTheme);
    }
  }, []);

  // Merge custom theme with current theme - memoized with shallow comparison
  const mergeCustomTheme = useCallback((customTheme: Partial<ChessTheme>) => {
    setTheme((prevTheme) => mergeThemes(prevTheme, customTheme));
  }, []);

  // Memoize context value to prevent unnecessary re-renders of consumers
  const value = useMemo(
    () => ({
      theme,
      setTheme,
      setThemeByName,
      mergeCustomTheme,
    }),
    [theme, setThemeByName, mergeCustomTheme],
  );

  return React.createElement(ThemeContext.Provider, { value }, children);
};

// Custom hook to use theme context
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
