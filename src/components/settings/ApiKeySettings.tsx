import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Settings, Key, Sparkles, AlertTriangle, Lock, BookOpen } from "lucide-react";
import { userService } from "../../services/user.service";
import { LoadingSpinner } from "../common/LoadingSpinner";
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

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-8">
      <div className="p-6 rounded-xl border shadow-lg backdrop-blur-xl glass border-primary-200/30">
        <div className="flex gap-3 items-center mb-4">
          <div className="flex justify-center items-center w-10 h-10 rounded-xl bg-gradient-primary glow-primary">
            <Key className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold font-display gradient-text">
              Dashboard API Keys
            </h2>
            <p className="font-body text-light-text-secondary dark:text-dark-text-secondary">
              Create API keys to access your dashboard data programmatically. These
              keys can be used to retrieve project information, track usage, and
              access analytics.
            </p>
          </div>
        </div>
      </div>

      {/* Show newly created key */}
      {showCreatedKey && (
        <div className="p-6 rounded-xl border shadow-lg backdrop-blur-xl glass border-success-200/30 bg-gradient-success/10">
          <div className="flex justify-between items-center mb-4">
            <h3 className="flex gap-2 items-center font-semibold font-display gradient-text-success">
              <Sparkles className="w-5 h-5" />
              API Key Created Successfully
            </h3>
            <button
              onClick={() => setShowCreatedKey(null)}
              className="btn btn-icon-secondary"
            >
              ×
            </button>
          </div>
          <div className="p-4 mb-4 rounded-lg border glass border-warning-200/30 bg-gradient-warning/10">
            <p className="flex gap-2 items-center font-semibold font-display gradient-text-warning">
              <AlertTriangle className="w-5 h-5" />
              IMPORTANT: Copy this API key now!
            </p>
            <p className="mt-2 font-body text-light-text-secondary dark:text-dark-text-secondary">
              This is the only time you'll see the full key. After closing this
              dialog, only a masked version will be shown for security.
            </p>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block mb-2 font-medium font-display gradient-text-success">
                Full API Key (copy this):
              </label>
              <div className="flex gap-3 items-center">
                <code className="flex-1 p-4 font-mono text-sm break-all rounded-lg border glass border-primary-200/30">
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
                  className="whitespace-nowrap btn btn-primary"
                >
                  Copy Full Key
                </button>
              </div>
            </div>
            <div className="p-4 rounded-lg border glass border-info-200/30 bg-gradient-info/10">
              <p className="mb-2 font-semibold font-display gradient-text">
                Usage Instructions:
              </p>
              <p className="mb-2 font-body text-light-text-secondary dark:text-dark-text-secondary">
                Set this as your <code className="px-2 py-1 font-mono rounded glass">API_KEY</code> environment variable:
              </p>
              <code className="block px-3 py-2 font-mono text-sm rounded-lg glass">
                API_KEY={showCreatedKey}
              </code>
            </div>
          </div>
        </div>
      )}

      {/* Existing API Keys */}
      <div className="space-y-4">
        {apiKeys && Array.isArray(apiKeys) && apiKeys.length > 0 ? (
          apiKeys.map((apiKey: any) => (
            <div
              key={apiKey.keyId}
              className={`glass rounded-xl p-6 border shadow-lg backdrop-blur-xl ${isExpired(apiKey.expiresAt)
                ? "border-danger-200/30 bg-gradient-danger/10"
                : "border-primary-200/30"
                }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex gap-3 items-center mb-4">
                    <h3 className="font-semibold font-display text-light-text-primary dark:text-dark-text-primary">
                      {apiKey.name}
                    </h3>
                    {isExpired(apiKey.expiresAt) && (
                      <span className="px-3 py-1 font-semibold rounded-full border glass font-display border-danger-200/30 bg-gradient-danger/20 text-danger-700 dark:text-danger-300">
                        Expired
                      </span>
                    )}
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block mb-2 font-medium font-display gradient-text">
                        Masked Key ID (for reference only):
                      </label>
                      <code className="px-3 py-2 font-mono rounded-lg border glass border-primary-200/30">
                        {apiKey.maskedKey}
                      </code>
                    </div>
                    <div className="p-4 rounded-lg border glass border-warning-200/30 bg-gradient-warning/10">
                      <p className="flex gap-2 items-center mb-2 font-semibold font-display gradient-text-warning">
                        <Lock className="w-5 h-5" />
                        Security Notice
                      </p>
                      <p className="font-body text-light-text-secondary dark:text-dark-text-secondary">
                        Full API key was only shown once during creation. If
                        you need the full key again, you'll need to delete
                        this key and create a new one.
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-4 items-center text-sm font-body text-light-text-secondary dark:text-dark-text-secondary">
                      <span className="px-2 py-1 rounded-full border glass border-secondary-200/30">
                        Permissions: {apiKey.permissions.join(", ")}
                      </span>
                      <span className="px-2 py-1 rounded-full border glass border-accent-200/30">
                        Created: {formatDate(apiKey.createdAt)}
                      </span>
                      {apiKey.expiresAt && (
                        <span className="px-2 py-1 rounded-full border glass border-warning-200/30">
                          Expires: {formatDate(apiKey.expiresAt)}
                        </span>
                      )}
                      {apiKey.lastUsed && (
                        <span className="px-2 py-1 rounded-full border glass border-info-200/30">
                          Last used: {formatDate(apiKey.lastUsed)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => deleteKeyMutation.mutate(apiKey.keyId)}
                  className="btn btn-icon-danger"
                  disabled={deleteKeyMutation.isLoading}
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="p-8 text-center rounded-xl border shadow-lg backdrop-blur-xl glass border-primary-200/30">
            <div className="flex justify-center items-center mx-auto mb-4 w-16 h-16 rounded-xl bg-gradient-secondary/20">
              <Settings className="w-8 h-8 text-secondary-500" />
            </div>
            <p className="mb-2 font-semibold font-display text-light-text-primary dark:text-dark-text-primary">No API keys configured</p>
            <p className="font-body text-light-text-secondary dark:text-dark-text-secondary">
              Create an API key to access your dashboard data
            </p>
          </div>
        )}
      </div>

      {/* Add New Key Form */}
      {showAddForm ? (
        <form onSubmit={handleCreateKey} className="p-6 rounded-xl border shadow-lg backdrop-blur-xl glass border-primary-200/30">
          <h3 className="mb-6 text-lg font-bold font-display gradient-text">
            Create New API Key
          </h3>
          <div className="space-y-6">
            <div>
              <label className="block mb-2 font-medium font-display gradient-text">
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
              <label className="block mb-3 font-medium font-display gradient-text">
                Permissions
              </label>
              <div className="space-y-3">
                {PERMISSION_OPTIONS.map((permission) => (
                  <label key={permission.id} className="flex gap-3 items-start p-4 rounded-lg border transition-all duration-200 cursor-pointer glass border-primary-200/30 hover:bg-gradient-primary/5">
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
                      className="mt-1 w-4 h-4 rounded text-primary-600 border-primary-300 focus:ring-primary-500"
                    />
                    <div>
                      <span className="font-medium font-display text-light-text-primary dark:text-dark-text-primary">
                        {permission.name}
                      </span>
                      <p className="mt-1 text-sm font-body text-light-text-secondary dark:text-dark-text-secondary">
                        {permission.description}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block mb-2 font-medium font-display gradient-text">
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
              <p className="mt-2 text-sm font-body text-light-text-secondary dark:text-dark-text-secondary">
                Leave empty for no expiration
              </p>
            </div>

            <div className="flex gap-3 justify-end pt-4">
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setNewKey({ name: "", permissions: ["read"], expiresAt: "" });
                }}
                className="btn-secondary btn"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createKeyMutation.isLoading}
                className="btn-primary btn"
              >
                {createKeyMutation.isLoading ? "Creating..." : "Create API Key"}
              </button>
            </div>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setShowAddForm(true)}
          className="inline-flex gap-2 items-center btn-primary btn"
        >
          <Plus className="w-4 h-4" />
          Create API Key
        </button>
      )}

      <div className="p-6 rounded-xl border shadow-lg backdrop-blur-xl glass border-info-200/30 bg-gradient-info/10">
        <div className="flex gap-3 items-center mb-4">
          <div className="flex justify-center items-center w-8 h-8 rounded-lg bg-gradient-info glow-info">
            <BookOpen className="w-4 h-4 text-white" />
          </div>
          <h4 className="font-semibold font-display gradient-text">
            Usage Instructions
          </h4>
        </div>
        <div className="space-y-3 font-body text-light-text-primary dark:text-dark-text-primary">
          <p className="flex gap-2 items-start">
            <span className="text-info-500">•</span>
            Use these API keys in the Authorization header:{" "}
            <code className="px-2 py-1 font-mono rounded glass">Bearer your_api_key</code>
          </p>
          <p className="flex gap-2 items-start">
            <span className="text-info-500">•</span>
            Access project data: <code className="px-2 py-1 font-mono rounded glass">GET /api/projects</code>
          </p>
          <p className="flex gap-2 items-start">
            <span className="text-info-500">•</span>
            Track usage: <code className="px-2 py-1 font-mono rounded glass">POST /api/usage/track</code>
          </p>
          <p className="flex gap-2 items-start">
            <span className="text-info-500">•</span>
            View analytics: <code className="px-2 py-1 font-mono rounded glass">GET /api/analytics</code>
          </p>
        </div>
      </div>
    </div>
  );
};
