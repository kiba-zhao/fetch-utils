const { faker } = require("@faker-js/faker");
const {
  default: defaultFetch,
  withPath,
  withMethod,
  withRespond,
  withQuery,
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
});
