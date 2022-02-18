import request from "supertest";
import app from "../src/app";
describe("Post Endpoints", () => {
  it("get test", async () => {
    const res = await request(app).get("/3/5");
    console.log(res);
  });
});
