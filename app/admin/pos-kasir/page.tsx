"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PosKasirRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin/pos-kasir/history");
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-500">Redirecting...</p>
      </div>
    </div>
  );
}
