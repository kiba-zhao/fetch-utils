import { DataProvider } from "react-admin";
import { FetchContextHandle } from "./fetch";

type SimpleDataProvider = DataProvider;

/**
 * Create a simple data provider with optional base and total parameters, and an array of handles.
 *
 * @param {string} base - optional base parameter
 * @param {string} total - optional total parameter
 * @param {...FetchContextHandle} handles - array of fetch context handles
 * @return {SimpleDataProvider} a simple data provider
 */
export function simpleDataProvider(
  base?: string,
  total?: string,
  ...handles: FetchContextHandle[]
): SimpleDataProvider;
