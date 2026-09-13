import { NextResponse } from "next/server";
// import { getServerSession } from "next-auth";
// import { authOptions } from "../auth/[...nextauth]/route";

// Commented out until Stripe is configured
// const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
    return NextResponse.json({ error: "Payment system not configured yet" }, { status: 503 });
    /*
    try {
        const session = await getServerSession(authOptions);
        
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { resumeId } = await request.json();

        if (!resumeId) {
            return NextResponse.json({ error: "Resume ID required" }, { status: 400 });
        }

        // Create Stripe checkout session
        const checkoutSession = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: [
                {
                    price_data: {
                        currency: "gbp",
                        product_data: {
                            name: "Full CV Analysis Report",
                            description: "Complete score breakdown, rewrite suggestions, ATS tips, missing skills & interview questions",
                            images: ["https://your-domain.com/report-preview.png"], // Add your image
                        },
                        unit_amount: 799, // £7.99 in pence
                    },
                    quantity: 1,
                },
            ],
            mode: "payment",
            success_url: `${process.env.NEXTAUTH_URL}/dashboard?payment=success&resumeId=${resumeId}`,
            cancel_url: `${process.env.NEXTAUTH_URL}/dashboard?payment=cancelled`,
            client_reference_id: resumeId,
            customer_email: session.user.email,
            metadata: {
                resumeId,
                userId: session.user.id,
            },
        });

        return NextResponse.json({ url: checkoutSession.url });
    } catch (error) {
        console.error("Payment creation error:", error);
        return NextResponse.json(
            { error: "Failed to create payment session" },
            { status: 500 }
        );
    }
    */
}
