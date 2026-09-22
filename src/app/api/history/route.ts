import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("q") || "";
    const lang = searchParams.get("lang") || "";

    const whereClause: any = {
      userId: session.userId,
    };

    if (search) {
      whereClause.OR = [
        { sourceText: { contains: search } },
        { translatedText: { contains: search } },
      ];
    }

    if (lang) {
      whereClause.OR = [
        { sourceLang: lang },
        { targetLang: lang },
      ];
    }

    const history = await db.translation.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      take: 100, // Limit to recent 100 items
    });

    return NextResponse.json({
      success: true,
      data: history,
    });
  } catch (error: any) {
    console.error("GET /api/history error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch history" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const clearAll = searchParams.get("clearAll") === "true";

    if (clearAll) {
      await db.translation.deleteMany({
        where: { userId: session.userId },
      });
      return NextResponse.json({ success: true, message: "All history cleared." });
    }

    if (!id) {
      return NextResponse.json({ success: false, error: "ID is required." }, { status: 400 });
    }

    // Ensure user owns this translation
    await db.translation.deleteMany({
      where: {
        id,
        userId: session.userId,
      },
    });

    return NextResponse.json({ success: true, message: "Record deleted." });
  } catch (error: any) {
    console.error("DELETE /api/history error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete history item." },
      { status: 500 }
    );
  }
}
