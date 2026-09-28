import React from "react";
import { BudgetGroupTotal } from "../domain/types";
import { formatMoney } from "../domain/money";

const colors = [
  "#1f6858",
  "#d69a58",
  "#719186",
  "#a7b87a",
  "#b57c69",
  "#617d9a",
  "#9381a4",
  "#b1a594",
];

const SpendingDonut: React.FC<{ groups: BudgetGroupTotal[]; total: number }> = ({
  groups,
  total,
}) => {
  let offset = 0;

  return (
    <div className="budgy-spending-visual">
      <div className="budgy-donut-wrap">
        <svg className="budgy-donut" viewBox="0 0 42 42" role="img" aria-label={"Planned spending " + formatMoney(total)}>
          <circle cx="21" cy="21" r="15.9155" className="budgy-donut-track" />
          {groups.map((group, index) => {
            const percentage = group.shareOfSpending * 100;
            const circle = (
              <circle
                key={group.group}
                cx="21"
                cy="21"
                r="15.9155"
                fill="none"
                stroke={colors[index]}
                strokeWidth="5.5"
                strokeDasharray={percentage + " " + (100 - percentage)}
                strokeDashoffset={-offset}
                transform="rotate(-90 21 21)"
              />
            );
            offset += percentage;
            return circle;
          })}
        </svg>
        <div className="budgy-donut-centre"><span>Planned</span><strong>{formatMoney(total)}</strong></div>
      </div>
      <ul className="budgy-spending-legend">
        {groups.map((group, index) => (
          <li className="budgy-legend-row" key={group.group}>
            <i className="budgy-legend-dot" style={{ backgroundColor: colors[index] }} />
            <span>{group.group}</span>
            <strong>{formatMoney(group.amount)}</strong>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SpendingDonut;
