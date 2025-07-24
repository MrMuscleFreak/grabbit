import React from 'react';
import { FaTriangleExclamation } from 'react-icons/fa6';

type SettingsSectionProps = {
  title: string;
  children: React.ReactNode;
  warning?: string;
};

const SettingsSection: React.FC<SettingsSectionProps> = ({
  title,
  children,
  warning,
}) => {
  // This allows the `divide-y` utility to work correctly.
  const wrappedChildren = React.Children.map(children, (child, index) => (
    <div key={index} className="p-4">
      {child}
    </div>
  ));

  return (
    <div>
      <h2 className="px-4 text-xs font-bold uppercase tracking-wider text-white mb-1">
        {title}
      </h2>
      {warning && (
        <div className="px-4 mb-3 inline-flex items-center gap-1 text-red-500 text-xs font-normal">
          <FaTriangleExclamation /> {warning}
        </div>
      )}
      <div className="bg-slate-800/80 rounded-xl border-2 border-slate-700/50">
        <div className="divide-slate-700/50">{wrappedChildren}</div>
      </div>
    </div>
  );
};

export default SettingsSection;
