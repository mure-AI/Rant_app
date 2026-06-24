import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { createEntrySchema } from "@/lib/validators";

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
  try {
    const supabase = createSupabaseServerClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Log in to save this entry." }, { status: 401 });
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
      throw entryError;
    }

    const steps = analysis.nextSteps.map((step) => ({
      entry_id: entry.id,
      step_text: step
    }));

    if (steps.length > 0) {
      const { error: stepsError } = await supabase.from("action_steps").insert(steps);
      if (stepsError) {
        throw stepsError;
      }
    }

    return NextResponse.json({ id: entry.id });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not save entry.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
