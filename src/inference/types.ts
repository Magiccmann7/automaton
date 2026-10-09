/**
 * Inference & Model Strategy — Internal Types
 *
 * Re-exports shared types from types.ts and defines internal constants
 * for the inference routing subsystem.
 */

export type {
  SurvivalTier,
  ModelProvider,
  InferenceTaskType,
  ModelEntry,
  ModelPreference,
  RoutingMatrix,
  InferenceRequest,
  InferenceResult,
  InferenceCostRow,
  ModelRegistryRow,
  ModelStrategyConfig,
  ChatMessage,
} from "../types.js";

import type {
  RoutingMatrix,
  ModelEntry,
  ModelStrategyConfig,
} from "../types.js";

// === Default Retry Policy ===

export const DEFAULT_RETRY_POLICY = {
  maxRetries: 3,
  baseDelayMs: 1000,
  maxDelayMs: 30000,
} as const;

// === Per-Task Timeout Overrides (ms) ===

export const TASK_TIMEOUTS: Record<string, number> = {
  heartbeat_triage: 15_000,
  safety_check: 30_000,
  summarization: 60_000,
  agent_turn: 120_000,
  planning: 120_000,
};

// === Static Model Baseline ===
// Known models with realistic pricing (hundredths of cents per 1k tokens)

export const STATIC_MODEL_BASELINE: Omit<ModelEntry, "lastSeen" | "createdAt" | "updatedAt">[] = [
  {
    modelId: "gpt-5.6-sol",
    provider: "openai",
    displayName: "GPT-5.6 Sol",
    tierMinimum: "normal",
    costPer1kInput: 40,
    costPer1kOutput: 200,
    maxTokens: 128000,
    contextWindow: 1050000,
    supportsTools: true,
    supportsVision: true,
    parameterStyle: "max_completion_tokens",
    enabled: true,
  },
  {
    modelId: "gpt-5.6-terra",
    provider: "openai",
    displayName: "GPT-5.6 Terra",
    tierMinimum: "low_compute",
    costPer1kInput: 20,
    costPer1kOutput: 120,
    maxTokens: 128000,
    contextWindow: 1050000,
    supportsTools: true,
    supportsVision: true,
    parameterStyle: "max_completion_tokens",
    enabled: true,
  },
  {
    modelId: "gpt-5.6-luna",
    provider: "openai",
    displayName: "GPT-5.6 Luna",
    tierMinimum: "critical",
    costPer1kInput: 2,
    costPer1kOutput: 12,
    maxTokens: 128000,
    contextWindow: 1050000,
    supportsTools: true,
    supportsVision: true,
    parameterStyle: "max_completion_tokens",
    enabled: true,
  },
];

// === Default Routing Matrix ===
// Maps (tier, taskType) -> ModelPreference with candidate models

export const DEFAULT_ROUTING_MATRIX: RoutingMatrix = {
  high: {
    agent_turn: { candidates: ["gpt-5.6-sol", "gpt-5.6-terra"], maxTokens: 8192, ceilingCents: -1 },
    heartbeat_triage: { candidates: ["gpt-5.6-terra", "gpt-5.6-luna"], maxTokens: 2048, ceilingCents: 5 },
    safety_check: { candidates: ["gpt-5.6-sol", "gpt-5.6-terra"], maxTokens: 4096, ceilingCents: 20 },
    summarization: { candidates: ["gpt-5.6-terra", "gpt-5.6-sol"], maxTokens: 4096, ceilingCents: 15 },
    planning: { candidates: ["gpt-5.6-sol", "gpt-5.6-terra"], maxTokens: 8192, ceilingCents: -1 },
  },
  normal: {
    agent_turn: { candidates: ["gpt-5.6-sol", "gpt-5.6-terra"], maxTokens: 4096, ceilingCents: -1 },
    heartbeat_triage: { candidates: ["gpt-5.6-luna", "gpt-5.6-terra"], maxTokens: 2048, ceilingCents: 5 },
    safety_check: { candidates: ["gpt-5.6-terra", "gpt-5.6-sol"], maxTokens: 4096, ceilingCents: 10 },
    summarization: { candidates: ["gpt-5.6-terra", "gpt-5.6-luna"], maxTokens: 4096, ceilingCents: 10 },
    planning: { candidates: ["gpt-5.6-sol", "gpt-5.6-terra"], maxTokens: 4096, ceilingCents: -1 },
  },
  low_compute: {
    agent_turn: { candidates: ["gpt-5.6-terra", "gpt-5.6-luna"], maxTokens: 4096, ceilingCents: 10 },
    heartbeat_triage: { candidates: ["gpt-5.6-luna"], maxTokens: 1024, ceilingCents: 2 },
    safety_check: { candidates: ["gpt-5.6-terra", "gpt-5.6-luna"], maxTokens: 2048, ceilingCents: 5 },
    summarization: { candidates: ["gpt-5.6-luna"], maxTokens: 2048, ceilingCents: 5 },
    planning: { candidates: ["gpt-5.6-terra", "gpt-5.6-luna"], maxTokens: 2048, ceilingCents: 5 },
  },
  critical: {
    agent_turn: { candidates: ["gpt-5.6-luna"], maxTokens: 2048, ceilingCents: 3 },
    heartbeat_triage: { candidates: ["gpt-5.6-luna"], maxTokens: 512, ceilingCents: 1 },
    safety_check: { candidates: ["gpt-5.6-luna"], maxTokens: 1024, ceilingCents: 2 },
    summarization: { candidates: [], maxTokens: 0, ceilingCents: 0 },
    planning: { candidates: [], maxTokens: 0, ceilingCents: 0 },
  },
  dead: {
    agent_turn: { candidates: [], maxTokens: 0, ceilingCents: 0 },
    heartbeat_triage: { candidates: [], maxTokens: 0, ceilingCents: 0 },
    safety_check: { candidates: [], maxTokens: 0, ceilingCents: 0 },
    summarization: { candidates: [], maxTokens: 0, ceilingCents: 0 },
    planning: { candidates: [], maxTokens: 0, ceilingCents: 0 },
  },
};

// === Default Model Strategy Config ===

export const DEFAULT_MODEL_STRATEGY_CONFIG: ModelStrategyConfig = {
  inferenceModel: "gpt-5.6-sol",
  lowComputeModel: "gpt-5.6-terra",
  criticalModel: "gpt-5.6-luna",
  maxTokensPerTurn: 4096,
  hourlyBudgetCents: 0,
  sessionBudgetCents: 0,
  perCallCeilingCents: 0,
  enableModelFallback: true,
  anthropicApiVersion: "2023-06-01",
};
