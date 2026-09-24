import { useCan } from "@/hooks/useCan";
import RecoveryAdminPage from "./RecoveryAdminPage";
import RecoveryPortalPage from "./RecoveryPortalPage";

export default function RecoveryPage() {
  const canManage = useCan("recovery", "create");
  return canManage ? <RecoveryAdminPage /> : <RecoveryPortalPage />;
}
