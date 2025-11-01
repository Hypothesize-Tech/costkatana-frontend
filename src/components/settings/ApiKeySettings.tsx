// src/components/settings/ApiKeySettings.tsx
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PlusIcon, TrashIcon, CogIcon } from "@heroicons/react/24/outline";
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
      <div className="glass rounded-xl p-6 border border-primary-200/30 shadow-lg backdrop-blur-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center glow-primary">
            <span className="text-white text-lg">🔑</span>
          </div>
          <div>
            <h2 className="text-xl font-display font-bold gradient-text">
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
        <div className="glass rounded-xl p-6 border border-success-200/30 shadow-lg backdrop-blur-xl bg-gradient-success/10">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-display font-semibold gradient-text-success flex items-center gap-2">
              <span className="text-xl">🎉</span>
              API Key Created Successfully
            </h3>
            <button
              onClick={() => setShowCreatedKey(null)}
              className="btn-icon-secondary"
            >
              ×
            </button>
          </div>
          <div className="glass rounded-lg p-4 mb-4 border border-warning-200/30 bg-gradient-warning/10">
            <p className="font-display font-semibold gradient-text-warning flex items-center gap-2">
              <span>⚠️</span>
              IMPORTANT: Copy this API key now!
            </p>
            <p className="mt-2 font-body text-light-text-secondary dark:text-dark-text-secondary">
              This is the only time you'll see the full key. After closing this
              dialog, only a masked version will be shown for security.
            </p>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block mb-2 font-display font-medium gradient-text-success">
                Full API Key (copy this):
              </label>
              <div className="flex items-center gap-3">
                <code className="flex-1 p-4 font-mono text-sm break-all glass rounded-lg border border-primary-200/30">
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
                  className="btn-primary whitespace-nowrap"
                >
                  Copy Full Key
                </button>
              </div>
            </div>
            <div className="glass rounded-lg p-4 border border-info-200/30 bg-gradient-info/10">
              <p className="font-display font-semibold gradient-text mb-2">
                Usage Instructions:
              </p>
              <p className="font-body text-light-text-secondary dark:text-dark-text-secondary mb-2">
                Set this as your <code className="glass px-2 py-1 rounded font-mono">API_KEY</code> environment variable:
              </p>
              <code className="glass px-3 py-2 rounded-lg font-mono text-sm block">
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
                  <div className="flex items-center gap-3 mb-4">
                    <h3 className="font-display font-semibold text-light-text-primary dark:text-dark-text-primary">
                      {apiKey.name}
                    </h3>
                    {isExpired(apiKey.expiresAt) && (
                      <span className="glass px-3 py-1 rounded-full font-display font-semibold border border-danger-200/30 bg-gradient-danger/20 text-danger-700 dark:text-danger-300">
                        Expired
                      </span>
                    )}
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block mb-2 font-display font-medium gradient-text">
                        Masked Key ID (for reference only):
                      </label>
                      <code className="glass px-3 py-2 font-mono rounded-lg border border-primary-200/30">
                        {apiKey.maskedKey}
                      </code>
                    </div>
                    <div className="glass rounded-lg p-4 border border-warning-200/30 bg-gradient-warning/10">
                      <p className="font-display font-semibold gradient-text-warning flex items-center gap-2 mb-2">
                        <span>🔒</span>
                        Security Notice
                      </p>
                      <p className="font-body text-light-text-secondary dark:text-dark-text-secondary">
                        Full API key was only shown once during creation. If
                        you need the full key again, you'll need to delete
                        this key and create a new one.
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 font-body text-light-text-secondary dark:text-dark-text-secondary text-sm">
                      <span className="glass px-2 py-1 rounded-full border border-secondary-200/30">
                        Permissions: {apiKey.permissions.join(", ")}
                      </span>
                      <span className="glass px-2 py-1 rounded-full border border-accent-200/30">
                        Created: {formatDate(apiKey.createdAt)}
                      </span>
                      {apiKey.expiresAt && (
                        <span className="glass px-2 py-1 rounded-full border border-warning-200/30">
                          Expires: {formatDate(apiKey.expiresAt)}
                        </span>
                      )}
                      {apiKey.lastUsed && (
                        <span className="glass px-2 py-1 rounded-full border border-info-200/30">
                          Last used: {formatDate(apiKey.lastUsed)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => deleteKeyMutation.mutate(apiKey.keyId)}
                  className="btn-icon-danger"
                  disabled={deleteKeyMutation.isLoading}
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="glass rounded-xl p-8 border border-primary-200/30 shadow-lg backdrop-blur-xl text-center">
            <div className="w-16 h-16 rounded-xl bg-gradient-secondary/20 flex items-center justify-center mx-auto mb-4">
              <CogIcon className="w-8 h-8 text-secondary-500" />
            </div>
            <p className="font-display font-semibold text-light-text-primary dark:text-dark-text-primary mb-2">No API keys configured</p>
            <p className="font-body text-light-text-secondary dark:text-dark-text-secondary">
              Create an API key to access your dashboard data
            </p>
          </div>
        )}
      </div>

      {/* Add New Key Form */}
      {showAddForm ? (
        <form onSubmit={handleCreateKey} className="glass rounded-xl p-6 border border-primary-200/30 shadow-lg backdrop-blur-xl">
          <h3 className="mb-6 font-display font-bold gradient-text text-lg">
            Create New API Key
          </h3>
          <div className="space-y-6">
            <div>
              <label className="block font-display font-medium gradient-text mb-2">
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
              <label className="block font-display font-medium gradient-text mb-3">
                Permissions
              </label>
              <div className="space-y-3">
                {PERMISSION_OPTIONS.map((permission) => (
                  <label key={permission.id} className="flex items-start gap-3 glass rounded-lg p-4 border border-primary-200/30 cursor-pointer hover:bg-gradient-primary/5 transition-all duration-200">
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
                      className="mt-1 w-4 h-4 text-primary-600 rounded border-primary-300 focus:ring-primary-500"
                    />
                    <div>
                      <span className="font-display font-medium text-light-text-primary dark:text-dark-text-primary">
                        {permission.name}
                      </span>
                      <p className="font-body text-light-text-secondary dark:text-dark-text-secondary text-sm mt-1">
                        {permission.description}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block font-display font-medium gradient-text mb-2">
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
              <p className="mt-2 font-body text-light-text-secondary dark:text-dark-text-secondary text-sm">
                Leave empty for no expiration
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-4">
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
          className="btn-primary inline-flex items-center gap-2 btn"
        >
          <PlusIcon className="w-4 h-4" />
          Create API Key
        </button>
      )}

      <div className="glass rounded-xl p-6 border border-info-200/30 shadow-lg backdrop-blur-xl bg-gradient-info/10">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-lg bg-gradient-info flex items-center justify-center glow-info">
            <span className="text-white text-sm">📚</span>
          </div>
          <h4 className="font-display font-semibold gradient-text">
            Usage Instructions
          </h4>
        </div>
        <div className="space-y-3 font-body text-light-text-primary dark:text-dark-text-primary">
          <p className="flex items-start gap-2">
            <span className="text-info-500">•</span>
            Use these API keys in the Authorization header:{" "}
            <code className="glass px-2 py-1 rounded font-mono">Bearer your_api_key</code>
          </p>
          <p className="flex items-start gap-2">
            <span className="text-info-500">•</span>
            Access project data: <code className="glass px-2 py-1 rounded font-mono">GET /api/projects</code>
          </p>
          <p className="flex items-start gap-2">
            <span className="text-info-500">•</span>
            Track usage: <code className="glass px-2 py-1 rounded font-mono">POST /api/usage/track</code>
          </p>
          <p className="flex items-start gap-2">
            <span className="text-info-500">•</span>
            View analytics: <code className="glass px-2 py-1 rounded font-mono">GET /api/analytics</code>
          </p>
        </div>
      </div>
    </div>
  );
};
