// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.

/**
 * Standard HTTP status codes.
 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export const HttpStatusCode = {
	/**
	 * Continue status code.
	 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/100
	 */
	continue: 100,

	/**
	 * Switching Protocols status code.
	 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/101
	 */
	switchingProtocols: 101,

	/**
	 * Processing status code.
	 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/102
	 */
	processing: 102,

	/**
	 * Early Hints status code.
	 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/103
	 */
	earlyHints: 103,

	/**
	 * OK status code.
	 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/200
	 */
	ok: 200,

	/**
	 * Created status code.
	 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/201
	 */
	created: 201,

	/**
	 * Accepted status code.
	 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/202
	 */
	accepted: 202,

	/**
	 * Non-Authoritative Information status code.
	 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/203
	 */
	nonAuthoritativeInformation: 203,

	/**
	 * No Content status code.
	 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/204
	 */
	noContent: 204,

	/**
	 * Reset Content status code.
	 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/205
	 */
	resetContent: 205,

	/**
	 * Partial Content status code.
	 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/206
	 */
	partialContent: 206,

	/**
	 * Multi-Status status code.
	 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/207
	 */
	multiStatus: 207,

	/**
	 * Already Reported status code.
	 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/208
	 */
	alreadyReported: 208,

	/**
	 * IM Used status code.
	 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/226
	 */
	imUsed: 226,

	/**
	 * Multiple Choices status code.
	 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/300
	 */
	multipleChoices: 300,

	/**
	 * Moved Permanently status code.
	 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/301
	 */
	movedPermanently: 301,

	/**
	 * Found status code.
	 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/302
	 */
	found: 302,

	/**
	 * See Other status code.
	 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/303
	 */
	seeOther: 303,

	/**
	 * Not Modified status code.
	 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/304
	 */
	notModified: 304,

	/**
	 * Use Proxy status code.
	 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/305
	 */
	useProxy: 305,

	/**
	 * Temporary Redirect status code.
	 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/307
	 */
	temporaryRedirect: 307,

	/**
	 * Permanent Redirect status code.
	 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/308
	 */
	permanentRedirect: 308,

	/**
	 * Bad Request status code.
	 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/400
	 */
	badRequest: 400,

	/**
	 * Unauthorized status code.
	 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/401
	 */
	unauthorized: 401,

	/**
	 * Payment Required status code.
	 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/402
	 */
	paymentRequired: 402,

	/**
	 * Forbidden status code.
	 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/403
	 */
	forbidden: 403,

	/**
	 * Not Found status code.
	 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/404
	 */
	notFound: 404,

	/**
	 * Method Not Allowed status code.
	 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/405
	 */
	methodNotAllowed: 405,

	/**
	 * Not Acceptable status code.
	 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/406
	 */
	notAcceptable: 406,

	/**
	 * Proxy Authentication Required status code.
	 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/407
	 */
	proxyAuthenticationRequired: 407,

	/**
	 * Request Timeout status code.
	 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/408
	 */
	requestTimeout: 408,

	/**
	 * Conflict status code.
	 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/409
	 */
	conflict: 409,

	/**
	 * Gone status code.
	 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/410
	 */
	gone: 410,

	/**
	 * Length Required status code.
	 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/411
	 */
	lengthRequired: 411,

	/**
	 * Precondition Failed status code.
	 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/412
	 */
	preconditionFailed: 412,

	/**
	 * Payload Too Large status code.
	 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/413
	 */
	payloadTooLarge: 413,

	/**
	 * URI Too Long status code.
	 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/414
	 */
	uriTooLong: 414,

	/**
	 * Unsupported Media Type status code.
	 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/415
	 */
	unsupportedMediaType: 415,

	/**
	 * Range Not Satisfiable status code.
	 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/416
	 */
	rangeNotSatisfiable: 416,

	/**
	 * Expectation Failed status code.
	 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/417
	 */
	expectationFailed: 417,

	/**
	 * I'm a Teapot status code.
	 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/418
	 */
	imATeapot: 418,

	/**
	 * Misdirected Request status code.
	 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/421
	 */
	misdirectedRequest: 421,

	/**
	 * Unprocessable Entity status code.
	 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/422
	 */
	unprocessableEntity: 422,

	/**
	 * Locked status code.
	 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/423
	 */
	locked: 423,

	/**
	 * Failed Dependency status code.
	 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/424
	 */
	failedDependency: 424,

	/**
	 * Too Early status code.
	 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/425
	 */
	tooEarly: 425,

	/**
	 * Upgrade Required status code.
	 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/426
	 */
	upgradeRequired: 426,

	/**
	 * Precondition Required status code.
	 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/428
	 */
	preconditionRequired: 428,

	/**
	 * Too Many Requests status code.
	 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/429
	 */
	tooManyRequests: 429,

	/**
	 * Request Header Fields Too Large status code.
	 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/431
	 */
	requestHeaderFieldsTooLarge: 431,

	/**
	 * Unavailable For Legal Reasons status code.
	 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/451
	 */
	unavailableForLegalReasons: 451,

	/**
	 * Internal Server Error status code.
	 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/500
	 */
	internalServerError: 500,

	/**
	 * Not Implemented status code.
	 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/501
	 */
	notImplemented: 501,

	/**
	 * Bad Gateway status code.
	 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/502
	 */
	badGateway: 502,

	/**
	 * Service Unavailable status code.
	 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/503
	 */
	serviceUnavailable: 503,

	/**
	 * Gateway Timeout status code.
	 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/504
	 */
	gatewayTimeout: 504,

	/**
	 * HTTP Version Not Supported status code.
	 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/505
	 */
	httpVersionNotSupported: 505,

	/**
	 * Variant Also Negotiates status code.
	 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/506
	 */
	variantAlsoNegotiates: 506,

	/**
	 * Insufficient Storage status code.
	 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/507
	 */
	insufficientStorage: 507,

	/**
	 * Loop Detected status code.
	 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/508
	 */
	loopDetected: 508,

	/**
	 * Not Extended status code.
	 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/510
	 */
	notExtended: 510,

	/**
	 * Network Authentication Required status code.
	 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/511
	 */
	networkAuthenticationRequired: 511
} as const;

/**
 * Standard HTTP status codes.
 */
export type HttpStatusCode = (typeof HttpStatusCode)[keyof typeof HttpStatusCode];
