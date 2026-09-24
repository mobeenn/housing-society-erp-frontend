import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { toast } from "react-hot-toast";
import Card from "@/components/ui/Card";
import { useCan } from "@/hooks/useCan";
import { hrPayrollApi } from "./hrPayrollApi";
import StatutoryConfigTab from "./components/StatutoryConfigTab";

const tabs = [
  { label: "Employees", to: "/hr/employees" },
  { label: "Attendance", to: "/hr/attendance" },
  { label: "Leave Requests", to: "/hr/leave-requests" },
  { label: "Statutory Config", to: "/hr/payroll/setup" },
];

export default function HRSetupPage() {
  const [setup, setSetup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const canEdit = useCan("hr-payroll", "edit");

  const load = async () => {
    setLoading(true);
    try {
      setSetup(await hrPayrollApi.getSetup());
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load HR payroll setup");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const save = async (payload) => {
    setSaving(true);
    try {
      setSetup(await hrPayrollApi.updateSetup(payload));
      toast.success("Payroll setup saved");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save payroll setup");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5" data-tour="hr-payroll-setup-page">
      <Card>
        <div className="flex gap-2 overflow-x-auto border-b border-neutral-200 pb-3" data-tour="hr-payroll-setup-nav">
          {tabs.map((tab) => <NavLink key={tab.label} to={tab.to} end className={({ isActive }) => `whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium ${isActive ? "bg-primary-50 text-primary-700" : "text-neutral-500 hover:bg-neutral-50 hover:text-neutral-800"}`}>{tab.label}</NavLink>)}
        </div>
        <p className="mt-4 text-sm text-neutral-500">Configure the salary components and statutory rules used when a new payroll draft is generated. Existing employees, attendance, and leave screens remain unchanged.</p>
      </Card>
      {loading ? <Card><p className="py-10 text-center text-sm text-neutral-500">Loading setup...</p></Card> : <StatutoryConfigTab setup={setup} onSave={save} canEdit={canEdit} isLoading={saving} />}
    </div>
  );
}
