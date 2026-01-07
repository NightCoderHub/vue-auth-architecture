// scripts/swagger-generate.ts
import { generateApi } from "swagger-typescript-api";
import path from "path";

generateApi({
  templates: path.resolve(process.cwd(), "swagger"),
  input: path.resolve(process.cwd(), "swagger/swagger.json"),
  output: path.resolve(process.cwd(), "src/api"),
  fileName: "index.ts",
  httpClientType: "axios",
  unwrapResponseData: true,
  cleanOutput: true,
  generateClient: true,
  generateResponses: true,
  generateRouteTypes: false,
  silent: false,
  modular: false,
});
