import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Index from "./pages/Index";
import MapDemo from "./pages/MapDemo";
import LatestUpdatesPage from "./pages/LatestUpdatesPage";
import ArticleDetailPage from "./pages/ArticleDetailPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Scrolls to top on every route change.
// LatestUpdatesPage overrides this with its own scroll-restoration logic
// (it waits for articles to load before restoring the saved position).
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);
  return null;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/map-demo" element={<MapDemo />} />
          <Route path="/latest-updates" element={<LatestUpdatesPage />} />
          <Route path="/article" element={<ArticleDetailPage />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
