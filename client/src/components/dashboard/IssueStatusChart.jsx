import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { ISSUE_STATUS_METADATA } from '../../utils/formatters';

const STATUS_COLORS = {
  SUBMITTED: '#3b82f6',
  UNDER_REVIEW: '#a855f7',
  VERIFIED: '#f59e0b',
  IN_PROGRESS: '#06b6d4',
  RESOLVED: '#10b981',
  REJECTED: '#ef4444',
};

export const IssueStatusChart = ({ data = [] }) => {
  const chartData = data.map((item) => {
    const key = item.status || item._id || item.name;
    return {
      name: ISSUE_STATUS_METADATA[key]?.label || key,
      value: item.count || item.value || 0,
      rawKey: key,
    };
  });

  if (chartData.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-400 text-xs">
        No reported civic issues
      </div>
    );
  }

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={85}
            paddingAngle={3}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={STATUS_COLORS[entry.rawKey] || '#64748b'}
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: '#1e293b',
              borderRadius: '8px',
              border: 'none',
              color: '#fff',
              fontSize: '12px',
            }}
            formatter={(val) => [`${val} Reports`, 'Count']}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            iconType="circle"
            wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
