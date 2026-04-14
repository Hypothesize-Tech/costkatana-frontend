import { useTopDecision } from "@/hooks/useDecisions";
import DecisionCard from "./DecisionCard";
import AlreadyOptimizedBanner from "./AlreadyOptimizedBanner";

export default function TopDecisionBanner() {
  const { data, isLoading, error } = useTopDecision();

  if (isLoading) {
    return (
      <div className="glass rounded-2xl p-6 border border-primary-200/30 shadow-xl animate-pulse">
        <div className="h-4 w-24 bg-primary-200/40 rounded mb-3" />
        <div className="h-6 w-2/3 bg-primary-200/40 rounded mb-2" />
        <div className="h-4 w-full bg-primary-200/30 rounded mb-4" />
        <div className="h-8 w-32 bg-primary-200/40 rounded" />
      </div>
    );
  }

  if (error) return null;

  const decision = data?.decision ?? null;
  if (!decision) return <AlreadyOptimizedBanner />;

  return <DecisionCard decision={decision} variant="hero" />;
}
