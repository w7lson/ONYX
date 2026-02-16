import { Webhook } from 'svix';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const handleClerkWebhook = async (req, res) => {
    const SIGNING_SECRET = process.env.CLERK_WEBHOOK_SECRET;

    if (!SIGNING_SECRET) {
        throw new Error('Error: Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env');
    }

    // Get headers
    const svix_id = req.headers['svix-id'];
    const svix_timestamp = req.headers['svix-timestamp'];
    const svix_signature = req.headers['svix-signature'];

    // If there are no headers, error out
    if (!svix_id || !svix_timestamp || !svix_signature) {
        return res.status(400).send('Error: Missing svix headers');
    }

    // Get body
    const body = req.body;

    const wh = new Webhook(SIGNING_SECRET);

    let evt;

    try {
        evt = wh.verify(body, {
            'svix-id': svix_id,
            'svix-timestamp': svix_timestamp,
            'svix-signature': svix_signature,
        });
    } catch (err) {
        console.error('Error: Could not verify webhook:', err.message);
        return res.status(400).send(err.message);
    }

    // Handle the event
    const eventType = evt.type;

    if (eventType === 'user.created') {
        const { id, email_addresses, image_url } = evt.data;
        const email = email_addresses[0]?.email_address;

        try {
            await prisma.userProfile.create({
                data: {
                    clerkId: id,
                    email: email,
                    quizResults: {}, // Initial empty JSON
                }
            });
            console.log(`User ${id} created in DB`);
        } catch (error) {
            console.error('Error creating user in DB:', error);
            return res.status(500).json({ error: 'Database error' });
        }
    }

    return res.status(200).json({ success: true });
};
