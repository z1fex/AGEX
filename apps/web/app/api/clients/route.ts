import { NextRequest } from "next/server";
import path from "node:path";
import { listClients, createClientFiles, buildClientContext } from "@agency/execution-engine";

const VAULT_ROOT = path.resolve(process.cwd(), "../../vault");

/**
 * GET /api/clients — list all clients from vault
 */
export async function GET() {
  const clients = listClients(VAULT_ROOT);
  return Response.json({ clients });
}

/**
 * POST /api/clients — create a new client (write vault files)
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { slug, profile, brandVoice, icp, goals, competitors } = body;

    if (!slug || !profile) {
      return Response.json(
        { error: "slug and profile are required" },
        { status: 400 }
      );
    }

    createClientFiles(slug, VAULT_ROOT, {
      profile,
      brandVoice: brandVoice || "",
      icp: icp || "",
      goals: goals || "",
      competitors: competitors || "",
    });

    return Response.json({ success: true, slug });
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
