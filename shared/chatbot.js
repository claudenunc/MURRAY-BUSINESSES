/* ============================================
   FooLiSHNeSS eNVy — AI Chatbot Widget
   Reusable conversational AI demo
   ============================================ */

class AIChatbot {
  constructor(config) {
    this.name = config.name || 'AI Assistant';
    this.avatar = config.avatar || '🤖';
    this.greeting = config.greeting || 'Hello! How can I help you today?';
    this.responses = config.responses || {};
    this.fallback = config.fallback || "I appreciate your question! For more specific help, please contact us directly.";
    this.accentColor = config.accentColor || '#7c3aed';
    this.containerId = config.containerId || null;
    this.isFloating = config.isFloating !== false;
    this.isOpen = false;
    this.messages = [];

    if (this.isFloating) {
      this.createFloatingWidget();
    } else if (this.containerId) {
      this.initEmbedded();
    }
  }

  createFloatingWidget() {
    // Create wrapper
    const wrapper = document.createElement('div');
    wrapper.className = 'chatbot-float';
    wrapper.innerHTML = `
      <button class="chatbot-toggle" aria-label="Open chat">
        <span class="toggle-icon">💬</span>
        <span class="notification-dot"></span>
      </button>
      <div class="chatbot-panel" id="chatbot-panel">
        ${this.buildChatUI()}
      </div>
    `;
    document.body.appendChild(wrapper);

    // Bind events
    wrapper.querySelector('.chatbot-toggle').addEventListener('click', () => this.toggle());
    this.bindInputEvents(wrapper.querySelector('.chatbot-panel'));
    this.chatContainer = wrapper.querySelector('.ai-demo-messages');

    // Auto-greeting after 2s
    setTimeout(() => this.addMessage(this.greeting, 'bot'), 1500);
  }

  initEmbedded() {
    const container = document.getElementById(this.containerId);
    if (!container) return;
    container.innerHTML = this.buildChatUI();
    this.bindInputEvents(container);
    this.chatContainer = container.querySelector('.ai-demo-messages');
    
    setTimeout(() => this.addMessage(this.greeting, 'bot'), 800);
  }

  buildChatUI() {
    return `
      <div class="ai-demo-header">
        <div class="avatar">${this.avatar}</div>
        <div class="info">
          <h4>${this.name}</h4>
          <span>Online now</span>
        </div>
      </div>
      <div class="ai-demo-messages"></div>
      <div class="ai-demo-input">
        <input type="text" placeholder="Type a message..." aria-label="Chat input" />
        <button aria-label="Send message">➤</button>
      </div>
    `;
  }

  bindInputEvents(container) {
    const input = container.querySelector('.ai-demo-input input');
    const sendBtn = container.querySelector('.ai-demo-input button');

    const send = () => {
      const text = input.value.trim();
      if (!text) return;
      input.value = '';
      this.addMessage(text, 'user');
      this.processInput(text);
    };

    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') send();
    });
    sendBtn.addEventListener('click', send);
  }

  toggle() {
    const panel = document.getElementById('chatbot-panel');
    if (!panel) return;
    this.isOpen = !this.isOpen;
    panel.classList.toggle('open', this.isOpen);

    const toggle = document.querySelector('.chatbot-toggle');
    const icon = toggle.querySelector('.toggle-icon');
    icon.textContent = this.isOpen ? '✕' : '💬';

    const dot = toggle.querySelector('.notification-dot');
    if (dot && this.isOpen) dot.style.display = 'none';
  }

  addMessage(text, type) {
    if (!this.chatContainer) return;

    const msg = document.createElement('div');
    msg.className = `chat-message ${type}`;
    msg.textContent = text;
    this.chatContainer.appendChild(msg);
    this.chatContainer.scrollTop = this.chatContainer.scrollHeight;
    this.messages.push({ text, type });
  }

  showTyping() {
    if (!this.chatContainer) return;
    const typing = document.createElement('div');
    typing.className = 'chat-typing';
    typing.id = 'typing-indicator';
    typing.innerHTML = '<span></span><span></span><span></span>';
    this.chatContainer.appendChild(typing);
    this.chatContainer.scrollTop = this.chatContainer.scrollHeight;
  }

  hideTyping() {
    const typing = document.getElementById('typing-indicator');
    if (typing) typing.remove();
  }

  processInput(text) {
    const lower = text.toLowerCase();

    this.showTyping();

    // Find best matching response
    let response = this.fallback;
    let bestScore = 0;

    for (const [keywords, reply] of Object.entries(this.responses)) {
      const keyArr = keywords.split('|');
      let score = 0;
      keyArr.forEach(k => {
        if (lower.includes(k.trim().toLowerCase())) score++;
      });
      if (score > bestScore) {
        bestScore = score;
        response = Array.isArray(reply) ? reply[Math.floor(Math.random() * reply.length)] : reply;
      }
    }

    // Simulate typing delay
    const delay = Math.min(800 + response.length * 15, 2500);
    setTimeout(() => {
      this.hideTyping();
      this.addMessage(response, 'bot');
    }, delay);
  }
}

// ── Pre-configured Chatbot Factories ──

function createPharmacyChatbot(options = {}) {
  return new AIChatbot({
    name: "Alex's Rx Assistant",
    avatar: '💊',
    greeting: "Welcome to Alex's Family Pharmacy! 👋 I can help you with prescription refills, medication questions, or finding our services. What do you need today?",
    responses: {
      'refill|prescription|medication|rx|medicine': 
        "I'd be happy to help with your refill! Please provide your prescription number or the medication name, and I'll check availability right away. 📋",
      'hours|open|close|time':
        "We're open Monday–Friday 9 AM to 6 PM and Saturday 9 AM to 1 PM. Closed Sundays. Need to schedule a pickup? 🕐",
      'insurance|coverage|copay':
        "We accept most major insurance plans including Medicare Part D, Medicaid, and private insurance. I can verify your coverage — just share your insurance ID! 🏥",
      'transfer|switch|move':
        "Transferring your prescription to us is easy! Just provide your current pharmacy name and Rx number, and we'll handle the rest. Usually takes under 24 hours.",
      'vaccine|immunization|flu|shot|covid':
        "We offer a full range of immunizations including flu, COVID-19, shingles, and pneumonia vaccines. Walk-ins welcome, or I can schedule you a slot! 💉",
      'compound|compounding|custom':
        "Yes! We offer custom compounding services for personalized medications. Our pharmacists work directly with your doctor to create the right formulation for you.",
      'delivery|ship|deliver|mail':
        "We offer free local delivery within Murray! Prescriptions placed before 2 PM are typically delivered same day. Want to set up delivery? 🚗",
      'cost|price|how much|expensive':
        "We work hard to keep prices competitive. Many generics start under $10. I can check specific pricing once I have your medication name and insurance info.",
      'hello|hi|hey|good':
        "Hey there! Great to have you. How can Alex's Family Pharmacy help you today? 😊",
      'thanks|thank you|appreciate':
        "You're welcome! We're here for you anytime. Is there anything else I can help with? 💜"
    },
    fallback: "Great question! For the best answer, you can call us at (270) 917-1424 or stop by at 801 Paramount Drive. Is there anything else I can help with?",
    ...options
  });
}

function createChiroChatbot(options = {}) {
  return new AIChatbot({
    name: 'Booking Assistant',
    avatar: '🦴',
    greeting: "Welcome! I'm your AI scheduling assistant. I can book appointments, answer questions about our services, or help with insurance inquiries. How can I help?",
    responses: {
      'book|appointment|schedule|available|slot|opening':
        "I'd love to get you scheduled! We have openings this week. Do you prefer morning (9-12) or afternoon (1-5)? And is this your first visit with us? 📅",
      'first visit|new patient|never been':
        "Welcome! For new patients, your first visit includes a comprehensive evaluation and consultation. It typically takes about 45 minutes. I'll also send you digital intake forms to save time! 📋",
      'pain|hurt|ache|sore|back|neck|headache':
        "I'm sorry you're dealing with that! Our doctors specialize in pain management through spinal adjustments and therapeutic techniques. Let me book you in — are you available this week?",
      'insurance|coverage|accept|plan':
        "We accept most major insurance plans including Blue Cross, Aetna, United Healthcare, and Medicare. I can verify your benefits before your visit — just share your member ID.",
      'hours|open|when':
        "Our office hours are Monday, Wednesday, Friday 8 AM–5 PM and Tuesday, Thursday 10 AM–6 PM. Which day works best for you?",
      'cost|price|how much|without insurance|cash':
        "For self-pay patients, initial consultations are $75 and follow-up adjustments are $45. We also offer affordable wellness packages!",
      'cancel|reschedule|change':
        "No problem! I can reschedule your appointment. Please provide your name or appointment date, and I'll find your booking.",
      'hello|hi|hey':
        "Hi there! Ready to feel your best? I can help you book an adjustment, answer insurance questions, or guide you to the right service. 😊",
      'thanks|thank you':
        "Absolutely! Take care of yourself, and we'll see you at the office. 💪"
    },
    fallback: "That's a great question! For the most detailed answer, you can reach us at (270) 227-5563 or email chiromotionspine@icloud.com. Anything else I can help with?",
    ...options
  });
}

function createCornerstoneChatbot(options = {}) {
  return new AIChatbot({
    name: 'Cornerstone Care AI',
    avatar: '🏥',
    greeting: "Hello! I'm the Cornerstone Chiropractic virtual assistant. I can help you book with Dr. Adam or Dr. Heskett, answer questions about our treatments, or guide you through our pain assessment. What brings you in today?",
    responses: {
      'book|appointment|schedule|see doctor|visit':
        "Let me check availability! Would you prefer to see Dr. Adam or Dr. Heskett? And what day/time range works best for you? 📅",
      'dr adam|doctor adam|adam':
        "Dr. Adam specializes in sports injuries and spinal rehabilitation. He's available Mon/Wed/Fri. Would you like me to book an appointment with him?",
      'dr heskett|doctor heskett|heskett':
        "Dr. Heskett focuses on family chiropractic care and preventive wellness. She's available Tue/Thu/Sat mornings. Want me to schedule you?",
      'pain|hurt|where|back|neck|shoulder|knee|head':
        "I understand — pain can be really tough. Can you tell me: 1) Where exactly is the pain? 2) How long have you had it? 3) Rate it 1-10? This helps us prepare the best treatment plan for you.",
      'first time|new|never':
        "Welcome to Cornerstone! Your first visit includes a full spinal evaluation, X-rays if needed, and a personalized treatment plan discussion. Allow about 60 minutes. I'll text you intake forms ahead of time!",
      'insurance|coverage|cost':
        "We accept most insurance plans and offer affordable self-pay options. Initial visits are $85, follow-ups at $50. WE also have family wellness packages!",
      'hours|open':
        "We're open Mon-Fri 8 AM–6 PM and Saturday 8 AM–12 PM. Closed Sundays. When's good for you?",
      'text|sms|message':
        "You can absolutely text us to book! Just send your preferred date/time and we'll confirm within minutes. This chat interface is a demo of how that experience would work! 📱",
      'hello|hi|hey':
        "Hey! Welcome to Cornerstone Chiropractic. Whether you're dealing with pain or just want to stay aligned, we're here for you. How can I help? 😊",
      'thanks|thank':
        "My pleasure! Wishing you wellness and comfort. Don't hesitate to reach out anytime. 🌟"
    },
    fallback: "That's a great question! I'd recommend speaking with our team directly for the most accurate answer. Would you like me to schedule a call or appointment?",
    ...options
  });
}

// Export for modules or make global
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { AIChatbot, createPharmacyChatbot, createChiroChatbot, createCornerstoneChatbot };
} else {
  window.AIChatbot = AIChatbot;
  window.createPharmacyChatbot = createPharmacyChatbot;
  window.createChiroChatbot = createChiroChatbot;
  window.createCornerstoneChatbot = createCornerstoneChatbot;
}
