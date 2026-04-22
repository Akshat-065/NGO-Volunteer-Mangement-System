import { describe, expect, it, jest } from "@jest/globals";

const registerVolunteerMock = jest.fn();

await jest.unstable_mockModule("../src/services/authService.js", () => ({
  registerVolunteer: registerVolunteerMock
}));

const { register } = await import("../src/controllers/authController.js");

describe("authController register", () => {
  it("returns 201 and the created account response", async () => {
    const payload = { name: "Test User", email: "test@example.com" };
    const req = { body: payload };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    registerVolunteerMock.mockResolvedValue({ message: "Account created" });

    await register(req, res);

    expect(registerVolunteerMock).toHaveBeenCalledWith(payload);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ message: "Account created" });
  });
});
