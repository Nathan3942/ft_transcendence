
const keys: Record<string, boolean> = {};



// function draw_0(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, P: Number)
// {
// 	let pos = 100;
// 	if (P == 1)
// 		pos = -pos;

// 	ctx.fillStyle = "white";
// 	ctx.beginPath();
// 	ctx.rect((canvas.width / 2 - 25) - pos, 50, 50, 70);
// 	ctx.fill();

// 	ctx.fillStyle = "black";
// 	ctx.beginPath();
// 	ctx.rect((canvas.width / 2 - 25) - (pos - 10), 60, 30, 50);
// 	ctx.fill();
// }

// function draw_1(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, P: Number)
// {
// 	let pos = 100;
// 	if (P == 1)
// 		pos = -pos;

// 	ctx.fillStyle = "white";
// 	ctx.beginPath();
// 	ctx.rect((canvas.width / 2 - 10) - pos, 50, 20, 70);
// 	ctx.fill();
// }

// function draw_2(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, P: Number)
// {
// 	let pos = 100;
// 	if (P == 1)
// 		pos = -pos;

// 	ctx.fillStyle = "white";
// 	ctx.beginPath();
// 	ctx.rect((canvas.width / 2 - 25) - pos, 50, 50, 70);
// 	ctx.fill();

// 	ctx.fillStyle = "black";
// 	ctx.beginPath();
// 	ctx.rect((canvas.width / 2 - 25) - pos, 60, 40, 20);
// 	ctx.rect((canvas.width / 2 - 15) - pos, 90, 40, 20);
// 	ctx.fill();
// }

// function draw_3(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, P: Number)
// {
// 	let pos = 100;
// 	if (P == 1)
// 		pos = -pos;

// 	ctx.fillStyle = "white";
// 	ctx.beginPath();
// 	ctx.rect((canvas.width / 2 - 25) - pos, 50, 50, 70);
// 	ctx.fill();

// 	ctx.fillStyle = "black";
// 	ctx.beginPath();
// 	ctx.rect((canvas.width / 2 - 25) - pos, 60, 40, 20);
// 	ctx.rect((canvas.width / 2 - 25) - pos, 90, 40, 20);
// 	ctx.fill();
// }

// function draw_4(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, P: Number)
// {
// 	let pos = 100;
// 	if (P == 1)
// 		pos = -pos;

// 	ctx.fillStyle = "white";
// 	ctx.beginPath();
// 	ctx.rect((canvas.width / 2 - 25) - pos, 50, 50, 70);
// 	ctx.fill();

// 	ctx.fillStyle = "black";
// 	ctx.beginPath();
// 	ctx.rect((canvas.width / 2 - 15) - pos, 50, 30, 30);
// 	ctx.rect((canvas.width / 2 - 25) - pos, 90, 40, 30);
// 	ctx.fill();
// }

// function draw_5(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, P: Number)
// {
// 	let pos = 100;
// 	if (P == 1)
// 		pos = -pos;

// 	ctx.fillStyle = "white";
// 	ctx.beginPath();
// 	ctx.rect((canvas.width / 2 - 25) - pos, 50, 50, 70);
// 	ctx.fill();

// 	ctx.fillStyle = "black";
// 	ctx.beginPath();
// 	ctx.rect((canvas.width / 2 - 15) - pos, 60, 40, 20);
// 	ctx.rect((canvas.width / 2 - 25) - pos, 90, 40, 20);
// 	ctx.fill();
// }

// function draw_6(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, P: Number)
// {
// 	let pos = 100;
// 	if (P == 1)
// 		pos = -pos;

// 	ctx.fillStyle = "white";
// 	ctx.beginPath();
// 	ctx.rect((canvas.width / 2 - 25) - pos, 50, 50, 70);
// 	ctx.fill();

// 	ctx.fillStyle = "black";
// 	ctx.beginPath();
// 	ctx.rect((canvas.width / 2 - 15) - pos, 60, 40, 20);
// 	ctx.rect((canvas.width / 2 - 15) - pos, 90, 30, 20);
// 	ctx.fill();
// }

// function draw_7(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, P: Number)
// {
// 	let pos = 100;
// 	if (P == 1)
// 		pos = -pos;

// 	ctx.fillStyle = "white";
// 	ctx.beginPath();
// 	ctx.rect((canvas.width / 2 - 25) - pos, 50, 50, 70);
// 	ctx.fill();

// 	ctx.fillStyle = "black";
// 	ctx.beginPath();
// 	ctx.rect((canvas.width / 2 - 35) - (pos - 10), 60, 40, 60);
// 	ctx.fill();
// }

// function draw_8(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, P: Number)
// {
// 	let pos = 100;
// 	if (P == 1)
// 		pos = -pos;

// 	ctx.fillStyle = "white";
// 	ctx.beginPath();
// 	ctx.rect((canvas.width / 2 - 25) - pos, 50, 50, 70);
// 	ctx.fill();

// 	ctx.fillStyle = "black";
// 	ctx.beginPath();
// 	ctx.rect((canvas.width / 2 - 15) - pos, 60, 30, 20);
// 	ctx.rect((canvas.width / 2 - 15) - pos, 90, 30, 20);
// 	ctx.fill();
// }

// function draw_9(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, P: Number)
// {
// 	let pos = 100;
// 	if (P == 1)
// 		pos = -pos;

// 	ctx.fillStyle = "white";
// 	ctx.beginPath();
// 	ctx.rect((canvas.width / 2 - 25) - pos, 50, 50, 70);
// 	ctx.fill();

// 	ctx.fillStyle = "black";
// 	ctx.beginPath();
// 	ctx.rect((canvas.width / 2 - 15) - pos, 60, 30, 20);
// 	ctx.rect((canvas.width / 2 - 25) - pos, 90, 40, 20);
// 	ctx.fill();
// }

function draw_number_p1(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, score: Number)
{
	ctx.font = "150px 'VT323'";
		ctx.textAlign = "center";
		ctx.fillText(score.toString(), canvas.width / 2 - 100, 100);
}

function draw_number_p2(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, score: Number)
{
	ctx.font = "150px 'VT323'";
		ctx.textAlign = "center";
		ctx.fillText(score.toString(), canvas.width / 2 + 100, 100);
}

function draw_score(
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    score1: number,
    score2: number
) {
    switch (score1)
	{
		case 0:
			draw_number_p1(ctx, canvas, 0);
			break;
		case 1:
			draw_number_p1(ctx, canvas, 1);
			break;
		case 2:
			draw_number_p1(ctx, canvas, 2);
			break;
		case 3:
			draw_number_p1(ctx, canvas, 3);
			break;
		case 4:
			draw_number_p1(ctx, canvas, 4);
			break;
		case 5:
			draw_number_p1(ctx, canvas, 5);
			break;
		case 6:
			draw_number_p1(ctx, canvas, 6);
			break;
		case 7:
			draw_number_p1(ctx, canvas, 7);
			break;
		case 8:
			draw_number_p1(ctx, canvas, 8);
			break;
		case 9:
			draw_number_p1(ctx, canvas, 9);
			break;
	}
	switch (score2)
	{
		case 0:
			draw_number_p2(ctx, canvas, 0);
			break;
		case 1:
			draw_number_p2(ctx, canvas, 1);
			break;
		case 2:
			draw_number_p2(ctx, canvas, 2);
			break;
		case 3:
			draw_number_p2(ctx, canvas, 3);
			break;
		case 4:
			draw_number_p2(ctx, canvas, 4);
			break;
		case 5:
			draw_number_p2(ctx, canvas, 5);
			break;
		case 6:
			draw_number_p2(ctx, canvas, 6);
			break;
		case 7:
			draw_number_p2(ctx, canvas, 7);
			break;
		case 8:
			draw_number_p2(ctx, canvas, 8);
			break;
		case 9:
			draw_number_p2(ctx, canvas, 9);
			break;
	}
}

export function startPong(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) 
{
    const ballRadius = 10;
    const padSpeed = 8;
    const maxBounceAngle = 8;

	let gameOver = false;
	let gameStarted = false;
	let paused = false;
	let resuming = false;
	let countdown = 0;
	let nextCountdownTime = 0;
	let winner: 1 | 2 | null = null;

	let scoreP1 = 0;
	let scoreP2 = 0;

    let ballX = canvas.width / 2;
    let ballY = canvas.height / 2;

    let speedX = 6;
    let speedY = 6;

    
    let pad1W = 10;
    let pad1H = 150;
    
    let pad1X = 10;
    let pad1Y = canvas.height / 2 - pad1H / 2;

    let pad2W = 10;
    let pad2H = 150;
    
    let pad2X = canvas.width - (pad2W + 10);
    let pad2Y = canvas.height / 2 - pad1H / 2;

	if (Math.random() < 0.5)
		speedX *= -1;
	if (Math.random() < 0.5)
		speedY *= -1;

	document.addEventListener("keydown", (e) => {
		keys[e.key] = true;
	
		if (e.key === "Escape") 
		{
			if (!paused && !resuming && gameStarted && !gameOver)
				paused = !paused;
			else if (paused && !resuming && gameStarted && !gameOver)
			{
				paused = false;
				resuming = true;
				countdown = 3;
				nextCountdownTime = performance.now() + 1000;
			}
		}

		if (e.key === "Enter")
		{
			gameStarted = true;
			resuming = true;
			countdown = 3;
			nextCountdownTime = performance.now() + 1000;
			ballX = canvas.width / 2;
    		ballY = canvas.height / 2;
		}

	})
	
	document.addEventListener("keyup", (e) =>{
		keys[e.key] = false;
	})

	function score(player: 1 | 2)
	{
        if (player === 1)
            scoreP1++;
        else
            scoreP2++;

		if (scoreP1 >= 9)
		{
			gameOver = true;
			winner = 1;
			return ;
		}
		if (scoreP2 >= 9)
		{
			gameOver = true;
			winner = 2;
			return ;
		}

        // reset balle
        ballX = canvas.width / 2;
        ballY = canvas.height / 2;

        // direction aléatoire
        speedX = 6;
        speedY = 6;
        if (Math.random() < 0.5)
            speedX *= -1;
        if (Math.random() < 0.5)
            speedY *= -1;
    }

	function drawLoader()
	{
		ctx.clearRect(0, 0, canvas.width, canvas.height);

		ballX += speedX;
        ballY += speedY;

		

		if (ballX >= canvas.width - ballRadius || ballX <= 0 + ballRadius)
            speedX *= -1;
		if (ballY <= 0 + ballRadius || ballY >= canvas.height - ballRadius)
            speedY *= -1;

		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.fillStyle = "grey";
        ctx.beginPath();

        for (let i = 0; i < canvas.height; i += 20)
        {
            ctx.rect(canvas.width / 2 - 5 / 2, i, 10, 10)
        }
		ctx.fill();

		ctx.fillStyle = "white"
		ctx.beginPath();

        ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
        ctx.fill();
		ctx.font = "100px 'VT323'";
		ctx.textAlign = "center";
		ctx.fillText("Press Enter For Start Game", canvas.width / 2, canvas.height / 2);
		draw_score(ctx, canvas, scoreP1, scoreP2);
		// if (keys["Enter"])
		// {
		// 	gameStarted = true;
		// 	resuming = true;
		// 	ballX = canvas.width / 2;
    	// 	ballY = canvas.height / 2;
		// 	return ;
		// }
	}

	function botPalyer()
	{
		if (pad1Y + (pad1H / 2) > pad2Y + (pad2H / 2))
		{
			if (ballY <= pad2Y + (pad2H / 4))
				pad2Y -= padSpeed;
			else if (ballY > pad2Y + (pad2H / 4))
				pad2Y += padSpeed;
		}
		else
		{
			if (ballY <= pad2Y + (pad2H / 4) * 3)
				pad2Y -= padSpeed;
			else if (ballY > pad2Y + (pad2H / 4) * 3)
				pad2Y += padSpeed;
		}
					
	}

    function drawGame()
    {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

		if (gameOver)
		{
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			draw_score(ctx, canvas, scoreP1, scoreP2);
			ctx.fillStyle = "white";
			ctx.font = "150px 'VT323'";
			ctx.textAlign = "center";

			const text = winner === 1 ? "PLAYER 1 WINS!" : "PLAYER 2 WINS!";
			ctx.fillText(text, canvas.width / 2, canvas.height / 2);
			if (keys["Enter"])
			{
				gameOver = false;
				scoreP1 = 0;
				scoreP2 = 0;
			}
			return;
		}

		if (paused)
		{
			ctx.clearRect(0, 0, canvas.width, canvas.height);

			draw_score(ctx, canvas, scoreP1, scoreP2);
	
			ctx.fillStyle = "white";
			ctx.font = "120px 'VT323'";
			ctx.textAlign = "center";
			ctx.fillText("PAUSED", canvas.width / 2, canvas.height / 2);
	
			return;
		}
		
		if (resuming)
		{
			const now = performance.now();
			if (now >= nextCountdownTime) {
				countdown--;
				nextCountdownTime = now + 1000;
			}
	
			if (countdown <= 0) {
				resuming = false;
			} else {
				draw_score(ctx, canvas, scoreP1, scoreP2);
	
				ctx.fillStyle = "white";
				ctx.font = "150px 'VT323'";
				ctx.textAlign = "center";
				ctx.fillText(`${countdown}`, canvas.width / 2, canvas.height / 2);
	

				ctx.fillStyle = "grey";
				ctx.beginPath();

				for (let i = 0; i < canvas.height; i += 20)
				{
					if (i < 360 || i > 460)
						ctx.rect(canvas.width / 2 - 5 / 2, i, 10, 10)
				}
				ctx.fill();

				ctx.fillStyle = "white"
				ctx.beginPath();

				ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
				ctx.fill();

				ctx.rect(pad1X, pad1Y, pad1W, pad1H);
				ctx.rect(pad2X, pad2Y, pad2W, pad2H);
				ctx.fill();

				return; 
			}
		}

		draw_score(ctx, canvas, scoreP1, scoreP2);

		ballX += speedX;
        ballY += speedY;

        if (keys["w"]) pad1Y -= padSpeed;
        if (keys["s"]) pad1Y += padSpeed;

		// botPalyer();
        if (keys["ArrowUp"]) pad2Y -= padSpeed;
        if (keys["ArrowDown"]) pad2Y += padSpeed;

        pad1Y = Math.max(0, Math.min(canvas.height - pad1H, pad1Y))
        pad2Y = Math.max(0, Math.min(canvas.height - pad2H, pad2Y))

        if (!paused && !gameOver)
		{
			if (ballX >= canvas.width - ballRadius)
            	score(1);
			if (ballX <= 0 + ballRadius)
				score(2);
		}

        if (ballY <= 0 + ballRadius || ballY >= canvas.height - ballRadius)
            speedY *= -1;

        if (ballX - ballRadius < pad1X + pad1W && 
            ballY > pad1Y && 
            ballY < pad1Y + pad1H
        )
        {
            let relativeIntersectY = (pad1Y + pad1H / 2) - ballY;

            let normalizedIntersectY = relativeIntersectY / (pad1H / 2);
            speedY = -normalizedIntersectY * maxBounceAngle;

            speedX *= -1;
            ballX = pad1X + pad1W + ballRadius;
        }

        if (ballX + ballRadius > pad2X && 
            ballY + ballRadius > pad2Y && 
            ballY + ballRadius < pad2Y + pad2H &&
            speedX > 0
        )
        {
            let relativeIntersectY = (pad2Y + pad2H / 2) - ballY;

            let normalizedIntersectY = relativeIntersectY / (pad2H / 2);
            speedY = -normalizedIntersectY * maxBounceAngle;

            speedX *= -1;
            ballX = pad2X - ballRadius;
        }

        ctx.fillStyle = "grey";
        ctx.beginPath();

        for (let i = 0; i < canvas.height; i += 20)
        {
            ctx.rect(canvas.width / 2 - 5 / 2, i, 10, 10)
        }
		ctx.fill();

		ctx.fillStyle = "white"
		ctx.beginPath();

        ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
        ctx.fill();

        ctx.rect(pad1X, pad1Y, pad1W, pad1H);
        ctx.rect(pad2X, pad2Y, pad2W, pad2H);
        ctx.fill();
    }

	function frame()
	{
        if (!gameStarted)
		{
            drawLoader();
        }
		else
		{
            drawGame();
        }
        requestAnimationFrame(frame);
    }

	frame();
}
  