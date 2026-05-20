// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.

/**
 * Common HTML rel attribute values.
 * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Attributes/rel
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export const HttpLinkRelType = {
	/**
	 * Alternate representation of the current document.
	 */
	alternate: "alternate",

	/**
	 * Author of the current document or article.
	 */
	author: "author",

	/**
	 * Permalink for the nearest ancestor section.
	 */
	bookmark: "bookmark",

	/**
	 * Preferred URL for the current document.
	 */
	canonical: "canonical",

	/**
	 * Compression dictionary for future downloads.
	 */
	compressionDictionary: "compression-dictionary",

	/**
	 * Hint to perform DNS resolution in advance.
	 */
	dnsPrefetch: "dns-prefetch",

	/**
	 * The referenced document is external to the current site.
	 */
	external: "external",

	/**
	 * Allows render-blocking until essential parts are parsed.
	 */
	expect: "expect",

	/**
	 * Link to context-sensitive help.
	 */
	help: "help",

	/**
	 * Icon representing the current document.
	 */
	icon: "icon",

	/**
	 * Licensing information for the current document.
	 */
	license: "license",

	/**
	 * Web application manifest.
	 */
	manifest: "manifest",

	/**
	 * Indicates the current document represents the linked identity.
	 */
	me: "me",

	/**
	 * Pre-emptively fetch a module and optionally its dependencies.
	 */
	modulePreload: "modulepreload",

	/**
	 * The next document in a series.
	 */
	next: "next",

	/**
	 * The current document does not endorse the referenced document.
	 */
	nofollow: "nofollow",

	/**
	 * Prevent access to the originating browsing context.
	 */
	noopener: "noopener",

	/**
	 * Suppress the Referer header and implies noopener.
	 */
	noreferrer: "noreferrer",

	/**
	 * Allow access to the originating browsing context.
	 */
	opener: "opener",

	/**
	 * Address of the pingback server for the current document.
	 */
	pingback: "pingback",

	/**
	 * Hint to connect to the target origin in advance.
	 */
	preconnect: "preconnect",

	/**
	 * Hint to fetch and cache a likely next resource.
	 */
	prefetch: "prefetch",

	/**
	 * Hint to fetch and cache a resource for the current navigation.
	 */
	preload: "preload",

	/**
	 * Deprecated hint to fetch and process a target in advance.
	 */
	prerender: "prerender",

	/**
	 * The previous document in a series.
	 */
	prev: "prev",

	/**
	 * Privacy policy for the current document.
	 */
	privacyPolicy: "privacy-policy",

	/**
	 * Search resource for the current document or related resources.
	 */
	search: "search",

	/**
	 * External stylesheet for the current document.
	 */
	stylesheet: "stylesheet",

	/**
	 * Tag applying to the current document.
	 */
	tag: "tag",

	/**
	 * Terms of service for the current document.
	 */
	termsOfService: "terms-of-service"
} as const;

/**
 * Common HTML rel attribute values.
 */
export type HttpLinkRelType = (typeof HttpLinkRelType)[keyof typeof HttpLinkRelType];
