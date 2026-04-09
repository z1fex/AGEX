import { NextRequest } from "next/server";
import path from "node:path";
import { listOutputs } from "@agency/execution-engine";

const OUTPUT_ROOT = path.resolve(process.cwd(), "../../output");

/**
 * GET /api/outputs — list all saved outputs
 */
export async function GET(req: NextRequest) {
  const outputs = listOutputs(OUTPUT_ROOT);
  return Response.json({ total: outputs.length, outputs });
}
