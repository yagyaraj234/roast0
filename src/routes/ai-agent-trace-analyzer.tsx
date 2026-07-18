import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

import { Logo } from "../components/Logo";

const title = "AI Agent Trace Analyzer for Security & Cost | Flint";
const description =
	"Flint is security scanning for AI agent traces: it catches leaked secrets, unsafe tool calls, loops, failures, and cost waste before production.";

const faqs = [
	{
		question: "What does an AI agent trace analyzer find?",
		answer:
			"Flint checks agent traces for leaked secrets and PII, repeated tool calls, error tails, duplicate LLM calls, bloated context, and token cost waste.",
	},
	{
		question: "Does Flint store secrets from an uploaded trace?",
		answer:
			"No. Flint detects and redacts supported secret patterns before the trace reaches storage, then reports the matching rule without preserving the secret value.",
	},
	{
		question: "How does Flint calculate agent cost waste?",
		answer:
			"Flint uses measured token counts when the trace provides them and clearly labels estimates when usage data is missing. It flags duplicate calls and repeated prompt bloat as avoidable waste.",
	},
] as const;

const structuredData = {
	"@context": "https://schema.org",
	"@graph": [
		{
			"@type": "WebApplication",
			name: "Flint",
			description,
			applicationCategory: "DeveloperApplication",
			operatingSystem: "Web",
			featureList: [
				"AI agent trace normalization",
				"Secret redaction before storage",
				"Reliability and tool-loop findings",
				"Token cost and waste analysis",
			],
		},
		{
			"@type": "FAQPage",
			mainEntity: faqs.map(({ answer, question }) => ({
				"@type": "Question",
				name: question,
				acceptedAnswer: { "@type": "Answer", text: answer },
			})),
		},
	],
};

export const Route = createFileRoute("/ai-agent-trace-analyzer")({
	head: () => ({
		meta: [
			{ title },
			{ name: "description", content: description },
			{ property: "og:type", content: "website" },
			{ property: "og:site_name", content: "Flint" },
			{ property: "og:title", content: title },
			{ property: "og:description", content: description },
			{ name: "twitter:card", content: "summary" },
			{ name: "twitter:title", content: title },
			{ name: "twitter:description", content: description },
		],
	}),
	component: AgentTraceAnalyzerPage,
});

function AgentTraceAnalyzerPage() {
	return (
		<div className="public-page">
			<script type="application/ld+json">
				{JSON.stringify(structuredData)}
			</script>
			<header className="public-topbar">
				<div>
					<Logo inverse />
					<a href="/">
						Home <ArrowRight aria-hidden="true" />
					</a>
				</div>
			</header>
			<main className="public-page__main">
				<article className="public-card">
					<header className="public-card__topline">
						<div>
							<p className="mono-label">AI AGENT OBSERVABILITY</p>
							<h1 className="public-card__title">
								AI agent trace analyzer for security, reliability, and cost
							</h1>
						</div>
					</header>

					<section className="public-findings">
						<div className="card-section-heading">
							<h2>What is Flint?</h2>
						</div>
						<p>
							Flint scans an AI agent trace to find leaked secrets, repeated
							tool calls, duplicate LLM calls, bloated context, error tails, and
							token cost waste. It redacts supported secrets before storage,
							then returns a 0–100 health score and a shareable report.
						</p>
					</section>

					<section className="public-findings">
						<div className="card-section-heading">
							<h2>What does Flint check in an agent trace?</h2>
						</div>
						<ol>
							<li>
								<div>
									<strong>Security</strong>
									<p>Leaked credentials, PII, and insecure URLs.</p>
								</div>
							</li>
							<li>
								<div>
									<strong>Reliability</strong>
									<p>Repeated tool loops and traces that end in an error.</p>
								</div>
							</li>
							<li>
								<div>
									<strong>Cost</strong>
									<p>
										Duplicate LLM calls, repeated prompt bloat, and oversized
										context.
									</p>
								</div>
							</li>
						</ol>
					</section>

					<section className="public-findings">
						<div className="card-section-heading">
							<h2>AI agent trace analyzer FAQ</h2>
						</div>
						{faqs.map(({ answer, question }) => (
							<div key={question}>
								<h3>{question}</h3>
								<p>{answer}</p>
							</div>
						))}
					</section>

					<section className="public-findings">
						<div className="card-section-heading">
							<h2>Sources and methodology</h2>
						</div>
						<ul>
							<li>
								<a href="https://openai.github.io/openai-agents-js/guides/tracing/">
									OpenAI Agents SDK tracing guide
								</a>{" "}
								for trace spans, tool calls, and sensitive trace data.
							</li>
							<li>
								<a href="https://genai.owasp.org/resource/owasp-top-10-for-agentic-applications-for-2026/">
									OWASP Top 10 for Agentic Applications 2026
								</a>{" "}
								for agent security risk context.
							</li>
							<li>
								<a href="https://github.com/yagyaraj234/roast0">
									Flint source code
								</a>{" "}
								for the implemented checks and scoring behavior.
							</li>
						</ul>
					</section>

					<a className="button" href="/app/new">
						Analyze an agent trace <ArrowRight aria-hidden="true" />
					</a>
				</article>
			</main>
		</div>
	);
}
