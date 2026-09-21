# Kong Tattoo Care — Website

## Structure

```
kong-website/
├── index.html          # Homepage
├── shop.html           # Shop page
├── blog.html           # Blog listing
├── blog-post.html      # Individual blog post (URL param: ?id=post-slug)
├── about.html          # About Us
├── login.html          # Customer + Reseller login / registration
├── account.html        # Account dashboard
├── assets/
│   ├── shared.css      # Shared styles
│   ├── shared.js       # Cart, auth, language switcher, scroll reveal
│   └── products.js     # Product images + data (base64 embedded)
├── lang/
│   ├── sv.html         # Swedish 🇸🇪
│   ├── fi.html         # Finnish 🇫🇮
│   ├── no.html         # Norwegian 🇳🇴
│   ├── nl.html         # Dutch 🇳🇱
│   ├── de.html         # German 🇩🇪
│   ├── pt.html         # Portuguese 🇵🇹
│   ├── cs.html         # Czech 🇨🇿
│   ├── ru.html         # Russian 🇷🇺
│   ├── kk.html         # Kazakh 🇰🇿
│   ├── sr.html         # Serbian 🇷🇸
│   ├── hr.html         # Croatian 🇭🇷
│   └── bs.html         # Bosnian 🇧🇦
├── vercel.json         # Vercel deployment config
├── package.json        # npm config + dev server
└── README.md           # This file
```

## Deploy to Vercel

### Option 1: GitHub + Vercel (recommended)
1. Push this folder to a GitHub repository
2. Go to vercel.com → New Project → Import from GitHub
3. Select the repository → Deploy
4. Done. Vercel auto-detects the static config.

### Option 2: Vercel CLI
```bash
npm install -g vercel
cd kong-website
vercel --prod
```

### Option 3: Drag and drop
Go to vercel.com/new → drag the `kong-website` folder into the deploy box.

## Local Development
```bash
npm install
npm run dev
# Opens at http://localhost:3000
```

## Features
- **Cart**: localStorage-based, persists across pages
- **Auth**: localStorage user store (demo). Connect to real backend by replacing loginCustomer/loginReseller/registerAccount functions in login.html
- **Language switcher**: Dropdown in nav links to all 12 language pages
- **Shop filters**: Filter by collection, sort by price/name
- **Product modal**: Click any product for detail view with how-to-use
- **Blog**: 6 articles, filterable by category
- **Reseller portal**: Separate login with wholesale price table

## Connecting a Real Backend
The auth system uses localStorage for demo purposes. To connect to a real backend:
1. Replace `loginCustomer()` in login.html with a fetch POST to your API
2. Store a JWT token in localStorage instead of the user object
3. Verify the token on account.html load

## Customisation
- Product images and data: `assets/products.js`
- Shared nav/footer styles: `assets/shared.css`
- Cart behaviour: `assets/shared.js`
