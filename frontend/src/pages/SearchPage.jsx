import { useState } from "react";
import { searchDocuments } from "../api/documentService";
import { Container, Form, Button, Card } from "react-bootstrap";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);

  const handleSearch = async () => {
    const res = await searchDocuments(query);
    setResults(res.data.results);
  };

  return (
    <Container className="mt-4">
      <h3>Semantic Search</h3>
      <Form.Group className="mb-3">
        <Form.Control type="text" value={query} placeholder="Type your question..." onChange={(e) => setQuery(e.target.value)} />
      </Form.Group>
      <Button onClick={handleSearch}>Search</Button>

      <div className="mt-4">
        {results.map((doc) => (
          <Card key={doc.id} className="mb-3">
            <Card.Body>
              <Card.Title>{doc.title}</Card.Title>
              <Card.Text>{doc.summary}</Card.Text>
              <small>Relevance: {doc.relevance.toFixed(2)}</small>
            </Card.Body>
          </Card>
        ))}
      </div>
    </Container>
  );
}
