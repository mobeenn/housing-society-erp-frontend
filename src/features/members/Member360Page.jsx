import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  User,
  Building2,
  CreditCard,
  FileText,
  MessageSquare,
  Clock,
  Edit,
  Phone,
  Mail,
  MapPin,
  Users,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { getMember360 } from "./membersApi";
import DocumentUploader from "@/components/documents/DocumentUploader";
import DocumentList from "@/components/documents/DocumentList";
import MemberStatementPage from "@/features/payments/MemberStatementPage";
import InvoiceTable from "@/features/invoices/InvoiceTable";
import { useCan } from "@/hooks/useCan";

export default function Member360Page() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const canViewInvoices = useCan("invoices", "view");
  const [data, setData] = useState(null);
  const [documentRefreshKey, setDocumentRefreshKey] = useState(0);

  useEffect(() => {
    loadMember360();
  }, [id]);

  const loadMember360 = async () => {
    try {
      setLoading(true);
      const result = await getMember360(id);
      setData(result);
    } catch (error) {
      toast.error("Failed to load member profile");
      navigate("/members");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-secondary">Loading...</div>
      </div>
    );
  }

  if (!data) return null;

  const { member } = data;

  const tabs = [
    { id: "overview", label: "Overview", icon: User },
    {
      id: "properties",
      label: "Properties",
      icon: Building2,
      count: data.properties?.length,
    },
    {
      id: "financials",
      label: "Financials",
      icon: CreditCard,
      count: data.payments?.length,
    },
    ...(canViewInvoices
      ? [{ id: "invoices", label: "Invoices", icon: FileText }]
      : []),
    {
      id: "documents",
      label: "Documents",
      icon: FileText,
      count: data.documents?.length,
    },
    {
      id: "complaints",
      label: "Complaints",
      icon: MessageSquare,
      count: data.complaints?.length,
    },
    {
      id: "activity",
      label: "Activity",
      icon: Clock,
      count: data.auditLogs?.length,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/members")}
            className="p-2 hover:bg-surface-muted rounded-control"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-h1 font-bold text-primary">{member.name}</h1>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-body font-mono text-secondary">
                {member.memberId}
              </span>
              <span
                className={`px-2.5 py-0.5 text-small font-medium rounded-full ${
                  member.status === "Active"
                    ? "bg-success-soft text-success"
                    : member.status === "Blacklisted"
                      ? "bg-danger-soft text-danger"
                      : "bg-surface-muted text-primary"
                }`}
              >
                {member.status}
              </span>
            </div>
          </div>
        </div>
        <button
          onClick={() => navigate(`/members/${id}/edit`)}
          className="flex items-center gap-2 px-4 py-2 bg-accent text-on-accent rounded-control hover:bg-accent-hover"
        >
          <Edit className="w-4 h-4" />
          Edit Member
        </button>
      </div>

      {/* Quick Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-surface border border-border rounded-control p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-info-soft rounded-control">
              <User className="w-5 h-5 text-info" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-small text-secondary">CNIC</p>
              <p className="text-body font-medium text-primary font-mono">
                {member.cnic}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-surface border border-border rounded-control p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-success-soft rounded-control">
              <Phone className="w-5 h-5 text-success" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-small text-secondary">Phone</p>
              <p className="text-body font-medium text-primary">
                {member.phone || "—"}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-surface border border-border rounded-control p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-info-soft rounded-control">
              <Mail className="w-5 h-5 text-info" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-small text-secondary">Email</p>
              <p className="text-body font-medium text-primary truncate">
                {member.email || "—"}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-surface border border-border rounded-control p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-warning-soft rounded-control">
              <Clock className="w-5 h-5 text-warning" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-small text-secondary">Member Since</p>
              <p className="text-body font-medium text-primary">
                {new Date(member.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-border">
        <nav className="flex gap-6">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 pb-3 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? "border-info text-info"
                    : "border-transparent text-secondary hover:text-primary"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="font-medium">{tab.label}</span>
                {tab.count !== undefined && tab.count > 0 && (
                  <span className="px-2 py-0.5 text-small bg-surface-muted text-primary rounded-full">
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-surface shadow-none rounded-control">
        {activeTab === "overview" && (
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-h2 font-semibold text-primary">
                  Personal Information
                </h3>
                <dl className="space-y-3">
                  <div>
                    <dt className="text-body font-medium text-secondary">
                      Full Name
                    </dt>
                    <dd className="mt-1 text-body text-primary">
                      {member.name}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-body font-medium text-secondary">CNIC</dt>
                    <dd className="mt-1 text-body font-mono text-primary">
                      {member.cnic}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-body font-medium text-secondary">Phone</dt>
                    <dd className="mt-1 text-body text-primary">
                      {member.phone || "—"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-body font-medium text-secondary">Email</dt>
                    <dd className="mt-1 text-body text-primary">
                      {member.email || "—"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-body font-medium text-secondary">
                      Address
                    </dt>
                    <dd className="mt-1 text-body text-primary flex items-start gap-2">
                      {member.address ? (
                        <>
                          <MapPin className="w-4 h-4 text-muted mt-0.5 shrink-0" />
                          {member.address}
                        </>
                      ) : (
                        "—"
                      )}
                    </dd>
                  </div>
                </dl>
              </div>

              {/* Nominee Information */}
              <div className="space-y-4">
                <h3 className="text-h2 font-semibold text-primary flex items-center gap-2">
                  <Users className="w-5 h-5 text-secondary" />
                  Nominee Information
                </h3>
                {member.nominee ? (
                  <dl className="space-y-3">
                    <div>
                      <dt className="text-body font-medium text-secondary">
                        Nominee Name
                      </dt>
                      <dd className="mt-1 text-body text-primary">
                        {member.nominee.name || "—"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-body font-medium text-secondary">
                        Relation
                      </dt>
                      <dd className="mt-1 text-body text-primary">
                        {member.nominee.relation || "—"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-body font-medium text-secondary">
                        Nominee CNIC
                      </dt>
                      <dd className="mt-1 text-body font-mono text-primary">
                        {member.nominee.cnic || "—"}
                      </dd>
                    </div>
                  </dl>
                ) : (
                  <p className="text-body text-secondary">
                    No nominee information available
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "properties" && (
          <div className="p-6">
            <div className="text-center py-12">
              <Building2 className="w-12 h-12 text-muted mx-auto mb-3" />
              <h3 className="text-h2 font-medium text-primary mb-1">
                Properties Coming Soon
              </h3>
              <p className="text-body text-secondary">
                Property management will be available in the next phase
              </p>
            </div>
          </div>
        )}

        {activeTab === "financials" && (
          <div className="p-6">
            <MemberStatementPage embedded />
          </div>
        )}

        {activeTab === "invoices" && canViewInvoices && (
          <div className="p-6">
            <InvoiceTable member={id} embedded />
          </div>
        )}

        {activeTab === "documents" && (
          <div className="p-6">
            <div className="space-y-5">
              <DocumentUploader
                relatedEntityType="member"
                relatedEntityId={id}
                onUploaded={() => setDocumentRefreshKey((key) => key + 1)}
              />
              <DocumentList
                relatedEntityType="member"
                relatedEntityId={id}
                refreshKey={documentRefreshKey}
              />
            </div>
          </div>
        )}

        {activeTab === "complaints" && (
          <div className="p-6">
            <div className="text-center py-12">
              <MessageSquare className="w-12 h-12 text-muted mx-auto mb-3" />
              <h3 className="text-h2 font-medium text-primary mb-1">
                Complaints Coming Soon
              </h3>
              <p className="text-body text-secondary">
                Complaint tracking will be available in the next phase
              </p>
            </div>
          </div>
        )}

        {activeTab === "activity" && (
          <div className="p-6">
            <div className="text-center py-12">
              <Clock className="w-12 h-12 text-muted mx-auto mb-3" />
              <h3 className="text-h2 font-medium text-primary mb-1">
                Activity History Coming Soon
              </h3>
              <p className="text-body text-secondary">
                Audit logs will be available in the next phase
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
