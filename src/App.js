import { useEffect, useState } from "react";
import { BrowserRouter, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import "@/App.css";
import { Toaster } from "sonner";
import { useBatch } from "./hooks/useBatch";
import { ThemeProvider, useTheme } from "./hooks/useTheme";
import { Header } from "./components/terminal/Header";
import { PastePanel } from "./components/terminal/PastePanel";
import { ReviewStage } from "./components/terminal/ReviewStage";
import { PayStage } from "./components/terminal/PayStage";
import { QuickQr } from "./components/terminal/QuickQr";
import { SettingsDialog } from "./components/terminal/SettingsDialog";
import { PayPage } from "./components/terminal/PayPage";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { InfoModal } from "./components/terminal/InfoModal";
import { Footer } from "./components/common/Footer";

function TerminalContent() {
  const store = useBatch();
  const { theme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [infoModal, setInfoModal] = useState({ open: false, tab: "faq" });

  const openInfo = (tab = "faq") => setInfoModal({ open: true, tab });

  useEffect(() => {
    const path = (location.pathname || "").toLowerCase();
    const hash = (window.location.hash || "").toLowerCase();
    if (path === "/about" || hash.includes("#about")) setInfoModal({ open: true, tab: "about" });
    else if (path === "/faq" || hash.includes("#faq")) setInfoModal({ open: true, tab: "faq" });
    else if (path === "/privacy" || hash.includes("#privacy")) setInfoModal({ open: true, tab: "privacy" });
  }, [location]);

  const checkIsQuick = () => {
    const path = (location.pathname || "").toLowerCase();
    const hash = (window.location.hash || "").toLowerCase();
    return (
      path === "/quick" ||
      path === "/quickqr" ||
      hash.includes("quickqr") ||
      hash.endsWith("#quick") ||
      hash.includes("/quick")
    );
  };

  const [mode, setMode] = useState(() => (checkIsQuick() ? "quick" : "batch"));

  useEffect(() => {
    if (checkIsQuick()) {
      setMode("quick");
    }
  }, [location]);

  useEffect(() => {
    const handleHash = () => {
      if (checkIsQuick()) {
        setMode("quick");
      }
    };
    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, [location]);

  const handleModeChange = (newMode) => {
    setMode(newMode);
    if (newMode === "quick") {
      navigate("/quickqr");
    } else {
      navigate("/");
    }
  };

  const stage = !store.batch ? "paste" : store.batch.locked ? "pay" : "review";

  return (
    <div className="App grain relative min-h-screen">
      <Header
        stage={stage}
        mode={mode}
        onMode={handleModeChange}
        onSettings={() => setSettingsOpen(true)}
        onInfo={openInfo}
        onClear={store.clear}
        hasBatch={!!store.batch}
      />
      <main
        className="relative z-10 mx-auto max-w-[1440px] px-4 py-6 sm:px-6 sm:py-8 lg:px-10"
        id="main-content"
      >
        {mode === "quick" && <QuickQr />}
        {mode === "batch" && stage === "paste" && (
          <PastePanel
            draft={store.draft}
            setDraft={store.setDraft}
            onClean={store.clean}
            onImport={store.importSheet}
          />
        )}
        {mode === "batch" && stage === "review" && <ReviewStage store={store} />}
        {mode === "batch" && stage === "pay" && <PayStage store={store} />}
      </main>
      <Footer onInfo={openInfo} />
      <SettingsDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        settings={store.settings}
        onSave={store.setSettings}
      />
      <InfoModal
        open={infoModal.open}
        onOpenChange={(open) => setInfoModal((s) => ({ ...s, open }))}
        defaultTab={infoModal.tab}
      />
      <Toaster theme={theme} position="bottom-right" richColors />
    </div>
  );
}

function HashRedirect() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const hash = window.location.hash || "";
    if (hash.startsWith("#/pay/")) {
      const cleanPath = hash.replace(/^#/, "");
      navigate(cleanPath, { replace: true });
    } else if (hash === "#quickqr" || hash === "#/quickqr" || hash === "#quick" || hash === "#/quick") {
      navigate("/quickqr", { replace: true });
    }
  }, [location, navigate]);

  return null;
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <BrowserRouter>
          <HashRedirect />
          <Routes>
            {/* Clean shareable payment link: /pay/:upiId/:amount?/:desc? */}
            <Route path="/pay/:upiId" element={<PayPage />} />
            <Route path="/pay/:upiId/:amount" element={<PayPage />} />
            <Route path="/pay/:upiId/:amount/:desc" element={<PayPage />} />
            {/* Direct shortcut to Quick QR: /quickqr, /quick */}
            <Route path="/quickqr" element={<TerminalContent />} />
            <Route path="/quick" element={<TerminalContent />} />
            {/* Direct shortcuts to FAQ, About & Privacy */}
            <Route path="/about" element={<TerminalContent />} />
            <Route path="/faq" element={<TerminalContent />} />
            <Route path="/privacy" element={<TerminalContent />} />
            {/* Main terminal app */}
            <Route path="*" element={<TerminalContent />} />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
