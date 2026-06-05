import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { CallerTree } from "@/components/features/docs/CallerTree/CallerTree";

export const metadata: Metadata = {
  title: "Caller Tree — XAC Capital",
};

const CallerTreePage = () => (
  <div className="space-y-6">
    <PageHeader
      title="Caller Tree"
      subtitle="Select a route to trace its full dependency chain — every component, service, controller, and model it touches."
    />
    <CallerTree />
  </div>
);

export default CallerTreePage;
