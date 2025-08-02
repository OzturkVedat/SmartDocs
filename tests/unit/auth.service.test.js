const jwt = require("jsonwebtoken");

jest.mock("../../backend/models/user.model", () => ({
  findOne: jest.fn(),
  create: jest.fn(),
}));

jest.mock("../../backend/utils/hash.util", () => ({
  hashPassword: jest.fn(),
  comparePassword: jest.fn(),
}));

jest.mock("jsonwebtoken", () => ({
  sign: jest.fn(),
}));

const User = require("../../backend/models/user.model");
const { hashPassword, comparePassword } = require("../../backend/utils/hash.util");
const { registerUser, loginUser } = require("../../backend/services/auth.service");

describe("Auth Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("registerUser", () => {
    it("should register user if email is not taken", async () => {
      User.findOne.mockResolvedValue(null);
      hashPassword.mockResolvedValue("hashedPass");
      User.create.mockResolvedValue({
        _id: "123",
        name: "Test",
        email: "test@example.com",
      });

      const result = await registerUser({
        name: "Test",
        email: "test@example.com",
        password: "plainPass",
      });

      expect(User.findOne).toHaveBeenCalledWith({ email: "test@example.com" });
      expect(hashPassword).toHaveBeenCalledWith("plainPass");
      expect(User.create).toHaveBeenCalledWith({
        name: "Test",
        email: "test@example.com",
        password: "hashedPass",
      });
      expect(result.name).toBe("Test");
    });

    it("should throw error if email already exists", async () => {
      User.findOne.mockResolvedValue({ email: "test@example.com" });

      await expect(registerUser({ name: "Test", email: "test@example.com", password: "123" })).rejects.toThrow("E-posta zaten kayıtlı.");
    });
  });

  describe("loginUser", () => {
    it("should login user and return token and user info", async () => {
      const mockUser = {
        _id: "abc123",
        name: "Jane",
        email: "jane@example.com",
        password: "hashed",
      };

      User.findOne.mockResolvedValue(mockUser);
      comparePassword.mockResolvedValue(true);
      jwt.sign.mockReturnValue("mocked-token");

      const result = await loginUser({
        email: "jane@example.com",
        password: "plain",
      });

      expect(User.findOne).toHaveBeenCalledWith({ email: "jane@example.com" });
      expect(comparePassword).toHaveBeenCalledWith("plain", "hashed");
      expect(jwt.sign).toHaveBeenCalledWith({ userId: "abc123" }, expect.any(String), { expiresIn: "1h" });

      expect(result.token).toBe("mocked-token");
      expect(result.user).toEqual({
        id: "abc123",
        name: "Jane",
        email: "jane@example.com",
      });
    });

    it("should throw error if user is not found", async () => {
      User.findOne.mockResolvedValue(null);

      await expect(loginUser({ email: "nonexist@example.com", password: "123" })).rejects.toThrow("Kullanıcı bulunamadı.");
    });

    it("should throw error if password does not match", async () => {
      User.findOne.mockResolvedValue({ email: "x", password: "wrong" });
      comparePassword.mockResolvedValue(false);

      await expect(loginUser({ email: "x", password: "badpass" })).rejects.toThrow("Şifre hatalı.");
    });
  });
});
