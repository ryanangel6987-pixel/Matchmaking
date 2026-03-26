export const dynamic = "force-dynamic";

export default function ApplyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Break out of the (auth) layout's max-w-md / centered constraint.
  // The application funnel manages its own full-screen layout.
  return (
    <div className="fixed inset-0 z-40 overflow-y-auto bg-surface">
      {children}
    </div>
  );
}
