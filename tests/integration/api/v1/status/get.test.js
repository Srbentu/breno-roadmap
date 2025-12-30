import orchestrator from "./../orchestrator";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
});
describe("GET /api/v1/status", () => {
  describe("Anonymous user", () => {
    test("Retrieving status information", async () => {
      const response = await fetch("http://localhost:3000/api/v1/status");
      expect(response.status).toBe(200);

      const responseBody = await response.json();

      const parsedUpdatedAt = new Date(responseBody.updated_at).toISOString();
      expect(parsedUpdatedAt).toEqual(responseBody.updated_at);

      expect(responseBody.dependnencies.database.postgress_version).toBe(
        "16.0",
      );
      expect(responseBody.dependnencies.database.max_connections).toBe(100);
      expect(responseBody.dependnencies.database.opened_connections).toBe(1);
    });
  });
});
