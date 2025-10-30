import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, PlayCircle } from "lucide-react";
import { Link } from "react-router-dom";
import NavBar from "@/components/NavBar";

// Removed navItems as they are now in NavBar component

const heroStats = [
  { label: "Number of members", value: "5.7M", suffix: "Builders" },
  { label: "GitHub commits", value: "982K", suffix: "Commits" },
  { label: "Total rewards", value: "10K", suffix: "Bounties" },
];

const learningResources = [
  { course: "Intro to Sui Smart Contracts", category: "Smart Contracts" },
  { course: "Building Your First dApp", category: "Web3 Development" },
  { course: "NFT Marketplace Tutorial", category: "Tools & Wallets" },
  { course: "Mastering Move Language", category: "Programming" },
  { course: "Deploy Your First NFT", category: "NFT Development" },
  { course: "Creating On-Chain Games", category: "GameFi" },
  { course: "Tokenomics 101: Design", category: "Economics" },
  { course: "Web3 Frontend with React", category: "Frontend" },
  { course: "Secure Smart Contracts", category: "Security" },
  { course: "Building DAO Tools on Sui", category: "Governance" },
];

const openBounties = [
  { title: "Build a Sui Portfolio Dashboard", reward: 500 },
  { title: "Create On-Chain Voting Module", reward: 500 },
  { title: "Design Sui Ecosystem Landing Page", reward: 500 },
  { title: "Implement NFT Minting Flow", reward: 500 },
  { title: "Improve Sui SDK Docs", reward: 500 },
  { title: "Build a Telegram Bot for Sui", reward: 500 },
  { title: "Create a Move-based Quiz dApp", reward: 500 },
  { title: "Build Sui Gas Tracker Widget", reward: 500 },
  { title: "Write Tutorial: Deploy a Token", reward: 500 },
  { title: "Fix UI Bug in Open Bounties Repo", reward: 500 },
];

const topContributors = Array.from({ length: 10 }, (_, index) => ({
  profile: "Intro to Sui Smart Contracts",
  score: 549,
  rank: index + 1,
}));

const Index = () => {
  return (
    <main className="min-h-screen bg-[#080808] text-white">
      <NavBar />
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#FF0000] via-[#FF5A00] to-[#FFB800]" />
        <div className="absolute -right-32 top-10 h-64 w-64 rounded-full bg-[#FFEB00]/40 blur-3xl" />
        <div className="absolute -left-32 bottom-0 h-72 w-72 rounded-full bg-[#890A0A]/50 blur-3xl" />
        <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-12 px-6 pb-20 pt-24 sm:px-10 lg:px-16">
          <div className="max-w-3xl space-y-6 text-center md:text-left">
            <p className="uppercase tracking-[0.35em] text-white/70">Sui Developer Community</p>
            <h1 className="text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
              Learn, Build, and Earn in the Sui Developer Community
            </h1>
            <p className="text-lg text-white/80">
              Join thousands of builders learning and earning on-chain. Grow your skills, ship faster, and unlock new
              opportunities across the Sui ecosystem.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 md:justify-start">
              <Button className="flex items-center gap-2 rounded-full border border-transparent bg-[#FFEB00] px-6 py-6 text-base font-semibold text-black hover:bg-[#FCD200]">
                Start Learning
                <PlayCircle className="h-4 w-4" />
              </Button>
              <Link to="/explore">
                <Button
                  variant="outline"
                  className="flex items-center gap-2 rounded-full border-white/60 bg-white/10 px-6 py-6 text-base font-semibold text-white hover:border-[#FFAE00] hover:text-[#FFAE00]"
                >
                  Explore Bounties
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {heroStats.map(stat => (
              <Card
                key={stat.label}
                className="border border-white/10 bg-black/40 backdrop-blur transition hover:border-[#FFAE00]/60 hover:shadow-[0_0_45px_rgba(255,174,0,0.25)]"
              >
                <CardContent className="space-y-3 px-6 py-5">
                  <p className="text-xs uppercase tracking-[0.25em] text-white/60">{stat.label}</p>
                  <p className="text-3xl font-bold text-[#FFEB00]">
                    {stat.value} <span className="text-base font-semibold text-white/80">{stat.suffix}</span>
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 py-16 sm:px-10 lg:px-16">
        <div className="grid gap-8 lg:grid-cols-3">
          <Card className="border-white/10 bg-[#111]">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-white">Learning Resources</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full border-collapse text-sm text-white/80">
                <thead className="text-xs uppercase tracking-wide text-white/50">
                  <tr className="border-b border-white/5">
                    <th className="px-5 py-3 text-left font-medium">#</th>
                    <th className="px-5 py-3 text-left font-medium">Course</th>
                    <th className="px-5 py-3 text-left font-medium">Category</th>
                  </tr>
                </thead>
                <tbody>
                  {learningResources.map((resource, index) => (
                    <tr
                      key={resource.course}
                      className="border-b border-white/5 last:border-b-0 odd:bg-white/[0.02]"
                    >
                      <td className="px-5 py-3 text-white/60">{index + 1}</td>
                      <td className="px-5 py-3 font-medium text-white">{resource.course}</td>
                      <td className="px-5 py-3 text-white/60">{resource.category}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-[#111]">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-white">Open Bounties</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full border-collapse text-sm text-white/80">
                <thead className="text-xs uppercase tracking-wide text-white/50">
                  <tr className="border-b border-white/5">
                    <th className="px-5 py-3 text-left font-medium">#</th>
                    <th className="px-5 py-3 text-left font-medium">Bounty Title</th>
                    <th className="px-5 py-3 text-left font-medium">Reward</th>
                  </tr>
                </thead>
                <tbody>
                  {openBounties.map((bounty, index) => (
                    <tr
                      key={bounty.title}
                      className="border-b border-white/5 last:border-b-0 odd:bg-white/[0.02]"
                    >
                      <td className="px-5 py-3 text-white/60">{index + 1}</td>
                      <td className="px-5 py-3 font-medium text-white">{bounty.title}</td>
                      <td className="px-5 py-3 text-[#4DA2FF] font-semibold">{bounty.reward}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-[#111]">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-white">Top Contributors</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full border-collapse text-sm text-white/80">
                <thead className="text-xs uppercase tracking-wide text-white/50">
                  <tr className="border-b border-white/5">
                    <th className="px-5 py-3 text-left font-medium">#</th>
                    <th className="px-5 py-3 text-left font-medium">Profile</th>
                    <th className="px-5 py-3 text-left font-medium">Builder Score</th>
                  </tr>
                </thead>
                <tbody>
                  {topContributors.map(contributor => (
                    <tr
                      key={contributor.rank}
                      className="border-b border-white/5 last:border-b-0 odd:bg-white/[0.02]"
                    >
                      <td className="px-5 py-3 text-white/60">{contributor.rank}</td>
                      <td className="px-5 py-3 font-medium text-white">{contributor.profile}</td>
                      <td className="px-5 py-3 text-[#FFAE00] font-semibold">{contributor.score}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
};

export default Index;
