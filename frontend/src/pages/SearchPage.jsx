import { useState } from "react";
import { searchDocuments } from "../api/documentService";
import { Container, Form, Button, Card, Spinner, Alert, Row, Col } from "react-bootstrap";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [status, setStatus] = useState(null); // success | danger | warning
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) {
      setStatus({ type: "warning", message: "Please enter a query first." });
      setResults([]);
      return;
    }

    setLoading(true);
    setStatus(null);
    try {
      const res = await searchDocuments(trimmedQuery);
      const data = res.data.results;

      if (data.length === 0) {
        setStatus({
          type: "warning",
          message: "No relevant documents found.",
        });
      } else {
        setStatus({
          type: "success",
          message: `Found ${data.length} relevant document(s).`,
        });
      }

      setResults(data);
    } catch (err) {
      console.error("Search error:", err);
      setStatus({
        type: "danger",
        message: err.response?.data?.error || "Search failed. Try again.",
      });
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch();
    }
  };

  return (
    <Container className="mt-4">
      <h3>Semantic Search</h3>

      <Form.Group className="mb-3">
        <Form.Control type="text" value={query} placeholder="Type what you're looking for..." onChange={(e) => setQuery(e.target.value)} onKeyDown={handleKeyPress} disabled={loading} />
      </Form.Group>

      <Button variant="primary" onClick={handleSearch} disabled={loading}>
        {loading ? <Spinner size="sm" animation="border" /> : "Search"}
      </Button>

      {status && (
        <Alert variant={status.type} className="mt-3">
          {status.message}
        </Alert>
      )}

      <Row className="mt-4">
        {results.map((doc) => (
          <Col key={doc.id} md={6}>
            <Card className="mb-3 shadow-sm">
              <Card.Body>
                <Card.Title>{doc.title}</Card.Title>
                <Card.Text>{doc.summary}</Card.Text>
                <div className="text-muted small">Relevance: {doc.relevance.toFixed(2)}</div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
}
