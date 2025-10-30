import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import { config } from "@/config/env";
import { loadSessionProfile, storeSessionProfile } from "@/lib/profile-storage";
import type { UserProfile } from "@/types/profile";
import { 
  Share2, 
  PencilLine, 
  Link as LinkIcon, 
  Github, 
  MapPin, 
  Award, 
  Trophy,
  ArrowRight,
  BookOpen,
  Coins,
  Compass,
  Hexagon,
  Link2,
  PenTool,
  ShieldCheck,
  Sparkles,
  Wallet2,
  Zap,
  FlameIcon
} from "lucide-react";
import NavBar from "@/components/NavBar";
import ActivityChart from "@/components/ActivityChart";
import CustomConnectWallet from "@/components/CustomConnectWallet";

type StatCard = {
  label: string;
  value: string;
  helper: string;
  icon: React.ElementType;
  accent: string;
};

type ActivityItem = {
  id: number;
  label: string;
  detail: string;
  timestamp: string;
  emoji: string;
};

type QuickAction = {
  id: number;
  label: string;
  description: string;
  icon: React.ElementType;
};

type CourseProgress = {
  id: number;
  title: string;
  progress: number;
  milestone: string;
};

const defaultProfile: UserProfile = {
  email: "",
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

const asUserRole = (value: unknown): UserProfile["role"] => {
  if (value === "admin" || value === "partner" || value === "user") {
    return value;
  }
  return undefined;
};

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile>(defaultProfile);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formState, setFormState] = useState<UserProfile>(defaultProfile);

  const fetchProfile = useCallback(async (email: string) => {
    try {
      const response = await fetch(`${config.authApiBaseUrl}/profile?email=${encodeURIComponent(email)}`);
      if (!response.ok) {
        throw new Error("Failed to fetch profile");
      }
      const data = await response.json();
      console.log("Profile API Response:", data);
      const remoteProfile = {
        email,
        username: data?.profile?.username ?? "",
        firstName: data?.profile?.firstName ?? "",
        lastName: data?.profile?.lastName ?? "",
        location: data?.profile?.location ?? "",
        skills: Array.isArray(data?.profile?.skills) ? data.profile.skills : [],
        socials: data?.profile?.socials ?? "",
        github: data?.profile?.github ?? "",
        displayName: data?.profile?.displayName ?? "",
        bio: data?.profile?.bio ?? "",
        updatedAt: data?.profile?.updatedAt,
        role: asUserRole(data?.profile?.role),
      } satisfies UserProfile;
      setProfile(remoteProfile);
      setFormState(remoteProfile);
      storeSessionProfile(remoteProfile);
      if (remoteProfile.role) {
        sessionStorage.setItem("userRole", remoteProfile.role);
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Failed to load profile",
        description: "Không thể tải hồ sơ, vui lòng thử lại sau.",
        variant: "destructive",
      });
    }
  }, [toast]);

  useEffect(() => {
    const email = sessionStorage.getItem("userEmail");
    if (!email) {
      navigate("/login", { replace: true });
      return;
    }

    const stored = loadSessionProfile();
    if (stored) {
      setProfile(stored);
      setFormState(stored);
    }

    void fetchProfile(email);
  }, [fetchProfile, navigate]);


  const handleEditOpen = () => {
    setFormState(profile);
    setIsEditOpen(true);
  };

  const handleFieldChange = <K extends keyof UserProfile>(key: K, value: UserProfile[K]) => {
    setFormState(prev => ({ ...prev, [key]: value }));
  };

  const handleSkillsChange = (value: string) => {
    const parsed = value
      .split(",")
      .map(skill => skill.trim())
      .filter(Boolean);
    handleFieldChange("skills", parsed);
  };

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSaving(true);
    try {
      const { role: _role, ...profilePayload } = formState;
      const payload = {
        ...profilePayload,
        skills: formState.skills,
      };

      const response = await fetch(`${config.authApiBaseUrl}/profile`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok || data?.ok === false) {
        throw new Error(data?.error || "Không thể cập nhật hồ sơ.");
      }

      const updatedProfile = {
        ...formState,
        skills: formState.skills,
        updatedAt: data?.profile?.updatedAt,
        role: asUserRole(data?.profile?.role ?? profile.role),
      } satisfies UserProfile;
      setProfile(updatedProfile);
      storeSessionProfile(updatedProfile);
      if (updatedProfile.role) {
        sessionStorage.setItem("userRole", updatedProfile.role);
      }
      toast({ title: "Profile updated", description: "Hồ sơ của bạn đã được lưu." });
      setIsEditOpen(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Có lỗi xảy ra, vui lòng thử lại.";
      toast({ title: "Failed to update", description: message, variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const shareProfile = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast({ title: "Copied", description: "Link hồ sơ đã được sao chép." });
    } catch (error) {
      toast({ title: "Copy failed", description: "Không thể sao chép link.", variant: "destructive" });
    }
  };

  const initials = useMemo(() => {
    if (profile.displayName) {
      return profile.displayName
        .split(" ")
        .map(part => part[0]?.toUpperCase())
        .join("")
        .slice(0, 2);
    }
    if (profile.email) {
      return profile.email[0]?.toUpperCase() ?? "U";
    }
    return "U";
  }, [profile.displayName, profile.email]);

  const fullName = [profile.firstName, profile.lastName].filter(Boolean).join(" ");

  // Define dashboard data
  const fallbackDisplayName = useMemo(() => {
    if (!profile.email) {
      return "Jason";
    }

    const [localPart] = profile.email.split("@");
    if (!localPart) {
      return "Jason";
    }

    const formatted = localPart
      .split(/[.\-_]/)
      .filter(Boolean)
      .map(piece => piece.charAt(0).toUpperCase() + piece.slice(1))
      .join(" ");

    return formatted || "Jason";
  }, [profile.email]);

  const resolvedDisplayName = profile?.displayName || fallbackDisplayName;
  const resolvedBio = profile?.bio || "Builder · Content Creator";
  const resolvedSkills = profile?.skills?.length ? profile.skills : [];
  const resolvedUsername = profile?.username ? `@${profile.username}` : "";
  const resolvedLocation = profile?.location || "";
  const socialLink = profile?.socials || "";
  const githubHandle = profile?.github || "";

  const statCards: StatCard[] = [
    {
      label: "XP / Level",
      value: "2,450 XP",
      helper: "Level 6 · Builder",
      icon: Zap,
      accent: "bg-blue-500/20 text-blue-400",
    },
    {
      label: "Badges Earned",
      value: "5 badges",
      helper: "Hover to preview",
      icon: Award,
      accent: "bg-purple-500/20 text-purple-400",
    },
    {
      label: "Total Rewards",
      value: "320 SUI",
      helper: "Claimable now",
      icon: Coins,
      accent: "bg-emerald-500/20 text-emerald-400",
    },
    {
      label: "Courses in Progress",
      value: "3 active",
      helper: "Finish Move Basics",
      icon: BookOpen,
      accent: "bg-amber-500/20 text-amber-400",
    },
  ];

  const recentActivities: ActivityItem[] = [
    {
      id: 1,
      label: 'Hoàn thành bài học "Intro to Move".',
      detail: "Nâng tổng XP thêm 150.",
      timestamp: "2 giờ trước",
      emoji: "✅",
    },
    {
      id: 2,
      label: 'Submit bounty "Build Sui Lottery dApp".',
      detail: "Đang chờ guild review.",
      timestamp: "Hôm qua",
      emoji: "🧩",
    },
    {
      id: 3,
      label: 'Nhận NFT "Move Bootcamp Graduate".',
      detail: "Lưu trong ví Sui Wallet.",
      timestamp: "3 ngày trước",
      emoji: "🏅",
    },
    {
      id: 4,
      label: "Được thêm vào danh sách Builder ưu tú.",
      detail: "Chúc mừng! Giữ streak 12 ngày.",
      timestamp: "4 ngày trước",
      emoji: "🔥",
    },
  ];

  const quickActions: QuickAction[] = [
    {
      id: 1,
      label: "Continue Learning",
      description: "Pick up Move Basics lesson 7.",
      icon: Sparkles,
    },
    {
      id: 2,
      label: "View Open Bounties",
      description: "6 new opportunities this week.",
      icon: Compass,
    },
    {
      id: 3,
      label: "Write a Tutorial",
      description: "Share what you learned in Move.",
      icon: PenTool,
    },
    {
      id: 4,
      label: "Claim Rewards",
      description: "Connect wallet to receive SUI.",
      icon: Wallet2,
    },
  ];

  const coursesInProgress: CourseProgress[] = [
    {
      id: 1,
      title: "Move Basics",
      progress: 68,
      milestone: "Lesson 7 of 10 · Syntax & Modules",
    },
    {
      id: 2,
      title: "Smart Contract Security",
      progress: 45,
      milestone: "Unit 4 of 9 · Auditing flows",
    },
    {
      id: 3,
      title: "Sui Ecosystem Deep Dive",
      progress: 20,
      milestone: "Intro quests completed · Next: Capy Collectibles",
    },
  ];

  const profileTasks = [
    { id: 1, label: "Set your avatar", status: "Pending" },
    { id: 2, label: "Choose username", status: resolvedUsername ? "Done" : "Pending" },
    { id: 3, label: "Add your skills", status: resolvedSkills.length ? "Done" : "Pending" },
    { id: 4, label: "Write a short bio", status: profile?.bio ? "Done" : "Pending" },
    { id: 5, label: "Share socials", status: socialLink ? "Done" : "Pending" },
  ];

  const connectedAccounts = [
    {
      id: 1,
      label: "Sui Wallet",
      value: "Chưa liên kết",
      icon: Wallet2,
      isConnected: false,
    },
    {
      id: 2,
      label: "Social link",
      value: socialLink || "Thêm liên kết xã hội",
      icon: Link2,
      isConnected: Boolean(socialLink),
    },
    {
      id: 3,
      label: "GitHub",
      value: githubHandle ? `@${githubHandle.replace(/^@/, "")}` : "Chưa liên kết",
      icon: Hexagon,
      isConnected: Boolean(githubHandle),
    },
    {
      id: 4,
      label: "Discord",
      value: "Jason#2049",
      icon: ShieldCheck,
      isConnected: true,
    },
  ];

  return (
    <div className="min-h-screen overflow-y-auto bg-gradient-to-b from-black via-slate-950 to-black text-white">
      <NavBar />
    <main className="mx-auto w-full max-w-7xl px-6 py-10">
      {/* Added smaller space for better positioning */}
      <div className="h-[50px]"></div>
      
      <section className="flex flex-col gap-6 rounded-3xl border border-white/5 bg-slate-900/40 p-6 backdrop-blur md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-blue-400/80">Dashboard Overview</p>
          <h1 className="mt-2 text-3xl font-semibold sm:text-4xl">
            Welcome back, <span className="text-blue-400">{resolvedDisplayName}</span> 👋
          </h1>
          <p className="mt-3 max-w-xl text-muted-foreground">
            Ready to learn and earn today? Track your progress, unlock new quests, and grow your builder reputation.
          </p>
        </div>
        <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
          <Button variant="outline" className="border-white/10 bg-white/5 hover:bg-white/10">
            Weekly streak · 12 days
          </Button>
          <Button className="bg-blue-500 hover:bg-blue-500/80">
            Share progress
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </section>

      <section className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map(stat => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="border-white/10 bg-slate-900/60 text-white">
              <CardContent className="flex flex-col gap-6 p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-widest text-muted-foreground">{stat.label}</p>
                    <p className="mt-2 text-2xl font-semibold">{stat.value}</p>
                  </div>
                  <span className={`rounded-full p-2 ${stat.accent}`}>
                    <Icon className="h-5 w-5" />
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{stat.helper}</p>
              </CardContent>
            </Card>
          );
        })}
      </section>

      <section className="mt-12 grid gap-8 xl:grid-cols-[2fr,1.2fr]">
        <Card className="border-white/10 bg-slate-900/60 text-white">
          <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Recent Activities</CardTitle>
              <CardDescription>Your latest quests, rewards, and milestones.</CardDescription>
            </div>
            <Button variant="ghost" className="text-xs uppercase tracking-widest text-muted-foreground hover:text-white">
              View timeline
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            {recentActivities.map(activity => (
              <div key={activity.id} className="flex gap-4 rounded-2xl border border-white/5 bg-black/30 p-4">
                <span className="text-2xl">{activity.emoji}</span>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-white">{activity.label}</p>
                  <p className="text-sm text-muted-foreground">{activity.detail}</p>
                  <p className="text-xs text-muted-foreground/80">{activity.timestamp}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-slate-900/60 text-white">
          <CardHeader>
            <CardTitle>Progress Trend</CardTitle>
            <CardDescription>Weekly on-chain score performance.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <p className="text-3xl font-semibold">54 / 100</p>
              <p className="text-sm text-muted-foreground">Consistency pays off — keep your streak alive.</p>
            </div>
            <ActivityChart />
            <div className="grid gap-3 text-xs text-muted-foreground">
              <div className="flex items-center justify-between">
                <span>Builder score</span>
                <span className="text-blue-300">+12 this week</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Content reputation</span>
                <span className="text-emerald-300">+2 tutorials</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Quest streak</span>
                <span className="text-amber-300">12 days</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="mt-12 grid gap-8 lg:grid-cols-[1.4fr,1fr]">
        <Card className="border-white/10 bg-slate-900/60 text-white">
          <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Jump right back into the builder flow.</CardDescription>
            </div>
            <Badge className="bg-blue-500/20 text-xs text-blue-300">Today</Badge>
          </CardHeader>
          <CardContent className="grid gap-4">
            {quickActions.map(action => {
              const Icon = action.icon;
              return (
                <Button
                  key={action.id}
                  variant="outline"
                  className="flex items-center justify-between rounded-2xl border-white/10 bg-black/30 px-4 py-6 text-left hover:bg-white/5"
                >
                  <div className="flex items-center gap-4">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-blue-300">
                      <Icon className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-white">{action.label}</p>
                      <p className="text-xs text-muted-foreground">{action.description}</p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </Button>
              );
            })}
            <div className="rounded-2xl border border-dashed border-blue-500/40 bg-blue-500/5 p-5">
              <p className="text-sm font-medium text-blue-100">Ready to claim 320 SUI?</p>
              <p className="mt-2 text-xs text-blue-200/70">Connect your wallet to collect rewards and NFTs securely.</p>
              <div className="mt-4">
                <CustomConnectWallet />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-slate-900/60 text-white">
          <CardHeader>
            <CardTitle>Courses in Progress</CardTitle>
            <CardDescription>Keep building your skill stack.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {coursesInProgress.map(course => (
              <div key={course.id} className="space-y-3 rounded-2xl border border-white/5 bg-black/30 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-white">{course.title}</p>
                  <span className="text-xs text-muted-foreground">{course.progress}%</span>
                </div>
                <Progress value={course.progress} className="h-2 bg-white/5" />
                <p className="text-xs text-muted-foreground">{course.milestone}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="mt-12 grid gap-8 lg:grid-cols-[1.2fr,1fr]">
        <Card className="border-white/10 bg-slate-900/60 text-white">
          <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Profile Snapshot</CardTitle>
              <CardDescription>Boost reputation by completing your profile.</CardDescription>
            </div>
            <Badge className="bg-emerald-500/20 text-xs text-emerald-300">72% complete</Badge>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col gap-4 rounded-2xl border border-white/5 bg-black/30 p-5 sm:flex-row sm:items-center">
              <Avatar className="h-16 w-16 border border-white/10">
                <AvatarImage alt={resolvedDisplayName} src="" />
                <AvatarFallback className="text-xl">{initials}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-lg font-semibold">{resolvedDisplayName}</p>
                <p className="text-sm text-muted-foreground">{resolvedBio}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {resolvedUsername && <Badge className="bg-white/10 text-xs">{resolvedUsername}</Badge>}
                  {resolvedLocation && (
                    <Badge className="bg-white/10 text-xs flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {resolvedLocation}
                    </Badge>
                  )}
                  {profile.role && (
                    <Badge className="bg-blue-500/20 text-xs text-blue-300 capitalize">
                      {profile.role}
                    </Badge>
                  )}
                </div>
                <div className="mt-3 space-y-1 text-xs text-muted-foreground">
                  {fullName ? (
                    <p>
                      Tên đầy đủ: <span className="text-white">{fullName}</span>
                    </p>
                  ) : (
                    <p>Thêm họ tên để đồng đội nhận ra bạn.</p>
                  )}
                  {socialLink ? (
                    <p className="truncate">
                      Socials: <span className="text-white">{socialLink}</span>
                    </p>
                  ) : (
                    <p>Chưa có liên kết socials.</p>
                  )}
                  {githubHandle ? (
                    <p>
                      GitHub: <span className="text-white">@{githubHandle.replace(/^@/, "")}</span>
                    </p>
                  ) : (
                    <p>Chưa liên kết GitHub.</p>
                  )}
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground">Skills</p>
                {resolvedSkills.length ? (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {resolvedSkills.map(skill => (
                      <Badge key={skill} className="bg-white/10 text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="mt-2 text-xs text-muted-foreground">Chưa cập nhật kỹ năng — thêm ngay để nổi bật.</p>
                )}
              </div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Profile Tasks</p>
              <div className="grid gap-3 sm:grid-cols-2">
                {profileTasks.map(task => (
                  <div key={task.id} className="rounded-2xl border border-white/5 bg-black/20 p-4">
                    <p className="text-sm font-semibold text-white">{task.label}</p>
                    <p className="text-xs text-muted-foreground">{task.status}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-end">
              <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="border-white/10 bg-white/5 text-sm hover:bg-white/10" onClick={handleEditOpen}>
                    <PencilLine className="mr-2 h-4 w-4" /> Edit Profile
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl bg-slate-900 text-white border-white/10">
                  <DialogHeader>
                    <DialogTitle>Update profile</DialogTitle>
                  </DialogHeader>
                  <form className="space-y-4" onSubmit={handleSave}>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="text-xs uppercase tracking-wide text-muted-foreground">Display name</label>
                        <Input
                          value={formState.displayName}
                          onChange={event => handleFieldChange("displayName", event.target.value)}
                          placeholder="Your display name"
                          className="bg-black/30 border-white/10 text-white"
                        />
                      </div>
                      <div>
                        <label className="text-xs uppercase tracking-wide text-muted-foreground">Username</label>
                        <Input
                          value={formState.username}
                          onChange={event => handleFieldChange("username", event.target.value)}
                          placeholder="username"
                          className="bg-black/30 border-white/10 text-white"
                        />
                      </div>
                      <div>
                        <label className="text-xs uppercase tracking-wide text-muted-foreground">First name</label>
                        <Input
                          value={formState.firstName}
                          onChange={event => handleFieldChange("firstName", event.target.value)}
                          placeholder="First name"
                          className="bg-black/30 border-white/10 text-white"
                        />
                      </div>
                      <div>
                        <label className="text-xs uppercase tracking-wide text-muted-foreground">Last name</label>
                        <Input
                          value={formState.lastName}
                          onChange={event => handleFieldChange("lastName", event.target.value)}
                          placeholder="Last name"
                          className="bg-black/30 border-white/10 text-white"
                        />
                      </div>
                      <div>
                        <label className="text-xs uppercase tracking-wide text-muted-foreground">Location</label>
                        <Input
                          value={formState.location}
                          onChange={event => handleFieldChange("location", event.target.value)}
                          placeholder="Where you're based"
                          className="bg-black/30 border-white/10 text-white"
                        />
                      </div>
                      <div>
                        <label className="text-xs uppercase tracking-wide text-muted-foreground">Social link</label>
                        <Input
                          value={formState.socials}
                          onChange={event => handleFieldChange("socials", event.target.value)}
                          placeholder="https://twitter.com/you"
                          className="bg-black/30 border-white/10 text-white"
                        />
                      </div>
                      <div>
                        <label className="text-xs uppercase tracking-wide text-muted-foreground">GitHub</label>
                        <Input
                          value={formState.github}
                          onChange={event => handleFieldChange("github", event.target.value)}
                          placeholder="your-github"
                          className="bg-black/30 border-white/10 text-white"
                        />
                      </div>
                      <div>
                        <label className="text-xs uppercase tracking-wide text-muted-foreground">Skills</label>
                        <Input
                          value={formState.skills.join(", ")}
                          onChange={event => handleSkillsChange(event.target.value)}
                          placeholder="move, react, content"
                          className="bg-black/30 border-white/10 text-white"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs uppercase tracking-wide text-muted-foreground">Bio</label>
                      <Textarea
                        rows={3}
                        value={formState.bio}
                        onChange={event => handleFieldChange("bio", event.target.value)}
                        placeholder="Share your builder journey"
                        className="bg-black/30 border-white/10 text-white"
                      />
                    </div>
                    <DialogFooter>
                      <Button type="button" variant="ghost" onClick={() => setIsEditOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={isSaving} className="bg-blue-500 hover:bg-blue-500/80">
                        {isSaving ? "Saving..." : "Save changes"}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-slate-900/60 text-white">
          <CardHeader>
            <CardTitle>Connected Accounts</CardTitle>
            <CardDescription>Manage integrations and privacy.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {connectedAccounts.map(account => {
              const Icon = account.icon;
              return (
                <div
                  key={account.id}
                  className="flex items-center justify-between rounded-2xl border border-white/5 bg-black/30 p-4"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-muted-foreground">
                      <Icon className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-white">{account.label}</p>
                      <p className="text-xs text-muted-foreground">{account.value}</p>
                    </div>
                  </div>
                  <Button variant="ghost" className="text-xs text-blue-300 hover:text-blue-100">
                    {account.isConnected ? "Manage" : "Connect now"}
                  </Button>
                </div>
              );
            })}
            <div className="rounded-2xl border border-dashed border-white/10 bg-black/20 p-4 text-xs text-muted-foreground">
              Toggle your profile visibility any time · Public / Private.
            </div>
            <div className="flex justify-end">
              <Button variant="outline" className="border-white/10 bg-white/5 text-sm hover:bg-white/10" onClick={shareProfile}>
                <Share2 className="mr-2 h-4 w-4" /> Share Profile
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
    </div>
  );
};

export default Profile;
