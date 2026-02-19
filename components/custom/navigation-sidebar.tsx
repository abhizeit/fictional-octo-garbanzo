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
import { DynamicIcon, type IconName } from "lucide-react/dynamic";
import { ChevronLeft } from "lucide-react";
import type { TModule } from "@/common/types";

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

  return (
    <div className="flex flex-row w-full h-full">
      <div className="flex flex-col items-center gap-1 overflow-y-auto scrollbar-none left-0 top-0 z-20 w-(--navbar-width) sticky">
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
                    <DynamicIcon name="file" className="h-5 w-5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={8}>
                  {menu.label}
                </TooltipContent>
              </Tooltip>
            );
          })}
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
