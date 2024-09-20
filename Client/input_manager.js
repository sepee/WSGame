const is_key_down = (() => {
    const state = {};

    window.addEventListener('keyup', (e) => state[e.key] = false);
    window.addEventListener('keydown', (e) => state[e.key] = true);

    return (key) => state.hasOwnProperty(key) && state[key] || false;
})();


var mousex  = 0;
var mousey = 0;

var mousedx  = 0;
var mousedy = 0;

var mousexLast = 0;
var mouseyLast = 0;

getMousePos = function(canvas, event)
{
	var rect = canvas.getBoundingClientRect(); // abs. size of element
	scaleX = canvas.width / rect.width;    // relationship bitmap vs. element for x
	scaleY = canvas.height / rect.height;  // relationship bitmap vs. element for y

	mousex = (event.clientX - rect.left) * scaleX;   // scale mouse coordinates after they have
	mousey = (event.clientY - rect.top) * scaleY;     // been adjusted to be relative to element

	mousedx = mousex - mousexLast;
	mousedy = mousey - mouseyLast;

	mousexLast = mousex;
	mouseyLast = mousey;

	txtCursorPos.innerText = mousex + ", " + mousey;

	if(gameId){
		const payLoad = {
			"method": "move",
			"clientId": clientId,
			"gameId" : gameId,
			"x" : mousex,
			"y" : mousey
		}
		ws.send(JSON.stringify(payLoad));
	}	
}