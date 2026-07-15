"use server";

import { destroyCurrentSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";

export async function logoutAction() {
  await destroyCurrentSession();
  redirect("/login");
}
