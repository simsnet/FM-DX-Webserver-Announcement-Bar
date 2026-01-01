// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
// FM-DX Webserver Announcement Bar v2.0
// Main frontend
//
// Author: simsnet - https://github.com/simsnet
//
// Additional resources from:
// - Noobish (https://github.com/NoobishSVK)
// - AmateurAudioDude (https://github.com/AmateurAudioDude/)
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

let annText = "";
let annColor = "";
let annStyle = 1;

const configPromise = fetch('/announcement-bar/config', {
    headers: {
        'X-Plugin-Name': 'AnnouncementBar'
    }
})
.then(r => {
    if (!r.ok)
        throw new Error('Failed to load announcement config');
    return r.json();
})
.then(cfg => {
    annText = cfg.message || "";
    annColor = cfg.color || "";
    annStyle = Number.isInteger(cfg.displaystyle) ? cfg.displaystyle : 1;
})
.catch(err => {
    console.warn('AnnouncementBar: config load failed', err);
});

function initAnnouncementBar() {
    if (!annText || !annColor)
        return;

    if (document.getElementById('announcement-bar'))
        return;

    const annBarHtml = `
<div id="announcement-bar" class="ann-bar flex-container bg-phone flex-phone-column" style="padding:0 10px;">
  <div id="announcement-text"
       class="ann-container"
       style="background-color:${annColor}; border-radius:15px; margin-top:20px; box-sizing:border-box; width:100%; max-width:1160px; padding:0 15px;">
    <div class="marquee-viewport">
      <div class="marquee">
        <p class="ann-text">${annText}</p>
      </div>
    </div>
  </div>
</div>`;

    const dashboardPanel = document.getElementsByClassName("canvas-container");
    if (dashboardPanel.length > 0) {
        dashboardPanel[0].insertAdjacentHTML('afterend', annBarHtml);
    }

    const css = `

.ann-container {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 10px 15px;
  min-height: 40px;
  overflow: visible;
}

.marquee-viewport {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: flex-start;
}

.marquee {
  position: relative;
  white-space: nowrap;
  will-change: transform;
  transform: translateZ(0);  
}

.ann-text {
  margin: 0;
  padding: 0;
  line-height: 1.25;
  text-align: center;
}

.ann-static .marquee {
  position: relative;
  transform: none !important;
  animation: none !important;
}

.ann-static .marquee-viewport {
  justify-content: center;
}

.ann-multiline .marquee {
  position: relative;
  white-space: normal;
  width: 100%;
}

.ann-multiline .marquee-viewport {
  overflow: visible;
}

.ann-multiline .ann-text {
  margin: 10px 0px 10px 0px;
}

@keyframes marquee {
  from { transform: translateX(var(--start)); }
  to   { transform: translateX(var(--end)); }
}`;

    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);

    const marqueeEl = document.querySelector('#announcement-text .marquee');
    const container = document.querySelector('#announcement-text');

    function startMarquee() {
        const marqueeEl = document.querySelector('.marquee');
        const viewport = document.querySelector('.marquee-viewport');
        const annBox = document.getElementById('announcement-text');

        if (!marqueeEl || !viewport || !annBox)
            return;

        annBox.className = 'ann-container';

        // --- STATIC ---
        if (annStyle === 0) {
            annBox.classList.add('ann-static');
            if (marqueeEl._anim)
                marqueeEl._anim.cancel();
            marqueeEl.style.transform = 'none';
            return;
        }

        // --- MULTILINE ---
        if (annStyle === 5) {
            annBox.classList.add('ann-static', 'ann-multiline');
            if (marqueeEl._anim)
                marqueeEl._anim.cancel();
            marqueeEl.style.transform = 'none';
            return;
        }

        // --- MEASURE ---
        const textWidth = marqueeEl.offsetWidth;
        const viewWidth = viewport.clientWidth;
        if (!textWidth || !viewWidth)
            return;

        const speed = 60; // px/sec
        const duration = (textWidth + viewWidth) / speed;

        let start,
        end,
        direction = 'normal';

        // --- MARQUEE ---
        if (annStyle === 1) { // Right to left
            start = viewWidth;
            end = -textWidth;
        }

        if (annStyle === 2) { // Left to right
            start = -textWidth;
            end = viewWidth;
        }

        // --- PING-PONG ---
        if (annStyle === 3 || annStyle === 4) {
            direction = 'alternate';

            const minX = Math.min(0, viewWidth - textWidth);
            const maxX = Math.max(0, viewWidth - textWidth);

            if (annStyle === 3) { // right
                start = maxX;
                end = minX;
            } else { // ←
                start = minX;
                end = maxX;
            }
        }

        // --- CANCEL ANY PREVIOUS ANIMATION ---
        if (marqueeEl._anim) {
            marqueeEl._anim.cancel();
        }

        // --- SET INITIAL POSITION BEFORE PAINT ---
        marqueeEl.style.transform = `translateX(${start}px)`;
        marqueeEl.getBoundingClientRect(); // force layout commit (iOS)

        // --- START WAAPI ANIMATION ---
        marqueeEl._anim = marqueeEl.animate(
                [{
                        transform: `translateX(${start}px)`
                    }, {
                        transform: `translateX(${end}px)`
                    }
                ], {
                duration: duration * 1000,
                iterations: Infinity,
                direction: direction === 'alternate' ? 'alternate' : 'normal',
                easing: 'linear'
            });
    }

    function waitForLayout() {
        const viewport = document.querySelector('.marquee-viewport');
        if (!viewport)
            return;

        if (viewport.clientWidth === 0) {
            requestAnimationFrame(waitForLayout);
            return;
        }

        startMarquee();
    }

    if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(() => {
            requestAnimationFrame(waitForLayout);
        });
    } else {
        requestAnimationFrame(waitForLayout);
    }

}

function injectAnnBarSettings() {
    if (window.location.pathname !== '/setup')
        return;

    const aPluginSettings = document.getElementById('plugin-settings');
    if (!aPluginSettings)
        return;

    const aCurrentText = aPluginSettings.textContent.trim();

    const aNewText = `
<div style="padding-bottom: 10px;">
<hr style="width: 20%; border-color: var(--color-5-transparent);" />
<h4>Announcement Bar Settings</h4>
<br>
<div class="form-group">
    <label for="announcementBar-message">Message</label>
    <input class="input-text w-400 br-15"
        type="text"
        id="announcementBar-message" placeholder="Hello World!" value="${annText.replace(/[&<>"']/g, m => ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;'
            }
                [m]))}">
</div>
<div class="form-group">
    <label for="announcementBar-color">Bar Color</label>
    <input class="input-text w-100 br-15"
        type="text"
        id="announcementBar-color" placeholder="#ff000059" value="${annColor}">
</div>
<div class="form-group">
  <label for="announcementBar-style">Display Style</label>
  <select id="announcementBar-style"
          style="text-align: center; color: white;"
          class="input-text w-400 br-15">
    <option value="0" ${annStyle === 0 ? 'selected' : ''}>Static (centered)</option>
    <option value="1" ${annStyle === 1 ? 'selected' : ''}>Marquee ←</option>
    <option value="2" ${annStyle === 2 ? 'selected' : ''}>Marquee →</option>
    <option value="3" ${annStyle === 3 ? 'selected' : ''}>Ping-pong ←</option>
    <option value="4" ${annStyle === 4 ? 'selected' : ''}>Ping-pong →</option>
    <option value="5" ${annStyle === 5 ? 'selected' : ''}>Multi-line</option>
  </select>
</div>

<style>#annbar-save{width: 175px; height: 52px; margin: auto; color: var(--color-1); background-color: var(--color-3); display: flex; justify-content: center; align-items: center; font-size: 18px; border-radius: 10px; transition: 0.3s ease background-color; cursor: pointer;}#annbar-save:hover{background-color: var(--color-5);}</style>
<div id="annbar-save" class="icon tooltip" style="" id="submit-config" role="button" aria-label="Save settings" tabindex="0" data-tooltip="Save settings" onclick="saveAnnouncementBarConfig()"><span><i style="padding-right: 9px;" id="annbar-saveicon" class="fa-solid fa-save"></i>Save Changes</span></div>
<hr style="width: 20%; border-color: var(--color-5-transparent);" />
</div>`;

    if (aCurrentText === 'No plugin settings are available.') {
        aPluginSettings.innerHTML = aNewText;
    } else {
        aPluginSettings.insertAdjacentHTML('beforeend', aNewText);
    }
}

function saveAnnouncementBarConfig() {
    let annbarsaveicon = document.getElementById("annbar-save");
    fetch('/announcement-bar/config', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Plugin-Name': 'AnnouncementBar'
        },
        body: JSON.stringify({
            message: document.getElementById('announcementBar-message')?.value || "",
            color: document.getElementById('announcementBar-color')?.value || "",
            displaystyle: parseInt(
                document.getElementById('announcementBar-style')?.value ?? 1)
        })
    })
    .then(r => {
        if (!r.ok)
            throw new Error('Save failed');
        return r.json();
    })
    .then(() => {
        annbarsaveicon.innerHTML = '<span><i style="padding-right: 9px;" id="annbar-saveicon" class="fa-solid fa-check"></i>Saved!</span>';
        console.log('AnnouncementBar: config saved');
        setTimeout(() => {
            annbarsaveicon.innerHTML = '<span><i style="padding-right: 9px;" id="annbar-saveicon" class="fa-solid fa-save"></i>Save Changes</span>';
        }, 3000);

    })
    .catch(err => {
        annbarsaveicon.innerHTML = '<span><i style="padding-right: 9px;" id="annbar-saveicon" class="fa-solid fa-triangle-exclamation"></i>Check console!</span>';
        console.error('AnnouncementBar: save error', err);
        setTimeout(() => {
            annbarsaveicon.innerHTML = '<span><i style="padding-right: 9px;" id="annbar-saveicon" class="fa-solid fa-check"></i>Save Changes</span>';
        }, 3000);
    });
}

document.addEventListener('DOMContentLoaded', async() => {

    await configPromise;

    if (window.location.pathname.startsWith('/setup')) {
        injectAnnBarSettings();
        return;
    }

    if (annText && annColor) {
        initAnnouncementBar();
    }
});
