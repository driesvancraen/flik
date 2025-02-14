import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface FooterProps {
  className?: string;
  variant?: "default" | "main";
}

export function Footer({ className, variant = "default" }: FooterProps) {
  return (
    <footer className={cn(
      "w-full py-2",
      variant === "default" ? "border-t border-border/40" : "bg-background/95",
      className
    )}>
      <div className={cn(
        "container flex items-center justify-center gap-2 opacity-70 transition-opacity hover:opacity-100",
        variant === "main" ? "opacity-50" : ""
      )}>
        <p className="text-xs text-muted-foreground">
          Powered by
        </p>
        <Link href="https://thomasmore.be/nl/expertisecentrum-duurzaam-ondernemen-en-digitale-innovatie" target="_blank" rel="noopener noreferrer">
          <Image
            src="/Thomas More-logo_ENG_oranje_liggend_WEB.png"
            alt="Thomas More University of Applied Sciences"
            width={100}
            height={25}
            className="h-auto"
          />
        </Link>
      </div>
    </footer>
  );
} 