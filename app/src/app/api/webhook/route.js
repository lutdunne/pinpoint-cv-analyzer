import { NextResponse } from "next/server";
// import { headers } from "next/headers";
// import { PrismaClient } from "@prisma/client";

// Commented out until Stripe is configured
// const prisma = new PrismaClient();
// const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
    return NextResponse.json({ error: "Webhook not configured yet" }, { status: 503 });
    /*
    const body = await request.text();
    const signature = headers().get("stripe-signature");

    let event;

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err) {
        console.error("Webhook signature verification failed:", err.message);
        return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    // Handle the checkout.session.completed event
    if (event.type === "checkout.session.completed") {
        const session = event.data.object;

        try {
            // Update resume payment status
            const resumeId = session.metadata.resumeId;
            
            await prisma.resume.update({
                where: { id: resumeId },
                data: {
                    isPaid: true,
                    paymentId: session.payment_intent,
                    paidAt: new Date(),
                },
            });

            console.log(`Payment successful for resume ${resumeId}`);
        } catch (error) {
            console.error("Error updating payment status:", error);
        }
    }

    return NextResponse.json({ received: true });
    */
}
