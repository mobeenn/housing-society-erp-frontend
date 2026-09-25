import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import {
  Building2,
  Save,
  Loader2,
  Phone,
  MapPin,
} from "lucide-react";
import { administrationApi } from "./administrationApi";

const societySchema = z.object({
  name: z.string().min(2, "Society name is required"),
  logo: z.string().optional().or(z.literal("")),
  currency: z.string().min(1, "Currency is required"),
  recoveryAutoBlockThreshold: z.coerce.number().min(0).max(100),
  recoveryAllowSelfReserve: z.boolean(),
  address: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    postalCode: z.string().optional(),
    country: z.string().optional(),
  }),
  fiscalYear: z.object({
    startMonth: z.coerce.number().min(1).max(12),
    startDay: z.coerce.number().min(1).max(31),
  }),
  feeSettings: z.object({
    lateFeePercentage: z.coerce.number().min(0).max(100),
    lateFeeDaysGrace: z.coerce.number().min(0),
    penaltyRule: z
      .object({
        type: z.enum(["flat", "percentage"]),
        amount: z.coerce.number().min(0),
        period: z.enum(["day", "month"]),
        graceDays: z.coerce.number().min(0),
      })
      .optional(),
  }),
  contactInfo: z.object({
    phone: z.string().optional(),
    email: z.string().email("Invalid email").optional().or(z.literal("")),
    website: z.string().optional().or(z.literal("")),
  }),
});

export default function SocietyProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(societySchema),
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await administrationApi.getSocietySettings();
      reset(data);
    } catch {
      toast.error("Failed to load society settings");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      setSaving(true);
      await administrationApi.updateSocietySettings(data);
      toast.success("Society settings updated successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div data-tour="settings-page-intro" className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-h1 font-bold text-primary">
            Society Profile
          </h1>
          <p className="mt-1 text-body text-secondary">
            Manage your society's global settings, contact information, and
            billing policies.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* General Information */}
        <div data-tour="settings-general" className="rounded-card border border-border bg-surface p-6 shadow-none">
          <h2 className="flex items-center gap-2 text-body font-semibold text-primary">
            <Building2 className="h-5 w-5 text-accent" />
            General Information
          </h2>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-body font-medium text-primary">
                Society Name *
              </label>
              <input
                type="text"
                {...register("name")}
                className="mt-1 block w-full rounded-control border border-border-strong px-3 py-2 text-body focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              />
              {errors.name && (
                <p className="mt-1 text-small text-danger">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-body font-medium text-primary">
                Currency *
              </label>
              <input
                type="text"
                {...register("currency")}
                placeholder="e.g. PKR, USD"
                className="mt-1 block w-full rounded-control border border-border-strong px-3 py-2 text-body focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              />
              {errors.currency && (
                <p className="mt-1 text-small text-danger">
                  {errors.currency.message}
                </p>
              )}
            </div>

            <div className="sm:col-span-2">
              <label className="block text-body font-medium text-primary">
                Logo URL
              </label>
              <input
                type="text"
                {...register("logo")}
                placeholder="https://example.com/logo.png"
                className="mt-1 block w-full rounded-control border border-border-strong px-3 py-2 text-body focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
          </div>
        </div>

        {/* Address */}
        <div data-tour="settings-address" className="rounded-card border border-border bg-surface p-6 shadow-none">
          <h2 className="flex items-center gap-2 text-body font-semibold text-primary">
            <MapPin className="h-5 w-5 text-accent" />
            Address Details
          </h2>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="block text-body font-medium text-primary">
                Street Address
              </label>
              <input
                type="text"
                {...register("address.street")}
                className="mt-1 block w-full rounded-control border border-border-strong px-3 py-2 text-body focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
            <div>
              <label className="block text-body font-medium text-primary">
                City
              </label>
              <input
                type="text"
                {...register("address.city")}
                className="mt-1 block w-full rounded-control border border-border-strong px-3 py-2 text-body focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
            <div>
              <label className="block text-body font-medium text-primary">
                State / Province
              </label>
              <input
                type="text"
                {...register("address.state")}
                className="mt-1 block w-full rounded-control border border-border-strong px-3 py-2 text-body focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
            <div>
              <label className="block text-body font-medium text-primary">
                Postal Code
              </label>
              <input
                type="text"
                {...register("address.postalCode")}
                className="mt-1 block w-full rounded-control border border-border-strong px-3 py-2 text-body focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
            <div>
              <label className="block text-body font-medium text-primary">
                Country
              </label>
              <input
                type="text"
                {...register("address.country")}
                className="mt-1 block w-full rounded-control border border-border-strong px-3 py-2 text-body focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div data-tour="settings-contact" className="rounded-card border border-border bg-surface p-6 shadow-none">
          <h2 className="flex items-center gap-2 text-body font-semibold text-primary">
            <Phone className="h-5 w-5 text-accent" />
            Contact Information
          </h2>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-body font-medium text-primary">
                Phone
              </label>
              <input
                type="text"
                {...register("contactInfo.phone")}
                placeholder="+92 300 1234567"
                className="mt-1 block w-full rounded-control border border-border-strong px-3 py-2 text-body focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
            <div>
              <label className="block text-body font-medium text-primary">
                Email
              </label>
              <input
                type="email"
                {...register("contactInfo.email")}
                placeholder="info@society.com"
                className="mt-1 block w-full rounded-control border border-border-strong px-3 py-2 text-body focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              />
              {errors.contactInfo?.email && (
                <p className="mt-1 text-small text-danger">
                  {errors.contactInfo.email.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-body font-medium text-primary">
                Website
              </label>
              <input
                type="text"
                {...register("contactInfo.website")}
                placeholder="https://society.com"
                className="mt-1 block w-full rounded-control border border-border-strong px-3 py-2 text-body focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
          </div>
        </div>

        {/* Fiscal Year & Billing */}
        <div data-tour="settings-billing" className="rounded-card border border-border bg-surface p-6 shadow-none">
          <h2 className="text-body font-semibold text-primary">
            Fiscal Year & Billing Rules
          </h2>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-4">
            <div>
              <label className="block text-body font-medium text-primary">
                Fiscal Year Start Month
              </label>
              <select
                {...register("fiscalYear.startMonth")}
                className="mt-1 block w-full rounded-control border border-border-strong px-3 py-2 text-body focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              >
                <option value={1}>January</option>
                <option value={7}>July</option>
              </select>
            </div>
            <div>
              <label className="block text-body font-medium text-primary">
                Start Day
              </label>
              <input
                type="number"
                {...register("fiscalYear.startDay")}
                className="mt-1 block w-full rounded-control border border-border-strong px-3 py-2 text-body focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
            <div>
              <label className="block text-body font-medium text-primary">
                Late Fee (%)
              </label>
              <input
                type="number"
                step="0.1"
                {...register("feeSettings.lateFeePercentage")}
                className="mt-1 block w-full rounded-control border border-border-strong px-3 py-2 text-body focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
            <div>
              <label className="block text-body font-medium text-primary">
                Grace Period (Days)
              </label>
              <input
                type="number"
                {...register("feeSettings.lateFeeDaysGrace")}
                className="mt-1 block w-full rounded-control border border-border-strong px-3 py-2 text-body focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
            <div>
              <label className="block text-body font-medium text-primary">
                Penalty Type
              </label>
              <select
                {...register("feeSettings.penaltyRule.type")}
                className="mt-1 block w-full rounded-control border border-border-strong px-3 py-2 text-body"
              >
                <option value="flat">Flat</option>
                <option value="percentage">Percentage</option>
              </select>
            </div>
            <div>
              <label className="block text-body font-medium text-primary">
                Penalty Amount
              </label>
              <input
                type="number"
                step="0.01"
                {...register("feeSettings.penaltyRule.amount")}
                className="mt-1 block w-full rounded-control border border-border-strong px-3 py-2 text-body"
              />
            </div>
            <div>
              <label className="block text-body font-medium text-primary">
                Penalty Period
              </label>
              <select
                {...register("feeSettings.penaltyRule.period")}
                className="mt-1 block w-full rounded-control border border-border-strong px-3 py-2 text-body"
              >
                <option value="day">Per day</option>
                <option value="month">Per month</option>
              </select>
            </div>
            <div>
              <label className="block text-body font-medium text-primary">
                Penalty Grace Days
              </label>
              <input
                type="number"
                {...register("feeSettings.penaltyRule.graceDays")}
                className="mt-1 block w-full rounded-control border border-border-strong px-3 py-2 text-body"
              />
            </div>
          </div>
        </div>

        {/* Recovery Automation */}
        <div data-tour="settings-recovery" className="rounded-card border border-border bg-surface p-6 shadow-none">
          <h2 className="text-body font-semibold text-primary">
            Recovery Automation
          </h2>
          <p className="mt-1 text-body text-secondary">
            Control the overdue-recovery auto-block threshold and optional agent self-reservation.
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="block text-body font-medium text-primary">
              Auto-block below recovery (%)
              <input
                type="number"
                min="0"
                max="100"
                {...register("recoveryAutoBlockThreshold")}
                className="mt-1 block w-full rounded-control border border-border-strong px-3 py-2 text-body"
              />
            </label>
            <label className="flex items-center gap-2 self-end rounded-control border border-border px-3 py-2 text-body text-primary">
              <input type="checkbox" {...register("recoveryAllowSelfReserve")} />
              Allow agents to reserve plots from the free pool
            </label>
          </div>
        </div>

        {/* Submit button */}
        <div className="flex justify-end">
          <button
            data-tour="settings-save"
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 rounded-control bg-accent px-4 py-2.5 text-body font-medium text-on-accent hover:bg-accent disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save Settings
          </button>
        </div>
      </form>
    </div>
  );
}
