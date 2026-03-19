"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function HashRouter() {
  const router = useRouter();

  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const newRoute = hash.replace(/^#/, "");
      router.replace(newRoute);
    }
  }, [router]);

  return null;
}

