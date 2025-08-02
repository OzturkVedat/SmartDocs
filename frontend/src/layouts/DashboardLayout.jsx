import { Container, Nav } from "react-bootstrap";
import { Link, Outlet, useLocation } from "react-router-dom";

export default function DashboardLayout() {
  const location = useLocation();

  return (
    <div className="d-flex flex-column min-vh-100">
      {/* Header */}
      <header className="bg-dark text-white py-2 px-4 d-flex justify-content-between align-items-center">
        <h5 className="mb-0">Document Panel</h5>
        <span className="small">Logged in</span>
      </header>

      {/* Main layout: Sidebar + Page content */}
      <div className="d-flex flex-grow-1">
        {/* Sidebar */}
        <aside style={{ width: "240px" }} className="bg-light border-end p-3 d-flex flex-column">
          <Nav className="flex-column">
            <Nav.Link as={Link} to="/dashboard" active={location.pathname === "/dashboard"}>
              Documents
            </Nav.Link>
            <Nav.Link as={Link} to="/dashboard/upload" active={location.pathname === "/dashboard/upload"}>
              Upload Document
            </Nav.Link>
            <Nav.Link as={Link} to="/dashboard/search" active={location.pathname === "/dashboard/search"}>
              Semantic Search
            </Nav.Link>
          </Nav>
        </aside>

        {/* Main Content */}
        <main className="p-4 flex-grow-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
