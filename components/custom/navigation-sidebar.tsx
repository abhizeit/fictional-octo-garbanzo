"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import Link from "next/link";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useMenu } from "@/context/menu-context";
import { DynamicIcon } from "lucide-react/dynamic";
import {
  ChevronLeft,
  LayoutDashboard,
  Layers,
  Package,
  Settings,
  Tags,
  Users,
  Image as ImageIcon,
} from "lucide-react";
import type { TModule } from "@/common/types";
import { ThemeToggleSwitch } from "@/components/custom/theme-toggle-switch";

export function NavigationSidebar({ children }: { children: React.ReactNode }) {
  const {
    applicationMenuData,
    handleMainMenuClick,
    handleSubMenuClick,
    selectedMainMenu,
    selectedSubMenu,
    selectedSubMenuData,
  } = useMenu();

  const { toggleSidebar, state } = useSidebar();

  const navItems = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Categories",
      href: "/categories",
      icon: Layers,
    },
    {
      title: "Products",
      href: "/products",
      icon: Package,
    },
    {
      title: "Tags",
      href: "/tags",
      icon: Tags,
    },
    {
      title: "Users",
      href: "/users",
      icon: Users,
    },
    {
      title: "Settings",
      href: "/settings",
      icon: Settings,
    },
    {
      title: "Banners",
      href: "/banners",
      icon: ImageIcon,
    },
    {
      title: "Attributes",
      href: "/attributes",
      icon: Layers, // Assuming Layers icon for Attributes, adjust if needed
    },
  ];

  return (
    <div className="flex flex-row w-full h-full">
      <div className="flex flex-col left-0 top-0 z-20 w-(--navbar-width) sticky h-screen shrink-0 border-r border-border/50 bg-sidebar">
        <div className="flex flex-1 flex-col items-center gap-1 overflow-y-auto scrollbar-none px-1 py-1 min-h-0">
        {applicationMenuData
          ?.sort(
            (a: TModule, b: TModule) => (a?.sequence ?? 0) - (b?.sequence ?? 0),
          )
          ?.map((menu: TModule) => {
            const isActive = selectedMainMenu === menu.id;
            return (
              <Tooltip key={menu.id}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => handleMainMenuClick(menu)}
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-lg transition-all duration-200",
                      "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                      isActive
                        ? "text-sidebar-primary"
                        : "text-sidebar-foreground/70",
                    )}
                  >
                    <DynamicIcon name="box" className="h-5 w-5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={8}>
                  {menu.label}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
        <div className="flex shrink-0 flex-col items-center border-t border-sidebar-border py-3 px-1">
          <ThemeToggleSwitch />
        </div>
      </div>

      <div className="">
        <Sidebar
          collapsible="offcanvas"
          variant="sidebar"
          className="left-(--navbar-width)"
        >
          <SidebarContent className="scrollbar-none pb-20">
            {selectedSubMenuData
              ?.sort(
                (a: any, b: any) => (a?.sequence ?? 0) - (b?.sequence ?? 0),
              )
              ?.map((group: any) => {
                return (
                  <SidebarGroup key={group.id || group.label}>
                    <SidebarGroupLabel className="text-[11px] font-semibold uppercase tracking-wider text-sidebar-primary">
                      {group.label}
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                      <SidebarMenu>
                        {group?.sub_objects
                          ?.sort(
                            (a: any, b: any) =>
                              (a?.sequence ?? 0) - (b?.sequence ?? 0),
                          )
                          ?.map((menu: any) => {
                            return (
                              <SidebarMenuItem key={menu.id}>
                                <SidebarMenuButton
                                  onClick={() => {
                                    handleSubMenuClick(
                                      menu?.id as string,
                                      menu?.path as string,
                                    );
                                  }}
                                  isActive={selectedSubMenu === menu?.id}
                                  asChild
                                  className="h-9"
                                >
                                  <Link href={menu.path as string}>
                                    {menu.label as string}
                                  </Link>
                                </SidebarMenuButton>
                              </SidebarMenuItem>
                            );
                          })}
                      </SidebarMenu>
                    </SidebarGroupContent>
                  </SidebarGroup>
                );
              })}
          </SidebarContent>
          <SidebarRail />
        </Sidebar>
      </div>
      <div className="flex-1">{children}</div>
    </div>
  );
}
