"use client";
import React, { useState } from "react";

const mockLogs = [
  "[2025-08-31T10:00:00Z] [INFO] Firewall started.",
  "[2025-08-31T10:01:12Z] [DEBUG] Rule added: IP blacklist 1.1.1.1.",
  "[2025-08-31T10:02:45Z] [INFO] Connection allowed: 8.8.8.8.",
  "[2025-08-31T10:03:10Z] [WARN] Suspicious port access: 5555.",
  "[2025-08-31T10:04:00Z] [ERROR] Blocked domain: google.com.",
];

export default function LogsTestingComponent() {
  const [logs] = useState<string[]>(mockLogs);

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", marginBottom: "2rem" }}>
      <h3 style={{ marginBottom: "1rem" }}>Filter Logs</h3>
      {logs.length === 0 ? (
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
