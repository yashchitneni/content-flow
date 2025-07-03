import React from 'react';
import { Icon } from '../../atoms/Icon';

export interface UsageStatsItem {
  label: string;
  current: number;
  limit?: number;
  unit: string;
  icon: string;
  color: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
}

export interface UsageStatsProps {
  stats: UsageStatsItem[];
  lastUpdated?: string;
}

export const UsageStats: React.FC<UsageStatsProps> = ({ stats, lastUpdated }) => {
  const getPercentage = (current: number, limit?: number) => {
    if (!limit) return 0;
    return Math.min((current / limit) * 100, 100);
  };

  const getProgressColor = (percentage: number) => {
    if (percentage < 50) return 'bg-green-500';
    if (percentage < 80) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {stats.map((stat, index) => {
          const percentage = getPercentage(stat.current, stat.limit);
          const progressColor = getProgressColor(percentage);

          return (
            <div
              key={index}
              className="p-4 glass rounded-lg hover:shadow-md transition-shadow hover-lift"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-lg bg-${stat.color}-50`}>
                    <Icon name={stat.icon as any} size="sm" className={`text-${stat.color}-600`} />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-theme-primary">{stat.label}</h4>
                    <p className="text-xs text-theme-secondary">
                      {formatNumber(stat.current)} {stat.unit}
                      {stat.limit && ` / ${formatNumber(stat.limit)} ${stat.unit}`}
                    </p>
                  </div>
                </div>
              </div>

              {stat.limit && (
                <div className="space-y-1">
                  <div 
                    className="w-full bg-theme-secondary/20 rounded-full h-2 overflow-hidden"
                    style={{'--progress-width': `${percentage}%`} as React.CSSProperties}
                  >
                    <div
                      className={`h-full transition-all duration-300 w-[var(--progress-width)] ${progressColor}`}
                    />
                  </div>
                  <p className="text-xs text-theme-secondary text-right">
                    {percentage.toFixed(1)}% used
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {lastUpdated && (
        <p className="text-xs text-theme-tertiary text-center">
          Last updated: {new Date(lastUpdated).toLocaleString()}
        </p>
      )}
    </div>
  );
};