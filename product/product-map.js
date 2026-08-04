/* Product map — read/render/interact.
   Static, dependency-free, works from file://. Seed data (window.PRODUCT_MAP_SEED,
   see product-map-data.js) is the curated, committed picture of the product.
   Anything a visitor adds at runtime — inbox captures, ad-hoc features born from
   triage, status edits — persists only to this browser's localStorage, mirroring
   the reading app's own "local persistence" feature (no server, no accounts). */
(function () {
  "use strict";

  var STORE_KEY = "kc-product-map-v1";
  var seed = window.PRODUCT_MAP_SEED;

  function loadOverlay() {
    try {
      var raw = localStorage.getItem(STORE_KEY);
      if (!raw) return { inbox: [], addedFeatures: [], addedGroups: [] };
      var parsed = JSON.parse(raw);
      return {
        inbox: parsed.inbox || [],
        addedFeatures: parsed.addedFeatures || [],
        addedGroups: parsed.addedGroups || []
      };
    } catch (e) {
      return { inbox: [], addedFeatures: [], addedGroups: [] };
    }
  }

  function saveOverlay() {
    localStorage.setItem(STORE_KEY, JSON.stringify(overlay));
  }

  var overlay = loadOverlay();

  function allGroups() {
    return seed.featureGroups.concat(overlay.addedGroups);
  }

  function allFeatures() {
    return seed.features.concat(overlay.addedFeatures);
  }

  function featuresFor(groupId) {
    return allFeatures().filter(function (f) { return f.group_id === groupId; });
  }

  function componentTag(feature) {
    if (!feature.component_id) return null;
    var c = seed.components.filter(function (c) { return c.id === feature.component_id; })[0];
    return c ? c.file_path : null;
  }

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function uid(prefix) {
    return prefix + "-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  }

  function toast(msg) {
    var el = document.getElementById("pm-toast");
    el.textContent = msg;
    el.classList.add("is-visible");
    clearTimeout(toast._t);
    toast._t = setTimeout(function () { el.classList.remove("is-visible"); }, 1800);
  }

  // ---- render: header / vision ----

  function renderVision() {
    document.getElementById("pm-tagline").textContent = seed.vision.tagline;
    var el = document.getElementById("pm-vision");
    el.innerHTML =
      "<h2>Vision</h2><ul>" +
      seed.vision.goals.map(function (g) { return "<li>" + esc(g) + "</li>"; }).join("") +
      "</ul>";
  }

  // ---- render: product tab ----

  function groupCard(group) {
    var feats = featuresFor(group.id);
    var touches = [];
    feats.forEach(function (f) {
      var t = componentTag(f);
      if (t && touches.indexOf(t) === -1) touches.push(t);
    });
    var featItems = feats.map(function (f) {
      return (
        '<li><span class="pm-origin-dot ' + esc(f.origin) + '" title="' +
        (f.origin === "story" ? "from a user story" : "bumped into") + '"></span>' +
        "<span><span class=\"pm-feature-name\">" + esc(f.name) + "</span> &mdash; " +
        '<span class="pm-feature-desc">' + esc(f.description) + "</span></span></li>"
      );
    }).join("");
    return (
      '<div class="pm-card">' +
      "<h3>" + esc(group.name) + "</h3>" +
      '<p class="pm-desc">' + esc(group.description) + "</p>" +
      (touches.length ? '<p class="pm-touches">touches: ' + esc(touches.join(", ")) + "</p>" : "") +
      '<ul class="pm-feature-list">' + (featItems || '<li class="pm-empty">No features yet.</li>') + "</ul>" +
      "</div>"
    );
  }

  function renderProduct() {
    document.getElementById("pm-product-grid").innerHTML =
      allGroups().map(groupCard).join("");
  }

  // ---- render: build tab ----

  function buildCard(dc) {
    return (
      '<div class="pm-card">' +
      '<span class="pm-status-pill ' + esc(dc.status) + '">' + esc(dc.status) + "</span>" +
      "<h3>" + esc(dc.name) + "</h3>" +
      '<p class="pm-desc">' + esc(dc.summary) + "</p>" +
      (dc.details && dc.details.length
        ? '<ul class="pm-details">' + dc.details.map(function (d) { return "<li>" + esc(d) + "</li>"; }).join("") + "</ul>"
        : "") +
      "</div>"
    );
  }

  function renderBuild() {
    document.getElementById("pm-build-grid").innerHTML =
      seed.devComponents.map(buildCard).join("");
  }

  // ---- render: glossary tab ----

  function renderGlossary() {
    document.getElementById("pm-glossary-list").innerHTML =
      seed.glossary.map(function (g) {
        return "<dt>" + esc(g.term) + "</dt><dd>" + esc(g.definition) + "</dd>";
      }).join("");
  }

  // ---- render: inbox tab ----

  function inboxItemHtml(item) {
    var triaged = item.status === "triaged" || item.status === "discarded";
    var groupOptions = allGroups().map(function (g) {
      return '<option value="' + esc(g.id) + '">' + esc(g.name) + "</option>";
    }).join("");
    var actions = triaged ? "" : (
      '<div class="pm-inbox-actions">' +
      '<select id="triage-group-' + item.id + '">' + groupOptions + "</select>" +
      '<select id="triage-origin-' + item.id + '"><option value="idea">Bumped into</option><option value="story">User story</option></select>' +
      '<button type="button" onclick="ProductMap.triage(\'' + item.id + '\')">turn into feature</button>' +
      '<button type="button" class="pm-discard" onclick="ProductMap.discard(\'' + item.id + '\')">discard</button>' +
      "</div>"
    );
    return (
      '<div class="pm-inbox-item' + (triaged ? " is-triaged" : "") + '">' +
      '<p class="pm-text">' + esc(item.text) + "</p>" +
      '<p class="pm-meta">' + new Date(item.created_at).toLocaleString() + " &middot; " + esc(item.status) +
      (item.note ? " &mdash; " + esc(item.note) : "") + "</p>" +
      actions +
      "</div>"
    );
  }

  function renderInbox() {
    var list = overlay.inbox.slice().sort(function (a, b) { return b.created_at - a.created_at; });
    var el = document.getElementById("pm-inbox-list");
    el.innerHTML = list.length
      ? list.map(inboxItemHtml).join("")
      : '<p class="pm-empty">Nothing captured yet.</p>';
  }

  function renderAll() {
    renderVision();
    renderProduct();
    renderBuild();
    renderGlossary();
    renderInbox();
  }

  // ---- actions (exposed for inline onclick handlers) ----

  window.ProductMap = {
    triage: function (id) {
      var item = overlay.inbox.filter(function (i) { return i.id === id; })[0];
      if (!item) return;
      var groupId = document.getElementById("triage-group-" + id).value;
      var origin = document.getElementById("triage-origin-" + id).value;
      overlay.addedFeatures.push({
        id: uid("feat"),
        group_id: groupId,
        component_id: null,
        name: item.text.length > 60 ? item.text.slice(0, 57) + "..." : item.text,
        description: item.text,
        origin: origin,
        status: "backlog"
      });
      item.status = "triaged";
      item.note = "turned into a feature";
      saveOverlay();
      renderAll();
      toast("Added to Product tab as backlog");
    },
    discard: function (id) {
      var item = overlay.inbox.filter(function (i) { return i.id === id; })[0];
      if (!item) return;
      item.status = "discarded";
      saveOverlay();
      renderInbox();
    }
  };

  // ---- tabs ----

  function switchTab(name) {
    document.querySelectorAll(".pm-tab").forEach(function (btn) {
      var active = btn.dataset.tab === name;
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-selected", active ? "true" : "false");
    });
    document.querySelectorAll(".pm-panel").forEach(function (panel) {
      panel.classList.toggle("is-active", panel.dataset.panel === name);
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    renderAll();

    document.querySelectorAll(".pm-tab").forEach(function (btn) {
      btn.addEventListener("click", function () { switchTab(btn.dataset.tab); });
    });

    document.getElementById("pm-capture-form").addEventListener("submit", function (e) {
      e.preventDefault();
      var textEl = document.getElementById("pm-capture-text");
      var text = textEl.value.trim();
      if (!text) return;
      overlay.inbox.push({ id: uid("inbox"), text: text, status: "new", created_at: Date.now() });
      saveOverlay();
      textEl.value = "";
      renderInbox();
      toast("Captured");
    });
  });
})();
