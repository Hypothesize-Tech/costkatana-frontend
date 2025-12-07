
import React, { useState, useEffect } from 'react';
import { XMarkIcon, PlusIcon, TrashIcon, FunnelIcon } from '@heroicons/react/24/outline';
import { usageService } from '@/services/usage.service';
import { useProject } from '@/contexts/ProjectContext';

interface UsageFilterProps {
  onFilterChange: (filters: any) => void;
  services: string[];
  models: string[];
  isOpen?: boolean;
  onClose?: () => void;
}

export const UsageFilter: React.FC<UsageFilterProps> = ({
  onFilterChange,
  services,
  models,
  isOpen: externalIsOpen,
  onClose,
}) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const setIsOpen = onClose ? () => onClose() : setInternalIsOpen;
  const [availableProperties, setAvailableProperties] = useState<Array<{
    property: string;
    count: number;
    sampleValues: string[];
  }>>([]);
  const [filters, setFilters] = useState({
    service: '',
    model: '',
    dateRange: '30d',
    startDate: '',
    endDate: '',
    minCost: '',
    maxCost: '',
    userEmail: '',
    customerEmail: '',
    customProperties: [] as Array<{ key: string; value: string; }>
  });
  const { selectedProject } = useProject();

  useEffect(() => {
    const loadAvailableProperties = async () => {
      try {
        const properties = await usageService.getAvailableProperties({
          projectId: selectedProject !== 'all' ? selectedProject : undefined
        });
        setAvailableProperties(properties);
      } catch (error) {
        console.error('Error loading available properties:', error);
      }
    };

    if (isOpen) {
      loadAvailableProperties();
    }
  }, [isOpen, selectedProject]);

  // Helper function to convert ISO date to YYYY-MM-DD format for date input
  const isoToDateInput = (dateString?: string): string => {
    if (!dateString) return '';
    try {
      // If already in YYYY-MM-DD format, return as is
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        return dateString;
      }
      // Otherwise, treat as ISO string and convert
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      return date.toISOString().split('T')[0];
    } catch {
      return '';
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
  };

  const addCustomProperty = () => {
    setFilters({
      ...filters,
      customProperties: [...filters.customProperties, { key: '', value: '' }]
    });
  };

  const updateCustomProperty = (index: number, field: 'key' | 'value', value: string) => {
    const newProperties = [...filters.customProperties];
    newProperties[index][field] = value;
    setFilters({
      ...filters,
      customProperties: newProperties
    });
  };

  const removeCustomProperty = (index: number) => {
    const newProperties = filters.customProperties.filter((_, i) => i !== index);
    setFilters({
      ...filters,
      customProperties: newProperties
    });
  };

  const applyFilters = () => {
    // Transform custom properties to the format expected by the backend
    const customPropsObject: Record<string, string> = {};
    filters.customProperties.forEach(prop => {
      if (prop.key && prop.value) {
        customPropsObject[prop.key] = prop.value;
      }
    });

    // Convert date strings to ISO format for custom date range
    let startDate: string | undefined = undefined;
    let endDate: string | undefined = undefined;

    if (filters.dateRange === 'custom') {
      if (filters.startDate) {
        // Convert YYYY-MM-DD to ISO string with start of day
        // Handle both YYYY-MM-DD format and ISO format
        const dateStr = filters.startDate.includes('T') ? filters.startDate : filters.startDate + 'T00:00:00';
        const start = new Date(dateStr);
        if (!isNaN(start.getTime())) {
          start.setHours(0, 0, 0, 0);
          startDate = start.toISOString();
        }
      }
      if (filters.endDate) {
        // Convert YYYY-MM-DD to ISO string with end of day
        // Handle both YYYY-MM-DD format and ISO format
        const dateStr = filters.endDate.includes('T') ? filters.endDate : filters.endDate + 'T23:59:59';
        const end = new Date(dateStr);
        if (!isNaN(end.getTime())) {
          end.setHours(23, 59, 59, 999);
          endDate = end.toISOString();
        }
      }
    }

    const transformedFilters = {
      ...filters,
      startDate,
      endDate,
      customProperties: Object.keys(customPropsObject).length > 0 ? customPropsObject : undefined
    };

    onFilterChange(transformedFilters);
    setIsOpen(false);
  };

  const resetFilters = () => {
    const defaultFilters = {
      service: '',
      model: '',
      dateRange: '30d',
      startDate: '',
      endDate: '',
      minCost: '',
      maxCost: '',
      userEmail: '',
      customerEmail: '',
      customProperties: []
    };
    setFilters(defaultFilters);
    onFilterChange(defaultFilters);
    setIsOpen(false);
  };

  return (
    <>
      {isOpen && (
        <div className="overflow-y-auto fixed inset-0 z-[100]">
          <div className="flex justify-center items-center p-4 min-h-screen">
            <div
              className="fixed inset-0 backdrop-blur-sm bg-black/50 z-[100]"
              onClick={() => setIsOpen(false)}
            />
            <div className="relative z-[101] p-4 sm:p-6 w-full max-w-2xl rounded-2xl border border-primary-200/30 dark:border-primary-500/20 shadow-2xl backdrop-blur-xl glass bg-gradient-light-panel dark:bg-gradient-dark-panel">
              <div className="flex justify-between items-center mb-4 sm:mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-[#06ec9e] via-emerald-500 to-[#009454] shadow-lg shadow-[#06ec9e]/30 dark:shadow-[#06ec9e]/40">
                    <FunnelIcon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold font-display gradient-text-primary">Filter Usage</h3>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-lg text-secondary-600 dark:text-secondary-300 hover:text-danger-600 dark:hover:text-danger-400 transition-colors duration-300 [touch-action:manipulation] active:scale-95"
                >
                  <XMarkIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </div>

              <div className="space-y-4 sm:space-y-6">
                <div>
                  <label className="block mb-1.5 sm:mb-2 text-xs sm:text-sm font-medium font-display text-secondary-900 dark:text-white">
                    Service
                  </label>
                  <select
                    value={filters.service}
                    onChange={(e) => handleFilterChange('service', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/50 dark:bg-dark-card/50 border border-primary-200/30 dark:border-primary-700/30 text-secondary-900 dark:text-white placeholder-secondary-500 dark:placeholder-secondary-400 focus:ring-2 focus:ring-[#06ec9e] focus:border-transparent transition-all duration-300 min-h-[44px] [touch-action:manipulation]"
                  >
                    <option value="">All Services</option>
                    {services.map((service) => (
                      <option key={service} value={service}>
                        {service}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block mb-1.5 sm:mb-2 text-xs sm:text-sm font-medium font-display text-secondary-900 dark:text-white">
                    Model
                  </label>
                  <select
                    value={filters.model}
                    onChange={(e) => handleFilterChange('model', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/50 dark:bg-dark-card/50 border border-primary-200/30 dark:border-primary-700/30 text-secondary-900 dark:text-white placeholder-secondary-500 dark:placeholder-secondary-400 focus:ring-2 focus:ring-[#06ec9e] focus:border-transparent transition-all duration-300 min-h-[44px] [touch-action:manipulation]"
                  >
                    <option value="">All Models</option>
                    {models.map((model) => (
                      <option key={model} value={model}>
                        {model}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block mb-1.5 sm:mb-2 text-xs sm:text-sm font-medium font-display text-secondary-900 dark:text-white">
                    Date Range
                  </label>
                  <select
                    value={filters.dateRange}
                    onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/50 dark:bg-dark-card/50 border border-primary-200/30 dark:border-primary-700/30 text-secondary-900 dark:text-white placeholder-secondary-500 dark:placeholder-secondary-400 focus:ring-2 focus:ring-[#06ec9e] focus:border-transparent transition-all duration-300 min-h-[44px] [touch-action:manipulation]"
                  >
                    <option value="7d">Last 7 days</option>
                    <option value="30d">Last 30 days</option>
                    <option value="90d">Last 90 days</option>
                    <option value="custom">Custom Range</option>
                  </select>
                </div>

                {/* Custom Date Range Picker */}
                {filters.dateRange === 'custom' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label className="block mb-1.5 sm:mb-2 text-xs sm:text-sm font-medium font-display text-secondary-900 dark:text-white">
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={filters.startDate ? isoToDateInput(filters.startDate) : filters.startDate}
                        onChange={(e) => handleFilterChange('startDate', e.target.value)}
                        max={filters.endDate ? isoToDateInput(filters.endDate) : new Date().toISOString().split('T')[0]}
                        className="w-full px-4 py-2.5 rounded-xl bg-white/50 dark:bg-dark-card/50 border border-primary-200/30 dark:border-primary-700/30 text-secondary-900 dark:text-white placeholder-secondary-500 dark:placeholder-secondary-400 focus:ring-2 focus:ring-[#06ec9e] focus:border-transparent transition-all duration-300 min-h-[44px] [touch-action:manipulation]"
                      />
                    </div>
                    <div>
                      <label className="block mb-1.5 sm:mb-2 text-xs sm:text-sm font-medium font-display text-secondary-900 dark:text-white">
                        End Date
                      </label>
                      <input
                        type="date"
                        value={filters.endDate ? isoToDateInput(filters.endDate) : filters.endDate}
                        onChange={(e) => handleFilterChange('endDate', e.target.value)}
                        min={filters.startDate ? isoToDateInput(filters.startDate) : undefined}
                        max={new Date().toISOString().split('T')[0]}
                        className="w-full px-4 py-2.5 rounded-xl bg-white/50 dark:bg-dark-card/50 border border-primary-200/30 dark:border-primary-700/30 text-secondary-900 dark:text-white placeholder-secondary-500 dark:placeholder-secondary-400 focus:ring-2 focus:ring-[#06ec9e] focus:border-transparent transition-all duration-300 min-h-[44px] [touch-action:manipulation]"
                      />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block mb-1.5 sm:mb-2 text-xs sm:text-sm font-medium font-display text-secondary-900 dark:text-white">
                      Min Cost ($)
                    </label>
                    <input
                      type="number"
                      value={filters.minCost}
                      onChange={(e) => handleFilterChange('minCost', e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/50 dark:bg-dark-card/50 border border-primary-200/30 dark:border-primary-700/30 text-secondary-900 dark:text-white placeholder-secondary-500 dark:placeholder-secondary-400 focus:ring-2 focus:ring-[#06ec9e] focus:border-transparent transition-all duration-300 min-h-[44px] [touch-action:manipulation]"
                      placeholder="0.00"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <label className="block mb-1.5 sm:mb-2 text-xs sm:text-sm font-medium font-display text-secondary-900 dark:text-white">
                      Max Cost ($)
                    </label>
                    <input
                      type="number"
                      value={filters.maxCost}
                      onChange={(e) => handleFilterChange('maxCost', e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/50 dark:bg-dark-card/50 border border-primary-200/30 dark:border-primary-700/30 text-secondary-900 dark:text-white placeholder-secondary-500 dark:placeholder-secondary-400 focus:ring-2 focus:ring-[#06ec9e] focus:border-transparent transition-all duration-300 min-h-[44px] [touch-action:manipulation]"
                      placeholder="100.00"
                      step="0.01"
                    />
                  </div>
                </div>

                {/* Email Filter Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block mb-1.5 sm:mb-2 text-xs sm:text-sm font-medium font-display text-secondary-900 dark:text-white">
                      User Email
                    </label>
                    <input
                      type="email"
                      value={filters.userEmail}
                      onChange={(e) => handleFilterChange('userEmail', e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/50 dark:bg-dark-card/50 border border-primary-200/30 dark:border-primary-700/30 text-secondary-900 dark:text-white placeholder-secondary-500 dark:placeholder-secondary-400 focus:ring-2 focus:ring-[#06ec9e] focus:border-transparent transition-all duration-300 min-h-[44px] [touch-action:manipulation]"
                      placeholder="developer@company.com"
                    />
                  </div>
                  <div>
                    <label className="block mb-1.5 sm:mb-2 text-xs sm:text-sm font-medium font-display text-secondary-900 dark:text-white">
                      Customer Email
                    </label>
                    <input
                      type="email"
                      value={filters.customerEmail}
                      onChange={(e) => handleFilterChange('customerEmail', e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/50 dark:bg-dark-card/50 border border-primary-200/30 dark:border-primary-700/30 text-secondary-900 dark:text-white placeholder-secondary-500 dark:placeholder-secondary-400 focus:ring-2 focus:ring-[#06ec9e] focus:border-transparent transition-all duration-300 min-h-[44px] [touch-action:manipulation]"
                      placeholder="client@client.com"
                    />
                  </div>
                </div>

                {/* Custom Properties Section */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <label className="block text-sm font-medium font-display text-secondary-900 dark:text-white">
                      Custom Properties
                    </label>
                    <button
                      type="button"
                      onClick={addCustomProperty}
                      className="inline-flex items-center px-3 py-2 text-xs font-medium rounded-xl border transition-all duration-300 btn glass border-primary-200/30 text-primary-600 dark:text-primary-400 hover:border-primary-300/50 hover:shadow-md"
                    >
                      <PlusIcon className="mr-1 w-3 h-3" />
                      Add
                    </button>
                  </div>

                  {filters.customProperties.length === 0 && (
                    <p className="p-3 mb-4 text-xs rounded-xl border text-secondary-500 dark:text-secondary-400 glass border-primary-200/30">
                      Filter by custom properties like feature, environment, user plan, etc.
                    </p>
                  )}

                  <div className="space-y-3">
                    {filters.customProperties.map((prop, index) => (
                      <div key={index} className="flex items-center p-3 space-x-3 rounded-xl border glass border-primary-200/30">
                        <select
                          value={prop.key}
                          onChange={(e) => updateCustomProperty(index, 'key', e.target.value)}
                          className="flex-1 select"
                        >
                          <option value="">Select property...</option>
                          {availableProperties.map((property) => (
                            <option key={property.property} value={property.property}>
                              {property.property} ({property.count})
                            </option>
                          ))}
                        </select>

                        {prop.key && (
                          <select
                            value={prop.value}
                            onChange={(e) => updateCustomProperty(index, 'value', e.target.value)}
                            className="flex-1 select"
                          >
                            <option value="">Select value...</option>
                            {availableProperties
                              .find(p => p.property === prop.key)
                              ?.sampleValues
                              // Remove duplicates by converting to string and using Set
                              .filter((value, index, array) => {
                                const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
                                return array.findIndex(v => {
                                  const vString = typeof v === 'object' ? JSON.stringify(v) : String(v);
                                  return vString === stringValue;
                                }) === index;
                              })
                              .map((value) => {
                                const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
                                const displayValue = typeof value === 'object' ?
                                  (Array.isArray(value) ? (value as any[]).slice(0, 3).join(', ') + ((value as any[]).length > 3 ? '...' : '') :
                                    Object.keys(value as object).slice(0, 3).join(', ') + (Object.keys(value as object).length > 3 ? '...' : ''))
                                  : String(value);
                                return (
                                  <option key={stringValue} value={stringValue}>
                                    {displayValue}
                                  </option>
                                );
                              })
                            }
                          </select>
                        )}

                        <button
                          type="button"
                          onClick={() => removeCustomProperty(index)}
                          className="p-2 rounded-xl border transition-all duration-300 btn glass border-primary-200/30 text-danger-500 dark:text-danger-400 hover:text-danger-600 dark:hover:text-danger-300 hover:border-danger-300/50 hover:shadow-md"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 sm:pt-6 border-t border-primary-200/30 dark:border-primary-700/30">
                  <button
                    onClick={resetFilters}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 text-sm font-medium rounded-xl border border-primary-200/30 dark:border-primary-700/30 bg-white/50 dark:bg-dark-card/50 text-secondary-700 dark:text-secondary-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:border-primary-400/50 transition-all duration-300 min-h-[44px] [touch-action:manipulation] active:scale-95"
                  >
                    Reset
                  </button>
                  <button
                    onClick={applyFilters}
                    className="w-full sm:w-auto group relative flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl font-display font-semibold text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl overflow-hidden bg-gradient-to-r from-[#06ec9e] via-emerald-500 to-[#009454] shadow-[#06ec9e]/30 dark:shadow-[#06ec9e]/40 hover:from-emerald-500 hover:to-emerald-600 dark:hover:from-emerald-600 dark:hover:to-emerald-700 min-h-[44px] [touch-action:manipulation]"
                  >
                    Apply
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};