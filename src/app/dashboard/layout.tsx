import { getAuthenticatedUser } from "@/lib/user";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  
  const user = await getAuthenticatedUser();
  if (!user) {
    redirect("/login"); // Redirect if unauthorized
  }
  return (
    <div>
      {children}
    </div>
  );

}