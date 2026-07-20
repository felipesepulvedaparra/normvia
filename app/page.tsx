'use client'
import { useEffect } from 'react'

export default function LandingPage() {
  useEffect(() => {
    // Scroll reveal
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible') }),
      { threshold: 0.08 }
    )
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el))
    // Nav shadow
    const onScroll = () => {
      const nav = document.querySelector('nav') as HTMLElement
      if (nav) nav.style.borderBottomColor = window.scrollY > 20 ? '#D4CFC4' : '#E8E4DC'
    }
    window.addEventListener('scroll', onScroll)
    return () => { observer.disconnect(); window.removeEventListener('scroll', onScroll) }
  }, [])

  const WA_URL = 'https://wa.me/56990226972?text=Hola%2C%20me%20interesa%20conocer%20m%C3%A1s%20sobre%20Normvia'

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,600&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&family=JetBrains+Mono:wght@400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; font-size: 16px; }
        body { font-family: 'DM Sans', sans-serif; background: #F7F5F0; color: #0F1923; overflow-x: hidden; -webkit-font-smoothing: antialiased; }
        a { text-decoration: none; color: inherit; }

        /* ── REVEAL ── */
        .reveal { opacity: 0; transform: translateY(20px); transition: opacity .7s ease, transform .7s ease; }
        .reveal.visible { opacity: 1; transform: translateY(0); }

        /* ── NAV ── */
        nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          padding: 0 3rem; height: 64px;
          display: flex; align-items: center; justify-content: space-between;
          background: rgba(247,245,240,.96); backdrop-filter: blur(16px);
          border-bottom: 1px solid #E8E4DC; transition: border-color .3s;
        }
        .nav-logo {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.3rem; font-weight: 600; color: #0F1923;
          letter-spacing: .02em;
        }
        .nav-logo span { color: #C8A96E; }
        .nav-links { display: flex; align-items: center; gap: 2rem; }
        .nav-links a { font-size: 13px; color: #6B6B6E; font-weight: 400; letter-spacing: .02em; transition: color .2s; }
        .nav-links a:hover { color: #0F1923; }
        .nav-links a.dashboard-link { color: #0F1923; font-weight: 500; border-bottom: 1px solid #C8A96E; padding-bottom: 1px; }
        .nav-cta {
          padding: 8px 20px;
          border: 1px solid #0F1923; border-radius: 4px;
          font-size: 13px; font-weight: 500; color: #0F1923;
          transition: all .2s; letter-spacing: .02em;
        }
        .nav-cta:hover { background: #0F1923; color: #F7F5F0; }

        /* ── HERO ── */
        .hero {
          min-height: 100vh;
          padding: 120px 3rem 80px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4rem;
          align-items: center;
          max-width: 1200px;
          margin: 0 auto;
        }
        .hero-eyebrow {
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px; letter-spacing: .16em;
          text-transform: uppercase; color: #C8A96E;
          margin-bottom: 1.5rem;
          display: flex; align-items: center; gap: 12px;
        }
        .hero-eyebrow::before { content: ''; width: 32px; height: 1px; background: #C8A96E; }
        .hero-h1 {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(3rem, 5vw, 4.5rem);
          font-weight: 500; line-height: 1.08;
          letter-spacing: -.02em; color: #0F1923;
          margin-bottom: 1.5rem;
        }
        .hero-h1 em { font-style: italic; color: #1A2E44; }
        .hero-rule {
          width: 64px; height: 2px;
          background: #C8A96E; margin-bottom: 1.5rem;
        }
        .hero-sub {
          font-size: 16px; line-height: 1.75;
          color: #6B6B6E; max-width: 440px;
          margin-bottom: 2.5rem; font-weight: 300;
        }
        .hero-actions { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }
        .btn-primary {
          padding: 13px 28px;
          background: #0F1923; color: #F7F5F0;
          border: none; border-radius: 4px;
          font-size: 13px; font-weight: 500;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer; display: inline-flex;
          align-items: center; gap: 8px;
          transition: all .2s; letter-spacing: .02em;
        }
        .btn-primary:hover { background: #1A2E44; transform: translateY(-1px); }
        .btn-ghost {
          padding: 13px 20px;
          color: #6B6B6E; font-size: 13px;
          background: transparent; border: none;
          cursor: pointer; font-family: 'DM Sans', sans-serif;
          transition: color .2s;
        }
        .btn-ghost:hover { color: #0F1923; }
        .hero-stats {
          display: flex; gap: 2.5rem; margin-top: 3rem;
          padding-top: 2rem; border-top: 1px solid #E8E4DC;
        }
        .hero-stat-num {
          font-family: 'Cormorant Garamond', serif;
          font-size: 2rem; font-weight: 600; color: #C8A96E; line-height: 1;
        }
        .hero-stat-lbl { font-size: 11px; color: #9B9B9E; margin-top: 3px; line-height: 1.4; max-width: 100px; }

        /* Hero right — cards */
        .hero-right {
          display: flex; flex-direction: column; gap: 10px;
          padding: 2rem; background: #0F1923; border-radius: 12px;
          position: relative; overflow: hidden;
        }
        .hero-right::before {
          content: ''; position: absolute;
          top: 0; left: 0; right: 0; height: 3px;
          background: linear-gradient(90deg, #C8A96E, #1A2E44);
        }
        .alert-card {
          background: rgba(255,255,255,.04);
          border: 1px solid rgba(255,255,255,.08);
          border-radius: 8px; padding: 14px 16px;
          display: flex; align-items: flex-start; gap: 12px;
          transform: translateX(20px); opacity: 0;
          animation: slideCard .5s ease forwards;
        }
        .alert-card:nth-child(2) { animation-delay: .15s; }
        .alert-card:nth-child(3) { animation-delay: .3s; }
        .alert-card:nth-child(4) { animation-delay: .45s; }
        .alert-card:nth-child(5) { animation-delay: .6s; }
        @keyframes slideCard { to { transform: translateX(0); opacity: 1; } }
        .ac-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; margin-top: 4px; }
        .ac-dot.r { background: #E5484D; }
        .ac-dot.a { background: #F59E0B; }
        .ac-dot.v { background: #00B87A; }
        .ac-title { font-size: 13px; font-weight: 500; color: rgba(255,255,255,.85); margin-bottom: 2px; }
        .ac-desc { font-size: 11px; color: rgba(255,255,255,.38); line-height: 1.4; }
        .platform-label {
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px; letter-spacing: .12em;
          text-transform: uppercase; color: rgba(255,255,255,.25);
          margin-bottom: .5rem; display: flex; align-items: center; gap: 8px;
        }
        .platform-label::after { content: ''; flex: 1; height: 1px; background: rgba(255,255,255,.08); }

        /* ── SECCIONES ── */
        .section { padding: 6rem 3rem; }
        .section-inner { max-width: 1100px; margin: 0 auto; }
        .section-eyebrow {
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px; letter-spacing: .16em;
          text-transform: uppercase; color: #C8A96E;
          margin-bottom: 1.25rem;
          display: flex; align-items: center; gap: 12px;
        }
        .section-eyebrow::before { content: ''; width: 24px; height: 1px; background: #C8A96E; }
        .section-h2 {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(2rem, 3.5vw, 3rem);
          font-weight: 500; line-height: 1.1;
          letter-spacing: -.02em; color: #0F1923;
          margin-bottom: 1rem;
        }
        .section-h2 em { font-style: italic; color: #1A2E44; }
        .section-lead {
          font-size: 16px; line-height: 1.75;
          color: #6B6B6E; max-width: 560px;
          margin-bottom: 3.5rem; font-weight: 300;
        }

        /* ── PROBLEMA ── */
        .problema-grid {
          display: grid; grid-template-columns: repeat(3,1fr);
          border: 1px solid #E8E4DC; border-radius: 8px; overflow: hidden;
        }
        .problema-item {
          padding: 2rem; border-right: 1px solid #E8E4DC;
          transition: background .2s;
        }
        .problema-item:last-child { border-right: none; }
        .problema-item:hover { background: #EFEDE8; }
        .prob-num {
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px; color: #C8A96E;
          letter-spacing: .1em; margin-bottom: 1rem;
        }
        .prob-title { font-size: 15px; font-weight: 500; color: #0F1923; margin-bottom: .625rem; }
        .prob-desc { font-size: 13px; line-height: 1.65; color: #6B6B6E; }

        /* ── LEYES ── */
        .leyes-section {
          background: #0F1923; padding: 6rem 3rem;
          position: relative; overflow: hidden;
        }
        .leyes-section::before {
          content: ''; position: absolute;
          top: 0; left: 0; right: 0; height: 2px;
          background: linear-gradient(90deg, transparent, #C8A96E 40%, transparent);
        }
        .leyes-inner { max-width: 1100px; margin: 0 auto; }
        .leyes-eyebrow {
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px; letter-spacing: .16em;
          text-transform: uppercase; color: #C8A96E;
          margin-bottom: 1.25rem;
          display: flex; align-items: center; gap: 12px;
        }
        .leyes-eyebrow::before { content: ''; width: 24px; height: 1px; background: #C8A96E; }
        .leyes-h2 {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(2rem, 3.5vw, 3rem);
          font-weight: 500; line-height: 1.1;
          letter-spacing: -.02em; color: #F7F5F0;
          margin-bottom: 3rem;
        }
        .leyes-h2 em { font-style: italic; color: #C8A96E; }
        .leyes-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1px; background: rgba(255,255,255,.06); border: 1px solid rgba(255,255,255,.06); border-radius: 8px; overflow: hidden; }
        .ley-card { background: #0F1923; padding: 2rem; transition: background .2s; }
        .ley-card:hover { background: #1A2E44; }
        .ley-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem; }
        .ley-name { font-family: 'Cormorant Garamond', serif; font-size: 1.3rem; font-weight: 500; color: #F7F5F0; }
        .ley-num { font-family: 'JetBrains Mono', monospace; font-size: 10px; color: rgba(255,255,255,.3); letter-spacing: .06em; margin-top: 2px; }
        .ley-badge {
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px; padding: 3px 10px;
          border: 1px solid rgba(200,169,110,.3);
          border-radius: 2px; color: #C8A96E; letter-spacing: .06em;
        }
        .ley-desc { font-size: 13px; line-height: 1.7; color: rgba(255,255,255,.45); margin-bottom: 1.25rem; }
        .ley-item { font-size: 12px; color: rgba(255,255,255,.55); padding: 5px 0; border-bottom: 1px solid rgba(255,255,255,.05); display: flex; gap: 10px; }
        .ley-item::before { content: '—'; color: #C8A96E; flex-shrink: 0; }
        .ley-multa { margin-top: 1rem; font-size: 11px; color: rgba(255,255,255,.25); font-family: 'JetBrains Mono', monospace; }
        .ley-multa strong { color: #E5484D; }

        /* ── MÓDULOS ── */
        .modulos-section { padding: 6rem 3rem; background: #F7F5F0; }
        .modulos-inner { max-width: 1100px; margin: 0 auto; }
        .modulos-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 1px; background: #E8E4DC; border: 1px solid #E8E4DC; border-radius: 8px; overflow: hidden; margin-top: 3rem; }
        .modulo-card {
          background: #F7F5F0; padding: 2rem;
          transition: background .2s; position: relative;
        }
        .modulo-card:hover { background: #EFEDE8; }
        .modulo-card:hover .mod-arrow { opacity: 1; transform: translate(2px,-2px); }
        .mod-num { font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #C8A96E; letter-spacing: .1em; margin-bottom: 1rem; }
        .mod-name { font-family: 'Cormorant Garamond', serif; font-size: 1.2rem; font-weight: 500; color: #0F1923; margin-bottom: .5rem; }
        .mod-desc { font-size: 13px; line-height: 1.6; color: #6B6B6E; margin-bottom: 1rem; }
        .mod-feature { font-size: 12px; color: #6B6B6E; padding: 4px 0; border-bottom: 1px solid #E8E4DC; display: flex; gap: 8px; }
        .mod-feature::before { content: '→'; color: #C8A96E; flex-shrink: 0; }
        .mod-arrow { position: absolute; top: 1.75rem; right: 1.75rem; font-size: 16px; color: #C8A96E; opacity: 0; transition: all .2s; }

        /* ── PRECIOS ── */
        .precios-section { padding: 6rem 3rem; background: #EFEDE8; border-top: 1px solid #E8E4DC; }
        .precios-inner { max-width: 1000px; margin: 0 auto; }
        .precios-grid { display: grid; grid-template-columns: 1fr 1.15fr 1fr; gap: 1rem; margin-top: 3rem; align-items: start; }
        .precio-card { background: #F7F5F0; border-radius: 6px; padding: 2rem; border: 1px solid #E8E4DC; transition: box-shadow .2s; position: relative; }
        .precio-card:hover:not(.featured) { box-shadow: 0 8px 32px rgba(15,25,35,.08); }
        .precio-card.featured { background: #0F1923; border-color: #0F1923; }
        .featured-tag { position: absolute; top: -11px; left: 50%; transform: translateX(-50%); background: #C8A96E; color: #0F1923; font-size: 10px; font-weight: 600; padding: 3px 14px; border-radius: 2px; letter-spacing: .06em; white-space: nowrap; font-family: 'JetBrains Mono', monospace; }
        .plan-name { font-family: 'JetBrains Mono', monospace; font-size: 10px; letter-spacing: .1em; text-transform: uppercase; color: #9B9B9E; margin-bottom: .75rem; }
        .featured .plan-name { color: rgba(255,255,255,.35); }
        .plan-price { font-family: 'Cormorant Garamond', serif; font-size: 2.5rem; font-weight: 500; color: #0F1923; line-height: 1; letter-spacing: -.03em; margin-bottom: 4px; }
        .featured .plan-price { color: #F7F5F0; }
        .plan-period { font-size: 12px; color: #9B9B9E; margin-bottom: 1.25rem; }
        .featured .plan-period { color: rgba(255,255,255,.3); }
        .plan-size { font-size: 12px; font-weight: 500; color: #1A2E44; background: #E8E4DC; padding: 5px 12px; border-radius: 2px; display: inline-block; margin-bottom: 1.25rem; font-family: 'JetBrains Mono', monospace; letter-spacing: .04em; }
        .featured .plan-size { background: rgba(255,255,255,.1); color: rgba(255,255,255,.7); }
        .plan-feat { font-size: 13px; color: #0F1923; padding: 6px 0; border-bottom: 1px solid #E8E4DC; display: flex; gap: 8px; }
        .plan-feat::before { content: '✓'; color: #C8A96E; font-weight: 600; flex-shrink: 0; }
        .featured .plan-feat { color: rgba(255,255,255,.75); border-bottom-color: rgba(255,255,255,.08); }
        .plan-feats { margin-bottom: 1.5rem; }
        .plan-btn { width: 100%; padding: 11px; border-radius: 4px; border: 1px solid #0F1923; background: transparent; color: #0F1923; font-size: 13px; font-weight: 500; font-family: 'DM Sans', sans-serif; cursor: pointer; transition: all .2s; letter-spacing: .02em; }
        .plan-btn:hover { background: #0F1923; color: #F7F5F0; }
        .featured .plan-btn { background: #C8A96E; border-color: #C8A96E; color: #0F1923; }
        .featured .plan-btn:hover { background: #B8996E; }

        /* ── TRUST / ROI ── */
        .trust-section { padding: 6rem 3rem; }
        .trust-inner { max-width: 1100px; margin: 0 auto; display: grid; grid-template-columns: 1fr 1fr; gap: 5rem; align-items: center; }
        .roi-box { background: #0F1923; border-radius: 8px; padding: 2.5rem; position: relative; overflow: hidden; }
        .roi-box::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px; background: linear-gradient(90deg, #C8A96E, transparent); }
        .roi-eyebrow { font-family: 'JetBrains Mono', monospace; font-size: 10px; letter-spacing: .12em; text-transform: uppercase; color: #C8A96E; margin-bottom: 1.25rem; }
        .roi-title { font-family: 'Cormorant Garamond', serif; font-size: 1.7rem; font-weight: 500; color: #F7F5F0; line-height: 1.2; letter-spacing: -.02em; margin-bottom: .75rem; }
        .roi-title em { font-style: italic; color: #C8A96E; }
        .roi-desc { font-size: 13px; color: rgba(255,255,255,.4); line-height: 1.6; margin-bottom: 2rem; }
        .roi-row { display: flex; justify-content: space-between; align-items: center; padding: .875rem 1rem; background: rgba(255,255,255,.04); border-radius: 4px; margin-bottom: 8px; }
        .roi-label { font-size: 12px; color: rgba(255,255,255,.4); }
        .roi-val { font-family: 'JetBrains Mono', monospace; font-size: 13px; font-weight: 500; color: #C8A96E; }
        .trust-cards { display: flex; flex-direction: column; gap: 12px; }
        .trust-card { background: #F7F5F0; border: 1px solid #E8E4DC; border-radius: 6px; padding: 1.25rem 1.5rem; transition: all .2s; }
        .trust-card:hover { box-shadow: 0 4px 16px rgba(15,25,35,.06); transform: translateX(4px); }
        .tc-eyebrow { font-family: 'JetBrains Mono', monospace; font-size: 10px; letter-spacing: .1em; text-transform: uppercase; color: #C8A96E; margin-bottom: .375rem; }
        .tc-title { font-size: 14px; font-weight: 500; color: #0F1923; margin-bottom: .25rem; }
        .tc-desc { font-size: 13px; color: #6B6B6E; line-height: 1.5; }

        /* ── CTA ── */
        .cta-section { background: #0F1923; padding: 7rem 3rem; text-align: center; position: relative; overflow: hidden; }
        .cta-section::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px; background: linear-gradient(90deg, transparent, #C8A96E 40%, transparent); }
        .cta-inner { max-width: 600px; margin: 0 auto; position: relative; }
        .cta-eyebrow { font-family: 'JetBrains Mono', monospace; font-size: 10px; letter-spacing: .16em; text-transform: uppercase; color: #C8A96E; margin-bottom: 1.5rem; display: block; }
        .cta-h2 { font-family: 'Cormorant Garamond', serif; font-size: clamp(2.5rem, 5vw, 4rem); font-weight: 500; color: #F7F5F0; letter-spacing: -.03em; line-height: 1.08; margin-bottom: 1.25rem; }
        .cta-h2 em { font-style: italic; color: #C8A96E; }
        .cta-sub { font-size: 15px; color: rgba(255,255,255,.4); line-height: 1.7; margin-bottom: 2.5rem; font-weight: 300; }
        .cta-actions { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; margin-bottom: 1rem; }
        .btn-wa {
          padding: 13px 24px; background: #25D366; color: #fff;
          border: none; border-radius: 4px; font-size: 14px; font-weight: 500;
          font-family: 'DM Sans', sans-serif; cursor: pointer;
          display: inline-flex; align-items: center; gap: 10px;
          transition: all .2s; letter-spacing: .01em;
        }
        .btn-wa:hover { background: #20BD5C; transform: translateY(-1px); }
        .btn-wa svg { flex-shrink: 0; }
        .cta-disclaimer { font-size: 11px; color: rgba(255,255,255,.2); font-family: 'JetBrains Mono', monospace; letter-spacing: .06em; }

        /* ── FOOTER ── */
        footer { background: #0A1118; padding: 2.5rem 3rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; border-top: 1px solid rgba(255,255,255,.05); }
        .footer-logo { font-family: 'Cormorant Garamond', serif; font-size: 1.1rem; font-weight: 500; color: rgba(255,255,255,.6); }
        .footer-logo span { color: #C8A96E; }
        .footer-links { display: flex; gap: 2rem; flex-wrap: wrap; }
        .footer-links a { font-size: 12px; color: rgba(255,255,255,.25); transition: color .2s; }
        .footer-links a:hover { color: rgba(255,255,255,.6); }
        .footer-copy { font-family: 'JetBrains Mono', monospace; font-size: 10px; color: rgba(255,255,255,.15); letter-spacing: .06em; }

        /* ── WHATSAPP FLOTANTE ── */
        .wa-float {
          position: fixed; bottom: 28px; right: 28px; z-index: 1000;
          width: 56px; height: 56px; border-radius: 50%;
          background: #25D366; display: flex; align-items: center; justify-content: center;
          box-shadow: 0 8px 28px rgba(37,211,102,.35);
          transition: all .2s; cursor: pointer;
        }
        .wa-float:hover { background: #20BD5C; transform: scale(1.08); box-shadow: 0 12px 36px rgba(37,211,102,.45); }
        .wa-tooltip {
          position: absolute; right: 66px; top: 50%; transform: translateY(-50%);
          background: #0F1923; color: #F7F5F0; font-size: 12px;
          padding: 6px 12px; border-radius: 4px; white-space: nowrap;
          font-family: 'DM Sans', sans-serif; opacity: 0; pointer-events: none;
          transition: opacity .2s;
        }
        .wa-float:hover .wa-tooltip { opacity: 1; }

        @media (max-width: 900px) {
          nav { padding: 0 1.5rem; }
          .nav-links { display: none; }
          .hero { grid-template-columns: 1fr; padding: 100px 1.5rem 4rem; }
          .hero-right { display: none; }
          .section { padding: 4rem 1.5rem; }
          .problema-grid, .leyes-grid, .modulos-grid, .precios-grid, .trust-inner { grid-template-columns: 1fr; }
          .precios-grid { grid-template-columns: 1fr; }
          .precio-card.featured { transform: none; }
          .cta-section { padding: 5rem 1.5rem; }
          footer { flex-direction: column; text-align: center; padding: 2rem 1.5rem; }
        }
      `}</style>

      {/* NAV */}
      <nav>
        <div className="nav-logo">norm<span>via</span></div>
        <div className="nav-links">
          <a href="#problema">El problema</a>
          <a href="#modulos">Módulos</a>
          <a href="#precios">Precios</a>
          <a href="#contacto">Contacto</a>
          <a href="/dashboard" className="dashboard-link">Plataforma →</a>
        </div>
        <a href="#contacto" className="nav-cta">Agendar demo</a>
      </nav>

      {/* HERO */}
      <section style={{ background: '#F7F5F0', borderBottom: '1px solid #E8E4DC' }}>
        <div className="hero">
          <div>
            <div className="hero-eyebrow">Auditoría laboral preventiva</div>
            <h1 className="hero-h1">
              Saber si tu empresa<br /><em>cumple la ley</em><br />antes de la multa.
            </h1>
            <div className="hero-rule" />
            <p className="hero-sub">
              Normvia monitorea en tiempo real el cumplimiento laboral y societario de tu empresa en Chile y Colombia. Diagnósticos automáticos, alertas proactivas, sin estudios de abogados.
            </p>
            <div className="hero-actions">
              <a href={`${WA_URL}`} className="btn-primary">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.118 1.526 5.847L.057 23.882l6.196-1.624A11.954 11.954 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.005-1.367l-.359-.213-3.717.975.993-3.631-.234-.373A9.818 9.818 0 1112 21.818z"/></svg>
                Hablar por WhatsApp
              </a>
              <a href="#modulos" className="btn-ghost">Ver qué incluye ↓</a>
            </div>
            <div className="hero-stats">
              <div><div className="hero-stat-num">60 UTM</div><div className="hero-stat-lbl">Multa máxima DT por infracción</div></div>
              <div><div className="hero-stat-num">40%</div><div className="hero-stat-lbl">Finiquitos con errores en Chile</div></div>
              <div><div className="hero-stat-num">2</div><div className="hero-stat-lbl">Países. Chile y Colombia</div></div>
            </div>
          </div>

          <div className="hero-right">
            <div className="platform-label">Panel en tiempo real</div>
            <div className="alert-card"><div className="ac-dot r" /><div><div className="ac-title">Protocolo Ley Karin no implementado</div><div className="ac-desc">Obligatorio desde agosto 2024. Riesgo de multa directa.</div></div></div>
            <div className="alert-card"><div className="ac-dot a" /><div><div className="ac-title">12 contratos con jornada desactualizada</div><div className="ac-desc">Jornada máxima es 42h desde abril 2026.</div></div></div>
            <div className="alert-card"><div className="ac-dot r" /><div><div className="ac-title">F30 de Constructora Norte vencido</div><div className="ac-desc">Responsabilidad solidaria activa.</div></div></div>
            <div className="alert-card"><div className="ac-dot v" /><div><div className="ac-title">Finiquito Juan Pérez — sin errores</div><div className="ac-desc">Cotizaciones al día. Listo para firma.</div></div></div>
          </div>
        </div>
      </section>

      {/* PROBLEMA */}
      <section className="section" id="problema">
        <div className="section-inner">
          <div className="section-eyebrow reveal">El problema</div>
          <h2 className="section-h2 reveal">Las pymes descubren<br />los problemas <em>tarde.</em></h2>
          <p className="section-lead reveal">No es mala intención. Es que no existe un lugar simple donde una empresa mediana pueda saber exactamente qué obligaciones tiene y si las cumple.</p>
          <div className="problema-grid reveal">
            <div className="problema-item"><div className="prob-num">01 — El momento</div><div className="prob-title">Se enteran cuando llega la DT</div><div className="prob-desc">Las empresas descubren sus brechas cuando reciben una fiscalización o una demanda. Para entonces, el costo es entre 5 y 10 veces mayor.</div></div>
            <div className="problema-item"><div className="prob-num">02 — La dispersión</div><div className="prob-title">Todo está en lugares distintos</div><div className="prob-desc">Contratos en Drive, liquidaciones en el contador, finiquitos en papel. Nadie tiene la foto completa del cumplimiento en un solo lugar.</div></div>
            <div className="problema-item"><div className="prob-num">03 — El costo</div><div className="prob-title">Las auditorías son inaccesibles</div><div className="prob-desc">Una auditoría laboral con un estudio de abogados cuesta entre $5M y $20M CLP. Y es manual, esporádica y lenta.</div></div>
          </div>
        </div>
      </section>

      {/* LEYES */}
      <section className="leyes-section">
        <div className="leyes-inner">
          <div className="leyes-eyebrow reveal">Contexto regulatorio</div>
          <h2 className="leyes-h2 reveal">Las leyes que están<br />cambiando <em>todo</em> ahora.</h2>
          <div className="leyes-grid reveal">
            <div className="ley-card">
              <div className="ley-top"><div><div className="ley-name">Ley Karin</div><div className="ley-num">N° 21.643</div></div><span className="ley-badge">Vigente ago. 2024</span></div>
              <div className="ley-desc">Prevención, investigación y sanción del acoso laboral y sexual. Aplica a todas las empresas, sin excepción de tamaño.</div>
              <div className="ley-item">Protocolo de prevención obligatorio</div>
              <div className="ley-item">Canal de denuncia formal y confidencial</div>
              <div className="ley-item">Investigar en máximo 30 días hábiles</div>
              <div className="ley-item">Comunicación semestral a trabajadores</div>
              <div className="ley-multa">Incumplimiento: <strong>multas + tutela laboral</strong></div>
            </div>
            <div className="ley-card">
              <div className="ley-top"><div><div className="ley-name">Ley 40 Horas</div><div className="ley-num">N° 21.561</div></div><span className="ley-badge">42h desde abr. 2026</span></div>
              <div className="ley-desc">Reducción gradual de la jornada laboral de 45 a 40 horas semanales. Ya está en implementación.</div>
              <div className="ley-item">Abril 2026: jornada máxima 42 horas</div>
              <div className="ley-item">Contratos deben actualizarse con anexo</div>
              <div className="ley-item">Recalcular horas extraordinarias</div>
              <div className="ley-item">2028: llegará a 40 horas semanales</div>
              <div className="ley-multa">Contrato desactualizado: <strong>infracción por trabajador</strong></div>
            </div>
            <div className="ley-card">
              <div className="ley-top"><div><div className="ley-name">Finiquitos</div><div className="ley-num">Código del Trabajo</div></div><span className="ley-badge">Error en 30-40%</span></div>
              <div className="ley-desc">El proceso de desvinculación sigue siendo la principal fuente de litigios laborales en Chile.</div>
              <div className="ley-item">Causales de término mal aplicadas</div>
              <div className="ley-item">Cálculo incorrecto de indemnizaciones</div>
              <div className="ley-item">Cotizaciones impagas invalidan el finiquito</div>
              <div className="ley-item">Sin ministro de fe: sin efecto liberatorio</div>
              <div className="ley-multa">Finiquito inválido: <strong>demanda por diferencias</strong></div>
            </div>
            <div className="ley-card">
              <div className="ley-top"><div><div className="ley-name">Subcontratación</div><div className="ley-num">Ley N° 20.123</div></div><span className="ley-badge">Resp. solidaria</span></div>
              <div className="ley-desc">La empresa principal responde por las deudas laborales de sus contratistas si no verifica su cumplimiento.</div>
              <div className="ley-item">F30 y F30-1 vigentes por contratista</div>
              <div className="ley-item">Verificación mensual de vencimientos</div>
              <div className="ley-item">Responsabilidad solidaria ante trabajadores</div>
              <div className="ley-item">Registro centralizado de contratistas</div>
              <div className="ley-multa">F30 vencido: <strong>demandas de trabajadores del contratista</strong></div>
            </div>
          </div>
        </div>
      </section>

      {/* MÓDULOS */}
      <section className="modulos-section" id="modulos">
        <div className="modulos-inner">
          <div className="section-eyebrow reveal">La plataforma</div>
          <h2 className="section-h2 reveal">Todo lo que necesitas<br />para <em>cumplir</em>, en un solo lugar.</h2>
          <p className="section-lead reveal">No es una consultoría. Es un sistema que trabaja todos los días monitoreando tu cumplimiento y alertándote antes de que llegue el problema.</p>
          <div className="modulos-grid reveal">
            {[
              { n: '01', name: 'Ley Karin', desc: 'Verifica cada obligación de la Ley Karin con trazabilidad completa y canal de denuncias anónimo integrado.', feats: ['Diagnóstico del protocolo vigente', 'Canal de denuncia con código de seguimiento', 'Seguimiento de casos y estados', 'Reporte de cumplimiento exportable'] },
              { n: '02', name: 'Ley 40 Horas', desc: 'Detecta contratos desactualizados y calcula correctamente la jornada con la normativa vigente.', feats: ['Revisión masiva de contratos', 'Generador de anexos actualizados', 'Cálculo de horas extraordinarias', 'Alertas de cambios futuros de jornada'] },
              { n: '03', name: 'Finiquitos', desc: 'Valida cada finiquito antes de la firma y calcula los montos correctos según la causal de término.', feats: ['Validación pre-firma completa', 'Simulador de indemnizaciones', 'Verificación Ley Bustos', 'Historial auditado de finiquitos'] },
              { n: '04', name: 'Subcontratación', desc: 'Monitorea los certificados F30 de tus contratistas y te avisa antes de que venzan.', feats: ['Registro de contratistas activos', 'Alertas de vencimiento F30/F30-1', 'Control de responsabilidad solidaria', 'Dashboard de estado por contratista'] },
              { n: '05', name: 'Societario', desc: 'Gestiona accionistas, asambleas, estatutos y resuelve conflictos antes de llegar a juicio.', feats: ['Libro de accionistas y transferencias', 'Asambleas con notificación automática', 'Resolución de conflictos con IA', 'Estatutos editables con historial'] },
              { n: '06', name: 'Asistente Jurídico IA', desc: 'Chat especializado en derecho laboral y societario chileno y colombiano, disponible 24/7.', feats: ['Respuestas con referencias legales', 'Contexto específico de tu empresa', 'Derivación a especialistas humanos', 'Disponible en todos los módulos'] },
            ].map(m => (
              <div key={m.n} className="modulo-card">
                <div className="mod-num">{m.n}</div>
                <div className="mod-name">{m.name}</div>
                <div className="mod-desc">{m.desc}</div>
                {m.feats.map(f => <div key={f} className="mod-feature">{f}</div>)}
                <div className="mod-arrow">↗</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRECIOS */}
      <section className="precios-section" id="precios">
        <div className="precios-inner">
          <div className="section-eyebrow reveal">Precios</div>
          <h2 className="section-h2 reveal">Una multa de la DT cuesta<br /><em>más</em> que un año de Normvia.</h2>
          <p className="section-lead reveal">Sin contratos a largo plazo. Cancela cuando quieras. Agenda una demo y vemos juntos qué plan tiene sentido para tu empresa.</p>
          <div className="precios-grid reveal">
            {[
              { name: 'Starter', price: '$150.000', period: 'CLP / mes', size: '1–50 trabajadores', feats: ['Módulo Ley Karin', 'Módulo 40 Horas', 'Módulo Finiquitos', 'Dashboard básico', 'Asistente jurídico IA'], featured: false },
              { name: 'Professional', price: '$300.000', period: 'CLP / mes', size: '51–200 trabajadores', feats: ['Todo lo del plan Starter', 'Módulo Subcontratación', 'Módulo Documentación', 'Módulo Societario completo', 'Alertas de vencimiento', 'Derivación a abogados'], featured: true },
              { name: 'Enterprise', price: 'A medida', period: 'según dotación', size: '200+ trabajadores', feats: ['Todo lo del plan Professional', 'Integraciones API (Buk, Talana)', 'Soporte prioritario dedicado', 'Reportes personalizados', 'Onboarding con abogado'], featured: false },
            ].map(p => (
              <div key={p.name} className={`precio-card${p.featured ? ' featured' : ''}`}>
                {p.featured && <div className="featured-tag">MÁS POPULAR</div>}
                <div className="plan-name">{p.name}</div>
                <div className="plan-price">{p.price}</div>
                <div className="plan-period">{p.period}</div>
                <div className="plan-size">{p.size}</div>
                <div className="plan-feats">{p.feats.map(f => <div key={f} className="plan-feat">{f}</div>)}</div>
                <button className="plan-btn" onClick={() => window.open(WA_URL, '_blank')}>
                  {p.name === 'Enterprise' ? 'Solicitar cotización →' : 'Agendar demo →'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* NORMATIVAS QUE CUBRIMOS */}
      <section style={{ padding: '6rem 3rem', background: '#0F1923', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, transparent, #C8A96E 40%, transparent)' }} />
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5rem', alignItems: 'center' }}>
            <div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', letterSpacing: '.16em', textTransform: 'uppercase', color: '#C8A96E', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ display: 'inline-block', width: '24px', height: '1px', background: '#C8A96E' }} />
                Normativa vigente 2024–2026
              </div>
              <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(2rem, 3.5vw, 2.8rem)', fontWeight: 500, color: '#F7F5F0', lineHeight: 1.1, letterSpacing: '-.02em', marginBottom: '1rem' }}>
                Normvia cubre <em style={{ fontStyle: 'italic', color: '#C8A96E' }}>todas</em> las leyes laborales vigentes en Chile.
              </h2>
              <p style={{ fontSize: '14px', color: 'rgba(255,255,255,.4)', lineHeight: 1.75, marginBottom: '2rem' }}>
                No solo las más conocidas. Cuando entra en vigor una nueva ley laboral, Normvia se actualiza antes de que te fiscalicen.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  { ley: 'Ley N° 21.643', nombre: 'Ley Karin', estado: 'Vigente ago. 2024', desc: 'Prevención y sanción del acoso laboral y sexual' },
                  { ley: 'Ley N° 21.561', nombre: 'Ley 40 Horas', estado: '42h desde abr. 2026', desc: 'Reducción gradual de la jornada laboral' },
                  { ley: 'Ley N° 21.645', nombre: 'Conciliación Familiar', estado: 'Vigente ene. 2024', desc: 'Teletrabajo para padres/madres con hijos menores de 14 años' },
                  { ley: 'Ley N° 21.719', nombre: 'Protección de Datos', estado: 'Vigente dic. 2026', desc: 'Derechos ARCO+ y canal de solicitudes para trabajadores' },
                  { ley: 'Ley N° 21.735', nombre: 'Reforma Previsional', estado: 'Vigente mar. 2025', desc: 'Nueva cotización de cargo del empleador' },
                  { ley: 'Ley N° 20.123', nombre: 'Subcontratación', estado: 'Vigente', desc: 'F30/F30-1 y responsabilidad solidaria' },
                ].map(l => (
                  <div key={l.ley} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '10px 14px', background: 'rgba(255,255,255,.04)', borderRadius: '6px', border: '1px solid rgba(255,255,255,.06)' }}>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#C8A96E', flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '13px', fontWeight: 500, color: '#F7F5F0' }}>{l.nombre} <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', color: 'rgba(255,255,255,.3)', letterSpacing: '.04em' }}>{l.ley}</span></div>
                      <div style={{ fontSize: '11px', color: 'rgba(255,255,255,.35)', marginTop: '1px' }}>{l.desc}</div>
                    </div>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', padding: '2px 8px', border: '1px solid rgba(200,169,110,.3)', borderRadius: '2px', color: '#C8A96E', whiteSpace: 'nowrap' }}>{l.estado}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Badges de cumplimiento de Normvia */}
            <div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', letterSpacing: '.16em', textTransform: 'uppercase', color: '#C8A96E', marginBottom: '1.5rem' }}>
                Normvia como plataforma cumple
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '2rem' }}>
                {[
                  { icon: '🔐', titulo: 'Ley N° 21.719 — Protección de Datos', desc: 'Política de privacidad vigente. Canal ARCO+ activo. Notificación de brechas en 72h. Datos cifrados en tránsito y en reposo.', ok: true },
                  { icon: '⚖️', titulo: 'Ley Karin — Cumplimiento interno', desc: 'Normvia tiene protocolo interno de prevención de acoso, canal de denuncia confidencial y capacitaciones periódicas al equipo.', ok: true },
                  { icon: '🏛️', titulo: 'Proveedor de datos verificado', desc: 'Infraestructura en Supabase (SOC 2 Type II) y Vercel. Normvia actúa como encargado del tratamiento de datos de sus clientes.', ok: true },
                  { icon: '📋', titulo: 'Términos y política publicados', desc: 'Disponibles en normvia.cl/privacidad y normvia.cl/terminos. Actualizados a la normativa vigente de diciembre 2026.', ok: true },
                ].map(b => (
                  <div key={b.titulo} style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderRadius: '8px', padding: '14px 16px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <div style={{ fontSize: '20px', flexShrink: 0 }}>{b.icon}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '13px', fontWeight: 500, color: '#F7F5F0', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {b.titulo}
                        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '9px', padding: '1px 6px', background: 'rgba(0,184,122,.15)', border: '1px solid rgba(0,184,122,.3)', borderRadius: '2px', color: '#00B87A' }}>✓ CUMPLE</span>
                      </div>
                      <div style={{ fontSize: '12px', color: 'rgba(255,255,255,.35)', lineHeight: 1.5 }}>{b.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ background: 'rgba(200,169,110,.08)', border: '1px solid rgba(200,169,110,.2)', borderRadius: '8px', padding: '14px 18px', fontSize: '13px', color: 'rgba(255,255,255,.5)', lineHeight: 1.6 }}>
                📄 <a href="/privacidad" style={{ color: '#C8A96E', textDecoration: 'underline' }}>Política de privacidad</a> · <a href="/terminos" style={{ color: '#C8A96E', textDecoration: 'underline' }}>Términos de uso</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PORTAL TRABAJADOR */}
      <section style={{ padding: '6rem 3rem', background: '#F7F5F0', borderBottom: '1px solid #E8E4DC' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5rem', alignItems: 'center' }}>
            <div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', letterSpacing: '.16em', textTransform: 'uppercase', color: '#C8A96E', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ display: 'inline-block', width: '24px', height: '1px', background: '#C8A96E' }} />
                Nuevo · Portal Trabajador
              </div>
              <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(2rem, 3.5vw, 2.8rem)', fontWeight: 500, color: '#0F1923', lineHeight: 1.1, letterSpacing: '-.02em', marginBottom: '1rem' }}>
                Tu empresa paga. <em style={{ fontStyle: 'italic', color: '#1A2E44' }}>Tus trabajadores</em> acceden gratis.
              </h2>
              <p style={{ fontSize: '14px', color: '#6B6B6E', lineHeight: 1.75, marginBottom: '2rem' }}>
                Con cada plan de Normvia, tus trabajadores reciben acceso a su propio portal. Un código único los identifica — sin datos personales expuestos, sin costo adicional. Es un beneficio laboral concreto que también protege a tu empresa.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '2rem' }}>
                {[
                  { icon: '⚖️', t: 'Canal de denuncias Ley Karin', d: 'Anónimo, con código de seguimiento. Cumples la ley sin intermediarios.' },
                  { icon: '🏡', t: 'Solicitud de teletrabajo (Ley 21.645)', d: 'El trabajador solicita, RRHH responde. Todo queda registrado.' },
                  { icon: '🔐', t: 'Ejercicio de derechos ARCO+ (Ley 21.719)', d: 'Acceso, rectificación, eliminación de sus datos. Plazo de 30 días visible.' },
                  { icon: '💬', t: 'Asistente legal IA', d: 'Dudas sobre finiquito, jornada, teletrabajo — respondidas 24/7.' },
                ].map(f => (
                  <div key={f.t} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <div style={{ fontSize: '16px', marginTop: '2px', flexShrink: 0 }}>{f.icon}</div>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 500, color: '#0F1923', marginBottom: '2px' }}>{f.t}</div>
                      <div style={{ fontSize: '12px', color: '#8B8FA8', lineHeight: 1.5 }}>{f.d}</div>
                    </div>
                  </div>
                ))}
              </div>
              <a href={`https://wa.me/56990226972?text=Hola%2C%20quiero%20saber%20m%C3%A1s%20sobre%20el%20Portal%20Trabajador%20de%20Normvia`} target="_blank" rel="noopener noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 22px', background: '#0F1923', color: '#F7F5F0', borderRadius: '4px', fontSize: '13px', fontWeight: 500, textDecoration: 'none', letterSpacing: '.02em' }}>
                Saber más por WhatsApp →
              </a>
            </div>
            <div>
              {/* Mock del portal trabajador */}
              <div style={{ background: '#0F1923', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 24px 64px rgba(15,25,35,.2)' }}>
                <div style={{ background: '#0A1118', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,.06)' }}>
                  <div style={{ fontFamily: 'Georgia, serif', fontSize: '13px', color: '#fff' }}>norm<span style={{ color: '#C8A96E' }}>via</span> <span style={{ fontSize: '10px', color: 'rgba(255,255,255,.3)' }}>· Portal Trabajador</span></div>
                  <div style={{ display: 'flex', gap: '5px' }}>{['#FF5F57','#FFBD2E','#28C840'].map(c => <div key={c} style={{ width: '10px', height: '10px', borderRadius: '50%', background: c }} />)}</div>
                </div>
                <div style={{ padding: '1.5rem' }}>
                  <div style={{ fontSize: '14px', fontWeight: 500, color: '#fff', marginBottom: '4px' }}>Hola, María 👋</div>
                  <div style={{ fontSize: '12px', color: 'rgba(255,255,255,.4)', marginBottom: '1.25rem' }}>¿En qué podemos ayudarte hoy?</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    {[
                      { icon: '⚖️', t: 'Hacer una denuncia', c: '#E5484D' },
                      { icon: '🏡', t: 'Solicitar teletrabajo', c: '#6366F1' },
                      { icon: '🔐', t: 'Ejercer derechos ARCO+', c: '#00B87A' },
                      { icon: '💬', t: 'Consultar asistente legal', c: '#F59E0B' },
                    ].map(o => (
                      <div key={o.t} style={{ background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.08)', borderRadius: '8px', padding: '12px', cursor: 'pointer' }}>
                        <div style={{ fontSize: '16px', marginBottom: '6px' }}>{o.icon}</div>
                        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,.7)', lineHeight: 1.3 }}>{o.t}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop: '12px', background: 'rgba(0,184,122,.1)', border: '1px solid rgba(0,184,122,.2)', borderRadius: '6px', padding: '10px 12px', fontSize: '11px', color: 'rgba(255,255,255,.5)', lineHeight: 1.5 }}>
                    🔒 Tu privacidad está protegida · Ley N° 21.719
                  </div>
                </div>
                <div style={{ padding: '10px 16px', borderTop: '1px solid rgba(255,255,255,.04)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '10px', color: 'rgba(255,255,255,.2)', fontFamily: "'JetBrains Mono', monospace" }}>normvia.cl/trabajador</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#00B87A' }} />
                    <span style={{ fontSize: '10px', color: 'rgba(255,255,255,.3)' }}>Empresa Ejemplo SpA</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST / ROI */}
      <section className="trust-section">
        <div className="trust-inner reveal">
          <div>
            <div className="roi-box">
              <div className="roi-eyebrow">Retorno de inversión</div>
              <div className="roi-title">El plan Professional<br />se paga con <em>una</em><br />multa evitada.</div>
              <div className="roi-desc">Una empresa mediana que invierte $300.000 mensuales en Normvia obtiene:</div>
              <div className="roi-row"><span className="roi-label">Ahorro en auditorías externas</span><span className="roi-val">$15M–$30M / año</span></div>
              <div className="roi-row"><span className="roi-label">Multa DT evitada</span><span className="roi-val">$4M–$10M c/u</span></div>
              <div className="roi-row"><span className="roi-label">Demanda laboral evitada</span><span className="roi-val">$2M–$8M c/u</span></div>
              <div className="roi-row"><span className="roi-label">Payback estimado</span><span className="roi-val">2 a 4 meses</span></div>
            </div>
          </div>
          <div className="trust-cards">
            {[
              { ey: 'Respaldo jurídico', title: 'Diseñado por especialistas en derecho laboral', desc: 'Cada módulo fue construido sobre criterios reales de cumplimiento, no sobre supuestos genéricos.' },
              { ey: 'Actualización permanente', title: 'Siempre al día con la normativa', desc: 'Cuando cambia la ley, Normvia se actualiza. Las alertas y diagnósticos reflejan siempre la normativa vigente.' },
              { ey: 'Sin fricción técnica', title: 'Para RRHH, no para ingenieros', desc: 'Diseñado para encargados de recursos humanos y administradores. Funcional desde el primer día.' },
              { ey: 'Chile y Colombia', title: 'LATAM desde el primer día', desc: 'Módulos adaptados a Ley Karin (CL) y Ley 1010 (CO). Expandiéndose a Perú y México.' },
            ].map(t => (
              <div key={t.title} className="trust-card">
                <div className="tc-eyebrow">{t.ey}</div>
                <div className="tc-title">{t.title}</div>
                <div className="tc-desc">{t.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section" id="contacto">
        <div className="cta-inner">
          <span className="cta-eyebrow">Conversemos</span>
          <h2 className="cta-h2 reveal">Agenda una demo<br /><em>sin compromiso.</em></h2>
          <p className="cta-sub reveal">Te mostramos la plataforma con un caso real de tu rubro. Si tiene sentido para tu empresa, lo sabemos en 30 minutos.</p>
          <div className="cta-actions reveal">
            <a href={WA_URL} target="_blank" rel="noopener noreferrer" className="btn-wa">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.118 1.526 5.847L.057 23.882l6.196-1.624A11.954 11.954 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.005-1.367l-.359-.213-3.717.975.993-3.631-.234-.373A9.818 9.818 0 1112 21.818z"/></svg>
              Escribir por WhatsApp
            </a>
            <a href="mailto:contacto@normvia.cl" className="btn-primary" style={{ background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.15)' }}>
              contacto@normvia.cl
            </a>
          </div>
          <div className="cta-disclaimer">Te respondemos en menos de 24 horas hábiles</div>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="footer-logo">norm<span>via</span></div>
        <div className="footer-links">
          <a href="#problema">El problema</a>
          <a href="#modulos">Módulos</a>
          <a href="#precios">Precios</a>
          <a href="mailto:contacto@normvia.cl">contacto@normvia.cl</a>
          <a href="/dashboard">Plataforma</a>
          <a href="/privacidad">Privacidad</a>
          <a href="/terminos">Términos</a>
        </div>
        <div className="footer-copy">© 2026 NORMVIA · CHILE · COLOMBIA</div>
      </footer>

      {/* WHATSAPP FLOTANTE */}
      <a href={WA_URL} target="_blank" rel="noopener noreferrer" className="wa-float" aria-label="Contactar por WhatsApp">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.118 1.526 5.847L.057 23.882l6.196-1.624A11.954 11.954 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.005-1.367l-.359-.213-3.717.975.993-3.631-.234-.373A9.818 9.818 0 1112 21.818z"/></svg>
        <span className="wa-tooltip">¿Hablamos?</span>
      </a>
    </>
  )
}
