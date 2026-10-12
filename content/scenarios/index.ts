/**
 * Scenario registry. Each data file registers its scenarios via
 * registerScenario(); <ScenarioPlayer scenario="id"> renders them.
 */
import { getScenario, registerScenario, scenarioIds } from './types';

export { getScenario, registerScenario, scenarioIds };
export type { ResolvedScenario, ScenarioData, ScenarioNote } from './types';

// Scenario data files (Batch 1: event loop; more in later batches).
import './event-loop-browser';
import './viz-batch1';
import './viz-batch3';
import './viz-batch4';
import './viz-batch5';
