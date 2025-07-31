
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
        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        <FunnelIcon className="h-5 w-5 mr-2" />
        Filters
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-120 bg-white rounded-lg shadow-lg p-6 z-10">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Filter Usage</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Service
              </label>
              <select
                value={filters.service}
                onChange={(e) => handleFilterChange('service', e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
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
              <label className="block text-sm font-medium text-gray-700">
                Model
              </label>
              <select
                value={filters.model}
                onChange={(e) => handleFilterChange('model', e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
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
              <label className="block text-sm font-medium text-gray-700">
                Date Range
              </label>
              <select
                value={filters.dateRange}
                onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
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
                <label className="block text-sm font-medium text-gray-700">
                  Min Cost ($)
                </label>
                <input
                  type="number"
                  value={filters.minCost}
                  onChange={(e) => handleFilterChange('minCost', e.target.value)}
                  className="mt-1 block w-full pl-3 pr-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  placeholder="0.00"
                  step="0.01"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Max Cost ($)
                </label>
                <input
                  type="number"
                  value={filters.maxCost}
                  onChange={(e) => handleFilterChange('maxCost', e.target.value)}
                  className="mt-1 block w-full pl-3 pr-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  placeholder="100.00"
                  step="0.01"
                />
              </div>
            </div>

            {/* Custom Properties Section */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Custom Properties
                </label>
                <button
                  type="button"
                  onClick={addCustomProperty}
                  className="inline-flex items-center px-2 py-1 text-xs font-medium text-indigo-600 bg-indigo-100 rounded hover:bg-indigo-200"
                >
                  <PlusIcon className="w-3 h-3 mr-1" />
                  Add
                </button>
              </div>

              {filters.customProperties.length === 0 && (
                <p className="text-xs text-gray-500 mb-2">
                  Filter by custom properties like feature, environment, user plan, etc.
                </p>
              )}

              <div className="space-y-2">
                {filters.customProperties.map((prop, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <select
                      value={prop.key}
                      onChange={(e) => updateCustomProperty(index, 'key', e.target.value)}
                      className="flex-1 text-sm border-gray-300 rounded focus:ring-indigo-500 focus:border-indigo-500"
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
                        className="flex-1 text-sm border-gray-300 rounded focus:ring-indigo-500 focus:border-indigo-500"
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
                      className="p-1 text-red-600 hover:text-red-800"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <button
                onClick={resetFilters}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Reset
              </button>
              <button
                onClick={applyFilters}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
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