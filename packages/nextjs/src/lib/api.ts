type RequestMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

interface FetchOptions extends RequestInit {
  method: RequestMethod;
  body?: any;
}

export async function fetchWithAuth(
  endpoint: string,
  options: FetchOptions = { method: "GET" },
) {
  const apiKey = process.env.NEXT_PUBLIC_API_SECRET_KEY;

  if (!apiKey) {
    throw new Error("API key is not configured");
  }

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    "x-api-key": apiKey,
    ...options.headers,
  };

  const config: RequestInit = {
    ...options,
    headers,
    body: options.body ? options.body : undefined,
  };

  const response = await fetch(endpoint, config);

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      error.message || "An error occurred while fetching the data",
    );
  }

  return response;
}
