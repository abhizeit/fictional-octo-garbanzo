"use client";

import { type TModule, type TObject, type TSubObject } from "@/common/types";
import { APP_MENU } from "@/constants/app-menu";
import { usePathname, useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

// ============================================================================
// Types
// ============================================================================

interface MenuContextValue {
  /** Currently selected main menu ID */
  selectedMainMenu: string | undefined;
  /** Currently selected sub menu ID */
  selectedSubMenu: string | undefined;
  /** Handler for main menu selection */
  handleMainMenuClick: (
    menu: TModule,
    absolutePath?: string,
    subMenuItem?: TSubObject,
  ) => void;
  /** Handler for sub menu selection */
  handleSubMenuClick: (id: string, path?: string) => void;
  /** Sub menu data for the currently selected main menu */
  selectedSubMenuData: TObject[] | undefined;
  /** Complete application menu structure */
  applicationMenuData: TModule[];
}

interface MenuContextProviderProps {
  children: ReactNode;
}

// ============================================================================
// Context
// ============================================================================

const MenuContext = createContext<MenuContextValue | undefined>(undefined);

MenuContext.displayName = "MenuContext";

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Finds a submenu item by its path across the entire menu structure
 */
function findSubMenuByPath(
  menuList: TModule[],
  targetPath: string,
): { menu: TModule; group: TObject; item: TSubObject } | null {
  for (const menu of menuList) {
    const objects = menu.objects;
    if (!objects) continue;

    for (const group of objects) {
      const subObjects = group.sub_objects;
      if (!subObjects) continue;

      for (const item of subObjects) {
        if (item.path === targetPath) {
          return { menu, group, item };
        }
      }
    }
  }
  return null;
}

/**
 * Finds a submenu item by matching path segments (for dynamic routes)
 * Example: /position/manager/123 matches /position/manager/456
 */
function findSubMenuByPathSegments(
  menuList: TModule[],
  currentPath: string,
): { menu: TModule; group: TObject; item: TSubObject } | null {
  const currentPathParts = currentPath.split("/").filter(Boolean);

  for (const menu of menuList) {
    const objects = menu.objects;
    if (!objects) continue;

    for (const group of objects) {
      const subObjects = group.sub_objects;
      if (!subObjects) continue;

      for (const item of subObjects) {
        const itemPath = item.path;
        if (!itemPath) continue;

        const itemPathParts = itemPath.split("/").filter(Boolean);

        // Must have same length and at least one segment
        if (
          itemPathParts.length !== currentPathParts.length ||
          itemPathParts.length === 0
        ) {
          continue;
        }

        // Compare all segments except the last (assume last is dynamic ID)
        const segmentsToCompare = itemPathParts.slice(0, -1);
        const currentSegmentsToCompare = currentPathParts.slice(0, -1);

        const matches = segmentsToCompare.every(
          (part, index) => part === currentSegmentsToCompare[index],
        );

        if (matches) {
          return { menu, group, item };
        }
      }
    }
  }
  return null;
}

/**
 * Finds a submenu item by ID
 */
function findSubMenuById(
  menuList: TModule[],
  id: string,
): { menu: TModule; group: TObject; item: TSubObject } | null {
  for (const menu of menuList) {
    const objects = menu.objects;
    if (!objects) continue;

    for (const group of objects) {
      const subObjects = group.sub_objects;
      if (!subObjects) continue;

      for (const item of subObjects) {
        if (item.id === id) {
          return { menu, group, item };
        }
      }
    }
  }
  return null;
}

/**
 * Gets the first navigable submenu item from a menu
 */
function getFirstSubMenuItem(menu: TModule): TSubObject | null {
  const firstObject = menu.objects?.[0];
  const firstSubObject = firstObject?.sub_objects?.[0];
  return firstSubObject ?? null;
}

// ============================================================================
// Provider Component
// ============================================================================

/**
 * MenuContextProvider manages the application menu state and navigation logic.
 * It automatically syncs with the current route and provides handlers for menu interactions.
 */
export function MenuContextProvider({ children }: MenuContextProviderProps) {
  const router = useRouter();
  const pathname = usePathname();

  // State
  const [selectedMainMenu, setSelectedMainMenu] = useState<string>();
  const [selectedSubMenu, setSelectedSubMenu] = useState<string>();
  const [selectedSubMenuData, setSelectedSubMenuData] = useState<TObject[]>();

  // Menu data is memoized to prevent unnecessary re-renders
  const applicationMenuData = useMemo(() => APP_MENU, []);

  /**
   * Handles main menu selection and navigation
   */
  const handleMainMenuClick = useCallback(
    (menu: TModule, absolutePath?: string, subMenuItem?: TSubObject) => {
      // Update selected main menu and its submenu data
      if (menu.id) {
        setSelectedMainMenu(menu.id);
      }
      if (menu.objects) {
        setSelectedSubMenuData(menu.objects);
      }

      // Determine which submenu to navigate to
      const targetSubMenuItem = subMenuItem ?? getFirstSubMenuItem(menu);

      // Navigate to the appropriate path
      if (absolutePath) {
        router.push(absolutePath);
      } else if (targetSubMenuItem?.path) {
        router.push(targetSubMenuItem.path);
      }

      // Update selected submenu
      if (targetSubMenuItem?.id) {
        setSelectedSubMenu(targetSubMenuItem.id);
      }
    },
    [router],
  );

  /**
   * Handles sub menu selection and ensures parent menu is synced
   */
  const handleSubMenuClick = useCallback(
    (id: string, path?: string) => {
      setSelectedSubMenu(id);

      // Find the parent main menu for this submenu item
      const result = findSubMenuById(applicationMenuData, id);

      if (result) {
        const { menu } = result;
        // Ensure the parent main menu is selected
        if (menu.id && selectedMainMenu !== menu.id) {
          setSelectedMainMenu(menu.id);
          if (menu.objects) {
            setSelectedSubMenuData(menu.objects);
          }
        }
      }

      // Navigate if path is provided
      if (path) {
        router.push(path);
      }
    },
    [applicationMenuData, selectedMainMenu, router],
  );

  /**
   * Syncs menu selection with the current pathname
   * This runs on mount and whenever the pathname changes
   */
  useEffect(() => {
    if (!pathname || applicationMenuData.length === 0) {
      return;
    }

    // Try exact path match first
    let result = findSubMenuByPath(applicationMenuData, pathname);

    // If no exact match, try dynamic route matching
    if (!result) {
      result = findSubMenuByPathSegments(applicationMenuData, pathname);
    }

    if (result) {
      const { menu, item } = result;

      // Update menu selection state
      if (menu.id) {
        setSelectedMainMenu(menu.id);
      }
      if (menu.objects) {
        setSelectedSubMenuData(menu.objects);
      }
      if (item.id) {
        setSelectedSubMenu(item.id);
      }
    } else {
      // No match found - select first menu as fallback
      const firstMenu = applicationMenuData[0];
      if (firstMenu) {
        if (firstMenu.id) {
          setSelectedMainMenu(firstMenu.id);
        }
        if (firstMenu.objects) {
          setSelectedSubMenuData(firstMenu.objects);
        }

        const firstSubItem = getFirstSubMenuItem(firstMenu);
        if (firstSubItem?.id) {
          setSelectedSubMenu(firstSubItem.id);
        }
      }
    }
  }, [pathname, applicationMenuData]);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo<MenuContextValue>(
    () => ({
      selectedMainMenu,
      selectedSubMenu,
      handleMainMenuClick,
      handleSubMenuClick,
      selectedSubMenuData,
      applicationMenuData,
    }),
    [
      selectedMainMenu,
      selectedSubMenu,
      handleMainMenuClick,
      handleSubMenuClick,
      selectedSubMenuData,
      applicationMenuData,
    ],
  );

  return (
    <MenuContext.Provider value={contextValue}>{children}</MenuContext.Provider>
  );
}

// ============================================================================
// Hook
// ============================================================================

/**
 * Hook to access the menu context.
 * Must be used within a MenuContextProvider.
 *
 * @throws {Error} If used outside of MenuContextProvider
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { selectedMainMenu, handleMainMenuClick } = useMenu();
 *   // ...
 * }
 * ```
 */
export function useMenu(): MenuContextValue {
  const context = useContext(MenuContext);

  if (context === undefined) {
    throw new Error("useMenu must be used within a MenuContextProvider");
  }

  return context;
}
