import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import heroBg from "@/assets/hero-bg.jpg";
import { useCallback, useEffect, useState } from "react";
import React from "react";
import { useNavigate } from "react-router-dom";
import { config } from "@/config/env";
import { jwtDecode } from "jwt-decode";
import { useToast } from "@/components/ui/use-toast";
import type { UserProfile } from "@/types/profile";
import { clearSessionProfile, storeSessionProfile } from "@/lib/profile-storage";

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

const HeroSection = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handlePostAuthRouting = useCallback(
    async (emailAddress: string) => {
      sessionStorage.setItem("userEmail", emailAddress);
      clearSessionProfile();

      let hydratedProfile: UserProfile | null = null;

      try {
        console.debug("[HeroSection] Fetching profile", {
          endpoint: `${config.authApiBaseUrl}/profile`,
          email: emailAddress,
        });
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
      } catch (error: unknown) {
        console.error("Failed to lookup profile", error);
      }

      const profileForSetup =
        hydratedProfile ??
        ({
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
        } satisfies UserProfile);

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

      const decoded: { email: string } = jwtDecode(response.credential);
      handlePostAuthRouting(decoded.email);
    },
    [handlePostAuthRouting, toast],
  );

  const handleGetStarted = async () => {
    if (!email) {
      toast({
        title: "Please enter your email",
        description: "Chúng tôi cần email của bạn để gửi mã xác thực.",
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
        title: "OTP has been sent",
        description: "Vui lòng kiểm tra email của bạn để lấy mã xác thực.",
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

  useEffect(() => {
    const google = window.google;
    if (google) {
      google.accounts.id.initialize({
        client_id: config.googleClientId,
        callback: handleCredentialResponse,
      });
      google.accounts.id.renderButton(document.getElementById("googleSignInButton"), {
        theme: "filled_black",
        size: "large",
        text: "signin_with",
        shape: "rectangular",
        width: 320,
      });
    }
  }, [handleCredentialResponse]);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ 
          backgroundImage: `url(${heroBg})`,
          filter: 'blur(2px) brightness(0.3)',
          opacity: 0.7
        }}
      />
      
      {/* Content */}
      <div className="relative z-10 w-full max-w-lg px-6 mx-auto">
        <div className="backdrop-blur-sm bg-black/70 p-12 rounded-2xl border border-white/10">
          {/* Logo/Title */}
          <h1 className="font-display text-5xl md:text-6xl font-bold text-foreground text-center mb-16 tracking-tight">
            FIRST MOVER<br />VIETNAM
          </h1>
          
          {/* Email Form */}
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="me@email.com"
                className="bg-black/50 border-white/20 text-white placeholder:text-gray-400 h-12 focus:ring-[#FF5722]"
              />
            </div>
            
            <Button 
              onClick={handleGetStarted}
              className="w-full h-12 bg-[#FF5722] hover:bg-[#FF5722]/90 text-white font-medium text-base transition-smooth"
              disabled={isSubmitting}
            >
              Get Started
            </Button>
          </div>
          
          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-border" />
            <span className="text-muted-foreground text-sm">OR</span>
            <div className="flex-1 h-px bg-border" />
          </div>
          
          {/* Social Login Buttons */}
          <div className="flex flex-col space-y-3">
            <div id="googleSignInButton" className="w-full flex justify-center"></div>
            
            <Button 
              variant="outline" 
              className="h-12 w-full bg-black border border-white/20 hover:bg-black/70 text-white transition-smooth flex items-center justify-center gap-2"
              onClick={() => navigate("/dashboard")}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              <span>Đăng nhập bằng X</span>
            </Button>
          </div>
          
          {/* Terms */}
          <p className="text-center text-xs text-muted-foreground mt-6">
            By clicking continue, you agree to our{' '}
            <a href="/terms" className="underline hover:text-foreground transition-smooth">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="/privacy" className="underline hover:text-foreground transition-smooth">
              Privacy Policy
            </a>
            .
          </p>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
