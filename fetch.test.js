const { faker } = require("@faker-js/faker");
const {FetchError} = require("./error");
const {
  default: defaultFetch,
  withPath,
  withMethod,
  withRespond,
  withQuery,
  respondJSON,
} = require("./fetch");

describe("fetch-utils: fetch", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  function fakeBody() {
    return {
      [faker.word.sample()]: faker.word.sample(),
    };
  }

  it("default fetch", async () => {
    const resData = fakeBody();
    const respond = jest.fn();
    respond.mockResolvedValueOnce(resData);
    const path = faker.system.directoryPath();
    const method = faker.internet.httpMethod();
    const query = new URLSearchParams(fakeBody());

    const fetchSpy = jest.spyOn(globalThis, "fetch");
    const spyBody = new URLSearchParams(fakeBody());
    const spyResponse = new Response(spyBody);
    fetchSpy.mockResolvedValueOnce(spyResponse);
    const fetchFn = defaultFetch(withPath(path), withRespond(respond));

    const results = await fetchFn(withMethod(method), withQuery(query));

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(fetchSpy).toHaveBeenCalledWith(`${path}?${query}`, {
      method,
    });
    expect(respond).toHaveBeenCalledTimes(1);
    expect(respond).toHaveBeenCalledWith(spyResponse);
    expect(results).toEqual(resData);
  });

  it("respondJSON with error", async () => {

    const status = faker.helpers.arrayElement([400, 500]);
    const res = new Response(null,{status});

    const promise = respondJSON(res);
    expect(promise).rejects.toThrow(FetchError);

    /** @type {FetchError} */
    const error = await promise.catch((e) => e);
    expect(error.response).toEqual(res);
  });
});
