import { registerOTel } from "@vercel/otel"
import { LangfuseExporter } from "langfuse-vercel"

// Next.js loads this file once at startup. It wires the AI SDK's
// experimental_telemetry spans (emitted from app/api/qualify/chat) into
// Langfuse Cloud, so every text-mode qualification chat shows up as a
// trace with the full prompt, response, and tool calls.
//
// Keys come from env (LANGFUSE_PUBLIC_KEY / LANGFUSE_SECRET_KEY /
// LANGFUSE_BASEURL). Without them the exporter no-ops gracefully.
export function register() {
  registerOTel({
    serviceName: "samwise-landing",
    traceExporter: new LangfuseExporter(),
  })
}
