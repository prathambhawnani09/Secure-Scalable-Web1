import { useState } from "react";
import { useLocation } from "wouter";
import { useLogin, UserRole } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Activity, AlertCircle, ChevronRight, Eye, EyeOff } from "lucide-react";

const DEMO_ACCOUNTS = [
  { label: "Nurse Demo", email: "nurse@demo.school", role: "School Nurse" },
  { label: "Admin Demo", email: "admin@demo.school", role: "Administrator" },
  { label: "Parent Demo", email: "parent@demo.school", role: "Parent / Guardian" },
];

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [demoHint, setDemoHint] = useState<string | null>(null);
  const { setAuth } = useAuth();
  const [, setLocation] = useLocation();
  const login = useLogin();

  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email || !password) return;

    login.mutate(
      { data: { email, password } },
      {
        onSuccess: (data) => {
          setAuth(data.token, data.user.role as UserRole);
          if (data.user.role === "nurse") setLocation("/nurse");
          else if (data.user.role === "admin") setLocation("/dashboard");
          else if (data.user.role === "parent") setLocation("/notifications");
        },
      }
    );
  };

  const handleDemoClick = (demoEmail: string, roleLabel: string) => {
    setEmail(demoEmail);
    setPassword("");
    setDemoHint(`Enter the demo password for ${roleLabel}`);
    setShowPassword(false);
    setTimeout(() => {
      document.getElementById("password")?.focus();
    }, 50);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center text-center">
          <div className="h-12 w-12 bg-primary rounded-xl flex items-center justify-center mb-4">
            <Activity className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">SchoolHealth AI</h1>
          <p className="text-muted-foreground mt-2">Real-time outbreak intelligence for schools</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>Enter your credentials to access your dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="nurse@demo.school"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setDemoHint(null); }}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder={demoHint ?? "Enter your password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {demoHint && (
                  <p className="text-xs text-amber-600 flex items-center gap-1">
                    <ChevronRight className="h-3 w-3" />
                    Demo password: <code className="font-mono">password123</code>
                  </p>
                )}
              </div>

              {login.isError && (
                <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-md flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Invalid email or password. Please try again.
                </div>
              )}

              <Button type="submit" className="w-full" disabled={login.isPending}>
                {login.isPending ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Or try a demo account</span>
                </div>
              </div>

              <div className="grid gap-2 mt-4">
                {DEMO_ACCOUNTS.map(({ label, email: demoEmail, role }) => (
                  <Button
                    key={demoEmail}
                    variant="outline"
                    onClick={() => handleDemoClick(demoEmail, role)}
                    className="justify-between"
                  >
                    <span>{label}</span>
                    <span className="text-xs text-muted-foreground">{demoEmail}</span>
                  </Button>
                ))}
              </div>

              <p className="text-center text-xs text-muted-foreground mt-3">
                Demo password: <code className="font-mono bg-muted px-1.5 py-0.5 rounded">password123</code>
              </p>
            </div>

            <div className="mt-6 pt-6 border-t text-center">
              <p className="text-sm text-muted-foreground">
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={() => setLocation("/signup")}
                  className="text-primary hover:underline font-medium"
                >
                  Create account
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
