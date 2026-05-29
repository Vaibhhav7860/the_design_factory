import { isDatabaseHealthy } from "@/lib/db/mongoose";

export async function GET() {
  const start = Date.now();
  let dbOk = false;
  try {
    dbOk = await Promise.race([
      isDatabaseHealthy(),
      new Promise((resolve) => setTimeout(() => resolve(false), 5000)),
    ]);
  } catch {
    dbOk = false;
  }
  const elapsedMs = Date.now() - start;

  if (!dbOk) {
    return Response.json(
      {
        status: "unhealthy",
        dependency: "mongodb",
        description: "Database health check did not return success within 5s",
        elapsedMs,
      },
      { status: 503 }
    );
  }

  return Response.json({ status: "ok", elapsedMs });
}
