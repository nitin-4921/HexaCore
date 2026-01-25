'use client';

import { useState } from 'react';
import { Check, ChevronDown, MapPin } from 'lucide-react';
import { useCity } from '@/contexts/city-context';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function CitySelector() {
  const { selectedCity, cities, setSelectedCity, loading } = useCity();
  const [open, setOpen] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-secondary/50 rounded-lg">
        <MapPin className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Loading cities...</span>
      </div>
    );
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="flex items-center gap-2 min-w-[140px] justify-between bg-background/50 backdrop-blur-sm border-border/50 hover:bg-background/80"
        >
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary" />
            <span className="font-medium">
              {selectedCity?.name || 'Select City'}
            </span>
          </div>
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-56">
        {cities.map((city) => (
          <DropdownMenuItem
            key={city.id}
            onClick={() => {
              setSelectedCity(city);
              setOpen(false);
            }}
            className="flex items-center justify-between cursor-pointer"
          >
            <div className="flex flex-col">
              <span className="font-medium">{city.name}</span>
              <span className="text-xs text-muted-foreground">
                {city.stats.totalPotholes} potholes • {city.activeRovers} rovers
              </span>
            </div>
            {selectedCity?.id === city.id && (
              <Check className="w-4 h-4 text-primary" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}