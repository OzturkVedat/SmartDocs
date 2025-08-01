import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getDocumentById, extractKeywords } from "../api/documentService";
import { Container, Spinner, Badge } from "react-bootstrap";

export default function DocumentDetailPage() {
  const { id } = useParams();
  const [doc, setDoc] = useState(null);
  const [keywords, setKeywords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const res = await getDocumentById(id);
      setDoc(res.data);

      const keywordRes = await extractKeywords(id);
      setKeywords(keywordRes.data.keywords);
      setLoading(false);
    })();
  }, [id]);

  if (loading) return <Spinner animation="border" className="m-5" />;

  return (
    <Container className="mt-4">
      <h3>{doc.title}</h3>
      <p>{doc.summary}</p>
      <h5>Keywords:</h5>
      <div className="d-flex gap-2 flex-wrap">
        {keywords.map((kw, idx) => (
          <Badge key={idx} bg="info">
            {kw}
          </Badge>
        ))}
      </div>
      <hr />
      <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary mt-3">
        View Full PDF
      </a>
    </Container>
  );
}
