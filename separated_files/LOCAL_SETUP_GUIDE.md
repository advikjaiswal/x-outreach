# Local Setup Guide for Twitter Automation Bot

This guide will walk you through setting up and running the Twitter Automation Bot on your own computer.

## Prerequisites

1.  **Node.js**: Version 18 or higher.
2.  **Git**: For cloning the repository.
3.  **A Twitter Account**: The bot needs an account to perform actions.
4.  **A Google Account**: For creating the Google Sheet and API credentials.

---

## Step 1: Get the Code

First, clone the repository to your local machine and install the required packages.

```bash
git clone https://github.com/alpha685/auto-x.git
cd auto-x
npm install
```

---

## Step 2: Google Cloud & Sheets Setup

This is the most detailed part. You need to create a "Service Account" so the bot can write to a Google Sheet without needing your personal password.

1.  **Create a Google Cloud Project**:
    *   Go to the [Google Cloud Console](https://console.cloud.google.com/).
    *   Create a new project (you can name it "Twitter Bot" or anything you like).

2.  **Enable APIs**:
    *   In your new project, go to the "APIs & Services" > "Library".
    *   Search for and **enable** the **Google Drive API**.
    *   Search for and **enable** the **Google Sheets API**.

3.  **Create a Service Account**:
    *   Go to "APIs & Services" > "Credentials".
    *   Click "Create Credentials" and select "Service account".
    *   Give it a name (e.g., "sheets-writer"), and click "Create and Continue".
    *   For "Role", select "Project" > "Editor". Click "Continue", then "Done".

4.  **Generate a JSON Key**:
    *   On the Credentials screen, find the service account you just created and click on it.
    *   Go to the **KEYS** tab.
    *   Click "Add Key" > "Create new key".
    *   Select **JSON** as the key type and click "Create". A JSON file will be downloaded to your computer. **Keep this file safe!**

5.  **Create the Google Sheet**:
    *   Go to [sheets.google.com](https://sheets.google.com) and create a new, blank spreadsheet.
    *   You can name it "Twitter Leads".

6.  **Share the Sheet with the Service Account**:
    *   Open the JSON key file you downloaded. Find the `client_email` value (it looks like an email address).
    *   In your Google Sheet, click the "Share" button.
    *   Paste the `client_email` into the sharing dialog.
    *   Make sure to give it **Editor** permissions.
    *   Click "Share".

---

## Step 3: Configure Your Environment

1.  **Create a `.env` file**: In the project's root directory, make a copy of `.env.example` and name it `.env`.

2.  **Fill in the variables**:
    *   `TWITTER_USERNAME`: Your Twitter account's username.
    *   `TWITTER_PASSWORD`: Your Twitter account's password.
    *   `GOOGLE_SHEETS_ID`: Open your Google Sheet. The ID is the long string of characters in the URL.
        (e.g., `https://docs.google.com/spreadsheets/d/THIS_IS_THE_ID/edit`)
    *   `GOOGLE_CREDENTIALS_JSON`: Open the JSON key file you downloaded. Copy the **entire content** of the file and paste it here. It must be on a single line.

---

## Step 4: Run the Bot

You're all set! You can now run the bot from your terminal.

*   **To run in test mode (recommended for first-time use):**
    ```bash
    npm run test-mode
    ```
*   **To run in full production mode:**
    ```bash
    npm run start:full
    ```