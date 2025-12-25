// Helper function to get current tab safely
async function getLocalhostTab() {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    const currentTab = tabs[0];

    // Check agar tab localhost ya local IP hai
    if (!currentTab || (!currentTab.url.includes("localhost") && !currentTab.url.includes("127.0.0.1"))) {
        return null;
    }
    return currentTab;
}

// === 1. SYNC FUNCTION ===
document.getElementById('syncBtn').addEventListener('click', async () => {
    const status = document.getElementById('status');
    status.innerText = "Checking LeetCode...";
    status.style.color = "#555";

    try {
        // Step A: Check Active Tab
        const currentTab = await getLocalhostTab();
        if (!currentTab) {
            status.innerText = "❌ Error: Please open a Localhost tab!";
            status.style.color = "red";
            return;
        }

        // Step B: Get Cookies
        const session = await chrome.cookies.get({ url: "https://leetcode.com", name: "LEETCODE_SESSION" });
        const csrf = await chrome.cookies.get({ url: "https://leetcode.com", name: "csrftoken" });

        if (!session || !csrf) {
            status.innerText = "❌ Error: Log in to LeetCode first!";
            status.style.color = "red";
            return;
        }

        // Step C: Inject Data
        await chrome.scripting.executeScript({
            target: { tabId: currentTab.id },
            func: (s, c) => {
                localStorage.setItem('user_session', s);
                localStorage.setItem('user_csrf', c);

                // Remove existing toast if any
                const existing = document.getElementById('sc-toast');
                if (existing) existing.remove();

                // Create Toast UI
                const toast = document.createElement('div');
                toast.id = 'sc-toast';
                toast.style.cssText = `
                    position: fixed;
                    top: 20px;
                    left: 50%;
                    transform: translateX(-50%);
                    background: #18181b; /* Zinc 900 */
                    color: #fff;
                    padding: 12px 24px;
                    border-radius: 8px;
                    border: 1px solid #22c55e; /* Green Border */
                    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.5);
                    z-index: 100000;
                    font-family: monospace; /* Hacker font */
                    font-size: 14px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    animation: slideIn 0.5s ease-out;
                `;

                // Inner Content (Using SVG to avoid encoding bugs)
                toast.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                    <span style="font-weight: 600;">System Synced</span>
                `;

                // Add Animation Style
                const style = document.createElement('style');
                style.innerHTML = `@keyframes slideIn { from { transform: translate(-50%, -100%); opacity: 0; } to { transform: translate(-50%, 0); opacity: 1; } }`;
                document.head.appendChild(style);

                document.body.appendChild(toast);

                // Auto Reload after 1.5s
                setTimeout(() => {
                    location.reload();
                }, 1500);
            },
            args: [session.value, csrf.value]
        });

        status.innerText = "Synced!";
        status.style.color = "green";

    } catch (err) {
        status.innerText = "Error: " + err.message;
        console.error(err);
    }
});

// === 2. CLEAR / DISCONNECT FUNCTION ===
document.getElementById('clearBtn').addEventListener('click', async () => {
    const status = document.getElementById('status');
    status.innerText = "Clearing data...";

    try {
        const currentTab = await getLocalhostTab();
        if (!currentTab) {
            status.innerText = "Error: Open Localhost!";
            status.style.color = "red";
            return;
        }

        // Inject script to remove items from LocalStorage
        await chrome.scripting.executeScript({
            target: { tabId: currentTab.id },
            func: () => {
                localStorage.removeItem('user_session');
                localStorage.removeItem('user_csrf');

                // Remove existing toast
                const existing = document.getElementById('sc-toast');
                if (existing) existing.remove();

                // Create RED Toast
                const toast = document.createElement('div');
                toast.id = 'sc-toast';
                toast.style.cssText = `
                    position: fixed;
                    top: 20px;
                    left: 50%;
                    transform: translateX(-50%);
                    background: #18181b;
                    color: #fff;
                    padding: 12px 24px;
                    border-radius: 8px;
                    border: 1px solid #ef4444; /* RED Border */
                    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.5);
                    z-index: 100000;
                    font-family: monospace;
                    font-size: 14px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    animation: slideIn 0.5s ease-out;
                `;

                toast.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                    <span style="font-weight: 600;">Disconnected</span>
                `;

                const style = document.createElement('style');
                style.innerHTML = `@keyframes slideIn { from { transform: translate(-50%, -100%); opacity: 0; } to { transform: translate(-50%, 0); opacity: 1; } }`;
                document.head.appendChild(style);
                document.body.appendChild(toast);

                setTimeout(() => {
                    location.reload();
                }, 1500);
            }
        });

        status.innerText = "Cleared!";
        status.style.color = "#e74c3c";

    } catch (err) {
        status.innerText = "Error: " + err.message;
    }
});