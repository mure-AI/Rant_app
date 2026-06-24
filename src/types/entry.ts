import type { AnalysisResult } from "./analysis";

export type EntryInputType = "text" | "voice";

export type SavedEntry = {
  id: string;
  user_id: string;
  input_type: EntryInputType;
  original_text: string | null;
  transcript: string | null;
  audio_url: string | null;
  emotion: string | null;
  problem_type: string | null;
  summary: string | null;
  likely_problem: string | null;
  why_it_might_be_happening: string | null;
  reflective_question: string | null;
  ai_response: AnalysisResult | null;
  created_at: string;
  action_steps?: ActionStep[];
};

export type ActionStep = {
  id: string;
  entry_id: string;
  step_text: string;
  is_completed: boolean;
  created_at: string;
};

export type CreateEntryPayload = {
  id?: string;
  inputType: EntryInputType;
  originalText?: string;
  transcript?: string;
  audioUrl?: string;
  analysis: AnalysisResult;
};
