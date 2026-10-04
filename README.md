# FreqTrade

Bis zu letzten Patrone

## GitHub Pages deployment

The `Build and Deploy FreqUI` workflow builds and tests pull requests. Pushes to
`main` also deploy the production site to GitHub Pages; the workflow can also be
started manually from the Actions tab.

To enable deployment, open **Settings → Pages** in the repository and set the
build and deployment source to **GitHub Actions**. The workflow configures the
repository subpath automatically for project sites and supports root-based user
or organization sites. Client-side routes use the generated `404.html` fallback.
