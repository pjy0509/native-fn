import React from "react";
import { ThemeProvider } from "styled-components";
import Native from "native-fn";
import { darkTheme, lightTheme } from "./theme";

type AppearanceType = typeof Native.appearance.Constants.Appearances.Dark | typeof Native.appearance.Constants.Appearances.Light;

interface AppThemeProviderProps {
    children: React.ReactNode;
}

export interface ThemeContextValue {
    setTheme: (theme: AppearanceType | null) => void;
    isDark: boolean;
}

export const AppThemeContext: React.Context<ThemeContextValue> = React.createContext<ThemeContextValue>({
    setTheme: () => {},
    isDark: false,
});

const STORAGE_KEY = "app:theme";

export default function AppThemeProvider({ children }: AppThemeProviderProps): React.JSX.Element {
    const [systemIsDark, setSystemIsDark]: [boolean, React.Dispatch<React.SetStateAction<boolean>>] = React.useState<boolean>(Native.appearance.value === Native.appearance.Constants.Appearances.Dark);
    const [manualTheme, setManualTheme]: [AppearanceType | null, React.Dispatch<React.SetStateAction<AppearanceType | null>>] = React.useState<AppearanceType | null>(() => {
        try {
            const saved: string | null = localStorage.getItem(STORAGE_KEY);

            if (saved === Native.appearance.Constants.Appearances.Dark) return Native.appearance.Constants.Appearances.Dark;
            if (saved === Native.appearance.Constants.Appearances.Light) return Native.appearance.Constants.Appearances.Light;

            return null;
        } catch (_) {
            return null;
        }
    });

    React.useEffect((): (() => void) => {
        return Native.appearance.onChange((): void => {
            setSystemIsDark(
                Native.appearance.value === Native.appearance.Constants.Appearances.Dark
            );
        });
    }, []);

    const setTheme: (theme: (AppearanceType | null)) => void = React.useCallback((theme: AppearanceType | null): void => {
        try {
            if (theme === null) localStorage.removeItem(STORAGE_KEY);
            else localStorage.setItem(STORAGE_KEY, theme);
        } catch (_) {
        }
        setManualTheme(theme);
    }, []);

    const isDark: boolean = manualTheme !== null
        ? manualTheme === Native.appearance.Constants.Appearances.Dark
        : systemIsDark;

    const contextValue: ThemeContextValue = {
        setTheme,
        isDark,
    };

    return (
        <AppThemeContext.Provider value={contextValue}>
            <ThemeProvider theme={isDark ? darkTheme : lightTheme}>
                {children}
            </ThemeProvider>
        </AppThemeContext.Provider>
    );
}
