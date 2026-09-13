"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useSession } from "next-auth/react";

const DeveloperModeContext = createContext();

export function DeveloperModeProvider({ children }) {
    const { data: session } = useSession();
    const [isDeveloperMode, setIsDeveloperMode] = useState(false);
    const [isAuthorized, setIsAuthorized] = useState(false);

    // Check if user is authorized developer
    useEffect(() => {
        const checkAuthorization = async () => {
            if (!session?.user?.email) {
                setIsAuthorized(false);
                setIsDeveloperMode(false);
                return;
            }

            try {
                const response = await fetch("/api/check-developer");
                const data = await response.json();
                setIsAuthorized(data.isDeveloper);

                // Only load saved state if user is authorized
                if (data.isDeveloper) {
                    const saved = localStorage.getItem("developerMode");
                    if (saved === "true") {
                        setIsDeveloperMode(true);
                    }
                } else {
                    // Clear developer mode if not authorized
                    localStorage.removeItem("developerMode");
                    setIsDeveloperMode(false);
                }
            } catch (error) {
                console.error("Failed to check developer status:", error);
                setIsAuthorized(false);
                setIsDeveloperMode(false);
            }
        };

        checkAuthorization();
    }, [session]);

    const toggleDeveloperMode = async () => {
        if (!isAuthorized) {
            console.warn("Unauthorized attempt to toggle developer mode");
            return;
        }

        const newValue = !isDeveloperMode;
        setIsDeveloperMode(newValue);
        localStorage.setItem("developerMode", newValue.toString());

        // Reset daily usage when enabling developer mode
        if (newValue && session?.user?.email) {
            try {
                await fetch("/api/reset-usage", { method: "POST" });
                console.log("Daily usage reset for developer mode");
            } catch (error) {
                console.error("Failed to reset usage:", error);
            }
        }
    };

    return (
        <DeveloperModeContext.Provider value={{ isDeveloperMode, toggleDeveloperMode, isAuthorized }}>
            {children}
        </DeveloperModeContext.Provider>
    );
}

export function useDeveloperMode() {
    const context = useContext(DeveloperModeContext);
    if (!context) {
        throw new Error("useDeveloperMode must be used within DeveloperModeProvider");
    }
    return context;
}
