import { useEffect, useState } from "react";
import apiService from "@/services/apiService";

export function useAPIStatus() {
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiService
      .get("/")
      .then((res) => setStatus(res.data.message))
      .catch((err) => setError(err.message));
  }, []);

  return { status, error };
}
