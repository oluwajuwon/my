import React from "react";
import { renderToString } from "react-dom/server";
import App from "./App";

jest.mock(
  "react-router-dom",
  () => ({
    Link: ({ children, to, ...props }) => <a href={to} {...props}>{children}</a>,
    NavLink: ({ children, to, className, ...props }) => (
      <a href={to} className={typeof className === "function" ? className({ isActive: false }) : className} {...props}>{children}</a>
    ),
    Outlet: () => <main>Page content</main>,
    useLocation: () => ({ pathname: "/" }),
  }),
  { virtual: true },
);

it("renders the application shell", () => {
  const markup = renderToString(<App />);
  expect(markup).toContain("Juwonlo");
  expect(markup).toContain("Page content");
});
