import React from "react";

const MapDemo: React.FC = () => {
  return (
    <div className="h-screen w-screen overflow-hidden bg-background">
      <iframe
        src="/Properties-Page/property.html"
        title="Property Section"
        className="h-full w-full border-0"
        loading="eager"
      />
    </div>
  );
};

export default MapDemo;
