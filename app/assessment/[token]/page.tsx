import PublicAssessmentForm from "@/components/PublicAssessmentForm";

export const metadata = {
  title: "Operational & ESG Pre-Kickoff Assessment | Valora Advisory",
};

export default async function AssessmentPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  return <PublicAssessmentForm token={token} />;
}
