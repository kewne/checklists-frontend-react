import { Link } from "./Link";

export interface UpLink {
  label: string;
  to: string;
}

interface UpLinksProps {
  links: UpLink[];
}

export function UpLinks({ links }: UpLinksProps) {
  if (links.length === 0) {
    return null;
  }

  return (
    <nav aria-label="Up" className="mb-4 print:hidden">
      <ul className="flex flex-wrap items-center gap-2">
        {links.map((link) => (
          <li key={link.to}>
            <Link to={link.to} variant="inline">
              ← {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
