import { NextResponse } from "next/server";
import { getOpenAIClient } from "@/lib/openai";

export async function POST(request: Request) {
  try {
    const openai = getOpenAIClient();

    if (!openai) {
      return NextResponse.json({ error: "Use browser speech synthesis or add OPENAI_API_KEY." }, { status: 503 });
    }

    const body = await request.json();
    const text = String(body.text || "").trim();

    if (!text) {
      return NextResponse.json({ error: "Text is required." }, { status: 400 });
    }

    const audio = await openai.audio.speech.create({
      model: "tts-1",
      voice: "alloy",
      input: text
    });

    return new Response(await audio.arrayBuffer(), {
      headers: {
        "Content-Type": "audio/mpeg"
      }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Text-to-speech failed.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
