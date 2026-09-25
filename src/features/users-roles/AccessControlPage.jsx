import { useEffect, useState } from "react";
import { Loader2, ShieldAlert } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { getRoles } from "./usersRolesApi";

/** Entry point for the Super Admin-only access-control panel. */
export default function AccessControlPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    getRoles()
      .then((result) => {
        const roles = Array.isArray(result) ? result : result?.roles || [];
        if (!active) return;
        const firstRole = roles[0];
        if (firstRole) navigate(`/admin/roles/${firstRole._id}/edit`, { replace: true });
        else {
          toast.error("No roles are available");
          setLoading(false);
        }
      })
      .catch((error) => {
        if (active) {
          toast.error(error.response?.data?.message || "Unable to open Access Control");
          setLoading(false);
        }
      });
    return () => { active = false; };
  }, [navigate]);

  if (loading) return <div className="flex min-h-[50vh] items-center justify-center"><Loader2 className="h-7 w-7 animate-spin text-accent" /></div>;
  return <div className="flex min-h-[50vh] items-center justify-center"><div className="text-center text-secondary"><ShieldAlert className="mx-auto mb-3 h-8 w-8" />No role is available for access control.</div></div>;
}
