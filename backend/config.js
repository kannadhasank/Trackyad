import "dotenv/config";

function required(name) {
  const value = process.env[name];
  if (!value) {
    console.error(
      `Missing required env var ${name}. Copy backend/.env.example to backend/.env and fill it in.`
    );
    process.exit(1);
  }
  return value;
}

export const config = {
  port: Number(process.env.PORT ?? 3001),
  databaseUrl: required("DATABASE_URL"),
  jwtSecret: required("JWT_SECRET"),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "8h",
  corsOrigin: process.env.CORS_ORIGIN ?? "http://localhost:5173",
};
