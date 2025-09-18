
import React, { useState, useEffect } from 'react';
import { FunnelIcon, XMarkIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { usageService } from '@/services/usage.service';
import { useProject } from '@/contexts/ProjectContext';

interface UsageFilterProps {
  onFilterChange: (filters: any) => void;
  services: string[];
  models: string[];
}

export const UsageFilter: React.FC<UsageFilterProps> = ({
  onFilterChange,
  services,
  models,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [availableProperties, setAvailableProperties] = useState<Array<{
    property: string;
    count: number;
    sampleValues: string[];
  }>>([]);
  const [filters, setFilters] = useState({
    service: '',
    model: '',
    dateRange: '7d',
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

    const transformedFilters = {
      ...filters,
      customProperties: Object.keys(customPropsObject).length > 0 ? customPropsObject : undefined
    };

    onFilterChange(transformedFilters);
    setIsOpen(false);
  };

  const resetFilters = () => {
    const defaultFilters = {
      service: '',
      model: '',
      dateRange: '7d',
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
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="btn-secondary inline-flex items-center"
      >
        <FunnelIcon className="h-5 w-5 mr-2" />
        Filters
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-120 glass rounded-xl border border-primary-200/30 shadow-2xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-6 z-10">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-display font-bold gradient-text-primary">Filter Usage</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 rounded-xl glass border border-primary-200/30 text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text-primary dark:hover:text-dark-text-primary hover:border-primary-300/50 transition-all duration-300"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-light-text-primary dark:text-dark-text-primary mb-2">
                Service
              </label>
              <select
                value={filters.service}
                onChange={(e) => handleFilterChange('service', e.target.value)}
                className="select"
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
              <label className="block text-sm font-medium text-light-text-primary dark:text-dark-text-primary mb-2">
                Model
              </label>
              <select
                value={filters.model}
                onChange={(e) => handleFilterChange('model', e.target.value)}
                className="select"
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
              <label className="block text-sm font-medium text-light-text-primary dark:text-dark-text-primary mb-2">
                Date Range
              </label>
              <select
                value={filters.dateRange}
                onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                className="select"
              >
                <option value="1d">Last 24 hours</option>
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="custom">Custom Range</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-light-text-primary dark:text-dark-text-primary mb-2">
                  Min Cost ($)
                </label>
                <input
                  type="number"
                  value={filters.minCost}
                  onChange={(e) => handleFilterChange('minCost', e.target.value)}
                  className="input"
                  placeholder="0.00"
                  step="0.01"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-light-text-primary dark:text-dark-text-primary mb-2">
                  Max Cost ($)
                </label>
                <input
                  type="number"
                  value={filters.maxCost}
                  onChange={(e) => handleFilterChange('maxCost', e.target.value)}
                  className="input"
                  placeholder="100.00"
                  step="0.01"
                />
              </div>
            </div>

            {/* Email Filter Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-light-text-primary dark:text-dark-text-primary mb-2">
                  User Email
                </label>
                <input
                  type="email"
                  value={filters.userEmail}
                  onChange={(e) => handleFilterChange('userEmail', e.target.value)}
                  className="input"
                  placeholder="developer@company.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-light-text-primary dark:text-dark-text-primary mb-2">
                  Customer Email
                </label>
                <input
                  type="email"
                  value={filters.customerEmail}
                  onChange={(e) => handleFilterChange('customerEmail', e.target.value)}
                  className="input"
                  placeholder="client@client.com"
                />
              </div>
            </div>

            {/* Custom Properties Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="block text-sm font-medium text-light-text-primary dark:text-dark-text-primary">
                  Custom Properties
                </label>
                <button
                  type="button"
                  onClick={addCustomProperty}
                  className="inline-flex items-center px-3 py-2 text-xs font-medium glass rounded-xl border border-primary-200/30 text-primary-600 dark:text-primary-400 hover:border-primary-300/50 hover:shadow-md transition-all duration-300"
                >
                  <PlusIcon className="w-3 h-3 mr-1" />
                  Add
                </button>
              </div>

              {filters.customProperties.length === 0 && (
                <p className="text-xs text-light-text-tertiary dark:text-dark-text-tertiary mb-4 p-3 glass rounded-xl border border-primary-200/30">
                  Filter by custom properties like feature, environment, user plan, etc.
                </p>
              )}

              <div className="space-y-3">
                {filters.customProperties.map((prop, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 glass rounded-xl border border-primary-200/30">
                    <select
                      value={prop.key}
                      onChange={(e) => updateCustomProperty(index, 'key', e.target.value)}
                      className="select flex-1"
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
                        className="select flex-1"
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
                      className="p-2 rounded-xl glass border border-primary-200/30 text-red-500 hover:text-red-600 hover:border-red-300/50 hover:shadow-md transition-all duration-300"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-6 border-t border-primary-200/30">
              <button
                onClick={resetFilters}
                className="btn-secondary"
              >
                Reset
              </button>
              <button
                onClick={applyFilters}
                className="btn-primary"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};