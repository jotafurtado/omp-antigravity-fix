/**
 * OMP Antigravity Fix Extension
 *
 * Fixes false HTTP 429 RESOURCE_EXHAUSTED errors on Google Antigravity
 * (Cloud Code Assist) by aligning the request envelope with the official
 * Google Antigravity client (`antigravity/hub`), which does not send `requestType: "agent"`.
 *
 * This extension does NOT modify, sanitize, or tamper with system prompts
 * or conventions in any way. All prompts remain 100% untouched.
 */

export default function (omp: any) {
	omp.on("before_provider_request", async (event: any) => {
		if (event?.payload && typeof event.payload === "object") {
			const payload = event.payload as Record<string, unknown>;
			// Omit requestType when targeting Google Antigravity to match official client
			if (payload.userAgent === "antigravity" && "requestType" in payload) {
				delete payload.requestType;
			}
		}
		return event.payload;
	});
}
