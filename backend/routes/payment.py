"""
Payment routes – create Razorpay order and verify payment.
Prefix: /api/payment
"""

import os
import razorpay
from flask import Blueprint, request, jsonify
from middleware.auth import token_required

payment_bp = Blueprint("payment", __name__, url_prefix="/api/payment")

# Initialize Razorpay client
razorpay_client = None
if os.getenv("RAZORPAY_KEY_ID") and os.getenv("RAZORPAY_KEY_SECRET"):
    razorpay_client = razorpay.Client(auth=(os.getenv("RAZORPAY_KEY_ID"), os.getenv("RAZORPAY_KEY_SECRET")))

@payment_bp.route("/create-order", methods=["POST"])
@token_required
def create_order(*, current_user):
    """Create a Razorpay order for the consultation fee."""
    if not razorpay_client:
        return jsonify({"error": "Payment gateway not configured"}), 500

    try:
        data = request.get_json() or {}
        amount = 500  # Fixed consultation fee (₹500)
        
        # Razorpay amount is in paise
        order_amount = amount * 100
        order_currency = "INR"
        order_receipt = f"receipt_{current_user.id}_{os.urandom(4).hex()}"

        order = razorpay_client.order.create({
            "amount": order_amount,
            "currency": order_currency,
            "receipt": order_receipt,
            "payment_capture": 1 # Auto capture
        })

        return jsonify({
            "orderId": order["id"],
            "amount": order_amount,
            "currency": order_currency,
            "keyId": os.getenv("RAZORPAY_KEY_ID")
        }), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500
