"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function JoinButton({ programId }: { programId?: string }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleJoin = async () => {
    if (!programId) return;
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/loyalty/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ programId }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to join program");
      }

      router.push("/wallet");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
      setIsLoading(false);
    }
  };

  return (
    <div>
      <Button
        variant="primary"
        size="lg"
        className="w-full font-bold"
        onClick={handleJoin}
        isLoading={isLoading}
      >
        Join Loyalty Program
      </Button>
      {error && <p className="mt-2 text-xs text-brand-error text-center">{error}</p>}
    </div>
  );
}
