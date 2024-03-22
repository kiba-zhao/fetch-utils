const { simple } = require("./simple");
const { withPath, withQuery, withJSONBody, withMethod } = require("./fetch");

/** @typedef {import("./simple").SimpleApp} SimpleApp */

/**
 * Generates a simple data provider with CRUD methods for interacting with a given API base URL and handling X-Total-Count headers.
 *
 * @param {SimpleApp} app - the simple application
 * @return {SimpleDataProvider} an object containing various CRUD methods for interacting with the API
 */
function simpleDataProvider(app) {
  if (!app)
    throw new Error("simpleDataProvider Error: simple app must be provided");

  const { fetchOne, fetchMany } = app;

  return {
    getList: async (...args) => await getList(fetchOne, fetchMany, ...args),
    getOne: async (...args) => await getOne(fetchOne, ...args),
    getMany: async (...args) => await getMany(fetchOne, ...args),
    getManyReference: async (...args) =>
      await getManyReference(fetchOne, fetchMany, ...args),
    create: async (...args) => await create(fetchOne, ...args),
    update: async (...args) => await update(fetchOne, ...args),
    updateMany: async (...args) => await updateMany(fetchOne, ...args),
    deleteOne: async (...args) => await deleteOne(fetchOne, ...args),
    deleteMany: async (...args) => await deleteMany(fetchOne, ...args),
  };
}

exports.simpleDataProvider = simpleDataProvider;

function generateSortParams(sort, opts) {
  const { field, order } = sort;

  const fieldKey = (opts && opts._sort) || "_sort";
  const orderKey = (opts && opts._order) || "_order";
  return { [fieldKey]: field, [orderKey]: order };
}

function generateRangeParams(pagination, opts) {
  if (opts && opts.noPagination === true) {
    return {};
  }
  const { page, perPage } = pagination;

  const rangeStart = (page - 1) * perPage;
  const rangeEnd = page * perPage - 1;

  const startKey = (opts && opts._start) || "_start";
  const endKey = (opts && opts._end) || "_end";
  return { [startKey]: rangeStart, [endKey]: rangeEnd };
}

function extractId(data) {
  if (!data || !Reflect.has(data, "id"))
    throw new Error("extractId: Missing id field");
  return data.id;
}

async function getList(fetchOne, fetchMany, resource, params) {
  const query = {
    ...params.filter,
    ...generateSortParams(params.sort, params.meta),
    ...generateRangeParams(params.pagination, params.meta),
  };

  const handles = [withPath(resource, "merge"), withQuery(query, "merge")];
  let results;
  if (params.meta && params.meta._count) {
    results = await fetchOne(
      ...handles,
      withResponds([withHeaderRespond(params.meta._count, Number)], "merge")
    );
  } else {
    results = await fetchMany(...handles);
  }

  const [total, rows] = results;
  return { data: rows, total };
}

async function getOne(fetchOne, resource, params) {
  const { id } = params;
  const row = await fetchOne(withPath(`${resource}/${id}`, "merge"));
  return { data: row };
}

async function getMany(fetchOne, resource, params) {
  const { ids } = params;
  const row = await fetchOne(
    withPath(resource, "merge"),
    withQuery({ ids }, "merge")
  );
  return { data: row };
}

async function getManyReference(fetchOne, fetchMany, resource, params) {
  const query = {
    ...params.filter,
    [params.target]: params.id,
    ...generateSortParams(params.sort, params.meta),
    ...generateRangeParams(params.pagination, params.meta),
  };

  const handles = [withPath(resource, "merge"), withQuery(query, "merge")];
  let results;
  if (params.meta && params.meta._count) {
    results = await fetchOne(
      ...handles,
      withResponds([withHeaderRespond(params.meta._count, Number)], "merge")
    );
  } else {
    results = await fetchMany(...handles);
  }

  const [total, rows] = results;
  return { data: rows, total };
}

async function update(fetchOne, resource, params) {
  const { id, data } = params;
  const row = await fetchOne(
    withPath(`${resource}/${id}`, "merge"),
    withMethod("PATCH"),
    withJSONBody(data)
  );
  return { data: row };
}

async function updateMany(fetchOne, resource, params) {
  const { ids, data } = params;
  const rows = await fetchOne(
    withPath(resource, "merge"),
    withQuery({ ids }, "merge"),
    withMethod("PATCH"),
    withJSONBody({ data })
  );
  return { data: rows.map(extractId) };
}

async function create(fetchOne, resource, params) {
  const { data } = params;
  const row = await fetchOne(
    withPath(resource, "merge"),
    withMethod("POST"),
    withJSONBody(data)
  );
  return { data: row };
}

async function deleteOne(fetchOne, resource, params) {
  const { id } = params;
  const row = await fetchOne(
    withPath(`${resource}/${id}`, "merge"),
    withMethod("DELETE")
  );
  return { data: row };
}

async function deleteMany(fetchOne, resource, params) {
  const { ids } = params;
  const rows = await fetchOne(
    withPath(resource, "merge"),
    withQuery({ ids }, "merge"),
    withMethod("DELETE")
  );
  return { data: rows.map(extractId) };
}
