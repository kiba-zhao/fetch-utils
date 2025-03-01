import type { FetchError } from "./error";
export interface FetchContext {
  paths?: string[];
  query?: URLSearchParams;
  init?: RequestInit;
  responds?: FetchRespond[];
  respond?: FetchRespond;
  fetch?: OriginFetch;
}

export type FetchRespond = (res: Response) => Promise<any>;

export type FetchContextHandle = (ctx: FetchContext) => void;

export type Fetch = (...handles: FetchContextHandle[]) => Promise<any>;

export type FetchContextStrategy = "replace" | "merge";

export type FetchHeaderRespondTransform = (content: string) => any;

export type FetchQuery =
  | string
  | string[][]
  | Record<string, string>
  | URLSearchParams
  | undefined;

export type OriginFetch = typeof fetch;

/**
 * create a new Fetch context
 * @param {FetchContextHandle[]} handles - The handles to set FetchContext
 * @return {Fetch} The new Fetch
 */
export function newFetch(...handles: FetchContextHandle[]): Fetch;
export default newFetch;

/**
 * Creates a new FetchContextHandle with the provided fetch.
 *
 * @param {OriginFetch} fetch - the origin fetch function
 * @return {FetchContextHandle} a new FetchContextHandle with the provided fetch
 */
export function withOriginFetch(fetch: OriginFetch): FetchContextHandle;

/**
 * Creates a new FetchContextHandle with the provided path.
 *
 * @param {string} path - the path of the request
 * @param {FetchContextStrategy} [strategy] - whether to replace or merge the path
 *  @return {FetchContextHandle} a new FetchContextHandle with the provided path and init
 */
export function withPath(
  path: string,
  strategy?: FetchContextStrategy
): FetchContextHandle;

/**
 * Creates a new FetchContextHandle with the provided init.
 *
 * @param {RequestInit} init - the init of the request
 * @param {FetchContextStrategy} [strategy] - whether to replace or merge the init
 * @return {FetchContextHandle} a new FetchContextHandle with the provided init
 */
export function withRequestInit(
  init: RequestInit,
  strategy?: FetchContextStrategy
): FetchContextHandle;

/**
 * Creates a new FetchContextHandle with the provided params and query.
 *
 * @param {FetchQuery} query - optional parameters for the queystring
 * @param {FetchContextStrategy} [strategy] - whether to replace or merge the queystring
 * @return {FetchContextHandle} a new FetchContextHandle with the provided params and query
 */
export function withQuery(
  query: FetchQuery,
  strategy?: FetchContextStrategy
): FetchContextHandle;

/**
 * Creates a new FetchContextHandle with the provided respond.
 *
 * @param {FetchRespond} respond - The function to execute with a Response parameter
 * @param {boolean} [force] - whether to replace or merge the respond
 * @return {FetchContextHandle} The FetchContextHandle returned by the function
 */
export function withRespond(
  respond: FetchRespond,
  force?: boolean
): FetchContextHandle;

/**
 * Executes the given respond function and returns a FetchContextHandle.
 *
 * @param {FetchRespond[]} responds - The function to execute with a Response parameter
 * @param {FetchContextStrategy} [strategy] - whether to replace or merge the respond
 * @return {FetchContextHandle} The FetchContextHandle returned by the function
 */
export function withResponds(
  responds: FetchRespond[],
  strategy?: FetchContextStrategy
): FetchContextHandle;

/**
 * Creates a new FetchContextHandle with the provided method.
 *
 * @param {string} method - the method of the request
 * @return {FetchContextHandle} a new FetchContextHandle with the provided method
 */
export function withMethod(method: string): FetchContextHandle;

/**
 * Creates a new FetchContextHandle with the provided headers.
 *
 * @param {HeadersInit} headers - the headers of the request
 * @param {FetchContextStrategy} [strategy] - whether to replace or merge the headers
 * @return {FetchContextHandle} a new FetchContextHandle with the provided headers
 */
export function withHeaders(
  headers: HeadersInit,
  strategy: FetchContextStrategy
): FetchContextHandle;

/**
 * Creates a new FetchContextHandle with the provided body.
 *
 * @param {object|string} body - the body of the request
 * @return {FetchContextHandle} a new FetchContextHandle with the provided body and init
 */
export function withJSONBody(body: object | string): FetchContextHandle;

/**
 * Creates a new FetchContextHandle with the provided body.
 *
 * @param {URLSearchParams} body - the body of the request
 * @return {FetchContextHandle} a new FetchContextHandle with the provided body and init
 */
export function withFormBody(body: URLSearchParams): FetchContextHandle;

/**
 * Creates a new FetchContextHandle with the provided body.
 *
 * @param {formData} body - the body of the request
 * @return {FetchContextHandle} a new FetchContextHandle with the provided body and init
 */
export function withFormData(formData: FormData): FetchContextHandle;

/**
 * Creates a new FetchContextHandle with the provided header.
 *
 * @param {string} header - the header of the request
 * @return {FetchContextHandle} a new FetchContextHandle with the provided header
 */
export function withHeaderRespond(
  header: string,
  transform?: FetchHeaderRespondTransform
): FetchRespond;

/**
 * A function that takes a Response and returns a Promise that resolves with the JSON data in the response body.
 *
 * @param {Response} res - The Response object to be processed
 * @return {Promise<any>} A Promise that resolves with the JSON data in the response body
 * @throws {FetchError} if the response is not ok
 */
export function respondJSON(res: Response): Promise<any>;

/**
 * Composes multiple functions into a single function.
 *
 * @param {...FetchContextHandle} handles - The functions to be composed
 * @return {FetchContextHandle} A new function that applies each function in the composition to the input
 */
export function compose(...handles: FetchContextHandle[]): FetchContextHandle;
