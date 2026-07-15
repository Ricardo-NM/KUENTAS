import { RecoveryForm } from "./recovery-form";

export default async function RecuperacionPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string | string[] }>;
}) {
  const params = await searchParams;
  const token = Array.isArray(params.token) ? params.token[0] : params.token;

  return <RecoveryForm token={token} />;
}
