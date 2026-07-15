import { requireSession } from "@/lib/auth/session";
import { InicioContent } from "./inicio-content";

export default async function InicioPage() {
  await requireSession();

  return <InicioContent />;
}
