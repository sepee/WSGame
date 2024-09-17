const is_key_down = (() => {
    const state = {};

    window.addEventListener('keyup', (e) => state[e.key] = false);
    window.addEventListener('keydown', (e) => state[e.key] = true);

    return (key) => state.hasOwnProperty(key) && state[key] || false;
})();

getMousePos = function(canvas, event)
{
	var rect = canvas.getBoundingClientRect(); // abs. size of element
	scaleX = canvas.width / rect.width;    // relationship bitmap vs. element for x
	scaleY = canvas.height / rect.height;  // relationship bitmap vs. element for y

	xpos = (event.clientX - rect.left) * scaleX;   // scale mouse coordinates after they have
	ypos = (event.clientY - rect.top) * scaleY;     // been adjusted to be relative to element

	txtCursorPos.innerText = xpos + ", " + ypos

	if(gameId){
		const payLoad = {
			"method": "move",
			"clientId": clientId,
			"gameId" : gameId,
			"x" : xpos,
			"y" : ypos
		}
		ws.send(JSON.stringify(payLoad));
	}	
}