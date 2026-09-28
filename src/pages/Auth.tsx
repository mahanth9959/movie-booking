import { Eye, EyeOff, Lock, Mail, Phone, Ticket, User } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import { Button, Input } from "../components/ui";

function Shell({ title, sub, children }: { title: string; sub: string; children: React.ReactNode }) {
  return (
    <div className="mx-auto grid w-full max-w-5xl overflow-hidden rounded-3xl border border-[#232332] bg-[#0e0e17] md:grid-cols-2">
      <div className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-rose-700 via-[#3b0a1e] to-[#0e0e17] p-8 md:flex">
        <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-rose-500/25 blur-3xl" />
        <div className="absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-amber-400/15 blur-3xl" />
        <div className="relative flex items-center gap-2.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur">
            <Ticket size={19} className="text-white" />
          </span>
          <div>
            <p className="font-extrabold">CineBook</p>
            <p className="text-xs text-white/60">Book seats in seconds</p>
          </div>
        </div>
        <div className="relative">
          <h2 className="type-display text-white">Your night at the movies starts here.</h2>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/65">Live showtimes across 12 theatres, interactive seat maps, instant e-tickets and booking analytics.</p>
          <div className="mt-6 flex gap-5 text-center">
            {[
              ["48+", "Live titles"],
              ["12", "Theatres"],
              ["4.8", "App rating"],
            ].map(([v, l]) => (
              <div key={l}>
                <p className="text-xl font-extrabold text-white">{v}</p>
                <p className="text-xs text-white/55">{l}</p>
              </div>
            ))}
          </div>
        </div>
        <p className="relative text-xs text-white/40">Demo build · accounts are stored locally in your browser.</p>
      </div>
      <div className="p-6 sm:p-9">
        <h1 className="type-heading">{title}</h1>
        <p className="type-muted mt-1">{sub}</p>
        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}

interface LoginF { email: string; password: string }
interface RegF { name: string; email: string; phone: string; password: string; confirm: string }

export function LoginPage() {
  const { login } = useAuth();
  const { push } = useToast();
  const nav = useNavigate();
  const [show, setShow] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginF>();

  return (
    <div className="anim-rise mx-auto max-w-5xl px-1 py-8">
      <Shell title="Welcome back" sub="Sign in to book seats, track tickets and check in faster.">
        <form
          className="space-y-4"
          onSubmit={handleSubmit((v) => {
            const err = login(v.email, v.password);
            if (err) push({ kind: "error", title: "Login failed", message: err });
            else {
              push({ kind: "success", title: "Welcome back!" });
              nav("/", { replace: true });
            }
          })}
        >
          <Input id="email" label="Email" icon={Mail} placeholder="you@example.com" autoComplete="email" error={errors.email?.message} {...register("email", { required: "Email is required", pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Enter a valid email" } })} />
          <div>
            <Input id="password" label="Password" icon={Lock} type={show ? "text" : "password"} placeholder="••••••••" autoComplete="current-password" error={errors.password?.message} {...register("password", { required: "Password is required", minLength: { value: 6, message: "Minimum 6 characters" } })} />
            <button type="button" onClick={() => setShow((s) => !s)} className="mt-1.5 inline-flex items-center gap-1.5 text-xs font-medium text-zinc-400 hover:text-white" aria-label={show ? "Hide password" : "Show password"}>
              {show ? <EyeOff size={14} /> : <Eye size={14} />} {show ? "Hide" : "Show"} password
            </button>
          </div>
          <Button type="submit" loading={isSubmitting} className="w-full py-3">Sign in</Button>
          <div className="flex items-center justify-between text-sm">
            <Link to="/forgot" className="font-medium text-rose-300 hover:text-rose-200">Forgot password?</Link>
            <span className="text-zinc-500">New here? <Link to="/register" className="font-semibold text-zinc-100 underline underline-offset-4">Create account</Link></span>
          </div>
          <div className="rounded-xl border border-[#2b2b40] bg-white/[0.02] p-3 text-xs leading-relaxed text-zinc-400">
            Try the demo account — email <span className="font-semibold text-zinc-200">demo@cinebook.app</span>, password <span className="font-semibold text-zinc-200">demo1234</span>. It is created automatically on first use.
          </div>
        </form>
      </Shell>
    </div>
  );
}

export function RegisterPage() {
  const { register: doRegister } = useAuth();
  const { push } = useToast();
  const nav = useNavigate();
  const [show, setShow] = useState(false);
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<RegF>();

  return (
    <div className="anim-rise mx-auto max-w-5xl px-1 py-8">
      <Shell title="Create account" sub="One account for bookings, e-tickets and faster checkout.">
        <form
          className="space-y-4"
          onSubmit={handleSubmit((v) => {
            const err = doRegister(v.name, v.email, v.phone, v.password);
            if (err) push({ kind: "error", title: "Registration failed", message: err });
            else {
              push({ kind: "success", title: "Account created", message: "You are signed in." });
              nav("/", { replace: true });
            }
          })}
        >
          <Input id="name" label="Full name" icon={User} placeholder="Aarav Sharma" autoComplete="name" error={errors.name?.message} {...register("name", { required: "Name is required", minLength: { value: 2, message: "Too short" } })} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input id="email" label="Email" icon={Mail} placeholder="you@example.com" autoComplete="email" error={errors.email?.message} {...register("email", { required: "Email is required", pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Enter a valid email" } })} />
            <Input id="phone" label="Phone" icon={Phone} placeholder="+91 98765 43210" autoComplete="tel" error={errors.phone?.message} {...register("phone", { required: "Phone is required", pattern: { value: /^[+\d][\d\s-]{7,15}$/, message: "Enter a valid phone number" } })} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input id="pw" label="Password" icon={Lock} type={show ? "text" : "password"} placeholder="Min 6 characters" autoComplete="new-password" error={errors.password?.message} {...register("password", { required: "Password is required", minLength: { value: 6, message: "Minimum 6 characters" }, pattern: { value: /(?=.*[A-Za-z])(?=.*\d)/, message: "Use letters + a number" } })} />
            <Input id="confirm" label="Confirm password" icon={Lock} type={show ? "text" : "password"} placeholder="Repeat password" autoComplete="new-password" error={errors.confirm?.message} {...register("confirm", { required: "Please confirm password", validate: (v) => (v === watch("password") ? true : "Passwords do not match") })} />
          </div>
          <button type="button" onClick={() => setShow((s) => !s)} className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-400 hover:text-white">
            {show ? <EyeOff size={14} /> : <Eye size={14} />} {show ? "Hide" : "Show"} passwords
          </button>
          <Button type="submit" loading={isSubmitting} className="w-full py-3">Create account</Button>
          <p className="text-center text-sm text-zinc-500">Already have an account? <Link to="/login" className="font-semibold text-zinc-100 underline underline-offset-4">Sign in</Link></p>
        </form>
      </Shell>
    </div>
  );
}

export function ForgotPage() {
  const { push } = useToast();
  const { register, handleSubmit, formState: { errors, isSubmitSuccessful } } = useForm<{ email: string }>();
  return (
    <div className="anim-rise mx-auto max-w-5xl px-1 py-8">
      <Shell title="Reset password" sub="Enter your account email and we'll send reset instructions.">
        {isSubmitSuccessful ? (
          <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/8 p-5 text-center">
            <p className="font-bold text-emerald-300">Check your inbox</p>
            <p className="type-muted mt-1">If an account exists, a reset link is on its way. This is a demo UI — no email is actually sent.</p>
            <Link to="/login" className="mt-4 inline-block rounded-lg bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-rose-500">Back to sign in</Link>
          </div>
        ) : (
          <form className="space-y-4" onSubmit={handleSubmit(() => push({ kind: "success", title: "Reset link sent" }))}>
            <Input id="f-email" label="Email" icon={Mail} placeholder="you@example.com" error={errors.email?.message} {...register("email", { required: "Email is required", pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Enter a valid email" } })} />
            <Button className="w-full py-3">Send reset link</Button>
            <p className="text-center text-sm text-zinc-500"><Link to="/login" className="font-semibold text-zinc-100 underline underline-offset-4">Back to sign in</Link></p>
          </form>
        )}
      </Shell>
    </div>
  );
}

export function seedDemoAccount() {
  try {
    const raw = localStorage.getItem("mtbs_users");
    const users = raw ? (JSON.parse(raw) as { email: string }[]) : [];
    if (!users.some((u) => u.email === "demo@cinebook.app")) {
      users.push({ email: "demo@cinebook.app", name: "Demo User", phone: "+91 98765 43210", password: "demo1234", createdAt: new Date().toISOString() } as never);
      localStorage.setItem("mtbs_users", JSON.stringify(users));
    }
  } catch { /* ignore */ }
}
