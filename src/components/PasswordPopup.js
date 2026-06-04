"use client";

import { useState } from "react";
import { verifyStorefrontPassword } from "@/app/actions/password";
import { useRouter } from "next/navigation";

export default function PasswordPopup() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.target);
    const result = await verifyStorefrontPassword(formData);

    if (result.success) {
      router.refresh(); // Refresh to re-render the page without the popup
    } else {
      setError(result.error);
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: "fixed",
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: "var(--background, #fff)",
      zIndex: 99999,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px"
    }}>
      <div style={{
        maxWidth: "400px",
        width: "100%",
        textAlign: "center"
      }}>
        <h1 style={{
          fontSize: "2rem",
          fontWeight: 700,
          marginBottom: "10px",
          fontFamily: "var(--font-display, inherit)"
        }}>
          Store is password protected
        </h1>
        <p style={{
          color: "var(--ink-muted, #666)",
          marginBottom: "30px",
          lineHeight: 1.5
        }}>
          Please enter the password to access the homepage.
        </p>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          <input
            type="password"
            name="password"
            placeholder="Password"
            required
            style={{
              padding: "12px 16px",
              border: "1px solid var(--border, #e5e5e5)",
              borderRadius: "8px",
              fontSize: "1rem",
              outline: "none",
              width: "100%",
              boxSizing: "border-box"
            }}
          />
          {error && (
            <p style={{ color: "red", fontSize: "0.875rem", margin: 0, textAlign: "left" }}>
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            style={{
              backgroundColor: "var(--ink, #000)",
              color: "var(--surface, #fff)",
              border: "none",
              padding: "12px 16px",
              borderRadius: "8px",
              fontSize: "1rem",
              fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
              width: "100%",
              transition: "opacity 0.2s ease"
            }}
          >
            {loading ? "Verifying..." : "Enter"}
          </button>
        </form>
      </div>
    </div>
  );
}
