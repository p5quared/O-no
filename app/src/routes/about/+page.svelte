<svelte:head>
	<title>About O-no!</title>
	<meta name="description" content="Learn more about the O-no! game" />
</svelte:head>

<div class="about-container">
	<div class="header">
		<div class="frog-icon animated-frog">🐸</div>
		<h1>About O-no!</h1>
		<div class="frog-icon animated-frog">🐸</div>
	</div>

	<div class="content-card">
		<h2>The Backstory</h2>
		<p>
			Deep in the heart of the digital swamp, a group of cybernetic frogs lived in harmony... 
			(Replace this with your actual backstory!) Will you help them navigate the perils of the pond?
		</p>
		<p>
			[Add more details about the game's premise, world, or characters here.]
		</p>
	</div>

	<div class="content-card">
		<h2>How to Play</h2>
		<p>
			[Explain the basic rules and objectives of the game here.]
		</p>
		<ul>
			<li>Rule 1: ...</li>
			<li>Rule 2: ...</li>
			<li>Objective: ...</li>
		</ul>
	</div>

	<div class="content-card">
		<h2>The Team</h2>
		<p>
			O-no! was brought to life by a passionate team of developers and designers... 
			(Introduce the creators here!)
		</p>
		<ul>
			<li>[Team Member 1] - Role</li>
			<li>[Team Member 2] - Role</li>
			<li>...</li>
		</ul>
	</div>
	
	<div class="footer-lilypads">
		<div class="lily-pad"></div>
		<div class="lily-pad"></div>
		<div class="lily-pad"></div>
	</div>
</div>

<style>
	.about-container {
		max-width: 800px;
		margin: 2rem auto;
		padding: 2rem;
		background: rgba(33, 46, 29, 0.9); /* Dark green, semi-transparent */
		border-radius: 12px;
		box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
		border: 1px solid rgba(255, 255, 255, 0.1);
		color: #e0e0e0; /* Light text color */
		position: relative;
		overflow: hidden;
		animation: fadeIn 1s ease-out;
	}

	@keyframes fadeIn {
		from { opacity: 0; transform: translateY(20px); }
		to { opacity: 1; transform: translateY(0); }
	}

	.about-container::before {
		content: "";
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 100px; /* Slightly taller header gradient */
		background: linear-gradient(180deg, rgba(76, 175, 80, 0.2) 0%, rgba(33, 46, 29, 0) 100%);
		z-index: 0;
		border-radius: 12px 12px 0 0;
		pointer-events: none; /* Allow clicks through the gradient */
	}

	.header {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-bottom: 2rem;
		z-index: 1;
	}

	.frog-icon {
		font-size: 2rem;
		margin: 0 1rem;
	}
	
	.animated-frog {
		animation: gentleBounce 2.5s infinite alternate ease-in-out;
	}

	@keyframes gentleBounce {
		0% { transform: translateY(0) rotate(0deg); }
		50% { transform: translateY(-6px) rotate(5deg); }
		100% { transform: translateY(0) rotate(-5deg); }
	}

	h1 {
		color: #fff;
		text-align: center;
		margin: 0;
		font-family: 'Arial', sans-serif; /* Replace with your theme font if available */
		font-size: 2.5rem;
		text-shadow: 0 3px 6px rgba(0, 0, 0, 0.4);
	}

	.content-card {
		background: rgba(255, 255, 255, 0.07);
		padding: 1.5rem;
		margin-bottom: 1.5rem;
		border-radius: 8px;
		border: 1px solid rgba(255, 255, 255, 0.05);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
		animation: slideUp 0.6s ease-out forwards;
		opacity: 0;
		transform: translateY(15px);
	}
	
	/* Stagger animation */
	.content-card:nth-child(2) { animation-delay: 0.2s; }
	.content-card:nth-child(3) { animation-delay: 0.4s; }
	.content-card:nth-child(4) { animation-delay: 0.6s; }

	@keyframes slideUp {
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	h2 {
		color: #a5d6a7; /* Light green accent */
		margin-top: 0;
		margin-bottom: 1rem;
		border-bottom: 1px solid rgba(76, 175, 80, 0.3);
		padding-bottom: 0.5rem;
	}

	p {
		line-height: 1.7;
		margin-bottom: 1rem;
		color: #c8e6c9; /* Slightly lighter green text */
	}
	
	ul {
		list-style: none;
		padding-left: 0;
	}
	
	li {
		margin-bottom: 0.5rem;
		padding-left: 1.5rem;
		position: relative;
	}
	
	li::before {
		content: '🐸'; /* Use frog as bullet point */
		position: absolute;
		left: 0;
		top: 1px; /* Adjust position slightly */
		color: #81c784; /* Medium green */
		font-size: 0.9em;
	}

	a {
		color: #f4c03f; /* Gold accent for links */
		text-decoration: none;
		transition: color 0.3s ease;
	}

	a:hover {
		color: #fff;
		text-decoration: underline;
	}

	pre {
		background: rgba(0, 0, 0, 0.2);
		padding: 1rem;
		border-radius: 4px;
		overflow-x: auto;
		color: #eee;
	}

	.footer-lilypads {
		display: flex;
		justify-content: space-around; /* Spread them out */
		margin-top: 2.5rem;
		padding-top: 1.5rem;
		border-top: 1px solid rgba(76, 175, 80, 0.2);
	}

	.lily-pad {
		width: 40px; /* Larger lily pads */
		height: 40px;
		background-color: rgba(76, 175, 80, 0.4);
		border-radius: 50% 40% 50% 40% / 40% 50% 40% 50%; /* Irregular shape */
		position: relative;
		animation: float 4s infinite alternate ease-in-out;
		box-shadow: inset 0 0 5px rgba(0,0,0,0.2);
	}
	
	.lily-pad:nth-child(1) { animation-delay: 0.5s; }
	.lily-pad:nth-child(3) { animation-delay: 1s; }


	.lily-pad::before {
		content: "";
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: 25px;
		height: 25px;
		background-color: rgba(102, 187, 106, 0.6); /* Lighter inner part */
		border-radius: 50% 45% 50% 45% / 45% 50% 45% 50%;
	}
	
	@keyframes float {
		0% { transform: translateY(0px) rotate(-2deg); }
		100% { transform: translateY(-5px) rotate(3deg); }
	}

</style>
