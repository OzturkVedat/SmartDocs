import { Container, Row, Col, Nav } from "react-bootstrap";
import { Link, Outlet } from "react-router-dom";

export default function DashboardLayout() {
  return (
    <Container fluid>
      <Row>
        <Col xs={2} className="bg-light min-vh-100 p-3">
          <Nav className="flex-column">
            <Nav.Link as={Link} to="/">
              Documents
            </Nav.Link>
            <Nav.Link as={Link} to="/upload">
              Upload
            </Nav.Link>
            <Nav.Link as={Link} to="/search">
              Search
            </Nav.Link>
          </Nav>
        </Col>
        <Col xs={10} className="p-4">
          <Outlet />
        </Col>
      </Row>
    </Container>
  );
}
