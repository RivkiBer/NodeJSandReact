export const jwtConfig = {
  secret: process.env.JWT_SECRET || "replace_this_secret",
  expiresIn: "7d",
};
