const { faker } = require("@faker-js/faker");
const { simpleDataProvider } = require("./raProvider");
const { simple } = require("./simple");
const { withOriginFetch } = require("./fetch");

describe("fetch-utils: raProvider", () => {
  function fakeBody() {
    return {
      [faker.word.sample()]: faker.word.sample(),
    };
  }

  it("getOne for simpleDataProvider", async () => {
    const base = faker.system.directoryPath();
    const resource = faker.word.sample();
    const id = faker.number.int();

    const getOneBody = fakeBody();
    const getOneResponse = new Response(JSON.stringify(getOneBody), {
      headers: { "Content-Type": "application/json" },
    });

    const originFetch = jest.fn();
    originFetch.mockResolvedValueOnce(getOneResponse);
    const app = simple(base, undefined, withOriginFetch(originFetch));
    const dataProvider = simpleDataProvider(app);

    const results = await dataProvider.getOne(resource, { id });

    expect(originFetch).toHaveBeenCalledTimes(1);
    expect(originFetch).toHaveBeenCalledWith(
      `${base}/${resource}/${id}`,
      undefined
    );
    expect(results).toEqual(getOneBody);
  });
});
