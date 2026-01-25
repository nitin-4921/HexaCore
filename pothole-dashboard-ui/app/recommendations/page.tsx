'use client';

import { useState } from 'react';
import { Sidebar } from '@/components/sidebar';
import { mockPotholes, mockRoads } from '@/lib/mock-data';
import {
  AlertTriangle,
  TrendingUp,
  Clock,
  DollarSign,
  CheckCircle,
  Zap,
} from 'lucide-react';

interface Recommendation {
  id: string;
  priority: number;
  type: 'pothole' | 'road';
  title: string;
  description: string;
  impact: 'critical' | 'high' | 'medium';
  estimatedCost: number;
  estimatedTime: number;
  roadName: string;
  affectedAreas: number;
  safetyScore: number;
}

export default function RecommendationsPage() {
  // Generate AI recommendations based on mock data
  const generateRecommendations = (): Recommendation[] => {
    const recommendations: Recommendation[] = [];

    // Sort potholes by risk and create recommendations
    const sortedPotholes = [...mockPotholes].sort(
      (a, b) => b.riskScore - a.riskScore
    );

    sortedPotholes.forEach((pothole, idx) => {
      recommendations.push({
        id: `rec-pot-${idx}`,
        priority: idx + 1,
        type: 'pothole',
        title: `Urgent: Repair pothole at ${pothole.location.address}`,
        description: `High-risk pothole with ${pothole.depth}mm depth and ${pothole.width}cm width. Risk score: ${pothole.riskScore}/100.`,
        impact: pothole.severity === 'high' ? 'critical' : 'high',
        estimatedCost: pothole.severity === 'high' ? 850 : 450,
        estimatedTime: pothole.severity === 'high' ? 4 : 2,
        roadName: pothole.roadName,
        affectedAreas: 1,
        safetyScore: 100 - pothole.riskScore,
      });
    });

    // Add road-level recommendations
    mockRoads.forEach((road, idx) => {
      if (road.healthScore < 50) {
        recommendations.push({
          id: `rec-road-${idx}`,
          priority: recommendations.length + 1,
          type: 'road',
          title: `Major resurfacing needed: ${road.name}`,
          description: `Road health score is ${road.healthScore}%. Contains ${road.potholeCount} active potholes. Built in ${road.constructionYear}.`,
          impact: 'critical',
          estimatedCost: 50000 + road.length * 5000,
          estimatedTime: Math.ceil(road.length * 7),
          roadName: road.name,
          affectedAreas: road.potholeCount,
          safetyScore: road.healthScore,
        });
      }
    });

    return recommendations.sort((a, b) => a.priority - b.priority);
  };

  const recommendations = generateRecommendations();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filterImpact, setFilterImpact] = useState<string>('all');

  const filteredRecommendations =
    filterImpact === 'all'
      ? recommendations
      : recommendations.filter((r) => r.impact === filterImpact);

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'critical':
        return 'bg-red-900/30 text-red-300 border-red-500/30';
      case 'high':
        return 'bg-orange-900/30 text-orange-300 border-orange-500/30';
      case 'medium':
        return 'bg-yellow-900/30 text-yellow-300 border-yellow-500/30';
      default:
        return 'bg-gray-900/30 text-gray-300 border-gray-500/30';
    }
  };

  const getImpactBadgeColor = (impact: string) => {
    switch (impact) {
      case 'critical':
        return 'bg-red-500/20 text-red-300 border border-red-500/50';
      case 'high':
        return 'bg-orange-500/20 text-orange-300 border border-orange-500/50';
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/50';
      default:
        return 'bg-gray-500/20 text-gray-300 border border-gray-500/50';
    }
  };

  const totalCost = filteredRecommendations.reduce(
    (sum, r) => sum + r.estimatedCost,
    0
  );
  const totalTime = filteredRecommendations.reduce(
    (sum, r) => sum + r.estimatedTime,
    0
  );

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <main className="flex-1 md:ml-64 p-4 md:p-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">AI Recommendations</h1>
          <p className="text-foreground/60">
            Prioritized repair recommendations powered by machine learning analysis
          </p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-red-500/20 to-orange-500/20 border border-red-500/30 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-foreground/60">Critical Issues</p>
              <AlertTriangle className="w-5 h-5 text-red-400" />
            </div>
            <p className="text-3xl font-bold text-red-400">
              {filteredRecommendations.filter((r) => r.impact === 'critical').length}
            </p>
          </div>

          <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-foreground/60">Total Items</p>
              <Zap className="w-5 h-5 text-blue-400" />
            </div>
            <p className="text-3xl font-bold text-blue-400">
              {filteredRecommendations.length}
            </p>
          </div>

          <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-foreground/60">Est. Cost</p>
              <DollarSign className="w-5 h-5 text-green-400" />
            </div>
            <p className="text-3xl font-bold text-green-400">
              ${(totalCost / 1000).toFixed(0)}k
            </p>
          </div>

          <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-foreground/60">Est. Time</p>
              <Clock className="w-5 h-5 text-purple-400" />
            </div>
            <p className="text-3xl font-bold text-purple-400">
              {totalTime}h
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex gap-3">
          {['all', 'critical', 'high', 'medium'].map((level) => (
            <button
              key={level}
              onClick={() => setFilterImpact(level)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filterImpact === level
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-foreground/70 hover:bg-secondary/80'
              }`}
            >
              {level === 'all'
                ? 'All'
                : level.charAt(0).toUpperCase() + level.slice(1)}
            </button>
          ))}
        </div>

        {/* Recommendations List */}
        <div className="space-y-4">
          {filteredRecommendations.map((rec) => (
            <div
              key={rec.id}
              className={`border-l-4 rounded-lg overflow-hidden transition-all ${getImpactColor(rec.impact)}`}
            >
              <button
                onClick={() =>
                  setExpandedId(expandedId === rec.id ? null : rec.id)
                }
                className="w-full p-6 text-left hover:bg-black/20 transition-colors"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-sm font-bold px-3 py-1 bg-black/30 rounded-full">
                        #{rec.priority}
                      </span>
                      <h3 className="text-lg font-bold">{rec.title}</h3>
                      {rec.type === 'road' && (
                        <span className="text-xs font-semibold px-2 py-1 bg-primary/30 text-primary rounded">
                          ROAD
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-foreground/70">{rec.description}</p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ml-4 ${getImpactBadgeColor(rec.impact)}`}
                  >
                    {rec.impact.toUpperCase()}
                  </span>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-4 gap-4 mb-3">
                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign className="w-4 h-4 opacity-60" />
                    <span>${rec.estimatedCost.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 opacity-60" />
                    <span>{rec.estimatedTime}h</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <TrendingUp className="w-4 h-4 opacity-60" />
                    <span>{rec.affectedAreas} area(s)</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 opacity-60" />
                    <span>{rec.safetyScore}% safe</span>
                  </div>
                </div>

                {/* Expand indicator */}
                {expandedId !== rec.id && (
                  <div className="text-xs text-foreground/50 cursor-pointer">
                    Click to expand details →
                  </div>
                )}
              </button>

              {/* Expanded Details */}
              {expandedId === rec.id && (
                <div className="px-6 pb-6 border-t border-white/10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                    <div>
                      <h4 className="text-sm font-semibold mb-3">
                        Implementation Details
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div>
                          <p className="text-foreground/60">Road/Location</p>
                          <p className="font-semibold">{rec.roadName}</p>
                        </div>
                        <div>
                          <p className="text-foreground/60">Estimated Cost</p>
                          <p className="font-semibold text-green-400">
                            ${rec.estimatedCost.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-foreground/60">Time Required</p>
                          <p className="font-semibold">
                            {rec.estimatedTime} hours
                          </p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold mb-3">
                        Impact Analysis
                      </h4>
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between mb-2">
                            <span className="text-sm text-foreground/60">
                              Safety Improvement
                            </span>
                            <span className="font-semibold">
                              {rec.safetyScore}%
                            </span>
                          </div>
                          <div className="w-full bg-black/30 rounded-full h-2">
                            <div
                              style={{ width: `${rec.safetyScore}%` }}
                              className="bg-gradient-to-r from-primary to-accent h-2 rounded-full"
                            />
                          </div>
                        </div>
                        <p className="text-xs text-foreground/60">
                          Fixing this{' '}
                          {rec.type === 'pothole' ? 'pothole' : 'road'} will
                          significantly improve traffic safety and reduce
                          maintenance costs.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-4 flex gap-3">
                    <button className="flex-1 px-4 py-2 bg-primary/30 text-primary border border-primary/50 rounded hover:bg-primary/40 transition-colors font-medium text-sm">
                      Schedule Repair
                    </button>
                    <button className="flex-1 px-4 py-2 bg-accent/30 text-accent border border-accent/50 rounded hover:bg-accent/40 transition-colors font-medium text-sm">
                      Assign Contractor
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredRecommendations.length === 0 && (
          <div className="bg-card border border-border rounded-lg p-12 flex items-center justify-center text-center">
            <div>
              <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4 opacity-50" />
              <p className="text-xl font-semibold mb-2">No issues found</p>
              <p className="text-foreground/60">
                Great job! All roads are in good condition.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
