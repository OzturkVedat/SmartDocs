import { useState } from "react";
import { uploadDocument } from "../api/documentService";
import { Container, Form, Button, Alert, Spinner } from "react-bootstrap";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export default function UploadPage() {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const validateFile = () => {
    if (!file) {
      setStatus({ type: "warning", message: "Please select a file." });
      return false;
    }

    if (file.type !== "application/pdf") {
      setStatus({ type: "danger", message: "Only PDF files are allowed." });
      return false;
    }

    if (file.size > MAX_FILE_SIZE) {
      setStatus({
        type: "danger",
        message: "File is too large. Maximum size is 5MB.",
      });
      return false;
    }

    return true;
  };

  const handleUpload = async () => {
    setStatus(null);
    if (!validateFile()) return;

    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      await uploadDocument(formData);
      setStatus({ type: "success", message: "Upload successful!" });
      setFile(null); // reset file
    } catch (err) {
      console.error("Error while uploading:", err);
      const message = err.response?.data?.error || "Upload failed. Please try again.";
      setStatus({ type: "danger", message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="mt-4" style={{ maxWidth: "600px" }}>
      <h3>Upload Document</h3>
      {status && <Alert variant={status.type}>{status.message}</Alert>}
      <Form>
        <Form.Group className="mb-3">
          <Form.Label>Select a PDF file</Form.Label>
          <Form.Control type="file" accept=".pdf" onChange={(e) => setFile(e.target.files[0])} disabled={loading} />
        </Form.Group>
        <Button onClick={handleUpload} disabled={loading || !file} variant="primary">
          {loading ? (
            <>
              <Spinner size="sm" animation="border" className="me-2" />
              Uploading...
            </>
          ) : (
            "Upload"
          )}
        </Button>
      </Form>
    </Container>
  );
}
