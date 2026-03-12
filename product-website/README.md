# Website

Next.js landing page for `Real-Time Game Voice Translation`.

## Purpose

- Show the product pitch
- Show current traction and progress
- Link visitors to Kickstarter
- Link visitors to the Kit email signup page

## Run locally

From `product-website/`:

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.

## Structure

- `app/layout.js` sets page metadata and global layout
- `app/page.js` contains the landing page content
- `app/globals.css` contains the page styling

## Notes

- Update traction numbers in `app/page.js` as new results come in.
- Build for production with `npm run build`.
