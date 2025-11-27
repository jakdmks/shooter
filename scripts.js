function testing() {
	console.info("Hello World...");
}

var statsTargetsTotal = 0;
var statsTargetsDestroyed = 0;
var statsTargetsRemaining = 0;

var statsShots = 0;
var statsHits = 0;
var statsAccuracy = 0;

var startTime = null;
var timerRequest = null;

var timerElement = document.getElementById("stats-time");


function startTimer() {
  startTime = performance.now();
  timerRequest = requestAnimationFrame(updateTimer);
}

function stopTimer() {
  if (timerRequest) {
    cancelAnimationFrame(timerRequest);
    timerRequest = null;
  }
}

function updateTimer(timestamp) {
  const elapsed = timestamp - startTime;
  timerElement.textContent = (elapsed / 1000).toFixed(3) + ' s';
  timerRequest = requestAnimationFrame(updateTimer);
}

document.querySelectorAll('.screen').forEach(screen => {
	screen.addEventListener('click', function(event) {
	
	if (statsTargetsTotal > 0) {
		
		//SFX
		const audio = new Audio("sounds/gunshot-01.mp3");
		audio.volume = 0.2;
		audio.play();
		
		screen.classList.add('flash');         // make it white
		statsShots++;
		
		setTimeout(() => {
			screen.classList.remove('flash');    // revert back quickly
		}, 100); // flash duration in ms
			
		const rect = screen.getBoundingClientRect();
		const x = event.clientX - rect.left;
		const y = event.clientY - rect.top;
		
		const xMark = document.createElement('div');
		xMark.classList.add('x-mark');
		xMark.style.left = `${x - 10}px`; // center the X
		xMark.style.top = `${y - 10}px`;
		
		const muzzleFlash = document.createElement('div');
		muzzleFlash.classList.add('muzzle-flash');
		muzzleFlash.style.left = `${x - 18}px`; // center the X
		muzzleFlash.style.top = `${y - 18}px`;

		screen.appendChild(xMark);
		screen.appendChild(muzzleFlash);
		
		  const numBlocks = 6; // number of blocks for detail

		  for (let i = 0; i < numBlocks; i++) {
			const block = document.createElement('div');
			block.classList.add('flash-block');

			// Always above center: dy is negative
			const dy = -30 - Math.random() * 20;  // 30-50px upward
			const dx = Math.random() * 40 - 20;   // -20px to +20px left/right
			block.style.setProperty('--dx', `${dx}px`);
			block.style.setProperty('--dy', `${dy}px`);

			muzzleFlash.appendChild(block);
		  }
		
		updateStatsDiv();
		
		if (statsTargetsRemaining === 0) {
			stopTimer();
			
			statsTargetsTotal = 0;
			showOverlay();
		}
	}
  });
});


function newRandomGame() {
	console.info("Starting new random game...");
	
	//SFX
	const audio = new Audio("sounds/success-01.mp3");
	audio.volume = 0.2;
	audio.play();
	
	statsShots = 0;
	statsHits = 0;
	statsAccuracy = 0;
	
	plotObjects('screen', 10, 80);
	
	startTimer();
	updateStatsDiv();
	closeOverlay();
}

function destroy(target="") {
	console.info("destroy...");
	if (target) {
		console.info("Running destroy for " + target);
		
		var targetElement = document.getElementById(target);
		
		if (targetElement) {
			targetElement.remove();
			statsHits++;
			statsTargetsDestroyed++;
			statsTargetsRemaining--;
		}
	}
	
	updateStatsDiv();
}

function updateStatsDiv() {
	
	divNewGameButtonRandom = document.getElementById("new-game-button-random");
	
	if (statsTargetsRemaining > 0) {
		divNewGameButtonRandom.style.visibility = "hidden";
	} else {
		divNewGameButtonRandom.style.visibility = "visible";
	}
	
	divStatsTargetsDestroyed = document.getElementById("stats-targets-destroyed");
	divStatsAccuracy = document.getElementById("stats-accuracy");
	
	statsAccuracy = statsShots > 0 ? statsHits / statsShots : 0;
	
	console.info("statsHits", statsHits);
	console.info("statsShots", statsShots);
	
	console.info("statsAccuracy", statsAccuracy);
	
	divStatsTargetsDestroyed.innerHTML = statsTargetsDestroyed;
	divStatsAccuracy.innerHTML = (statsAccuracy * 100).toFixed(1) + "%";
	
	//IF THE GAME HAS ENDED, DISPLAY AN OVERLAY...
	
}

/**
 * Generate random objects within a given area
 */
function generateRandomObjects(width, height, objectCount, objectSize) {
    const objects = [];

    function isOverlapping(x, y) {
        return objects.some(obj => {
            return !(
                x + objectSize < obj.x ||
                x > obj.x + objectSize ||
                y + objectSize < obj.y ||
                y > obj.y + objectSize
            );
        });
    }

    let attempts, maxAttempts = 1000;

    for (let i = 0; i < objectCount; i++) {
        attempts = 0;
        let x, y;
        do {
            x = Math.floor(Math.random() * (width - objectSize));
            y = Math.floor(Math.random() * (height - objectSize));
            attempts++;
        } while (isOverlapping(x, y) && attempts < maxAttempts);

        if (attempts < maxAttempts) {
            objects.push({ x, y });
        } else {
            console.warn(`Could not place object ${i + 1} without overlap.`);
        }
    }

    return objects;
}

/**
 * Plot objects in the #screen div
 */
function plotObjects(containerId, objectCount, objectSize) {
    const container = document.getElementById(containerId);
    const width = container.clientWidth;
    const height = container.clientHeight;

    const positions = generateRandomObjects(width, height, objectCount, objectSize);

    positions.forEach((pos, index) => {
        const div = document.createElement('div');
        const id = `target-${String(index + 1).padStart(3, '0')}`;
        div.id = id;
        div.className = "enemy flash-circle sway-bounce";
        div.style.position = 'absolute';
        div.style.left = pos.x + 'px';
        div.style.top = pos.y + 'px';
        div.style.width = objectSize + 'px';
        div.style.height = objectSize + 'px';
        div.style.display = 'flex';
        div.style.alignItems = 'center';
        div.style.justifyContent = 'center';
        div.style.background = 'red';
        div.style.borderRadius = '50%';
        div.style.color = '#fff';
        //div.innerText = String(index + 1).padStart(3, '0');
		div.innerText = 'o_o';

        // Example destroy function
        div.onclick = () => {
            //container.removeChild(div);
			destroy(div.id);
        };

        container.appendChild(div);
    });
	
	statsTargetsTotal = objectCount;
	statsTargetsDestroyed = 0;
	statsTargetsRemaining = objectCount;
}

function showOverlay() {
    document.getElementById("endgame-overlay").style.display = "flex";
	
	//SFX
	const audio = new Audio("sounds/clapping-01.mp3");
	audio.volume = 0.2;
	audio.play();
}

function closeOverlay() {
    document.getElementById("endgame-overlay").style.display = "none";
}
