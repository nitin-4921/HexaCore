/**
 * POTHOLE IMAGE VIEWER
 * 
 * Professional image viewer for pothole evidence photos.
 * Designed for IoT camera integration and field inspection use.
 * 
 * Features:
 * - Full-screen modal view
 * - Loading states and error handling
 * - Metadata display (camera, timestamp, etc.)
 * - Future-ready for multiple images per pothole
 */

'use client';

import { useState } from 'react';
import { X, Camera, Clock, MapPin, AlertTriangle, Download, ZoomIn } from 'lucide-react';
import { Pothole, getSeverityBgColor } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';

interface PotholeImageViewerProps {
  pothole: Pothole;
  isOpen: boolean;
  onClose: () => void;
}

export function PotholeImageViewer({ pothole, isOpen, onClose }: PotholeImageViewerProps) {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  if (!isOpen) return null;

  const handleImageLoad = () => {
    setImageLoading(false);
    setImageError(false);
  };

  const handleImageError = () => {
    setImageLoading(false);
    setImageError(true);
  };

  const handleDownload = () => {
    if (pothole.imageUrl) {
      const link = document.createElement('a');
      link.href = pothole.imageUrl;
      link.download = `pothole-${pothole.id}-evidence.jpg`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
      <div className="bg-card border border-border rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Camera className="w-6 h-6 text-primary" />
            <div>
              <h2 className="text-xl font-bold">Pothole Evidence Photo</h2>
              <p className="text-sm text-muted-foreground">
                ID: {pothole.id} • {pothole.location.address}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {pothole.imageUrl && (
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row">
          {/* Image Section */}
          <div className="flex-1 p-6 bg-secondary/20">
            <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
              {imageLoading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              )}
              
              {imageError ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
                  <Camera className="w-12 h-12 mb-2" />
                  <p className="text-sm">Image not available</p>
                  <p className="text-xs">Camera data may be processing</p>
                </div>
              ) : pothole.imageUrl ? (
                <img
                  src={pothole.imageUrl}
                  alt={`Pothole at ${pothole.location.address}`}
                  className="w-full h-full object-cover"
                  onLoad={handleImageLoad}
                  onError={handleImageError}
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
                  <Camera className="w-12 h-12 mb-2" />
                  <p className="text-sm">No image available</p>
                  <p className="text-xs">Awaiting camera data</p>
                </div>
              )}
              
              {!imageLoading && !imageError && pothole.imageUrl && (
                <div className="absolute top-4 right-4">
                  <Button variant="secondary" size="sm">
                    <ZoomIn className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Details Section */}
          <div className="w-full lg:w-80 p-6 space-y-6">
            {/* Pothole Info */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Pothole Details</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{pothole.location.address}</p>
                    <p className="text-sm text-muted-foreground">{pothole.roadName}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-muted-foreground" />
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getSeverityBgColor(pothole.severity)}`}>
                      {pothole.severity.toUpperCase()}
                    </span>
                    <span className="text-sm">Risk: {pothole.riskScore}%</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm">Detected: {pothole.detectedTime}</p>
                    <p className="text-xs text-muted-foreground">Sensor: {pothole.sensorId}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Physical Measurements */}
            <div>
              <h4 className="font-medium mb-3">Physical Measurements</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-secondary/30 rounded">
                  <p className="text-lg font-bold text-primary">{pothole.depth}</p>
                  <p className="text-xs text-muted-foreground">Depth (mm)</p>
                </div>
                <div className="text-center p-3 bg-secondary/30 rounded">
                  <p className="text-lg font-bold text-primary">{pothole.width}</p>
                  <p className="text-xs text-muted-foreground">Width (cm)</p>
                </div>
              </div>
            </div>

            {/* Camera Metadata */}
            {pothole.imageMetadata && (
              <div>
                <h4 className="font-medium mb-3">Camera Information</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Camera ID:</span>
                    <span className="font-mono">{pothole.imageMetadata.cameraId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Captured:</span>
                    <span>{pothole.imageMetadata.capturedAt}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Resolution:</span>
                    <span>{pothole.imageMetadata.resolution}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Future: Multiple Images */}
            <div className="pt-4 border-t border-border/30">
              <p className="text-xs text-muted-foreground">
                💡 Future: Multiple angles and follow-up inspection photos will be available here
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}