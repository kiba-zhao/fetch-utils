import { DataProvider } from "react-admin";
import { SimpleApp } from "./simple";

type SimpleDataProvider = DataProvider;

/**
 * Create a simple data provider with optional base and total parameters, and an array of handles.
 *
 * @param {SimpleApp} ctx - the simple application
 * @return {SimpleDataProvider} a simple data provider
 */
export function simpleDataProvider(app: SimpleApp): SimpleDataProvider;
