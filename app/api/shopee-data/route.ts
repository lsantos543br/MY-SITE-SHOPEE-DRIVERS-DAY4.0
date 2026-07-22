import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import key from "../../../google-key.json";

export const runtime = "nodejs";

const APPS_SCRIPT_LIST_URL = "https://script.google.com/a/macros/shopee.com/s/AKfycbzzeABmBcN78oJI9sWOsMqEG2Nr5RL2Roj9rmJQhPV7t2Q5RNr5OEd1ec2VniQXthmI/exec";
const APPS_SCRIPT_SAVE_URL = "https://script.google.com/a/macros/shopee.com/s/AKfycbxvAn4kvKNlkCH5klqipLNJ7Q8pEEvGyHxo5R0fDWFm3Jh1pSJyZzM8d-L94-N5cASR/exec";

const isDev = process.env.NODE_ENV !== "production";
const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_SPREADSHEET_ID || process.env.SPREADSHEET_ID || "1qMStUrKKXCJIGT7J5f7PpJCbsqIueupLfvNncb24vaU";
const MOTORISTAS_RANGE = process.env.GOOGLE_SHEETS_MOTORISTAS_RANGE || "Base automatica!A1:L1000";
const METRICAS_RANGE = process.env.GOOGLE_SHEETS_METRICAS_RANGE || "Atendimentos DD.40!A1:Z1000";

async function getSheetsService() {
  const auth = new google.auth.GoogleAuth({
    credentials: key as unknown as Record<string, unknown>,
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
  });
  return google.sheets({ version: "v4", auth });
}

function normalizeSheetTitle(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/\s+/g, "")
    .toLowerCase();
}

function quoteSheetName(sheetName: string) {
  if (/[^A-Za-z0-9_ ]/.test(sheetName) || sheetName.includes(" ")) {
    return `'${sheetName.replace(/'/g, "''")}'`;
  }
  return sheetName;
}

async function getSheetTitles() {
  const sheets = await getSheetsService();
  const response = await sheets.spreadsheets.get({
    spreadsheetId: SPREADSHEET_ID,
    fields: "sheets.properties.title",
  });
  return (response.data.sheets || [])
    .map((sheet) => sheet.properties?.title)
    .filter((title): title is string => Boolean(title));
}

function findMatchingSheetTitle(expected: string, titles: string[]) {
  const exact = titles.find((title) => title === expected);
  if (exact) return exact;

  const normalizedExpected = normalizeSheetTitle(expected);
  return titles.find((title) => normalizeSheetTitle(title) === normalizedExpected);
}

function formatRangeWithSheet(title: string, address: string) {
  return `${quoteSheetName(title)}${address}`;
}

async function resolveRange(range: string) {
  const [sheetPart, addressPart] = range.split("!");
  if (!addressPart) {
    return range;
  }

  const sheetTitles = await getSheetTitles();
  const candidate = sheetPart.replace(/^['"]|['"]$/g, "");
  const match = findMatchingSheetTitle(candidate, sheetTitles);
  if (match) {
    return formatRangeWithSheet(match, `!${addressPart}`);
  }
  const normalizedCandidate = normalizeSheetTitle(candidate);
  const alternative = sheetTitles.find((title) => normalizeSheetTitle(title).includes(normalizedCandidate) || normalizedCandidate.includes(normalizeSheetTitle(title)));
  if (alternative) {
    console.warn("[shopee-data] resolveRange using alternative sheet title:", alternative, "for", candidate);
    return formatRangeWithSheet(alternative, `!${addressPart}`);
  }

  if (!sheetPart.includes(" ") && !sheetPart.includes("'")) {
    const fallbackAddress = addressPart.startsWith("!") ? addressPart : `!${addressPart}`;
    console.warn("[shopee-data] resolveRange falling back to plain address for sheetPart:", sheetPart);
    return `${quoteSheetName(sheetPart)}${fallbackAddress}`;
  }

  return range;
}

async function fetchSheetValues(range: string) {
  if (!SPREADSHEET_ID) {
    throw new Error("Faltando variável de ambiente GOOGLE_SHEETS_SPREADSHEET_ID.");
  }
  const sheets = await getSheetsService();
  const resolvedRange = await resolveRange(range);
  console.log("[shopee-data] fetchSheetValues range:", range, "resolvedRange:", resolvedRange);
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: resolvedRange,
  });
  return response.data.values || [];
}

const SAMPLE_LISTAR_MOTORISTAS = [
  [
    "deal date",
    "weekend",
    "hub",
    "analyst",
    "driver",
    "status",
    "modal",
    "driver id",
    "telefone",
    "data treinamento",
  ],
  [
    "2026-07-21",
    "Semana 29",
    "Hub Sul",
    "Analista Exemplo",
    "Driver 001",
    "First Trip Efetuada",
    "Modal A",
    "ID001",
    "(11) 99999-0001",
    "2026-07-20",
  ],
  [
    "2026-07-21",
    "Semana 29",
    "Hub Norte",
    "Analista Exemplo",
    "Driver 002",
    "Ag. First Trip",
    "Modal B",
    "ID002",
    "(11) 99999-0002",
    "",
  ],
];

const SAMPLE_BUSCAR_MEDIA_ATENDIMENTOS = [
  ["RANKING POR ANALISTA"],
  ["Posição", "Analista", "Total", "Col4", "Col5", "%Total", "Status", "Tempo"] ,
  ["1", "Analista Exemplo", "12", "", "", "80%", "Ativo", "00:45"],
  ["DETALHAMENTO POR SEMANA"],
  ["Semana", "Atend", "%Total", "", "Gap", "Status", "Análise"],
  ["Semana 29", "120", "100%", "", "-", "Ok", "Conforme"],
  ["RANKING POR HUB"],
  ["Posição", "Hub", "Total", "", "%Total", "Status", "Análise"],
  ["1", "Hub Sul", "70", "", "58%", "Ok", "Bom"],
];

type Payload = Record<string, string | number | boolean | null | undefined>;

function buildUrl(action: string, payload: Payload) {
  const params = new URLSearchParams();
  params.set("action", action);
  params.set("callback", "callback");
  params.set("_", String(Date.now()));

  Object.entries(payload || {}).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    params.set(key, String(value));
  });

  const baseUrl = action === "salvarTratamento" ? APPS_SCRIPT_SAVE_URL : APPS_SCRIPT_LIST_URL;
  return `${baseUrl}?${params.toString()}`;
}

function parseAppsScriptResponse(text: string) {
  const trimmed = text.trim();
  const callbackMatch = trimmed.match(/^[^(]*\((.*)\);?$/s);
  const payload = callbackMatch ? callbackMatch[1] : trimmed;
  try {
    return JSON.parse(payload);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Falha ao converter resposta do Apps Script em JSON: ${message}`);
  }
}

async function parseRequestBody(request: NextRequest) {
  if (request.method !== "POST") {
    return {};
  }

  const contentType = request.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    try {
      return await request.json();
    } catch {
      // continue to raw text fallback below
    }
  }

  try {
    const text = await request.text();
    if (!text) return {};

    try {
      return JSON.parse(text);
    } catch {
      // If incoming JSON was PowerShell-escaped like {\"action\":\"listarMotoristas\"}
      const unescaped = text.replace(/\\"/g, '"');
      try {
        return JSON.parse(unescaped);
      } catch {
        // fallback to form body parsing
        if (contentType.includes("application/x-www-form-urlencoded") || /^[^=&]+=[^=&]+/.test(text)) {
          return Object.fromEntries(new URLSearchParams(text));
        }
        return {};
      }
    }
  } catch {
    return {};
  }
}

async function handleShopeeDataRequest(req: NextRequest) {
  const body = await parseRequestBody(req);
  const urlParams = new URL(req.url).searchParams;
  const actionFromQuery = urlParams.get("action");
  const payloadFromQuery = urlParams.get("payload");
  const { action: actionBody, payload: payloadBody } = body as { action?: unknown; payload?: unknown };

  const action =
    typeof actionBody === "string" ? actionBody :
    typeof actionFromQuery === "string" ? actionFromQuery :
    undefined;

  let payload: Payload = {};
  if (typeof payloadBody === "object" && payloadBody !== null) {
    payload = payloadBody as Payload;
  } else if (payloadFromQuery) {
    try {
      payload = JSON.parse(payloadFromQuery) as Payload;
    } catch {
      payload = { raw: payloadFromQuery } as Payload;
    }
  }

  console.log("[shopee-data] method:", req.method, "content-type:", req.headers.get("content-type"), "body received:", body, "action:", action);

  const isLoadAction = typeof action === "string" && (action === "listarMotoristas" || action === "buscarMediaAtendimentos");

  if (!action || typeof action !== "string") {
    return NextResponse.json({ error: "Ação inválida." }, { status: 400 });
  }

  try {
    if (isLoadAction) {
      try {
        const range = action === "listarMotoristas" ? MOTORISTAS_RANGE : METRICAS_RANGE;
        const values = await fetchSheetValues(range);
        return NextResponse.json({ data: values });
      } catch (sheetError: unknown) {
        console.warn("[shopee-data] Falha ao ler diretamente do Google Sheets:", sheetError);
      }
    }

    const url = buildUrl(action, payload || {});
    const response = await fetch(url, { method: "GET" });
    const text = await response.text();
    const trimmed = String(text || "").trim();

    if (/^</.test(trimmed)) {
      console.warn("[shopee-data] Apps Script retornou HTML em vez de JSON/JSONP", trimmed.slice(0, 200));
      if (isLoadAction) {
        if (isDev) {
          return NextResponse.json({ data: action === "listarMotoristas" ? SAMPLE_LISTAR_MOTORISTAS : SAMPLE_BUSCAR_MEDIA_ATENDIMENTOS });
        }
        return NextResponse.json({ data: [] });
      }

      return NextResponse.json(
        { error: "Apps Script retornou HTML em vez de JSON/JSONP", details: trimmed.slice(0, 200) },
        { status: 502 }
      );
    }

    if (!response.ok) {
      const detailText = trimmed.slice(0, 200);
      console.error("[shopee-data] Apps Script devolveu status não OK", response.status, detailText);
      if (isLoadAction) {
        return NextResponse.json({ data: [] });
      }
      return NextResponse.json(
        { error: `Erro ao chamar Apps Script (${response.status})`, details: detailText },
        { status: 502 }
      );
    }

    const data = parseAppsScriptResponse(text);
    return NextResponse.json({ data });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[shopee-data]", error);

    if (isLoadAction) {
      if (isDev) {
        return NextResponse.json({ data: action === "listarMotoristas" ? SAMPLE_LISTAR_MOTORISTAS : SAMPLE_BUSCAR_MEDIA_ATENDIMENTOS });
      }
      return NextResponse.json({ data: [] });
    }

    return NextResponse.json(
      { error: message || "Erro interno ao processar dados do Apps Script." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  return handleShopeeDataRequest(req);
}

export async function GET(req: NextRequest) {
  return handleShopeeDataRequest(req);
}
