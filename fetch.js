/**
 * create a new Fetch context
 * @param {FetchContextHandle[]} baseHandles - The handles to set FetchContext
 * @return {Fetch} The new Fetch
 */
function newFetch(...baseHandles) {
  /** @type {FetchContext} */
  const baseCtx = { fetch: (...args) => fetch(...args) };
  for (const handle of baseHandles) {
    handle(baseCtx);
  }

  return async (...handles) => {
    /** @type {FetchContext} */
    const ctx = { ...baseCtx };

    for (const handle of handles) {
      handle(ctx);
    }

    const { paths, query, init, responds, respond } = ctx;
    if (!paths || paths.length <= 0) {
      throw new Error("Fetch Error: no path provided");
    }
    if (!respond && (!responds || responds.length <= 0)) {
      throw new Error("Fetch Error: no respond provided");
    }

    let input = paths.join("/");
    if (query) {
      input += `?${query}`;
    }

    const res = await ctx.fetch(input, init);
    if (respond && (!responds || responds.length <= 0)) {
      return await respond(res);
    }

    const _responds = [...responds];
    if (respond) {
      _responds.push(respond);
    }
    return await Promise.all(_responds.map((_) => _(res)));
  };
}
exports.newFetch = newFetch;
exports.default = newFetch;

/**
 * Returns a function that adds the 'fetch' function to the 'ctx' object.
 *
 * @param {OriginFetch} fetch - The fetch function to be added to the context object
 * @return {FetchContextHandle} A function that modifies the context object by adding the fetch function
 */
function withOriginFetch(fetch) {
  return (ctx) => {
    ctx.fetch = fetch;
  };
}
exports.withOriginFetch = withOriginFetch;

/**
 * Generate a function to configure a path in the given configuration object based on the strategy provided.
 *
 * @param {string} path - the path to be configured
 * @param {string} [strategy] - the strategy to determine how the path should be configured
 * @return {FetchContextHandle} a function that takes a configuration object and configures the path based on the provided strategy
 */
function withPath(path, strategy) {
  if (strategy == "merge") {
    return (ctx) => {
      if (!ctx.paths) {
        ctx.paths = [path];
        return;
      }
      ctx.paths = [...ctx.paths, path];
    };
  }

  if (strategy == "replace") {
    return (ctx) => {
      ctx.paths = [path];
    };
  }
  return (ctx) => {
    if (ctx.paths)
      throw new Error("withPath Error: path has been set in context");

    ctx.paths = [path];
  };
}
exports.withPath = withPath;

/**
 * A function that takes an init object and a strategy, and returns a function that modifies the init property of a config object based on the strategy provided.
 *
 * @param {RequestInit} init - the init object to be merged or replaced
 * @param {FetchContextStrategy} [strategy] - the strategy to be used for modifying the init property ("merge" or "replace")
 * @return {FetchContextHandle} a function that modifies the init property of a config object based on the strategy provided
 */
function withRequestInit(init, strategy) {
  if (strategy == "merge") {
    return (ctx) => {
      if (!ctx.init) {
        ctx.init = init;
        return;
      }

      ctx.init = { ...ctx.init, ...init };
    };
  }

  if (strategy == "replace") {
    return (ctx) => {
      ctx.init = init;
    };
  }

  return (ctx) => {
    if (ctx.init)
      throw new Error("withRequestInit Error: init has been set in context");
    ctx.init = init;
  };
}
exports.withRequestInit = withRequestInit;

/**
 * Generate a function comment for the given function body.
 *
 * @param {FetchQuery} query - the query to be used for URLSearchParams
 * @param {FetchContextStrategy} strategy - the strategy to be used for handling the query
 * @return {FetchContextHandle} a function that takes a ctx parameter and modifies its query property based on the strategy
 */
function withQuery(query, strategy) {
  if (strategy == "merge") {
    return (ctx) => {
      const params = new URLSearchParams(query);
      if (!ctx.query) {
        ctx.query = params;
        return;
      }
      ctx.query = new URLSearchParams(
        ...ctx.query.entries(),
        ...params.entries()
      );
    };
  }

  if (strategy == "replace") {
    return (ctx) => {
      ctx.query = new URLSearchParams(query);
    };
  }

  return (ctx) => {
    if (ctx.query)
      throw new Error("withQuery Error: query has been set in context");
    ctx.query = new URLSearchParams(query);
  };
}
exports.withQuery = withQuery;

/**
 * Higher order function that returns a function to set the 'respond' property in the given 'ctx' object.
 *
 * @param {FetchRespond} respond - The value to set the 'respond' property to in the 'ctx' object.
 * @param {boolean} [force] - Flag indicating whether to force setting the 'respond' property, even if it's already set.
 * @return {FetchContextHandle} A function to set the 'respond' property in the given 'ctx' object.
 */
function withRespond(respond, force) {
  if (force) {
    return (ctx) => {
      ctx.respond = respond;
    };
  }
  return (ctx) => {
    if (ctx.respond)
      throw new Error("withRespond Error: respond has been set in context");
    ctx.respond = respond;
  };
}
exports.withRespond = withRespond;

/**
 * Creates a configuration function that sets the 'respond' property to the provided value.
 *
 * @param {FetchRespond[]} responds - The value to be set as the 'respond' property in the configuration object.
 * @return {FetchContextHandle} A configuration function that sets the 'respond' property in the provided configuration object.
 */
function withResponds(responds, strategy) {
  if (strategy == "merge") {
    return (ctx) => {
      if (!ctx.responds) {
        ctx.responds = [...responds];
        return;
      }
      ctx.responds = [...responds, ...ctx.responds];
    };
  }

  if (strategy == "replace") {
    return (ctx) => {
      ctx.responds = [...responds];
    };
  }

  return (ctx) => {
    if (ctx.responds)
      throw new Error("withRespond Error: respond has been set in context");
    ctx.responds = [...responds];
  };
}
exports.withResponds = withResponds;

/**
 * A higher-order function that takes a method and returns a function to update the configuration object.
 *
 * @param {string} method - The method to be added to the configuration object.
 * @return {FetchContextHandle} A function that updates the configuration object with the given method.
 */
function withMethod(method) {
  return (ctx) => {
    if (!ctx.init) {
      ctx.init = { method };
      return;
    }
    ctx.init = { ...ctx.init, method };
  };
}
exports.withMethod = withMethod;

/**
 * A function that takes a set of headers and returns a function that adds the headers to the provided configuration object.
 *
 * @param {HeadersInit} headers - The headers to be added to the configuration object.
 * @return {FetchContextHandle} - A function that modifies the provided configuration object by adding the headers.
 */
function withHeaders(headers, strategy) {
  if (strategy == "merge") {
    return (ctx) => {
      if (!ctx.init) {
        ctx.init = { headers };
        return;
      }
      ctx.init.headers = mergeHeaders(ctx.init.headers, headers);
    };
  }

  if (strategy == "replace") {
    return (ctx) => {
      ctx.init = ctx.init || {};
      ctx.init.headers = headers;
    };
  }

  return (ctx) => {
    if (ctx.init && ctx.init.headers)
      throw new Error("withHeaders Error: headers has been set in context");

    ctx.init = ctx.init || {};
    ctx.init.headers = headers;
  };
}

exports.withHeaders = withHeaders;

/**
 * Generate a function comment for the given function body in a markdown code block with the correct language syntax.
 *
 * @param {object|string} body - The input body for the function
 * @return {FetchContextHandle} A function that takes a configuration object and sets the headers and body
 */
function withJSONBody(body) {
  const headers = { "Content-Type": "application/json" };
  /** @type {string|undefined} */
  let _body;
  if (typeof body == "string") {
    _body = body;
  } else if (typeof body == "object") {
    _body = JSON.stringify(body);
  } else {
    throw new Error("withBody Error: body must be a string or an object");
  }
  return (ctx) => {
    if (!ctx.init) {
      ctx.init = init;
      return;
    }
    ctx.init.headers = mergeHeaders(ctx.init.headers, headers);
    ctx.init.body = _body;
  };
}

exports.withJSONBody = withJSONBody;

/**
 * A function that takes a formData parameter and returns a function that takes a ctx parameter.
 *
 * @param {FormData} formData - The data to be set in the body of the ctx init object.
 * @return {FetchContextHandle} - A function that sets the body of the ctx init object to the provided formData.
 */
function withFormData(formData) {
  return withRequestInit({ body }, "merge");
}

exports.withFormData = withFormData;

/**
 * A function that takes a header and returns a function that extracts the specified header value from a response object.
 *
 * @param {string} header - The header to extract from the response
 * @param {FetchHeaderRespondTransform} [transform] - Header content type conversion function
 * @return {FetchRespond} - A function that takes a response object and returns the value of the specified header
 */
function withHeaderRespond(header, transform) {
  return (res) => {
    const content = res.headers.get(header);
    return transform ? transform(content) : content;
  };
}

exports.withHeaderRespond = withHeaderRespond;

/**
 * A function that checks if the response is ok and returns the JSON data.
 *
 * @param {Response} res - the response object
 * @return {Promise} a promise that resolves to the JSON data if the response is ok
 */
async function respondJSON(res) {
  if (res.ok) {
    return await res.json();
  }
  const contentType = res.headers.get("Content-Type");
  if (contentType && contentType.trim().startsWith("application/json")) {
    return await res.json();
  }
  const message = await res.text();
  return new Error(message);
}

exports.respondJSON = respondJSON;

/**
 * Composes multiple functions into a single function.
 *
 * @param {...FetchContextHandle} handles - The functions to be composed
 * @return {FetchContextHandle} A new function that applies each function in the composition to the input
 */
function compose(...handles) {
  return (ctx) => {
    for (const handle of handles) {
      handle(ctx);
    }
  };
}

exports.compose = compose;

/**
 * Merge multiple Headers objects into a single Headers object.
 *
 * @param {Headers} target - The target Headers object to merge into.
 * @param {...Headers} sources - The source Headers objects to merge from.
 * @return {Headers} The merged Headers object.
 */
function mergeHeaders(target, ...sources) {
  let headers = new Headers(target);
  for (const source of sources) {
    let srcHeaders = source instanceof Headers ? source : new Headers(source);
    headers = new Headers([...headers, ...srcHeaders]);
  }
  return headers;
}
