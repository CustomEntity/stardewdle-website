// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}

	// NitroPay / NitroAds globals (injected by s.nitropay.com/ads-2550.js)
	interface Window {
		nitroAds?: {
			loaded?: boolean;
			createAd: (id: string, options: Record<string, unknown>) => Promise<unknown>;
			addUserToken: (token: string) => void;
			queue: unknown[];
		};
		__cmp?: (command: string, ...args: unknown[]) => void;
		__tcfapi?: unknown;
	}
}

export {};
