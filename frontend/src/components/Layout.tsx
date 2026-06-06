import { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div>
      <header>
        <h1>Survey Stats</h1>
      </header>
      <section>{children}</section>
    </div>
  );
};

export default Layout;
