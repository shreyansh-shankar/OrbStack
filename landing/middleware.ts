import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const hostname = request.headers.get("host") || "";

  // Skip static files, api routes, and file downloads
  if (
    url.pathname.startsWith("/_next") ||
    url.pathname.startsWith("/api") ||
    url.pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Check if we are accessing via install subdomain (production or local localhost)
  const isInstallSubdomain = hostname.startsWith("install.") || hostname.includes("install.localhost");
  if (isInstallSubdomain) {
    return NextResponse.rewrite(new URL("/install.sh", request.url));
  }

  // Check if we are accessing via docs subdomain (production or local localhost)
  const isDocsSubdomain = hostname.startsWith("docs.") || hostname.includes("docs.localhost");

  if (isDocsSubdomain) {
    let path = url.pathname;
    
    // If the path is exactly "/", rewrite to the welcome page
    if (path === "/" || path === "") {
      path = "/introduction/welcome";
    }

    // Rewrite docs.thelastdeploy.com/path internally to the /docs/path folder
    // If it already starts with /docs, keep it as is, otherwise prefix with /docs
    const targetPath = path.startsWith("/docs") ? path : `/docs${path}`;
    return NextResponse.rewrite(new URL(targetPath, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
