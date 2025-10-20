// API Key (dalam produksi sebaiknya disimpan di environment variable)
const API_KEY = 'sk-f1092ed465964b7c955b274f82e0df58';
const API_URL = 'https://api.openai.com/v1/chat/completions';

// State aplikasi
let currentUser = null;
let currentChatId = null;
let chats = [];

// DOM Elements
const loginPage = document.getElementById('login-page');
const signupPage = document.getElementById('signup-page');
const chatPage = document.getElementById('chat-page');
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const showSignupLink = document.getElementById('show-signup');
const showLoginLink = document.getElementById('show-login');
const logoutButton = document.getElementById('logout');
const newChatButton = document.getElementById('new-chat');
const chatList = document.getElementById('chat-list');
const chatMessages = document.getElementById('chat-messages');
const messageInput = document.getElementById('message-input');
const sendButton = document.getElementById('send-button');
const currentChatTitle = document.getElementById('current-chat-title');
const userNameElement = document.getElementById('user-name');

// Event Listeners
document.addEventListener('DOMContentLoaded', initApp);

loginForm.addEventListener('submit', handleLogin);
signupForm.addEventListener('submit', handleSignup);
showSignupLink.addEventListener('click', showSignupPage);
showLoginLink.addEventListener('click', showLoginPage);
logoutButton.addEventListener('click', handleLogout);
newChatButton.addEventListener('click', createNewChat);
sendButton.addEventListener('click', sendMessage);
messageInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

// Fungsi inisialisasi aplikasi
function initApp() {
    // Cek apakah ada user yang sudah login
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        showChatPage();
        loadUserChats();
    } else {
        showLoginPage();
    }
}

// Fungsi untuk menampilkan halaman login
function showLoginPage() {
    loginPage.classList.add('active');
    signupPage.classList.remove('active');
    chatPage.classList.remove('active');
}

// Fungsi untuk menampilkan halaman signup
function showSignupPage(e) {
    e.preventDefault();
    loginPage.classList.remove('active');
    signupPage.classList.add('active');
    chatPage.classList.remove('active');
}

// Fungsi untuk menampilkan halaman chat
function showChatPage() {
    loginPage.classList.remove('active');
    signupPage.classList.remove('active');
    chatPage.classList.add('active');
    userNameElement.textContent = currentUser.name;
}

// Fungsi untuk menangani login
function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    // Validasi sederhana
    if (!email || !password) {
        alert('Harap isi semua field');
        return;
    }
    
    // Simulasi login (dalam aplikasi nyata, ini akan berkomunikasi dengan backend)
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        showChatPage();
        loadUserChats();
    } else {
        alert('Email atau password salah');
    }
}

// Fungsi untuk menangani signup
function handleSignup(e) {
    e.preventDefault();
    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    
    // Validasi sederhana
    if (!name || !email || !password) {
        alert('Harap isi semua field');
        return;
    }
    
    // Simulasi signup (dalam aplikasi nyata, ini akan berkomunikasi dengan backend)
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    // Cek apakah email sudah terdaftar
    if (users.find(u => u.email === email)) {
        alert('Email sudah terdaftar');
        return;
    }
    
    // Tambah user baru
    const newUser = { id: Date.now().toString(), name, email, password };
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    // Login otomatis setelah signup
    currentUser = newUser;
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    showChatPage();
    loadUserChats();
}

// Fungsi untuk menangani logout
function handleLogout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    showLoginPage();
}

// Fungsi untuk memuat chat pengguna
function loadUserChats() {
    const allChats = JSON.parse(localStorage.getItem('chats') || '[]');
    chats = allChats.filter(chat => chat.userId === currentUser.id);
    renderChatList();
    
    // Jika ada chat, tampilkan yang terakhir
    if (chats.length > 0) {
        loadChat(chats[chats.length - 1].id);
    } else {
        // Jika tidak ada chat, buat chat baru
        createNewChat();
    }
}

// Fungsi untuk membuat chat baru
function createNewChat() {
    const chatId = Date.now().toString();
    const newChat = {
        id: chatId,
        userId: currentUser.id,
        title: 'Obrolan Baru',
        messages: [],
        createdAt: new Date().toISOString()
    };
    
    chats.push(newChat);
    saveChats();
    renderChatList();
    loadChat(chatId);
}

// Fungsi untuk memuat chat tertentu
function loadChat(chatId) {
    currentChatId = chatId;
    const chat = chats.find(c => c.id === chatId);
    
    if (chat) {
        currentChatTitle.textContent = chat.title;
        renderChatMessages(chat.messages);
        
        // Tandai chat aktif di sidebar
        document.querySelectorAll('#chat-list li').forEach(item => {
            item.classList.remove('active');
            if (item.dataset.chatId === chatId) {
                item.classList.add('active');
            }
        });
    }
}

// Fungsi untuk merender daftar chat
function renderChatList() {
    chatList.innerHTML = '';
    
    chats.forEach(chat => {
        const li = document.createElement('li');
        li.textContent = chat.title;
        li.dataset.chatId = chat.id;
        li.addEventListener('click', () => loadChat(chat.id));
        
        if (chat.id === currentChatId) {
            li.classList.add('active');
        }
        
        chatList.appendChild(li);
    });
}

// Fungsi untuk merender pesan chat
function renderChatMessages(messages) {
    chatMessages.innerHTML = '';
    
    if (messages.length === 0) {
        const welcomeMessage = document.createElement('div');
        welcomeMessage.className = 'welcome-message';
        welcomeMessage.innerHTML = `
            <h2>Selamat datang di AI Assistant</h2>
            <p>Mulai obrolan baru dengan AI. Tanyakan apa saja!</p>
        `;
        chatMessages.appendChild(welcomeMessage);
        return;
    }
    
    messages.forEach(message => {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${message.role === 'user' ? 'user-message' : 'ai-message'}`;
        messageDiv.textContent = message.content;
        chatMessages.appendChild(messageDiv);
    });
    
    // Scroll ke bawah
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Fungsi untuk mengirim pesan
async function sendMessage() {
    const message = messageInput.value.trim();
    
    if (!message) return;
    
    // Dapatkan chat aktif
    const chat = chats.find(c => c.id === currentChatId);
    if (!chat) return;
    
    // Tambah pesan pengguna
    const userMessage = { role: 'user', content: message };
    chat.messages.push(userMessage);
    
    // Update judul chat jika ini pesan pertama
    if (chat.messages.length === 1) {
        chat.title = message.substring(0, 30) + (message.length > 30 ? '...' : '');
        currentChatTitle.textContent = chat.title;
    }
    
    // Render pesan
    renderChatMessages(chat.messages);
    
    // Kosongkan input
    messageInput.value = '';
    
    // Simpan chat
    saveChats();
    renderChatList();
    
    // Tampilkan indikator loading
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'message ai-message';
    loadingDiv.textContent = 'AI sedang mengetik...';
    loadingDiv.id = 'loading-message';
    chatMessages.appendChild(loadingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    try {
        // Panggil API OpenAI
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [
                    { role: 'system', content: 'Anda adalah asisten AI yang membantu.' },
                    ...chat.messages
                ],
                max_tokens: 500,
                temperature: 0.7
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Hapus indikator loading
        document.getElementById('loading-message').remove();
        
        // Tambah respons AI
        const aiMessage = { 
            role: 'assistant', 
            content: data.choices[0].message.content 
        };
        chat.messages.push(aiMessage);
        
        // Render pesan
        renderChatMessages(chat.messages);
        
        // Simpan chat
        saveChats();
        
    } catch (error) {
        console.error('Error:', error);
        
        // Hapus indikator loading
        document.getElementById('loading-message').remove();
        
        // Tampilkan pesan error
        const errorDiv = document.createElement('div');
        errorDiv.className = 'message ai-message';
        errorDiv.textContent = 'Maaf, terjadi kesalahan. Silakan coba lagi.';
        chatMessages.appendChild(errorDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        // Tambah pesan error ke chat
        chat.messages.push({ 
            role: 'assistant', 
            content: 'Maaf, terjadi kesalahan. Silakan coba lagi.' 
        });
        
        saveChats();
    }
}

// Fungsi untuk menyimpan semua chat
function saveChats() {
    const allChats = JSON.parse(localStorage.getItem('chats') || '[]');
    
    // Hapus chat lama dari pengguna ini
    const filteredChats = allChats.filter(chat => chat.userId !== currentUser.id);
    
    // Tambah chat baru/update
    const updatedChats = [...filteredChats, ...chats];
    localStorage.setItem('chats', JSON.stringify(updatedChats));
}