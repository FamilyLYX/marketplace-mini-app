import type { NextApiRequest, NextApiResponse, NextApiHandler } from "next";
import { NextResponse } from "next/server";

export function withAuth(handler: NextApiHandler) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const connected = req.cookies.connected;

    if (connected !== "true") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    return handler(req, res);
  };
}
