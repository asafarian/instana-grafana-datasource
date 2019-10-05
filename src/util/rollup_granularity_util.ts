import TimeFilter from "../types/time_filter";
import rollupThresholds from "../lists/rollups";
import Rollup from "../types/rollup";

const rollupDurationThresholds: Array<Rollup> = rollupThresholds;
const maximumNumberOfUsefulInfrastructureDataPoints = 800;


function currentTime() {
  return Date.now();
}

function getWindowSize(timeFilter: TimeFilter): number {
  return timeFilter.from ? timeFilter.to - timeFilter.from : timeFilter.windowSize;
}

export function getDefaultMetricRollupDuration(timeFilter: TimeFilter, minRollup = 1000): Rollup {
  // Ignoring time differences for now since small time differences
  // can be accepted. This time is only used to calculate the rollup.
  const now = currentTime();
  const windowSize = getWindowSize(timeFilter);

  let availableRollupDefinitions = rollupDurationThresholds.filter(
    rollupDefinition => timeFilter.from >= now - rollupDefinition.availableFor
  );
  if (minRollup > 1000) {
    availableRollupDefinitions = availableRollupDefinitions.filter(
      rollupDefinition => rollupDefinition.rollup != null && rollupDefinition.rollup >= minRollup
    );
  }

  for (let i = 0, len = availableRollupDefinitions.length; i < len; i++) {
    // this works because the rollupDurationThresholds array is sorted by rollup
    // the first rollup matching the requirements is returned
    const rollupDefinition = availableRollupDefinitions[i];
    const rollup = rollupDefinition && rollupDefinition.rollup ? rollupDefinition.rollup : 1000;
    if (windowSize / rollup <= maximumNumberOfUsefulInfrastructureDataPoints) {
      return rollupDefinition;
    }
  }

  return rollupDurationThresholds[rollupDurationThresholds.length - 1];
}

export function getPossibleRollups(timeFilter: TimeFilter): Rollup[] {
  // Ignoring time differences for now since small time differences
  // can be accepted. This time is only used to calculate the rollup.
  const now = currentTime();
  const windowSize = getWindowSize(timeFilter);

  return rollupDurationThresholds
    .filter(rollupDefinition => timeFilter.from >= now - rollupDefinition.availableFor)
    .filter(rollUp => windowSize / rollUp.rollup <= maximumNumberOfUsefulInfrastructureDataPoints);
}
