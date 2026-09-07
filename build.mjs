// Walks and Talks with Dad: builds index.html from copy.json and the photos in img/.
// The copy of record is the mock page in the private vault; copy.json mirrors its JSON block.
// Run: node build.mjs
import { readFileSync, writeFileSync } from "node:fs";

const c = JSON.parse(readFileSync(new URL("./copy.json", import.meta.url), "utf8"));
const SITE = "https://walks.jeremyrunge.com";
const FN = "https://dsjnvwhyevjzsmuawkcs.supabase.co/functions/v1/walks-request";
const NAME = "Walks and Talks with Dad";
const TITLE = "Walks and Talks with Dad · coaching walks and pep talks in the Bay Area";
const DESC = "Coaching walks and pep talks with Jeremy Runge, a dad, an executive, and a coach, anywhere in the Bay Area. Ninety minutes on a trail, straight talk, and a text with your next step.";
const FONTS = "https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght,WONK@0,9..144,400..900,0;0,9..144,400..900,1;1,9..144,400..900,1&family=Public+Sans:wght@400;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap";
const PHOTOS = {
  s1: { src: "img/hero-sunset.jpg", w: 1800, h: 1350, alt: "Jeremy and Alan smiling on the beach at Pacifica at sunset" },
  s2: { src: "img/beach-walk.jpg", w: 1000, h: 1500, alt: "Two men walking away down the beach" },
  s3: { src: "img/jeremy-gym.jpg", w: 1120, h: 1400, alt: "Jeremy at the gym, a mirror photo" },
  s4: { src: "img/cooper.jpg", w: 1000, h: 1333, alt: "Cooper the Bernedoodle on the dunes" },
  s5: { src: "img/tide-pools.jpg", w: 1200, h: 1600, alt: "Jeremy at the tide pools on the Pacifica coast" },
};

const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[ch]));
const digits = (s) => String(s ?? "").replace(/\D/g, "");
const h2 = (h, cls) => `<h2${cls ? ` class="${cls}"` : ""}>${esc(h.pre)} <span class="c">${esc(h.c)}</span>${h.post ? " " + esc(h.post) : ""}</h2>`;
const photo = (key, extra = "", eager = false) => {
  const p = PHOTOS[key];
  return `<figure class="photo${extra}" data-shot="${key}"><img src="${p.src}" width="${p.w}" height="${p.h}" alt="${esc(p.alt)}"${eager ? ' fetchpriority="high"' : ' loading="lazy"'} decoding="async"></figure>`;
};
const offer = (o, i) => `<div class="offer${i > 0 ? " next" : ""}"><h3>${esc(o.title)}</h3><div class="meta">${esc(o.meta)}</div><p>${esc(o.body)}</p><div class="price">${esc(o.price)}<small>${esc(o.note)}</small></div></div>`;
const field = (f, id, kind) => {
  const ctl = kind === "area"
    ? `<textarea id="${id}" name="${id}" rows="2" placeholder="${esc(f.ph)}" maxlength="600"></textarea>`
    : `<input id="${id}" name="${id}" placeholder="${esc(f.ph)}"${kind === "tel" ? ' type="tel" inputmode="tel" autocomplete="tel" required' : kind === "name" ? ' autocomplete="given-name" required maxlength="80"' : ' maxlength="300"'}>`;
  return `<div class="field"><label class="lbl" for="${id}">${esc(f.label)}</label>${ctl}</div>`;
};
const chips = (f, name) => `<div class="field" role="radiogroup" aria-labelledby="g-${name}"><span class="lbl" id="g-${name}">${esc(f.label)}</span><div class="chips">${f.chips.map((ch, i) => `<label class="chip"><input type="radio" name="${name}" value="${esc(ch)}"${i === 0 ? " checked" : ""}>${esc(ch)}</label>`).join("")}</div></div>`;

const ld = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Service", "@id": SITE + "/#service", "name": NAME, "serviceType": "Coaching walks and pep talks",
      "description": c.hero.lede, "url": SITE + "/", "image": SITE + "/img/og.jpg",
      "telephone": "+1" + digits(c.ask.sms),
      "provider": { "@type": "Person", "name": c.mast.name, "url": "https://jeremyrunge.com", "sameAs": ["https://jeremyrunge.com"] },
      "areaServed": c.places.items.map((p) => p.area).concat(["San Francisco Bay Area"]),
      "offers": c.offers.walks.concat(c.offers.talks).map((o) => ({ "@type": "Offer", "name": o.title, "description": o.meta, "price": digits(o.price), "priceCurrency": "USD" })),
    },
    { "@type": "FAQPage", "mainEntity": c.faq.items.map((q) => ({ "@type": "Question", "name": q.q, "acceptedAnswer": { "@type": "Answer", "text": q.a } })) },
    { "@type": "WebSite", "@id": SITE + "/#site", "url": SITE + "/", "name": NAME },
  ],
};

const css = readFileSync(new URL("./site.css", import.meta.url), "utf8");

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(TITLE)}</title>
<meta name="description" content="${esc(DESC)}">
<link rel="canonical" href="${SITE}/">
<meta name="robots" content="index, follow, max-image-preview:large">
<meta name="theme-color" content="#F7F4EE">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${esc(NAME)}">
<meta property="og:title" content="${esc(NAME)}">
<meta property="og:description" content="${esc(c.hero.lede)}">
<meta property="og:url" content="${SITE}/">
<meta property="og:image" content="${SITE}/img/og.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${esc(PHOTOS.s1.alt)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(NAME)}">
<meta name="twitter:description" content="${esc(c.hero.lede)}">
<meta name="twitter:image" content="${SITE}/img/og.jpg">
<link rel="icon" href="favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="apple-touch-icon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="${FONTS}">
<style>${css}</style>
<script type="application/ld+json">${JSON.stringify(ld).replace(/</g, "\\u003c")}</script>
</head>
<body>
<header><div class="wrap">
  <div class="mast"><span class="name">${esc(c.mast.name)}</span><a class="lnk" href="#ask">${esc(c.mast.cta)}</a></div>
  <div class="title">
    <div class="k">${esc(c.hero.kicker)}</div>
    <h1><span class="walks">${esc(c.hero.walks)}</span><span class="dad">${esc(c.hero.dad)}</span></h1>
    <p class="lede">${esc(c.hero.lede)}</p>
    <div class="ctas"><a class="btn" href="#ask">${esc(c.hero.cta1)}</a><a class="btn ghost" href="#what">${esc(c.hero.cta2)}</a></div>
  </div>
  ${photo("s1", " hero", true)}
</div></header>
<main>
<section><div class="wrap">
  ${h2(c.you.h)}
  <ul class="you">${c.you.lines.map((l) => `<li>${esc(l)}</li>`).join("")}</ul>
</div></section>
<section class="tone" id="what"><div class="wrap">
  ${h2(c.offers.h)}
  <div class="k gk">${esc(c.offers.walks_k)}</div>
  <div class="offers">${c.offers.walks.map((o, i) => offer(o, i)).join("")}</div>
  <hr class="rule">
  <div class="k gk">${esc(c.offers.talks_k)}</div>
  <div class="offers">${c.offers.talks.map((o, i) => offer(o, i)).join("")}</div>
  <p style="margin-top:22px">${esc(c.offers.more_line)}</p>
  <p class="fine" style="margin-top:10px">${esc(c.offers.fine)}</p>
</div></section>
<section><div class="wrap">
  ${h2(c.how.h)}
  <ol class="ritual">${c.how.steps.map((s) => `<li>${esc(s)}</li>`).join("")}</ol>
  ${photo("s2")}
</div></section>
<section class="tone"><div class="wrap">
  ${h2(c.brings.h)}
  ${c.brings.pull ? `<p class="pull">${esc(c.brings.pull)}</p>` : ""}
  <ul class="lines">${c.brings.lines.map((l) => `<li><span class="b">${esc(l.b)}</span> ${esc(l.t)}</li>`).join("")}</ul>
</div></section>
<section id="rules"><div class="wrap">
  ${h2(c.rules.h)}
  <ol class="rules">${c.rules.items.map((r) => `<li><span>${esc(r)}</span></li>`).join("")}</ol>
</div></section>
<section class="tone"><div class="wrap">
  ${h2(c.places.h)}
  <p>${esc(c.places.intro)}</p>
  <div class="places">${c.places.items.map((p) => `<div class="place"><div class="k">${esc(p.area)}</div><p>${esc(p.spots)}</p></div>`).join("")}</div>
  <p style="margin-top:16px">${esc(c.places.outro)}</p>
  ${photo("s5")}
</div></section>
<section id="ask"><div class="wrap">
  ${h2(c.ask.h)}
  <p>${esc(c.ask.intro)}</p>
  <form id="askform" novalidate aria-label="${esc(c.ask.h.pre + " " + c.ask.h.c)}">
    ${field(c.ask.f.name, "name", "name")}
    ${field(c.ask.f.phone, "phone", "tel")}
    ${chips(c.ask.f.which, "which")}
    ${chips(c.ask.f.format, "format")}
    ${chips(c.ask.f.side, "side")}
    ${field(c.ask.f.where, "walk_in_mind")}
    ${field(c.ask.f.days, "days")}
    ${field(c.ask.f.line, "line", "area")}
    <label class="check"><input type="checkbox" id="adult" name="adult" required>${esc(c.ask.check1)}</label>
    <label class="check"><input type="checkbox" id="story_ok" name="story_ok">${esc(c.ask.check2)}</label>
    <div class="hp" aria-hidden="true"><label for="website">Leave this empty</label><input id="website" name="website" tabindex="-1" autocomplete="off"></div>
    <button class="send" type="submit">${esc(c.ask.button)}</button>
    <p class="next" id="asknext">${esc(c.ask.next)}</p>
    <p class="fine" id="askerr" role="alert" hidden></p>
    <p class="fine">${esc(c.ask.alt)} <a href="sms:+1${digits(c.ask.sms)}">${esc(c.ask.sms)}</a>.</p>
    <p class="fine">${esc(c.ask.fine)}</p>
  </form>
  <div id="asksent" class="sent" hidden>
    <h3>Sent.</h3>
    <p>${esc(c.ask.next)}</p>
    <p class="fine">If you don't hear from me by tomorrow, text me at <a href="sms:+1${digits(c.ask.sms)}">${esc(c.ask.sms)}</a>.</p>
  </div>
</div></section>
<section class="tone"><div class="wrap">
  ${h2(c.about.h)}
  <div class="about">
    <div class="stack">${photo("s3")}${photo("s4")}</div>
    <div><p>${esc(c.about.p1)}</p><p>${esc(c.about.p2)}</p><p class="fine">${esc(c.about.more)} <a href="https://jeremyrunge.com">jeremyrunge.com</a>.</p></div>
  </div>
</div></section>
<section><div class="wrap">
  ${h2(c.faq.h)}
  <div class="qa">${c.faq.items.map((q) => `<details><summary>${esc(q.q)}</summary><p>${esc(q.a)}</p></details>`).join("")}</div>
</div></section>
</main>
<footer><div class="wrap">
  <span class="k">${esc(c.footer.line)}</span>
  <a href="https://jeremyrunge.com">jeremyrunge.com</a> ${esc(c.footer.links)}
  <p class="fine">${esc(c.footer.fine)}</p>
</div></footer>
<script>
(function(){
  var form = document.getElementById("askform"), err = document.getElementById("askerr"), sent = document.getElementById("asksent");
  if (!form) return;
  var btn = form.querySelector(".send"), label = btn.textContent;
  function pick(name){ var el = form.querySelector('input[name="' + name + '"]:checked'); return el ? el.value : ""; }
  function fail(msg){ err.textContent = msg; err.hidden = false; btn.disabled = false; btn.textContent = label; }
  form.addEventListener("submit", function(e){
    e.preventDefault(); err.hidden = true;
    var name = form.name.value.trim(), phone = form.phone.value.trim(), adult = form.adult.checked;
    if (!name) { form.name.focus(); return fail("Your name, please. First name is fine."); }
    if (phone.replace(/\\D/g, "").length < 10) { form.phone.focus(); return fail("A number I can text back, please."); }
    if (!adult) { form.adult.focus(); return fail("This is for adults. Tick the box if you are 18 or older."); }
    btn.disabled = true; btn.textContent = "Sending\\u2026";
    var body = { name: name, phone: phone, which: pick("which"), format: pick("format"), side: pick("side"), walk_in_mind: form.walk_in_mind.value.trim(), days: form.days.value.trim(), line: form.line.value.trim(), adult: adult, story_ok: form.story_ok.checked, website: form.website.value };
    fetch("${FN}", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) })
      .then(function(r){ return r.json().then(function(j){ return { ok: r.ok, j: j }; }); })
      .then(function(res){
        if (!res.ok) throw new Error(res.j && res.j.error === "slow down" ? "That is a lot of requests from one place. Give it an hour, or text me." : "It did not send.");
        form.hidden = true; sent.hidden = false; sent.scrollIntoView({ block: "start", behavior: "smooth" });
      })
      .catch(function(ex){ fail((ex && ex.message) || "It did not send.") ; err.textContent += " You can also text me at ${esc(c.ask.sms)}."; });
  });
})();
</script>
</body>
</html>
`;

writeFileSync(new URL("./index.html", import.meta.url), html);
console.log("index.html written,", (html.length / 1024).toFixed(1), "KB");
