"use server";

import { cookies } from "next/headers";

export async function verifyStorefrontPassword(formData) {
  const password = formData.get("password");
  const actualPassword = process.env.STOREFRONT_PASSWORD;

  if (!actualPassword) {
    return { success: true }; // No password set in env
  }

  if (password === actualPassword) {
    const cookieStore = await cookies();
    cookieStore.set("storefront_unlocked", "true", {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 week
    });
    return { success: true };
  }

  return { success: false, error: "Incorrect Password Entered" };
}
