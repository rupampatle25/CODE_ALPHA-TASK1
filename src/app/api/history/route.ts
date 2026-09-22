import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Please sign in to view your translation history." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("q")?.trim() || "";
    const lang = searchParams.get("lang")?.trim() || "";
    const exportFormat = searchParams.get("export")?.toLowerCase() || "";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const pageSize = Math.min(
      100,
      Math.max(1, parseInt(searchParams.get("pageSize") || searchParams.get("limit") || "10", 10))
    );

    // Build query with strict user data isolation
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
      whereClause.AND = [
        ...(whereClause.AND || []),
        {
          OR: [
            { sourceLang: lang },
            { targetLang: lang },
          ],
        },
      ];
    }

    // Export handler for data portability & user backup
    if (exportFormat === "json") {
      const allExportItems = await db.translation.findMany({
        where: whereClause,
        orderBy: { createdAt: "desc" },
      });

      const jsonString = JSON.stringify(
        {
          exportDate: new Date().toISOString(),
          userId: session.userId,
          recordCount: allExportItems.length,
          translations: allExportItems,
        },
        null,
        2
      );

      return new NextResponse(jsonString, {
        headers: {
          "Content-Type": "application/json",
          "Content-Disposition": `attachment; filename="bhashasetu_history_${new Date().toISOString().slice(0, 10)}.json"`,
        },
      });
    }

    // Calculate pagination totals
    const totalItems = await db.translation.count({
      where: whereClause,
    });

    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
    const safePage = Math.min(page, totalPages);
    const skip = (safePage - 1) * pageSize;

    const items = await db.translation.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
    });

    return NextResponse.json({
      success: true,
      data: {
        items,
        pagination: {
          totalItems,
          totalPages,
          currentPage: safePage,
          pageSize,
          hasNextPage: safePage < totalPages,
          hasPrevPage: safePage > 1,
        },
      },
    });
  } catch (error: any) {
    console.error("GET /api/history error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch translation history." },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Please sign in to manage translation history." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const clearAll = searchParams.get("clearAll") === "true";

    // 1. Clear All History (scoped to authenticated user only)
    if (clearAll) {
      const deleted = await db.translation.deleteMany({
        where: { userId: session.userId },
      });
      return NextResponse.json({
        success: true,
        message: `Successfully cleared all ${deleted.count} history records.`,
        deletedCount: deleted.count,
      });
    }

    // 2. Single Record Deletion (enforces row-level ownership)
    if (id) {
      const deleted = await db.translation.deleteMany({
        where: {
          id,
          userId: session.userId,
        },
      });

      if (deleted.count === 0) {
        return NextResponse.json(
          { success: false, error: "Record not found or unauthorized to delete." },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        message: "Translation record deleted permanently.",
      });
    }

    // 3. Batch deletion by IDs in JSON body
    try {
      const body = await req.json();
      if (Array.isArray(body?.ids) && body.ids.length > 0) {
        const deleted = await db.translation.deleteMany({
          where: {
            id: { in: body.ids },
            userId: session.userId,
          },
        });
        return NextResponse.json({
          success: true,
          message: `Deleted ${deleted.count} translation records.`,
          deletedCount: deleted.count,
        });
      }
    } catch {
      // Body not provided or not JSON
    }

    return NextResponse.json(
      { success: false, error: "Record ID or clearAll parameter is required." },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("DELETE /api/history error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete translation history." },
      { status: 500 }
    );
  }
}
