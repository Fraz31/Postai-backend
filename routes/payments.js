import express from 'express';
import axios from 'axios';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.post('/create-checkout', requireAuth, async (req, res) => {
  try {
    const { variantId } = req.body;

    const response = await axios.post(
      'https://api.lemonsqueezy.com/v1/checkouts',
      {
        data: {
          type: 'checkouts',
          attributes: {
            checkout_options: {
              embed: true,
              media: false
            },
            product_options: {
              redirect_url: process.env.FRONTEND_URL
                ? `${process.env.FRONTEND_URL}/#dashboard`
                : 'https://postai-frontend.onrender.com/#dashboard'
            }
          },
          relationships: {
            store: {
              data: { type: 'stores', id: process.env.LEMONSQUEEZY_STORE_ID }
            },
            variant: { data: { type: 'variants', id: variantId } }
          }
        }
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.LEMONSQUEEZY_API_KEY}`,
          Accept: 'application/vnd.api+json',
          'Content-Type': 'application/vnd.api+json'
        }
      }
    );

    return res.json({ url: response.data.data.attributes.url });
  } catch (error) {
    console.log(error.response?.data || error.message);
    return res.status(500).json({ error: 'Failed to create checkout' });
  }
});

export default router;
