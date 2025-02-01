import { db } from "../../../../lib/db";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";

export async function GET() {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get counts
    const [users, vaccines, certificates] = await Promise.all([
      db.user.count(),
      db.vaccine.count(),
      db.certificate.count(),
    ]);

    return NextResponse.json({
      users,
      vaccines,
      certificates,
    });
  } catch (error) {
    console.error("Error fetching dashboard counts:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard counts" },
      { status: 500 }
    );
  }
} 