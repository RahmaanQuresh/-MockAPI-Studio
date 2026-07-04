# MockAPI Studio

MockAPI Studio is a client-side sandbox application that lets you visually design, mock, and test REST API endpoints entirely inside your browser. It includes a built-in mock engine that parses template placeholders, simulates network latency, and logs test history. It also exports your configurations directly to Express.js scripts and OpenAPI 3.0 blueprints.

## Visual Demo & UI Screenshot

### Application Interface
![MockAPI Studio Interface Screenshot](assets/mockapi_naturalist_ui.png)

### Video Walkthrough
Below is a screen recording demonstrating how to select an endpoint, configure path parameters, send test requests, view results, and inspect transaction logs:

![MockAPI Studio Demo Walkthrough](assets/mockapi_studio_demo.webp)

## Core Capabilities

*   **Custom Mock Templates**: Define JSON responses using dynamic placeholders like `{{id}}`, `{{name}}`, `{{email}}`, `{{price}}`, and `{{date}}` to generate realistic mock data.
*   **Array Expansion**: Create lists of items by specifying ranges or counts (e.g. `"users|3-6": { ... }` generates an array containing 3 to 6 randomized user records).
*   **Path Variable Support**: Define routes with wildcard parameters (e.g. `/api/v1/users/:userId`). The request tester automatically detects these and lets you test responses referencing `{{params.userId}}`.
*   **Latency Simulation**: Set response delay timers (0ms to 3000ms) to test frontend loading behaviors and slow-network fallbacks.
*   **Interactive Tester (Mini-Postman)**: Customize query strings, headers, and request bodies directly inside the UI to inspect returned statuses, headers, and payloads.
*   **Local Logger Timeline**: Keeps a history of simulated transactions. Click any logged card to expand and review request details.
*   **Code Generators**: Instantly convert mocked routes into fully functional, zero-dependency Node.js/Express.js mock server scripts or standard OpenAPI 3.0 configurations.

## User Guide: How to Use the App

You can operate the app fully without any coding background:

1.  **Load a Route**: Click any pre-loaded endpoint in the left **Endpoints** panel (e.g. `GET /api/v1/users/:userId`).
2.  **Configure Parameters**: In the right **Request Tester** panel under the **Params** tab, enter a value for the `:userId` path variable (for example, replace `1` with `42`).
3.  **Trigger Test Request**: Click **Send**. The app simulates your configured network delay, generates mock data, and displays the response payload in the viewer.
4.  **Inspect Logs**: In the **Request Logs** timeline at the bottom-right, click any card to open a details modal displaying exact HTTP status codes, latency duration, size, and header values.
5.  **Simulate Server Failures**: In the center **Configure Endpoint** panel, change the **Status Code** input from `200` to `500` or `401` and click **Send** to see how the tester handles error states.

## Setup and Running

Since this is a client-side Vite application, you can run it locally with standard Node.js tooling:

```bash
# Clone the repository
git clone https://github.com/RahmaanQuresh/-MockAPI-Studio.git
cd -MockAPI-Studio

# Install dependencies
npm install

# Run the local development server
npm run dev
```

The app will start at `http://localhost:5173`.
