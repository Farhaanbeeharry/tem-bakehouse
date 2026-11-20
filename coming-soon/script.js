'use strict';
(() => {
  const flavours = {
    chocolate: { name: 'chocolate chip', image: 'assets/chocolate-chip.png', alt: 'Golden chocolate chip cookie with melted chocolate and a sprinkle of salt' },
    double: { name: 'double chocolate', image: 'assets/double-chocolate.png', alt: 'Rich double chocolate cookie with chocolate pieces' },
    pistachio: { name: 'pistachio', image: 'assets/pistachio.png', alt: 'Golden pistachio cookie with a creamy pistachio centre' }
  };
  const cookie = document.querySelector('.cookie-button');
  const image = document.querySelector('#cookie-image');
  const message = document.querySelector('#cookie-message');
  const taste = document.querySelector('.taste-button');
  const media = window.matchMedia('(prefers-reduced-motion: reduce)');
  let bites = 0;
  let current = 'chocolate';
  let imageRequest = 0;

  document.querySelector('#year').textContent = new Date().getFullYear();
  taste.hidden = false;
  document.querySelector('.flavour-picker').hidden = false;
  cookie.disabled = false;

  // A rounded mouth opening plus individual tooth impressions creates an
  // irregular scalloped edge. Coordinates follow the source image, not pixels
  // on screen, keeping each bite proportional on phones and desktops.
  const biteShapes = [
    { x: 916, y: 296, radius: 111, tooth: 22, angle: 155 },
    { x: 984, y: 480, radius: 126, tooth: 25, angle: 180 },
    { x: 916, y: 690, radius: 119, tooth: 23, angle: 207 }
  ];
  function updateBiteMask() {
    if (!bites) {
      cookie.style.removeProperty('mask-image');
      cookie.style.removeProperty('-webkit-mask-image');
      return;
    }
    const holes = biteShapes.slice(0, bites).map(bite => {
      let shape = `<circle cx="${bite.x}" cy="${bite.y}" r="${bite.radius}"/>`;
      for (let i = 0; i < 6; i++) {
        const angle = (bite.angle - 70 + i * 28) * Math.PI / 180;
        const radius = bite.tooth * (i % 2 ? .91 : 1.08);
        const x = bite.x + Math.cos(angle) * (bite.radius - 5);
        const y = bite.y + Math.sin(angle) * (bite.radius - 5);
        shape += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${radius.toFixed(1)}"/>`;
      }
      return shape;
    }).join('');
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024"><defs><mask id="bite" maskUnits="userSpaceOnUse" x="0" y="0" width="1024" height="1024"><rect width="1024" height="1024" fill="white"/><g fill="black">${holes}</g></mask></defs><rect width="1024" height="1024" fill="white" mask="url(#bite)"/></svg>`;
    const mask = `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
    cookie.style.setProperty('mask-image', mask);
    cookie.style.setProperty('-webkit-mask-image', mask);
  }

  function takeBite() {
    bites = (bites + 1) % 4;
    cookie.className = 'cookie-button';
    updateBiteMask();
    if (bites && !media.matches) {
      // Restart tactile feedback even when the visitor clicks quickly.
      void cookie.offsetWidth;
      cookie.classList.add('is-biting');
    }
    message.textContent = ['A fresh cookie. Shall we do that again?', 'Just one bite? We’ve heard that before.', 'Good things are worth coming back for.', 'Saving the rest for launch day.'][bites];
    cookie.setAttribute('aria-label', bites === 3 ? 'Bring back the whole cookie' : `Take a virtual bite of the ${flavours[current].name} cookie`);
    if (!bites || media.matches) return;
    const bite = biteShapes[bites - 1];
    const crumbs = document.querySelector('.crumbs');
    for (let i = 0; i < 11; i++) {
      const crumb = document.createElement('span');
      crumb.className = 'crumb';
      crumb.style.left = `${(bite.x - bite.radius * .65) / 10.24}%`;
      crumb.style.top = `${bite.y / 10.24}%`;
      const size = 3 + Math.random() * 6;
      crumb.style.width = `${size}px`;
      crumb.style.height = `${size * .7}px`;
      crumb.style.background = i % 3 ? '#bc843f' : '#5c3020';
      crumb.style.setProperty('--dx', `${20 + Math.random() * 75}px`);
      crumb.style.setProperty('--dy', `${-80 + Math.random() * 220}px`);
      crumb.style.setProperty('--spin', `${Math.random() * 600}deg`);
      crumbs.append(crumb);
      setTimeout(() => crumb.remove(), 900);
    }
  }
  cookie.addEventListener('click', takeBite);
  taste.addEventListener('click', takeBite);
  document.querySelectorAll('[data-flavour]').forEach(button => {
    button.addEventListener('click', () => {
      const key = button.dataset.flavour;
      if (current === key) return;
      const request = ++imageRequest;
      const nextImage = new Image();
      message.textContent = 'A little more deliciousness, coming right up…';
      nextImage.onload = () => {
        if (request !== imageRequest) return;
        current = key;
        bites = 0;
        image.src = flavours[key].image;
        image.alt = flavours[key].alt;
        cookie.className = 'cookie-button';
        updateBiteMask();
        cookie.setAttribute('aria-label', `Take a virtual bite of the ${flavours[key].name} cookie`);
        document.querySelectorAll('[data-flavour]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
        message.textContent = `A little ${flavours[key].name} temptation. Go on, take a bite.`;
      };
      nextImage.onerror = () => { if (request === imageRequest) message.textContent = 'That flavour couldn’t load. Give it another try.'; };
      nextImage.src = flavours[key].image;
    });
  });
})();
