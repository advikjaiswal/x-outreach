# Twitter Automation Bot

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Playwright](https://img.shields.io/badge/Powered%20by-Playwright-blue.svg)](https://playwright.dev/)

This is a sophisticated automation bot designed to intelligently engage with potential leads on Twitter (X). It is built with a focus on **modularity, safety, and maintainability**, ensuring it can be scaled and adapted for various marketing niches.

The system automates the process of finding, filtering, and engaging with users based on configurable keywords and behavioral rules, using Google Sheets as a persistent database and control panel.

---

## Key Features

This bot was engineered to address common pitfalls of social media automation.

*   **🛡️ Human-like Behavior & Safety**:
    *   **Working Hours**: Operates only within a configurable daily schedule (e.g., 9 AM - 6 PM) and even takes a "lunch break" to mimic human patterns.
    *   **Proxy Rotation**: Utilizes a pool of proxies to distribute requests, significantly reducing the risk of IP-based rate-limiting.
    *   **Randomized Delays**: Implements variable delays between actions to avoid predictable, machine-like behavior.
    *   **Rate Limiting**: Adheres to configurable daily and hourly action limits (DMs, likes, etc.) to stay within safe thresholds.

*   **🧩 Modular & Maintainable Architecture**:
    *   **Separation of Concerns**: Each core function (browser control, data scraping, filtering, scheduling, data persistence) is handled by its own dedicated class.
    *   **Decoupled Components**: Modules are loosely coupled, making them easy to test, maintain, and upgrade independently. For example, the `FilterEngine` can be tested without a live `TwitterBot`.

*   **🎯 Efficient & Configurable Filtering**:
    *   **Score-Based System**: Leads are not just passed or failed; they are assigned a quality score based on configurable keywords in their bio.
    *   **Multi-Layered Rules**: Filters leads based on follower counts, verification status, blacklisted/whitelisted bio keywords, and more.
    *   **Niche Adaptability**: All filtering logic, including keywords for scoring, is managed in a central `config.js` file, allowing the bot to be retargeted to any niche without code changes.

*   **⚙️ Robust Error Handling & State Management**:
    *   **Google Sheets as a Database**: Uses a Google Sheet to store leads, track their status (scraped, passed, failed, engaged), and log errors. This provides a clear, human-readable state machine.
    *   **Circuit Breaker**: Automatically pauses the system after a configurable number of consecutive errors to prevent repeated failures.
    *   **Kill Switch**: A "kill switch" in the Google Sheet allows for immediate, remote shutdown of the bot without accessing the server.

*   **🧪 Safe Demo Mode**:
    *   Can be run in a `demo` mode that uses mock data and simulates actions without performing any live browser automation, perfect for testing and development.

---

## Architecture Overview

The system is composed of several core modules that work together.

*   `main.js`: The main orchestrator. It manages the high-level automation cycle (scrape -> filter -> engage -> wait) and handles error recovery.
*   `TwitterBot.js`: A wrapper around the Playwright library. It handles all browser-level interactions: logging in, navigating, sending DMs, liking posts, etc. It is responsible for executing the actions planned by the scheduler.
*   `LeadScraper.js`: Responsible for searching Twitter for users based on keywords from the config.
*   `FilterEngine.js`: The "brain" of the bot. It takes raw leads and applies a set of configurable rules to determine if they are qualified.
*   `GoogleSheetsManager.js`: Handles all communication with the Google Sheets API. It reads and writes lead data, checks the kill switch, and logs errors, acting as the bot's memory.
*   `EngagementScheduler.js`: Plans which actions to take based on the filtered leads and the rate limits defined in the config. This ensures the bot never exceeds its daily or hourly limits.
*   `config/config.js`: A centralized file for all user-configurable settings, including credentials, keywords, filter rules, and behavioral patterns.

### The Automation Cycle

The bot operates in a continuous, structured loop:

1.  **Working Hours Check**: First, it checks if it's within the configured operating hours. If not, it sleeps.
2.  **Scraping Phase**: It scrapes Twitter for new leads using the defined keywords. New, unique leads are added to the Google Sheet with a "PENDING" status.
3.  **Filtering Phase**: It fetches all "PENDING" leads from the sheet and runs them through the `FilterEngine`. The results ("PASS" or "FAIL") and the reason are updated in the sheet.
4.  **Engagement Phase**: It fetches all "PASS" leads that haven't been engaged with yet. The `EngagementScheduler` creates a plan of actions (e.g., send 3 DMs, like 5 posts) that respects the rate limits. The `TwitterBot` then executes this plan.
5.  **Cooldown**: After completing a cycle, the bot waits for a configurable period (e.g., 30 minutes) before starting the next one.

---

## Setup and Installation

Follow these steps to get the bot running locally.

### 1. Prerequisites

*   Node.js (v18 or higher)
*   Git

### 2. Clone and Install

```bash
git clone <repository-url>
cd <repository-directory>
npm install
```

### 3. Google Cloud & Sheets Setup

The bot uses a Google Service Account to securely interact with your Google Sheet.

1.  **Create a Google Cloud Project** and **enable the Google Drive API and Google Sheets API**.
2.  **Create a Service Account** with the **Editor** role.
3.  **Generate a JSON key** for the service account and download it.
4.  **Create a new Google Sheet** to store the leads.
5.  **Share the Sheet** with the `client_email` found in your downloaded JSON key file, giving it **Editor** permissions.

*(For a more detailed walkthrough, see `LOCAL_SETUP_GUIDE.md`)*

### 4. Environment Configuration

Create a `.env` file in the root of the project. You can copy `.env.example` to get started.

```env
# Twitter Credentials
TWITTER_USERNAME="your_twitter_username"
TWITTER_PASSWORD="your_twitter_password"

# Google Sheets Configuration
GOOGLE_SHEETS_ID="the_long_id_from_your_sheet_url"
GOOGLE_CREDENTIALS_JSON='{"type": "service_account", "project_id": "...", ...}' # Paste the entire content of your JSON key file here

# Optional: Proxies for rotation
# PROXY_1="http://user:pass@host:port"
# PROXY_2="http://user:pass@host:port"

# Optional: Browser settings for debugging
# HEADLESS=false
# SLOW_MO=50
```

---

## Running the Bot

*   **To run in production mode (performs live actions):**
    ```bash
    npm start
    ```

*   **To run in demo mode (simulates actions with mock data, no browser activity):**
    ```bash
    npm run test-mode
    ```

---

## Configuration

The bot's behavior is highly customizable via `/src/config/config.js`. This allows for easy adaptation without touching the core logic.

Key configurable sections include:

*   `scraping`: Define keywords to search for and the number of leads to scrape per keyword.
*   `filterRules`: Adjust follower counts, enable/disable verification checks, and manage bio blacklist/whitelist terms.
*   `qualityScoreKeywords`: **Crucially, add or remove keywords here to tailor the lead scoring to your specific niche.**
*   `rateLimits`: Set the maximum number of actions (DMs, likes, etc.) to perform per day and per hour.
*   `messageTemplates`: Craft the DM messages the bot will send.
*   `engagement.humanBehavior`: Configure the bot's "working hours" and the delay ranges between actions.
