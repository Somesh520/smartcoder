# 🚀 LeetCode Local Workspace

**Apna khud ka LeetCode Environment! (Custom IDE)**

Ye project ek "Clone" ya "Custom Client" hai. Waise toh aap directly [LeetCode.com](https://leetcode.com) par practice kar sakte ho, lekin is project ka maqsad hai:
1.  **Learning:** Samajhna ki LeetCode ki APIs aur Cookies kaise kaam karti hain.
2.  **Customization:** Apna khud ka Dark Mode Editor aur Clean UI experience banana.
3.  **Speed:** Bina faaltu ke ads ya distractions ke code run karna.

![LeetCode Local UI](https://img.shields.io/badge/Status-Working-brightgreen) ![Tech](https://img.shields.io/badge/Tech-Node.js%20|%20Express-blue)

---

## ✨ Features (Kya Khaas Hai?)
* **Code Runner:** C++, Java, Python, JS - sab yahi run honge.
* **Sync Extension:** Chrome extension se aapka login session yahan copy ho jayega.
* **Real LeetCode Feel:** Same dark theme, same stats (Runtime/Memory Beats %).
* **Result Console:** Test cases aur errors ka detailed view.

---

## 🛠️ Installation (Kaise Setup Karein?)

Bas 2 cheezein karni hain: **Server** chalana hai aur **Extension** browser me daalna hai.

### Step 1: Server Setup (Code Run Karne Ke Liye)

Pehle is folder me terminal kholo.

1.  **Libraries Install karo:**
    (Aapke PC me Node.js hona chahiye)
    ```bash
    npm install express cors axios
    ```

2.  **Server Start karo:**
    ```bash
    node server.js
    ```
    *Jab likha aaye `Server running at http://localhost:3000`, matlab sab sahi hai!*

---

### Step 2: Extension Setup (Login Sync Karne Ke Liye)

Ye extension aapke LeetCode account ko local server se jodega.

1.  Chrome Browser kholo aur URL bar me likho: `chrome://extensions/`
2.  Top-right corner me **"Developer mode"** ko **ON** kar do.
3.  **"Load unpacked"** button par click karo.
4.  Is project ka folder select karo (jahan `manifest.json` wali file hai).
5.  Ab aapko chrome me **LeetCode Sync** ka icon dikh jayega.

---

## 🚀 Kaise Use Karein?

1.  **Browser me:** [LeetCode.com](https://leetcode.com) par jao aur login raho.
2.  **New Tab me:** `http://localhost:3000` kholo.
3.  **Sync:**
    * Browser ke upar Extension wale icon par click karo.
    * **"Sync Now"** button dabao.
    * *Message aayega: "Synced Successfully!"*
4.  **Bas Shuru Ho Jao:**
    * Ab `localhost:3000` par page reload karo.
    * Koi bhi question search karo, code likho aur **Run/Submit** daba do.
    * Ye aapke asli LeetCode account par hi submit hoga!

---

## ⚠️ Agar Koi Dikkat Aaye

* **"Auth Missing" Error:**
    * Iska matlab sync nahi hua. Extension kholo aur dobara **Sync Now** dabao jab `localhost:3000` khula ho.
* **List nahi dikh rahi?**
    * Check karo terminal me `node server.js` chal raha hai ya band ho gaya.
* **Submit nahi ho raha?**
    * Shayad LeetCode session expire ho gaya ho. LeetCode par logout karke wapas login karo, fir extension se sync karo.

---

## 🤝 Note

Ye project **Educational Purpose** ke liye hai. Original practice ke liye aap hamesha [LeetCode Official](https://leetcode.com) use kar sakte hain. Ye bas development skills show karne ke liye hai!

**Happy Coding! 👨‍💻**