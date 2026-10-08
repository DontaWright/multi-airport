import { query } from "../../../lib/db";

// ---------- Database Connection Test ----------
export async function GET() {
  try {
    // ---------- Run Test Query ----------
    const result = await query("SELECT NOW() AS server_time");

    // ---------- Return Success Response ----------
    return Response.json({
      success: true,
      message: "Navora connected to PostgreSQL!",
      serverTime: result.rows[0].server_time,
    });
  } catch (error) {
    // ---------- Log Error on Server ----------
    console.error("Database connection failed:", error);

    // ---------- Return Safe Error Response ----------
    return Response.json(
      {
        success: false,
        message: "Database connection failed",
      },
      { status: 500 },
    );
  }
}
