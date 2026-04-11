import path from "node:path";
import { getCostSummary } from "@agency/execution-engine";

const DATA_DIR = path.resolve(process.cwd(), "../../data");

export async function GET() {
  const summary = getCostSummary(DATA_DIR, 30);
  return Response.json(summary);
}
