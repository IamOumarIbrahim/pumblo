import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

export type ChatGPTUser = {
  displayName: string;
  email: string;
  fullName: string | null;
};

const EMAIL_HEADER = "oai-authenticated-user-email";
const NAME_HEADER = "oai-authenticated-user-full-name";
const NAME_ENCODING_HEADER = "oai-authenticated-user-full-name-encoding";

export async function getChatGPTUser(): Promise<ChatGPTUser | null> {
  const requestHeaders = await headers();
  let email = requestHeaders.get(EMAIL_HEADER)?.trim().toLowerCase();
  if (!email && process.env.NODE_ENV === "development") {
    email = (await cookies()).get("pumblo_dev_user")?.value.toLowerCase();
  }
  if (!email) return null;

  const encodedName = requestHeaders.get(NAME_HEADER);
  const fullName =
    encodedName &&
    requestHeaders.get(NAME_ENCODING_HEADER) === "percent-encoded-utf-8"
      ? safeDecode(encodedName)
      : null;

  return {
    displayName: fullName || email.split("@")[0],
    email,
    fullName,
  };
}

export async function requireChatGPTUser(
  returnTo: string,
): Promise<ChatGPTUser> {
  const user = await getChatGPTUser();
  if (user) return user;
  redirect(chatGPTSignInPath(returnTo));
}

export function chatGPTSignInPath(returnTo = "/"): string {
  return `/signin-with-chatgpt?return_to=${encodeURIComponent(safeReturnTo(returnTo))}`;
}

export function chatGPTSignOutPath(returnTo = "/"): string {
  return `/signout-with-chatgpt?return_to=${encodeURIComponent(safeReturnTo(returnTo))}`;
}

function safeReturnTo(value: string): string {
  if (!value.startsWith("/") || value.startsWith("//")) return "/";
  try {
    const url = new URL(value, "https://pumblo.local");
    if (url.origin !== "https://pumblo.local") return "/";
    if (
      ["/signin-with-chatgpt", "/signout-with-chatgpt", "/callback"].includes(
        url.pathname,
      )
    ) {
      return "/";
    }
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return "/";
  }
}

function safeDecode(value: string): string | null {
  try {
    return decodeURIComponent(value);
  } catch {
    return null;
  }
}
