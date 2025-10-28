import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { config } from "@/config/env";
import { loadSessionProfile, storeSessionProfile } from "@/lib/profile-storage";
import type { UserProfile } from "@/types/profile";
import { Share2, PencilLine, Link as LinkIcon, Github, MapPin, Award, Trophy } from "lucide-react";
import NavBar from "@/components/NavBar";

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
    const stored = loadSessionProfile();
    if (stored) {
      setProfile(stored);
      setFormState(stored);
    } else {
      const email = sessionStorage.getItem("userEmail");
      if (email) {
        void fetchProfile(email);
      } else {
        navigate("/login", { replace: true });
      }
    }
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#EEF0FF] via-white to-white text-slate-900">
      <NavBar />
    <main>
      <div className="h-48 w-full bg-gradient-to-r from-[#8EC5FC] via-[#E0C3FC] to-[#FFD3A5]" />
      <div className="relative z-10 mx-auto -mt-24 w-full max-w-5xl px-6 pb-12">
        <Card className="rounded-3xl border-white/40 bg-white/95 shadow-xl">
          <CardContent className="px-6 py-8 sm:px-10 sm:py-10">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-6">
                <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
                  <AvatarFallback className="bg-gradient-to-br from-[#FF9770] via-[#FFD76F] to-[#70E4EF] text-xl font-semibold text-white">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <div>
                    <h1 className="text-2xl font-semibold text-slate-900">{profile.displayName || "Unnamed Builder"}</h1>
                    <p className="text-sm text-slate-500">{profile.username ? `@${profile.username}` : "@first-mover"}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4 text-slate-400" />
                      <span>{profile.location || "Based somewhere on-chain"}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <LinkIcon className="h-4 w-4 text-slate-400" />
                      <a
                        href={profile.socials || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-[#4DA2FF]"
                      >
                        {profile.socials || "Add social link"}
                      </a>
                    </div>
                    <div className="flex items-center gap-1">
                      <Github className="h-4 w-4 text-slate-400" />
                      <a
                        href={profile.github ? `https://github.com/${profile.github.replace(/^@/, "")}` : "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-[#4DA2FF]"
                      >
                        {profile.github ? `@${profile.github.replace(/^@/, "")}` : "Add GitHub"}
                      </a>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="border-slate-200 bg-white text-sm shadow-sm" onClick={handleEditOpen}>
                      <PencilLine className="mr-2 h-4 w-4" /> Edit Profile
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Update profile</DialogTitle>
                    </DialogHeader>
                    <form className="space-y-4" onSubmit={handleSave}>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <label className="text-xs uppercase tracking-wide text-slate-500">Display name</label>
                          <Input
                            value={formState.displayName}
                            onChange={event => handleFieldChange("displayName", event.target.value)}
                            placeholder="Your display name"
                          />
                        </div>
                        <div>
                          <label className="text-xs uppercase tracking-wide text-slate-500">Username</label>
                          <Input
                            value={formState.username}
                            onChange={event => handleFieldChange("username", event.target.value)}
                            placeholder="username"
                          />
                        </div>
                        <div>
                          <label className="text-xs uppercase tracking-wide text-slate-500">First name</label>
                          <Input
                            value={formState.firstName}
                            onChange={event => handleFieldChange("firstName", event.target.value)}
                            placeholder="First name"
                          />
                        </div>
                        <div>
                          <label className="text-xs uppercase tracking-wide text-slate-500">Last name</label>
                          <Input
                            value={formState.lastName}
                            onChange={event => handleFieldChange("lastName", event.target.value)}
                            placeholder="Last name"
                          />
                        </div>
                        <div>
                          <label className="text-xs uppercase tracking-wide text-slate-500">Location</label>
                          <Input
                            value={formState.location}
                            onChange={event => handleFieldChange("location", event.target.value)}
                            placeholder="Where you're based"
                          />
                        </div>
                        <div>
                          <label className="text-xs uppercase tracking-wide text-slate-500">Social link</label>
                          <Input
                            value={formState.socials}
                            onChange={event => handleFieldChange("socials", event.target.value)}
                            placeholder="https://twitter.com/you"
                          />
                        </div>
                        <div>
                          <label className="text-xs uppercase tracking-wide text-slate-500">GitHub</label>
                          <Input
                            value={formState.github}
                            onChange={event => handleFieldChange("github", event.target.value)}
                            placeholder="your-github"
                          />
                        </div>
                        <div>
                          <label className="text-xs uppercase tracking-wide text-slate-500">Skills</label>
                          <Input
                            value={formState.skills.join(", ")}
                            onChange={event => handleSkillsChange(event.target.value)}
                            placeholder="move, react, content"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs uppercase tracking-wide text-slate-500">Bio</label>
                        <Textarea
                          rows={3}
                          value={formState.bio}
                          onChange={event => handleFieldChange("bio", event.target.value)}
                          placeholder="Share your builder journey"
                        />
                      </div>
                      <DialogFooter>
                        <Button type="button" variant="ghost" onClick={() => setIsEditOpen(false)}>
                          Cancel
                        </Button>
                        <Button type="submit" disabled={isSaving}>
                          {isSaving ? "Saving..." : "Save changes"}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
                <Button variant="outline" className="border-slate-200 bg-white text-sm shadow-sm" onClick={shareProfile}>
                  <Share2 className="mr-2 h-4 w-4" /> Share
                </Button>
              </div>
            </div>

            <Separator className="my-8" />

            <div className="grid gap-8 md:grid-cols-2">
              <div className="space-y-4">
                <h3 className="text-sm font-semibold tracking-wide text-slate-500">Details</h3>
                <div className="space-y-2 text-sm text-slate-600">
                  <p>{profile.location || "No location provided"}</p>
                  {fullName && <p>{fullName}</p>}
                  <p className="text-slate-400">{profile.bio || "Tell the community what you are building."}</p>
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="text-sm font-semibold tracking-wide text-slate-500">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.length ? (
                    profile.skills.map(skill => (
                      <Badge key={skill} className="rounded-full bg-slate-100 text-xs font-medium text-slate-700">
                        {skill}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-sm text-slate-400">Add skills to showcase your strengths.</p>
                  )}
                </div>
              </div>
            </div>

            <Separator className="my-8" />

            <div className="grid gap-6 md:grid-cols-2">
              <Card className="border border-slate-100 bg-gradient-to-br from-white to-slate-50">
                <CardContent className="flex flex-col gap-3 px-6 py-6">
                  <div className="flex items-center gap-3 text-slate-500">
                    <Award className="h-5 w-5 text-[#FFB400]" />
                    <span className="text-sm font-medium">Proof of work</span>
                    <Button variant="ghost" className="ml-auto text-sm text-[#4DA2FF] hover:text-[#2678e3]" size="sm">
                      + Add
                    </Button>
                  </div>
                  <p className="text-sm text-slate-400">Share your recent wins, shipped products, or contributions.</p>
                </CardContent>
              </Card>

              <Card className="border border-slate-100 bg-gradient-to-br from-white to-slate-50">
                <CardContent className="flex items-center justify-between px-6 py-6">
                  <div className="space-y-1">
                    <p className="text-sm text-slate-500">Rewards earned</p>
                    <p className="text-2xl font-semibold text-slate-900">$0</p>
                  </div>
                  <div className="space-y-1 text-right">
                    <p className="text-sm text-slate-500">Submissions</p>
                    <p className="text-2xl font-semibold text-slate-900">0</p>
                  </div>
                  <div className="space-y-1 text-right">
                    <p className="text-sm text-slate-500">Wins</p>
                    <p className="text-2xl font-semibold text-slate-900">0</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Separator className="my-8" />

            <Tabs defaultValue="activity" className="mt-4">
              <TabsList className="bg-slate-100">
                <TabsTrigger value="activity">Activity feed</TabsTrigger>
                <TabsTrigger value="projects">Personal projects</TabsTrigger>
                <TabsTrigger value="proof">Proof of work</TabsTrigger>
              </TabsList>
              <TabsContent value="activity" className="space-y-4 rounded-xl border border-slate-100 bg-white p-6 text-sm text-slate-500">
                <p>No activity yet. Start exploring quests and share your progress.</p>
              </TabsContent>
              <TabsContent value="projects" className="space-y-4 rounded-xl border border-slate-100 bg-white p-6 text-sm text-slate-500">
                <p>Showcase your personal projects here.</p>
              </TabsContent>
              <TabsContent value="proof" className="space-y-4 rounded-xl border border-slate-100 bg-white p-6 text-sm text-slate-500">
                <p>Add proof of work to highlight your achievements.</p>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </main>
    </div>
  );
};

export default Profile;
