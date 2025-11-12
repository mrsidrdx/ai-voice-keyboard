import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { SettingsContent } from "@/components/settings/settings-content";

export default async function SettingsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <SettingsContent
      userName={session.user.name || ""}
      userEmail={session.user.email || ""}
    />
  );
}

