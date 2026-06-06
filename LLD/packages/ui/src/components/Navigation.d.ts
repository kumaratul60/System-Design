import React from "react";
import { translations } from "@statelab/theme";
export interface SidebarLinkConfig {
    path: string;
    labelKey?: keyof typeof translations.en;
    icon?: React.ComponentType<{
        size?: number;
    }>;
}
export interface NavigationProps {
    links: SidebarLinkConfig[];
}
export declare const Navigation: React.FC<NavigationProps>;
