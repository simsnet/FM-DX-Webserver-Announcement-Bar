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

const configPromise = fetch('/announcement-bar/config', {
  headers: {
    'X-Plugin-Name': 'AnnouncementBar'
  }
})
.then(r => {
  if (!r.ok) throw new Error('Failed to load announcement config');
  return r.json();
})
.then(cfg => {
  annText  = cfg.message || "";
  annColor = cfg.color || "";
})
.catch(err => {
  console.warn('AnnouncementBar: config load failed', err);
});

function initAnnouncementBar() {
    if (!annText || !annColor) return;

    if (document.getElementById('announcement-bar')) return;

    const annBarHtml = `
    <div id="announcement-bar" class="ann-bar flex-container bg-phone flex-phone-column" style="padding-left: 10px; padding-right: 10px;">
        <div id="announcement-text" style="background-color:${annColor}; border-radius:15px; margin-top:20px; align-items:center; box-sizing:border-box; width:100%; height:40px; max-width:1160px; padding:0 15px;">
            <div class="marquee-viewport" style="overflow:hidden; position:relative; width:100%; height:100%;">
                <div class="marquee">
                    <p style="margin:8px 0;">${annText}</p>
                </div>
            </div>
        </div>
    </div>
    `;

    const dashboardPanel = document.getElementsByClassName("canvas-container");
    if (dashboardPanel.length > 0) {
        dashboardPanel[0].insertAdjacentHTML('afterend', annBarHtml);
    }

    const css = `
        #announcement-text .marquee {
            display: inline-block;
            white-space: nowrap;
            position: absolute;
            will-change: transform;
            padding: 0px 15px;
        }

        @keyframes marquee {
            from { transform: translateX(var(--start)); }
            to   { transform: translateX(var(--end)); }
        }
    `;
    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);

    const marqueeEl = document.querySelector('#announcement-text .marquee');
    const container = document.querySelector('#announcement-text');

    requestAnimationFrame(() => {
        const textWidth = marqueeEl.offsetWidth;
        const containerWidth = container.offsetWidth;
        const distance = textWidth + containerWidth;
        const speed = 60;
        const duration = distance / speed;

        marqueeEl.style.setProperty('--start', containerWidth + 'px');
        marqueeEl.style.setProperty('--end', -textWidth + 'px');
        marqueeEl.style.animation = `marquee ${duration}s linear infinite`;
    });
}

function injectAnnBarSettings() {
    if (window.location.pathname !== '/setup') return;

    const aPluginSettings = document.getElementById('plugin-settings');
    if (!aPluginSettings) return;
	
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
        id="announcementBar-message" placeholder="Hello World!" value="${annText.replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}">
</div>
<div class="form-group">
    <label for="announcementBar-color">Bar Color</label>
    <input class="input-text w-100 br-15"
        type="text"
        id="announcementBar-color" placeholder="#ff000059" value="${annColor}">
</div><style>#annbar-save{width: 175px; height: 52px; margin: auto; color: var(--color-1); background-color: var(--color-3); display: flex; justify-content: center; align-items: center; font-size: 18px; border-radius: 10px; transition: 0.3s ease background-color; cursor: pointer;}#annbar-save:hover{background-color: var(--color-5);}</style>
<div id="annbar-save" class="icon tooltip" style="" id="submit-config" role="button" aria-label="Save settings" tabindex="0" data-tooltip="Save settings" onclick="saveAnnouncementBarConfig()"><span><i style="padding-right: 9px;" id="annbar-saveicon" class="fa-solid fa-save"></i>Save Changes</span></div>
<hr style="width: 20%; border-color: var(--color-5-transparent);" />
</div>`;

	if (aCurrentText === 'No plugin settings are available.') {
              aPluginSettings.innerHTML = aNewText;
            } else {
              aPluginSettings.innerHTML += ' ' + aNewText;
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
      color: document.getElementById('announcementBar-color')?.value || ""
    })
  })
  .then(r => {
    if (!r.ok) throw new Error('Save failed');
    return r.json();
  })
  .then(() => {
	annbarsaveicon.innerHTML = '<span><i style="padding-right: 9px;" id="annbar-saveicon" class="fa-solid fa-check"></i>Saved!</span>';
    console.log('AnnouncementBar: config saved');
	setTimeout(() => {annbarsaveicon.innerHTML = '<span><i style="padding-right: 9px;" id="annbar-saveicon" class="fa-solid fa-save"></i>Save Changes</span>';}, 3000);

  })
  .catch(err => {
	annbarsaveicon.innerHTML = '<span><i style="padding-right: 9px;" id="annbar-saveicon" class="fa-solid fa-triangle-exclamation"></i>Check console!</span>';
    console.error('AnnouncementBar: save error', err);
	setTimeout(() => {annbarsaveicon.innerHTML = '<span><i style="padding-right: 9px;" id="annbar-saveicon" class="fa-solid fa-check"></i>Save Changes</span>';}, 3000);
  });
}

document.addEventListener('DOMContentLoaded', async () => {
	
  await configPromise;

  if (window.location.pathname.startsWith('/setup')) {
    injectAnnBarSettings();
    return;
  }

  if (annText && annColor) {
    initAnnouncementBar();
  }
});
