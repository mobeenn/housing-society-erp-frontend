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
        <div className="text-gray-600">Loading...</div>
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
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{member.name}</h1>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-sm font-mono text-gray-600">
                {member.memberId}
              </span>
              <span
                className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${
                  member.status === "Active"
                    ? "bg-green-100 text-green-700"
                    : member.status === "Blacklisted"
                      ? "bg-red-100 text-red-700"
                      : "bg-gray-100 text-gray-700"
                }`}
              >
                {member.status}
              </span>
            </div>
          </div>
        </div>
        <button
          onClick={() => navigate(`/members/${id}/edit`)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Edit className="w-4 h-4" />
          Edit Member
        </button>
      </div>

      {/* Quick Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <User className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-600">CNIC</p>
              <p className="text-sm font-medium text-gray-900 font-mono">
                {member.cnic}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Phone className="w-5 h-5 text-green-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-600">Phone</p>
              <p className="text-sm font-medium text-gray-900">
                {member.phone || "—"}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Mail className="w-5 h-5 text-purple-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-600">Email</p>
              <p className="text-sm font-medium text-gray-900 truncate">
                {member.email || "—"}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-600">Member Since</p>
              <p className="text-sm font-medium text-gray-900">
                {new Date(member.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-6">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 pb-3 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="font-medium">{tab.label}</span>
                {tab.count !== undefined && tab.count > 0 && (
                  <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-700 rounded-full">
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white shadow rounded-lg">
        {activeTab === "overview" && (
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Personal Information
                </h3>
                <dl className="space-y-3">
                  <div>
                    <dt className="text-sm font-medium text-gray-600">
                      Full Name
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {member.name}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-600">CNIC</dt>
                    <dd className="mt-1 text-sm font-mono text-gray-900">
                      {member.cnic}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-600">Phone</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {member.phone || "—"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-600">Email</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {member.email || "—"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-600">
                      Address
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 flex items-start gap-2">
                      {member.address ? (
                        <>
                          <MapPin className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
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
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Users className="w-5 h-5 text-gray-600" />
                  Nominee Information
                </h3>
                {member.nominee ? (
                  <dl className="space-y-3">
                    <div>
                      <dt className="text-sm font-medium text-gray-600">
                        Nominee Name
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {member.nominee.name || "—"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-600">
                        Relation
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {member.nominee.relation || "—"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-600">
                        Nominee CNIC
                      </dt>
                      <dd className="mt-1 text-sm font-mono text-gray-900">
                        {member.nominee.cnic || "—"}
                      </dd>
                    </div>
                  </dl>
                ) : (
                  <p className="text-sm text-gray-500">
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
              <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">
                Properties Coming Soon
              </h3>
              <p className="text-sm text-gray-600">
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
              <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">
                Complaints Coming Soon
              </h3>
              <p className="text-sm text-gray-600">
                Complaint tracking will be available in the next phase
              </p>
            </div>
          </div>
        )}

        {activeTab === "activity" && (
          <div className="p-6">
            <div className="text-center py-12">
              <Clock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">
                Activity History Coming Soon
              </h3>
              <p className="text-sm text-gray-600">
                Audit logs will be available in the next phase
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
