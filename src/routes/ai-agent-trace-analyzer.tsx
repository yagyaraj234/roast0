import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

import { Logo } from "../components/Logo";
import { monoLabel, primaryButton } from "../components/ui";

const title = "AI Agent Cost & Risk Analyzer | Helix";
const description =
	"Helix analyzes AI agent traces for duplicate model calls, prompt bloat, tool loops, failed steps, and exposed credentials, then shows what to fix.";

const faqs = [
	{
		question: "What does an AI agent trace analyzer find?",
		answer:
			"Helix checks agent traces for duplicate LLM calls, bloated context, repeated tools, failed steps, exposed credentials, PII, and insecure URLs.",
	},
	{
		question: "How does Helix calculate agent cost waste?",
		answer:
			"Helix uses measured token counts when the trace provides them and clearly labels estimates when usage data is missing. It flags duplicate calls and repeated prompt bloat as avoidable waste.",
	},
	{
		question: "Does Helix store secrets from an uploaded trace?",
		answer:
			"No. Helix detects and redacts supported secret patterns before the trace reaches storage, then reports the matching rule without preserving the secret value.",
	},
] as const;

const structuredData = {
	"@context": "https://schema.org",
	"@graph": [
		{
			"@type": "WebApplication",
			name: "Helix",
			description,
			applicationCategory: "DeveloperApplication",
			operatingSystem: "Web",
			featureList: [
				"AI agent trace normalization",
				"Token cost and waste analysis",
				"Reliability and tool-loop findings",
				"Secret redaction before storage",
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
			{ property: "og:site_name", content: "Helix" },
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
		<div className="min-h-screen bg-paper">
			<script type="application/ld+json">
				{JSON.stringify(structuredData)}
			</script>
			<header className="border-b border-line bg-white/85 backdrop-blur">
				<div className="mx-auto flex h-16 max-w-[850px] items-center justify-between px-6">
					<Logo />
					<Link
						className="inline-flex items-center gap-1.5 text-sm font-medium text-neutral-600 transition-colors duration-150 hover:text-accent"
						to="/"
					>
						Home <ArrowRight size={15} aria-hidden="true" />
					</Link>
				</div>
			</header>
			<main className="mx-auto max-w-[850px] px-6 py-10 sm:py-16">
				<article className="rounded-2xl border border-line bg-white p-6 shadow-sm sm:p-10">
					<header>
						<p className={`${monoLabel} text-accent`}>
							AI AGENT COST &amp; RISK
						</p>
						<h1 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-ink sm:text-4xl">
							AI agent trace analysis for cost, reliability, and security
						</h1>
					</header>

					<section className="mt-9">
						<h2 className="text-sm font-semibold uppercase tracking-wide text-ink">
							What is Helix?
						</h2>
						<p className="mt-2 leading-relaxed text-neutral-700">
							Helix scans an AI agent trace to find duplicate model calls,
							bloated prompts, tool loops, failed steps, and exposed
							credentials. It estimates avoidable LLM spend, redacts supported
							secrets before storage, then returns a 0–100 score and a shareable
							report.
						</p>
					</section>

					<section className="mt-8">
						<h2 className="text-sm font-semibold uppercase tracking-wide text-ink">
							What does Helix check in an agent trace?
						</h2>
						<ol className="mt-3 grid gap-3">
							<li className="rounded-xl border border-line bg-surface-alt/50 px-4 py-3.5">
								<strong className="text-sm text-ink">Cost</strong>
								<p className="mt-0.5 text-sm text-neutral-600">
									Duplicate LLM calls, repeated prompt bloat, and oversized
									context.
								</p>
							</li>
							<li className="rounded-xl border border-line bg-surface-alt/50 px-4 py-3.5">
								<strong className="text-sm text-ink">Reliability</strong>
								<p className="mt-0.5 text-sm text-neutral-600">
									Repeated tool loops and traces that end in an error.
								</p>
							</li>
							<li className="rounded-xl border border-line bg-surface-alt/50 px-4 py-3.5">
								<strong className="text-sm text-ink">Security</strong>
								<p className="mt-0.5 text-sm text-neutral-600">
									Exposed credentials, PII, and insecure URLs.
								</p>
							</li>
						</ol>
					</section>

					<section className="mt-8">
						<h2 className="text-sm font-semibold uppercase tracking-wide text-ink">
							AI agent trace analyzer FAQ
						</h2>
						<div className="mt-3 grid gap-5">
							{faqs.map(({ answer, question }) => (
								<div key={question}>
									<h3 className="text-sm font-semibold text-ink">{question}</h3>
									<p className="mt-1 text-sm leading-relaxed text-neutral-600">
										{answer}
									</p>
								</div>
							))}
						</div>
					</section>

					<section className="mt-8">
						<h2 className="text-sm font-semibold uppercase tracking-wide text-ink">
							Sources and methodology
						</h2>
						<ul className="mt-3 grid gap-2 text-sm text-neutral-600">
							<li>
								<a
									href="https://openai.github.io/openai-agents-js/guides/tracing/"
									className="text-accent underline underline-offset-2 transition-colors duration-150 hover:text-blue-700"
								>
									OpenAI Agents SDK tracing guide
								</a>{" "}
								for trace spans, tool calls, and sensitive trace data.
							</li>
							<li>
								<a
									href="https://genai.owasp.org/resource/owasp-top-10-for-agentic-applications-for-2026/"
									className="text-accent underline underline-offset-2 transition-colors duration-150 hover:text-blue-700"
								>
									OWASP Top 10 for Agentic Applications 2026
								</a>{" "}
								for agent security risk context.
							</li>
							<li>
								<a
									href="https://github.com/yagyaraj234/Helix"
									className="text-accent underline underline-offset-2 transition-colors duration-150 hover:text-blue-700"
								>
									Helix source code
								</a>{" "}
								for the implemented checks and scoring behavior.
							</li>
						</ul>
					</section>

					<Link className={`${primaryButton} mt-8`} to="/app/new">
						Analyze an agent trace <ArrowRight size={16} aria-hidden="true" />
					</Link>
				</article>
			</main>
		</div>
	);
}
