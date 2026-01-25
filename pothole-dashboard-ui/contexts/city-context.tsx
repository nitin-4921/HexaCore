'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { City, api } from '@/lib/api';
import { dataService } from '@/lib/data-service';

/**
 * CITY CONTEXT - SINGLE SOURCE OF TRUTH
 * 
 * CRITICAL: City statistics are now computed using dataService
 * to ensure consistency with dashboard cards and detail pages.
 */
interface CityContextType {
  selectedCity: City | null;
  cities: City[];
  setSelectedCity: (city: City) => void;
  loading: boolean;
  error: string | null;
}

const CityContext = createContext<CityContextType | undefined>(undefined);

interface CityProviderProps {
  children: ReactNode;
}

export function CityProvider({ children }: CityProviderProps) {
  const [selectedCity, setSelectedCityState] = useState<City | null>(null);
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load cities on mount
  useEffect(() => {
    const loadCities = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Try to fetch from API first, fallback to mock data
        try {
          const citiesData = await api.getCities();
          setCities(citiesData);
          
          // Set default city to Noida
          const defaultCity = citiesData.find(city => city.name === 'Noida') || citiesData[0];
          if (defaultCity) {
            setSelectedCityState(defaultCity);
          }
        } catch (apiError) {
          console.warn('API not available, using fallback data:', apiError);
          
          // ✅ SINGLE SOURCE OF TRUTH: Use dataService for city statistics
          const fallbackCities: City[] = [
            {
              id: 'city-002',
              name: 'Noida',
              coordinates: { lat: 28.5355, lng: 77.3910 },
              population: 642381,
              area: 203,
              totalRoads: 89,
              activeRovers: 8,
              stats: dataService.getDashboardStats('Noida')
            },
            {
              id: 'city-001',
              name: 'Delhi',
              coordinates: { lat: 28.6139, lng: 77.2090 },
              population: 32900000,
              area: 1484,
              totalRoads: 156,
              activeRovers: 12,
              stats: dataService.getDashboardStats('Delhi')
            },
            {
              id: 'city-003',
              name: 'Mumbai',
              coordinates: { lat: 19.0760, lng: 72.8777 },
              population: 20400000,
              area: 603,
              totalRoads: 234,
              activeRovers: 15,
              stats: dataService.getDashboardStats('Mumbai')
            },
            {
              id: 'city-004',
              name: 'Pune',
              coordinates: { lat: 18.5204, lng: 73.8567 },
              population: 7400000,
              area: 331,
              totalRoads: 127,
              activeRovers: 10,
              stats: dataService.getDashboardStats('Pune')
            },
            {
              id: 'city-005',
              name: 'Kanpur',
              coordinates: { lat: 26.4499, lng: 80.3319 },
              population: 3200000,
              area: 403,
              totalRoads: 78,
              activeRovers: 6,
              stats: dataService.getDashboardStats('Kanpur')
            }
          ];
          
          setCities(fallbackCities);
          setSelectedCityState(fallbackCities[0]); // Default to Noida
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load cities');
      } finally {
        setLoading(false);
      }
    };

    loadCities();
  }, []);

  const setSelectedCity = (city: City) => {
    setSelectedCityState(city);
    // Store in localStorage for persistence
    localStorage.setItem('selectedCity', JSON.stringify(city));
  };

  // Load selected city from localStorage on mount
  useEffect(() => {
    if (cities.length > 0) {
      const savedCity = localStorage.getItem('selectedCity');
      if (savedCity) {
        try {
          const parsedCity = JSON.parse(savedCity);
          const cityExists = cities.find(c => c.id === parsedCity.id);
          if (cityExists) {
            setSelectedCityState(cityExists);
          }
        } catch (err) {
          console.warn('Failed to parse saved city:', err);
        }
      }
    }
  }, [cities]);

  const value: CityContextType = {
    selectedCity,
    cities,
    setSelectedCity,
    loading,
    error
  };

  return (
    <CityContext.Provider value={value}>
      {children}
    </CityContext.Provider>
  );
}

export function useCity() {
  const context = useContext(CityContext);
  if (context === undefined) {
    throw new Error('useCity must be used within a CityProvider');
  }
  return context;
}