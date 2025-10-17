import { app } from "@/app";
import { prisma } from "@/database/prisma";
import request from "supertest";

describe("UserController", () => {
  let user_id: string;

  afterAll(async () => {
    await prisma.user.delete({ where: { id: user_id } });
  });

  it("should create a new user successfully", async () => {
    const response = await request(app).post("/users").send({
      name: "test user",
      email: "testuser@email.com",
      password: "password123",
    });

    expect(response.status).toBe(201),
      expect(response.body).toHaveProperty("id");
    expect(response.body.name).toBe("test user");
    user_id = response.body.id;
  });

  it("should throw an error if user with same email already exists", async () => {
    const response = await request(app).post("/users").send({
      name: "Duplicate user",
      email: "testuser@email.com",
      password: "password123",
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("User with same email already exists");
  });

  it("should throw an error if user with same email already exists", async () => {
    const response = await request(app).post("/users").send({
      name: "test user",
      email: "Invalid email",
      password: "password123",
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("validation error");
  });
});
