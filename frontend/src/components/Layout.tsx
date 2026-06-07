import { ReactNode } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="app-shell">
      <header className="app-header">
        <Navbar />
      </header>

      <main className="app-content">{children}</main>

      <Footer />
    </div>
  );
};

export default Layout;
