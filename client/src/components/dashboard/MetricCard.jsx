import React from 'react';

export const MetricCard = ({
  title,
  value,
  subtext,
  icon: Icon,
  variant = 'teal',
  trend = null,
}) => {
  const variantStyles = {
    teal: {
      bg: 'bg-teal-50',
      text: 'text-teal-800',
      border: 'border-teal-200',
      iconBg: 'bg-teal-700 text-white',
    },
    river: {
      bg: 'bg-sky-50',
      text: 'text-sky-800',
      border: 'border-sky-200',
      iconBg: 'bg-river-600 text-white',
    },
    saffron: {
      bg: 'bg-amber-50',
      text: 'text-amber-800',
      border: 'border-amber-200',
      iconBg: 'bg-saffron-500 text-white',
    },
    rose: {
      bg: 'bg-rose-50',
      text: 'text-rose-800',
      border: 'border-rose-200',
      iconBg: 'bg-rose-600 text-white',
    },
    slate: {
      bg: 'bg-slate-50',
      text: 'text-slate-800',
      border: 'border-slate-200',
      iconBg: 'bg-slate-700 text-white',
    },
  };

  const style = variantStyles[variant] || variantStyles.teal;

  return (
    <div className={`p-5 rounded-2xl bg-white border border-slate-200/90 shadow-card flex items-start justify-between gap-4 transition-all hover:shadow-cardHover`}>
      <div className="space-y-1">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
          {title}
        </span>
        <div className="text-2xl font-black text-slate-900 tracking-tight">
          {value !== undefined && value !== null ? value.toLocaleString() : '—'}
        </div>
        {subtext && (
          <p className="text-xs text-slate-500 font-medium pt-1">
            {subtext}
          </p>
        )}
      </div>

      {Icon && (
        <div className={`p-3 rounded-xl ${style.iconBg} shadow-sm flex-shrink-0`}>
          <Icon className="w-5 h-5" />
        </div>
      )}
    </div>
  );
};
