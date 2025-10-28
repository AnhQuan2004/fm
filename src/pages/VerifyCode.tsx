import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { config } from "@/config/env";
import type { UserProfile } from "@/types/profile";
import { storeSessionProfile } from "@/lib/profile-storage";

type LocationState = {
  email?: string;
  tokenId?: string;
};

const asUserRole = (value: unknown): UserProfile["role"] => {
  if (value === "admin" || value === "partner" || value === "user") {
    return value;
  }
  return undefined;
};

const VerifyCode = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState("");
  const [tokenId, setTokenId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const state = (location.state as LocationState) || {};
    const emailFromState = state.email ?? sessionStorage.getItem("pendingEmail") ?? "";
    const tokenFromState = state.tokenId ?? sessionStorage.getItem("pendingTokenId") ?? "";

    if (!emailFromState || !tokenFromState) {
      toast({
        title: "Session expired",
        description: "Vui lòng nhập email và yêu cầu mã OTP mới.",
        variant: "destructive",
      });
      navigate("/", { replace: true });
      return;
    }

    setEmail(emailFromState);
    setTokenId(tokenFromState);
  }, [location.state, navigate, toast]);

  const handleVerify = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!otp.trim()) {
      toast({
        title: "OTP is required",
        description: "Vui lòng nhập mã OTP gồm 6 chữ số.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      console.debug("[VerifyCode] Submitting OTP verification", {
        endpoint: `${config.authApiBaseUrl}/verify-otp`,
        payload: { email, otp, tokenId },
      });
      const response = await fetch(`${config.authApiBaseUrl}/verify-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, otp, tokenId }),
      });

      const data = await response.json();
      if (!response.ok || !data.ok) {
        throw new Error(data?.error || "Không thể xác thực OTP.");
      }

      const { user } = data;
      sessionStorage.setItem("userEmail", user.email);
      sessionStorage.removeItem("pendingEmail");
      sessionStorage.removeItem("pendingTokenId");

      const userProfile: UserProfile = {
        email: user.email,
        username: user.username ?? "",
        firstName: user.firstName ?? "",
        lastName: user.lastName ?? "",
        location: user.location ?? "",
        skills: Array.isArray(user.skills) ? user.skills : [],
        socials: user.socials ?? "",
        github: user.github ?? "",
        displayName: user.displayName ?? "",
        bio: user.bio ?? "",
        updatedAt: user.updatedAt,
        role: asUserRole(user.role),
      };

      storeSessionProfile(userProfile);

      toast({
        title: "Verification successful",
        description: "Bạn đã đăng nhập thành công.",
      });

      const hasProfile =
        Boolean(userProfile.username) && Boolean(userProfile.displayName) && Boolean(userProfile.bio);
      if (hasProfile) {
        navigate("/dashboard", { replace: true });
      } else {
        navigate("/profile-setup", {
          replace: true,
          state: {
            email: user.email,
            profile: userProfile,
          },
        });
      }
    } catch (error: unknown) {
      const rawMessage = error instanceof Error ? error.message : "Có lỗi xảy ra, vui lòng thử lại.";
      const message = rawMessage.includes("Failed to fetch")
        ? "Không thể kết nối tới máy chủ xác thực. Hãy kiểm tra VITE_AUTH_API_BASE_URL hoặc khởi chạy backend tại http://localhost:3000."
        : rawMessage;
      toast({
        title: "Verification failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-black/70 p-8 text-white backdrop-blur">
        <h1 className="text-3xl font-semibold text-center mb-2">Nhập mã OTP</h1>
        <p className="text-sm text-center text-gray-300 mb-8">
          Chúng tôi đã gửi mã xác thực đến <span className="font-medium">{email}</span>. Vui lòng kiểm tra email của bạn.
        </p>

        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <label htmlFor="otp" className="block text-sm font-medium text-foreground mb-2">
              Mã OTP
            </label>
            <Input
              id="otp"
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={otp}
              onChange={(event) => setOtp(event.target.value)}
              placeholder="Nhập 6 chữ số OTP"
              className="bg-black/50 border-white/20 text-white placeholder:text-gray-400 h-12 focus:ring-[#FF5722]"
            />
          </div>

          <Button type="submit" className="w-full h-12 bg-[#FF5722] hover:bg-[#FF5722]/90" disabled={isSubmitting}>
            Xác nhận
          </Button>
        </form>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Không nhận được mã? Vui lòng kiểm tra thư mục Spam hoặc thử yêu cầu lại từ trang trước.
        </p>
      </div>
    </main>
  );
};

export default VerifyCode;
