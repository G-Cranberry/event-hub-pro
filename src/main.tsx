import '@vly-ai/integrations';
import '@/components/orbit/theme.css';
import '@/components/orbit/card-carousel.css';
import { Toaster } from "@/components/ui/sonner";
import { RequireAuth } from "@/components/RequireAuth";
import { VlyToolbar } from "../vly-toolbar-readonly.tsx";
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { ConvexReactClient } from "convex/react";
import { AppShell } from "@/components/orbit/AppShell";
import React, { StrictMode, useEffect, lazy, Suspense } from "react";
import { Navigate } from "react-router";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes, useLocation } from "react-router";
import "./index.css";

// Lazy load route components for better code splitting
const Landing = lazy(() => import("./pages/Landing.tsx"));
const AuthPage = lazy(() => import("./pages/Auth.tsx"));
const Home = lazy(() => import("./pages/Home.tsx"));
const Events = lazy(() => import("./pages/Events.tsx"));
const EventDetails = lazy(() => import("./pages/EventDetails.tsx"));
const Transport = lazy(() => import("./pages/Transport.tsx"));
const Gallery = lazy(() => import("./pages/Gallery.tsx"));
const Passes = lazy(() => import("./pages/Passes.tsx"));
const Certificates = lazy(() => import("./pages/Certificates.tsx"));
const OrgEvents = lazy(() => import("./pages/OrgEvents.tsx"));
const NewEvent = lazy(() => import("./pages/NewEvent.tsx"));
const OrgEventHub = lazy(() => import("./pages/OrgEventHub.tsx"));
const OrgLive = lazy(() => import("./pages/OrgLive.tsx"));
const OrgScanner = lazy(() => import("./pages/OrgScanner.tsx"));
const OrgFormBuilder = lazy(() => import("./pages/OrgFormBuilder.tsx"));
const OrgCertificate = lazy(() => import("./pages/OrgCertificate.tsx"));
const OrgGallery = lazy(() => import("./pages/OrgGallery.tsx"));
const OrgBudget = lazy(() => import("./pages/OrgBudget.tsx"));
const OrgCommunication = lazy(() => import("./pages/OrgCommunication.tsx"));
const OrgFeedback = lazy(() => import("./pages/OrgFeedback.tsx"));
const Profile = lazy(() => import("./pages/Profile.tsx"));
const NotFound = lazy(() => import("./pages/NotFound.tsx"));

// Simple loading fallback for route transitions
function RouteLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-pulse text-muted-foreground">Loading...</div>
    </div>
  );
}

/** Silent error boundary — if VlyToolbar crashes it renders nothing instead of
 *  crashing the whole app (e.g. hook errors in WebContainer environment). */
class ToolbarErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(err: Error) {
    console.warn("[VlyToolbar] Caught error, toolbar disabled:", err.message);
  }
  render() {
    return this.state.hasError ? null : this.props.children;
  }
}

/** Hard guard so runtime errors never leave the preview as a blank page. */
class RootErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; message: string; stack: string }
> {
  state = { hasError: false, message: "", stack: "" };
  static getDerivedStateFromError(error: Error) {
    return {
      hasError: true,
      message: error.message || "Unknown runtime error",
      stack: error.stack || "",
    };
  }
  componentDidCatch(err: Error) {
    console.error("[WebContainer preview] Root crash:", err);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background text-foreground p-6">
          <div className="max-w-lg text-center">
            <p className="text-sm font-semibold">Preview runtime error</p>
            <p className="mt-2 text-xs text-muted-foreground break-words">
              {this.state.message}
            </p>
            {this.state.stack && (
              <pre className="mt-3 text-left text-[10px] leading-4 text-muted-foreground/80 max-h-40 overflow-auto rounded border border-border/60 p-2">
                {this.state.stack}
              </pre>
            )}
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string);



function RouteSyncer() {
  const location = useLocation();
  useEffect(() => {
    window.parent.postMessage(
      { type: "iframe-route-change", path: location.pathname },
      "*",
    );
  }, [location.pathname]);

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.data?.type === "navigate") {
        if (event.data.direction === "back") window.history.back();
        if (event.data.direction === "forward") window.history.forward();
      }
    }
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  return null;
}


createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RootErrorBoundary>
      <ToolbarErrorBoundary>
        <VlyToolbar />
      </ToolbarErrorBoundary>
      <ConvexAuthProvider client={convex}>
        <BrowserRouter>
          <RouteSyncer />
          <Suspense fallback={<RouteLoading />}>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route
                path="/auth"
                element={<AuthPage redirectAfterAuth="/home" />}
              />

              {/* Authenticated product pages — AppShell provides the wheel nav */}
              <Route
                path="/home"
                element={
                  <RequireAuth>
                    <AppShell>
                      <Home />
                    </AppShell>
                  </RequireAuth>
                }
              />

              {/* Participant */}
              <Route
                path="/events"
                element={
                  <RequireAuth>
                    <AppShell>
                      <Events />
                    </AppShell>
                  </RequireAuth>
                }
              />
              <Route
                path="/events/:id/transport"
                element={
                  <RequireAuth>
                    <AppShell>
                      <Transport />
                    </AppShell>
                  </RequireAuth>
                }
              />
              <Route
                path="/events/:id/gallery"
                element={
                  <RequireAuth>
                    <AppShell>
                      <Gallery />
                    </AppShell>
                  </RequireAuth>
                }
              />
              <Route
                path="/events/:id"
                element={
                  <RequireAuth>
                    <AppShell>
                      <EventDetails />
                    </AppShell>
                  </RequireAuth>
                }
              />
              <Route
                path="/passes"
                element={
                  <RequireAuth>
                    <AppShell>
                      <Passes />
                    </AppShell>
                  </RequireAuth>
                }
              />
              <Route
                path="/certificates"
                element={
                  <RequireAuth>
                    <AppShell>
                      <Certificates />
                    </AppShell>
                  </RequireAuth>
                }
              />

              {/* Organizer */}
              <Route
                path="/org/events/new"
                element={
                  <RequireAuth>
                    <AppShell>
                      <NewEvent />
                    </AppShell>
                  </RequireAuth>
                }
              />
              <Route
                path="/org/events"
                element={
                  <RequireAuth>
                    <AppShell>
                      <OrgEvents />
                    </AppShell>
                  </RequireAuth>
                }
              />
              <Route
                path="/org/events/:id/live"
                element={
                  <RequireAuth>
                    <AppShell>
                      <OrgLive />
                    </AppShell>
                  </RequireAuth>
                }
              />
              <Route
                path="/org/events/:id/scanner"
                element={
                  <RequireAuth>
                    <AppShell>
                      <OrgScanner />
                    </AppShell>
                  </RequireAuth>
                }
              />
              <Route
                path="/org/events/:id/form"
                element={
                  <RequireAuth>
                    <AppShell>
                      <OrgFormBuilder />
                    </AppShell>
                  </RequireAuth>
                }
              />
              <Route
                path="/org/events/:id/certificate"
                element={
                  <RequireAuth>
                    <AppShell>
                      <OrgCertificate />
                    </AppShell>
                  </RequireAuth>
                }
              />
              <Route
                path="/org/events/:id/gallery"
                element={
                  <RequireAuth>
                    <AppShell>
                      <OrgGallery />
                    </AppShell>
                  </RequireAuth>
                }
              />
              <Route
                path="/org/events/:id/budget"
                element={
                  <RequireAuth>
                    <AppShell>
                      <OrgBudget />
                    </AppShell>
                  </RequireAuth>
                }
              />
              <Route
                path="/org/events/:id/communication"
                element={
                  <RequireAuth>
                    <AppShell>
                      <OrgCommunication />
                    </AppShell>
                  </RequireAuth>
                }
              />
              <Route
                path="/org/events/:id/feedback"
                element={
                  <RequireAuth>
                    <AppShell>
                      <OrgFeedback />
                    </AppShell>
                  </RequireAuth>
                }
              />
              <Route
                path="/org/events/:id"
                element={
                  <RequireAuth>
                    <AppShell>
                      <OrgEventHub />
                    </AppShell>
                  </RequireAuth>
                }
              />

              {/* Legacy dashboard redirects into the role-aware home */}              <Route
                path="/profile"
                element={
                  <RequireAuth>
                    <AppShell>
                      <Profile />
                    </AppShell>
                  </RequireAuth>
                }
              />
              <Route
                path="/dashboard"
                element={<Navigate to="/home" replace />}
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
        <Toaster />
      </ConvexAuthProvider>
    </RootErrorBoundary>
  </StrictMode>,
);
