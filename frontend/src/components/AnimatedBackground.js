import React, { useEffect, useRef } from 'react';
import '../styles/AnimatedBackground.css';

const AnimatedBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationId;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Particle class
    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.radius = Math.random() * 1.5 + 0.5;
        this.color = `hsl(${Math.random() * 60 + 180}, 80%, ${Math.random() * 30 + 40}%)`;
        this.opacity = Math.random() * 0.5 + 0.3;
        this.pulsePhase = Math.random() * Math.PI * 2;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        // Wrap around screen
        if (this.x < 0) this.x = canvas.width;
        if (this.x > canvas.width) this.x = 0;
        if (this.y < 0) this.y = canvas.height;
        if (this.y > canvas.height) this.y = 0;

        this.pulsePhase += 0.02;
      }

      draw() {
        const pulseSize = this.radius * (1 + Math.sin(this.pulsePhase) * 0.3);
        ctx.fillStyle = this.color;
        ctx.globalAlpha = this.opacity * (0.7 + Math.sin(this.pulsePhase) * 0.3);
        ctx.beginPath();
        ctx.arc(this.x, this.y, pulseSize, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Create particles
    const particles = [];
    for (let i = 0; i < 80; i++) {
      particles.push(new Particle());
    }

    // Glowing orbs
    class Orb {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.radius = Math.random() * 40 + 20;
        this.opacity = Math.random() * 0.15 + 0.05;
        this.phase = Math.random() * Math.PI * 2;
      }

      update() {
        this.phase += 0.005;
      }

      draw() {
        const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius);
        gradient.addColorStop(0, `hsla(200, 100%, 50%, ${this.opacity * (0.5 + Math.sin(this.phase) * 0.5)})`);
        gradient.addColorStop(0.5, `hsla(200, 100%, 40%, ${this.opacity * 0.2})`);
        gradient.addColorStop(1, `hsla(200, 100%, 30%, 0)`);
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const orbs = [];
    for (let i = 0; i < 4; i++) {
      orbs.push(new Orb());
    }

    // Scanning lines
    let scanY = 0;
    const scanSpeed = 0.5;

    const drawScanLine = () => {
      ctx.strokeStyle = `hsla(200, 100%, 50%, 0.1)`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, scanY);
      ctx.lineTo(canvas.width, scanY);
      ctx.stroke();

      // Add glow effect
      ctx.strokeStyle = `hsla(200, 100%, 60%, 0.05)`;
      ctx.lineWidth = 20;
      ctx.beginPath();
      ctx.moveTo(0, scanY);
      ctx.lineTo(canvas.width, scanY);
      ctx.stroke();

      scanY += scanSpeed;
      if (scanY > canvas.height) scanY = 0;
    };

    // Connection drawing
    const drawConnections = () => {
      const connectionDistance = 150;

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < connectionDistance) {
            ctx.strokeStyle = `hsla(200, 100%, 50%, ${0.3 * (1 - distance / connectionDistance)})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
    };

    // Threat pulse effect
    class ThreatPulse {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.radius = 5;
        this.maxRadius = 150;
        this.opacity = 0.8;
        this.expandSpeed = 3;
      }

      update() {
        this.radius += this.expandSpeed;
        this.opacity = Math.max(0, this.opacity - 0.015);
      }

      draw() {
        ctx.strokeStyle = `hsla(0, 100%, 50%, ${this.opacity})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.stroke();
      }

      isActive() {
        return this.opacity > 0 && this.radius < this.maxRadius;
      }
    }

    let threatPulses = [];
    let threatCounter = 0;

    // Animation loop
    const animate = () => {
      // Clear canvas with fade effect
      ctx.fillStyle = 'rgba(15, 23, 42, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw background gradient
      const bgGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      bgGradient.addColorStop(0, 'rgba(15, 23, 42, 0.02)');
      bgGradient.addColorStop(1, 'rgba(15, 23, 42, 0.05)');
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.globalAlpha = 1;

      // Draw orbs
      orbs.forEach((orb) => {
        orb.update();
        orb.draw();
      });

      // Draw scanning lines
      drawScanLine();

      // Update and draw particles
      particles.forEach((particle) => {
        particle.update();
        particle.draw();
      });

      // Draw connections
      drawConnections();

      // Update and draw threat pulses
      threatPulses = threatPulses.filter((pulse) => pulse.isActive());
      threatPulses.forEach((pulse) => {
        pulse.update();
        pulse.draw();
      });

      // Occasionally create threat pulses
      threatCounter++;
      if (threatCounter > 180 && Math.random() < 0.3) {
        threatPulses.push(new ThreatPulse());
        threatCounter = 0;
      }

      ctx.globalAlpha = 1;
      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return <canvas ref={canvasRef} className="animated-background" />;
};

export default AnimatedBackground;
