import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function TopNav() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [user, setUser] = useState<{ userName?: string } | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("olm_user");
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser && typeof parsedUser.userName === "string") {
          setUser(parsedUser);
        } else {
          throw new Error("Invalid user format");
        }
      }
    } catch (err) {
      console.error("Failed to parse user from localStorage:", err);
      localStorage.removeItem("olm_user");
    }
  }, []);
  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    setUser(null);
    toast.success("Logged out successfully");
    navigate("/");
  };

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 py-4 px-6 transition-colors duration-300 ${
        isScrolled ? "bg-yellow-400 shadow-md" : "bg-transparent"
      }`}
    >
      <div className="max-w-8xl mx-auto flex items-center justify-between">
        <Link
          to="/"
          className={`text-2xl font-bold tracking-wider ${
            isScrolled ? "text-black" : "text-yellow-400"
          }`}
        >
          OLM
        </Link>

        {user ? (
          <div className="flex items-center space-x-4">
            <span
              className={`text-lg ${
                isScrolled ? "text-black" : "text-zinc-300"
              }`}
            >
              Welcome, {user.userName || "User"}
            </span>
            <Button
              onClick={handleLogout}
              variant="outline"
              className={`border ${
                isScrolled
                  ? "border-black text-black hover:bg-black hover:text-yellow-400"
                  : "border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black bg-transparent"
              }`}
            >
              Logout
            </Button>
          </div>
        ) : (
          <Link to="/auth">
            <Button
              className={`p-2 px-4 rounded-md transition ${
                isScrolled
                  ? "bg-black text-yellow-400 hover:bg-gray-800"
                  : "bg-yellow-400 text-black hover:bg-yellow-500"
              }`}
            >
              Login / Signup
            </Button>
          </Link>
        )}
      </div>
    </nav>
  );
}
