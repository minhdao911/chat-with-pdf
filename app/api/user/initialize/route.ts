import { NextRequest, NextResponse } from "next/server";
import { ensureUserExists } from "@lib/account";
import { auth } from "@clerk/nextjs/server";

export async function POST(request: NextRequest) {
  try {
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await ensureUserExists();

    return NextResponse.json({
      success: true,
      user: user ? { id: user.id, email: user.email, name: user.name } : null,
    });
  } catch (error) {
    console.error("Error initializing user:", error);
    return NextResponse.json(
      { error: "Failed to initialize user" },
      { status: 500 }
    );
  }
}
