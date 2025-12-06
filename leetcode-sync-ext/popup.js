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
                // Optional: Console log for debugging inside the page
                console.log("LeetCode Synced via Extension");
                alert('✅ Account Synced Successfully!');
                location.reload(); 
            },
            args: [session.value, csrf.value]
        });

        status.innerText = "✅ Synced successfully!";
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
            status.innerText = "❌ Error: Open Localhost tab to clear!";
            status.style.color = "red";
            return;
        }

        // Inject script to remove items from LocalStorage
        await chrome.scripting.executeScript({
            target: { tabId: currentTab.id },
            func: () => {
                localStorage.removeItem('user_session');
                localStorage.removeItem('user_csrf');
                alert('🗑️ Disconnected! Local data cleared.');
                location.reload(); // Reload taaki app logout state me aa jaye
            }
        });

        status.innerText = "🗑️ Data Cleared!";
        status.style.color = "#e74c3c";

    } catch (err) {
        status.innerText = "Error: " + err.message;
    }
});