import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import toast from "react-hot-toast";
import { Building2, Loader2 } from "lucide-react";
import { Button, Input } from "@/components/ui";
import { useAuthStore } from "@/store/authStore";
import { authApi } from "@/features/auth/authApi";

const DEMO_CREDENTIALS = [
  {
    role: "Super Admin",
    email: "admin@housing-society.local",
    password: "SuperAdmin@123",
  },
  {
    role: "Finance Officer",
    email: "finance.demo@housing.local",
    password: "DemoRole@123",
  },
  {
    role: "Operations Manager",
    email: "operations.demo@housing.local",
    password: "DemoRole@123",
  },
  {
    role: "Security Manager",
    email: "security.demo@housing.local",
    password: "DemoRole@123",
  },
  {
    role: "Property Officer",
    email: "property.demo@housing.local",
    password: "DemoRole@123",
  },
  {
    role: "HR Officer",
    email: "hr.demo@housing.local",
    password: "DemoRole@123",
  },
  {
    role: "Store Manager",
    email: "store.demo@housing.local",
    password: "DemoRole@123",
  },
  {
    role: "Procurement Officer",
    email: "procurement.demo@housing.local",
    password: "DemoRole@123",
  },
  {
    role: "Receptionist / Front Desk",
    email: "receptionist.demo@housing.local",
    password: "DemoRole@123",
  },
  {
    role: "Member Portal",
    email: "member.demo@housing.local",
    password: "DemoRole@123",
  },
];

const loginSchema = z.object({
  email: z.string().email("Invalid email address").min(1, "Email is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (formData) => {
    setIsLoading(true);
    try {
      const { user, accessToken } = await authApi.login(formData);
      login(user, accessToken);
      toast.success(`Welcome back, ${user.name}!`);
      navigate("/dashboard");
    } catch (error) {
      const message =
        error.response?.data?.message || "Login failed. Please try again.";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const selectCredentials = ({ email, password }) => {
    setValue("email", email, { shouldDirty: true, shouldValidate: true });
    setValue("password", password, { shouldDirty: true, shouldValidate: true });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-card bg-accent">
            <Building2 className="h-7 w-7 text-on-accent" />
          </div>
          <h1 className="text-h1 font-semibold text-primary">
            Housing Society ERP
          </h1>
          <p className="mt-2 text-body text-secondary">
            Sign in to manage your society
          </p>
        </div>

        {/* Login Form */}
        <div className="rounded-card border border-border bg-surface px-8 py-8 shadow-none">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-body font-medium text-primary"
              >
                Email Address
              </label>
              <Input
                id="email"
                type="email"
                placeholder="admin@housing-society.local"
                disabled={isLoading}
                error={errors.email?.message}
                {...register("email")}
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-body font-medium text-primary"
              >
                Password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                disabled={isLoading}
                error={errors.password?.message}
                {...register("password")}
              />
            </div>

            {/* Submit */}
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          {/* Development Credentials */}
          <div className="mt-6 rounded-control bg-canvas px-4 py-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-small font-medium text-primary">
                  Development Credentials
                </p>
                <p className="mt-0.5 text-small text-secondary">
                  Click an account to fill the login form.
                </p>
              </div>
              <span className="shrink-0 rounded-full bg-gold-soft px-2 py-1 text-small font-medium text-accent">
                Demo only
              </span>
            </div>
            <div className="mt-3 max-h-72 space-y-2 overflow-y-auto pr-1">
              {DEMO_CREDENTIALS.map((account) => (
                <button
                  key={account.email}
                  type="button"
                  onClick={() => selectCredentials(account)}
                  disabled={isLoading}
                  className="w-full rounded-control border border-border bg-surface px-3 py-2 text-left transition-colors duration-base hover:border-gold hover:bg-gold-soft disabled:cursor-not-allowed disabled:opacity-60"
                  aria-label={`Use ${account.role} demo credentials`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-small font-semibold text-primary">
                      {account.role}
                    </span>
                    <span className="text-small font-medium text-accent">
                      Use account
                    </span>
                  </div>
                  <p className="mt-1 truncate text-small text-secondary">
                    Email: <span className="font-mono text-primary">{account.email}</span>
                  </p>
                  <p className="mt-0.5 text-small text-secondary">
                    Password: <span className="font-mono text-primary">{account.password}</span>
                  </p>
                </button>
              ))}
            </div>
            <p className="mt-2 text-small leading-4 text-muted">
              Role accounts are created by the Phase 8 development seed.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
