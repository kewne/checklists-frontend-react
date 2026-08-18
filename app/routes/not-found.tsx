/**
 * Catch-all route for unmatched paths inside a valid locale prefix.
 * The clientLoader always throws a 404 response so the root
 * ErrorBoundary renders the localized "page not found" message.
 */
export function clientLoader() {
  throw new Response(null, { status: 404 });
}

export default function NotFound() {
  return null;
}
