export interface FlowisePredictionRequest {
  question: string;
  streaming: boolean;
}

export interface FlowiseNonStreamingResponse {
  text?: string;
  json?: unknown;
}

export interface SeoGenerationResult {
  title: string;
  meta_description: string;
  h1: string;
  description: string;
  bullets: string[];
}

export interface SeoChunkEvent {
  type: 'token' | 'done' | 'fallback' | 'error';
  chunk?: string;
  data?: SeoGenerationResult;
  reason?: string;
}
