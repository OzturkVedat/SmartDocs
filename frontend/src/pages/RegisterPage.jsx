import { useState } from "react";
import { Form, Button, Container, Alert } from "react-bootstrap";
import { register } from "../api/authService";

export default function RegisterPage() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [status, setStatus] = useState(null);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(form);
      setStatus({ type: "success", message: "Registration successful!" });
    } catch (err) {
      setStatus({ type: "danger", message: err.response?.data?.message || "Registration failed." });
    }
  };

  return (
    <Container className="mt-4" style={{ maxWidth: "500px" }}>
      <h3>Register</h3>
      {status && <Alert variant={status.type}>{status.message}</Alert>}
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Name</Form.Label>
          <Form.Control name="name" value={form.name} onChange={handleChange} required />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Email</Form.Label>
          <Form.Control type="email" name="email" value={form.email} onChange={handleChange} required />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Password</Form.Label>
          <Form.Control type="password" name="password" value={form.password} onChange={handleChange} required />
        </Form.Group>
        <Button type="submit">Register</Button>
      </Form>
    </Container>
  );
}
