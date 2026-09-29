
import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedInternship, setSelectedInternship] = useState(null);

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    education: "",
    cover_message: "",
  });

  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");

  const fetchInternships = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "http://localhost:5000/api/internships"
      );

      if (!response.ok) {
        throw new Error("Failed to load internships");
      }

      const result = await response.json();
      setInternships(result.data || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load internships");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInternships();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };

  const openApplicationForm = (internship) => {
    setSelectedInternship(internship);

    setFormData({
      full_name: "",
      email: "",
      phone: "",
      education: "",
      cover_message: "",
    });

    setSubmitError("");
    setSubmitSuccess("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setSubmitError("");
    setSubmitSuccess("");

    if (
      !formData.full_name.trim() ||
      !formData.email.trim() ||
      !formData.phone.trim() ||
      !formData.education.trim() ||
      !formData.cover_message.trim()
    ) {
      setSubmitError("Please fill in all fields.");
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(formData.email.trim())) {
      setSubmitError("Please enter a valid email address.");
      return;
    }

    const phonePattern = /^[0-9]{10}$/;

    if (!phonePattern.test(formData.phone.trim())) {
      setSubmitError("Please enter a valid 10-digit phone number.");
      return;
    }

    try {
      setSubmitLoading(true);

      const response = await fetch(
        "http://localhost:5000/api/applications",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            internship_id: selectedInternship.id,
            full_name: formData.full_name.trim(),
            email: formData.email.trim(),
            phone: formData.phone.trim(),
            education: formData.education.trim(),
            cover_message: formData.cover_message.trim(),
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || "Failed to submit application"
        );
      }

      setSubmitSuccess(
        "Application submitted successfully!"
      );

      setFormData({
        full_name: "",
        email: "",
        phone: "",
        education: "",
        cover_message: "",
      });
    } catch (err) {
      console.error(err);

      setSubmitError(
        err.message || "Failed to submit application."
      );
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="app">

      <header className="header">
        <div>
          <h1>Internship Portal</h1>
          <p>Find your next internship opportunity</p>
        </div>
      </header>

      <main className="container">

        <div className="page-title">
          <h2>Available Internships</h2>
          <p>
            Explore internship opportunities and start your career journey.
          </p>
        </div>

        {loading && (
          <div className="message">
            <h2>Loading internships...</h2>
            <p>
              Please wait while we fetch the latest opportunities.
            </p>
          </div>
        )}

        {!loading && error && (
          <div className="message error">
            <h2>Unable to load internships</h2>
            <p>{error}</p>

            <button onClick={fetchInternships}>
              Retry
            </button>
          </div>
        )}

        {!loading && !error && (
          <>
            {internships.length === 0 ? (
              <div className="message">
                <h2>No internships available</h2>
                <p>Please check again later.</p>
              </div>
            ) : (
              <div className="internship-list">

                {internships.map((internship) => (
                  <article
                    className="internship-card"
                    key={internship.id}
                  >
                    <h3>{internship.role}</h3>

                    <p>
                      <strong>Company:</strong>{" "}
                      {internship.company_name}
                    </p>

                    <p>
                      <strong>Location:</strong>{" "}
                      {internship.location}
                    </p>

                    <p className="stipend">
                      Stipend: ₹{internship.stipend}
                    </p>

                    <p>
                      <strong>Duration:</strong>{" "}
                      {internship.duration}
                    </p>

                    {internship.description && (
                      <p className="description">
                        <strong>Description:</strong>{" "}
                        {internship.description}
                      </p>
                    )}

                    <button
                      className="apply-button"
                      onClick={() =>
                        openApplicationForm(internship)
                      }
                    >
                      Apply Now
                    </button>
                  </article>
                ))}

              </div>
            )}
          </>
        )}

      </main>

      {selectedInternship && (
        <section className="application-section">

          <div className="application-form">

            <h2>
              Apply for {selectedInternship.role}
            </h2>

            <p className="company-name">
              Company: {selectedInternship.company_name}
            </p>

            {submitSuccess && (
              <div className="success-message">
                {submitSuccess}
              </div>
            )}

            {submitError && (
              <div className="form-error">
                {submitError}
              </div>
            )}

            <form onSubmit={handleSubmit}>

              <div className="form-group">
                <label htmlFor="name">
                  Full Name
                </label>

                <input
                  id="name"
                  name="full_name"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.full_name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">
                  Email Address
                </label>

                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone">
                  Phone Number
                </label>

                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="Enter 10-digit phone number"
                  value={formData.phone}
                  onChange={handleChange}
                  maxLength="10"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="education">
                  Education
                </label>

                <input
                  id="education"
                  name="education"
                  type="text"
                  placeholder="Example: BBA(CA)"
                  value={formData.education}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="message">
                  Cover Message
                </label>

                <textarea
                  id="message"
                  name="cover_message"
                  rows="5"
                  placeholder="Tell us why you are interested in this internship"
                  value={formData.cover_message}
                  onChange={handleChange}
                  required
                ></textarea>
              </div>

              <div className="form-actions">

                <button
                  type="submit"
                  className="submit-button"
                  disabled={submitLoading}
                >
                  {submitLoading
                    ? "Submitting..."
                    : "Submit Application"}
                </button>

                <button
                  type="button"
                  className="close-button"
                  onClick={() =>
                    setSelectedInternship(null)
                  }
                >
                  Cancel
                </button>

              </div>

            </form>

          </div>

        </section>
      )}

      <footer className="footer">
        <p>
          © 2026 Internship Portal. All rights reserved.
        </p>
      </footer>

    </div>
  );
}

export default App;

