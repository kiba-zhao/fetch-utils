const { simple } = require("./simple");
const { withOriginFetch } = require("./fetch");
const { faker } = require("@faker-js/faker");

describe("fetch-utils: simple", () => {
  function fakeBody() {
    return {
      [faker.word.sample()]: faker.word.sample(),
    };
  }

  it("simple", async () => {
    const base = faker.system.directoryPath();
    const total = faker.word.sample();
    const totalcount = faker.number.int();

    const originFetch = jest.fn();
    const fetchOneBody = fakeBody();
    const fetchOneResponse = new Response(JSON.stringify(fetchOneBody), {
      headers: { "Content-Type": "application/json" },
    });
    originFetch.mockResolvedValueOnce(fetchOneResponse);
    const fetchManyBody = fakeBody();
    const fetchManyResponse = new Response(JSON.stringify(fetchManyBody), {
      headers: {
        [total]: totalcount.toString(),
        "Content-Type": "application/json",
      },
      status: 200,
    });
    originFetch.mockResolvedValueOnce(fetchManyResponse);

    const app = simple(base, total, withOriginFetch(originFetch));
    const fetchOneResults = await app.fetchOne();

    expect(originFetch).toHaveBeenCalledTimes(1);
    expect(originFetch).toHaveBeenCalledWith(base, undefined);
    expect(fetchOneResults).toEqual(fetchOneBody);

    const fetchManyResults = await app.fetchMany();
    expect(originFetch).toHaveBeenCalledTimes(2);
    expect(originFetch).toHaveBeenLastCalledWith(base, undefined);
    expect(fetchManyResults).toEqual([totalcount, fetchManyBody]);
  });
});
