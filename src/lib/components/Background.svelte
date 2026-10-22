<script lang="ts">
	import { onMount } from 'svelte';

	type Flake = {
		x: number;
		y: number;
		radius: number;
		speed: number;
		sway: number;
		drift: number;
		phase: number;
		alpha: number;
	};

	let canvas = $state<HTMLCanvasElement>();

	onMount(() => {
		const element = canvas;
		const context = element?.getContext('2d');

		if (!element || !context) {
			return;
		}

		const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
		let flakes: Flake[] = [];
		let width = 0;
		let height = 0;
		let snowColor = '#ffffff';
		let frame = 0;
		let previous = 0;
		let elapsed = 0;

		const readSnowColor = () => {
			snowColor = getComputedStyle(element).getPropertyValue('--snow-color').trim() || '#ffffff';
		};

		const spawn = (scattered: boolean): Flake => {
			const radius = 0.6 + Math.random() * 1.9;

			return {
				x: Math.random() * width,
				y: scattered ? Math.random() * height : -radius * 2,
				radius,
				speed: 14 + radius * 16 + Math.random() * 12,
				sway: 6 + Math.random() * 20,
				drift: 0.7 + Math.random() * 0.6,
				phase: Math.random() * Math.PI * 2,
				alpha: 0.3 + Math.random() * 0.4
			};
		};

		const resize = () => {
			const ratio = Math.min(window.devicePixelRatio || 1, 2);
			width = window.innerWidth;
			height = window.innerHeight;
			element.width = Math.round(width * ratio);
			element.height = Math.round(height * ratio);
			context.setTransform(ratio, 0, 0, ratio, 0, 0);

			const count = Math.max(40, Math.min(220, Math.round((width * height) / 13000)));
			flakes = Array.from({ length: count }, () => spawn(true));
		};

		const render = (delta: number) => {
			elapsed += delta;
			const wind = 48 + Math.sin(elapsed * 0.5) * 28 + Math.sin(elapsed * 1.7 + 0.8) * 10;

			context.clearRect(0, 0, width, height);
			context.fillStyle = snowColor;

			for (const flake of flakes) {
				if (delta > 0) {
					flake.y += flake.speed * delta;
					flake.x += wind * flake.drift * delta;
					flake.phase += delta * 0.5;
				}

				if (flake.y - flake.radius > height) {
					Object.assign(flake, spawn(false));
				} else if (flake.x - flake.radius > width) {
					flake.x = -flake.radius;
				} else if (flake.x + flake.radius < 0) {
					flake.x = width + flake.radius;
				}

				context.globalAlpha = flake.alpha;
				context.beginPath();
				context.arc(
					flake.x + Math.sin(flake.phase) * flake.sway,
					flake.y,
					flake.radius,
					0,
					Math.PI * 2
				);
				context.fill();
			}

			context.globalAlpha = 1;
		};

		const animate = (now: number) => {
			const delta = Math.min((now - previous) / 1000, 0.05);
			previous = now;
			render(delta);
			frame = requestAnimationFrame(animate);
		};

		const start = () => {
			cancelAnimationFrame(frame);
			readSnowColor();
			resize();

			if (reducedMotion.matches) {
				render(0);
				return;
			}

			previous = performance.now();
			frame = requestAnimationFrame(animate);
		};

		const onResize = () => {
			cancelAnimationFrame(frame);
			resize();
			render(0);

			if (!reducedMotion.matches) {
				previous = performance.now();
				frame = requestAnimationFrame(animate);
			}
		};

		const themeObserver = new MutationObserver(() => {
			readSnowColor();
			render(0);
		});

		themeObserver.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ['data-theme']
		});
		window.addEventListener('resize', onResize);
		reducedMotion.addEventListener('change', start);
		start();

		return () => {
			cancelAnimationFrame(frame);
			themeObserver.disconnect();
			window.removeEventListener('resize', onResize);
			reducedMotion.removeEventListener('change', start);
		};
	});
</script>

<div class="pointer-events-none fixed inset-0 -z-10 overflow-hidden select-none" aria-hidden="true">
	<div class="absolute inset-0 bg-background"></div>
	<canvas bind:this={canvas} class="absolute inset-0 size-full"></canvas>
	<div class="absolute inset-0 bg-background/45 backdrop-blur-[1.5px]"></div>
</div>
