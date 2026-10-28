import { Test, TestingModule } from "@nestjs/testing";
import type { INestApplication } from "@nestjs/common"
import request from "supertest";
import { randomUUID } from "crypto";
import { AuthModule } from "../auth/auth.module";

describe("Refresh Token Race Condition (e2e)", () =>{
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AuthModule]
    }).compile();

    app = moduleFixture.createNestApplication();

    await app.init();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  it("should allow only one current refrsh using the same token", async () => {
    const email = `race-test-${randomUUID()}@example.com`;
    const password = "TestPassword123!";
    const name = "Race Condition Test"

    await request(app.getHttpServer())
    .post("/auth/signup")
    .send({
      name,
      email,
      password
    }).expect(201);

    const signinResponse = await request(app.getHttpServer())
    .post("/auth/signin")
    .send({
      email,
      password
    }).expect(200);

    const tokenA = signinResponse.body.refreshToken;

    expect(tokenA).toBeDefined();
    expect(typeof tokenA).toBe("string");

    const [response1, response2] = await Promise.all([
      request(app.getHttpServer())
      .post("/auth/refresh")
      .send({ refreshToken: tokenA }),

      request(app.getHttpServer())
      .post("/auth/refresh")
      .send({ refreshToken: tokenA }),
    ]);

    const statuses = [response1.status, response2.status].sort(
      (a, b) => a - b,
    );

    expect(statuses).toEqual([200, 401]);

    const successfulResponse = response1.status === 200 ? response1 : response2;

    expect(successfulResponse.body.accessToken).toBeDefined();
    expect(successfulResponse.body.refreshToken).toBeDefined();

    expect(successfulResponse.body.refreshToken).not.toBe(tokenA);
  })
})
