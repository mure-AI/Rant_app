import { NextResponse } from "next/server";
import { getOpenAIClient } from "@/lib/openai";

export async function POST(request: Request) {
  const startedAt = performance.now();

  try {
    const openai = getOpenAIClient();

    if (!openai) {
      return NextResponse.json({ error: "Add OPENAI_API_KEY to enable speech-to-text." }, { status: 503 });
    }

    const formData = await request.formData();
    const audio = formData.get("audio");

    if (!(audio instanceof File)) {
      return NextResponse.json({ error: "Upload an audio file named audio." }, { status: 400 });
    }

    const transcription = await openai.audio.transcriptions.create({
      file: audio,
      model: "whisper-1"
    });

    return NextResponse.json({
      transcript: transcription.text,
      metrics: {
        transcriptionLatencyMs: Math.round(performance.now() - startedAt)
      }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Transcription failed.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
