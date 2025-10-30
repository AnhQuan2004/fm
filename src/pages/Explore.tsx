import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import NavBar from "@/components/NavBar";
import {
  ArrowUpRight,
  Flame,
  Filter,
  FlameIcon,
  Search,
  Sparkles,
  Tag,
  Trophy,
} from "lucide-react";
import { differenceInCalendarDays, format, isPast } from "date-fns";
import { useBounties } from "@/hooks/use-bounties";

const tabs = ["All", "Courses", "Quests", "Posts"];

const tutorialTags = ["Smart Contracts", "Frontend", "Economics"];

const trendingTutorials = [
  { title: "Deploy a Permissionless Oracle", tag: tutorialTags[0] },
  { title: "Animate Sui Dashboards", tag: tutorialTags[1] },
  { title: "Token Utility Design 101", tag: tutorialTags[2] },
];

const contributors = [
  { name: "JulioMCruz.base.eth" },
  { name: "MystenLabs.eth" },
  { name: "BuilderDAO.sui" },
  { name: "SuiMaps.eth" },
];

const toTitleCase = (value?: string) => {
  if (!value) {
    return "";
  }

  return value
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
};

const formatReward = (amount?: number, token?: string) => {
  if (typeof amount !== "number" || Number.isNaN(amount)) {
    return token ?? "—";
  }

  const formattedAmount = new Intl.NumberFormat(undefined, {
    maximumFractionDigits: amount % 1 ? 2 : 0,
  }).format(amount);

  return token ? `${formattedAmount} ${token}` : formattedAmount;
};

const getDueLabel = (deadline?: string) => {
  if (!deadline) {
    return null;
  }

  const date = new Date(deadline);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  if (isPast(date)) {
    return "Closed";
  }

  const daysUntilDue = differenceInCalendarDays(date, new Date());

  if (daysUntilDue <= 0) {
    return "Due today";
  }

  if (daysUntilDue < 7) {
    return `Due in ${daysUntilDue}d`;
  }

  if (daysUntilDue < 30) {
    const weeksUntilDue = Math.ceil(daysUntilDue / 7);
    return `Due in ${weeksUntilDue}w`;
  }

  return `Due ${format(date, "MMM d, yyyy")}`;
};

const Explore = () => {
  const {
    data: bountyData = [],
    isLoading,
    isError,
    error,
  } = useBounties();

  const bounties = useMemo(
    () =>
      bountyData
        .slice()
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        ),
    [bountyData],
  );

  const featuredIds = useMemo(
    () => new Set(bounties.slice(0, 2).map(bounty => bounty.id)),
    [bounties],
  );

  const topBounties = useMemo(() => bounties.slice(0, 3), [bounties]);

  const errorMessage = error instanceof Error ? error.message : "Unknown error";

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-[#0B0B0B] to-black text-white">
      <NavBar />

      <section className="border-b border-white/10 bg-[#050505]/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 pb-8 pt-24 sm:px-10 lg:px-16">
          <div className="grid gap-6">
            <Card className="border-white/10 bg-gradient-to-r from-[#FF3A00]/80 to-[#FFC200]/80 text-white shadow-lg">
              <CardContent className="flex flex-col gap-6 px-8 py-8 md:flex-row md:justify-between md:py-10">
                <div>
                  <p className="uppercase tracking-[0.4em] text-white/75">Explore</p>
                  <h1 className="mt-3 text-4xl font-bold leading-tight sm:text-5xl">
                    Discovery hub for content
                    <br /> and opportunities.
                  </h1>
                </div>
                <div className="flex items-center gap-3 md:flex-col md:items-start">
                  <Badge className="bg-white/20 text-xs uppercase text-white">
                    Featured Listings
                  </Badge>
                  <Badge className="bg-white/20 text-xs uppercase text-white">
                    Weekly Highlights
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl gap-8 px-6 py-10 sm:px-10 lg:px-16 lg:grid lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <div className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-[#101010]/80 p-5 backdrop-blur md:flex-row md:items-center md:justify-between">
            <div className="flex w-full flex-col gap-3 md:flex-row md:items-center">
              <div className="flex flex-1 items-center gap-2 rounded-full border border-white/10 bg-black/40 px-4 py-2">
                <Search className="h-4 w-4 text-white/60" />
                <Input
                  placeholder="Search bounties, courses, posts..."
                  className="h-9 border-0 bg-transparent text-sm text-white placeholder:text-white/50 focus-visible:ring-0"
                />
              </div>
              <div className="flex items-center gap-2">
                {tabs.map(tab => (
                  <button
                    key={tab}
                    className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wide transition ${
                      tab === "All"
                        ? "bg-[#FFEB00] text-black"
                        : "bg-black/30 text-white/70 hover:bg-black/50"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>
            <Button
              variant="outline"
              className="border-white/20 bg-black/40 text-xs uppercase tracking-wide text-white hover:border-[#4DA2FF] hover:text-[#4DA2FF]"
            >
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
          </div>

          <div className="space-y-4">
            {isLoading &&
              Array.from({ length: 3 }).map((_, index) => (
                <Card
                  key={`loading-${index}`}
                  className="border border-white/10 bg-black/40 text-white shadow-lg"
                >
                  <CardContent className="animate-pulse space-y-4 p-5">
                    <div className="h-4 w-3/4 rounded bg-white/10" />
                    <div className="h-3 w-full rounded bg-white/10" />
                    <div className="h-3 w-1/2 rounded bg-white/10" />
                  </CardContent>
                </Card>
              ))}

            {isError && (
              <Card className="border border-red-500/40 bg-red-500/5 text-red-200 shadow-lg">
                <CardContent className="p-5 text-sm">
                  Failed to load bounties: {errorMessage}
                </CardContent>
              </Card>
            )}

            {!isLoading && !isError && bounties.length === 0 && (
              <Card className="border border-white/10 bg-black/40 text-white shadow-lg">
                <CardContent className="p-5 text-sm text-white/70">
                  No bounties available yet. Check back soon!
                </CardContent>
              </Card>
            )}

            {!isLoading &&
              !isError &&
              bounties.map(item => {
                const dueLabel = getDueLabel(item.deadline);
                const rewardLabel = formatReward(item.rewardAmount, item.rewardToken);
                const statusLabel = toTitleCase(item.status);
                const categoryLabel = toTitleCase(item.category);
                const isFeatured = featuredIds.has(item.id);

                return (
                  <Card
                    key={item.id}
                    className={`border border-white/10 bg-gradient-to-r ${
                      isFeatured
                        ? "from-[#162447] via-[#1f3c6b] to-[#162447]"
                        : "from-[#111111] via-[#0f0f0f] to-[#111111]"
                    } text-white shadow-lg`}
                  >
                    <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex flex-1 items-start gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#4DA2FF] to-[#0044FF] shadow-md">
                          <Sparkles className="h-6 w-6 text-white" />
                        </div>
                        <div className="space-y-2">
                          <h3 className="text-base font-semibold text-white">{item.title}</h3>
                          <div className="flex flex-wrap items-center gap-3 text-xs text-white/60">
                            {categoryLabel && <span>{categoryLabel}</span>}
                            {dueLabel && (
                              <span className="flex items-center gap-1">
                                <Trophy className="h-3 w-3 text-[#FFEB00]" /> {dueLabel}
                              </span>
                            )}
                            {statusLabel && (
                              <span className="flex items-center gap-1">
                                <Tag className="h-3 w-3 text-[#FFAE00]" /> {statusLabel}
                              </span>
                            )}
                            {isFeatured && (
                              <Badge className="bg-[#FFEB00]/20 text-[#FFEB00]">Featured</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-lg font-semibold text-[#FFEB00]">{rewardLabel}</p>
                          {item.creatorUsername && <p className="text-xs text-blue-400">@{item.creatorUsername}</p>}
                        </div>
                        <Button className="rounded-full bg-white/10 px-5 text-sm font-semibold text-white hover:bg-white/20">
                          Submit
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
          </div>
        </div>

        <aside className="mt-10 space-y-6 lg:mt-0">
          <Card className="border-white/10 bg-[#111111]/80 backdrop-blur">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-semibold text-white">Top Bounties this Week</CardTitle>
              <Badge className="bg-[#FFEB00]/30 text-[#FFEB00]">Hot</Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoading && (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div
                      key={`top-loading-${index}`}
                      className="h-16 rounded-xl border border-white/10 bg-white/5 animate-pulse"
                    />
                  ))}
                </div>
              )}

              {isError && (
                <p className="text-sm text-red-200">
                  Unable to load top bounties: {errorMessage}
                </p>
              )}

              {!isLoading && !isError && topBounties.length === 0 && (
                <p className="text-sm text-white/70">No bounties to highlight yet.</p>
              )}

              {!isLoading &&
                !isError &&
                topBounties.map(bounty => {
                  const rewardLabel = formatReward(bounty.rewardAmount, bounty.rewardToken);
                  const dueLabel = getDueLabel(bounty.deadline);
                  const statusLabel = toTitleCase(bounty.status);

                  return (
                    <div
                      key={bounty.id}
                      className="rounded-xl border border-white/10 bg-black/40 p-4 shadow-md transition hover:border-[#FFAE00]/60"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#4DA2FF] to-[#0044FF]">
                          <Flame className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1 space-y-2">
                          <p className="text-sm font-semibold text-white">{bounty.title}</p>
                          <div className="flex flex-wrap items-center gap-2 text-xs text-white/60">
                            <Badge className="bg-[#4DA2FF]/20 text-[#4DA2FF]">{rewardLabel}</Badge>
                            {statusLabel && (
                              <Badge className="bg-[#FFAE00]/20 text-[#FFAE00] flex items-center gap-1">
                                <FlameIcon className="h-3 w-3" /> {statusLabel}
                              </Badge>
                            )}
                            {dueLabel && <Badge className="bg-white/10 text-white/70">{dueLabel}</Badge>}
                          </div>
                        </div>
                        <ArrowUpRight className="h-4 w-4 text-white/50" />
                      </div>
                    </div>
                  );
                })}
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-[#111111]/80 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-white">Trending Tutorials</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {trendingTutorials.map(tutorial => (
                <div
                  key={tutorial.title}
                  className="flex items-center justify-between rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm"
                >
                  <div className="flex flex-col">
                    <span className="font-semibold text-white">{tutorial.title}</span>
                    <Badge className="mt-1 w-max bg-[#FFEB00]/20 text-xs text-[#FFEB00]">
                      {tutorial.tag}
                    </Badge>
                  </div>
                  <Button variant="ghost" size="icon" className="text-white/60 hover:text-[#FFEB00]">
                    <ArrowUpRight className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-[#111111]/80 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-white">Top Contributors</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {contributors.map(contributor => (
                <div
                  key={contributor.name}
                  className="flex flex-col items-center gap-2 text-center rounded-xl border border-white/10 bg-black/30 p-4"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#4DA2FF] to-[#0044FF] text-white shadow-lg">
                    <Trophy className="h-5 w-5" />
                  </div>
                  <p className="text-xs font-semibold text-white">{contributor.name}</p>
                  <Badge className="bg-[#FFAE00]/20 text-[#FFAE00]">Builder</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </aside>
      </section>
    </main>
  );
};

export default Explore;
