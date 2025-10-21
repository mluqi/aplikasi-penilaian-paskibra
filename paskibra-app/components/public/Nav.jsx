import Link from "next/link";

const navLinks = [
  { name: "Home", href: "/" },
  { name: "Events", href: "/events" },
  { name: "Tentang Kami", href: "/about" },
  { name: "Kontak", href: "/contact" },
];

const Nav = () => {
  return (
    <nav>
      <ul className="flex items-center gap-8">
        {navLinks.map((link) => (
          <li key={link.name}>
            <Link
              href={link.href}
              className="text-base font-medium text-foreground/70 transition-colors hover:text-foreground px-3 py-2 rounded-md"
            >
              {link.name}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Nav;
