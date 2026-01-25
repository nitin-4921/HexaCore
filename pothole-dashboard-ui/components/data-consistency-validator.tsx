/**
 * DATA CONSISTENCY VALIDATOR
 * 
 * This component validates data consistency between dashboard cards
 * and detail pages in development mode. It helps catch inconsistencies
 * early and ensures the single source of truth is working correctly.
 * 
 * Only renders in development mode.
 */

'use client';

import { useEffect, useState } from 'react';
import { useCity } from '@/contexts/city-context';
import { dataService } from '@/lib/data-service';
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

interface ValidationResult {
  metric: string;
  dashboardValue: number;
  actualValue: number;
  isConsistent: boolean;
  description: string;
}

export function DataConsistencyValidator() {
  const { selectedCity } = useCity();
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!selectedCity || process.env.NODE_ENV !== 'development') return;

    const validateConsistency = () => {
      const dashboardStats = dataService.getDashboardStats(selectedCity.name);
      
      // Validate each metric
      const results: ValidationResult[] = [
        {
          metric: 'Total Potholes',
          dashboardValue: dashboardStats.totalPotholes,
          actualValue: dataService.getPotholes({ city: selectedCity.name }).length,
          isConsistent: false,
          description: 'All potholes in selected city'
        },
        {
          metric: 'High-Risk Potholes',
          dashboardValue: dashboardStats.highRiskPotholes,
          actualValue: dataService.getPotholes({ city: selectedCity.name, severity: 'high' }).length,
          isConsistent: false,
          description: 'Potholes with severity = high'
        },
        {
          metric: 'Roads Needing Repair',
          dashboardValue: dashboardStats.roadsNeedingRepair,
          actualValue: dataService.getRoads({ city: selectedCity.name, healthScore: '<50' }).length,
          isConsistent: false,
          description: 'Roads with health score < 50%'
        }
      ];

      // Check consistency
      results.forEach(result => {
        result.isConsistent = result.dashboardValue === result.actualValue;
      });

      setValidationResults(results);
    };

    validateConsistency();
  }, [selectedCity]);

  // Only show in development
  if (process.env.NODE_ENV !== 'development') return null;

  const hasInconsistencies = validationResults.some(r => !r.isConsistent);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setIsVisible(!isVisible)}
        className={`p-3 rounded-full shadow-lg transition-colors ${
          hasInconsistencies 
            ? 'bg-red-500 hover:bg-red-600 text-white' 
            : 'bg-green-500 hover:bg-green-600 text-white'
        }`}
        title="Data Consistency Validator (Dev Only)"
      >
        {hasInconsistencies ? (
          <XCircle className="w-5 h-5" />
        ) : (
          <CheckCircle className="w-5 h-5" />
        )}
      </button>

      {isVisible && (
        <div className="absolute bottom-16 right-0 w-96 bg-card border border-border rounded-lg shadow-xl p-4">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-yellow-400" />
            <h3 className="font-semibold">Data Consistency Check</h3>
            <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded">
              DEV ONLY
            </span>
          </div>

          <div className="space-y-3">
            {validationResults.map((result, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 bg-secondary/30 rounded">
                <div>
                  <p className="text-sm font-medium">{result.metric}</p>
                  <p className="text-xs text-muted-foreground">{result.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm">
                    {result.dashboardValue} → {result.actualValue}
                  </span>
                  {result.isConsistent ? (
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-400" />
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-3 border-t border-border/30">
            <p className="text-xs text-muted-foreground">
              {hasInconsistencies 
                ? '❌ Data inconsistencies detected! Check console for details.'
                : '✅ All data is consistent across dashboard and detail pages.'
              }
            </p>
          </div>
        </div>
      )}
    </div>
  );
}