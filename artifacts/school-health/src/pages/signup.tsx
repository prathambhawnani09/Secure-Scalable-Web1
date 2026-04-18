import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Activity,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
  Eye,
  EyeOff,
  Mail,
  Shield,
  User,
  Phone,
  Building2,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

const API_BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

type Step = "info" | "password" | "otp";
type Role = "nurse" | "admin" | "parent";

interface PasswordStrength {
  score: number;
  label: string;
  color: string;
}

function getPasswordStrength(password: string): PasswordStrength {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) return { score, label: "Very weak", color: "bg-red-500" };
  if (score === 2) return { score, label: "Weak", color: "bg-orange-500" };
  if (score === 3) return { score, label: "Fair", color: "bg-yellow-500" };
  if (score === 4) return { score, label: "Strong", color: "bg-blue-500" };
  return { score, label: "Very strong", color: "bg-green-500" };
}

export default function SignupPage() {
  const [step, setStep] = useState<Step>("info");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role | "">("");
  const [phone, setPhone] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [otp, setOtp] = useState("");
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [, setLocation] = useLocation();
  const { setAuth } = useAuth();

  const strength = getPasswordStrength(password);
  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;

  const passwordChecks = [
    { label: "At least 8 characters", pass: password.length >= 8 },
    { label: "One uppercase letter", pass: /[A-Z]/.test(password) },
    { label: "One number", pass: /[0-9]/.test(password) },
    { label: "One special character", pass: /[^A-Za-z0-9]/.test(password) },
  ];

  const handleInfoNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !role) return;
    setError("");
    setStep("password");
  };

  const handlePasswordNext = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || !confirmPassword) return;
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/auth/register/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: fullName, email, password, role, phone, schoolName }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Something went wrong");
        return;
      }

      setEmailSent(data.emailSent);
      if (data.devOtp) setDevOtp(data.devOtp);
      setStep("otp");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) return;
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/auth/register/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Verification failed");
        return;
      }

      setAuth(data.token, data.user.role);
      if (data.user.role === "nurse") setLocation("/nurse");
      else if (data.user.role === "admin") setLocation("/dashboard");
      else setLocation("/notifications");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setError("");
    setLoading(true);
    setOtp("");
    try {
      const res = await fetch(`${API_BASE}/api/auth/register/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: fullName, email, password, role, phone, schoolName }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Could not resend code");
        return;
      }
      if (data.devOtp) setDevOtp(data.devOtp);
    } catch {
      setError("Network error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center text-center">
          <div className="h-12 w-12 bg-primary rounded-xl flex items-center justify-center mb-4">
            <Activity className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">SchoolHealth AI</h1>
          <p className="text-muted-foreground mt-2">Create your account</p>
        </div>

        <div className="flex items-center gap-2 justify-center">
          {(["info", "password", "otp"] as Step[]).map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                  step === s
                    ? "bg-primary text-primary-foreground"
                    : (step === "password" && i === 0) || (step === "otp" && i < 2)
                    ? "bg-green-500 text-white"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {(step === "password" && i === 0) || (step === "otp" && i < 2) ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  i + 1
                )}
              </div>
              {i < 2 && <div className={`h-px w-8 ${(step === "password" && i === 0) || (step === "otp" && i < 2) ? "bg-green-500" : "bg-muted"}`} />}
            </div>
          ))}
        </div>

        {step === "info" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" /> Personal Information
              </CardTitle>
              <CardDescription>Tell us about yourself to set up your account</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleInfoNext} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name <span className="text-destructive">*</span></Label>
                  <Input
                    id="fullName"
                    placeholder="e.g. Sarah Johnson"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Work Email <span className="text-destructive">*</span></Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@school.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Role <span className="text-destructive">*</span></Label>
                  <Select value={role} onValueChange={(v) => setRole(v as Role)} required>
                    <SelectTrigger id="role">
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="nurse">School Nurse</SelectItem>
                      <SelectItem value="admin">School Administrator</SelectItem>
                      <SelectItem value="parent">Parent / Guardian</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center gap-1">
                    <Phone className="h-3 w-3" /> Phone Number <span className="text-muted-foreground text-xs">(optional)</span>
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="555-000-0000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="schoolName" className="flex items-center gap-1">
                    <Building2 className="h-3 w-3" /> School Name <span className="text-muted-foreground text-xs">(optional)</span>
                  </Label>
                  <Input
                    id="schoolName"
                    placeholder="Lincoln Elementary School"
                    value={schoolName}
                    onChange={(e) => setSchoolName(e.target.value)}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={!fullName || !email || !role}>
                  Continue
                </Button>

                <p className="text-center text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <button type="button" onClick={() => setLocation("/login")} className="text-primary hover:underline font-medium">
                    Sign in
                  </button>
                </p>
              </form>
            </CardContent>
          </Card>
        )}

        {step === "password" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" /> Create Password
              </CardTitle>
              <CardDescription>Choose a strong password to protect your account</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordNext} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Password <span className="text-destructive">*</span></Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a strong password"
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

                  {password.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <div
                            key={i}
                            className={`h-1.5 flex-1 rounded-full transition-colors ${
                              i <= strength.score ? strength.color : "bg-muted"
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Strength: <span className="font-medium">{strength.label}</span>
                      </p>
                      <ul className="space-y-1">
                        {passwordChecks.map((check) => (
                          <li key={check.label} className={`text-xs flex items-center gap-1.5 ${check.pass ? "text-green-600" : "text-muted-foreground"}`}>
                            <CheckCircle2 className={`h-3 w-3 ${check.pass ? "opacity-100" : "opacity-30"}`} />
                            {check.label}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password <span className="text-destructive">*</span></Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirm ? "text" : "password"}
                      placeholder="Repeat your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {confirmPassword.length > 0 && (
                    <p className={`text-xs flex items-center gap-1 ${passwordsMatch ? "text-green-600" : "text-destructive"}`}>
                      <CheckCircle2 className="h-3 w-3" />
                      {passwordsMatch ? "Passwords match" : "Passwords do not match"}
                    </p>
                  )}
                </div>

                {error && (
                  <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-md flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 shrink-0" /> {error}
                  </div>
                )}

                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={() => { setStep("info"); setError(""); }} className="flex-1">
                    <ArrowLeft className="h-4 w-4 mr-1" /> Back
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={loading || !password || !confirmPassword || password !== confirmPassword || password.length < 8}
                  >
                    {loading ? "Sending code..." : "Send Verification Code"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {step === "otp" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" /> Verify Your Email
              </CardTitle>
              <CardDescription>
                {emailSent
                  ? `We sent a 6-digit code to ${email}`
                  : `Enter the 6-digit code below (check server console or the hint below)`}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex flex-col items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center">
                  <Mail className="h-7 w-7 text-blue-600" />
                </div>
                <p className="text-center text-sm text-muted-foreground">
                  Check your inbox at <span className="font-semibold text-foreground">{email}</span> and enter the 6-digit code.
                </p>
              </div>

              {devOtp && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-md text-sm text-amber-800">
                  <p className="font-semibold mb-1">Development mode — Email not sent</p>
                  <p>Your OTP code: <span className="font-mono font-bold text-base tracking-widest">{devOtp}</span></p>
                </div>
              )}

              <div className="flex justify-center">
                <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>

              {error && (
                <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-md flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" /> {error}
                </div>
              )}

              <Button
                className="w-full"
                onClick={handleVerifyOtp}
                disabled={otp.length !== 6 || loading}
              >
                {loading ? "Verifying..." : "Verify & Create Account"}
              </Button>

              <div className="text-center text-sm text-muted-foreground space-y-2">
                <p>
                  Didn't receive it?{" "}
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={loading}
                    className="text-primary hover:underline font-medium disabled:opacity-50"
                  >
                    Resend code
                  </button>
                </p>
                <p>
                  <button
                    type="button"
                    onClick={() => { setStep("password"); setError(""); setOtp(""); }}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    ← Go back
                  </button>
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
