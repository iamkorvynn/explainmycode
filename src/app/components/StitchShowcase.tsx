import { useState } from "react";
import { useNavigate } from "react-router";
import {
  Search,
  SlidersHorizontal,
  Home,
  Grid,
  Bookmark,
  History,
  Eye,
  Settings,
  Heart,
  LogOut,
  ChevronDown,
  Plus,
  Minus,
  Check,
  Play,
  Terminal as TerminalIcon,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { motion } from "motion/react";

interface StitchShowcaseProps {
  onLaunchIde?: () => void;
  className?: string;
}

interface AlgorithmCard {
  id: string;
  name: string;
  category: string;
  price: string;
  complexity: string;
  description: string;
  thumbnail: string;
  size: "Small" | "Large";
  count: number;
  isAdded: boolean;
  codeSnippet: string;
}

const INITIAL_CARDS: AlgorithmCard[] = [
  {
    id: "quicksort",
    name: "Quicksort Engine",
    category: "Algorithms",
    price: "$ 5.98",
    complexity: "O(n log n)",
    description: "In-place divide-and-conquer partition algorithm with randomized median pivot.",
    thumbnail: "⚡",
    size: "Small",
    count: 3,
    isAdded: true,
    codeSnippet: "def quicksort(arr): return arr if len(arr) <= 1 else ...",
  },
  {
    id: "binary-search",
    name: "Binary Search",
    category: "Algorithms",
    price: "$ 4.98",
    complexity: "O(log n)",
    description: "Logarithmic interval reduction over sorted arrays with branchless bounds.",
    thumbnail: "🎯",
    size: "Small",
    count: 1,
    isAdded: false,
    codeSnippet: "while left <= right: mid = (left + right) // 2 ...",
  },
  {
    id: "dijkstra",
    name: "Dijkstra Shortest Path",
    category: "Graphs",
    price: "$ 6.45",
    complexity: "O((V+E) log V)",
    description: "Fibonacci min-heap priority queue graph traversal for single-source paths.",
    thumbnail: "🗺️",
    size: "Large",
    count: 2,
    isAdded: false,
    codeSnippet: "heapq.heappush(pq, (dist, start_vertex)) ...",
  },
  {
    id: "lru-cache",
    name: "LRU Cache Memory",
    category: "Data Structures",
    price: "$ 5.50",
    complexity: "O(1) time",
    description: "Hash-map indexed doubly linked list with fast eviction eviction and O(1) ops.",
    thumbnail: "🧠",
    size: "Small",
    count: 1,
    isAdded: true,
    codeSnippet: "class LRUCache: def __init__(self, capacity: int) ...",
  },
];

const CATEGORIES = ["All Code", "Algorithms", "Graphs", "Data Structures", "Python 3.14", "C++ 15"];

export function StitchShowcase({ onLaunchIde, className = "" }: StitchShowcaseProps) {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState("All Code");
  const [cards, setCards] = useState<AlgorithmCard[]>(INITIAL_CARDS);
  const [activeMode, setActiveMode] = useState<"Interactive" | "Benchmark" | "AI Mentor">("Interactive");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSidebarItem, setActiveSidebarItem] = useState("Menu");

  const filteredCards = cards.filter((card) => {
    const matchesCategory = activeCategory === "All Code" || card.category === activeCategory;
    const matchesSearch =
      card.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleToggleAdd = (id: string) => {
    setCards((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isAdded: !c.isAdded } : c)),
    );
  };

  const handleUpdateCount = (id: string, delta: number) => {
    setCards((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const newCount = Math.max(1, c.count + delta);
          return { ...c, count: newCount };
        }
        return c;
      }),
    );
  };

  const handleToggleSize = (id: string, size: "Small" | "Large") => {
    setCards((prev) =>
      prev.map((c) => (c.id === id ? { ...c, size } : c)),
    );
  };

  const addedItems = cards.filter((c) => c.isAdded);
  const totalItemsCount = addedItems.reduce((acc, curr) => acc + curr.count, 0);

  const handleAction = () => {
    if (onLaunchIde) {
      onLaunchIde();
    } else {
      navigate("/ide");
    }
  };

  return (
    <div
      className={`relative w-full rounded-[36px] p-4 sm:p-6 md:p-8 bg-gradient-to-br from-[#f8d0b5] via-[#f5c29f] to-[#f3b58c] shadow-[0_30px_90px_-20px_rgba(230,120,60,0.35)] border border-white/60 overflow-hidden font-sans select-none ${className}`}
    >
      {/* Background Flowing Topographic Contour Lines */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none opacity-40 mix-blend-overlay"
        viewBox="0 0 1200 800"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M-100 200 C300 100, 600 400, 1300 150"
          stroke="white"
          strokeWidth="1.8"
          strokeDasharray="4 8"
        />
        <path
          d="M-50 450 C350 250, 750 650, 1350 350"
          stroke="white"
          strokeWidth="2.2"
        />
        <path
          d="M-100 700 C400 500, 800 850, 1400 550"
          stroke="white"
          strokeWidth="1.6"
        />
        <circle cx="1120" cy="80" r="140" stroke="white" strokeWidth="1.4" opacity="0.4" />
      </svg>

      {/* Brand Watermark / Double Slash in Bottom Right */}
      <div className="absolute right-8 bottom-6 text-white/50 text-5xl font-black tracking-tighter pointer-events-none select-none">
        //
      </div>

      {/* Main Floating Stitch Studio Canvas */}
      <div className="relative z-10 w-full rounded-[30px] bg-white shadow-[0_20px_50px_rgba(0,0,0,0.06)] border border-[#f0ede6] overflow-hidden flex flex-col lg:flex-row min-h-[640px]">
        {/* Left Navigation Sidebar */}
        <aside className="w-full lg:w-56 shrink-0 bg-[#fbfbfa] border-b lg:border-b-0 lg:border-r border-[#f1eee7] p-5 flex flex-col justify-between">
          <div>
            {/* Brand Logo matching Purr'Coffee in Reference */}
            <div
              onClick={() => navigate("/ide")}
              className="flex items-center gap-2 mb-8 cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-xl bg-[#ff7a50] flex items-center justify-center shadow-md shadow-[#ff7a50]/30 text-white font-bold text-sm">
                ✦
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-[#1e1e24] text-lg tracking-tight leading-none group-hover:text-[#ff7a50] transition-colors">
                  Explain<span className="text-[#ff7a50]">&apos;</span>Code
                </span>
                <span className="text-[10px] text-[#9ca3af] font-medium tracking-wide">
                  STITCH STUDIO
                </span>
              </div>
            </div>

            {/* Main Menu Links */}
            <nav className="space-y-1.5 text-sm">
              <button
                onClick={() => setActiveSidebarItem("Home")}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl font-medium transition-all ${
                  activeSidebarItem === "Home"
                    ? "bg-white text-[#ff7a50] shadow-sm shadow-black/5 font-semibold"
                    : "text-[#64748b] hover:text-[#1e1e24] hover:bg-black/5"
                }`}
              >
                <Home className="w-4 h-4 text-[#ff7a50]" />
                <span>Home page</span>
              </button>

              <button
                onClick={() => setActiveSidebarItem("Menu")}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl font-medium transition-all ${
                  activeSidebarItem === "Menu"
                    ? "bg-white text-[#ff7a50] shadow-sm shadow-black/5 font-semibold"
                    : "text-[#64748b] hover:text-[#1e1e24] hover:bg-black/5"
                }`}
              >
                <Grid className="w-4 h-4" />
                <span>Menu</span>
              </button>

              <button
                onClick={() => {
                  setActiveSidebarItem("Workspaces");
                  navigate("/ide");
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl font-medium transition-all ${
                  activeSidebarItem === "Workspaces"
                    ? "bg-white text-[#ff7a50] shadow-sm shadow-black/5 font-semibold"
                    : "text-[#64748b] hover:text-[#1e1e24] hover:bg-black/5"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Bookmark className="w-4 h-4" />
                  <span>My orders</span>
                </div>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#ff7a50] text-white">
                  13
                </span>
              </button>

              <button
                onClick={() => setActiveSidebarItem("History")}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl font-medium transition-all ${
                  activeSidebarItem === "History"
                    ? "bg-white text-[#ff7a50] shadow-sm shadow-black/5 font-semibold"
                    : "text-[#64748b] hover:text-[#1e1e24] hover:bg-black/5"
                }`}
              >
                <History className="w-4 h-4" />
                <span>History</span>
              </button>
            </nav>

            <div className="my-5 border-t border-[#f1eee7]" />

            {/* Secondary Links */}
            <div className="space-y-1.5 text-sm">
              <button
                onClick={() => navigate("/visualize")}
                className="w-full flex items-center gap-3 px-3.5 py-2 rounded-2xl text-[#64748b] hover:text-[#1e1e24] hover:bg-black/5 font-medium transition-all"
              >
                <Eye className="w-4 h-4" />
                <span>Visualizer</span>
              </button>

              <button
                onClick={() => navigate("/analysis")}
                className="w-full flex items-center justify-between px-3.5 py-2 rounded-2xl text-[#64748b] hover:text-[#1e1e24] hover:bg-black/5 font-medium transition-all"
              >
                <div className="flex items-center gap-3">
                  <Settings className="w-4 h-4" />
                  <span>Settings</span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-[#9ca3af]" />
              </button>

              <a
                href="https://github.com/iamkorvynn/explainmycode"
                target="_blank"
                rel="noreferrer"
                className="w-full flex items-center gap-3 px-3.5 py-2 rounded-2xl text-[#64748b] hover:text-[#ff7a50] hover:bg-black/5 font-medium transition-all"
              >
                <div className="w-4 h-4 rounded-full bg-[#ff7a50]/20 flex items-center justify-center">
                  <Heart className="w-2.5 h-2.5 text-[#ff7a50] fill-[#ff7a50]" />
                </div>
                <span>Star on GitHub</span>
              </a>
            </div>
          </div>

          {/* Bottom Logout */}
          <div className="pt-4 border-t border-[#f1eee7] mt-4">
            <button
              onClick={() => navigate("/login")}
              className="w-full flex items-center gap-3 px-3.5 py-2 rounded-2xl text-[#64748b] hover:text-[#ef4444] hover:bg-[#ef4444]/5 font-medium transition-all"
            >
              <LogOut className="w-4 h-4" />
              <span>Log out</span>
            </button>
          </div>
        </aside>

        {/* Center Main Stage (Search, Filters, Product Card Grid) */}
        <main className="flex-1 p-5 sm:p-6 lg:p-7 flex flex-col justify-between overflow-y-auto">
          <div>
            {/* Top Bar: Search with Coral Filter Button & User Profile Chip */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6">
              {/* Search pill */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9ca3af]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search code, algorithms, complexity..."
                  className="w-full h-11 pl-11 pr-24 rounded-full bg-[#f8f8f7] border border-[#ebe7df] text-sm text-[#1e1e24] placeholder:text-[#9ca3af] focus:outline-none focus:border-[#ff7a50] transition-colors"
                />
                <button
                  onClick={handleAction}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 px-4 h-8 rounded-full bg-[#ff7a50] hover:bg-[#ff6838] text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm shadow-[#ff7a50]/30 transition-all active:scale-95"
                >
                  <SlidersHorizontal className="w-3 h-3" />
                  <span>Filter</span>
                </button>
              </div>

              {/* User Profile Chip matching Reference */}
              <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#ff7a50] to-[#f59e0b] p-0.5 shadow-sm">
                  <div className="w-full h-full rounded-full bg-[#1e293b] flex items-center justify-center text-white text-xs font-bold">
                    AF
                  </div>
                </div>
                <div className="hidden sm:flex flex-col">
                  <span className="text-xs font-bold text-[#1e1e24] leading-tight">Albert Flores</span>
                  <span className="text-[10px] text-[#9ca3af]">developer@explainmycode.dev</span>
                </div>
              </div>
            </div>

            {/* Horizontal Category Filter Pills */}
            <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none mb-6">
              {CATEGORIES.map((cat) => {
                const isActive = activeCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-5 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                      isActive
                        ? "bg-[#ff7a50] text-white shadow-md shadow-[#ff7a50]/25"
                        : "bg-white text-[#475569] border border-[#e8e5dc] hover:bg-[#fbfbfa] hover:text-[#1e1e24]"
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>

            {/* Section Heading */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-extrabold text-lg text-[#1e1e24] tracking-tight">
                Code & Algorithm menu
              </h3>
              <span className="text-xs text-[#9ca3af] font-medium">
                {filteredCards.length} modules available
              </span>
            </div>

            {/* 2x2 Card Grid matching Purr'Coffee Product Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredCards.map((card) => (
                <div
                  key={card.id}
                  className="rounded-2xl p-4 bg-white border border-[#ece8df] shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_30px_rgba(0,0,0,0.06)] hover:border-[#ff7a50]/40 transition-all flex flex-col justify-between"
                >
                  <div className="flex items-start gap-3.5 mb-3">
                    {/* Thumbnail Box */}
                    <div className="w-16 h-20 rounded-xl bg-gradient-to-b from-[#f8f8f7] to-[#efece4] border border-[#e5e1d7] flex flex-col items-center justify-center shrink-0 text-2xl shadow-inner">
                      <span>{card.thumbnail}</span>
                      <span className="text-[9px] font-bold text-[#64748b] mt-1 uppercase">
                        {card.size}
                      </span>
                    </div>

                    {/* Meta info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <h4 className="font-bold text-sm text-[#1e1e24] truncate">
                          {card.name}
                        </h4>
                        <span className="font-bold text-xs text-[#ff7a50] shrink-0">
                          {card.complexity}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#64748b] leading-relaxed line-clamp-2 mb-2">
                        {card.description}
                      </p>

                      {/* Segmented Size Pills */}
                      <div className="flex items-center gap-2 text-[11px]">
                        <span className="text-[#9ca3af] font-medium">Size</span>
                        <div className="flex items-center bg-[#f5f4ef] rounded-full p-0.5 border border-[#e7e4dc]">
                          <button
                            onClick={() => handleToggleSize(card.id, "Small")}
                            className={`px-2.5 py-0.5 rounded-full font-semibold transition-all ${
                              card.size === "Small"
                                ? "bg-[#1e1e24] text-white shadow-xs"
                                : "text-[#64748b] hover:text-[#1e1e24]"
                            }`}
                          >
                            Small
                          </button>
                          <button
                            onClick={() => handleToggleSize(card.id, "Large")}
                            className={`px-2.5 py-0.5 rounded-full font-semibold transition-all ${
                              card.size === "Large"
                                ? "bg-[#1e1e24] text-white shadow-xs"
                                : "text-[#64748b] hover:text-[#1e1e24]"
                            }`}
                          >
                            Large
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Bottom: Quantity Counter & Coral CTA */}
                  <div className="flex items-center justify-between gap-3 pt-2.5 border-t border-[#f4f2eb]">
                    {/* Quantity Stepper */}
                    <div className="flex items-center gap-2 text-xs font-bold text-[#1e1e24]">
                      <button
                        onClick={() => handleUpdateCount(card.id, -1)}
                        className="w-6 h-6 rounded-full border border-[#e2ded5] flex items-center justify-center text-[#64748b] hover:bg-[#f5f4ef] active:scale-90 transition-all"
                      >
                        <Minus className="w-2.5 h-2.5" />
                      </button>
                      <span className="w-4 text-center">{card.count}</span>
                      <button
                        onClick={() => handleUpdateCount(card.id, 1)}
                        className="w-6 h-6 rounded-full border border-[#e2ded5] flex items-center justify-center text-[#64748b] hover:bg-[#f5f4ef] active:scale-90 transition-all"
                      >
                        <Plus className="w-2.5 h-2.5" />
                      </button>
                    </div>

                    {/* Add to Deck / Added Button */}
                    <button
                      onClick={() => handleToggleAdd(card.id)}
                      className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
                        card.isAdded
                          ? "bg-[#ff7a50] text-white shadow-sm shadow-[#ff7a50]/30"
                          : "border border-[#ff7a50] text-[#ff7a50] hover:bg-[#ff7a50]/5 active:scale-95"
                      }`}
                    >
                      {card.isAdded ? (
                        <>
                          <Check className="w-3 h-3 stroke-[3]" />
                          <span>Added to cart</span>
                        </>
                      ) : (
                        <span>Add to Cart</span>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>

        {/* Right Panel: The "Cart" / Inspector Deck */}
        <aside className="w-full lg:w-72 shrink-0 bg-[#fcfbfa] border-t lg:border-t-0 lg:border-l border-[#f1eee7] p-5 flex flex-col justify-between">
          <div>
            {/* Header with Order ID */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-extrabold text-lg text-[#1e1e24] tracking-tight">Cart</h3>
              <span className="text-[11px] text-[#9ca3af] font-semibold">Order #3243</span>
            </div>

            {/* Delivery / Dine in / Take away Segmented Pills */}
            <div className="grid grid-cols-3 gap-1 bg-[#edeae2] p-1 rounded-full mb-5 text-[11px] font-semibold">
              {(["Delivery", "Dine in", "Take away"] as const).map((mode) => {
                const isActive = (mode === "Delivery" && activeMode === "Interactive") ||
                                 (mode === "Dine in" && activeMode === "Benchmark") ||
                                 (mode === "Take away" && activeMode === "AI Mentor");
                return (
                  <button
                    key={mode}
                    onClick={() => {
                      if (mode === "Delivery") setActiveMode("Interactive");
                      if (mode === "Dine in") setActiveMode("Benchmark");
                      if (mode === "Take away") setActiveMode("AI Mentor");
                    }}
                    className={`py-1.5 rounded-full text-center transition-all ${
                      isActive
                        ? "bg-[#1e1e24] text-white shadow-sm"
                        : "text-[#64748b] hover:text-[#1e1e24]"
                    }`}
                  >
                    {mode}
                  </button>
                );
              })}
            </div>

            {/* List of Added Modules */}
            <div className="space-y-3.5 mb-6">
              {addedItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-[#f0ede6] flex items-center justify-center text-lg shrink-0">
                      {item.thumbnail}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-[#1e1e24] truncate">{item.name}</div>
                      <div className="text-[10px] text-[#9ca3af]">{item.size} • 200g</div>
                    </div>
                  </div>

                  {/* Quantity & Price */}
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-bold text-[#1e1e24]">{item.price}</span>
                    <div className="flex items-center gap-1 text-[11px]">
                      <button
                        onClick={() => handleUpdateCount(item.id, -1)}
                        className="w-4 h-4 rounded-full border border-[#e2ded5] flex items-center justify-center text-[#64748b]"
                      >
                        -
                      </button>
                      <span className="font-semibold text-xs text-[#1e1e24]">{item.count}</span>
                      <button
                        onClick={() => handleUpdateCount(item.id, 1)}
                        className="w-4 h-4 rounded-full border border-[#e2ded5] flex items-center justify-center text-[#64748b]"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Divider */}
            <div className="border-t border-[#f0ede6] my-4" />

            {/* Totals Breakdown matching Reference */}
            <div className="space-y-2 text-xs font-medium">
              <div className="flex justify-between text-[#64748b]">
                <span>Items ({totalItemsCount})</span>
                <span className="font-bold text-[#1e1e24]">$ 20.92</span>
              </div>
              <div className="flex justify-between text-[#64748b]">
                <span>Discounts</span>
                <span className="font-bold text-[#1e1e24]">-$ 3.00</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-[#1e1e24] pt-2 border-t border-[#f0ede6]">
                <span>Total</span>
                <span className="text-[#ff7a50]">$ 17.92</span>
              </div>
            </div>
          </div>

          {/* Big Prominent Coral CTA Button matching Reference */}
          <div className="pt-5">
            <button
              onClick={handleAction}
              className="w-full py-3.5 rounded-full bg-[#ff7a50] hover:bg-[#ff6838] text-white font-bold text-sm shadow-md shadow-[#ff7a50]/30 transition-all flex items-center justify-center gap-2 active:scale-98"
            >
              <span>Place an order</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
