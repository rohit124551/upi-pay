/**
 * Reusable Global Footer for UPI Pay
 *
 * Appears consistently across every page:
 *  - Batch Payout (Paste, Review, Pay)
 *  - Quick QR (/quickqr)
 *  - Shareable Payment Landing (/pay/:upiId/:amount?/:desc?)
 *
 * Includes:
 *  - Privacy tagline (zero backend servers)
 *  - Direct links to About & NPCI Disclaimers, FAQ, and Privacy & Terms
 *  - Author attribution: "Built with ❤️ by Rohit Kumar Ranjan - GitHub"
 */
import React from "react";
import { Github } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const Footer = ({ onInfo, className = "" }) => {
  const navigate = useNavigate();

  const handleInfo = (tab) => {
    if (typeof onInfo === "function") {
      onInfo(tab);
    } else {
      navigate(`/${tab}`);
    }
  };

  return (
    <footer
      className={`relative z-10 border-t border-border/60 py-5 text-center text-xs text-muted-foreground px-4 space-y-1.5 ${className}`}
      role="contentinfo"
    >
      {/* 1. Privacy Tagline */}
      <p className="flex items-center justify-center gap-1.5 flex-wrap text-muted-foreground text-xs leading-normal">
        <span>Open source client-side payment tool • zero backend servers</span>
      </p>

      {/* 2. NPCI Terms, FAQ, Privacy Links */}
      <p className="flex items-center justify-center gap-2 text-[11px] text-muted-foreground/80 flex-wrap">
        <button
          type="button"
          onClick={() => handleInfo("about")}
          className="hover:underline hover:text-foreground transition-colors cursor-pointer"
        >
          About & NPCI
        </button>
        <span>•</span>
        <button
          type="button"
          onClick={() => handleInfo("faq")}
          className="hover:underline hover:text-foreground transition-colors cursor-pointer"
        >
          FAQ
        </button>
        <span>•</span>
        <button
          type="button"
          onClick={() => handleInfo("privacy")}
          className="hover:underline hover:text-foreground transition-colors cursor-pointer"
        >
          Privacy & Terms
        </button>
      </p>

      {/* 3. Maintainer Credit & GitHub */}
      <p className="mt-0.5 text-[11px] opacity-80 flex items-center justify-center gap-1.5 flex-wrap leading-normal text-muted-foreground">
        <span>Built with ❤️ by</span>
        <a
          href="https://rohitkumarranjan.in"
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-foreground hover:text-emerald-500 underline underline-offset-2 transition-colors"
        >
          Rohit Kumar Ranjan
        </a>
        <span>-</span>
        <a
          href="https://github.com/rohit124551/upi-pay"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:underline transition-colors text-emerald-600 dark:text-emerald-400 inline-flex items-center gap-1 font-medium"
        >
          <Github className="h-3 w-3 shrink-0" />
          <span>GitHub</span>
        </a>
        <span>•</span>
        <span>MIT License</span>
      </p>
    </footer>
  );
};

export default Footer;
