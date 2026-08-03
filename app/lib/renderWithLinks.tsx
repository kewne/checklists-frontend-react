import { Link } from "~/components/Link";

export function renderWithLinks(text: string): React.ReactNode[] {
  return text.split(/(\s+)/).map((token, i) => {
    if (/^\s+$/.test(token)) return token;
    const url = URL.parse(token);
    if (url?.protocol === "https:") {
      return (
        <Link key={i} to={token} target="_blank">
          {url.hostname}
        </Link>
      );
    }
    if (url?.protocol === "mailto:") {
      return (
        <Link key={i} to={token} target="_blank">
          {url.pathname}
        </Link>
      );
    }
    return token;
  });
}
