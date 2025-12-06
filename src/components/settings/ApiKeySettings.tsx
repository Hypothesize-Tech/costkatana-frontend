import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Settings, Key, Sparkles, AlertTriangle, Lock, BookOpen } from "lucide-react";
import { userService } from "../../services/user.service";
import { ApiKeySettingsShimmer } from "../shimmer/SettingsShimmer";
import { useNotifications } from "../../contexts/NotificationContext";

interface ApiKeySettingsProps {
  profile: any;
  onUpdate: (data: any) => void;
}

const PERMISSION_OPTIONS = [
  {
    id: "read",
    name: "Read Only",
    description: "View projects, usage data, and analytics",
  },
  {
    id: "write",
    name: "Read & Write",
    description: "Track usage, create projects, and modify data",
  },
  {
    id: "admin",
    name: "Admin",
    description: "Full access including user management",
  },
];

export const ApiKeySettings: React.FC<ApiKeySettingsProps> = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newKey, setNewKey] = useState({
    name: "",
    permissions: ["read"] as string[],
    expiresAt: "",
  });

  const [showCreatedKey, setShowCreatedKey] = useState<string | null>(null);
  const { showNotification } = useNotifications();
  const queryClient = useQueryClient();

  const { data: apiKeys, isLoading } = useQuery(
    ["dashboard-api-keys"],
    userService.getDashboardApiKeys,
  );
  const createKeyMutation = useMutation(
    (data: { name: string; permissions: string[]; expiresAt?: string }) =>
      userService.createDashboardApiKey(
        data.name,
        data.permissions,
        data.expiresAt,
      ),
    {
      onSuccess: (response) => {
        queryClient.invalidateQueries(["dashboard-api-keys"]);
        showNotification("Dashboard API key created successfully", "success");
        setShowCreatedKey(response.data.apiKey);
        setShowAddForm(false);
        setNewKey({ name: "", permissions: ["read"], expiresAt: "" });
      },
      onError: () => {
        showNotification("Failed to create API key", "error");
      },
    },
  );

  const deleteKeyMutation = useMutation(
    (keyId: string) => userService.deleteDashboardApiKey(keyId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["dashboard-api-keys"]);
        showNotification("API key deleted successfully", "success");
      },
      onError: () => {
        showNotification("Failed to delete API key", "error");
      },
    },
  );

  const handleCreateKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKey.name.trim()) {
      showNotification("Please enter a name for the API key", "error");
      return;
    }
    createKeyMutation.mutate({
      name: newKey.name.trim(),
      permissions: newKey.permissions,
      expiresAt: newKey.expiresAt || undefined,
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showNotification("API key copied to clipboard", "success");
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const isExpired = (expiresAt?: string) => {
    return expiresAt ? new Date(expiresAt) < new Date() : false;
  };

  if (isLoading) return <ApiKeySettingsShimmer />;

  return (
    <div className="space-y-4 sm:space-y-6 md:space-y-8">
      {/* Header */}
      <div className="p-4 rounded-xl border shadow-lg backdrop-blur-xl glass border-primary-200/30 sm:p-5 md:p-6">
        <div className="flex flex-col gap-2 items-start mb-3 sm:flex-row sm:gap-3 sm:items-center sm:mb-3.5 md:mb-4">
          <div className="flex justify-center items-center w-8 h-8 rounded-xl bg-gradient-primary glow-primary sm:w-9 sm:h-9 md:w-10 md:h-10">
            <Key className="w-4 h-4 text-white sm:w-4.5 sm:h-4.5 md:w-5 md:h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold font-display gradient-text sm:text-xl md:text-xl">
              Dashboard API Keys
            </h2>
            <p className="text-xs font-body text-light-text-secondary dark:text-dark-text-secondary sm:text-sm md:text-base">
              Create API keys to access your dashboard data programmatically. These
              keys can be used to retrieve project information, track usage, and
              access analytics.
            </p>
          </div>
        </div>
      </div>

      {/* Show newly created key - Responsive */}
      {showCreatedKey && (
        <div className="p-4 rounded-xl border shadow-lg backdrop-blur-xl glass border-success-200/30 bg-gradient-success/10 sm:p-5 md:p-6">
          <div className="flex flex-col gap-3 justify-between items-start mb-3 sm:flex-row sm:items-center sm:mb-3.5 md:mb-4">
            <h3 className="flex gap-1.5 items-center text-sm font-semibold font-display gradient-text-success sm:gap-2 sm:text-base md:text-lg">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
              API Key Created Successfully
            </h3>
            <button
              onClick={() => setShowCreatedKey(null)}
              className="btn btn-icon-secondary self-end sm:self-auto"
            >
              ×
            </button>
          </div>
          <div className="p-3 mb-3 rounded-lg border glass border-warning-200/30 bg-gradient-warning/10 sm:p-4 sm:mb-4">
            <p className="flex gap-1.5 items-center text-sm font-semibold font-display gradient-text-warning sm:gap-2 sm:text-base">
              <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5" />
              IMPORTANT: Copy this API key now!
            </p>
            <p className="mt-2 text-xs font-body text-light-text-secondary dark:text-dark-text-secondary sm:text-sm">
              This is the only time you'll see the full key. After closing this
              dialog, only a masked version will be shown for security.
            </p>
          </div>
          <div className="space-y-3 sm:space-y-4">
            <div>
              <label className="block mb-2 text-sm font-medium font-display gradient-text-success sm:text-base">
                Full API Key (copy this):
              </label>
              <div className="flex flex-col gap-2 items-stretch sm:flex-row sm:gap-3 sm:items-center">
                <code className="flex-1 p-3 font-mono text-xs break-all rounded-lg border glass border-primary-200/30 sm:p-4 sm:text-sm">
                  {showCreatedKey}
                </code>
                <button
                  onClick={() => {
                    copyToClipboard(showCreatedKey);
                    showNotification(
                      "Full API key copied to clipboard!",
                      "success",
                    );
                  }}
                  className="whitespace-nowrap btn btn-primary w-full sm:w-auto"
                >
                  Copy Full Key
                </button>
              </div>
            </div>
            <div className="p-3 rounded-lg border glass border-info-200/30 bg-gradient-info/10 sm:p-4">
              <p className="mb-2 text-sm font-semibold font-display gradient-text sm:text-base">
                Usage Instructions:
              </p>
              <p className="mb-2 text-xs font-body text-light-text-secondary dark:text-dark-text-secondary sm:text-sm">
                Set this as your <code className="px-1.5 py-0.5 text-xs font-mono rounded glass sm:px-2 sm:py-1">API_KEY</code> environment variable:
              </p>
              <code className="block px-2.5 py-1.5 font-mono text-xs rounded-lg glass break-all sm:px-3 sm:py-2 sm:text-sm">
                API_KEY={showCreatedKey}
              </code>
            </div>
          </div>
        </div>
      )}

      {/* Existing API Keys - Responsive */}
      <div className="space-y-3 sm:space-y-4">
        {apiKeys && Array.isArray(apiKeys) && apiKeys.length > 0 ? (
          apiKeys.map((apiKey: any) => (
            <div
              key={apiKey.keyId}
              className={`glass rounded-xl p-4 border shadow-lg backdrop-blur-xl sm:p-5 md:p-6 ${isExpired(apiKey.expiresAt)
                ? "border-danger-200/30 bg-gradient-danger/10"
                : "border-primary-200/30"
                }`}
            >
              <div className="flex flex-col gap-3 justify-between items-start sm:flex-row">
                <div className="flex-1 w-full">
                  <div className="flex flex-wrap gap-2 items-center mb-3 sm:gap-3 sm:mb-4">
                    <h3 className="text-sm font-semibold font-display text-light-text-primary dark:text-dark-text-primary sm:text-base">
                      {apiKey.name}
                    </h3>
                    {isExpired(apiKey.expiresAt) && (
                      <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full border glass font-display border-danger-200/30 bg-gradient-danger/20 text-danger-700 dark:text-danger-300 sm:px-3 sm:py-1">
                        Expired
                      </span>
                    )}
                  </div>
                  <div className="space-y-3 sm:space-y-4">
                    <div>
                      <label className="block mb-2 text-sm font-medium font-display gradient-text sm:text-base">
                        Masked Key ID (for reference only):
                      </label>
                      <code className="block px-2.5 py-1.5 font-mono text-xs rounded-lg border glass border-primary-200/30 break-all sm:px-3 sm:py-2 sm:text-sm">
                        {apiKey.maskedKey}
                      </code>
                    </div>
                    <div className="p-3 rounded-lg border glass border-warning-200/30 bg-gradient-warning/10 sm:p-4">
                      <p className="flex gap-1.5 items-center mb-2 text-sm font-semibold font-display gradient-text-warning sm:gap-2 sm:text-base">
                        <Lock className="w-4 h-4 sm:w-5 sm:h-5" />
                        Security Notice
                      </p>
                      <p className="text-xs font-body text-light-text-secondary dark:text-dark-text-secondary sm:text-sm">
                        Full API key was only shown once during creation. If
                        you need the full key again, you'll need to delete
                        this key and create a new one.
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2 items-center text-xs font-body text-light-text-secondary dark:text-dark-text-secondary sm:gap-3 sm:text-sm">
                      <span className="px-2 py-0.5 rounded-full border glass border-secondary-200/30 sm:py-1">
                        Permissions: {apiKey.permissions.join(", ")}
                      </span>
                      <span className="px-2 py-0.5 rounded-full border glass border-accent-200/30 sm:py-1">
                        Created: {formatDate(apiKey.createdAt)}
                      </span>
                      {apiKey.expiresAt && (
                        <span className="px-2 py-0.5 rounded-full border glass border-warning-200/30 sm:py-1">
                          Expires: {formatDate(apiKey.expiresAt)}
                        </span>
                      )}
                      {apiKey.lastUsed && (
                        <span className="px-2 py-0.5 rounded-full border glass border-info-200/30 sm:py-1">
                          Last used: {formatDate(apiKey.lastUsed)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => deleteKeyMutation.mutate(apiKey.keyId)}
                  className="btn btn-icon-danger self-start sm:self-center"
                  disabled={deleteKeyMutation.isLoading}
                >
                  <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="p-6 text-center rounded-xl border shadow-lg backdrop-blur-xl glass border-primary-200/30 sm:p-8">
            <div className="flex justify-center items-center mx-auto mb-3 w-12 h-12 rounded-xl bg-gradient-secondary/20 sm:mb-4 sm:w-16 sm:h-16">
              <Settings className="w-6 h-6 text-secondary-500 sm:w-8 sm:h-8" />
            </div>
            <p className="mb-2 text-sm font-semibold font-display text-light-text-primary dark:text-dark-text-primary sm:text-base">No API keys configured</p>
            <p className="text-xs font-body text-light-text-secondary dark:text-dark-text-secondary sm:text-sm">
              Create an API key to access your dashboard data
            </p>
          </div>
        )}
      </div>

      {/* Add New Key Form - Responsive */}
      {showAddForm ? (
        <form onSubmit={handleCreateKey} className="p-4 rounded-xl border shadow-lg backdrop-blur-xl glass border-primary-200/30 sm:p-5 md:p-6">
          <h3 className="mb-4 text-base font-bold font-display gradient-text sm:mb-5 sm:text-lg md:mb-6">
            Create New API Key
          </h3>
          <div className="space-y-4 sm:space-y-5 md:space-y-6">
            <div>
              <label className="block mb-2 text-sm font-medium font-display gradient-text sm:text-base">
                Name
              </label>
              <input
                type="text"
                value={newKey.name}
                onChange={(e) => setNewKey({ ...newKey, name: e.target.value })}
                className="input"
                placeholder="e.g., Production API, Development Access"
                required
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium font-display gradient-text sm:mb-3 sm:text-base">
                Permissions
              </label>
              <div className="space-y-2.5 sm:space-y-3">
                {PERMISSION_OPTIONS.map((permission) => (
                  <label key={permission.id} className="flex gap-2 items-start p-3 rounded-lg border transition-all duration-200 cursor-pointer glass border-primary-200/30 hover:bg-gradient-primary/5 sm:gap-3 sm:p-4">
                    <input
                      type="checkbox"
                      checked={newKey.permissions.includes(permission.id)}
                      onChange={(e) => {
                        const permissions = e.target.checked
                          ? [...newKey.permissions, permission.id]
                          : newKey.permissions.filter(
                            (p) => p !== permission.id,
                          );
                        setNewKey({ ...newKey, permissions });
                      }}
                      className="mt-0.5 w-4 h-4 rounded text-primary-600 border-primary-300 focus:ring-primary-500 sm:mt-1"
                    />
                    <div>
                      <span className="text-sm font-medium font-display text-light-text-primary dark:text-dark-text-primary sm:text-base">
                        {permission.name}
                      </span>
                      <p className="mt-1 text-xs font-body text-light-text-secondary dark:text-dark-text-secondary sm:text-sm">
                        {permission.description}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium font-display gradient-text sm:text-base">
                Expiration (Optional)
              </label>
              <input
                type="date"
                value={newKey.expiresAt}
                onChange={(e) =>
                  setNewKey({ ...newKey, expiresAt: e.target.value })
                }
                className="input"
                min={new Date().toISOString().split("T")[0]}
              />
              <p className="mt-2 text-xs font-body text-light-text-secondary dark:text-dark-text-secondary sm:text-sm">
                Leave empty for no expiration
              </p>
            </div>

            <div className="flex flex-col gap-2 justify-end pt-3 sm:flex-row sm:gap-3 sm:pt-4">
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setNewKey({ name: "", permissions: ["read"], expiresAt: "" });
                }}
                className="btn-secondary btn w-full sm:w-auto"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createKeyMutation.isLoading}
                className="btn-primary btn w-full sm:w-auto"
              >
                {createKeyMutation.isLoading ? "Creating..." : "Create API Key"}
              </button>
            </div>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setShowAddForm(true)}
          className="inline-flex gap-2 items-center btn-primary btn w-full sm:w-auto"
        >
          <Plus className="w-4 h-4" />
          Create API Key
        </button>
      )}

      {/* Usage Instructions - Responsive */}
      <div className="p-4 rounded-xl border shadow-lg backdrop-blur-xl glass border-info-200/30 bg-gradient-info/10 sm:p-5 md:p-6">
        <div className="flex gap-2 items-center mb-3 sm:gap-3 sm:mb-4">
          <div className="flex justify-center items-center w-7 h-7 rounded-lg bg-gradient-info glow-info sm:w-8 sm:h-8">
            <BookOpen className="w-3.5 h-3.5 text-white sm:w-4 sm:h-4" />
          </div>
          <h4 className="text-sm font-semibold font-display gradient-text sm:text-base">
            Usage Instructions
          </h4>
        </div>
        <div className="space-y-2 text-xs font-body text-light-text-primary dark:text-dark-text-primary sm:space-y-3 sm:text-sm">
          <p className="flex gap-1.5 items-start sm:gap-2">
            <span className="text-info-500">•</span>
            <span>Use these API keys in the Authorization header:{" "}
              <code className="px-1.5 py-0.5 font-mono rounded glass sm:px-2 sm:py-1">Bearer your_api_key</code></span>
          </p>
          <p className="flex gap-1.5 items-start sm:gap-2">
            <span className="text-info-500">•</span>
            <span>Access project data: <code className="px-1.5 py-0.5 font-mono rounded glass break-all sm:px-2 sm:py-1">GET /api/projects</code></span>
          </p>
          <p className="flex gap-1.5 items-start sm:gap-2">
            <span className="text-info-500">•</span>
            <span>Track usage: <code className="px-1.5 py-0.5 font-mono rounded glass break-all sm:px-2 sm:py-1">POST /api/usage/track</code></span>
          </p>
          <p className="flex gap-1.5 items-start sm:gap-2">
            <span className="text-info-500">•</span>
            <span>View analytics: <code className="px-1.5 py-0.5 font-mono rounded glass break-all sm:px-2 sm:py-1">GET /api/analytics</code></span>
          </p>
        </div>
      </div>
    </div>
  );
};
