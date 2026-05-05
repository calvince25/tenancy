import { redirect } from "next/navigation";

export default function JoinPage({
  searchParams,
}: {
  searchParams: { code?: string };
}) {
  const code = searchParams.code;
  if (code) {
    redirect(`/onboarding/tenant?code=${code}`);
  }
  redirect("/onboarding/tenant");
}
