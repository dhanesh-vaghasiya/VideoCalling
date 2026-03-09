    import { useState, useEffect } from "react";
    import { useLocation, useNavigate } from "react-router-dom";
    import { bookAppointment } from "../services/appointment";

    /** Helper to load external scripts safely */
    const loadScript = (src) => {
        return new Promise((resolve) => {
            const script = document.createElement("script");
            script.src = src;
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    function Payment() {
        const location = useLocation();
        const navigate = useNavigate();
        const [loading, setLoading] = useState(false);
        const [error, setError] = useState("");

        const state = location.state;

        useEffect(() => {
            // If entered without state (direct url access), go back to dashboard
            if (!state?.appointmentPayload) {
                navigate("/dashboard", { replace: true });
            }
        }, [state, navigate]);

        if (!state?.appointmentPayload) return null;

        const { appointmentPayload, doctorInfo, user } = state;
        const bookingDate = new Date(appointmentPayload.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

        const handlePayment = async () => {
            try {
                setLoading(true);
                setError("");

                // Simulate a successful payment without loading Razorpay for testing purposes
                await bookAppointment(appointmentPayload, {
                    razorpayPaymentId: "simulated_payment_id_" + Date.now(),
                    razorpayOrderId: "simulated_order_id_" + Date.now(),
                    razorpaySignature: "simulated_signature"
                });
                alert("Appointment Confirmed Successfully! (Simulated Payment)");
                navigate("/dashboard", { replace: true });

            } catch (err) {
                setError(err.message || "An error occurred starting payment.");
            } finally {
                setLoading(false);
            }
        };

        return (
            <div className="dash-container">
                <div className="dash-content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>

                    <div className="dash-review-card" style={{ maxWidth: 500, width: "100%", padding: "2rem", backgroundColor: "#fff", borderRadius: "8px", boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }}>
                        <h2 style={{ textAlign: "center", marginBottom: "1.5rem", color: "#1e293b" }}>Complete Payment</h2>

                        {error && (
                            <div style={{ backgroundColor: "#fee2e2", color: "#b91c1c", padding: "10px", borderRadius: "4px", marginBottom: "1rem", fontSize: "0.9rem" }}>
                                {error}
                            </div>
                        )}

                        <div className="dash-review-row" style={{ marginBottom: "10px" }}>
                            <span className="dash-review-label">Doctor</span>
                            <span style={{ fontWeight: 600 }}>{doctorInfo.name} ({doctorInfo.specialization})</span>
                        </div>
                        <div className="dash-review-row" style={{ marginBottom: "10px" }}>
                            <span className="dash-review-label">Patient</span>
                            <span>{appointmentPayload.patientName}</span>
                        </div>
                        <div className="dash-review-row" style={{ marginBottom: "10px" }}>
                            <span className="dash-review-label">Date & Time</span>
                            <span>{bookingDate} at {appointmentPayload.time}</span>
                        </div>

                        <hr style={{ margin: "1.5rem 0", borderTop: "1px dashed #e2e8f0" }} />

                        <div className="dash-review-row" style={{ marginBottom: "1.5rem", fontSize: "1.2rem" }}>
                            <span className="dash-review-label" style={{ fontWeight: 600 }}>Total Fee</span>
                            <span style={{ fontWeight: 700, color: "#16a34a" }}>₹500</span>
                        </div>

                        <button
                            type="button"
                            className="dash-btn dash-btn-primary"
                            style={{ width: "100%", padding: "0.75rem", fontSize: "1.1rem" }}
                            onClick={handlePayment}
                            disabled={loading}
                        >
                            {loading ? "Processing..." : "Pay ₹500"}
                        </button>

                        <button
                            type="button"
                            className="dash-btn dash-btn-secondary"
                            style={{ width: "100%", padding: "0.75rem", marginTop: "1rem" }}
                            onClick={() => navigate(-1)}
                            disabled={loading}
                        >
                            Cancel and Go Back
                        </button>

                        <p style={{ textAlign: "center", marginTop: "1.5rem", fontSize: "0.8rem", color: "#64748b" }}>
                            Secure payment powered by Razorpay. Supports UPI, Cards, and Netbanking.
                        </p>
                    </div>

                </div>
            </div>
        );
    }

    export default Payment;
