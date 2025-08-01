import { useEffect, useState } from "react";
import { listDocuments, deleteDocument } from "../api/documentService";
import { Container, Button, Table, Spinner } from "react-bootstrap";

export default function DocumentListPage() {
  const [docs, setDocs] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const loadDocs = async () => {
    setLoading(true);
    try {
      const res = await listDocuments(page);
      setDocs(res.data.documents);
      setTotalPages(res.data.totalPages);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    await deleteDocument(id);
    loadDocs();
  };

  useEffect(() => {
    loadDocs();
  }, [page]);

  return (
    <Container className="mt-4">
      <h3>All Documents</h3>
      {loading ? (
        <Spinner animation="border" />
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Title</th>
              <th>Summary</th>
              <th>Created</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {docs.map((doc) => (
              <tr key={doc._id}>
                <td>{doc.title}</td>
                <td>{doc.summary.slice(0, 60)}...</td>
                <td>{new Date(doc.createdAt).toLocaleDateString()}</td>
                <td>
                  <Button variant="danger" size="sm" onClick={() => handleDelete(doc._id)}>
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <div className="d-flex gap-2 mt-3">
        <Button disabled={page <= 1} onClick={() => setPage(page - 1)}>
          Prev
        </Button>
        <Button disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
          Next
        </Button>
      </div>
    </Container>
  );
}
