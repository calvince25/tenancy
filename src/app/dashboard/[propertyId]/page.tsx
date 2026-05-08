import { redirect } from "next/navigation";

export default function PropertyDashboardPage({ params }: { params: { propertyId: string } }) {
  redirect(`/dashboard/${params.propertyId}/overview`);
}
