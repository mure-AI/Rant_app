import { beforeEach, describe, expect, it, vi } from "vitest";

const mockGetUser = vi.fn();
const mockInsert = vi.fn();

vi.mock("@/lib/supabaseServer", () => ({
  createSupabaseServerClient: () => ({
    auth: {
      getUser: mockGetUser
    },
    from: () => ({
      insert: mockInsert
    })
  })
}));

import { POST } from "@/app/api/entries/route";

function makeRequest(body: unknown) {
  return new Request("http://localhost/api/entries", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });
}

beforeEach(() => {
  mockGetUser.mockReset();
  mockInsert.mockReset();
});

describe("POST /api/entries", () => {
  it("stops at auth when no user is present", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });

    const response = await POST(makeRequest({}));
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe("Log in to save this entry.");
    expect(mockInsert).not.toHaveBeenCalled();
  });

  it("fails at validation before any database write", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });

    const response = await POST(
      makeRequest({
        inputType: "text",
        analysis: {
          emotion: "stressed"
        }
      })
    );
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain("Required");
    expect(mockInsert).not.toHaveBeenCalled();
  });

  it("inserts text entries with original text and no transcript", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    mockInsert.mockReturnValue({
      select: () => ({
        single: async () => ({ data: { id: "entry-1" }, error: null })
      })
    });

    const response = await POST(
      makeRequest({
        inputType: "text",
        originalText: "I am behind on everything and feel stuck.",
        analysis: {
          emotion: "overwhelmed",
          problemType: "overwhelm",
          summary: "A lot is competing for attention.",
          likelyProblem: "Too many open loops.",
          whyItMightBeHappening: "Everything feels urgent at once.",
          nextSteps: ["Write it down", "Pick one task"],
          reflectiveQuestion: "This is what I think is going on. Am I right?",
          suggestedResourceType: "tool",
          safetyLevel: "normal"
        }
      })
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.id).toBe("entry-1");
    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        input_type: "text",
        original_text: "I am behind on everything and feel stuck.",
        transcript: null,
        audio_url: null
      })
    );
  });

  it("inserts voice entries with transcript and audio path", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    mockInsert.mockReturnValue({
      select: () => ({
        single: async () => ({ data: { id: "entry-2" }, error: null })
      })
    });

    const response = await POST(
      makeRequest({
        inputType: "voice",
        transcript: "I keep putting things off.",
        audioUrl: "user-1/audio-1.webm",
        analysis: {
          emotion: "stressed",
          problemType: "procrastination",
          summary: "You are delaying something important.",
          likelyProblem: "The first step feels heavy.",
          whyItMightBeHappening: "Starting feels harder than staying busy.",
          nextSteps: ["Choose one step", "Set a timer"],
          reflectiveQuestion: "This is what I think is going on. Am I right?",
          suggestedResourceType: "tool",
          safetyLevel: "normal"
        }
      })
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.id).toBe("entry-2");
    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        input_type: "voice",
        original_text: null,
        transcript: "I keep putting things off.",
        audio_url: "user-1/audio-1.webm"
      })
    );
  });
});