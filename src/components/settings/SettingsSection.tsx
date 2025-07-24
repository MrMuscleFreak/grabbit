import React from 'react';

type SettingsSectionProps = {
  title: string;
  children: React.ReactNode;
};

const SettingsSection: React.FC<SettingsSectionProps> = ({
  title,
  children,
}) => {
  // This allows the `divide-y` utility to work correctly.
  const wrappedChildren = React.Children.map(children, (child, index) => (
    <div key={index} className="p-4">
      {child}
    </div>
  ));

  return (
    <div>
      <h2 className="px-4 text-xs font-bold uppercase tracking-wider text-white mb-3">
        {title}
      </h2>
      <div className="bg-slate-800/80 rounded-xl border-2 border-slate-700/50">
        <div className="divide-slate-700/50">{wrappedChildren}</div>
      </div>
    </div>
  );
};

export default SettingsSection;
