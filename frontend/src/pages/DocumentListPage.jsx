import { useEffect, useState } from "react";
import { listDocuments, deleteDocument } from "../api/documentService";
import { Container, Button, Table, Spinner, Alert, Modal } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

export default function DocumentListPage() {
  const [docs, setDocs] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const navigate = useNavigate();

  const loadDocs = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await listDocuments(page);
      setDocs(res.data.documents);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      console.error("Error fetching documents:", err);
      setError("Failed to load documents.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteDocument(id);
      setConfirmDeleteId(null);
      loadDocs();
    } catch (err) {
      console.error("Delete failed:", err);
      setError("Failed to delete document.");
    }
  };

  useEffect(() => {
    loadDocs();
  }, [page]);

  return (
    <Container className="mt-4">
      <h3>All Documents</h3>

      {error && <Alert variant="danger">{error}</Alert>}

      {loading ? (
        <div className="text-center my-5">
          <Spinner animation="border" />
        </div>
      ) : docs.length === 0 ? (
        <Alert variant="info">No documents found.</Alert>
      ) : (
        <>
          <Table striped bordered hover responsive className="mt-3">
            <thead>
              <tr>
                <th>Title</th>
                <th>Summary</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {docs.map((doc) => (
                <tr key={doc._id}>
                  <td>{doc.title}</td>
                  <td>{doc.summary.slice(0, 200)}...</td>
                  <td>{new Date(doc.createdAt).toLocaleDateString()}</td>
                  <td className="d-flex gap-2">
                    <Button variant="outline-primary" size="sm" onClick={() => navigate(`/dashboard/document/${doc._id}`)}>
                      View
                    </Button>
                    <Button variant="danger" size="sm" onClick={() => setConfirmDeleteId(doc._id)}>
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

          <div className="d-flex justify-content-between align-items-center mt-3">
            <div>
              Page {page} of {totalPages}
            </div>
            <div className="d-flex gap-2">
              <Button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                Prev
              </Button>
              <Button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
                Next
              </Button>
            </div>
          </div>
        </>
      )}

      <Modal show={!!confirmDeleteId} onHide={() => setConfirmDeleteId(null)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to delete this document?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setConfirmDeleteId(null)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={() => handleDelete(confirmDeleteId)}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}
