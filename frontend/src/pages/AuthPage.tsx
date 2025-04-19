import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import TopNav from "@/components/shared/TopNav";

const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const signUpSchema = z
  .object({
    userName: z.string().min(3, "Username must be at least 3 characters"),
    email: z.string().email("Invalid email address"),
    phone: z
      .string()
      .regex(/^\+?\d{10,15}$/, "Phone number must be 10-15 digits"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type SignInForm = z.infer<typeof signInSchema>;
type SignUpForm = z.infer<typeof signUpSchema>;

const API_BASE_URL = "http://localhost:5000/api";

const AuthPage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("signin");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const signInForm = useForm<SignInForm>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  });

  const signUpForm = useForm<SignUpForm>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      userName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSignInSubmit = async (data: SignInForm) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Invalid credentials");
      const res = await response.json();
      localStorage.setItem("authToken", res.data.token);
      localStorage.setItem("olm_user", JSON.stringify(res.data));
      toast.success(`Welcome back, ${res.data.userName || "User"}!`);
      navigate("/");
    } catch (err: any) {
      setError(err.message || "Failed to sign in. Please try again.");
      toast.error(err.message || "Failed to sign in");
    } finally {
      setIsLoading(false);
    }
  };

  const onSignUpSubmit = async (data: SignUpForm) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          userName: data.userName,
          phone: data.phone,
        }),
      });
      if (!response.ok) throw new Error("Failed to create account");
      const res = await response.json();
      localStorage.setItem("authToken", res.data.token);
      localStorage.setItem("olm_user", JSON.stringify(res.data));
      toast.success(
        `Welcome, ${res.data.userName || "User"}! Account created.`
      );
      navigate("/");
    } catch (err: any) {
      setError(err.message || "Failed to create account. Please try again.");
      toast.error(err.message || "Failed to create account");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-blue-950">
      <TopNav />
      <div className="flex items-center justify-center min-h-[90vh] px-6 max-w-7xl py-20  mx-auto">
        <Card className="w-full max-w-lg bg-zinc-900/50 border-zinc-700/50 backdrop-blur-md shadow-xl animate-fade-in">
          <CardHeader>
            <CardTitle className="text-3xl font-extrabold text-center text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-blue-500">
              {activeTab === "signin" ? "Welcome Back" : "Join the Community"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2 bg-zinc-800/50">
                <TabsTrigger
                  value="signin"
                  className="text-zinc-300 data-[state=active]:bg-yellow-400 data-[state=active]:text-zinc-900"
                >
                  Sign In
                </TabsTrigger>
                <TabsTrigger
                  value="signup"
                  className="text-zinc-300 data-[state=active]:bg-yellow-400 data-[state=active]:text-zinc-900"
                >
                  Sign Up
                </TabsTrigger>
              </TabsList>

              {/* Sign In Form */}
              <TabsContent value="signin">
                <form
                  onSubmit={signInForm.handleSubmit(onSignInSubmit)}
                  className="space-y-4 mt-4"
                >
                  {error && (
                    <div className="p-3 bg-red-500/20 border border-red-500/50 text-red-400 rounded-lg text-sm">
                      {error}
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-zinc-300">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      className="bg-zinc-800/50 border-zinc-700 text-zinc-100 placeholder-zinc-500 focus:ring-yellow-400"
                      {...signInForm.register("email")}
                    />
                    {signInForm.formState.errors.email && (
                      <p className="text-red-400 text-sm">
                        {signInForm.formState.errors.email.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-zinc-300">
                      Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••"
                        className="bg-zinc-800/50 border-zinc-700 text-zinc-100 placeholder-zinc-500 focus:ring-yellow-400 pr-10"
                        {...signInForm.register("password")}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-yellow-400"
                      >
                        {showPassword ? (
                          <EyeOff size={20} />
                        ) : (
                          <Eye size={20} />
                        )}
                      </button>
                    </div>
                    {signInForm.formState.errors.password && (
                      <p className="text-red-400 text-sm">
                        {signInForm.formState.errors.password.message}
                      </p>
                    )}
                  </div>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-zinc-900 font-bold"
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup" className="mt-6">
                <form
                  onSubmit={signUpForm.handleSubmit(onSignUpSubmit)}
                  className="space-y-4"
                >
                  {error && (
                    <div className="p-3 bg-red-500/20 border border-red-500/50 text-red-400 rounded-lg text-sm">
                      {error}
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="userName" className="text-zinc-300">
                      Username
                    </Label>
                    <Input
                      id="userName"
                      type="text"
                      placeholder="johndoe"
                      className="bg-zinc-800/50 border-zinc-700 text-zinc-100 placeholder-zinc-500 focus:ring-yellow-400"
                      {...signUpForm.register("userName")}
                    />
                    {signUpForm.formState.errors.userName && (
                      <p className="text-red-400 text-sm">
                        {signUpForm.formState.errors.userName.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-zinc-300">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      className="bg-zinc-800/50 border-zinc-700 text-zinc-100 placeholder-zinc-500 focus:ring-yellow-400"
                      {...signUpForm.register("email")}
                    />
                    {signUpForm.formState.errors.email && (
                      <p className="text-red-400 text-sm">
                        {signUpForm.formState.errors.email.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-zinc-300">
                      Phone Number
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+1234567890"
                      className="bg-zinc-800/50 border-zinc-700 text-zinc-100 placeholder-zinc-500 focus:ring-yellow-400"
                      {...signUpForm.register("phone")}
                    />
                    {signUpForm.formState.errors.phone && (
                      <p className="text-red-400 text-sm">
                        {signUpForm.formState.errors.phone.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-zinc-300">
                      Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••"
                        className="bg-zinc-800/50 border-zinc-700 text-zinc-100 placeholder-zinc-500 focus:ring-yellow-400 pr-10"
                        {...signUpForm.register("password")}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-yellow-400"
                      >
                        {showPassword ? (
                          <EyeOff size={20} />
                        ) : (
                          <Eye size={20} />
                        )}
                      </button>
                    </div>
                    {signUpForm.formState.errors.password && (
                      <p className="text-red-400 text-sm">
                        {signUpForm.formState.errors.password.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-zinc-300">
                      Confirm Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="••••••"
                        className="bg-zinc-800/50 border-zinc-700 text-zinc-100 placeholder-zinc-500 focus:ring-yellow-400 pr-10"
                        {...signUpForm.register("confirmPassword")}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-yellow-400"
                      >
                        {showConfirmPassword ? (
                          <EyeOff size={20} />
                        ) : (
                          <Eye size={20} />
                        )}
                      </button>
                    </div>
                    {signUpForm.formState.errors.confirmPassword && (
                      <p className="text-red-400 text-sm">
                        {signUpForm.formState.errors.confirmPassword.message}
                      </p>
                    )}
                  </div>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-zinc-900 font-bold"
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      "Sign Up"
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
            <p className="mt-4 text-sm text-center text-zinc-400">
              By continuing, you agree to our{" "}
              <a href="/terms" className="text-yellow-400 hover:underline">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="/privacy" className="text-yellow-400 hover:underline">
                Privacy Policy
              </a>
              .
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AuthPage;
