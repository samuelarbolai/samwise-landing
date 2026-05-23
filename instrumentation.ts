import { LangfuseSpanProcessor } from "@langfuse/otel"
import { NodeTracerProvider } from "@opentelemetry/sdk-trace-node"

// Next.js auto-loads this file on startup. It wires the AI SDK's
// experimental_telemetry spans (emitted from app/api/qualify/chat) into
// Langfuse Cloud, so every text-mode qualification chat shows up as a
// trace with full prompt, response, and tool calls.
//
// Why manual NodeTracerProvider instead of @vercel/otel: the canonical
// Langfuse + Next.js docs explicitly call this out — @vercel/otel does
// not yet support OpenTelemetry JS SDK v2, which @langfuse/otel needs.
//
// langfuseSpanProcessor is exported so route handlers can call
// forceFlush() in Next.js' `after()` callback. Without that, serverless
// functions terminate before the batch processor exports spans and
// traces silently disappear.
//
// Keys come from env: LANGFUSE_PUBLIC_KEY / LANGFUSE_SECRET_KEY /
// LANGFUSE_BASE_URL. We pass them explicitly to remove any ambiguity
// about env-loading order in dev vs Vercel.
export const langfuseSpanProcessor = new LangfuseSpanProcessor({
  publicKey: process.env.LANGFUSE_PUBLIC_KEY,
  secretKey: process.env.LANGFUSE_SECRET_KEY,
  baseUrl: process.env.LANGFUSE_BASE_URL,
})

const tracerProvider = new NodeTracerProvider({
  spanProcessors: [langfuseSpanProcessor],
})

tracerProvider.register()
