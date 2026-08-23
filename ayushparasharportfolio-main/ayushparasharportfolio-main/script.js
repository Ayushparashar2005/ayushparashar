/* ───────────────────────────────────────────────
   script.js  –  Ayush's Portfolio
─────────────────────────────────────────────── */

// ── DATA ─────────────────────────────────────
const skills = [
  { name: 'HTML5',         icon: '🌐', level: 'Advanced',     pct: 90 },
  { name: 'CSS3',          icon: '🎨', level: 'Advanced',     pct: 88 },
  { name: 'JavaScript',    icon: '⚡', level: 'Intermediate', pct: 75 },
  { name: 'Python',        icon: '🐍', level: 'Intermediate', pct: 78 },
  { name: 'Java',          icon: '☕', level: 'Beginner',     pct: 55 },
  { name: 'MySQL',         icon: '🗄️', level: 'Intermediate', pct: 70 },
  { name: 'GitHub',        icon: '🐙', level: 'Intermediate', pct: 80 },
  { name: 'AI Automation', icon: '🤖', level: 'Intermediate', pct: 72 },
  { name: 'Figma',       icon: '📱', level: 'Advanced',     pct: 90 },
  { name: 'n8n',           icon: '🔗', level: 'Intermediate', pct: 68 },
];

const projects = [
  {
    title: 'Kindminds Ai',
    desc: 'KindMinds is a conversational AI web application designed for supportive, reflective interaction rather than pure question‑answering.',
    icon: '🧠',
    gradient: 'linear-gradient(135deg,#ec4899,#a855f7)',
    tags: ['Next.js (App Router)', 'TypeScript', 'Tailwind', 'shadcn/ui'],
    category: 'ai',
    link: 'https://github.com/Ayushparashar2005/kindminds',
    
  },
  {
    title: 'fashion-recommender-system ',
    desc: 'A Deep Learning based Fashion Recommender System using the ResNET50 model to suggest similar clothing items based on user input images.',
    gradient: 'linear-gradient(135deg,#7c3aed,#4f46e5)',
    icon: '👗',
    tags: ['Python','Deep Learning','Recommender System'],
    category: 'ai',
    link: 'https://github.com/Ayushparashar2005/fashion-recommender-system-project',
    demo: '' // paste your LinkedIn post URL here
  },
  {
    title: 'Spam Email Classification Using LSTM',
    desc: 'Developed a deep learning model using LSTM to classify emails as spam or non-spam. Involved data cleaning, text preprocessing, and exploratory data analysis.',
    icon: '📧',
    gradient: 'linear-gradient(135deg,#06b6d4,#0284c7)',
    tags: ['Python','Deep Learning','NLP'],
    category: 'ai',
    link: 'https://github.com/Ayushparashar2005/Spam-Email-Classification-Using-LSTM',
  },
  
  {
    title: 'movie-recommender-system',
    desc: 'A Movie Recommender System built using Python that suggests movies to users based on their preferences and viewing history, utilizing collaborative filtering techniques.',
    icon: '🎬',
    gradient: 'linear-gradient(135deg,#22c55e,#16a34a)',
    tags: ['Python','Machine Learning','Recommender System'],
    category: 'ai',
    link: 'https://github.com/Ayushparashar2005/movie-recommender-system', // paste your LinkedIn post URL here
  },
  {
    title: "Swastha Prameha",
    desc: "SwasthPrameh is a Next.js platform combining Ayurvedic expertise, machine learning, and community health worker tooling to deliver adaptive diabetes care plans. The redesigned landing page lives at src/app/page.tsx and showcases the product story using Tailwind, shadcn/ui, and Framer Motion micro-interactions.",
    icon: '🧠',
    gradient: 'linear-gradient(135deg,#f59e0b,#ef4444)',
    tags: ['AI','Python','Healthcare'],
    category: 'ai',
    link: 'https://github.com/Ayushparashar2005/swastha-prameh',
    demo: '' // paste your LinkedIn post URL here
  },
  {
    title: 'doctalk',
    desc: 'doctalk sumarizes pdf and document built using groq api and kotlin',
    icon: '✅',
    gradient: 'linear-gradient(135deg,#10b981,#06b6d4)',
    tags: ['kotlin','groq api','AI'],
    category: 'mobile',
    link: 'https://github.com/Ayushparashar2005/doctalk',
     // paste your LinkedIn post URL here
  },
  {
    title: 'routesim',
    desc: 'RouteSim is an advanced educational tool designed to visualize complex network routing algorithms. It combines the power of D3.js for dynamic graph rendering with Google Gemini AI for procedural network topology generation. The application simulates the behavior of packets traversing a network, demonstrating how routing tables evolve using Dijkstra’s Algorithm (Link State) and Bellman-Ford (Distance Vector).',
    icon: '🗺️',
    gradient: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
    tags: ['JavaScript','D3.js','AI'],
    category: 'web',
    link: 'https://github.com/Ayushparashar2005/routesom',
  },
  {
    title: 'WAFinity',
    desc: 'WAFinity is an Advanced Web Application Firewall (WAF) that protects web applications from known threats such as SQL injection, Cross-Site Scripting (XSS), and other similar attacks by filtering and monitoring HTTP traffic between the application and the Internet.',
    icon: '🏠',
    gradient: 'linear-gradient(135deg,#0ea5e9,#6366f1)',
    tags: ['HTML','CSS','JavaScript','machine learning','flask','python'],
    category: 'web',
    link: 'https://github.com/Ayushparashar2005/cybercyan',
  },
  {
    title: 'Finvest',
    desc: 'AI enabled finance advisor and investment management application development using the flutter framework for mobile app development, Gemini 2.0 api for chatbot feature, python backend using flask and AIML operation using Scikit-learn(python library)',
    icon: '📅',
    gradient: 'linear-gradient(135deg,#f97316,#ef4444)',
    tags: ['Flutter','Dart','AI','Python','Flask'],
    category: 'mobile',
    link: 'https://github.com/Ayushparashar2005/finvest-ai-finance-app',
  },
  {
    title: 'Sulphur',
    desc: 'A new Flutter project. made a app to sync bus stops with geolocation gonna get google api soon',
    icon: '⏰',
    gradient: 'linear-gradient(135deg,#a855f7,#ec4899)',
    tags: ['Flutter','Dart','AI','Python','Flask'],
    category: 'mobile',
    link: 'https://github.com/Ayushparashar2005/sulphur',
   
  },
  {
    title: 'rockpaperscissors',
    desc: 'Fun rock-paper-scissors game in java',
    gradient: 'linear-gradient(135deg,#14b8a6,#22c55e)',
    icon: '✂️',
    tags: ['Java','Game','CLI'],
    category: 'game',
    link: 'https://github.com/Ayushparashar2005/rockpaperscissors',
  },
    
];

// ── PARTICLES ─────────────────────────────────
(function initParticles() {
  const container = document.getElementById('particles');
  if (!container) return;
  for (let i = 0; i < 18; i++) {
    const p = document.createElement('div');
    p.classList.add('particle');
    const size = Math.random() * 10 + 4;
    p.style.cssText = `
      width:${size}px;height:${size}px;
      left:${Math.random()*100}%;
      animation-duration:${Math.random()*12+8}s;
      animation-delay:${Math.random()*10}s;
    `;
    container.appendChild(p);
  }
})();

// ── TYPING ANIMATION ──────────────────────────
(function initTyping() {
  const phrases = [
    'Engineering Student 🎓',
    'Web Developer 🌐',
    'Python Enthusiast 🐍',
    'AI Explorer 🤖',
    'Flutter Developer 📱',
    'Problem Solver 💡',
  ];
  const el = document.getElementById('typing-text');
  let pi = 0, ci = 0, deleting = false;
  function type() {
    const word = phrases[pi];
    if (!deleting) {
      el.textContent = word.substring(0, ci + 1);
      ci++;
      if (ci === word.length) { deleting = true; setTimeout(type, 1800); return; }
    } else {
      el.textContent = word.substring(0, ci - 1);
      ci--;
      if (ci === 0) { deleting = false; pi = (pi + 1) % phrases.length; }
    }
    setTimeout(type, deleting ? 60 : 90);
  }
  type();
})();

// ── NAVBAR ────────────────────────────────────
(function initNav() {
  const navbar  = document.getElementById('navbar');
  const ham     = document.getElementById('hamburger');
  const navMenu = document.getElementById('nav-links');
  const links   = navMenu.querySelectorAll('a');

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
    updateActiveLink();
    toggleBackTop();
  });

  ham.addEventListener('click', () => {
    ham.classList.toggle('open');
    navMenu.classList.toggle('open');
  });

  links.forEach(a => a.addEventListener('click', () => {
    ham.classList.remove('open');
    navMenu.classList.remove('open');
  }));

  function updateActiveLink() {
    const sections = document.querySelectorAll('section[id]');
    let cur = '';
    sections.forEach(s => {
      if (window.scrollY >= s.offsetTop - 120) cur = s.id;
    });
    links.forEach(a => {
      a.classList.toggle('active', a.getAttribute('href') === '#' + cur);
    });
  }
})();

// ── BACK TO TOP ───────────────────────────────
const backBtn = document.getElementById('back-top');
function toggleBackTop() { backBtn.classList.toggle('visible', window.scrollY > 400); }
backBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

// ── SCROLL REVEAL ─────────────────────────────
(function initReveal() {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); } });
  }, { threshold: 0.12 });

  document.querySelectorAll('.reveal, .reveal-left, .reveal-right')
    .forEach(el => obs.observe(el));
})();

// ── SKILLS ────────────────────────────────────
(function renderSkills() {
  const grid = document.getElementById('skills-grid');
  skills.forEach((s, i) => {
    const card = document.createElement('div');
    card.className = 'skill-card glass reveal';
    card.style.transitionDelay = `${i * 0.06}s`;
    card.innerHTML = `
      <span class="skill-icon">${s.icon}</span>
      <div class="skill-name">${s.name}</div>
      <div class="skill-level">${s.level}</div>
      <div class="skill-bar-wrap"><div class="skill-bar" data-pct="${s.pct}"></div></div>
    `;
    grid.appendChild(card);
  });

  // Animate bars on scroll
  const barObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const bar = e.target.querySelector('.skill-bar');
        if (bar) bar.style.width = bar.dataset.pct + '%';
      }
    });
  }, { threshold: 0.3 });

  grid.querySelectorAll('.skill-card').forEach(c => barObs.observe(c));
  // Also re-run reveal observer
  grid.querySelectorAll('.reveal').forEach(el => {
    new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) el.classList.add('visible');
    }, { threshold: 0.1 }).observe(el);
  });
})();

// ── PROJECTS ─────────────────────────────────
(function renderProjects() {
  const grid    = document.getElementById('projects-grid');
  const filters = document.querySelectorAll('.filter-btn');
  let active    = 'all';

  function buildCards(filter) {
    grid.innerHTML = '';
    const list = filter === 'all' ? projects : projects.filter(p => p.category === filter);
    list.forEach((proj, i) => {
      const card = document.createElement('div');
      card.className = 'project-card glass reveal';
      card.style.transitionDelay = `${i * 0.08}s`;
      card.innerHTML = `
        <div class="project-banner" style="background:${proj.gradient}">
          <span style="font-size:3.5rem">${proj.icon}</span>
        </div>
        <div class="project-body">
          <div class="project-tags">${proj.tags.map(t=>`<span class="tag">${t}</span>`).join('')}</div>
          <div class="project-title">${proj.title}</div>
          <p class="project-desc">${proj.desc}</p>
          <div class="project-links">
            ${proj.demo ? `<a href="${proj.demo}" class="project-link demo" target="_blank">▶ Watch Demo</a>` : ''}
            <a href="${proj.link}" class="project-link primary" target="_blank">🐙 GitHub</a>
          </div>
        </div>
      `;
      grid.appendChild(card);
    });
    // Trigger reveal for freshly added cards
    setTimeout(() => {
      grid.querySelectorAll('.reveal').forEach(el => {
        const obs = new IntersectionObserver(([entry]) => {
          if (entry.isIntersecting) el.classList.add('visible');
        }, { threshold: 0.08 });
        obs.observe(el);
        // For cards already in viewport
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight) el.classList.add('visible');
      });
    }, 50);
  }

  filters.forEach(btn => {
    btn.addEventListener('click', () => {
      filters.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      active = btn.dataset.filter;
      buildCards(active);
    });
  });

  buildCards('all');
})();

// ── CONTACT FORM ──────────────────────────────
(function initForm() {
  const form    = document.getElementById('contact-form');
  const success = document.getElementById('form-success');
  const btn     = document.getElementById('submit-btn');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    btn.innerHTML = '<span>Sending…</span> ⏳';
    btn.disabled = true;
    // Simulate async send
    setTimeout(() => {
      form.style.display = 'none';
      success.style.display = 'block';
    }, 1500);
  });
})();

// ── CURSOR GLOW (desktop only) ────────────────
if (window.matchMedia('(pointer:fine)').matches) {
  const glow = document.createElement('div');
  glow.style.cssText = `
    position:fixed;width:300px;height:300px;border-radius:50%;
    background:radial-gradient(circle,rgba(124,58,237,0.06) 0%,transparent 70%);
    pointer-events:none;z-index:9999;transform:translate(-50%,-50%);
    transition:left 0.1s,top 0.1s;
  `;
  document.body.appendChild(glow);
  document.addEventListener('mousemove', e => {
    glow.style.left = e.clientX + 'px';
    glow.style.top  = e.clientY + 'px';
  });
}
