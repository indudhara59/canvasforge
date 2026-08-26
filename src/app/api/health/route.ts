import { NextResponse } from "next/server";

import connectToDatabase from "@/lib/mongodb";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const mongooseInstance = await connectToDatabase();
    const db = mongooseInstance.connection.db;

    if (!db) {
      throw new Error("Database connection has no active db handle");
    }

    await db.admin().command({ ping: 1 });

    return NextResponse.json({
      status: "ok",
      db: "connected",
      readyState: mongooseInstance.connection.readyState,
    });
  } catch (error) {
    console.error("Health check failed:", error);
    return NextResponse.json(
      {
        status: "error",
        db: "disconnected",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
