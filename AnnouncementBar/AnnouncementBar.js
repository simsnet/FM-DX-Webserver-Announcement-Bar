// enter the announcement text here
// HTML tags supported
const annText = 'Hello World!  This is a plain text announcement.  You can use HTML tags to make me <b>bold</b> or <span style="color: cyan;">a different color!</span>  You can use the <em>annColor</em> variable to change the announcement bar background.  For any pull requests or issues, reach out to me on <a href="https://github.com/simsnet/FM-DX-Webserver-Announcement-Bar"><b style="color: greenyellow;">GitHub!</b></a>';

// dark red
const annColor = '#802020c0';
// transparent green (like the RDS info panel)
//const annColor = 'var(--color-2-transparent)';


document.addEventListener('DOMContentLoaded', function() {
	if (annText !== '') {
		let annBar = document.getElementById('announcement-bar');
		if (!annBar) {
            const annBar = `
			<div id="announcement-bar" class="ann-bar flex-container bg-phone flex-phone-column" style="padding-left: 10px; padding-right: 10px;"><div id="announcement-text" style="background-color: ${annColor}; border-radius: 15px; padding: 0px 15px 0px 15px; margin-top: 20px; align-items: center; box-sizing: border-box; width: 100%; height: 40px; max-width: 1160px;"><marquee><p style="margin: 8px 0px 8px 0px;">${annText}</p></marquee></div></div>
            `;
			const dashboardPanel = document.getElementsByClassName("canvas-container");
			dashboardPanel[0].insertAdjacentHTML('afterend', annBar);

		}
	}
});
