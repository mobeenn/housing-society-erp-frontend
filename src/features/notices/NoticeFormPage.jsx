import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Send } from "lucide-react";
import toast from "react-hot-toast";
import { Button, Card, Input } from "@/components/ui";
import { getMembers } from "@/features/members/membersApi";
import { getRoles } from "@/features/users-roles/usersRolesApi";
import { noticesApi } from "./noticesApi";

const today = () => new Date().toISOString().slice(0, 10);

export default function NoticeFormPage() {
  const navigate = useNavigate();
  const [roles, setRoles] = useState([]);
  const [members, setMembers] = useState([]);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "",
    body: "",
    targetAudience: "All",
    targetRoleIds: [],
    targetMemberIds: [],
    publishDate: today(),
    expiryDate: "",
    status: "Published",
  });

  useEffect(() => {
    Promise.all([getRoles(), getMembers({ page: 1, limit: 500 })]).then(([roleData, memberData]) => {
      setRoles(Array.isArray(roleData) ? roleData : roleData?.data || []);
      setMembers(memberData?.data || memberData?.members || []);
    }).catch((error) => {
      console.error(error);
      toast.error("Unable to load notice recipients");
    });
  }, []);

  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }));
  const toggleId = (field, id) => setForm((current) => ({ ...current, [field]: current[field].includes(id) ? current[field].filter((item) => item !== id) : [...current[field], id] }));

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      await noticesApi.create({
        ...form,
        expiryDate: form.expiryDate || null,
        targetRoleIds: form.targetAudience === "Role-based" ? form.targetRoleIds : [],
        targetMemberIds: form.targetAudience === "Specific members" ? form.targetMemberIds : [],
      });
      toast.success(form.status === "Published" ? "Notice published" : "Notice saved as draft");
      navigate("/notices");
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to save notice");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6" data-tour="notices-form-page">
      <div className="flex items-center gap-3">
        <Link to="/notices" className="rounded-lg p-2 text-neutral-500 hover:bg-neutral-100"><ArrowLeft className="h-5 w-5" /></Link>
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Publish Notice</h1>
          <p className="text-sm text-neutral-500">Share an announcement with the selected audience.</p>
        </div>
      </div>

      <form onSubmit={submit} data-tour="notices-form">
        <Card>
          <div className="space-y-5">
            <div data-tour="notices-title">
              <label className="mb-1.5 block text-sm font-medium text-neutral-700">Title</label>
              <Input value={form.title} onChange={(event) => update("title", event.target.value)} placeholder="Enter notice title" required maxLength={160} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-700">Message</label>
              <textarea value={form.body} onChange={(event) => update("body", event.target.value)} rows={7} className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="Write the announcement..." required maxLength={5000} />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-700">Publish date</label>
                <Input type="date" value={form.publishDate} onChange={(event) => update("publishDate", event.target.value)} required />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-700">Expiry date <span className="font-normal text-neutral-400">(optional)</span></label>
                <Input type="date" value={form.expiryDate} onChange={(event) => update("expiryDate", event.target.value)} />
              </div>
            </div>
            <div data-tour="notices-audience">
              <label className="mb-1.5 block text-sm font-medium text-neutral-700">Audience</label>
              <select value={form.targetAudience} onChange={(event) => update("targetAudience", event.target.value)} className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500">
                <option value="All">All users</option>
                <option value="Role-based">Role-based</option>
                <option value="Specific members">Specific members</option>
              </select>
            </div>

            {form.targetAudience === "Role-based" && (
              <div className="rounded-lg border border-neutral-200 p-4">
                <p className="mb-3 text-sm font-medium text-neutral-700">Select roles</p>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {roles.map((role) => <label key={role._id} className="flex items-center gap-2 text-sm text-neutral-600"><input type="checkbox" checked={form.targetRoleIds.includes(role._id)} onChange={() => toggleId("targetRoleIds", role._id)} />{role.name}</label>)}
                </div>
              </div>
            )}

            {form.targetAudience === "Specific members" && (
              <div className="rounded-lg border border-neutral-200 p-4">
                <p className="mb-3 text-sm font-medium text-neutral-700">Select members</p>
                <select multiple value={form.targetMemberIds} onChange={(event) => update("targetMemberIds", Array.from(event.target.selectedOptions, (option) => option.value))} className="h-40 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm">
                  {members.map((member) => <option key={member._id} value={member._id}>{member.name} ({member.memberId})</option>)}
                </select>
                <p className="mt-2 text-xs text-neutral-400">Hold Ctrl/Cmd to select multiple members.</p>
              </div>
            )}

            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-700">Save as</label>
              <select value={form.status} onChange={(event) => update("status", event.target.value)} className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm">
                <option value="Published">Publish immediately</option>
                <option value="Draft">Save as draft</option>
              </select>
            </div>
            <div className="flex justify-end gap-3 border-t border-neutral-100 pt-4">
              <Link to="/notices"><Button type="button" variant="outline">Cancel</Button></Link>
              <Button data-tour="notices-submit" type="submit" isLoading={saving}><Send className="h-4 w-4" />{form.status === "Published" ? "Publish Notice" : "Save Draft"}</Button>
            </div>
          </div>
        </Card>
      </form>
    </div>
  );
}
