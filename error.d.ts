declare const FetchError: new (res: Response) => FetchError;

export interface FetchError extends Error {
  response: Response;
}
