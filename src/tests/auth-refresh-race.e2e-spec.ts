import { Test, TestingModule } from "@nestjs/testing";
import { jest } from "@jest/globals";
import type { INestApplication } from "@nestjs/common";
import request from "supertest";
import { randomUUID } from "node:crypto";

import { AuthModule } from "../auth/auth.module";
import { EmailService } from "../email/email.service.js";
import type { EmailDTO, PasswordResetDTO } from "../email/email.dto.js";


describe("Refresh Token Race Condition (e2e)", () => {
  let app: INestApplication;
  let verificationEmail: EmailDTO | undefined;

  const emailServiceMock = {
    sendAccountVerificationEmail: jest.fn<
      (emailDto: EmailDTO) => Promise<{
        success: boolean;
        messageId: string;
      }>
    >().mockImplementation(async (emailDto) => {
      verificationEmail = emailDto;

      return {
        success: true,
        messageId: "test-message-id",
      };
    }),

    sendPasswordResetEmail: jest.fn<
      (passwordReset: PasswordResetDTO) => Promise<{
        success: boolean;
        messageId: string;
      }>
    >().mockResolvedValue({
      success: true,
      messageId: "test-message-id",
    }),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AuthModule],
    })
      .overrideProvider(EmailService)
      .useValue(emailServiceMock)
      .compile();

    app = moduleFixture.createNestApplication();

    await app.init();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  it("should allow only one refresh request using the same token", async () => {
    const email = `race-test-${randomUUID()}@example.com`;
    const password = "TestPassword123!";
    const name = "Race Condition Test";

    await request(app.getHttpServer())
      .post("/auth/signup")
      .send({
        name,
        email,
        password,
      })
      .expect(201);

    expect(verificationEmail).toBeDefined();
    expect(verificationEmail?.verificationUrl).toBeDefined();

    const verificationUrl = new URL(
      verificationEmail!.verificationUrl,
    );

    const verificationToken =
      verificationUrl.searchParams.get("token");

    expect(verificationToken).toBeDefined();

    await request(app.getHttpServer())
      .get("/auth/verify-email")
      .query({ token: verificationToken })
      .expect(200);

    const signinResponse = await request(app.getHttpServer())
      .post("/auth/signin")
      .send({
        email,
        password,
      })
      .expect(200);

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

    const successfulResponse =
      response1.status === 200 ? response1 : response2;

    expect(successfulResponse.body.accessToken).toBeDefined();
    expect(successfulResponse.body.refreshToken).toBeDefined();

    expect(successfulResponse.body.refreshToken).not.toBe(tokenA);
  });
});
