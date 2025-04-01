import { signOut } from "@/app/actions/auth";
import { redirect } from "next/navigation";

export default async function SignOutPage() {
  // サーバーサイドでサインアウト処理を実行
  await signOut();
  // signOut関数内でリダイレクト処理があるため、ここには到達しないはずですが、
  // 念のためリダイレクト処理を追加しておきます
  redirect("/login");
}
