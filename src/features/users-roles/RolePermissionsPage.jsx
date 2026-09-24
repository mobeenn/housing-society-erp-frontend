import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Loader2, Save, ShieldCheck } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { Button, Card, Input } from "@/components/ui";
import { getRoles, createRole, updateRole } from "./usersRolesApi";
import { getRoleAccess, updateRoleAccess } from "@/features/rbac/rbacApi";

const ACTIONS = ["view", "create", "edit", "delete", "approve", "reject", "cancel", "print", "export", "refund"];
const ACTION_LABELS = {
  view: "View",
  create: "Create",
  edit: "Edit",
  delete: "Delete",
  approve: "Approve",
  reject: "Reject",
  cancel: "Cancel",
  print: "Print",
  export: "Export",
  refund: "Refund",
};

const normalizeActions = (actions = {}) => Object.fromEntries(ACTIONS.map((action) => [action, actions?.[action] === true]));

export default function RolePermissionsPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [roles, setRoles] = useState([]);
  const [role, setRole] = useState(null);
  const [modules, setModules] = useState([]);
  const [readOnly, setReadOnly] = useState(false);
  const [roleForm, setRoleForm] = useState({ name: "", description: "" });
  const [roleFormErrors, setRoleFormErrors] = useState({});

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      try {
        const roleList = await getRoles();
        if (!active) return;
        setRoles(Array.isArray(roleList) ? roleList : roleList?.roles || []);

        if (!isEdit) {
          setRoleForm({ name: "", description: "" });
          return;
        }

        const access = await getRoleAccess(id);
        if (!active) return;
        setRole(access.role);
        setModules(access.modules || []);
        setReadOnly(Boolean(access.readOnly));
        setRoleForm({ name: access.role.name || "", description: access.role.description || "" });
      } catch (error) {
        if (active) toast.error(error.response?.data?.message || "Unable to load access control");
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => { active = false; };
  }, [id, isEdit]);

  const groupedModules = useMemo(() => {
    return modules.reduce((groups, module) => {
      const group = module.group || "General";
      (groups[group] ||= []).push(module);
      return groups;
    }, {});
  }, [modules]);

  const updateModule = (moduleKey, patch) => {
    setModules((current) => current.map((module) => {
      if (module.key !== moduleKey) return module;
      const next = { ...module, ...patch };
      if (patch.isVisible === false) next.actions = Object.fromEntries(ACTIONS.map((action) => [action, false]));
      return next;
    }));
  };

  const toggleAction = (moduleKey, action) => {
    setModules((current) => current.map((module) => {
      if (module.key !== moduleKey || !module.isVisible) return module;
      return { ...module, actions: { ...normalizeActions(module.actions), [action]: !module.actions?.[action] } };
    }));
  };

  const saveAccess = async () => {
    if (!id || readOnly) return;
    setSaving(true);
    try {
      const payload = modules.map((module) => ({
        key: module.key,
        isVisible: module.isVisible === true,
        actions: normalizeActions(module.actions),
      }));
      const result = await updateRoleAccess(id, payload);
      setModules(result.modules || modules);
      setReadOnly(Boolean(result.readOnly));
      toast.success("Role access updated");
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to save role access");
    } finally {
      setSaving(false);
    }
  };

  const saveRoleDetails = async (event) => {
    event.preventDefault();
    const errors = {};
    if (roleForm.name.trim().length < 2) errors.name = "Role name must be at least 2 characters";
    if (roleForm.name.trim().length > 50) errors.name = "Role name must be 50 characters or fewer";
    setRoleFormErrors(errors);
    if (Object.keys(errors).length) return;

    try {
      if (isEdit) {
        const updated = await updateRole(id, roleForm);
        setRole((current) => ({ ...current, ...updated }));
        toast.success("Role details updated");
      } else {
        const created = await createRole({ ...roleForm, permissions: [] });
        toast.success("Role created; configure its access below");
        navigate(`/admin/roles/${created._id}/edit`, { replace: true });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to save role");
    }
  };

  if (loading) {
    return <div className="flex min-h-[50vh] items-center justify-center"><Loader2 className="h-7 w-7 animate-spin text-primary-600" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate("/admin/roles")} className="rounded-lg p-2 text-neutral-500 hover:bg-neutral-100" aria-label="Back to roles">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">{isEdit ? "Access Control" : "Create Role"}</h1>
          <p className="mt-1 text-sm text-neutral-500">Configure module visibility and independently toggle each action.</p>
        </div>
        {isEdit && (
          <label className="text-sm font-medium text-neutral-700">
            Role
            <select value={id} onChange={(event) => navigate(`/admin/roles/${event.target.value}/edit`)} className="mt-1 block min-w-56 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm font-normal">
              {roles.map((item) => <option key={item._id} value={item._id}>{item.name}</option>)}
            </select>
          </label>
        )}
      </div>

      <Card title={isEdit ? "Role details" : "New role"}>
        <form onSubmit={saveRoleDetails} className="grid gap-4 md:grid-cols-[1fr_2fr_auto] md:items-end">
          <label className="text-sm font-medium text-neutral-700">
            Role name
            <Input {...{ value: roleForm.name, onChange: (event) => setRoleForm((current) => ({ ...current, name: event.target.value })) }} className="mt-1" disabled={isEdit && role?.isSystem} />
            {roleFormErrors.name && <span className="mt-1 block text-xs text-danger-600">{roleFormErrors.name}</span>}
          </label>
          <label className="text-sm font-medium text-neutral-700">
            Description
            <Input {...{ value: roleForm.description, onChange: (event) => setRoleForm((current) => ({ ...current, description: event.target.value })) }} className="mt-1" disabled={isEdit && role?.isSystem} />
          </label>
          <Button type="submit" disabled={isEdit && role?.isSystem}><Save className="h-4 w-4" /> Save details</Button>
        </form>
        {isEdit && role?.isSystem && <p className="mt-3 text-xs text-neutral-400">System role metadata is read-only. Its access grid can still be managed by a Super Admin.</p>}
      </Card>

      {isEdit && (
        <>
          {readOnly && <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"><ShieldCheck className="h-4 w-4" /> Super Admin access is always enabled and cannot be changed.</div>}
          <Card>
            <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div><h2 className="font-semibold text-neutral-900">Module access grid</h2><p className="mt-1 text-sm text-neutral-500">A hidden module disables all of its actions for the role.</p></div>
              <Button onClick={saveAccess} disabled={saving || readOnly} isLoading={saving}><Save className="h-4 w-4" /> Save access</Button>
            </div>
            <div className="space-y-6">
              {Object.entries(groupedModules).map(([group, groupModules]) => (
                <section key={group}>
                  <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-neutral-500">{group}</h3>
                  <div className="overflow-x-auto rounded-lg border border-neutral-200">
                    <table className="min-w-[980px] w-full text-left text-sm">
                      <thead className="bg-neutral-50 text-xs uppercase text-neutral-500">
                        <tr>
                          <th className="min-w-[240px] px-4 py-3">Module</th>
                          <th className="px-3 py-3 text-center">Module Visible</th>
                          {ACTIONS.map((action) => <th key={action} className="px-2 py-3 text-center">{ACTION_LABELS[action]}</th>)}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-100">
                        {groupModules.map((module) => (
                          <tr key={module.key} className={module.isVisible ? "bg-white" : "bg-neutral-50 text-neutral-400"}>
                            <td className="px-4 py-3"><p className="font-medium text-neutral-800">{module.label}</p><p className="mt-0.5 text-xs text-neutral-400">{module.key}{!module.isActive && " · inactive"}</p></td>
                            <td className="px-3 py-3 text-center"><input type="checkbox" checked={module.isVisible} disabled={readOnly || !module.isActive} onChange={(event) => updateModule(module.key, { isVisible: event.target.checked })} className="h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500" aria-label={`${module.label} visibility`} /></td>
                            {ACTIONS.map((action) => <td key={action} className="px-2 py-3 text-center"><input type="checkbox" checked={module.isVisible && module.actions?.[action] === true} disabled={readOnly || !module.isVisible || !module.isActive} onChange={() => toggleAction(module.key, action)} className="h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500 disabled:cursor-not-allowed" aria-label={`${module.label} ${action}`} /></td>)}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              ))}
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
