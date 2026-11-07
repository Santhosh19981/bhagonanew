import { Component, OnInit, OnDestroy, ElementRef, ViewChild, AfterViewInit } from '@angular/core';

interface SneakPeekCard {
  title: string;
  tagline: string;
  image: string;
  badge: string;
}

@Component({
  selector: 'app-launching-soon',
  templateUrl: './launching-soon.component.html',
  styleUrl: './launching-soon.component.scss'
})
export class LaunchingSoonComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('emberCanvas', { static: false }) canvasRef!: ElementRef<HTMLCanvasElement>;

  private animFrameId: number | null = null;
  private particles: Array<{
    x: number;
    y: number;
    radius: number;
    color: string;
    vx: number;
    vy: number;
    alpha: number;
    fadeSpeed: number;
  }> = [];

  sneakPeeks: SneakPeekCard[] = [
    {
      title: 'Royal Wedding Feasts',
      tagline: 'Lavish traditional banquets, live brass chafers & bespoke multi-cuisine menus.',
      image: 'assets/launching-soon/weddings.jpg',
      badge: 'Catering & Banquets'
    },
    {
      title: 'Private Master Chefs',
      tagline: 'Artisanal live cooking, authentic culinary heritage & private party curation.',
      image: 'assets/launching-soon/chefs.jpg',
      badge: 'Master Culinary'
    },
    {
      title: 'Celebration Setups',
      tagline: 'Atmospheric lighting, bespoke floral aesthetics & seamless event management.',
      image: 'assets/launching-soon/setups.jpg',
      badge: 'Events & Styling'
    }
  ];

  phoneNumber = '7416868881';
  phoneFormatted = '+91 74168 68881';
  emailAddress = 'bhagonaindia@gmail.com';
  
  copiedType: 'phone' | 'email' | null = null;
  copiedMessage = '';

  isInquiryOpen = false;
  inquirySubmitted = false;
  inquiryForm = {
    name: '',
    phone: '',
    eventType: 'Royal Wedding & Banquet',
    guests: '100 - 300 Guests',
    date: '',
    city: '',
    notes: ''
  };

  ngOnInit(): void {}

  copyToClipboard(text: string, type: 'phone' | 'email'): void {
    const successMsg = type === 'phone' ? 'Phone number 7416868881 copied!' : 'Email bhagonaindia@gmail.com copied!';
    if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        this.setCopiedState(type, successMsg);
      }).catch(() => {
        this.fallbackCopy(text, type, successMsg);
      });
    } else {
      this.fallbackCopy(text, type, successMsg);
    }
  }

  private fallbackCopy(text: string, type: 'phone' | 'email', successMsg: string): void {
    try {
      const input = document.createElement('textarea');
      input.value = text;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      this.setCopiedState(type, successMsg);
    } catch (e) {
      console.error('Copy failed', e);
    }
  }

  private setCopiedState(type: 'phone' | 'email', msg: string): void {
    this.copiedType = type;
    this.copiedMessage = msg;
    setTimeout(() => {
      if (this.copiedType === type) {
        this.copiedType = null;
        this.copiedMessage = '';
      }
    }, 3000);
  }

  toggleInquiry(): void {
    this.isInquiryOpen = !this.isInquiryOpen;
  }

  scrollToOffline(): void {
    const el = document.getElementById('offline-orders-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  openWhatsAppDirect(): void {
    const message = `Namaste Bhagona Team! 🙏 I want to inquire about offline catering and event bookings. Please share details.`;
    window.open(`https://wa.me/917416868881?text=${encodeURIComponent(message)}`, '_blank');
  }

  submitInquiryViaWhatsApp(): void {
    const name = this.inquiryForm.name ? this.inquiryForm.name.trim() : 'Guest';
    const phone = this.inquiryForm.phone ? this.inquiryForm.phone.trim() : 'Not provided';
    const event = this.inquiryForm.eventType || 'Catering Feast';
    const guests = this.inquiryForm.guests || 'Standard';
    const dateStr = this.inquiryForm.date ? `\n📅 Event Date: ${this.inquiryForm.date}` : '';
    const cityStr = this.inquiryForm.city ? `\n📍 City / Venue: ${this.inquiryForm.city}` : '';
    const notesStr = this.inquiryForm.notes ? `\n📝 Specific Requirements: ${this.inquiryForm.notes}` : '';

    const fullMsg = `Namaste Bhagona Team! 🙏\n\nI would like to place an *OFFLINE ORDER / EVENT BOOKING*:\n\n👤 *Name:* ${name}\n📞 *Phone:* ${phone}\n🎉 *Occasion:* ${event}${dateStr}${cityStr}\n👥 *Guest Count:* ${guests}${notesStr}\n\nPlease share menu curation & pricing. Thank you!`;

    window.open(`https://wa.me/917416868881?text=${encodeURIComponent(fullMsg)}`, '_blank');
    this.inquirySubmitted = true;
  }

  submitCallback(): void {
    if (!this.inquiryForm.phone) {
      alert('Please enter your contact phone number.');
      return;
    }
    this.inquirySubmitted = true;
  }

  resetInquiry(): void {
    this.inquirySubmitted = false;
    this.inquiryForm = {
      name: '',
      phone: '',
      eventType: 'Royal Wedding & Banquet',
      guests: '100 - 300 Guests',
      date: '',
      city: '',
      notes: ''
    };
  }

  ngAfterViewInit(): void {
    this.initEmberEngine();
  }

  ngOnDestroy(): void {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
    }
  }

  private initEmberEngine(): void {
    if (!this.canvasRef || !this.canvasRef.nativeElement) return;
    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const colors = ['#e87f2c', '#d97706', '#f59e0b', '#c8860a', '#b45309'];

    const spawnParticle = () => {
      return {
        x: Math.random() * canvas.width,
        y: canvas.height + Math.random() * 20,
        radius: Math.random() * 2.2 + 0.8,
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: (Math.random() - 0.5) * 0.7,
        vy: -(Math.random() * 1.5 + 0.6),
        alpha: Math.random() * 0.45 + 0.15,
        fadeSpeed: Math.random() * 0.005 + 0.002
      };
    };

    // Initial pool
    for (let i = 0; i < 40; i++) {
      const p = spawnParticle();
      p.y = Math.random() * canvas.height;
      this.particles.push(p);
    }

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (this.particles.length < 50 && Math.random() > 0.45) {
        this.particles.push(spawnParticle());
      }

      for (let i = this.particles.length - 1; i >= 0; i--) {
        const p = this.particles[i];
        p.x += p.vx + Math.sin(p.y * 0.01) * 0.3;
        p.y += p.vy;
        p.alpha -= p.fadeSpeed;

        if (p.alpha <= 0 || p.y < -10) {
          this.particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 6;
        ctx.shadowColor = 'rgba(232, 127, 44, 0.35)';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      this.animFrameId = requestAnimationFrame(render);
    };

    render();
  }
}
