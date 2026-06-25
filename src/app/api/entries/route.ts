import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { createEntrySchema } from "@/lib/validators";

function saveError(stage: "auth" | "validation" | "entry_insert" | "action_steps_insert", error: string, status = 400) {
  return NextResponse.json({ error, stage }, { status });
}

export async function GET() {
  try {
    const supabase = createSupabaseServerClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Log in to view entries." }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("entries")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json({ entries: data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not load entries.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function POST(request: Request) {
  const supabase = createSupabaseServerClient();

  try {
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      return saveError("auth", "Log in to save this entry.", 401);
    }

    const payload = createEntrySchema.parse(await request.json());
    const { analysis } = payload;

    const { data: entry, error: entryError } = await supabase
      .from("entries")
      .insert({
        id: payload.id,
        user_id: user.id,
        input_type: payload.inputType,
        original_text: payload.originalText || null,
        transcript: payload.transcript || null,
        audio_url: payload.audioUrl || null,
        emotion: analysis.emotion,
        problem_type: analysis.problemType,
        summary: analysis.summary,
        likely_problem: analysis.likelyProblem,
        why_it_might_be_happening: analysis.whyItMightBeHappening,
        reflective_question: analysis.reflectiveQuestion,
        ai_response: analysis
      })
      .select("id")
      .single();

    if (entryError) {
      return saveError("entry_insert", entryError.message || "Could not save entry.");
    }

    const steps = analysis.nextSteps.map((step) => ({
      entry_id: entry.id,
      step_text: step
    }));

    if (steps.length > 0) {
      const { error: stepsError } = await supabase.from("action_steps").insert(steps);
      if (stepsError) {
        return saveError("action_steps_insert", stepsError.message || "Could not save entry.");
      }
    }

    return NextResponse.json({ id: entry.id });
  } catch (error) {
    if (error instanceof ZodError) {
      return saveError("validation", "Could not save entry: invalid save payload.");
    }

    const message = error instanceof Error ? error.message : "Could not save entry.";
    return saveError("entry_insert", message);
  }
}
