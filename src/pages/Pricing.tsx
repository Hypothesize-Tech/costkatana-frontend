import React from "react";
import { PriceComparison } from "../components/pricing";

const Pricing: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-light-ambient dark:bg-gradient-dark-ambient">
      <PriceComparison />
    </div>
  );
};

export default Pricing;
