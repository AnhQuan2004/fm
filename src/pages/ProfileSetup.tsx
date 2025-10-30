import { FormEvent, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { config } from "@/config/env";
import type { UserProfile } from "@/types/profile";
import { loadSessionProfile, storeSessionProfile } from "@/lib/profile-storage";

type LocationState = {
  email?: string;
  profile?: Partial<UserProfile>;
};

const DEFAULT_PROFILE: UserProfile = {
  email: "",
  username: "l",
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

const asUserRole = (value: unknown): UserProfile["role"] => {
  if (value === "admin" || value === "partner" || value === "user") {
    return value;
  }
  return undefined;
};

const ProfileSetup = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [locationField, setLocationField] = useState("");
  const [skillsInput, setSkillsInput] = useState("");
  const [socials, setSocials] = useState("");
  const [github, setGithub] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [usernameError, setUsernameError] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const state = (location.state as LocationState) || {};
    const resolvedEmail = state.email ?? sessionStorage.getItem("userEmail") ?? "";

    if (!resolvedEmail) {
      toast({
        title: "Session expired",
        description: "Vui lòng đăng nhập lại để hoàn tất hồ sơ.",
        variant: "destructive",
      });
      navigate("/", { replace: true });
      return;
    }

    const storedProfile = loadSessionProfile();
    const baseProfile: UserProfile = {
      ...DEFAULT_PROFILE,
      ...(storedProfile ?? {}),
      ...(state.profile ?? {}),
      email: resolvedEmail,
    };

    setEmail(resolvedEmail);
    setUsername(baseProfile.username ?? "");
    setFirstName(baseProfile.firstName ?? "");
    setLastName(baseProfile.lastName ?? "");
    setLocationField(baseProfile.location ?? "");
    setSkillsInput((baseProfile.skills ?? []).join(", "));
    setSocials(baseProfile.socials ?? "");
    setGithub(baseProfile.github ?? "");
    setDisplayName(baseProfile.displayName ?? "");
    setBio(baseProfile.bio ?? "");
    setIsReady(true);
  }, [location.state, navigate, toast]);

  const skillsList = useMemo(
    () =>
      skillsInput
        .split(",")
        .map(skill => skill.trim())
        .filter(Boolean),
    [skillsInput],
  );

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedDisplayName = displayName.trim();
    const trimmedBio = bio.trim();
    const trimmedUsername = username.trim();
    const trimmedFirstName = firstName.trim();
    const trimmedLastName = lastName.trim();
    const trimmedLocation = locationField.trim();
    const trimmedSocials = socials.trim();
    const trimmedGithub = github.trim();

    if (!trimmedUsername || !trimmedFirstName || !trimmedLastName || !trimmedLocation) {
      toast({
        title: "Missing information",
        description: "Vui lòng hoàn tất Username, First name, Last name và Location.",
        variant: "destructive",
      });
      return;
    }

    if (!trimmedDisplayName || !trimmedBio) {
      toast({
        title: "Missing information",
        description: "Display name và Bio là bắt buộc.",
        variant: "destructive",
      });
      return;
    }

    if (!skillsList.length) {
      toast({
        title: "Kỹ năng không được trống",
        description: "Hãy thêm ít nhất một kỹ năng (cách nhau bởi dấu phẩy).",
        variant: "destructive",
      });
      return;
    }

    if (!trimmedSocials || !trimmedGithub) {
      toast({
        title: "Thiếu liên kết",
        description: "Vui lòng bổ sung đường dẫn socials và Github.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        email,
        username: trimmedUsername,
        firstName: trimmedFirstName,
        lastName: trimmedLastName,
        location: trimmedLocation,
        skills: skillsList,
        socials: trimmedSocials,
        github: trimmedGithub,
        displayName: trimmedDisplayName,
        bio: trimmedBio,
      };
      // Debug network payload for troubleshooting env configuration.
      console.debug("[ProfileSetup] Submitting profile", {
        endpoint: `${config.authApiBaseUrl}/profile`,
        payload,
      });

      const response = await fetch(`${config.authApiBaseUrl}/profile`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        const error = data?.error;
        let errorMessage = "An unknown error occurred.";

        if (typeof error === 'string') {
            errorMessage = error;
        } else if (error?.username && Array.isArray(error.username) && error.username.length > 0) {
            errorMessage = error.username[0];
            setUsernameError(true);
        } else {
            errorMessage = data?.message || "Không thể lưu hồ sơ, vui lòng thử lại.";
        }
        
        toast({
          title: "Failed to save profile",
          description: errorMessage,
          variant: "destructive",
        });
        return;
      }

      const apiProfile = data?.profile as Partial<UserProfile> | undefined;
      const updatedProfile: UserProfile = {
        email,
        username: apiProfile?.username ?? trimmedUsername,
        firstName: apiProfile?.firstName ?? trimmedFirstName,
        lastName: apiProfile?.lastName ?? trimmedLastName,
        location: apiProfile?.location ?? trimmedLocation,
        skills: Array.isArray(apiProfile?.skills) ? apiProfile!.skills : skillsList,
        socials: apiProfile?.socials ?? trimmedSocials,
        github: apiProfile?.github ?? trimmedGithub,
        displayName: apiProfile?.displayName ?? trimmedDisplayName,
        bio: apiProfile?.bio ?? trimmedBio,
        updatedAt: apiProfile?.updatedAt,
        role: asUserRole(apiProfile?.role),
      };

      storeSessionProfile(updatedProfile);

      toast({
        title: "Profile saved",
        description: "Hồ sơ của bạn đã được cập nhật.",
      });

      navigate("/", { replace: true });
    } catch (error: unknown) {
      const rawMessage = error instanceof Error ? error.message : "Có lỗi xảy ra, vui lòng thử lại.";
      const message = rawMessage.includes("Failed to fetch")
        ? "Không thể kết nối tới máy chủ xác thực. Hãy chắc chắn backend đang chạy (mặc định http://localhost:3000) hoặc cập nhật biến VITE_AUTH_API_BASE_URL."
        : "An unexpected error occurred. Please check the console.";
      toast({
        title: "Failed to save profile",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isReady) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black text-white overflow-auto">
        <p className="text-sm text-muted-foreground">Đang chuẩn bị hồ sơ của bạn...</p>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen justify-center bg-black px-4 py-12 text-white overflow-auto">
      <div className="w-full max-w-4xl my-8">
        <Card className="border border-white/10 bg-slate-900/70 backdrop-blur">
          <CardHeader className="space-y-3">
            <CardTitle className="text-3xl font-semibold">
              Thiết lập hồ sơ <span className="text-blue-300">First Mover</span>
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Hoàn tất các thông tin cơ bản để cá nhân hóa trải nghiệm và tăng danh tiếng trong cộng đồng builder.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Email</label>
                  <Input
                    value={email}
                    readOnly
                    className="mt-2 h-12 cursor-not-allowed border-white/10 bg-white/5 text-muted-foreground"
                  />
                </div>
                <div>
                  <label htmlFor="username" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Username
                  </label>
                  <Input
                    id="username"
                    value={username}
                    onChange={event => {
                      setUsername(event.target.value);
                      setUsernameError(false);
                    }}
                    placeholder="jason.builder"
                    className={`mt-2 h-12 border-white/10 bg-black/40 text-white placeholder:text-muted-foreground ${
                      usernameError ? "border-red-500" : ""
                    }`}
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="firstName" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    First name
                  </label>
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={event => setFirstName(event.target.value)}
                    placeholder="Jason"
                    className="mt-2 h-12 border-white/10 bg-black/40 text-white placeholder:text-muted-foreground"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Last name
                  </label>
                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={event => setLastName(event.target.value)}
                    placeholder="Nguyen"
                    className="mt-2 h-12 border-white/10 bg-black/40 text-white placeholder:text-muted-foreground"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="location" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Location
                  </label>
                  <Input
                    id="location"
                    value={locationField}
                    onChange={event => setLocationField(event.target.value)}
                    placeholder="Ho Chi Minh City, Vietnam"
                    className="mt-2 h-12 border-white/10 bg-black/40 text-white placeholder:text-muted-foreground"
                  />
                </div>
                <div>
                  <label htmlFor="skills" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Skills (phân cách bằng dấu phẩy)
                  </label>
                  <Input
                    id="skills"
                    value={skillsInput}
                    onChange={event => setSkillsInput(event.target.value)}
                    placeholder="Move, Rust, Smart Contract"
                    className="mt-2 h-12 border-white/10 bg-black/40 text-white placeholder:text-muted-foreground"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="socials" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Social link
                  </label>
                  <Input
                    id="socials"
                    value={socials}
                    onChange={event => setSocials(event.target.value)}
                    placeholder="https://x.com/your-handle"
                    className="mt-2 h-12 border-white/10 bg-black/40 text-white placeholder:text-muted-foreground"
                  />
                </div>
                <div>
                  <label htmlFor="github" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    GitHub
                  </label>
                  <Input
                    id="github"
                    value={github}
                    onChange={event => setGithub(event.target.value)}
                    placeholder="your-github-username"
                    className="mt-2 h-12 border-white/10 bg-black/40 text-white placeholder:text-muted-foreground"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="displayName" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Display name
                </label>
                <Input
                  id="displayName"
                  value={displayName}
                  onChange={event => setDisplayName(event.target.value)}
                  placeholder="Ví dụ: Jason Nguyen"
                  className="mt-2 h-12 border-white/10 bg-black/40 text-white placeholder:text-muted-foreground"
                />
              </div>

              <div>
                <label htmlFor="bio" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Bio ngắn
                </label>
                <Textarea
                  id="bio"
                  value={bio}
                  onChange={event => setBio(event.target.value)}
                  placeholder="Builder | Content Creator | Researcher"
                  rows={4}
                  className="mt-2 border-white/10 bg-black/40 text-white placeholder:text-muted-foreground"
                />
              </div>

              <div className="rounded-2xl border border-dashed border-white/10 bg-black/30 p-4 text-sm text-muted-foreground">
                Gợi ý: Bạn có thể cập nhật avatar và các kết nối khác sau khi hoàn tất hồ sơ cơ bản này.
              </div>

              <div className="flex items-center justify-end gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  className="text-muted-foreground hover:text-white"
                  onClick={() => navigate("/", { replace: true })}
                >
                  Thoát
                </Button>
                <Button type="submit" className="bg-blue-500 hover:bg-blue-500/80" disabled={isSubmitting}>
                  {isSubmitting ? "Đang lưu..." : "Lưu & Tiếp tục"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
};

export default ProfileSetup;
