"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
export function ThemeButton() {
  const { setTheme, theme } = useTheme();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
  }, []);
  if (!isMounted) return;

  return (
    <Button
      onClick={() => setTheme(() => (theme === "dark" ? "light" : "dark"))}
      variant="ghost"
      className={"text-primary"}
      size="icon"
    >
      {theme === "dark" ? <Moon className="" /> : <Sun className="" />}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
