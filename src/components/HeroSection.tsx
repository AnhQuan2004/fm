import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import heroBg from "@/assets/hero-bg.jpg";
import { useEffect, useState } from "react";
import React from "react";
import { useNavigate } from "react-router-dom";
import { config } from "@/config/env";
import { jwtDecode } from "jwt-decode";

const HeroSection = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  
  const handleCredentialResponse = (response: any) => {
    console.log("Encoded JWT ID token: " + response.credential);
    const decoded: { email: string } = jwtDecode(response.credential);
    sessionStorage.setItem("userEmail", decoded.email);
    navigate("/dashboard");
  };
  
  const handleGetStarted = () => {
    if (email) {
      navigate("/verify-code", { state: { email } });
    }
  };

  useEffect(() => {
    const google = (window as any).google;
    if (google) {
      google.accounts.id.initialize({
        client_id: config.googleClientId,
        callback: handleCredentialResponse
      });
      google.accounts.id.renderButton(
        document.getElementById("googleSignInButton"),
        { 
          theme: "filled_black",
          size: "large",
          text: "signin_with",
          shape: "rectangular",
          width: 320
        }
      );
    }
  }, []);

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
