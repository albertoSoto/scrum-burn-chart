# Scrum Burn Chart Tool

![Scrum Burn Chart](https://img.shields.io/badge/Scrum-Burn%20Chart-blue)
![React](https://img.shields.io/badge/React-19.0.0-61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8.2-3178C6)
![Nx](https://img.shields.io/badge/Nx-21.2.0-143055)

A modern web application for tracking and visualizing sprint progress using burndown charts. This tool helps Scrum teams monitor their velocity and forecast sprint completion.

## Features

- Interactive burndown charts using Recharts
- Sprint progress visualization
- Responsive design for desktop and mobile
- Modern React implementation with TypeScript

## Live Demo

WIP

## Technology Stack

- **Frontend**: React 19, TypeScript
- **Routing**: React Router 6
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Build Tool**: Vite
- **Monorepo Management**: Nx
- **Deployment**: GitHub Pages

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- npm or yarn

### Installation

1. Clone the repository
   ```sh
   git clone https://github.com/[your-username]/scrum-burn-check.git
   cd scrum-burn-check
   ```

2. Install dependencies
   ```sh
   npm install
   ```

3. Start the development server
   ```sh
   npm run serve
   # or
   npx nx serve scrum-tool
   ```

4. Open your browser and navigate to `http://localhost:4200`

## Build

To create a production build:

```sh
npm run build
# or
npx nx build scrum-tool
```

## Project Structure

This project is built using Nx monorepo structure:

```
scrum-burn-check/
├── apps/
│   └── scrum-tool/        # Main application
│       ├── src/           # Source files
│       ├── public/        # Static assets
│       └── ...
├── .github/
│   └── workflows/         # GitHub Actions workflows
└── ...
```

## Deployment

The application is automatically deployed to GitHub Pages using GitHub Actions. Any push to the main branch triggers the deployment workflow.

### Manual Deployment

If you want to deploy manually:

1. Build the application
   ```sh
   npm run build
   ```

2. Deploy to GitHub Pages
   ```sh
   # If you have gh-pages CLI installed
   gh-pages -d apps/scrum-tool/dist
   ```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---

<a alt="Built with Nx" href="https://nx.dev" target="_blank" rel="noreferrer"><img src="https://raw.githubusercontent.com/nrwl/nx/master/images/nx-logo.png" width="45"></a>

*This project was generated and is managed using [Nx](https://nx.dev), a smart, fast and extensible build system.*

