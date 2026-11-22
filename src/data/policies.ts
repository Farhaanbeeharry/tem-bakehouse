// TEM Bakehouse's policies, word for word from the documents TEM supplied (V4 feedback).

export type PolicySection = { title: string; paragraphs: string[] };
export type Policy = { title: string; intro?: string[]; updated?: string; sections: PolicySection[] };

export const ORDER_POLICY: Policy = {
  title: 'Order Policy',
  sections: [
    {
      title: 'How to Order',
      paragraphs: [
        'Orders can be placed via our website.',
        'Please place your order at least 48 hours in advance to guarantee availability.',
        'Same-day or next-day orders may be accommodated depending on current demand, but this is not guaranteed.',
        'For larger orders (10+ boxes) or event/bulk orders, please allow 5–7 days’ notice.',
      ],
    },
    {
      title: 'Menu & Customization',
      paragraphs: [
        'Our standard menu includes our signature thick, gooey cookies.',
        'Both regular and gluten-free versions are available – please specify your preference when ordering.',
        'Custom flavours, box designs, or personalized messages may be arranged in advance and could be subject to an additional charge.',
      ],
    },
    {
      title: 'Payment',
      paragraphs: [
        'To confirm your order, a non-refundable 50% down payment is required, unless otherwise agreed.',
        'Payment can be made via Juice & Bank transfer.',
        'Orders are only confirmed once payment has been received.',
      ],
    },
    {
      title: 'Pickup & Delivery',
      paragraphs: [
        'Pickup: Orders can be collected from Terre Rouge & Port Louis at the agreed date and time.',
        'Delivery: Delivery is not available at the moment. However, exceptions may be made for the Port Louis and Terre Rouge areas upon request.',
        'We kindly ask that pickups/deliveries be honoured at the scheduled time, as items are freshly prepared in small batches.',
      ],
    },
    {
      title: 'Cancellations & Changes',
      paragraphs: [
        'Cancellations must be made at least 24 hours before the scheduled pickup/delivery for a full refund or rescheduling.',
        'Cancellations made within 24 hours may not be eligible for a refund, as ingredients are often already prepared.',
        'Changes to an order (flavours, fillings, quantities, dates) are subject to availability and should be requested before 24 hours.',
      ],
    },
    {
      title: 'Allergen & Food Safety Notice',
      paragraphs: [
        'TEM Bakehouse operates from a home-based kitchen. While we take care with ingredients and hygiene, our products are made in an environment that also handles nuts, gluten, dairy, and eggs.',
        'Customers with severe allergies should inform us before ordering; however, we cannot guarantee a completely allergen-free environment.',
        'Gluten-free items are prepared with care to avoid cross-contact but cannot be certified as 100% gluten-free.',
      ],
    },
    {
      title: 'Storage & Shelf Life',
      paragraphs: [
        'For best taste and texture, cookies are best enjoyed within two weeks of collection.',
        'Store in an airtight container at room temperature; refrigerate or freeze for longer freshness.',
        'TEM Bakehouse is not responsible for quality issues arising from improper storage after handover.',
      ],
    },
    {
      title: 'Refunds & Complaints',
      paragraphs: [
        'If there is an issue with your order (incorrect item, quality concern), please reach out within 24 hours of receiving your order with photos where possible, and we will do our best to make it right.',
      ],
    },
  ],
};

export const MEDIA_POLICY: Policy = {
  title: 'Photo & Media Policy',
  updated: '1 August 2026',
  intro: [
    'Applies to all TEM Bakehouse product photography and media.',
    'TEM Bakehouse invests time, care, and creative effort into photographing and presenting its products. This policy sets out how our product photos and other media may and may not be used; to protect the brand and the quality of how our products are represented to the public.',
  ],
  sections: [
    {
      title: 'Ownership of Photos & Media',
      paragraphs: [
        'All product photographs, videos, graphics, and other visual content created for or by TEM Bakehouse (including cookies, packaging, promotional material, and branding assets) remain the sole property of TEM Bakehouse, regardless of who took or edited them.',
        'This includes content created by staff, contracted photographers, delivery partners, or any other person acting on behalf of TEM Bakehouse.',
      ],
    },
    {
      title: 'No Unauthorised Posting or Sharing',
      paragraphs: [
        'TEM Bakehouse product photos and videos must not be posted, reposted, shared, printed, or distributed on any social media platform, website, marketplace, or public forum without prior agreement or authorisation from TEM Bakehouse.',
        'This applies whether the content is shared for personal, promotional, or commercial purposes, and regardless of where the photo was originally obtained (e.g. from our social pages, our website, WhatsApp catalogue, or in person).',
        'Screenshots, downloads, or reposts of our content are treated the same as the original photo for the purposes of this policy.',
      ],
    },
    {
      title: 'Requesting Authorisation',
      paragraphs: [
        'Anyone wishing to use a TEM Bakehouse photo or video – including customers, collaborators, influencers, or media outlets – must request permission in advance via our official contact channels (WhatsApp, Instagram, Facebook or our Website).',
        'Requests should state where and how the content will be used, and for how long.',
        'TEM Bakehouse will confirm authorisation in writing (message or email) before any use is considered approved. Verbal or assumed approval is not sufficient.',
      ],
    },
    {
      title: 'Approved Use & Credit',
      paragraphs: [
        'Where use is authorised, the content must be credited to “TEM Bakehouse” and, where possible, tag our official social media handles.',
        'Authorised content may not be edited, cropped, filtered, or combined with other branding in a way that misrepresents the product or the business.',
        'Authorisation is granted for the specific use requested only and does not extend to other platforms, campaigns, or time periods unless agreed.',
      ],
    },
    {
      title: 'Customer & Personal Photos',
      paragraphs: [
        'Customers are welcome to photograph and share their own photos of products they have purchased (e.g. on their own social media), provided such posts do not use TEM Bakehouse’s official studio photos, graphics, or branded content without permission.',
        'We encourage customers tagging TEM Bakehouse in their own photos and may repost these on our official pages with credit.',
      ],
    },
    {
      title: 'Unreleased Products & Confidentiality',
      paragraphs: [
        'Photos or videos of unreleased flavours, packaging, or promotional concepts shared internally (e.g. with staff or partners for feedback) are confidential and must not be posted or shared externally before the official public release.',
      ],
    },
    {
      title: 'Violations',
      paragraphs: [
        'Any unauthorised use of TEM Bakehouse photos or media will result in a request for immediate removal.',
        'Repeated or commercial misuse may result in the discontinuation of any collaboration or partnership, and TEM Bakehouse reserves the right to pursue further action where misuse causes harm to the brand.',
      ],
    },
    {
      title: 'Amendments',
      paragraphs: ['This policy may be reviewed and updated from time to time as TEM Bakehouse grows. The most recent version in effect will always apply.'],
    },
  ],
};
