// Staggered entrance animations
document.addEventListener('DOMContentLoaded', () => {
    const elements = document.querySelectorAll('[data-animate]');
    elements.forEach(el => {
        const delay = parseInt(el.dataset.delay || '0', 10) * 120;
        setTimeout(() => el.classList.add('visible'), 100 + delay);
    });
});

// Waitlist form
const form = document.querySelector('.waitlist');
if (form) {
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = form.querySelector('input[type="email"]');
        const email = input.value.trim();
        if (!email) return;

        // TODO: Replace with actual API endpoint
        // fetch('/api/waitlist', { method: 'POST', body: JSON.stringify({ email }) });

        form.classList.add('success');
        input.value = '';
        input.placeholder = 'Thanks! We\'ll be in touch.';
        input.disabled = true;

        setTimeout(() => {
            form.querySelector('button').disabled = true;
        }, 300);
    });
}

// ===== Animated Horizon Canvas =====
// Matches the Waitlister template: large blurry colored blobs + small drifting star particles
(function () {
    const canvas = document.getElementById('horizon-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let w, h, dpr;

    // --- Config matching the template ---
    const BLOB_COLORS = [
        [130, 60, 255],
        [60, 46, 255],
        [66, 110, 220],
        [50, 90, 180],
        [80, 50, 200]
    ];
    const BLOB_COUNT = 5;
    const STAR_COUNT = 100;
    const BG_COLOR = 'rgb(10, 10, 10)';

    let blobs = [];
    let stars = [];

    function resize() {
        dpr = window.devicePixelRatio || 1;
        const rect = canvas.parentElement.getBoundingClientRect();
        w = rect.width;
        h = rect.height;
        canvas.width = w * dpr;
        canvas.height = h * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function initBlobs() {
        blobs = [];
        for (let i = 0; i < BLOB_COUNT; i++) {
            const color = BLOB_COLORS[i % BLOB_COLORS.length];
            blobs.push({
                x: Math.random() * w,
                y: Math.random() * h,
                r: 200 + Math.random() * 150, // 200-350
                opacity: 0.04 + Math.random() * 0.16, // 0.04-0.20
                color,
                vx: (Math.random() - 0.5) * 0.3,
                vy: (Math.random() - 0.5) * 0.3,
                // Slow drift direction changes
                ax: (Math.random() - 0.5) * 0.0002,
                ay: (Math.random() - 0.5) * 0.0002
            });
        }
    }

    function initStars() {
        stars = [];
        for (let i = 0; i < STAR_COUNT; i++) {
            stars.push({
                x: Math.random() * w,
                y: Math.random() * h,
                r: 0.5 + Math.random() * 1.2, // 0.5-1.7
                opacity: 0.1 + Math.random() * 0.5,
                vx: (Math.random() - 0.5) * 0.6,
                vy: (Math.random() - 0.5) * 0.6
            });
        }
    }

    function updateBlobs() {
        blobs.forEach(b => {
            // Slowly change velocity
            b.vx += b.ax;
            b.vy += b.ay;
            // Clamp speed
            const maxSpeed = 0.4;
            b.vx = Math.max(-maxSpeed, Math.min(maxSpeed, b.vx));
            b.vy = Math.max(-maxSpeed, Math.min(maxSpeed, b.vy));
            // Move
            b.x += b.vx;
            b.y += b.vy;
            // Soft wrap: bounce gently off edges
            if (b.x < -b.r * 0.5) { b.vx = Math.abs(b.vx); b.ax = Math.abs(b.ax); }
            if (b.x > w + b.r * 0.5) { b.vx = -Math.abs(b.vx); b.ax = -Math.abs(b.ax); }
            if (b.y < -b.r * 0.5) { b.vy = Math.abs(b.vy); b.ay = Math.abs(b.ay); }
            if (b.y > h + b.r * 0.5) { b.vy = -Math.abs(b.vy); b.ay = -Math.abs(b.ay); }
            // Occasionally randomize acceleration
            if (Math.random() < 0.002) {
                b.ax = (Math.random() - 0.5) * 0.0003;
                b.ay = (Math.random() - 0.5) * 0.0003;
            }
        });
    }

    function updateStars() {
        stars.forEach(s => {
            s.x += s.vx;
            s.y += s.vy;
            // Wrap around
            if (s.x < 0) s.x = w;
            if (s.x > w) s.x = 0;
            if (s.y < 0) s.y = h;
            if (s.y > h) s.y = 0;
        });
    }

    function drawBlobs() {
        blobs.forEach(b => {
            const grad = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r);
            grad.addColorStop(0, `rgba(${b.color[0]}, ${b.color[1]}, ${b.color[2]}, ${b.opacity})`);
            grad.addColorStop(1, `rgba(${b.color[0]}, ${b.color[1]}, ${b.color[2]}, 0)`);
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
            ctx.fill();
        });
    }

    function drawStars() {
        stars.forEach(s => {
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${s.opacity})`;
            ctx.fill();
        });
    }

    function drawHorizon(t) {
        const horizonY = h * 0.82;
        const curveRadius = w * 2;
        const centerX = w / 2;
        const centerY = horizonY + curveRadius;

        // Concentrated center glow above the horizon (like sunrise behind planet)
        const glowGrad = ctx.createRadialGradient(
            centerX, horizonY, 0,
            centerX, horizonY, w * 0.45
        );
        glowGrad.addColorStop(0, 'rgba(200, 210, 255, 0.18)');
        glowGrad.addColorStop(0.3, 'rgba(140, 130, 255, 0.08)');
        glowGrad.addColorStop(0.6, 'rgba(80, 60, 200, 0.03)');
        glowGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = glowGrad;
        ctx.fillRect(0, horizonY - w * 0.4, w, w * 0.45);

        // Dark planet body
        ctx.beginPath();
        ctx.arc(centerX, centerY, curveRadius, 0, Math.PI * 2);
        ctx.fillStyle = '#060608';
        ctx.fill();

        // Arc angles for visible portion
        const halfAngle = Math.asin(Math.min(1, w / (2 * curveRadius))) * 1.15;
        const startAngle = Math.PI + halfAngle;
        const endAngle = 2 * Math.PI - halfAngle;

        // Wide atmospheric bloom
        ctx.save();
        ctx.filter = 'blur(20px)';
        ctx.beginPath();
        ctx.arc(centerX, centerY, curveRadius + 3, startAngle, endAngle);
        ctx.strokeStyle = 'rgba(160, 140, 255, 0.08)';
        ctx.lineWidth = 40;
        ctx.stroke();
        ctx.restore();

        // Medium glow halo
        ctx.save();
        ctx.filter = 'blur(6px)';
        ctx.beginPath();
        ctx.arc(centerX, centerY, curveRadius + 1, startAngle, endAngle);
        ctx.strokeStyle = 'rgba(220, 215, 255, 0.15)';
        ctx.lineWidth = 6;
        ctx.stroke();
        ctx.restore();

        // Crisp thin edge line
        ctx.beginPath();
        ctx.arc(centerX, centerY, curveRadius, startAngle, endAngle);
        const edgeAlpha = 0.35 + Math.sin((t || 0) * 0.001) * 0.06;
        ctx.strokeStyle = `rgba(255, 255, 255, ${edgeAlpha})`;
        ctx.lineWidth = 1;
        ctx.stroke();
    }

    let frameTime = 0;
    function frame(ts) {
        frameTime = ts || 0;
        // Clear with background
        ctx.fillStyle = BG_COLOR;
        ctx.fillRect(0, 0, w, h);

        updateBlobs();
        updateStars();
        drawBlobs();
        drawStars();
        drawHorizon(frameTime);

        requestAnimationFrame(frame);
    }

    function init() {
        resize();
        initBlobs();
        initStars();
        requestAnimationFrame(frame);
    }

    window.addEventListener('resize', () => {
        resize();
        // Reinit particles to fill new dimensions
        initBlobs();
        initStars();
    });

    init();
})();
