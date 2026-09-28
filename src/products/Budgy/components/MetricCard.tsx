import React from "react";

interface MetricCardProps {
  label: string;
  value: string;
  detail: string;
  tone?: "default" | "positive" | "dark";
  children?: React.ReactNode;
}

const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  detail,
  tone = "default",
  children,
}) => (
  <article className={"budgy-metric-card budgy-metric-card--" + tone}>
    <p className="budgy-metric-label">{label}</p>
    <strong className="budgy-metric-value">{value}</strong>
    <span className="budgy-metric-caption">{detail}</span>
    {children && <div className="budgy-metric-footer">{children}</div>}
  </article>
);

export default MetricCard;
