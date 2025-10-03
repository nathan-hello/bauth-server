const prodUrl = process.env.PRODUCTION_URL;

if (!prodUrl) {
  throw Error(".env: `PRODUCTION_URL` is required");
}

const devUrl = "http://localhost:5173";

export const url = process.env.NODE_ENV === "development" ? devUrl : prodUrl;

export const AUTH_REDIRECT_AFTER_SUCESS = "/chat";

