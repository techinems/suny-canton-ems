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
      <h1>Welcome to the Dashboard, {user.first_name}!</h1>
      {children}
    </div>
  );

}