import React, { useMemo } from "react";
import Icon from "../components/Icon";
import { calculateChildSummary, formatDuration } from "../domain/insights";
import { useNestStore } from "../store/NestStore";

const Insights: React.FC = () => {
  const { data, selectedChild } = useNestStore();
  const summary = useMemo(() => calculateChildSummary(data.activities, selectedChild.id), [data.activities, selectedChild.id]);
  return <div className="nest-page nest-insights"><header className="nest-page-heading"><div><p>GENTLE PATTERNS</p><h1>Insights for {selectedChild.name}</h1></div><span>Based on the last 7 days</span></header>
    <article className="nest-insight-feature"><span><Icon name="sparkle"/></span><div><p>THIS WEEK</p><h2>Nighttime sleep is settling into a rhythm.</h2><small>{selectedChild.name}’s longest stretch was {formatDuration(summary.longestSleepMs)}. Patterns are descriptive, never medical advice.</small></div></article>
    <div className="nest-insight-grid">
      <section><header><span className="sage"><Icon name="sleep"/></span><div><p>SLEEP</p><strong>Rest & rhythm</strong></div></header><dl><div><dt>Longest stretch</dt><dd>{formatDuration(summary.longestSleepMs)}</dd></div><div><dt>Average bedtime</dt><dd>8:22 pm</dd></div><div><dt>Average overnight</dt><dd>8h 48m</dd></div></dl></section>
      <section><header><span className="terracotta"><Icon name="feed"/></span><div><p>FEEDING</p><strong>Timing & amount</strong></div></header><dl><div><dt>Average interval</dt><dd>{summary.averageFeedIntervalMs ? formatDuration(summary.averageFeedIntervalMs) : "—"}</dd></div><div><dt>Average bottle</dt><dd>{summary.averageBottleMl ? `${Math.round(summary.averageBottleMl)} ml` : "—"}</dd></div><div><dt>Feeds today</dt><dd>{summary.feedsToday}</dd></div></dl></section>
      <section><header><span className="sand"><Icon name="nappy"/></span><div><p>NAPPIES</p><strong>Daily rhythm</strong></div></header><dl><div><dt>Average per day</dt><dd>{summary.nappiesPerDay.toFixed(1)}</dd></div><div><dt>Today</dt><dd>{summary.nappiesToday}</dd></div><div><dt>Stock outlook</dt><dd>~3 days</dd></div></dl></section>
    </div>
  </div>;
};
export default Insights;
