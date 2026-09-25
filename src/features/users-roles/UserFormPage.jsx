import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "react-hot-toast";
import { ArrowLeft, Loader2 } from "lucide-react";
import {
  getUserById,
  createUser,
  updateUser,
  getRoles,
} from "./usersRolesApi";

const userSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  roleId: z.string().min(1, "Role is required"),
  password: z.string().min(8, "Password must be at least 8 characters").optional(),
  isActive: z.boolean().optional(),
  mustResetPassword: z.boolean().optional(),
});

export default function UserFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [roles, setRoles] = useState([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(
      isEdit
        ? userSchema.omit({ password: true }).extend({
            password: z.string().min(8).optional().or(z.literal("")),
          })
        : userSchema
    ),
    defaultValues: {
      isActive: true,
      mustResetPassword: false,
    },
  });

  useEffect(() => {
    loadRoles();
    if (isEdit) {
      loadUser();
    }
  }, [id]);

  const loadRoles = async () => {
    try {
      const data = await getRoles();
      setRoles(data);
    } catch (error) {
      toast.error("Failed to load roles");
    }
  };

  const loadUser = async () => {
    try {
      const user = await getUserById(id);
      reset({
        name: user.name,
        email: user.email,
        phone: user.phone || "",
        roleId: user.roleId,
        isActive: user.isActive,
        mustResetPassword: user.mustResetPassword,
      });
    } catch (error) {
      toast.error("Failed to load user");
      navigate("/admin/users");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      if (isEdit) {
        const updatePayload = { ...data };
        if (!updatePayload.password) {
          delete updatePayload.password;
        }
        await updateUser(id, updatePayload);
        toast.success("User updated successfully");
      } else {
        await createUser(data);
        toast.success("User created successfully");
      }
      navigate("/admin/users");
    } catch (error) {
      toast.error(error.response?.data?.message || `Failed to ${isEdit ? "update" : "create"} user`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-info animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/admin/users")}
          className="p-2 hover:bg-surface-muted rounded-control"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-h1 font-bold text-primary">
            {isEdit ? "Edit User" : "Add User"}
          </h1>
          <p className="text-body text-secondary mt-1">
            {isEdit ? "Update user information and role" : "Create a new system user"}
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="bg-surface border border-border rounded-control p-6 space-y-6">
        {/* Name */}
        <div>
          <label className="block text-body font-medium text-primary mb-1">
            Name <span className="text-danger">*</span>
          </label>
          <input
            type="text"
            {...register("name")}
            className={`w-full px-3 py-2 border rounded-control focus:ring-2 focus:ring-info focus:border-transparent ${
              errors.name ? "border-danger" : "border-border-strong"
            }`}
            placeholder="John Doe"
          />
          {errors.name && (
            <p className="text-body text-danger mt-1">{errors.name.message}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block text-body font-medium text-primary mb-1">
            Email <span className="text-danger">*</span>
          </label>
          <input
            type="email"
            {...register("email")}
            className={`w-full px-3 py-2 border rounded-control focus:ring-2 focus:ring-info focus:border-transparent ${
              errors.email ? "border-danger" : "border-border-strong"
            }`}
            placeholder="john@example.com"
            disabled={isEdit}
          />
          {errors.email && (
            <p className="text-body text-danger mt-1">{errors.email.message}</p>
          )}
          {isEdit && (
            <p className="text-small text-secondary mt-1">Email cannot be changed</p>
          )}
        </div>

        {/* Phone */}
        <div>
          <label className="block text-body font-medium text-primary mb-1">Phone</label>
          <input
            type="text"
            {...register("phone")}
            className="w-full px-3 py-2 border border-border-strong rounded-control focus:ring-2 focus:ring-info focus:border-transparent"
            placeholder="+92 300 1234567"
          />
        </div>

        {/* Role */}
        <div>
          <label className="block text-body font-medium text-primary mb-1">
            Role <span className="text-danger">*</span>
          </label>
          <select
            {...register("roleId")}
            className={`w-full px-3 py-2 border rounded-control focus:ring-2 focus:ring-info focus:border-transparent ${
              errors.roleId ? "border-danger" : "border-border-strong"
            }`}
          >
            <option value="">Select a role</option>
            {roles.map((role) => (
              <option key={role._id} value={role._id}>
                {role.name} — {role.description}
              </option>
            ))}
          </select>
          {errors.roleId && (
            <p className="text-body text-danger mt-1">{errors.roleId.message}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <label className="block text-body font-medium text-primary mb-1">
            Password {!isEdit && <span className="text-danger">*</span>}
          </label>
          <input
            type="password"
            {...register("password")}
            className={`w-full px-3 py-2 border rounded-control focus:ring-2 focus:ring-info focus:border-transparent ${
              errors.password ? "border-danger" : "border-border-strong"
            }`}
            placeholder={isEdit ? "Leave blank to keep current password" : "Enter password"}
          />
          {errors.password && (
            <p className="text-body text-danger mt-1">{errors.password.message}</p>
          )}
          {isEdit && (
            <p className="text-small text-secondary mt-1">
              Leave blank to keep the current password
            </p>
          )}
        </div>

        {/* Active Status */}
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="isActive"
            {...register("isActive")}
            className="w-4 h-4 text-info border-border-strong rounded-control focus:ring-info"
          />
          <label htmlFor="isActive" className="text-body font-medium text-primary">
            Active (user can log in)
          </label>
        </div>

        {/* Must Reset Password */}
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="mustResetPassword"
            {...register("mustResetPassword")}
            className="w-4 h-4 text-info border-border-strong rounded-control focus:ring-info"
          />
          <label htmlFor="mustResetPassword" className="text-body font-medium text-primary">
            Require password reset on next login
          </label>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t">
          <button
            type="button"
            onClick={() => navigate("/admin/users")}
            disabled={submitting}
            className="px-4 py-2 border border-border-strong rounded-control text-primary hover:bg-surface-muted disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 bg-accent text-on-accent rounded-control hover:bg-accent-hover disabled:opacity-50 flex items-center gap-2"
          >
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {isEdit ? "Update User" : "Create User"}
          </button>
        </div>
      </form>
    </div>
  );
}
