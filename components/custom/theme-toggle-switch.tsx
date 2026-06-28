"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

type ThemeToggleSwitchProps = {
  className?: string;
  showLabels?: boolean;
};

export function ThemeToggleSwitch({
  className,
  showLabels = false,
}: ThemeToggleSwitchProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";

  const toggle = (checked: boolean) => {
    setTheme(checked ? "dark" : "light");
  };

  if (!mounted) {
    return (
      <div
        className={cn(
          "flex items-center gap-2 opacity-0 pointer-events-none",
          className,
        )}
        aria-hidden
      >
        <Sun className="size-4 shrink-0 text-muted-foreground" />
        <Switch disabled size="sm" />
        <Moon className="size-4 shrink-0 text-muted-foreground" />
      </div>
    );
  }

  const control = (
    <div
      className={cn(
        "flex items-center gap-2",
        showLabels ? "gap-3" : "gap-1.5",
        className,
      )}
    >
      <Sun
        className={cn(
          "size-4 shrink-0 transition-colors",
          !isDark ? "text-foreground" : "text-muted-foreground",
        )}
        aria-hidden
      />
      <Switch
        checked={isDark}
        onCheckedChange={toggle}
        size="sm"
        aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      />
      <Moon
        className={cn(
          "size-4 shrink-0 transition-colors",
          isDark ? "text-foreground" : "text-muted-foreground",
        )}
        aria-hidden
      />
    </div>
  );

  if (showLabels) {
    return (
      <div className="flex flex-col gap-1">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Theme
        </span>
        {control}
      </div>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>{control}</TooltipTrigger>
      <TooltipContent side="right" sideOffset={8}>
        {isDark ? "Light mode" : "Dark mode"}
      </TooltipContent>
    </Tooltip>
  );
}
