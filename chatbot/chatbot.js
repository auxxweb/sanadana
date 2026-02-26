/**
 * Sanadana Herbal AI Practitioner - Chatbot
 * Herbal treatment knowledge, humble tone. No external APIs required (free).
 */

(function () {
  'use strict';

  const PRODUCTS = [
    { name: "Arshopilecare", purpose: "Piles and hemorrhoids support", symptoms: ["piles", "hemorrhoids", "bleeding during stool", "pain during bowel movement", "anal swelling"], description: "Ayurvedic support formula for managing piles and improving digestive health.", link: "https://shop.sanadanaherbals.com/products/arshopilecare" },
    { name: "AminoHit", purpose: "Energy and immunity booster", symptoms: ["low energy", "fatigue", "weakness", "low immunity"], description: "Herbal amino support formulation to improve strength and immune health.", link: "https://shop.sanadanaherbals.com/products/aminohit?variant=44982933061788" },
    { name: "Dhathriarishtam", purpose: "Digestive and liver support", symptoms: ["indigestion", "loss of appetite", "gas", "stomach discomfort"], description: "Traditional Ayurvedic digestive tonic for metabolism and liver support.", link: "https://shop.sanadanaherbals.com/products/dhathriarishtam?variant=45203188023452" },
    { name: "Sand Cof", purpose: "Cough and respiratory support", symptoms: ["cough", "cold", "sore throat", "phlegm"], description: "Herbal syrup for cough and respiratory comfort.", link: "https://shop.sanadanaherbals.com/products/sand-cof?variant=44982928408732" },
    { name: "SD Himo Plus", purpose: "Hemoglobin and iron support", symptoms: ["low hemoglobin", "anemia", "iron deficiency", "tiredness"], description: "Iron rich herbal formulation for improving hemoglobin levels.", link: "https://shop.sanadanaherbals.com/products/sd-himo-plus?variant=44982943842460" }
  ];

  const GREETING = "Namaste 🙏 I am your Sanadana Herbal assistant. I’m here to share what I know about herbal care and our products—with humility. How may I help you today?";
  const FALLBACK = "I may not have the right answer for that. If you share your symptoms or ask about our herbal products, I’ll do my best to help. Thank you for your patience.";
  const DISCLAIMER = " If symptoms are severe or persist, please consult a healthcare professional.";

  /** Herbal / Ayurvedic knowledge: keywords (array) -> humble response */
  const HERBAL_KNOWLEDGE = [
    { keywords: ["turmeric", "haldi", "curcumin"], reply: "With humility, I share that turmeric is valued in Ayurveda for its warming quality and support to digestion and immunity. It is often used in food and traditional preparations. We do not replace medical advice—for specific conditions, a practitioner can guide you better." },
    { keywords: ["tulsi", "holy basil", "basil"], reply: "Tulsi (holy basil) is considered sacred in Ayurveda and is traditionally used for respiratory comfort and general wellness. Our Sand Cof syrup includes herbal ingredients that support cough and throat. I’d suggest speaking with a doctor if symptoms are severe." },
    { keywords: ["ginger", "adrak", "digestion", "gas", "bloating"], reply: "In Ayurveda, ginger is often used to support digestion and reduce discomfort from gas. Products like Dhathriarishtam are traditional digestive tonics that may support appetite and metabolism. I’m happy to help you explore our range—please do consult a doctor for persistent issues." },
    { keywords: ["immunity", "immune", "resist"], reply: "Ayurveda supports immunity through diet, rest, and herbs. Our AminoHit is a herbal formulation that may support energy and immunity. I share this with humility—for serious health concerns, a healthcare provider is the right guide." },
    { keywords: ["cough", "cold", "throat", "phlegm", "respiratory"], reply: "For cough and respiratory comfort, herbs like tulsi and others are traditionally used. Our Sand Cof is a herbal syrup for such support. I’d be grateful to point you to it; if your condition is severe, please see a doctor." },
    { keywords: ["piles", "hemorrhoid", "bleeding", "bowel"], reply: "Piles can be uncomfortable. In Ayurveda, diet and gentle herbal support are often considered. Our Arshopilecare is formulated for such support. I share this respectfully—for bleeding or severe pain, please consult a doctor without delay." },
    { keywords: ["anemia", "hemoglobin", "iron", "weakness", "tired", "fatigue"], reply: "Low iron and low energy are common concerns. Our SD Himo Plus is an iron-rich herbal formulation that may support hemoglobin levels. I offer this with humility; a doctor can best advise for anemia and fatigue." },
    { keywords: ["digestion", "digestive", "indigestion", "appetite", "stomach", "agni"], reply: "Ayurveda places great importance on digestive strength (agni). Dhathriarishtam is a traditional digestive tonic that may support appetite and metabolism. I share this respectfully—for ongoing digestive issues, a practitioner’s guidance is valuable." },
    { keywords: ["ayurveda", "ayurvedic", "what is ayurveda"], reply: "Ayurveda is an ancient system of natural wellness from India, focusing on balance of body and mind through diet, lifestyle, and herbs. I share this with humility—we at Sanadana offer herbal products that draw from this tradition, but we do not replace professional medical advice." },
    { keywords: ["dosha", "vata", "pitta", "kapha"], reply: "In Ayurveda, doshas (Vata, Pitta, Kapha) are seen as energies that influence our constitution. Balancing them is thought to support wellness. I’d suggest consulting an Ayurvedic practitioner for personal guidance—I can only share general information with humility." },
    { keywords: ["detox", "detoxification", "cleanse"], reply: "In Ayurveda, gentle cleansing is often done through diet and herbs rather than harsh detoxes. Digestive tonics and light, seasonal foods are commonly used. I share this respectfully—any detox or cleanse should be done under guidance." },
    { keywords: ["stress", "anxiety", "relax", "mind"], reply: "Ayurveda considers rest, routine, and calming herbs supportive for the mind. We focus on digestive and immunity products; for stress and anxiety, a doctor or counsellor can offer the best support. Thank you for trusting me with your question." },
    { keywords: ["sleep", "insomnia", "sleepless"], reply: "Sleep is vital in Ayurveda. Lifestyle and diet are often addressed first. We don’t have a specific sleep product, but I’m happy to help with digestion or immunity. For lasting sleep issues, a healthcare provider can guide you better." },
    { keywords: ["weight", "obesity", "reduce weight", "lose weight"], reply: "Ayurveda looks at weight through digestion and lifestyle. Our products support digestion and metabolism rather than direct weight loss. I share this with humility—for a weight plan, a doctor or nutritionist is best." },
    { keywords: ["skin", "hair", "beauty"], reply: "Ayurveda connects skin and hair health to diet and digestion. We focus on internal wellness with our herbal range. For skin or hair concerns, an Ayurvedic or dermatology practitioner can offer personalised advice. I’m here if you’d like to know about our products." },
    { keywords: ["side effect", "safe", "safe to use", "any harm"], reply: "Our formulations are made with herbal ingredients and manufactured under quality practices. Still, I share with humility: each body is different. Please read the product information and, if you have health conditions or take other medicines, consult a doctor before use." },
    { keywords: ["how to use", "dosage", "how much", "when to take"], reply: "I’d be glad to help. Dosage and use depend on the product. Please check the label on the pack or the product page on our shop. If you tell me which product you have, I can point you to the right information—with the reminder that a doctor’s advice is best for your situation." },
    { keywords: ["natural", "chemical free", "organic"], reply: "We strive to use natural, herbal ingredients in our products. For details on a specific product, the pack or our shop page is the best source. I share this with humility—we’re here to support your wellness journey within the scope of our knowledge." },
    { keywords: ["kerala", "keralite", "traditional"], reply: "Sanadana Herbals is rooted in Kerala’s Ayurvedic tradition. We offer formulations that draw from this heritage. I’m grateful to share what I know—please ask if you’d like to know about any product or symptom." },
    { keywords: ["thank", "thanks", "bye", "goodbye"], reply: "Thank you for your kindness. I’m here whenever you need advice on herbal care or our products. Wishing you wellness. Namaste 🙏" },
    { keywords: ["hello", "hi", "hey", "namaste"], reply: "Namaste 🙏 Thank you for reaching out. I’m your Sanadana Herbal assistant. You can ask about our products, herbal support for symptoms, or general wellness. How may I help you?" },
    { keywords: ["herb", "herbal", "herbs", "plant"], reply: "Herbs have been used for centuries in Ayurveda for wellness. We use carefully selected herbs in our products. I’d be happy to suggest something based on your concern—with the humble note that a practitioner can guide you personally." },
    { keywords: ["children", "child", "kids", "baby"], reply: "I share with care: use of herbal products in children should always be under a doctor’s guidance. I can tell you about our products, but dosage and suitability for your child must come from a healthcare provider." },
    { keywords: ["pregnant", "pregnancy", "nursing", "lactating"], reply: "With humility, I’d suggest that during pregnancy or nursing you consult your doctor before using any herbal product. I can still help you learn about our range for later use or for other family members." },
    { keywords: ["diabetes", "sugar", "blood sugar"], reply: "Diabetes needs professional care. Some herbs are traditionally used for wellness, but I cannot advise on diabetes management. Please follow your doctor’s advice and ask them before trying any new product. I’m here for general herbal and product information." },
    { keywords: ["blood pressure", "bp", "hypertension"], reply: "Blood pressure should be managed with a doctor’s guidance. We don’t claim our products to treat hypertension. I share this respectfully—please consult your doctor before adding any supplement or herbal product." },
    { keywords: ["liver", "jaundice", "hepatitis"], reply: "Liver health is serious. Ayurveda has traditions of liver support, but I cannot advise on liver conditions. Please rely on your doctor. I can share information about our digestive tonic Dhathriarishtam in a general way—always with your doctor’s approval." },
    { keywords: ["joint", "arthritis", "pain", "knee", "back pain"], reply: "Joint and muscle discomfort can have many causes. We don’t have a dedicated joint product in our current range. I’d suggest consulting a doctor or an Ayurvedic practitioner for personalised advice. I’m here for digestive, immunity, or respiratory product questions." },
    { keywords: ["cold", "fever", "infection"], reply: "For cold and fever, rest and professional advice are important. Our Sand Cof may support cough and respiratory comfort. I share this with humility—if fever is high or symptoms worsen, please see a doctor." }
  ];

  let messagesEl, inputEl, formEl, sendBtn, typingEl;

  function init() {
    if (document.getElementById('sanadana-chatbot-root')) return;
    const root = document.createElement('div');
    root.id = 'sanadana-chatbot-root';
    root.className = 'sanadana-chatbot';
    root.innerHTML = `
      <button type="button" class="sanadana-chatbot__trigger" aria-label="Open chat">
        <svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12z"/></svg>
      </button>
      <div class="sanadana-chatbot__window" role="dialog" aria-label="Chat">
        <div class="sanadana-chatbot__header">
          <span class="sanadana-chatbot__title">Sanadana Herbal Assistant</span>
          <button type="button" class="sanadana-chatbot__close" aria-label="Close chat">×</button>
        </div>
        <div class="sanadana-chatbot__messages"></div>
        <div class="sanadana-chatbot__typing" hidden><span></span><span></span><span></span></div>
        <div class="sanadana-chatbot__input-wrap">
          <form class="sanadana-chatbot__form">
            <input type="text" class="sanadana-chatbot__input" placeholder="Ask about herbs, symptoms or products..." autocomplete="off">
            <button type="submit" class="sanadana-chatbot__send" aria-label="Send">
              <svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
            </button>
          </form>
        </div>
      </div>
    `;
    document.body.appendChild(root);
    const windowEl = root.querySelector('.sanadana-chatbot__window');
    messagesEl = root.querySelector('.sanadana-chatbot__messages');
    typingEl = root.querySelector('.sanadana-chatbot__typing');
    inputEl = root.querySelector('.sanadana-chatbot__input');
    formEl = root.querySelector('.sanadana-chatbot__form');
    sendBtn = root.querySelector('.sanadana-chatbot__send');

    root.querySelector('.sanadana-chatbot__trigger').addEventListener('click', function () {
      windowEl.classList.toggle('is-open');
      if (windowEl.classList.contains('is-open')) inputEl.focus();
    });
    root.querySelector('.sanadana-chatbot__close').addEventListener('click', function () { windowEl.classList.remove('is-open'); });
    formEl.addEventListener('submit', function (e) {
      e.preventDefault();
      const text = (inputEl.value || '').trim();
      if (!text) return;
      inputEl.value = '';
      appendMessage(text, 'user');
      sendBtn.disabled = true;
      showTyping(true);
      setTimeout(function () {
        const reply = getReply(text);
        showTyping(false);
        appendMessage(reply, 'bot');
        sendBtn.disabled = false;
      }, 500 + Math.random() * 400);
    });

    appendMessage(GREETING, 'bot');
  }

  function showTyping(show) {
    typingEl.hidden = !show;
    if (show) messagesEl.appendChild(typingEl);
  }

  function appendMessage(text, role) {
    const div = document.createElement('div');
    div.className = 'sanadana-chatbot__message sanadana-chatbot__message--' + role;
    if (role === 'bot') {
      div.innerHTML = text.replace(/\n/g, '<br>');
      div.querySelectorAll('a').forEach(function (a) { a.setAttribute('target', '_blank'); a.setAttribute('rel', 'noopener'); });
    } else div.textContent = text;
    messagesEl.appendChild(div);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function getReply(userText) {
    const lower = userText.toLowerCase();

    if (/what products|list products|which products|all products|do you have|your products/i.test(lower)) {
      return listAllProducts();
    }

    const matched = matchSymptoms(lower);
    if (matched.length > 0) return formatProductSuggestions(matched);

    const knowledgeReply = matchHerbalKnowledge(lower);
    if (knowledgeReply) return knowledgeReply;

    if (/general|health|wellness|diet|lifestyle|balance/i.test(lower)) {
      return "I’m glad you’re thinking about wellness. In Ayurveda, balance through diet and lifestyle is key. Our herbal products can support digestion and immunity. With humility, I’d suggest sharing your specific concern so I can point you to a product or suggest you consult a practitioner. How may I help?";
    }

    if (isOffTopic(lower)) {
      return "I’m here only to help with herbal care and our products. If you have a symptom or product question, I’d be happy to assist. Thank you for your understanding.";
    }

    return FALLBACK;
  }

  function matchHerbalKnowledge(text) {
    for (let i = 0; i < HERBAL_KNOWLEDGE.length; i++) {
      const row = HERBAL_KNOWLEDGE[i];
      for (let j = 0; j < row.keywords.length; j++) {
        if (text.indexOf(row.keywords[j]) !== -1) return row.reply;
      }
    }
    return null;
  }

  function listAllProducts() {
    let html = "With pleasure, here are our products:<ul class=\"sanadana-chatbot__product-list\">";
    PRODUCTS.forEach(function (p) {
      html += "<li><strong>" + escapeHtml(p.name) + "</strong> — " + escapeHtml(p.description) + "</li>";
    });
    html += "</ul>Share a symptom or product name and I’ll suggest the best match and a buying link.";
    return html;
  }

  function matchSymptoms(text) {
    const matched = [];
    PRODUCTS.forEach(function (p) {
      for (let i = 0; i < p.symptoms.length; i++) {
        if (text.indexOf(p.symptoms[i].toLowerCase()) !== -1) { matched.push(p); return; }
      }
    });
    return matched;
  }

  function formatProductSuggestions(products) {
    let html = "I’d suggest the following, with humility—please consult a doctor if needed:<br><br>";
    products.forEach(function (p) {
      html += "<strong>" + escapeHtml(p.name) + "</strong><br>" + escapeHtml(p.description) + "<br>Benefits: " + escapeHtml(p.purpose) + ".<br>";
      html += "<a href=\"" + p.link + "\">Buy on our shop →</a><br><br>";
    });
    html += "<em>If symptoms are severe or persist, please consult a healthcare professional.</em>";
    return html;
  }

  function isOffTopic(text) {
    const off = /weather|sports|movie|politics|recipe|travel|job|salary|football|cricket|game|music|celebrity/i;
    return off.test(text) && !/energy|tired|stress|sleep|digestion|immunity|herb|product|cough|pain|blood|iron|piles|ayurveda|natural|wellness/i.test(text);
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
