export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3025/api";

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function parseJsonOrThrow(res: Response) {
  const body = await res.json().catch(() => null);
  if (!res.ok) {
    const message =
      (body && typeof body === "object" && "message" in body && String(body.message)) ||
      res.statusText;
    throw new ApiError(message, res.status);
  }
  return body;
}
