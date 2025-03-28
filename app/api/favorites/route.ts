import { getFavoriteStatus, toggleFavorite } from "@/app/repositories/favorites-repository";
import { type NextRequest, NextResponse } from "next/server";

// お気に入り登録API
export async function POST(request: NextRequest) {
  try {
    const { baristaProfileId } = await request.json();

    if (!baristaProfileId) {
      return NextResponse.json({ error: "バリスタIDが必要です" }, { status: 400 });
    }

    // 匿名IDをリクエストCookieから直接取得
    const anonymousId = request.cookies.get("anonymous_id")?.value;

    // お気に入りトグル処理
    const { data, error } = await toggleFavorite(baristaProfileId, anonymousId);

    if (error) {
      return NextResponse.json(
        { error: error.message || "お気に入り処理に失敗しました" },
        { status: 500 }
      );
    }

    if (data?.action === "add") {
      return NextResponse.json({ success: true, action: "add" }, { status: 201 });
    }

    return NextResponse.json({ success: true, action: "remove" }, { status: 200 });
  } catch (error) {
    console.error("お気に入り処理エラー:", error);
    return NextResponse.json({ error: "サーバーエラーが発生しました" }, { status: 500 });
  }
}

// お気に入り状態取得API
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const baristaProfileId = searchParams.get("baristaProfileId");

    if (!baristaProfileId) {
      return NextResponse.json({ error: "バリスタIDが必要です" }, { status: 400 });
    }

    // 匿名IDをリクエストCookieから直接取得
    const anonymousId = request.cookies.get("anonymous_id")?.value;

    // お気に入り状態取得（anonymousIdがnullでも処理できる）
    const { data, error } = await getFavoriteStatus(baristaProfileId, anonymousId);

    if (error) {
      return NextResponse.json({ error: "お気に入り状態の取得に失敗しました" }, { status: 500 });
    }
    return NextResponse.json({ isFavorite: data }, { status: 200 });
  } catch (error) {
    console.error("お気に入り状態取得エラー:", error);
    return NextResponse.json({ error: "サーバーエラーが発生しました" }, { status: 500 });
  }
}
