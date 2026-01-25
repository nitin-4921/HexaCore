'use client';

import { useState } from 'react';
import { Sidebar } from '@/components/sidebar';
import { CitySelector } from '@/components/city-selector';
import { useCity } from '@/contexts/city-context';
import { Building2, Star, MapPin, Calendar, TrendingUp, Phone, Mail, Award, Download, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { pdfService } from '@/lib/pdf-service';

// Mock contractor data (will be replaced with API calls)
const mockContractors = [
  {
    id: 'contractor-001',
    name: 'Noida Infrastructure Corp',
    establishedYear: 2010,
    rating: 4.2,
    specialization: ['Highway Construction', 'Urban Roads', 'Bridge Construction'],
    contactInfo: {
      email: 'info@noidainfra.com',
      phone: '+91-120-4567890',
      address: 'Sector 62, Noida, UP'
    },
    certifications: ['ISO 9001:2015', 'CPWD Grade A', 'NHAI Approved'],
    stats: {
      totalRoadsBuilt: 45,
      averageRoadHealth: 72,
      totalLength: 234.5,
      roadsNeedingRepair: 8,
      totalPotholes: 156
    },
    recentProjects: [
      { name: 'Sector 62 Main Road', city: 'Noida', healthScore: 85, potholes: 2 },
      { name: 'Sector 59 Link Road', city: 'Noida', healthScore: 68, potholes: 4 },
      { name: 'Sector 76 Internal Road', city: 'Noida', healthScore: 82, potholes: 1 }
    ]
  },
  {
    id: 'contractor-002',
    name: 'UP Urban Roads Ltd',
    establishedYear: 2008,
    rating: 3.9,
    specialization: ['Urban Development', 'Road Maintenance', 'Traffic Management'],
    contactInfo: {
      email: 'contact@upurbanroads.com',
      phone: '+91-120-9876543',
      address: 'Lucknow, UP'
    },
    certifications: ['ISO 14001:2015', 'CPWD Grade B', 'UP PWD Approved'],
    stats: {
      totalRoadsBuilt: 67,
      averageRoadHealth: 68,
      totalLength: 312.8,
      roadsNeedingRepair: 15,
      totalPotholes: 203
    },
    recentProjects: [
      { name: 'Delhi-Noida Expressway', city: 'Delhi', healthScore: 75, potholes: 8 },
      { name: 'Ring Road Extension', city: 'Delhi', healthScore: 62, potholes: 12 }
    ]
  },
  {
    id: 'contractor-003',
    name: 'City Development Authority',
    establishedYear: 2015,
    rating: 4.6,
    specialization: ['Smart City Projects', 'Sustainable Infrastructure', 'IoT Integration'],
    contactInfo: {
      email: 'info@citydev.gov.in',
      phone: '+91-11-2345678',
      address: 'New Delhi'
    },
    certifications: ['ISO 45001:2018', 'Green Building Council', 'Smart City Mission Approved'],
    stats: {
      totalRoadsBuilt: 32,
      averageRoadHealth: 85,
      totalLength: 156.2,
      roadsNeedingRepair: 3,
      totalPotholes: 89
    },
    recentProjects: [
      { name: 'Smart City Boulevard', city: 'Mumbai', healthScore: 92, potholes: 0 },
      { name: 'Green Corridor Phase 1', city: 'Pune', healthScore: 88, potholes: 1 }
    ]
  }
];

export default function ContractorsPage() {
  const { selectedCity } = useCity();
  const [selectedContractor, setSelectedContractor] = useState<any>(null);

  // Filter contractors by city (simplified for demo)
  const filteredContractors = selectedCity 
    ? mockContractors.filter(contractor => 
        contractor.recentProjects.some(project => project.city === selectedCity.name)
      )
    : mockContractors;

  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating) 
            ? 'text-yellow-400 fill-yellow-400' 
            : i < rating 
            ? 'text-yellow-400 fill-yellow-400/50' 
            : 'text-gray-300'
        }`}
      />
    ));
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const handleDownloadPDF = (contractor: any) => {
    // Transform contractor data for PDF service
    const pdfData = {
      ...contractor,
      roads: contractor.recentProjects.map((project: any) => ({
        name: project.name,
        cityName: project.city,
        healthScore: project.healthScore,
        potholeCount: project.potholes,
        constructionYear: 2020, // Mock data - in real app this would come from API
        length: Math.random() * 5 + 1 // Mock length
      }))
    };

    pdfService.generateContractorReport(pdfData);
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <main className="flex-1 md:ml-64 p-4 md:p-8">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <Building2 className="w-8 h-8 text-primary" />
              Contractor Analytics
            </h1>
            <p className="text-foreground/60">
              Monitor contractor performance and road quality metrics
              {selectedCity && (
                <span className="ml-2 px-2 py-1 bg-primary/20 text-primary rounded text-xs">
                  {selectedCity.name}
                </span>
              )}
            </p>
          </div>
          <CitySelector />
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Contractors</p>
                  <p className="text-2xl font-bold text-primary">{filteredContractors.length}</p>
                </div>
                <Building2 className="w-8 h-8 text-primary/50" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg Rating</p>
                  <p className="text-2xl font-bold text-yellow-400">
                    {(filteredContractors.reduce((acc, c) => acc + c.rating, 0) / filteredContractors.length).toFixed(1)}
                  </p>
                </div>
                <Star className="w-8 h-8 text-yellow-400/50" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Roads</p>
                  <p className="text-2xl font-bold text-green-400">
                    {filteredContractors.reduce((acc, c) => acc + c.stats.totalRoadsBuilt, 0)}
                  </p>
                </div>
                <MapPin className="w-8 h-8 text-green-400/50" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg Health Score</p>
                  <p className="text-2xl font-bold text-blue-400">
                    {Math.round(filteredContractors.reduce((acc, c) => acc + c.stats.averageRoadHealth, 0) / filteredContractors.length)}%
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-blue-400/50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contractors Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredContractors.map((contractor) => (
            <Card key={contractor.id} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{contractor.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Est. {contractor.establishedYear}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    {getRatingStars(contractor.rating)}
                    <span className="ml-1 text-sm font-medium">{contractor.rating}</span>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Key Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-secondary/30 rounded-lg">
                    <p className="text-2xl font-bold text-primary">{contractor.stats.totalRoadsBuilt}</p>
                    <p className="text-xs text-muted-foreground">Roads Built</p>
                  </div>
                  <div className="text-center p-3 bg-secondary/30 rounded-lg">
                    <p className={`text-2xl font-bold ${getHealthScoreColor(contractor.stats.averageRoadHealth)}`}>
                      {contractor.stats.averageRoadHealth}%
                    </p>
                    <p className="text-xs text-muted-foreground">Avg Health</p>
                  </div>
                </div>

                {/* Specializations */}
                <div>
                  <p className="text-sm font-medium mb-2">Specializations</p>
                  <div className="flex flex-wrap gap-1">
                    {contractor.specialization.slice(0, 2).map((spec, idx) => (
                      <span key={idx} className="px-2 py-1 bg-primary/20 text-primary text-xs rounded">
                        {spec}
                      </span>
                    ))}
                    {contractor.specialization.length > 2 && (
                      <span className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded">
                        +{contractor.specialization.length - 2} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Recent Projects */}
                <div>
                  <p className="text-sm font-medium mb-2">Recent Projects</p>
                  <div className="space-y-2">
                    {contractor.recentProjects.slice(0, 2).map((project, idx) => (
                      <div key={idx} className="flex items-center justify-between text-sm">
                        <span className="truncate">{project.name}</span>
                        <div className="flex items-center gap-2">
                          <span className={`font-medium ${getHealthScoreColor(project.healthScore)}`}>
                            {project.healthScore}%
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {project.potholes} holes
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Contact Info */}
                <div className="pt-4 border-t border-border/30">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      <span className="truncate">{contractor.contactInfo.phone}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      <span className="truncate">{contractor.contactInfo.email}</span>
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <div className="flex gap-2">
                  <Button 
                    className="flex-1" 
                    variant="outline"
                    onClick={() => setSelectedContractor(contractor)}
                  >
                    View Details
                  </Button>
                  <Button 
                    size="sm"
                    variant="secondary"
                    onClick={() => handleDownloadPDF(contractor)}
                    className="px-3"
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredContractors.length === 0 && (
          <div className="text-center py-12">
            <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No contractors found</h3>
            <p className="text-muted-foreground">
              No contractors have projects in the selected city.
            </p>
          </div>
        )}

        {/* Contractor Detail Modal/Panel */}
        {selectedContractor && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-card border border-border rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-border flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">{selectedContractor.name}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    {getRatingStars(selectedContractor.rating)}
                    <span className="text-sm font-medium">{selectedContractor.rating} / 5.0</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => handleDownloadPDF(selectedContractor)}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Download Report
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setSelectedContractor(null)}
                  >
                    ✕
                  </Button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Detailed Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-secondary/30 rounded-lg">
                    <p className="text-3xl font-bold text-primary">{selectedContractor.stats.totalRoadsBuilt}</p>
                    <p className="text-sm text-muted-foreground">Total Roads</p>
                  </div>
                  <div className="text-center p-4 bg-secondary/30 rounded-lg">
                    <p className="text-3xl font-bold text-green-400">{selectedContractor.stats.totalLength} km</p>
                    <p className="text-sm text-muted-foreground">Total Length</p>
                  </div>
                  <div className="text-center p-4 bg-secondary/30 rounded-lg">
                    <p className="text-3xl font-bold text-yellow-400">{selectedContractor.stats.roadsNeedingRepair}</p>
                    <p className="text-sm text-muted-foreground">Need Repair</p>
                  </div>
                  <div className="text-center p-4 bg-secondary/30 rounded-lg">
                    <p className="text-3xl font-bold text-red-400">{selectedContractor.stats.totalPotholes}</p>
                    <p className="text-sm text-muted-foreground">Total Potholes</p>
                  </div>
                </div>

                {/* All Projects */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">All Projects</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="border-b border-border">
                        <tr>
                          <th className="text-left p-3">Road Name</th>
                          <th className="text-left p-3">City</th>
                          <th className="text-left p-3">Health Score</th>
                          <th className="text-left p-3">Potholes</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedContractor.recentProjects.map((project: any, idx: number) => (
                          <tr key={idx} className="border-b border-border/30">
                            <td className="p-3 font-medium">{project.name}</td>
                            <td className="p-3">{project.city}</td>
                            <td className="p-3">
                              <span className={`font-medium ${getHealthScoreColor(project.healthScore)}`}>
                                {project.healthScore}%
                              </span>
                            </td>
                            <td className="p-3">{project.potholes}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Contact & Certifications */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <span>{selectedContractor.contactInfo.phone}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <span>{selectedContractor.contactInfo.email}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span>{selectedContractor.contactInfo.address}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-4">Certifications</h3>
                    <div className="space-y-2">
                      {selectedContractor.certifications.map((cert: string, idx: number) => (
                        <div key={idx} className="flex items-center gap-2">
                          <Award className="w-4 h-4 text-green-400" />
                          <span className="text-sm">{cert}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}