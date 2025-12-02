// enter the announcement text here
// HTML tags supported
const annText = 'Hello World!  This is a plain text announcement.  You can use HTML tags to make me <b>bold</b> or <span style="color: cyan;">a different color!</span>  You can use the <em>annColor</em> variable to change the announcement bar background.  For any pull requests or issues, reach out to me on <a href="https://github.com/simsnet/FM-DX-Webserver-Announcement-Bar"><b style="color: greenyellow;">GitHub!</b></a>';

// dark red
const annColor = '#802020c0';
// transparent green (like the RDS info panel)
//const annColor = 'var(--color-2-transparent)';

document.addEventListener('DOMContentLoaded', function () {
    if (annText !== '') {
        let annBar = document.getElementById('announcement-bar');
        if (!annBar) {
            const annBar = `
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
            dashboardPanel[0].insertAdjacentHTML('afterend', annBar);

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
    }
});
