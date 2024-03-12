import { Fetch } from "./fetch";

export interface SimpleApp {
  fetchOne: Fetch;
  fetchMany: Fetch;
}

/**
 * Creates a new simple fetch application with the provided base url and total header name
 * @param {string} [base="/"] base url or base path
 * @param {string} [total="X-Total-Count"] total header name in response headers
 */
export function simple(base?: string, total?: string): SimpleApp;
