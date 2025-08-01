import { useState } from "react";
import { uploadDocument } from "../api/documentService";
import { Container, Form, Button, Alert } from "react-bootstrap";

export default function UploadPage() {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState(null);

  const handleUpload = async () => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      await uploadDocument(formData);
      setStatus({ type: "success", message: "Upload successful!" });
    } catch (err) {
      console.error("Error while uploading: ", err);
      setStatus({ type: "danger", message: "Upload failed." });
    }
  };

  return (
    <Container className="mt-4">
      <h3>Upload Document (pdf)</h3>
      {status && <Alert variant={status.type}>{status.message}</Alert>}
      <Form>
        <Form.Group className="mb-3">
          <Form.Label>Select a file</Form.Label>
          <Form.Control type="file" onChange={(e) => setFile(e.target.files[0])} />
        </Form.Group>
        <Button onClick={handleUpload}>Upload</Button>
      </Form>
    </Container>
  );
}
