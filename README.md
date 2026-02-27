<h1 align="center">
  <img src="./public/readme.png" alt="Logo" />
  <br />HCBScan
</h1>
<h3 align="center">The first public explorer for HCB transactions and organizations.</h3>
<p align="center">
  <a href="#about">About</a> •
  <a href="#features">Features</a> •
  <a href="#structure">Project Structure</a> •
  <a href="#local-setup">Local Setup</a> •
  <a href="#configuration">Configuration</a> •
  <a href="#deployment">Deployment</a> •
  <a href="#license">License</a>
</p>

## About

HCBScan is an open-source explorer for [HCB](https://hcb.hackclub.com/) that allows you to search for organizations, view transactions, and explore public financial data. It is built using [Nuxt](https://nuxt.com) and [Vue](https://vuejs.org) with a little help from [Supabase](https://supabase.com/) and it uses the [HCB API](https://hcb.hackclub.com/docs/api/v3) to fetch data.

### Live Demo

Try out HCBScan at [hcbscan.3kh0.net](https://hcbscan.3kh0.net/)

## Features

- Search for organizations by name, handle, or ID
- View all information about organizations, including the stuff that is not shown normally!
- Explore recent activities and transactions across the platform
- See how much money is held within HCB
- Support for third-party instances

## Structure

```filestructure
hcbscan/
├── assets/                  # see title
│   ├── css/                 # tailwind + overrides
│   └── img/                 # images
├── components/              # reusable components
├── layouts/
│   └── default.vue          # default layout
├── pages/                   # the meat and bones
│   ├── app/                 # all cool stuff here
│   │   ├── index.vue        # the real homepage
│   │   ├── acts/            # activity page
│   │   ├── txns/            # transaction page
│   │   └── org/             # organization page
│   └── index.vue
├── public/                  # stuff, ignore
├── server/                  # not sure why this is here honestly
├── utils/                   # utility functions
├── app.vue                  # nothing much here
└── nuxt.config.ts           # nuxt configuration
```

## Local Setup

### Prerequisites

- Node.js
- Bun
- A browser made within the past decade

### Installation

1. Clone the repository:

```bash
git clone https://github.com/3kh0/hcbscan.git
cd hcbscan
bun install
bun dev
```

2. Open your browser and go to `http://localhost:3000`

## Configuration

### Supabase

HCBScan uses Supabase for some added functions. If you want to bring your own database and not use the default one, you can edit the [`utils/supabase.js`](utils/supabase.js) file with your own Supabase URL and public key.

### Third Party instances

HCB is open source and HCBScan supports third-party instances. If you want to use a different instance, you can edit the [`utils/apiConfig.js`](utils/apiConfig.js) to change the default HCB API URL to your desired instance.

By default, it uses the official HCB API.

## Deployment

HCBScan is built on Nuxt, which means it runs pretty much everywhere. Cloudflare Pages is recommended as it is the easiest to setup and use, all while being free.

## Contributing

Contributions are welcome and I will love you forever if you help out! There is a informal todo list over at [`todo.txt`](todo.txt) if you want to help out.

## License

This project is licensed under the GNU GPLv3 License - see the [`LICENSE.txt`](LICENSE.txt) file for details.

## Thanks

- Made with 💚 by [Echo](https://3kh0.net)
- Powered by [Nuxt](https://nuxt.com) and [Vue](https://vuejs.org)
- Data provided by the [HCB API](https://hcb.hackclub.com/docs/api/v3)
- Let's be honest, stack overflow

**Note**: HCBScan is not affiliated, fiscally sponsored, or endorsed by HCB. We only got a "oh shit, this is so cool" from the HCB team so take that for what it is worth.
