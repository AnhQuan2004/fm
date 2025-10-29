import { FormEvent, useCallback, useEffect, useMemo, useState, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import NavBar from "@/components/NavBar";
import { config } from "@/config/env";
import type { UserProfile } from "@/types/profile";
import { useNavigate } from "react-router-dom";
import { loadSessionProfile, storeSessionProfile } from "@/lib/profile-storage";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { getAdminOverride, setAdminOverride } from "@/lib/admin-access";

const asUserRole = (value: unknown): UserProfile["role"] => {
  if (value === "admin" || value === "partner" || value === "user") {
    return value;
  }
  return undefined;
};

type AdminBounty = {
  id: string;
  title: string;
  description: string;
  category: string;
  rewardAmount: number;
  rewardToken: string;
  deadline: string;
  status: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
};

type NewBountyState = {
  title: string;
  description: string;
  category: string;
  rewardAmount: string;
  rewardToken: string;
  deadline: string;
  status: string;
};

const roleOptions: UserProfile["role"][] = ["user", "partner", "admin"];
const statusOptions = ["open", "in_review", "closed"] as const;
const categoryOptions = ["dev", "content", "design", "research"] as const;
const ANY_STATUS = "any_status";
const ANY_CATEGORY = "any_category";

const initialBountyState: NewBountyState = {
  title: "",
  description: "",
  category: "dev",
  rewardAmount: "",
  rewardToken: "USDC",
  deadline: "",
  status: "open",
};

const safeJsonStringify = (value: unknown) => JSON.stringify(value, null, 2);

const Admin = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [checkedAuth, setCheckedAuth] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [requiresPassword, setRequiresPassword] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [rememberOverride, setRememberOverride] = useState(false);
  const [isVerifyingPassword, setIsVerifyingPassword] = useState(false);
  const adminPassword = config.adminAccessPassword;

  const [profileEmail, setProfileEmail] = useState("");
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [profileResponse, setProfileResponse] = useState<Record<string, unknown> | null>(null);

  const [roleEmail, setRoleEmail] = useState("");
  const [roleSelection, setRoleSelection] = useState<UserProfile["role"]>("user");
  const [isUpdatingRole, setIsUpdatingRole] = useState(false);

  const [listStatus, setListStatus] = useState<string>(ANY_STATUS);
  const [listCategory, setListCategory] = useState<string>(ANY_CATEGORY);
  const [listCreatedBy, setListCreatedBy] = useState<string>("");
  const [isLoadingBounties, setIsLoadingBounties] = useState(false);
  const [bounties, setBounties] = useState<AdminBounty[]>([]);

  const [newBounty, setNewBounty] = useState<NewBountyState>(initialBountyState);
  const [isCreatingBounty, setIsCreatingBounty] = useState(false);
  const [lastCreatedBountyId, setLastCreatedBountyId] = useState<string>("");

  const [updateBountyId, setUpdateBountyId] = useState("");
  const [updateBounty, setUpdateBounty] = useState<NewBountyState>(initialBountyState);
  const [isUpdatingBounty, setIsUpdatingBounty] = useState(false);
  const updateBountyRef = useRef<HTMLDivElement>(null);

  const [deleteBountyId, setDeleteBountyId] = useState("");
  const [isDeletingBounty, setIsDeletingBounty] = useState(false);

  const bountySummary = useMemo(() => {
    const base = { open: 0, in_review: 0, closed: 0 };
    for (const bounty of bounties) {
      if (bounty.status === "open") {
        base.open += 1;
      } else if (bounty.status === "in_review") {
        base.in_review += 1;
      } else if (bounty.status === "closed") {
        base.closed += 1;
      }
    }
    return base;
  }, [bounties]);

  const executeBountyQuery = useCallback(async () => {
    setIsLoadingBounties(true);
    try {
      const params = new URLSearchParams();
      if (listStatus && listStatus !== ANY_STATUS) {
        params.set("status", listStatus);
      }
      if (listCategory && listCategory !== ANY_CATEGORY) {
        params.set("category", listCategory);
      }
      if (listCreatedBy) {
        params.set("createdBy", listCreatedBy);
      }

      const url = params.size
        ? `${config.bountiesApiBaseUrl}?${params.toString()}`
        : config.bountiesApiBaseUrl;

      const response = await fetch(url, {
        credentials: "include",
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok || data?.ok === false) {
        const message = typeof data?.error === "string" ? data.error : "Failed to load bounties.";
        throw new Error(message);
      }

      const items: AdminBounty[] = Array.isArray(data?.bounties) ? data.bounties : [];
      setBounties(items);
    } catch (error) {
      console.error("Failed to fetch bounties", error);
      const message = error instanceof Error ? error.message : "Unable to fetch bounties.";
      toast({
        title: "Bounty query failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsLoadingBounties(false);
    }
  }, [listCategory, listCreatedBy, listStatus, toast]);

  const handleFetchProfile = async (event: FormEvent) => {
    event.preventDefault();
    setIsProfileLoading(true);
    setProfileResponse(null);
    try {
      const url = new URL(`${config.authApiBaseUrl}/profile`);
      if (profileEmail.trim()) {
        url.searchParams.set("email", profileEmail.trim());
      }

      const response = await fetch(url.toString(), {
        credentials: "include",
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok || data?.ok === false) {
        const message = typeof data?.error === "string" ? data.error : "Failed to lookup profile.";
        throw new Error(message);
      }

      setProfileResponse(data);
      toast({
        title: "Profile loaded",
        description: "Fetched profile information successfully.",
      });
    } catch (error) {
      console.error("Failed to fetch profile", error);
      const message = error instanceof Error ? error.message : "Unable to fetch profile.";
      toast({
        title: "Profile lookup failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsProfileLoading(false);
    }
  };

  const handleRoleUpdate = async (event: FormEvent) => {
    event.preventDefault();
    if (!roleEmail.trim()) {
      toast({
        title: "Email required",
        description: "Please provide an email to update role.",
        variant: "destructive",
      });
      return;
    }

    setIsUpdatingRole(true);
    try {
      const response = await fetch(`${config.authApiBaseUrl}/profile/role`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          email: roleEmail.trim(),
          role: roleSelection,
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok || data?.ok === false) {
        const message = typeof data?.error === "string" ? data.error : "Failed to update role.";
        throw new Error(message);
      }

      toast({
        title: "Role updated",
        description: `${roleEmail.trim()} is now ${roleSelection}.`,
      });
    } catch (error) {
      console.error("Failed to update role", error);
      const message = error instanceof Error ? error.message : "Unable to update user role.";
      toast({
        title: "Role update failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsUpdatingRole(false);
    }
  };

  const handleCreateBounty = async (event: FormEvent) => {
    event.preventDefault();

    if (!newBounty.title.trim() || !newBounty.description.trim()) {
      toast({
        title: "Missing fields",
        description: "Title and description are required.",
        variant: "destructive",
      });
      return;
    }

    if (!newBounty.deadline) {
      toast({
        title: "Deadline required",
        description: "Please specify a deadline for the bounty.",
        variant: "destructive",
      });
      return;
    }

    const parsedAmount = Number(newBounty.rewardAmount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      toast({
        title: "Invalid reward amount",
        description: "Reward amount must be a positive number.",
        variant: "destructive",
      });
      return;
    }

    const deadlineTimestamp = Date.parse(newBounty.deadline);
    if (Number.isNaN(deadlineTimestamp)) {
      toast({
        title: "Invalid deadline",
        description: "Please provide a valid deadline in ISO or datetime-local format.",
        variant: "destructive",
      });
      return;
    }

    setIsCreatingBounty(true);
    try {
      const payload = {
        title: newBounty.title.trim(),
        description: newBounty.description.trim(),
        category: newBounty.category,
        rewardAmount: parsedAmount,
        rewardToken: newBounty.rewardToken.trim(),
        deadline: new Date(deadlineTimestamp).toISOString(),
        status: newBounty.status,
      };

      const response = await fetch(config.bountiesApiBaseUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok || data?.ok === false) {
        const message = typeof data?.error === "string" ? data.error : "Failed to create bounty.";
        throw new Error(message);
      }

      const createdId = data?.bounty?.id ?? data?.id ?? "";
      setLastCreatedBountyId(createdId);
      toast({
        title: "Bounty created",
        description: createdId ? `Bounty ID ${createdId}` : "Created new bounty.",
      });
      setNewBounty(initialBountyState);
      await executeBountyQuery();
    } catch (error) {
      console.error("Failed to create bounty", error);
      const message = error instanceof Error ? error.message : "Unable to create bounty.";
      toast({
        title: "Create bounty failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsCreatingBounty(false);
    }
  };

  const handleUpdateBounty = async (event: FormEvent) => {
    event.preventDefault();
    if (!updateBountyId.trim()) {
      toast({
        title: "Bounty ID required",
        description: "Provide the bounty ID to update.",
        variant: "destructive",
      });
      return;
    }

    const payload: Partial<Omit<NewBountyState, "rewardAmount">> & { rewardAmount?: number } = {};
    if (updateBounty.title.trim()) payload.title = updateBounty.title.trim();
    if (updateBounty.description.trim()) payload.description = updateBounty.description.trim();
    if (updateBounty.category) payload.category = updateBounty.category;
    if (updateBounty.rewardAmount) payload.rewardAmount = Number(updateBounty.rewardAmount);
    if (updateBounty.rewardToken.trim()) payload.rewardToken = updateBounty.rewardToken.trim();
    if (updateBounty.deadline) payload.deadline = new Date(updateBounty.deadline).toISOString();
    if (updateBounty.status) payload.status = updateBounty.status;

    if (Object.keys(payload).length === 0) {
      toast({
        title: "No fields to update",
        description: "Please provide at least one field to update.",
        variant: "destructive",
      });
      return;
    }

    setIsUpdatingBounty(true);
    try {
      const response = await fetch(`${config.bountiesApiBaseUrl}/${updateBountyId.trim()}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok || data?.ok === false) {
        const message = typeof data?.error === "string" ? data.error : "Failed to update bounty.";
        throw new Error(message);
      }

      toast({
        title: "Bounty updated",
        description: `Bounty ${updateBountyId.trim()} updated successfully.`,
      });
      await executeBountyQuery();
    } catch (error) {
      console.error("Failed to update bounty", error);
      const message = error instanceof Error ? error.message : "Unable to update bounty.";
      toast({
        title: "Update bounty failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsUpdatingBounty(false);
    }
  };

  const handleDeleteBounty = async (bountyId: string) => {
    if (!bountyId) {
      toast({
        title: "Bounty ID required",
        description: "Provide the bounty ID to delete.",
        variant: "destructive",
      });
      return;
    }

    setIsDeletingBounty(true);
    try {
      const response = await fetch(`${config.bountiesApiBaseUrl}/${bountyId}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok || data?.ok === false) {
        const message = typeof data?.error === "string" ? data.error : "Failed to delete bounty.";
        throw new Error(message);
      }

      toast({
        title: "Bounty deleted",
        description: `Removed bounty ${deleteBountyId.trim()}.`,
      });
      setDeleteBountyId("");
      await executeBountyQuery();
    } catch (error) {
      console.error("Failed to delete bounty", error);
      const message = error instanceof Error ? error.message : "Unable to delete bounty.";
      toast({
        title: "Delete bounty failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsDeletingBounty(false);
    }
  };

  const evaluateAuthorization = useCallback(async () => {
    const adminPassword = config.adminAccessPassword;
    const override = getAdminOverride();
    if (override && adminPassword) {
      setRememberOverride(true);
      setRequiresPassword(false);
      setIsAuthorized(true);
      setCheckedAuth(true);
      return;
    }

    let authorized = false;
    const sessionProfile = loadSessionProfile();
    const sessionEmail = sessionProfile?.email ?? sessionStorage.getItem("userEmail") ?? "";

    if (sessionProfile?.role === "admin") {
      authorized = true;
    } else {
      try {
        const url = new URL(`${config.authApiBaseUrl}/profile`);
        if (sessionEmail) {
          url.searchParams.set("email", sessionEmail);
        }

        const response = await fetch(url.toString(), {
          credentials: "include",
        });

        if (response.ok) {
          const data = await response.json().catch(() => ({}));
          const profileData = data?.profile ?? data?.user ?? data;
          const role = asUserRole(profileData?.role);

          const normalizedProfile: UserProfile = {
            email: profileData?.email ?? sessionEmail,
            username: profileData?.username ?? sessionProfile?.username ?? "",
            firstName: profileData?.firstName ?? sessionProfile?.firstName ?? "",
            lastName: profileData?.lastName ?? sessionProfile?.lastName ?? "",
            location: profileData?.location ?? sessionProfile?.location ?? "",
            skills: Array.isArray(profileData?.skills) ? profileData.skills : sessionProfile?.skills ?? [],
            socials: profileData?.socials ?? sessionProfile?.socials ?? "",
            github: profileData?.github ?? sessionProfile?.github ?? "",
            displayName: profileData?.displayName ?? sessionProfile?.displayName ?? "",
            bio: profileData?.bio ?? sessionProfile?.bio ?? "",
            updatedAt: profileData?.updatedAt ?? sessionProfile?.updatedAt,
            role,
          };

          storeSessionProfile(normalizedProfile);
          if (role === "admin") {
            authorized = true;
          }
        }
      } catch (error) {
        console.error("Failed to verify admin permissions", error);
      }
    }

    if (!authorized && adminPassword) {
      setRememberOverride(false);
      setAdminOverride(false);
      if (typeof window !== "undefined") {
        window.sessionStorage.removeItem("userRole");
      }
      setRequiresPassword(true);
    } else if (!authorized) {
      toast({
        title: "Access denied",
        description: "Admin role required to view this page.",
        variant: "destructive",
      });
      navigate("/", { replace: true });
    }

    if (authorized) {
      setRequiresPassword(false);
    }
    setIsAuthorized(authorized);
    setCheckedAuth(true);
  }, [navigate, toast]);

  useEffect(() => {
    void evaluateAuthorization();
  }, [evaluateAuthorization]);

  useEffect(() => {
    if (!checkedAuth || !isAuthorized) {
      return;
    }
    void executeBountyQuery();
  }, [checkedAuth, executeBountyQuery, isAuthorized]);

  if (!checkedAuth) {
    return (
      <div className="min-h-screen bg-slate-950 text-white">
        <NavBar />
        <main className="mx-auto flex w-full max-w-6xl justify-center px-6 py-12">
          <p className="text-sm text-slate-400">Checking admin permissions...</p>
        </main>
      </div>
    );
  }

  if (!isAuthorized) {
    if (requiresPassword) {
      return (
        <div className="min-h-screen bg-slate-950 text-white">
          <NavBar />
          <main className="mx-auto flex w-full max-w-md flex-col items-center px-6 py-16">
            <Card className="w-full border border-white/10 bg-slate-900/70">
              <CardHeader className="space-y-2 text-center">
                <CardTitle className="text-2xl font-semibold text-white">Admin Verification</CardTitle>
                <CardDescription className="text-sm text-slate-300">
                  Enter the admin password to continue.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form
                  className="space-y-6"
                  onSubmit={event => {
                    event.preventDefault();
                    if (!adminPassword) {
                      toast({
                        title: "Password unavailable",
                        description: "Admin password is not configured.",
                        variant: "destructive",
                      });
                      return;
                    }

                    setIsVerifyingPassword(true);
                    setTimeout(() => {
                      if (passwordInput.trim() !== adminPassword) {
                        toast({
                          title: "Incorrect password",
                          description: "Please try again.",
                          variant: "destructive",
                        });
                        setIsVerifyingPassword(false);
                        return;
                      }

                      setIsAuthorized(true);
                      setCheckedAuth(true);
                      setRequiresPassword(false);
                      setIsVerifyingPassword(false);
                      setAdminOverride(rememberOverride);
                      if (typeof window !== "undefined") {
                        window.sessionStorage.setItem("userRole", "admin");
                      }
                      setPasswordInput("");
                      toast({
                        title: "Access granted",
                        description: "Welcome to the admin console.",
                      });
                    }, 150);
                  }}
                >
                  <div className="space-y-2">
                    <Label htmlFor="adminPassword" className="text-xs uppercase tracking-wide text-slate-300">
                      Password
                    </Label>
                    <Input
                      id="adminPassword"
                      type="password"
                      value={passwordInput}
                      onChange={event => setPasswordInput(event.target.value)}
                      className="bg-slate-950/80"
                      placeholder="Enter admin password"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="rememberOverride"
                      checked={rememberOverride}
                      onCheckedChange={value => setRememberOverride(Boolean(value))}
                    />
                    <Label htmlFor="rememberOverride" className="text-sm text-slate-300">
                      Remember me
                    </Label>
                  </div>
                  <Button type="submit" className="w-full" disabled={isVerifyingPassword}>
                    {isVerifyingPassword ? "Verifying..." : "Login"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </main>
        </div>
      );
    }
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <NavBar />
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-12">
        <header className="space-y-3">
          <h1 className="text-3xl font-semibold">Admin Control Center</h1>
          <p className="text-sm text-slate-400">
            Manage user profiles and bounty pipeline. All requests use credentials so ensure you are signed in with an
            admin session.
          </p>
        </header>

        <Card className="border border-white/10 bg-slate-900/60">
          <CardHeader>
            <CardTitle>User lookups</CardTitle>
            <CardDescription>Fetch profile data via email or current session cookie.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form className="flex flex-col gap-4 sm:flex-row sm:items-end" onSubmit={handleFetchProfile}>
              <div className="flex-1 space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-300">
                  Email (optional)
                </label>
                <Input
                  placeholder="user@example.com"
                  value={profileEmail}
                  onChange={event => setProfileEmail(event.target.value)}
                  className="bg-slate-900/80"
                />
              </div>
              <Button
                type="submit"
                className="sm:w-48"
                disabled={isProfileLoading}
              >
                {isProfileLoading ? "Loading..." : "Fetch profile"}
              </Button>
            </form>

            {profileResponse && (
              <div className="rounded-xl border border-white/10 bg-slate-950/70 p-4">
                <p className="mb-2 text-xs uppercase tracking-wide text-slate-400">Response</p>
                <pre className="max-h-64 overflow-auto text-xs text-slate-200">
                  {safeJsonStringify(profileResponse)}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border border-white/10 bg-slate-900/60">
          <CardHeader>
            <CardTitle>Role management</CardTitle>
            <CardDescription>Promote or demote users. Requires authenticated admin session.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="grid gap-4 sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_160px]" onSubmit={handleRoleUpdate}>
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-300">Email</label>
                <Input
                  placeholder="user@example.com"
                  value={roleEmail}
                  onChange={event => setRoleEmail(event.target.value)}
                  className="bg-slate-900/80"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-300">Role</label>
                <Select value={roleSelection} onValueChange={value => setRoleSelection(value as UserProfile["role"])}>
                  <SelectTrigger className="bg-slate-900/80">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roleOptions.map(role => (
                      <SelectItem key={role} value={role}>
                        {role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" disabled={isUpdatingRole}>
                {isUpdatingRole ? "Updating..." : "Update role"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="border border-white/10 bg-slate-900/60">
          <CardHeader>
            <CardTitle>Bounty directory</CardTitle>
            <CardDescription>Apply filters to inspect current bounties.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form
              className="grid gap-4 md:grid-cols-[repeat(3,minmax(0,1fr))_160px]"
              onSubmit={(event) => {
                event.preventDefault();
                void executeBountyQuery();
              }}
            >
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-300">Status</label>
                <Select value={listStatus} onValueChange={value => setListStatus(value)}>
                  <SelectTrigger className="bg-slate-900/80">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ANY_STATUS}>Any status</SelectItem>
                    {statusOptions.map(status => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-300">Category</label>
                <Select value={listCategory} onValueChange={value => setListCategory(value)}>
                  <SelectTrigger className="bg-slate-900/80">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ANY_CATEGORY}>Any category</SelectItem>
                    {categoryOptions.map(category => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-300">Created by</label>
                <Input
                  placeholder="Creator UUID"
                  value={listCreatedBy}
                  onChange={event => setListCreatedBy(event.target.value)}
                  className="bg-slate-900/80"
                />
              </div>
              <Button type="submit" disabled={isLoadingBounties}>
                {isLoadingBounties ? "Loading..." : "Load bounties"}
              </Button>
            </form>

            <div className="rounded-xl border border-white/10 bg-slate-950/70 p-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  Total: {bounties.length} · Open {bountySummary.open} · In review {bountySummary.in_review} · Closed{" "}
                  {bountySummary.closed}
                </p>
                {lastCreatedBountyId && (
                  <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-300">
                    Last created ID: {lastCreatedBountyId}
                  </Badge>
                )}
              </div>
              <Separator className="my-4 border-white/5" />
              {bounties.length === 0 ? (
                <p className="text-sm text-slate-400">No bounties found for the current filters.</p>
              ) : (
                <div className="grid gap-4">
                  {bounties.map(bounty => (
                    <div key={bounty.id} className="rounded-lg border border-white/10 bg-slate-900/80 p-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <h3 className="text-base font-semibold">{bounty.title}</h3>
                          <p className="text-xs text-slate-400">{bounty.id}</p>
                        </div>
                        <Badge>{bounty.status}</Badge>
                      </div>
                      <p className="mt-3 text-sm text-slate-300 line-clamp-3">{bounty.description}</p>
                      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-400">
                        <Badge variant="outline" className="border-white/20 text-white/80">
                          {bounty.category}
                        </Badge>
                        <span>Reward: {bounty.rewardAmount} {bounty.rewardToken}</span>
                        <span>Deadline: {new Date(bounty.deadline).toLocaleString()}</span>
                        <span>Creator: {bounty.createdBy}</span>
                      </div>
                      <div className="mt-4 flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => {
                            setUpdateBountyId(bounty.id);
                            setUpdateBounty({
                              title: bounty.title,
                              description: bounty.description,
                              category: bounty.category,
                              rewardAmount: String(bounty.rewardAmount),
                              rewardToken: bounty.rewardToken,
                              deadline: new Date(bounty.deadline).toISOString().slice(0, 16),
                              status: bounty.status,
                            });
                            updateBountyRef.current?.scrollIntoView({ behavior: "smooth" });
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            setDeleteBountyId(bounty.id);
                            handleDeleteBounty(bounty.id);
                          }}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border border-white/10 bg-slate-900/60">
          <CardHeader>
            <CardTitle>Bounty mutations</CardTitle>
            <CardDescription>Create, update, or delete bounties.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-10">
            <section className="space-y-4">
              <h3 className="text-lg font-semibold">Create bounty</h3>
              <form className="grid gap-4 md:grid-cols-2" onSubmit={handleCreateBounty}>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-300">Title</label>
                  <Input
                    placeholder="Design landing page"
                    value={newBounty.title}
                    onChange={event => setNewBounty(prev => ({ ...prev, title: event.target.value }))}
                    className="bg-slate-900/80"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-300">Description</label>
                  <Textarea
                    placeholder="Longer markdown or plain text"
                    rows={4}
                    value={newBounty.description}
                    onChange={event => setNewBounty(prev => ({ ...prev, description: event.target.value }))}
                    className="bg-slate-900/80"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-300">Category</label>
                  <Select
                    value={newBounty.category}
                    onValueChange={value => setNewBounty(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger className="bg-slate-900/80">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categoryOptions.map(category => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-300">Reward amount</label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="250"
                    value={newBounty.rewardAmount}
                    onChange={event => setNewBounty(prev => ({ ...prev, rewardAmount: event.target.value }))}
                    className="bg-slate-900/80"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-300">Reward token</label>
                  <Input
                    placeholder="USDC"
                    value={newBounty.rewardToken}
                    onChange={event => setNewBounty(prev => ({ ...prev, rewardToken: event.target.value }))}
                    className="bg-slate-900/80 uppercase"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-300">Deadline</label>
                  <Input
                    type="datetime-local"
                    value={newBounty.deadline}
                    onChange={event => setNewBounty(prev => ({ ...prev, deadline: event.target.value }))}
                    className="bg-slate-900/80"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-300">Status</label>
                  <Select value={newBounty.status} onValueChange={value => setNewBounty(prev => ({ ...prev, status: value }))}>
                    <SelectTrigger className="bg-slate-900/80">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map(status => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-2">
                  <Button type="submit" disabled={isCreatingBounty}>
                    {isCreatingBounty ? "Creating..." : "Create bounty"}
                  </Button>
                </div>
              </form>
            </section>

            <Separator className="border-white/10" />

            <section className="space-y-4" ref={updateBountyRef}>
              <h3 className="text-lg font-semibold">Update bounty</h3>
              <form className="grid gap-4 md:grid-cols-2" onSubmit={handleUpdateBounty}>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-300">Bounty ID</label>
                  <Input
                    placeholder="bounty uuid"
                    value={updateBountyId}
                    onChange={event => setUpdateBountyId(event.target.value)}
                    className="bg-slate-900/80"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-300">Title</label>
                  <Input
                    placeholder="Design landing page"
                    value={updateBounty.title}
                    onChange={event => setUpdateBounty(prev => ({ ...prev, title: event.target.value }))}
                    className="bg-slate-900/80"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-300">Description</label>
                  <Textarea
                    placeholder="Longer markdown or plain text"
                    rows={4}
                    value={updateBounty.description}
                    onChange={event => setUpdateBounty(prev => ({ ...prev, description: event.target.value }))}
                    className="bg-slate-900/80"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-300">Category</label>
                  <Select
                    value={updateBounty.category}
                    onValueChange={value => setUpdateBounty(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger className="bg-slate-900/80">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categoryOptions.map(category => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-300">Reward amount</label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="250"
                    value={updateBounty.rewardAmount}
                    onChange={event => setUpdateBounty(prev => ({ ...prev, rewardAmount: event.target.value }))}
                    className="bg-slate-900/80"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-300">Reward token</label>
                  <Input
                    placeholder="USDC"
                    value={updateBounty.rewardToken}
                    onChange={event => setUpdateBounty(prev => ({ ...prev, rewardToken: event.target.value }))}
                    className="bg-slate-900/80 uppercase"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-300">Deadline</label>
                  <Input
                    type="datetime-local"
                    value={updateBounty.deadline}
                    onChange={event => setUpdateBounty(prev => ({ ...prev, deadline: event.target.value }))}
                    className="bg-slate-900/80"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-300">Status</label>
                  <Select value={updateBounty.status} onValueChange={value => setUpdateBounty(prev => ({ ...prev, status: value }))}>
                    <SelectTrigger className="bg-slate-900/80">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map(status => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-2">
                  <Button type="submit" disabled={isUpdatingBounty}>
                    {isUpdatingBounty ? "Updating..." : "Update bounty"}
                  </Button>
                </div>
              </form>
            </section>

            <Separator className="border-white/10" />
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Admin;
