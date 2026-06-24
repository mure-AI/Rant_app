import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

type RouteContext = {
  params: {
    id: string;
  };
};

export async function GET(_request: Request, { params }: RouteContext) {
  try {
    const supabase = createSupabaseServerClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Log in to view this entry." }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("entries")
      .select("*, action_steps(*)")
      .eq("id", params.id)
      .eq("user_id", user.id)
      .single();

    if (error) {
      throw error;
    }

    let signedAudioUrl = "";
    if (data.audio_url) {
      const { data: signed } = await supabase.storage.from("rant-audio").createSignedUrl(data.audio_url, 60 * 30);
      signedAudioUrl = signed?.signedUrl || "";
    }

    return NextResponse.json({ entry: { ...data, signedAudioUrl } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not load entry.";
    return NextResponse.json({ error: message }, { status: 404 });
  }
}
