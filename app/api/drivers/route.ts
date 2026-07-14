import { NextResponse } from "next/server";

const API_VERSION = "1.0.0";
const startTime = Date.now();

/**
 * Shared CORS headers applied to all responses from this route.
 */
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

/**
 * Sample driver data kept for testing and fallback purposes.
 * This is NOT production data -- the real data is fetched from
 * Google Apps Script via JSONP on the frontend.
 */
const SAMPLE_DATA = [
  ["deal date", "weekend", "hub", "analyst", "driver", "status", "modal", "driver id", "telefone", "data treinamento"],
  ["2026-07-01", "W27", "HUB A", "Leandro", "João Silva", "Ativo", "Moto", "123", "11999999999", "2026-07-01"],
  ["2026-07-01", "W27", "HUB B", "Leandro", "Maria Souza", "Pendente", "Van", "456", "11988888888", ""],
];

/**
 * Build a JSON response with CORS headers and request timing.
 */
function buildResponse(body: Record<string, unknown>, status = 200): NextResponse {
  return NextResponse.json(body, {
    status,
    headers: corsHeaders,
  });
}

/**
 * Handle CORS preflight requests.
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}

/**
 * GET /api/drivers
 *
 * Returns a health-check payload with system status and sample driver data.
 */
export async function GET() {
  const requestStart = performance.now();

  const uptimeMs = Date.now() - startTime;
  const uptimeSeconds = Math.floor(uptimeMs / 1000);

  const response = buildResponse({
    sucesso: true,
    status: "healthy",
    health: {
      uptime_seconds: uptimeSeconds,
      timestamp: new Date().toISOString(),
      version: API_VERSION,
    },
    amostra: true,
    dados: SAMPLE_DATA,
  });

  const durationMs = (performance.now() - requestStart).toFixed(2);
  console.log(`[GET /api/drivers] ${durationMs}ms`);

  return response;
}

/**
 * POST /api/drivers
 *
 * Reserved for future use. Currently returns a 501 Not Implemented response.
 */
export async function POST() {
  const requestStart = performance.now();

  const response = buildResponse(
    {
      sucesso: false,
      erro: "POST /api/drivers is not implemented yet.",
      version: API_VERSION,
    },
    501
  );

  const durationMs = (performance.now() - requestStart).toFixed(2);
  console.log(`[POST /api/drivers] 501 Not Implemented - ${durationMs}ms`);

  return response;
}
