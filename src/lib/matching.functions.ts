import { createServerFn } from "@tanstack/react-start";
import { createOpenAI } from "@ai-sdk/openai";
import { streamText, Output } from "ai";
import { z } from "zod";

import { createLovableAiGatewayRunIdFetch } from "./ai-gateway.server";
import { freelances } from "./mock-data";

const BriefInput = z.object({
  brief: z.string().min(20),
  category: z.string(),
  budget: z.string(),
  duration: z.string(),
  candidateIds: z.array(z.string()).nullable().default(null),
});

const MatchSchema = z.object({
  synthese: z.string(),
  competences: z.array(z.string()),
  recommandations: z.array(
    z.object({
      id: z.string(),
      score: z.number(),
      justification: z.string(),
      point_de_vigilance: z.string(),
    }),
  ),
});

export type MatchResult = z.infer<typeof MatchSchema>;

export const recommendFreelances = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => BriefInput.parse(input))
  .handler(async ({ data }): Promise<MatchResult> => {
    const key = process.env["LOVABLE_API_KEY"];
    if (!key) throw new Error("Configuration IA manquante.");

    const runIdFetch = createLovableAiGatewayRunIdFetch();
    const lovable = createOpenAI({
      baseURL: "https://ai.gateway.lovable.dev/v1",
      apiKey: key,
      headers: { "Lovable-API-Key": key, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
      fetch: runIdFetch.fetch,
    });

    const pool = data.candidateIds?.length
      ? freelances.filter((f) => data.candidateIds!.includes(f.id))
      : freelances;

    const roster = pool.map((f) => ({
      id: f.id,
      nom: f.name,
      titre: f.title,
      ville: f.city,
      disponible: f.available,
      tjm: f.rate,
      note: f.rating,
      missions: f.missions,
      competences: f.skills,
      bio: f.bio,
      realisations: f.portfolio.map((p) => `${p.title} (${p.client}, ${p.year}) — ${p.result}`),
    }));

    const result = streamText({
      model: lovable.responses("openai/gpt-6-astra"),
      output: Output.object({ schema: MatchSchema }),
      system:
        "Tu es le moteur de matching de Nodale, une plateforme française de mise en relation entre entreprises et développeurs freelances. " +
        "Tu choisis uniquement des freelances présents dans la liste fournie, en utilisant leur identifiant exact. " +
        "Classe au maximum 4 profils du plus pertinent au moins pertinent, score de 0 à 100. " +
        "Sois concret : compétences, expérience, disponibilité, TJM face au budget. Réponds en français, sans superlatifs creux. " +
        "La synthèse fait 2 phrases maximum ; chaque justification 1 à 2 phrases ; le point de vigilance est court et honnête.",
      prompt: [
        `Besoin technique : ${data.brief}`,
        `Catégorie : ${data.category}`,
        `Budget indicatif : ${data.budget || "non précisé"}`,
        `Durée souhaitée : ${data.duration || "non précisée"}`,
        `Freelances disponibles (JSON) : ${JSON.stringify(roster)}`,
      ].join("\n"),
      providerOptions: {
        openai: {
          forceReasoning: true,
          reasoningEffort: "low",
          reasoningSummary: "auto",
          store: false,
          include: ["reasoning.encrypted_content"],
        },
      },
    });

    return await result.output;
  });
