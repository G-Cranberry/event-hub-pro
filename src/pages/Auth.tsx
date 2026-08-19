import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

import { useAuth } from "@/hooks/use-auth";
import { ArrowRight, Loader2, Mail, Orbit, UserRound } from "lucide-react";
import { ParticleCanvas } from "@/components/orbit/ParticleCanvas";
import { Suspense, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";

interface AuthProps {
  redirectAfterAuth?: string;
}

function resolveRedirectAfterAuth(
  returnTo: string | null,
  fallback = "/dashboard",
) {
  if (returnTo?.startsWith("/") && !returnTo.startsWith("//")) {
    return returnTo;
  }
  return fallback;
}

function Auth({ redirectAfterAuth }: AuthProps = {}) {
  const { isLoading: authLoading, isAuthenticated, signIn } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = resolveRedirectAfterAuth(
    searchParams.get("returnTo"),
    redirectAfterAuth,
  );
  const [step, setStep] = useState<"signIn" | { email: string }>("signIn");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate(redirect);
    }
  }, [authLoading, isAuthenticated, navigate, redirect]);

  const handleEmailSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const formData = new FormData(event.currentTarget);
      await signIn("email-otp", formData);
      setStep({ email: formData.get("email") as string });
      setIsLoading(false);
    } catch (error) {
      console.error("Email sign-in error:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to send verification code. Please try again.",
      );
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const formData = new FormData(event.currentTarget);
      await signIn("email-otp", formData);

      console.log("signed in");

      navigate(redirect);
    } catch (error) {
      console.error("OTP verification error:", error);

      setError("The verification code you entered is incorrect.");
      setIsLoading(false);

      setOtp("");
    }
  };

  const handleGuestLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      console.log("Attempting anonymous sign in...");
      await signIn("anonymous");
      console.log("Anonymous sign in successful");
      navigate(redirect);
    } catch (error) {
      console.error("Guest login error:", error);
      console.error("Error details:", JSON.stringify(error, null, 2));
      setError(`Failed to sign in as guest: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setIsLoading(false);
    }
  };

  const inputClass =
    "h-11 rounded-xl border-ember/20 bg-black/30 text-white placeholder:text-white/35 transition-[border-color,box-shadow] focus-visible:border-ember/60 focus-visible:ring-2 focus-visible:ring-ember/25 focus-visible:shadow-[0_0_16px_-4px_rgba(255,92,56,0.3)]";

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden">
      {/* particle background */}
      <div className="pointer-events-none absolute inset-0">
        <ParticleCanvas count={40} color="ember" />
      </div>
      {/* ambient neon glows */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute -top-28 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-[radial-gradient(circle,oklch(0.74_0.16_50/0.18),transparent_70%)] blur-2xl" />
        <div className="absolute -bottom-24 -left-20 h-72 w-72 rounded-full bg-[radial-gradient(circle,oklch(0.68_0.16_300/0.16),transparent_70%)] blur-2xl" />
        <div className="absolute -right-24 top-1/3 h-72 w-72 rounded-full bg-[radial-gradient(circle,oklch(0.74_0.16_50/0.14),transparent_70%)] blur-2xl" />
      </div>
      {/* scan line overlay */}
      <div className="orb-scanlines pointer-events-none absolute inset-0 opacity-20" />

      {/* Auth content */}
      <div className="relative flex flex-1 items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <div className="orb-card orb-neon-border orb-hud-corners p-8 sm:p-10">
            {/* brand */}
            <div className="mb-8 flex flex-col items-center text-center">
              <button
                onClick={() => navigate("/")}
                className="orb-neon-border group flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-ember/15 to-[#0e0a16]/80 transition-transform hover:scale-105"
                aria-label="Back to home"
              >
                <Orbit className="h-7 w-7 text-ember transition-transform group-hover:rotate-45" />
              </button>
              <p className="mt-5 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] text-ember/80">
                <span className="orb-hud-blink h-1 w-1 rounded-full bg-ember" />
                Orbit · Event Portal
              </p>
              <h1 className="mt-2 font-display text-3xl font-bold text-white">
                {step === "signIn" ? "Enter the orbit" : "Check your email"}
              </h1>
              <p className="mt-1.5 text-sm leading-6 text-white/50">
                {step === "signIn"
                  ? "One account for every event — join as a participant, run events as an organizer."
                  : `We've sent a magic code to ${step.email}`}
              </p>
            </div>

            {step === "signIn" ? (
              <form onSubmit={handleEmailSubmit} className="space-y-5">
                <div>
                  <label
                    htmlFor="auth-email"
                    className="mb-1.5 block text-sm font-medium text-white/85"
                  >
                    Email address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gold/60" />
                    <Input
                      id="auth-email"
                      name="email"
                      placeholder="name@example.com"
                      type="email"
                      className={`${inputClass} pl-10`}
                      disabled={isLoading}
                      required
                    />
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-ember/40 to-transparent" />
                  </div>
                </div>

                {error && (
                  <p className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-red-300">
                    {error}
                  </p>
                )}

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="h-11 w-full gap-2 rounded-xl bg-ember font-bold text-[#160a04] hover:bg-ember/90"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Sending code…
                    </>
                  ) : (
                    <>
                      Continue
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-white/10" />
                  </div>
                  <div className="relative flex justify-center text-[10px] font-bold uppercase tracking-[0.25em] text-white/30">
                    <span className="bg-[#0e0a16] px-3">Or</span>
                  </div>
                </div>

                <Button
                  type="button"
                  onClick={handleGuestLogin}
                  disabled={isLoading}
                  className="h-11 w-full gap-2 rounded-xl border border-gold/30 bg-transparent font-semibold text-gold/90 hover:bg-gold/10 hover:text-gold"
                >
                  <UserRound className="h-4 w-4" />
                  Continue as guest
                </Button>
              </form>
            ) : (
              <form onSubmit={handleOtpSubmit} className="space-y-5">
                <input type="hidden" name="email" value={step.email} />
                <input type="hidden" name="code" value={otp} />

                <div className="flex justify-center">
                  <InputOTP
                    value={otp}
                    onChange={setOtp}
                    maxLength={6}
                    disabled={isLoading}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && otp.length === 6 && !isLoading) {
                        const form = (e.target as HTMLElement).closest("form");
                        if (form) {
                          form.requestSubmit();
                        }
                      }
                    }}
                  >
                    <InputOTPGroup className="gap-2">
                      {Array.from({ length: 6 }).map((_, index) => (
                        <InputOTPSlot
                          key={index}
                          index={index}
                          className="h-12 w-10 rounded-lg border-white/12 bg-black/25 text-base font-semibold text-white shadow-none data-[active=true]:border-ember/70 data-[active=true]:ring-2 data-[active=true]:ring-ember/25 first:rounded-l-lg first:border-l last:rounded-r-lg"
                        />
                      ))}
                    </InputOTPGroup>
                  </InputOTP>
                </div>

                {error && (
                  <p className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-red-300">
                    {error}
                  </p>
                )}

                <Button
                  type="submit"
                  disabled={isLoading || otp.length !== 6}
                  className="h-11 w-full gap-2 rounded-xl bg-ember font-bold text-[#160a04] hover:bg-ember/90"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Verifying…
                    </>
                  ) : (
                    <>
                      Verify code
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>

                <div className="flex items-center justify-center gap-4 text-xs">
                  <button
                    type="button"
                    onClick={() => setStep("signIn")}
                    disabled={isLoading}
                    className="font-semibold text-ember/80 hover:text-ember"
                  >
                    Use a different email
                  </button>
                  <span className="h-3 w-px bg-white/15" />
                  <button
                    type="button"
                    onClick={() => setStep("signIn")}
                    disabled={isLoading}
                    className="font-semibold text-white/40 hover:text-white/70"
                  >
                    Didn't get a code?
                  </button>
                </div>
              </form>
            )}
          </div>

          <p className="mt-6 text-center text-[11px] text-white/30">
            Secured by{" "}
            <a
              href="https://freebuff.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-gold/70 underline-offset-4 hover:text-gold hover:underline"
            >
              freebuff.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function AuthPage(props: AuthProps) {
  return (
    <Suspense>
      <Auth {...props} />
    </Suspense>
  );
}
