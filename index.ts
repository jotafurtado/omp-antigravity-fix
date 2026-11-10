/**
 * OMP Antigravity Fix Extension
 *
 * Re-enables the Google Antigravity provider paused in omp 18.18.4 (#18622).
 * omp lifts the pause for any provider id an extension registers its own OAuth
 * handler under (`providerPauseReason` in pi-ai's oauth registry), so this
 * extension registers refresh/api-key handling for `google-antigravity`.
 * /login keeps using omp's built-in Antigravity flow.
 *
 * USE AT YOUR OWN RISK: Google may restrict accounts that use Antigravity
 * outside its own apps.
 */

import { Database } from "bun:sqlite";
import { authPolicyFor } from "@oh-my-pi/pi-catalog/compat/auth";
import { getAgentDbPath } from "@oh-my-pi/pi-utils";

const PROVIDER = "google-antigravity";
const TOKEN_URL = "https://oauth2.googleapis.com/token";
const EXPIRY_SKEW_MS = 300_000;
// Fallback key that only marks the provider as authenticated while omp picks the
// session model. Stored OAuth credentials take precedence over it once reloaded.
const STARTUP_AUTH_MARKER = "omp-antigravity-fix:stored-login";

interface PolicyValue {
	value: string;
	encoding?: string;
}

function decode(field: unknown): string | undefined {
	if (!field || typeof field !== "object" || !("value" in field) || typeof field.value !== "string") return undefined;
	const { value, encoding } = field as PolicyValue;
	return encoding === "base64" ? atob(value) : value;
}

// The OAuth client comes from omp's own auth rules, so this repo carries no copy of it.
function oauthClient(): { clientId: string; clientSecret: string } {
	const login = authPolicyFor(PROVIDER)?.login;
	const clientId = login && "clientId" in login ? decode(login.clientId) : undefined;
	const clientSecret = login && "clientSecret" in login ? decode(login.clientSecret) : undefined;
	if (!clientId || !clientSecret) {
		throw new Error("This omp version has no Google Antigravity OAuth client; update omp-antigravity-fix.");
	}
	return { clientId, clientSecret };
}

interface Credentials {
	access: string;
	refresh: string;
	expires: number;
	projectId?: string;
	[key: string]: unknown;
}

async function refreshToken(credentials: Credentials): Promise<Credentials> {
	if (!credentials.projectId) {
		throw new Error("Antigravity credential has no projectId; run /login google-antigravity again.");
	}
	const { clientId, clientSecret } = oauthClient();
	const response = await fetch(TOKEN_URL, {
		method: "POST",
		headers: { "Content-Type": "application/x-www-form-urlencoded" },
		body: new URLSearchParams({
			grant_type: "refresh_token",
			refresh_token: credentials.refresh,
			client_id: clientId,
			client_secret: clientSecret,
		}),
	});
	if (!response.ok) {
		throw new Error(`Antigravity token refresh failed: HTTP ${response.status} ${await response.text()}`);
	}
	const body = (await response.json()) as { access_token: string; refresh_token?: string; expires_in: number };
	return {
		...credentials,
		access: body.access_token,
		refresh: body.refresh_token ?? credentials.refresh,
		expires: Date.now() + body.expires_in * 1000 - EXPIRY_SKEW_MS,
	};
}

// Mirrors omp's `api-key-format "structured"` encoding (getOAuthApiKey).
function getApiKey(c: Credentials): string {
	return JSON.stringify({
		apiEndpoint: c.apiEndpoint,
		token: c.access,
		enterpriseUrl: c.enterpriseUrl,
		projectId: c.projectId,
		refreshToken: c.refresh,
		expiresAt: c.expires,
		email: c.email,
		accountId: c.accountId,
	});
}

// omp resolves the session model (default role, resumed session, subagent roles)
// before `session_start`, while its auth cache still hides the paused provider's
// stored login. Without some auth for `google-antigravity` at that point, omp
// reports the default model as unavailable and falls back to another provider.
function hasStoredLogin(): boolean {
	let db: Database;
	try {
		db = new Database(getAgentDbPath(), { readonly: true });
	} catch {
		return false;
	}
	try {
		const row = db
			.query("SELECT 1 FROM auth_credentials WHERE provider = ? AND disabled_cause IS NULL LIMIT 1")
			.get(PROVIDER);
		return row !== null;
	} finally {
		db.close();
	}
}

// Minimal slice of omp's ExtensionAPI used here; the extension ships without omp's types.
interface ExtensionApi {
	registerProvider(name: string, config: { oauth: Record<string, unknown>; apiKey?: string }): void;
	on(
		event: "session_start",
		handler: (event: unknown, ctx: { modelRegistry: { authStorage: { reload(): Promise<void> } } }) => Promise<void>,
	): void;
}

export default function (omp: ExtensionApi) {
	omp.registerProvider(PROVIDER, {
		oauth: {
			name: "Google Antigravity (use at your own risk)",
			// omp resolves the built-in definition before extension ones, so /login
			// always runs the built-in Antigravity flow and never reaches this.
			login: async () => {
				throw new Error("Use /login google-antigravity; omp's built-in flow handles sign-in.");
			},
			refreshToken,
			getApiKey,
		},
		// With `oauth` set, omp installs this as a fallback key, consulted only after
		// stored OAuth credentials. Registered only when a login exists, so the
		// provider never looks authenticated to someone who never signed in.
		...(hasStoredLogin() ? { apiKey: STARTUP_AUTH_MARKER } : {}),
	});

	// omp loads stored credentials before extensions register, and drops rows of
	// paused providers on load. Reload once the pause is lifted so an existing
	// Antigravity login is usable without signing in again.
	omp.on("session_start", async (_event, ctx) => {
		await ctx.modelRegistry.authStorage.reload();
	});
}
