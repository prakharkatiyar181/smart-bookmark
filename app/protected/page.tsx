import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { InfoIcon, Loader2 } from "lucide-react";
import BookmarksClient from "@/components/bookmarks-client";
import { Suspense } from "react";

async function ProtectedContent() {
  const supabase = await createClient();

  // getUser is the secure way to get the user and it might block rendering
  // but it is necessary for a protected route.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/auth/login");
  }

  return (
    <>
      <div className="w-full">
        <div className="bg-accent text-sm p-3 px-5 rounded-md text-foreground flex gap-3 items-center">
          <InfoIcon size="16" strokeWidth={2} />
          This is a protected page that you can only see as an authenticated
          user
        </div>
      </div>
      <div className="flex flex-col gap-2 items-start w-full">
        <h2 className="font-bold text-2xl mb-4">Your Bookmarks Manager</h2>
        <BookmarksClient user={user} />
      </div>
    </>
  );
}

export default function ProtectedPage() {
  return (
    <div className="flex-1 w-full flex flex-col gap-12">
      <Suspense
        fallback={
          <div className="flex justify-center items-center w-full h-32">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        }
      >
        <ProtectedContent />
      </Suspense>
    </div>
  );
}
