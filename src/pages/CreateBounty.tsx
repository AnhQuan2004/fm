import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import NavBar from "@/components/NavBar";
import { Search, Filter, Calendar as CalendarIcon, Tag, Star } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import type { Bounty } from "@/types/bounty";
import { config } from "@/config/env";
import { loadSessionProfile } from "@/lib/profile-storage";

const CreateBounty = () => {
  const { toast } = useToast();
  const [bounties, setBounties] = useState<Bounty[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("dev");
  const [rewardAmount, setRewardAmount] = useState("");
  const [rewardToken, setRewardToken] = useState("USDC");
  const [deadline, setDeadline] = useState<Date | undefined>();
  const [time, setTime] = useState("00:00");
  const [status, setStatus] = useState("open");
  const [editingBounty, setEditingBounty] = useState<Bounty | null>(null);

  useEffect(() => {
    if (editingBounty) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      setTitle(editingBounty.title);
      setDescription(editingBounty.description);
      setCategory(editingBounty.category);
      setRewardAmount(editingBounty.rewardAmount.toString());
      setRewardToken(editingBounty.rewardToken);
      setDeadline(new Date(editingBounty.deadline));
      setTime(format(new Date(editingBounty.deadline), "HH:mm"));
      setStatus(editingBounty.status);
    }
  }, [editingBounty]);

  useEffect(() => {
    const fetchBounties = async () => {
      const sessionProfile = loadSessionProfile();
      const creatorUsername = sessionProfile?.username;

      if (!creatorUsername) {
        // Don't fetch if there's no username
        return;
      }

      try {
        const url = `${config.bountiesApiBaseUrl}?creatorUsername=${encodeURIComponent(creatorUsername)}`;
        const response = await fetch(url, { credentials: "include" });
        if (response.ok) {
          const data = await response.json();
          setBounties(data.bounties);
        }
      } catch (error) {
        console.error("Failed to fetch bounties", error);
      }
    };

    void fetchBounties();
  }, []);

  const handleCreateBounty = async (e: React.FormEvent) => {
    e.preventDefault();

    if (description.trim().length < 10) {
      toast({
        title: "Description is too short",
        description: "Please provide a description of at least 10 characters.",
        variant: "destructive",
      });
      return;
    }

    const userEmail = sessionStorage.getItem("userEmail");
    const sessionProfile = loadSessionProfile();
    const creatorUsername = sessionProfile?.username ?? "";

    const bountyData = {
      title,
      description,
      category,
      rewardAmount: parseInt(rewardAmount, 10),
      rewardToken,
      deadline: deadline ? new Date(`${format(deadline, "yyyy-MM-dd")}T${time}`).toISOString() : new Date().toISOString(),
      creatorEmail: userEmail,
      creatorUsername,
    };

    if (editingBounty) {
      const updatePayload = { ...bountyData, status };
      try {
        const response = await fetch(`${config.bountiesApiBaseUrl}/${editingBounty.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatePayload),
          credentials: "include",
        });

        if (response.ok) {
          const updatedBounty = await response.json();
          setBounties((prevBounties) =>
            prevBounties.map((b) => (b.id === editingBounty.id ? updatedBounty.bounty : b))
          );
          setEditingBounty(null);
          // Reset form
          setTitle("");
          setDescription("");
          setCategory("dev");
          setRewardAmount("");
          setRewardToken("USDC");
          setDeadline(undefined);
          setTime("00:00");
          setStatus("open");
        } else {
          console.error("Failed to update bounty");
        }
      } catch (error) {
        console.error("Failed to update bounty", error);
      }
      return;
    }

    try {
      const response = await fetch(config.bountiesApiBaseUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bountyData),
        credentials: "include",
      });

      const data = await response.json();

      if (response.ok) {
        const newBounty = data.bounty || data;
        setBounties((prevBounties) => [newBounty, ...prevBounties]);
        // Reset form
        setTitle("");
        setDescription("");
        setCategory("dev");
        setRewardAmount("");
        setRewardToken("USDC");
        setDeadline(undefined);
        setTime("00:00");
        setStatus("open");
      } else {
        const error = data?.error;
        let errorMessage = "An unknown error occurred.";

        if (typeof error === 'string') {
            errorMessage = error;
        } else if (error?.username && Array.isArray(error.username) && error.username.length > 0) {
            errorMessage = error.username[0];
        } else {
            errorMessage = data?.message || "Không thể tạo bounty, vui lòng thử lại.";
        }
        
        toast({
          title: "Failed to create bounty",
          description: errorMessage,
          variant: "destructive",
        });
        console.error("Failed to create bounty", { status: response.status, body: data });
      }
    } catch (error) {
      console.error("Failed to create bounty", error);
    }
  };

  const handleDelete = async (bountyId: string) => {
    try {
      const response = await fetch(`${config.bountiesApiBaseUrl}/${bountyId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (response.ok) {
        setBounties((prevBounties) => prevBounties.filter((bounty) => bounty.id !== bountyId));
      } else {
        console.error("Failed to delete bounty");
      }
    } catch (error) {
      console.error("Failed to delete bounty", error);
    }
  };

  return (
    <div className="min-h-screen overflow-y-auto bg-gradient-to-b from-black via-slate-950 to-black text-white">
      <NavBar />
      <main className="mx-auto w-full max-w-7xl px-6 py-10 space-y-12">
        <Card className="border-white/10 bg-slate-900/60 text-white">
          <CardHeader>
            <CardTitle>Bounty mutations</CardTitle>
            <CardDescription>Create, update, or delete bounties.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateBounty} className="space-y-6">
              <h3 className="text-lg font-semibold">Create bounty</h3>
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wide text-muted-foreground">Title</label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Design landing page"
                  className="bg-black/30 border-white/10 text-white"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wide text-muted-foreground">Description</label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Longer markdown or plain text"
                  className="bg-black/30 border-white/10 text-white"
                  rows={4}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-wide text-muted-foreground">Category</label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="bg-black/30 border-white/10 text-white">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 text-white border-white/10">
                      <SelectItem value="dev">dev</SelectItem>
                      <SelectItem value="design">design</SelectItem>
                      <SelectItem value="content">content</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-wide text-muted-foreground">Reward Amount</label>
                  <Input
                    type="number"
                    value={rewardAmount}
                    onChange={(e) => setRewardAmount(e.target.value)}
                    placeholder="250"
                    className="bg-black/30 border-white/10 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-wide text-muted-foreground">Reward Token</label>
                  <Input
                    value={rewardToken}
                    onChange={(e) => setRewardToken(e.target.value)}
                    placeholder="USDC"
                    className="bg-black/30 border-white/10 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-wide text-muted-foreground">Deadline</label>
                  <div className="flex gap-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={`w-full justify-start text-left font-normal bg-black/30 border-white/10 text-white ${
                            !deadline && "text-muted-foreground"
                          }`}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {deadline ? format(deadline, "PPP") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 bg-slate-900 text-white border-white/10" align="start">
                        <Calendar
                          mode="single"
                          selected={deadline}
                          onSelect={setDeadline}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <Input
                      type="time"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="bg-black/30 border-white/10 text-white w-32"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-wide text-muted-foreground">Status</label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger className="bg-black/30 border-white/10 text-white">
                      <SelectValue placeholder="Select a status" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 text-white border-white/10">
                      <SelectItem value="open">open</SelectItem>
                      <SelectItem value="in_review">in_review</SelectItem>
                      <SelectItem value="in-progress">in-progress</SelectItem>
                      <SelectItem value="closed">closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button type="submit" className="bg-red-500 hover:bg-red-600">
                {editingBounty ? "Update Bounty" : "Create Bounty"}
              </Button>
              {editingBounty && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setEditingBounty(null);
                    // Reset form
                    setTitle("");
                    setDescription("");
                    setCategory("dev");
                    setRewardAmount("");
                    setRewardToken("USDC");
                    setDeadline(undefined);
                    setTime("00:00");
                    setStatus("open");
                  }}
                >
                  Cancel
                </Button>
              )}
            </form>
          </CardContent>
        </Card>

        <section>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input placeholder="Search..." className="bg-slate-800 border-slate-700 pl-10" />
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" className="bg-yellow-400 text-black border-yellow-400">ALL</Button>
              <Button variant="outline" className="border-slate-700 hover:bg-slate-800">COURSES</Button>
              <Button variant="outline" className="border-slate-700 hover:bg-slate-800">QUESTS</Button>
              <Button variant="outline" className="border-slate-700 hover:bg-slate-800">POSTS</Button>
            </div>
            <Button variant="outline" className="border-slate-700 hover:bg-slate-800 flex items-center gap-2">
              <Filter className="h-4 w-4" />
              FILTER
            </Button>
          </div>

          <div className="space-y-4">
            {bounties.map((bounty) => (
              <Card key={bounty.id} className="border-white/10 bg-slate-900/60 text-white flex flex-col md:flex-row items-center justify-between p-6 gap-4">
                <div className="flex items-center gap-4">
                  <div className="bg-blue-500/80 p-3 rounded-lg">
                    <Star className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg">{bounty.title}</h4>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                      <span>{bounty.category}</span>
                      <span className="flex items-center gap-1"><CalendarIcon className="h-4 w-4" /> Due {new Date(bounty.deadline).toLocaleDateString()}</span>
                      <span className="flex items-center gap-1"><Tag className="h-4 w-4" /> {bounty.status}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-lg font-bold text-blue-400">{bounty.rewardAmount} {bounty.rewardToken}</p>
                  </div>
                  <Button className="bg-blue-500 hover:bg-blue-600" onClick={() => setEditingBounty(bounty)}>Edit</Button>
                  <Button className="bg-red-500 hover:bg-red-600" onClick={() => handleDelete(bounty.id)}>Delete</Button>
                </div>
              </Card>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default CreateBounty;
