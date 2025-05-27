document.addEventListener("DOMContentLoaded", () => {
  const chatContainer = document.getElementById("chat-container");
  const userInput = document.getElementById("user-input");
  const sendBtn = document.getElementById("send-btn");
  const status = document.getElementById("status");
  let chatHistory = [];

  // Fungsi untuk mendapatkan cookie
  function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
  }

  // Fungsi untuk menyimpan cookie
  function setCookie(name, value, days = 30) {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    const expires = `expires=${date.toUTCString()}`;
    document.cookie = `${name}=${value};${expires};path=/;SameSite=Lax`;
  }

  // Fungsi untuk memuat riwayat dari Local Storage
  function loadChatHistory() {
    const savedHistory = localStorage.getItem("geminiChatHistory");
    if (savedHistory) {
      chatHistory = JSON.parse(savedHistory);
      renderChatHistory();
    }

    // Cek preferensi tema dari cookie
    const themePreference = getCookie("themePreference") || "light";
    document.documentElement.classList.toggle(
      "dark",
      themePreference === "dark"
    );
  }

  // Fungsi untuk merender riwayat chat
  function renderChatHistory() {
    chatContainer.innerHTML = "";
    chatHistory.forEach((msg) => {
      addMessage(msg.content, msg.role === "user", false);
    });
  }

  // Fungsi untuk menyimpan riwayat ke Local Storage
  function saveChatHistory() {
    localStorage.setItem("geminiChatHistory", JSON.stringify(chatHistory));
  }

  // Fungsi untuk menambahkan pesan
  function addMessage(content, isUser = false, saveToHistory = true) {
    const messageDiv = document.createElement("div");
    messageDiv.classList.add("message", "rounded-lg", "p-3", "shadow-sm");

    if (isUser) {
      messageDiv.classList.add("user-message");
      if (saveToHistory) {
        chatHistory.push({ role: "user", content });
        saveChatHistory();
      }
    } else {
      messageDiv.classList.add("bot-message");
      if (saveToHistory) {
        chatHistory.push({ role: "assistant", content });
        saveChatHistory();
      }
    }

    // Format pesan dengan markdown sederhana
    const formattedContent = content
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/\n/g, "<br>");

    messageDiv.innerHTML = formattedContent;
    chatContainer.appendChild(messageDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
  }

  // Fungsi untuk mengosongkan riwayat chat
  function clearChatHistory() {
    chatHistory = [];
    localStorage.removeItem("geminiChatHistory");
    chatContainer.innerHTML =
      '<div class="text-center text-gray-500 py-4">Percakapan baru dimulai...</div>';
  }

  // Fungsi untuk toggle tema gelap
  function toggleDarkMode() {
    const isDark = document.documentElement.classList.toggle("dark");
    setCookie("themePreference", isDark ? "dark" : "light");
  }

  // Tambahkan tombol kontrol
  function addControlButtons() {
    const header = document.querySelector("header");

    const controlsDiv = document.createElement("div");
    controlsDiv.className = "flex space-x-2 ml-auto";

    const clearBtn = document.createElement("button");
    clearBtn.innerHTML =
      '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" /></svg>';
    clearBtn.title = "Bersihkan Percakapan";
    clearBtn.className = "p-1 text-white hover:text-gray-200 transition-colors";
    clearBtn.addEventListener("click", clearChatHistory);

    const themeBtn = document.createElement("button");
    themeBtn.innerHTML =
      '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" /></svg>';
    themeBtn.title = "Toggle Tema Gelap";
    themeBtn.className = "p-1 text-white hover:text-gray-200 transition-colors";
    themeBtn.addEventListener("click", toggleDarkMode);

    controlsDiv.appendChild(themeBtn);
    controlsDiv.appendChild(clearBtn);
    header.appendChild(controlsDiv);
  }

  // Fungsi untuk menampilkan indikator typing
  function showTypingIndicator() {
    const typingDiv = document.createElement("div");
    typingDiv.classList.add(
      "bot-message",
      "message",
      "rounded-lg",
      "p-3",
      "shadow-sm"
    );
    typingDiv.id = "typing-indicator";

    const typingContent = document.createElement("div");
    typingContent.classList.add("flex", "items-center", "space-x-1");
    typingContent.innerHTML = `
            <span>Botax AI mengetik</span>
            <div class="typing-indicator"></div>
            <div class="typing-indicator"></div>
            <div class="typing-indicator"></div>
        `;

    typingDiv.appendChild(typingContent);
    chatContainer.appendChild(typingDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
  }

  // Fungsi untuk menghapus indikator typing
  function hideTypingIndicator() {
    const typingDiv = document.getElementById("typing-indicator");
    if (typingDiv) {
      typingDiv.remove();
    }
  }

  // Fungsi untuk mengirim pesan ke server
  async function sendMessageToServer(message) {
    status.textContent = "Mengirim...";

    try {
      const response = await fetch("http://localhost:3000/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.response;
    } catch (error) {
      console.error("Error:", error);
      return "Maaf, terjadi kesalahan saat menghubungi Gemini API.";
    } finally {
      status.textContent = "Siap";
    }
  }

  // Fungsi untuk menangani pengiriman pesan
  async function handleSendMessage() {
    const message = userInput.value.trim();
    if (!message) return;

    // Tambahkan pesan pengguna
    addMessage(message, true);
    userInput.value = "";

    // Tampilkan indikator typing
    showTypingIndicator();

    // Dapatkan respons dari Gemini
    const botResponse = await sendMessageToServer(message);

    // Hapus indikator typing dan tambahkan respons
    hideTypingIndicator();
    addMessage(botResponse);
  }

  // Event listeners
  sendBtn.addEventListener("click", handleSendMessage);

  userInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  });

   // Inisialisasi
    addControlButtons();
    loadChatHistory();
});
