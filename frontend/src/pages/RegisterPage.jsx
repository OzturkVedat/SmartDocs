import { useState } from "react";
import { Form, Button, Container, Alert, Spinner } from "react-bootstrap";
import { register } from "../api/authService";
import { useNavigate } from "react-router-dom";

export default function RegisterPage() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const validateForm = () => {
    if (!form.name || !form.email || !form.password) {
      setStatus({ type: "danger", message: "All fields are required." });
      return false;
    }

    if (!/\S+@\S+\.\S+/.test(form.email)) {
      setStatus({ type: "danger", message: "Please enter a valid email." });
      return false;
    }

    if (form.password.length < 6) {
      setStatus({
        type: "danger",
        message: "Password must be at least 6 characters.",
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setStatus(null);

    try {
      const res = await register(form);
      console.log("Register response:", res);

      if (res.status === 201) {
        setStatus({ type: "success", message: "Registration successful!" });

        setTimeout(() => navigate("/login"), 1000);
      } else {
        throw new Error("Unexpected response.");
      }
    } catch (err) {
      console.error("Registration error:", err);
      const msg = err.response?.data?.message || err.message || "Registration failed. Please try again.";
      setStatus({ type: "danger", message: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="mt-4" style={{ maxWidth: "500px" }}>
      <h3>Register</h3>
      {status && <Alert variant={status.type}>{status.message}</Alert>}
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Name</Form.Label>
          <Form.Control name="name" value={form.name} onChange={handleChange} required disabled={loading} />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Email</Form.Label>
          <Form.Control type="email" name="email" value={form.email} onChange={handleChange} required disabled={loading} />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Password</Form.Label>
          <Form.Control type="password" name="password" value={form.password} onChange={handleChange} required disabled={loading} />
        </Form.Group>
        <Button type="submit" disabled={loading}>
          {loading ? <Spinner animation="border" size="sm" /> : "Register"}
        </Button>
        <p className="mt-3">
          Already registered?{" "}
          <a
            href="/login"
            onClick={(e) => {
              e.preventDefault();
              navigate("/login");
            }}
          >
            Login
          </a>
        </p>
      </Form>
    </Container>
  );
}
