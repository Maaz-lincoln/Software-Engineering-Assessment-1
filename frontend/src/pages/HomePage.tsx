import HeroSearch from "../features/search/HeroSearch";
import TopNav from "@/components/shared/TopNav";

const HomePage = () => (
  <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-blue-950">
    <TopNav />
    <div className="flex flex-col md:flex-row items-center justify-center min-h-[90vh] pt-5 px-6 max-w-7xl mx-auto">
      <div className="flex-1 px-2 animate-fade-in w-full flex flex-col justify-center items-center">
        <h1 className="text-4xl text-center md:text-5xl font-extrabold mb-6 tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-blue-500">
          Explore a World of <br />
          Open-License Media
        </h1>
        <p className="mb-8 text-lg md:text-xl text-center text-zinc-300">
          Dive into a vast collection of free stock photos, audio, and <br />
          illustrations—ready for your next project.
        </p>
        <HeroSearch />
        <p className="mt-7 text-sm text-zinc-400">
          All assets are free to use for personal and commercial projects—no
          attribution required.
        </p>
      </div>
    </div>
  </div>
);

export default HomePage;
