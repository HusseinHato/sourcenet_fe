'use client';

import React, { useEffect, useRef } from 'react';

export default function ParticlesBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let particles: Particle[] = [];
    let animationFrameId: number;

    // State Mouse
    let mouse = {
      x: -1000,
      y: -1000,
      radius: 150 // Radius interaksi mouse
    };

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      init();
    };

    // Event Listeners
    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('mousemove', (e) => {
      mouse.x = e.x;
      mouse.y = e.y;
    });

    class Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      baseAlpha: number; // Transparansi dasar

      constructor() {
        this.x = Math.random() * canvas!.width;
        this.y = Math.random() * canvas!.height;
        
        // Kecepatan acak halus
        this.vx = (Math.random() - 0.5) * 0.8;
        this.vy = (Math.random() - 0.5) * 0.8;
        
        // Ukuran acak (Partikel kecil untuk background, besar untuk foreground)
        this.size = Math.random() * 2 + 0.5; 
        
        // Semakin besar partikel, semakin jelas warnanya (efek kedalaman)
        this.baseAlpha = (this.size / 2.5) * 0.5 + 0.1; 
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        // Logic pantulan dinding
        if (this.x < 0 || this.x > canvas!.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas!.height) this.vy *= -1;
        
        // Interaksi Mouse (Repulsion/Pantulan halus saat mouse mendekat - opsional)
        // Jika ingin efek menarik (magnet), ganti logika di bawah atau biarkan kosong
        // dan andalkan garis koneksi saja.
      }

      draw() {
        if (!ctx) return;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        // Warna abu-abu gelap (Charcoal) dengan opacity bervariasi
        ctx.fillStyle = `rgba(50, 50, 50, ${this.baseAlpha})`; 
        ctx.fill();
      }
    }

    const init = () => {
      particles = [];
      // Responsif: jumlah partikel menyesuaikan luas layar
      const particleCount = (window.innerWidth * window.innerHeight) / 10000;
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
      }
    };

    const animate = () => {
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 1. BACKGROUND: Radial Gradient Mewah (Silver ke Light Grey)
      // Bagian tengah terang (#ffffff), pinggir agak gelap (#d4d4d4)
      const gradient = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 0, // Titik tengah
        canvas.width / 2, canvas.height / 2, canvas.width // Radius luar
      );
      gradient.addColorStop(0, '#ffffff'); // Tengah (White)
      gradient.addColorStop(1, '#e5e5e5'); // Pinggir (Light Grey)
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 2. Update & Draw Particles
      particles.forEach(particle => {
        particle.update();
        particle.draw();
      });

      // 3. Draw Connections
      connectParticles();

      animationFrameId = requestAnimationFrame(animate);
    };

    const connectParticles = () => {
      if (!ctx) return;

      // Loop partikel untuk mencari pasangan
      for (let a = 0; a < particles.length; a++) {
        for (let b = a; b < particles.length; b++) {
          const dx = particles[a].x - particles[b].x;
          const dy = particles[a].y - particles[b].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const connectDistance = 120;

          if (distance < connectDistance) {
            // Opacity garis berdasarkan jarak (semakin jauh semakin pudar)
            const opacity = 1 - (distance / connectDistance);
            
            // Warna garis: Abu-abu medium (#666)
            ctx.strokeStyle = `rgba(100, 100, 100, ${opacity * 0.2})`; 
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(particles[a].x, particles[a].y);
            ctx.lineTo(particles[b].x, particles[b].y);
            ctx.stroke();
          }
        }

        // KONEKSI KE MOUSE (Fitur Interaktif)
        const dxMouse = particles[a].x - mouse.x;
        const dyMouse = particles[a].y - mouse.y;
        const distMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);

        if (distMouse < mouse.radius) {
           const opacity = 1 - (distMouse / mouse.radius);
           // Garis ke mouse sedikit lebih gelap dan tebal agar menonjol
           ctx.strokeStyle = `rgba(50, 50, 50, ${opacity * 0.4})`; 
           ctx.lineWidth = 0.8;
           ctx.beginPath();
           ctx.moveTo(particles[a].x, particles[a].y);
           ctx.lineTo(mouse.x, mouse.y);
           ctx.stroke();
        }
      }
    };

    resizeCanvas();
    init();
    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', () => {});
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      // Fallback background color jika canvas gagal load
      style={{ background: '#f0f0f0' }} 
    />
  );
}