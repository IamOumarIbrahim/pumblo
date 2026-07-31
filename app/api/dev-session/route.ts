export async function GET(request: Request) {
  if (process.env.NODE_ENV !== "development") {
    return new Response("Not found", { status: 404 });
  }

  const url = new URL(request.url);
  const email = url.searchParams.get("email")?.trim().toLowerCase();
  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return Response.json({ error: "A valid test email is required." }, { status: 400 });
  }

  return new Response(null, {
    status: 302,
    headers: {
      location: new URL("/settings/profile", request.url).toString(),
      "set-cookie": `pumblo_dev_user=${encodeURIComponent(email)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=3600`,
    },
  });
}
