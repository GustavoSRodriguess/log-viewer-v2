import { Moon, Sun } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";

export const ThemeToggle = () => {
    const { toggleTheme, isDarkMode } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="
                bg-white hover:bg-gray-100
                dark:bg-gray-800 dark:hover:bg-gray-700
                p-2 rounded-full
                transition-colors duration-200
            "
            title="Alternar tema"
        >
            {isDarkMode ? (
                <Sun className="w-5 h-5 text-yellow-500" />
            ) : (
                <Moon className="w-5 h-5 text-gray-700" />
            )}
        </button>
    );
};