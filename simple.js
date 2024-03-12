const {
  newFetch,
  withPath,
  respondJSON,
  withRespond,
  withResponds,
  withHeaderRespond,
} = require("./fetch");

/** @typedef {import("./fetch").FetchContextHandle} FetchContextHandle */

/**
 * Creates a DefaultApplication with the given base path and optional handles.
 *
 * @param {string} base - The base path for the DefaultApplication (default: "/")
 * @param {string} [countHeader="X-Total-Count"] - The name of the header for the total count (default: "X-Total-Count")
 * @param {...FetchContextHandle[]} handles - Optional handles to be applied to the DefaultApplication
 * @return {SimpleApp} An object with fetchOne and fetchMany methods for fetching data
 */
function simple(base = "/", countHeader, ...handles) {
  const baseHandles = [withPath(base), withRespond(respondJSON), ...handles];
  const countHeaderRespond = withHeaderRespond(
    countHeader || "X-Total-Count",
    Number
  );

  return {
    fetchOne: newFetch(...baseHandles),
    fetchMany: newFetch(
      ...baseHandles,
      withResponds([countHeaderRespond], "merge")
    ),
  };
}

exports.simple = simple;
