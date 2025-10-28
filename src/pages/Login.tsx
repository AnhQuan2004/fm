import { FormEvent, useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { config } from "@/config/env";
import { useNavigate, Link } from "react-router-dom";
import type { UserProfile } from "@/types/profile";
import { storeSessionProfile, clearSessionProfile } from "@/lib/profile-storage";
import { jwtDecode } from "jwt-decode";
import logoSrc from "@/assets/logo.png";



type GoogleCredentialResponse = {
  credential?: string;
};

type GoogleInitializeOptions = {
  client_id: string;
  callback: (response: GoogleCredentialResponse) => void;
};

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (options: GoogleInitializeOptions) => void;
          renderButton: (element: HTMLElement | null, options: Record<string, unknown>) => void;
        };
      };
    };
  }
}



type GoogleCredentialResponse = {
  credential?: string;
};

type GoogleInitializeOptions = {
  client_id: string;
  callback: (response: GoogleCredentialResponse) => void;
};

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (options: GoogleInitializeOptions) => void;
          renderButton: (element: HTMLElement | null, options: Record<string, unknown>) => void;
        };
      };
    };
  }
}

const asUserRole = (value: unknown): UserProfile["role"] => {
  if (value === "admin" || value === "partner" || value === "user") {
    return value;
  }
  return undefined;
};

const Login = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const handlePostAuthRouting = useCallback(
    async (emailAddress: string) => {
      sessionStorage.setItem("userEmail", emailAddress);
      clearSessionProfile();

      let hydratedProfile: UserProfile | null = null;

      try {
        const response = await fetch(
          `${config.authApiBaseUrl}/profile?email=${encodeURIComponent(emailAddress)}`,
        );

        if (response.ok) {
          const data = await response.json().catch(() => ({}));
          const profile = data?.profile ?? data?.user ?? data;

          hydratedProfile = {
            email: profile?.email ?? emailAddress,
            username: profile?.username ?? "",
            firstName: profile?.firstName ?? "",
            lastName: profile?.lastName ?? "",
            location: profile?.location ?? "",
            skills: Array.isArray(profile?.skills) ? profile.skills : [],
            socials: profile?.socials ?? "",
            github: profile?.github ?? "",
            displayName: profile?.displayName ?? "",
            bio: profile?.bio ?? "",
            updatedAt: profile?.updatedAt,
            role: asUserRole(profile?.role),
          };

          storeSessionProfile(hydratedProfile);

          const hasCompletedProfile =
            Boolean(hydratedProfile.username) && Boolean(hydratedProfile.displayName) && Boolean(hydratedProfile.bio);

          if (hasCompletedProfile) {
            navigate("/dashboard", { replace: true });
            return;
          }
        }
      } catch (error) {
        console.error("Failed to lookup profile", error);
      }

      const profileForSetup: UserProfile =
        hydratedProfile ?? {
          email: emailAddress,
          username: "",
          firstName: "",
          lastName: "",
          location: "",
          skills: [],
          socials: "",
          github: "",
          displayName: "",
          bio: "",
          role: "user",
        };

      if (!hydratedProfile) {
        storeSessionProfile(profileForSetup);
      }

      navigate("/profile-setup", { replace: true, state: { email: emailAddress, profile: profileForSetup } });
    },
    [navigate],
  );

  const handleCredentialResponse = useCallback(
    (response: GoogleCredentialResponse) => {
      if (!response?.credential) {
        toast({
          title: "Google sign-in failed",
          description: "Không đọc được thông tin đăng nhập.",
          variant: "destructive",
        });
        return;
      }

      try {
        const decoded: { email?: string } = jwtDecode(response.credential);
        if (!decoded?.email) {
          throw new Error("Email not found in token");
        }
        handlePostAuthRouting(decoded.email);
      } catch (error) {
        console.error(error);
        toast({
          title: "Google sign-in failed",
          description: "Không thể xác thực từ Google token.",
          variant: "destructive",
        });
      }
    },
    [handlePostAuthRouting, toast],
  );

  useEffect(() => {
    const google = window.google;
    if (google) {
      google.accounts.id.initialize({
        client_id: config.googleClientId,
        callback: handleCredentialResponse,
      });
      google.accounts.id.renderButton(document.getElementById("loginGoogleButton"), {
        type: "standard",
        theme: "outline",
        size: "large",
        shape: "pill",
        text: "signin_with",
        width: 320,
      });
    }
  }, [handleCredentialResponse]);


  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!email.trim()) {
      toast({
        title: "Email is required",
        description: "Nhập email để chúng tôi gửi mã OTP cho bạn.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`${config.authApiBaseUrl}/request-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (!response.ok || !data.ok) {
        throw new Error(data?.error || "Không thể gửi OTP. Vui lòng thử lại.");
      }

      sessionStorage.setItem("pendingEmail", email);
      sessionStorage.setItem("pendingTokenId", data.tokenId);

      toast({
        title: "OTP sent",
        description: "Kiểm tra email để lấy mã xác thực.",
      });

      navigate("/verify-code", { state: { email, tokenId: data.tokenId } });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Có lỗi xảy ra, vui lòng thử lại.";
      toast({
        title: "Failed to send OTP",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#FF0000] via-[#FF5A00] to-[#FFB800] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#FFEB00_0%,transparent_55%)] opacity-70" />
      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-10 px-6 py-12 sm:px-10">
        <header className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img src={logoSrc} alt="First Mover" className="h-12 w-auto" />
            <span className="text-sm font-semibold uppercase tracking-[0.3em] text-white/80">First Mover</span>
          </Link>
          <Button variant="ghost" className="text-white/80 hover:text-white" asChild>
            <Link to="/">Back to Home</Link>
          </Button>
        </header>

        <section className="flex flex-1 flex-col items-center justify-center">
          <Card className="w-full max-w-xl border border-white/10 bg-black/60 text-white backdrop-blur">
            <CardHeader className="space-y-2 text-center">
              <CardTitle className="text-3xl font-semibold">Welcome back</CardTitle>
              <CardDescription className="text-white/70">
                Nhập email của bạn để nhận mã OTP và đăng nhập vào cộng đồng builder.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label htmlFor="login-email" className="text-sm font-medium uppercase tracking-wide text-white/70">
                    Email
                  </label>
                  <Input
                    id="login-email"
                    type="email"
                    value={email}
                    onChange={event => setEmail(event.target.value)}
                    placeholder="you@sui.dev"
                    className="h-12 border-white/10 bg-white/5 text-white placeholder:text-white/40 focus-visible:ring-[#FFEB00]"
                  />
                </div>
                <Button
                  type="submit"
                  className="h-12 w-full rounded-full bg-[#FFEB00] text-base font-semibold text-black hover:bg-[#FCD200]"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Sending..." : "Send OTP"}
                </Button>
              </form>
              <div className="mt-6 flex flex-col items-center gap-3">
                <div className="relative flex w-full items-center">
                  <span className="flex-1 border-t border-white/10" />
                  <span className="px-3 text-xs uppercase tracking-[0.3em] text-white/60">OR</span>
                  <span className="flex-1 border-t border-white/10" />
                </div>
                <div id="loginGoogleButton" className="mt-2 flex w-full justify-center" />
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
};

export default Login;
