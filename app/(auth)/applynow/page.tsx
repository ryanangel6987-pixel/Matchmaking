export const dynamic = "force-dynamic";

import { ApplicationForm } from "@/components/apply/application-form";

export default function ApplyNowPage() {
  return <ApplicationForm redirectTo="/applynow/confirmed" />;
}
