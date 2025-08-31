"use client";

import React, { useState, useEffect } from "react";

export default function LogsTestingComponent() {
  const [logs, setLogs] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchLogs() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/firewall/logs`);
        if (!res.ok) throw new Error("Failed to fetch logs");
        const data = await res.json();
        setLogs(data.logs || []);
      } catch (err: any) {
        setError(err.message || "Error fetching logs");
        setLogs([]);
      } finally {
        setLoading(false);
      }
    }
    fetchLogs();
  }, []);

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", marginBottom: "2rem" }}>
      <h3 style={{ marginBottom: "1rem" }}>Logs</h3>
      {loading ? (
        <div>Loading logs...</div>
      ) : error ? (
        <div style={{ color: "red" }}>{error}</div>
      ) : logs.length === 0 ? (
        <div>No logs found.</div>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {logs.map((log, idx) => (
            <li key={idx} style={{ padding: "8px 0", borderBottom: "1px solid #eee", fontSize: "1rem" }}>{log}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
