import NavBar from "@/components/NavBar";

const ComingSoon = () => {
  return (
    <div className="min-h-screen overflow-y-auto bg-gradient-to-b from-black via-slate-950 to-black text-white">
      <NavBar />
      <main className="mx-auto flex w-full max-w-7xl flex-col items-center justify-center px-6 py-10" style={{ minHeight: 'calc(100vh - 88px)' }}>
        <div className="text-center">
          <h1 className="text-5xl font-bold text-blue-400">Coming Soon</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            We're working hard to bring you something amazing. Stay tuned!
          </p>
        </div>
      </main>
    </div>
  );
};

export default ComingSoon;
