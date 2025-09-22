import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

function TestSupabase() {
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const testConnection = async () => {
      try {
        // Simple test query
        const { data, error } = await supabase.auth.getSession();
        if (!error) {
          setConnected(true);
          console.log("✅ Supabase connected successfully!");
        } else {
          console.log("❌ Connection failed:", error);
        }
      } catch (err) {
        console.log("❌ Connection error:", err);
      } finally {
        setLoading(false);
      }
    };

    testConnection();
  }, []);

  return (
    <div style={{ padding: "20px", border: "1px solid #ccc", margin: "20px" }}>
      <h3>Supabase Connection Test</h3>
      <p>
        Status:{" "}
        {loading
          ? "⏳ Testing..."
          : connected
          ? "✅ Connected"
          : "❌ Not Connected"}
      </p>
    </div>
  );
}

export default TestSupabase;
