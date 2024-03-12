const { simple } = require("./simple");
const { withPath, withQuery, withJSONBody, withMethod } = require("./fetch");

/** @typedef {import("./fetch").FetchContextHandle} FetchContextHandle */

/**
 * Generates a simple data provider with CRUD methods for interacting with a given API base URL and handling X-Total-Count headers.
 *
 * @param {string} [base] - the base URL for the API
 * @param {string} [countHeader] - the header for the total count of items
 * @param {...FetchContextHandle[]} handles - optional handles for customizing the behavior of the data provider
 * @return {SimpleDataProvider} an object containing various CRUD methods for interacting with the API
 */
function simpleDataProvider(
  base = "/",
  countHeader = "X-Total-Count",
  ...handles
) {
  const { fetchOne, fetchMany } = simple(base, countHeader, ...handles);

  return {
    getList: async (...args) => await getList(fetchMany, ...args),
    getOne: async (...args) => await getOne(fetchOne, ...args),
    getMany: async (...args) => await getMany(fetchOne, ...args),
    getManyReference: async (...args) =>
      await getManyReference(fetchOne, ...args),
    create: async (...args) => await create(fetchOne, ...args),
    update: async (...args) => await update(fetchOne, ...args),
    updateMany: async (...args) => await updateMany(fetchOne, ...args),
    deleteOne: async (...args) => await deleteOne(fetchOne, ...args),
    deleteMany: async (...args) => await deleteMany(fetchOne, ...args),
  };
}

exports.simpleDataProvider = simpleDataProvider;

function generateSortParams(sort) {
  const { field, order } = sort;

  return { "sort-field": field, "sort-order": order };
}

function generateRangeParams(pagination) {
  const { page, perPage } = pagination;

  const rangeStart = (page - 1) * perPage;
  const rangeEnd = page * perPage - 1;

  return { "range-start": rangeStart, "range-end": rangeEnd };
}

function extractId(data) {
  if (!data || !Reflect.has(data, "id"))
    throw new Error("extractId: Missing id field");
  return data.id;
}

async function getList(fetchMany, resource, params) {
  const query = {
    ...params.filter,
    ...generateSortParams(params.sort),
    ...generateRangeParams(params.pagination),
  };

  const [total, rows] = await fetchMany(
    withPath(resource, "merge"),
    withQuery(query, "merge")
  );
  return { data: rows, total };
}

async function getOne(fetchOne, resource, params) {
  const { id } = params;
  return await fetchOne(withPath(`${resource}/${id}`, "merge"));
}

async function getMany(fetchOne, resource, params) {
  const { ids } = params;
  return await fetchOne(
    withPath(resource, "merge"),
    withQuery({ ids }, "merge")
  );
}

async function getManyReference(fetchMany, resource, params) {
  const query = {
    ...params.filter,
    [params.target]: params.id,
    ...generateSortParams(params.sort),
    ...generateRangeParams(params.pagination),
  };

  const [total, rows] = await fetchMany(
    withPath(resource, "merge"),
    withQuery(query, "merge")
  );
  return { data: rows, total };
}

async function update(fetchOne, resource, params) {
  const { id, data } = params;
  return await fetchOne(
    withPath(`${resource}/${id}`, "merge"),
    withMethod("PATCH"),
    withJSONBody(data)
  );
}

async function updateMany(fetchOne, resource, params) {
  const { ids, data } = params;
  const rows = await fetchOne(
    withPath(resource, "merge"),
    withQuery({ ids }, "merge"),
    withMethod("PATCH"),
    withJSONBody({ data })
  );
  return rows.map(extractId);
}

async function create(fetchOne, resource, params) {
  const { data } = params;
  return await fetchOne(
    withPath(resource, "merge"),
    withMethod("POST"),
    withJSONBody(data)
  );
}

async function deleteOne(fetchOne, resource, params) {
  const { id } = params;
  return await fetchOne(
    withPath(`${resource}/${id}`, "merge"),
    withMethod("DELETE")
  );
}

async function deleteMany(fetchOne, resource, params) {
  const { ids } = params;
  const rows = await fetchOne(
    withPath(resource, "merge"),
    withQuery({ ids }, "merge"),
    withMethod("DELETE")
  );
  return rows.map(extractId);
}
