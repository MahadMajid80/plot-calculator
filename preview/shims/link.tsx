import { navigate } from "../router";

export default function Link({ href, children, onClick, ...rest }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) {
  if (href.startsWith("#")) return <a href={href} onClick={onClick} {...rest}>{children}</a>;
  return (
    <a
      href={href}
      {...rest}
      onClick={(e) => {
        onClick?.(e);
        e.preventDefault();
        navigate(href);
      }}
    >
      {children}
    </a>
  );
}
