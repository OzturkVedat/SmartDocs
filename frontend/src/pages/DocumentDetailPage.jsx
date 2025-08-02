import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getDocumentById, extractKeywords } from "../api/documentService";
import { Container, Spinner, Badge, Alert, Button, Row, Col } from "react-bootstrap";

export default function DocumentDetailPage() {
  const { id } = useParams();
  const [doc, setDoc] = useState(null);
  const [keywords, setKeywords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadDocumentDetails = async () => {
    setLoading(true);
    setError(null);

    try {
      const [docRes, keywordRes] = await Promise.all([getDocumentById(id), extractKeywords(id)]);

      setDoc(docRes.data);
      setKeywords(keywordRes.data.keywords || []);
    } catch (err) {
      console.error("Failed to load document details:", err);
      setError("Failed to load document details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocumentDetails();
  }, [id]);

  if (loading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" />
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-4">
        <Alert variant="danger">{error}</Alert>
        <Button variant="outline-secondary" onClick={loadDocumentDetails}>
          Retry
        </Button>
      </Container>
    );
  }

  if (!doc) {
    return (
      <Container className="mt-4">
        <Alert variant="warning">Document not found.</Alert>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <Row>
        <Col>
          <h3 className="mb-3">{doc.title}</h3>
          <p className="lead">{doc.summary || "No summary available."}</p>
        </Col>
      </Row>

      <Row className="mt-3">
        <Col>
          <h5>Keywords:</h5>
          {keywords.length > 0 ? (
            <div className="d-flex gap-2 flex-wrap mt-2">
              {keywords.map((kw, idx) => (
                <Badge key={idx} bg="info" pill>
                  {kw}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-muted">No keywords found.</p>
          )}
        </Col>
      </Row>

      <hr />

      <Row className="mt-3">
        <Col>
          <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
            View Full PDF
          </a>
        </Col>
      </Row>
    </Container>
  );
}
