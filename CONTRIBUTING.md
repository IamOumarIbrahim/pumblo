# Contributing to Pumblo

1. Fork the repository and create a focused branch.
2. Install the locked dependency set with `npm ci`.
3. Run `npm run verify` before opening a pull request.
4. Include a browser acceptance note for changes to profiles, uploads, playback, likes, or comments.

Security, authentication, provenance, and moderation changes should explain their trust assumptions in the pull request. The most useful next extensions are thumbnail generation, C2PA verification, abuse rate limits, reporting/appeals, and automated end-to-end tests.
