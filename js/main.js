/* ============================================
   COSMIC PORTFOLIO - MAIN JS
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  initStarfield();
  initScrollReveal();
  initNavigation();
  initTypingAnimation();
  initSkillBars();
  initContactForm();
});

/* -------------------------------------------
   STARFIELD CANVAS
   ------------------------------------------- */
function initStarfield() {
  const canvas = document.getElementById('starfield');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let stars = [];
  let animationId;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function createStars() {
    const count = canvas.width < 768 ? 150 : 300;
    stars = Array.from({ length: count }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: Math.random() * 1.5 + 0.3,
      speed: Math.random() * 0.15 + 0.02,
      opacity: Math.random() * 0.7 + 0.3,
      twinkleSpeed: Math.random() * 0.002 + 0.0005,
    }));
  }

  function drawNebulaGlow() {
    // Top-right soft white glow
    const g1 = ctx.createRadialGradient(
      canvas.width * 0.8, canvas.height * 0.15, 0,
      canvas.width * 0.8, canvas.height * 0.15, canvas.width * 0.4
    );
    g1.addColorStop(0, 'rgba(192, 192, 192, 0.04)');
    g1.addColorStop(1, 'transparent');
    ctx.fillStyle = g1;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Bottom-left subtle silver glow
    const g2 = ctx.createRadialGradient(
      canvas.width * 0.15, canvas.height * 0.85, 0,
      canvas.width * 0.15, canvas.height * 0.85, canvas.width * 0.35
    );
    g2.addColorStop(0, 'rgba(255, 255, 255, 0.03)');
    g2.addColorStop(1, 'transparent');
    ctx.fillStyle = g2;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  function animate() {
    if (document.visibilityState !== 'visible') {
      animationId = requestAnimationFrame(animate);
      return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawNebulaGlow();

    const time = Date.now();

    stars.forEach(star => {
      // Drift downward
      star.y += star.speed;
      if (star.y > canvas.height + 2) {
        star.y = -2;
        star.x = Math.random() * canvas.width;
      }

      // Twinkle
      const flicker = 0.5 + 0.5 * Math.sin(time * star.twinkleSpeed);
      const alpha = star.opacity * flicker;

      ctx.beginPath();
      ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      ctx.fill();
    });

    // Draw a few "bright" stars with glow
    ctx.save();
    ctx.shadowColor = 'rgba(255, 255, 255, 0.5)';
    ctx.shadowBlur = 15;
    for (let i = 0; i < 5 && i < stars.length; i++) {
      const s = stars[i];
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.radius + 0.5, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(200, 220, 255, ${s.opacity * 0.8})`;
      ctx.fill();
    }
    ctx.restore();

    animationId = requestAnimationFrame(animate);
  }

  resize();
  createStars();

  if (prefersReducedMotion) {
    // Draw a single static frame
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawNebulaGlow();
    stars.forEach(star => {
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
      ctx.fill();
    });
  } else {
    animate();
  }

  window.addEventListener('resize', () => {
    resize();
    createStars();
  });
}

/* -------------------------------------------
   SCROLL REVEAL (IntersectionObserver)
   ------------------------------------------- */
function initScrollReveal() {
  const reveals = document.querySelectorAll('.reveal');
  if (!reveals.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px',
  });

  reveals.forEach(el => observer.observe(el));
}

/* -------------------------------------------
   NAVIGATION
   ------------------------------------------- */
function initNavigation() {
  const navbar = document.getElementById('navbar');
  const toggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');
  const links = document.querySelectorAll('.nav-links a');
  const sections = document.querySelectorAll('.section');

  // Navbar background on scroll
  function handleScroll() {
    navbar.classList.toggle('scrolled', window.scrollY > 80);
  }
  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll(); // check on load

  // Mobile hamburger toggle
  if (toggle && navLinks) {
    toggle.addEventListener('click', () => {
      navLinks.classList.toggle('open');
      toggle.classList.toggle('active');
    });

    // Close on link click
    links.forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        toggle.classList.remove('active');
      });
    });
  }

  // Active section highlighting
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        links.forEach(l => l.classList.remove('active'));
        const active = document.querySelector(
          `.nav-links a[href="#${entry.target.id}"]`
        );
        if (active) active.classList.add('active');
      }
    });
  }, { threshold: 0.3 });

  sections.forEach(section => sectionObserver.observe(section));
}

/* -------------------------------------------
   TYPING ANIMATION
   ------------------------------------------- */
function initTypingAnimation() {
  const element = document.querySelector('.typing-text');
  if (!element) return;

  const titles = ['Product Manager', 'Strategic Thinker', 'Problem Solver'];
  let titleIndex = 0;
  let charIndex = 0;
  let isDeleting = false;

  function type() {
    const current = titles[titleIndex];

    if (!isDeleting) {
      element.textContent = current.substring(0, charIndex + 1);
      charIndex++;

      if (charIndex === current.length) {
        // Pause before deleting
        setTimeout(() => {
          isDeleting = true;
          type();
        }, 2000);
        return;
      }
    } else {
      element.textContent = current.substring(0, charIndex - 1);
      charIndex--;

      if (charIndex === 0) {
        isDeleting = false;
        titleIndex = (titleIndex + 1) % titles.length;
      }
    }

    const speed = isDeleting ? 40 : 80;
    setTimeout(type, speed);
  }

  // Start after hero animation finishes
  setTimeout(type, 1200);
}

/* -------------------------------------------
   SKILL BARS ANIMATION
   ------------------------------------------- */
function initSkillBars() {
  const bars = document.querySelectorAll('.skill-bar-fill');
  if (!bars.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const width = entry.target.getAttribute('data-width');
        if (width) {
          entry.target.style.width = width + '%';
        }
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  bars.forEach(bar => observer.observe(bar));
}

/* -------------------------------------------
   CONTACT FORM
   ------------------------------------------- */
function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = form.querySelector('#name').value.trim();
    const email = form.querySelector('#email').value.trim();
    const message = form.querySelector('#message').value.trim();

    if (!name || !email || !message) return;

    const subject = encodeURIComponent(`Portfolio Contact from ${name}`);
    const body = encodeURIComponent(`From: ${name} (${email})\n\n${message}`);
    window.location.href = `mailto:Juvensenjules@gmail.com?subject=${subject}&body=${body}`;
  });
}
