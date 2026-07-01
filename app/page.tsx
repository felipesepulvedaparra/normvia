'use client'
import { useEffect } from 'react'

export default function LandingPage() {
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible') })
    }, { threshold: 0.1 })
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el))

    function onScroll() {
      const nav = document.querySelector('nav') as HTMLElement
      if (nav) nav.style.boxShadow = window.scrollY > 20 ? '0 2px 20px rgba(10,10,12,.1)' : 'none'
    }
    window.addEventListener('scroll', onScroll)
    return () => { observer.disconnect(); window.removeEventListener('scroll', onScroll) }
  }, [])

  return (
    <>
      <style jsx global>{`
        :root {
          --ink: #0A0A0C; --paper: #F5F3EE; --cream: #EBE8E0;
          --azul: #0B3D6B; --azul2: #1A5F9E; --acento: #00C896;
          --rojo: #D94040; --muted: #6B6868; --line: rgba(10,10,12,.1); --white: #FFFFFF;
        }
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { font-family: 'DM Sans', sans-serif; background: var(--paper); color: var(--ink); overflow-x: hidden; }
        .serif { font-family: 'Playfair Display', serif; }
        nav { position: fixed; top: 0; left: 0; right: 0; z-index: 100; padding: 1.25rem 3rem; display: flex; align-items: center; justify-content: space-between; background: rgba(245,243,238,.92); backdrop-filter: blur(12px); border-bottom: 1px solid var(--line); transition: all .3s; }
        .nav-logo { font-family: 'Playfair Display', serif; font-size: 1.4rem; font-weight: 700; color: var(--azul); letter-spacing: -.02em; }
        .nav-logo em { color: var(--acento); font-style: normal; }
        .nav-links { display: flex; align-items: center; gap: 2.5rem; }
        .nav-links a { font-size: 13px; font-weight: 500; color: var(--muted); text-decoration: none; letter-spacing: .02em; transition: color .2s; }
        .nav-links a:hover { color: var(--ink); }
        .nav-cta { padding: 9px 22px; background: var(--azul); color: var(--white); border-radius: 8px; font-size: 13px; font-weight: 500; text-decoration: none; transition: all .2s; border: 1.5px solid var(--azul); }
        .nav-cta:hover { background: transparent; color: var(--azul); }
        .hero { min-height: 100vh; display: grid; grid-template-columns: 1fr 1fr; position: relative; overflow: hidden; }
        .hero-left { background: var(--azul); padding: 10rem 4rem 5rem; display: flex; flex-direction: column; justify-content: center; position: relative; overflow: hidden; }
        .hero-left::before { content: ''; position: absolute; inset: 0; background: radial-gradient(ellipse at 20% 80%, rgba(0,200,150,.15) 0%, transparent 60%); }
        .hero-left::after { content: 'N'; font-family: 'Playfair Display', serif; font-size: 32rem; font-weight: 900; color: rgba(255,255,255,.025); position: absolute; right: -4rem; bottom: -6rem; line-height: 1; pointer-events: none; animation: floatN 8s ease-in-out infinite; }
        @keyframes floatN { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-20px); } }
        .hero-eyebrow { display: inline-flex; align-items: center; gap: 8px; font-size: 11px; font-weight: 600; letter-spacing: .12em; text-transform: uppercase; color: var(--acento); margin-bottom: 1.75rem; position: relative; }
        .hero-eyebrow::before { content: ''; width: 28px; height: 1px; background: var(--acento); }
        .hero-h1 { font-family: 'Playfair Display', serif; font-size: clamp(2.8rem, 5vw, 4.2rem); font-weight: 900; line-height: 1.06; color: var(--white); letter-spacing: -.03em; margin-bottom: 1.75rem; position: relative; }
        .hero-h1 em { font-style: italic; color: var(--acento); }
        .hero-h1 .underline-word { position: relative; display: inline-block; }
        .hero-h1 .underline-word::after { content: ''; position: absolute; left: 0; bottom: -4px; width: 100%; height: 3px; background: var(--acento); border-radius: 2px; transform: scaleX(0); transform-origin: left; animation: slideIn 1s .8s ease forwards; }
        @keyframes slideIn { to { transform: scaleX(1); } }
        .hero-sub { font-size: 16px; line-height: 1.7; color: rgba(255,255,255,.6); max-width: 420px; margin-bottom: 2.5rem; position: relative; }
        .hero-actions { display: flex; gap: 12px; align-items: center; position: relative; flex-wrap: wrap; }
        .btn-hero { padding: 14px 28px; background: var(--acento); color: var(--azul); border: none; border-radius: 10px; font-size: 14px; font-weight: 700; font-family: 'DM Sans', sans-serif; cursor: pointer; text-decoration: none; display: inline-flex; align-items: center; gap: 8px; transition: all .2s; letter-spacing: .01em; }
        .btn-hero:hover { transform: translateY(-2px); box-shadow: 0 8px 32px rgba(0,200,150,.4); }
        .btn-demo { font-size: 13px; font-weight: 500; color: rgba(255,255,255,.6); text-decoration: none; display: flex; align-items: center; gap: 6px; transition: color .2s; }
        .btn-demo:hover { color: rgba(255,255,255,.9); }
        .hero-stats { display: flex; gap: 2rem; margin-top: 3.5rem; padding-top: 2rem; border-top: 1px solid rgba(255,255,255,.1); position: relative; flex-wrap: wrap; }
        .hs-num { font-family: 'Playfair Display', serif; font-size: 1.8rem; font-weight: 900; color: var(--acento); line-height: 1; margin-bottom: 3px; }
        .hs-lbl { font-size: 11px; color: rgba(255,255,255,.4); letter-spacing: .04em; }
        .hero-right { background: var(--cream); padding: 10rem 3rem 5rem 4rem; display: flex; flex-direction: column; justify-content: center; gap: 1rem; border-left: 1px solid var(--line); }
        .alert-card { background: var(--white); border-radius: 16px; padding: 1.125rem 1.25rem; border: 1px solid var(--line); box-shadow: 0 2px 12px rgba(10,10,12,.06); display: flex; align-items: flex-start; gap: 12px; transform: translateX(40px); opacity: 0; animation: slideCard .6s ease forwards; }
        .alert-card:nth-child(1) { animation-delay: .3s; } .alert-card:nth-child(2) { animation-delay: .5s; } .alert-card:nth-child(3) { animation-delay: .7s; } .alert-card:nth-child(4) { animation-delay: .9s; }
        @keyframes slideCard { to { transform: translateX(0); opacity: 1; } }
        .ac-icon { width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 16px; flex-shrink: 0; }
        .ic-r { background: #FDEAEA; } .ic-a { background: #FEF3C7; } .ic-v { background: #DCFCE7; }
        .ac-body { flex: 1; } .ac-title { font-size: 13px; font-weight: 600; color: var(--ink); margin-bottom: 2px; } .ac-desc { font-size: 12px; color: var(--muted); line-height: 1.4; }
        .ac-badge { font-size: 10px; font-weight: 700; padding: 3px 8px; border-radius: 20px; flex-shrink: 0; align-self: flex-start; margin-top: 2px; }
        .b-r { background: #D94040; color: #fff; } .b-a { background: #D97706; color: #fff; } .b-v { background: #16A34A; color: #fff; }
        .platform-label { font-size: 11px; font-weight: 600; letter-spacing: .1em; text-transform: uppercase; color: var(--muted); display: flex; align-items: center; gap: 8px; margin-bottom: .5rem; }
        .platform-label::before, .platform-label::after { content: ''; flex: 1; height: 1px; background: var(--line); }
        .section { padding: 7rem 3rem; } .section-inner { max-width: 1100px; margin: 0 auto; }
        .section-tag { font-size: 11px; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; color: var(--acento); display: flex; align-items: center; gap: 8px; margin-bottom: 1.25rem; }
        .section-tag::before { content: ''; width: 24px; height: 2px; background: var(--acento); }
        .section-h2 { font-family: 'Playfair Display', serif; font-size: clamp(2rem, 4vw, 3.2rem); font-weight: 900; line-height: 1.1; letter-spacing: -.03em; color: var(--ink); margin-bottom: 1.25rem; }
        .section-h2 em { font-style: italic; color: var(--azul2); }
        .section-lead { font-size: 17px; line-height: 1.7; color: var(--muted); max-width: 600px; margin-bottom: 3.5rem; }
        .problemas-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px; background: var(--line); border: 1px solid var(--line); border-radius: 16px; overflow: hidden; }
        .problema-item { background: var(--white); padding: 2rem; transition: background .2s; }
        .problema-item:hover { background: var(--cream); }
        .prob-num { font-family: 'Playfair Display', serif; font-size: 3rem; font-weight: 900; color: var(--cream); line-height: 1; margin-bottom: .75rem; -webkit-text-stroke: 1.5px var(--line); }
        .prob-title { font-size: 15px; font-weight: 600; color: var(--ink); margin-bottom: .5rem; } .prob-desc { font-size: 13px; line-height: 1.6; color: var(--muted); }
        .leyes-section { background: var(--azul); padding: 7rem 3rem; position: relative; overflow: hidden; }
        .leyes-section::before { content: ''; position: absolute; inset: 0; background: radial-gradient(ellipse at 80% 50%, rgba(0,200,150,.08) 0%, transparent 60%); }
        .leyes-inner { max-width: 1100px; margin: 0 auto; position: relative; } .leyes-header { margin-bottom: 3rem; }
        .leyes-tag { font-size: 11px; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; color: var(--acento); display: flex; align-items: center; gap: 8px; margin-bottom: 1.25rem; }
        .leyes-tag::before { content: ''; width: 24px; height: 2px; background: var(--acento); }
        .leyes-h2 { font-family: 'Playfair Display', serif; font-size: clamp(2rem, 3.5vw, 2.8rem); font-weight: 900; color: var(--white); letter-spacing: -.03em; line-height: 1.1; }
        .leyes-h2 em { font-style: italic; color: var(--acento); }
        .leyes-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.25rem; }
        .ley-card { background: rgba(255,255,255,.05); border: 1px solid rgba(255,255,255,.1); border-radius: 16px; padding: 1.75rem; transition: all .2s; }
        .ley-card:hover { background: rgba(255,255,255,.08); border-color: rgba(0,200,150,.3); transform: translateY(-2px); }
        .ley-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem; }
        .ley-name { font-family: 'Playfair Display', serif; font-size: 1.3rem; font-weight: 700; color: var(--white); letter-spacing: -.02em; }
        .ley-numero { font-size: 11px; font-weight: 600; color: rgba(255,255,255,.4); letter-spacing: .06em; }
        .ley-vigencia { display: inline-flex; align-items: center; gap: 5px; font-size: 11px; font-weight: 600; color: var(--acento); background: rgba(0,200,150,.1); border: 1px solid rgba(0,200,150,.2); padding: 3px 10px; border-radius: 20px; }
        .ley-desc { font-size: 13px; line-height: 1.7; color: rgba(255,255,255,.55); margin-bottom: 1.25rem; }
        .ley-items { display: flex; flex-direction: column; gap: 7px; }
        .ley-item { display: flex; align-items: flex-start; gap: 8px; font-size: 12px; color: rgba(255,255,255,.7); line-height: 1.4; }
        .ley-item::before { content: '→'; color: var(--acento); flex-shrink: 0; margin-top: 1px; }
        .ley-multa { margin-top: 1.25rem; padding-top: 1rem; border-top: 1px solid rgba(255,255,255,.08); font-size: 12px; color: rgba(255,255,255,.4); display: flex; align-items: center; gap: 6px; }
        .ley-multa strong { color: #FDA4A4; }
        .modulos-section { padding: 7rem 3rem; background: var(--paper); } .modulos-inner { max-width: 1100px; margin: 0 auto; }
        .modulos-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-top: 3rem; }
        .modulo-card { background: var(--white); border-radius: 16px; padding: 1.75rem; border: 1px solid var(--line); transition: all .25s; position: relative; overflow: hidden; }
        .modulo-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px; background: var(--acento); transform: scaleX(0); transform-origin: left; transition: transform .25s; }
        .modulo-card:hover { transform: translateY(-4px); box-shadow: 0 12px 40px rgba(10,10,12,.1); } .modulo-card:hover::before { transform: scaleX(1); }
        .mod-icon { font-size: 2rem; margin-bottom: 1rem; display: block; }
        .mod-name { font-family: 'Playfair Display', serif; font-size: 1.1rem; font-weight: 700; color: var(--ink); margin-bottom: .5rem; letter-spacing: -.01em; }
        .mod-desc { font-size: 13px; line-height: 1.6; color: var(--muted); margin-bottom: 1.25rem; }
        .mod-features { display: flex; flex-direction: column; gap: 5px; }
        .mod-feature { font-size: 12px; color: var(--ink); display: flex; align-items: center; gap: 6px; }
        .mod-feature::before { content: '✓'; color: var(--acento); font-weight: 700; font-size: 11px; flex-shrink: 0; }
        .precios-section { padding: 7rem 3rem; background: var(--cream); border-top: 1px solid var(--line); border-bottom: 1px solid var(--line); }
        .precios-inner { max-width: 1000px; margin: 0 auto; }
        .precios-grid { display: grid; grid-template-columns: 1fr 1.1fr 1fr; gap: 1rem; margin-top: 3rem; align-items: start; }
        .precio-card { background: var(--white); border-radius: 20px; padding: 2rem; border: 1.5px solid var(--line); transition: all .2s; position: relative; }
        .precio-card.featured { background: var(--azul); border-color: var(--azul); transform: scale(1.02); box-shadow: 0 16px 48px rgba(11,61,107,.3); }
        .precio-card:hover:not(.featured) { box-shadow: 0 8px 32px rgba(10,10,12,.08); }
        .featured-label { position: absolute; top: -12px; left: 50%; transform: translateX(-50%); background: var(--acento); color: var(--azul); font-size: 11px; font-weight: 700; padding: 4px 14px; border-radius: 20px; letter-spacing: .04em; white-space: nowrap; }
        .plan-name { font-size: 12px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: var(--muted); margin-bottom: .625rem; }
        .featured .plan-name { color: rgba(255,255,255,.5); }
        .plan-price { font-family: 'Playfair Display', serif; font-size: 2.4rem; font-weight: 900; color: var(--ink); letter-spacing: -.04em; line-height: 1; margin-bottom: 4px; }
        .featured .plan-price { color: var(--white); }
        .plan-period { font-size: 12px; color: var(--muted); margin-bottom: 1.5rem; } .featured .plan-period { color: rgba(255,255,255,.4); }
        .plan-workers { font-size: 13px; font-weight: 500; color: var(--azul); padding: 6px 12px; background: #E8F1FA; border-radius: 8px; margin-bottom: 1.25rem; display: inline-block; }
        .featured .plan-workers { background: rgba(255,255,255,.1); color: rgba(255,255,255,.8); }
        .plan-features { display: flex; flex-direction: column; gap: 8px; margin-bottom: 1.5rem; }
        .pf { font-size: 13px; color: var(--ink); display: flex; align-items: center; gap: 8px; } .featured .pf { color: rgba(255,255,255,.8); }
        .pf::before { content: '✓'; color: var(--acento); font-weight: 700; flex-shrink: 0; }
        .plan-btn { width: 100%; padding: 12px; border-radius: 10px; border: 1.5px solid var(--azul); background: transparent; color: var(--azul); font-size: 14px; font-weight: 600; font-family: 'DM Sans', sans-serif; cursor: pointer; transition: all .2s; }
        .plan-btn:hover { background: var(--azul); color: var(--white); }
        .featured .plan-btn { background: var(--acento); border-color: var(--acento); color: var(--azul); }
        .featured .plan-btn:hover { background: #00A07A; }
        .trust-section { padding: 7rem 3rem; } .trust-inner { max-width: 1100px; margin: 0 auto; }
        .trust-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 4rem; align-items: center; }
        .trust-right { display: flex; flex-direction: column; gap: 1rem; }
        .trust-card { background: var(--white); border: 1px solid var(--line); border-radius: 14px; padding: 1.25rem 1.5rem; transition: all .2s; }
        .trust-card:hover { box-shadow: 0 4px 20px rgba(10,10,12,.08); transform: translateX(4px); }
        .tc-label { font-size: 11px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: var(--acento); margin-bottom: .375rem; }
        .tc-title { font-size: 15px; font-weight: 600; color: var(--ink); margin-bottom: .25rem; } .tc-desc { font-size: 13px; color: var(--muted); line-height: 1.5; }
        .roi-box { background: var(--azul); border-radius: 20px; padding: 2.5rem; position: relative; overflow: hidden; }
        .roi-box::before { content: ''; position: absolute; inset: 0; background: radial-gradient(ellipse at 0% 100%, rgba(0,200,150,.15), transparent 60%); }
        .roi-box-inner { position: relative; }
        .roi-tag { font-size: 11px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; color: var(--acento); margin-bottom: 1rem; }
        .roi-title { font-family: 'Playfair Display', serif; font-size: 1.6rem; font-weight: 900; color: var(--white); letter-spacing: -.02em; line-height: 1.15; margin-bottom: .75rem; }
        .roi-title em { font-style: italic; color: var(--acento); }
        .roi-desc { font-size: 14px; color: rgba(255,255,255,.55); line-height: 1.6; margin-bottom: 1.75rem; }
        .roi-numbers { display: flex; flex-direction: column; gap: .75rem; }
        .roi-row { display: flex; justify-content: space-between; align-items: center; padding: .75rem 1rem; background: rgba(255,255,255,.06); border-radius: 10px; font-size: 13px; }
        .roi-label { color: rgba(255,255,255,.5); } .roi-val { font-weight: 700; color: var(--acento); font-size: 14px; }
        .cta-section { background: var(--ink); padding: 7rem 3rem; text-align: center; position: relative; overflow: hidden; }
        .cta-section::before { content: ''; position: absolute; inset: 0; background: radial-gradient(ellipse at 50% 100%, rgba(0,200,150,.08), transparent 60%); }
        .cta-inner { max-width: 680px; margin: 0 auto; position: relative; }
        .cta-eyebrow { font-size: 11px; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; color: var(--acento); margin-bottom: 1.5rem; display: block; }
        .cta-h2 { font-family: 'Playfair Display', serif; font-size: clamp(2.4rem, 5vw, 3.8rem); font-weight: 900; color: var(--white); letter-spacing: -.04em; line-height: 1.06; margin-bottom: 1.25rem; }
        .cta-h2 em { font-style: italic; color: var(--acento); }
        .cta-sub { font-size: 16px; color: rgba(255,255,255,.45); line-height: 1.7; margin-bottom: 2.5rem; }
        .lead-form { display: flex; gap: 10px; max-width: 480px; margin: 0 auto 1rem; flex-wrap: wrap; }
        .lead-inp { flex: 1; min-width: 220px; padding: 14px 18px; background: rgba(255,255,255,.07); border: 1.5px solid rgba(255,255,255,.12); border-radius: 10px; font-size: 14px; font-family: 'DM Sans', sans-serif; color: var(--white); outline: none; transition: border-color .2s; }
        .lead-inp::placeholder { color: rgba(255,255,255,.3); } .lead-inp:focus { border-color: var(--acento); }
        .lead-btn { padding: 14px 24px; background: var(--acento); color: var(--azul); border: none; border-radius: 10px; font-size: 14px; font-weight: 700; font-family: 'DM Sans', sans-serif; cursor: pointer; white-space: nowrap; transition: all .2s; }
        .lead-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,200,150,.4); }
        .cta-disclaimer { font-size: 12px; color: rgba(255,255,255,.25); }
        footer { background: var(--azul); padding: 3rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; border-top: 1px solid rgba(255,255,255,.08); }
        .footer-logo { font-family: 'Playfair Display', serif; font-size: 1.2rem; font-weight: 700; color: var(--white); letter-spacing: -.02em; } .footer-logo em { color: var(--acento); font-style: normal; }
        .footer-links { display: flex; gap: 2rem; flex-wrap: wrap; }
        .footer-links a { font-size: 12px; color: rgba(255,255,255,.4); text-decoration: none; transition: color .2s; } .footer-links a:hover { color: rgba(255,255,255,.8); }
        .footer-copy { font-size: 12px; color: rgba(255,255,255,.25); }
        .reveal { opacity: 0; transform: translateY(24px); transition: opacity .7s ease, transform .7s ease; }
        .reveal.visible { opacity: 1; transform: translateY(0); }
        .toast { position: fixed; bottom: 2rem; left: 50%; transform: translateX(-50%) translateY(100px); background: var(--acento); color: var(--azul); padding: 12px 24px; border-radius: 50px; font-size: 14px; font-weight: 600; z-index: 999; transition: transform .4s ease; pointer-events: none; }
        .toast.show { transform: translateX(-50%) translateY(0); }
        @media (max-width: 900px) {
          .hero { grid-template-columns: 1fr; } .hero-right { display: none; }
          .problemas-grid, .modulos-grid, .leyes-grid, .precios-grid { grid-template-columns: 1fr; }
          .trust-grid { grid-template-columns: 1fr; }
          nav { padding: 1rem 1.5rem; } .nav-links { display: none; }
          .section { padding: 4rem 1.5rem; }
        }
      `}</style>

      <nav>
        <div className="nav-logo">norm<em>via</em></div>
        <div className="nav-links">
          <a href="#problema">El problema</a>
          <a href="#modulos">Módulos</a>
          <a href="#precios">Precios</a>
          <a href="#contacto">Contacto</a>
        </div>
        <a href="#contacto" className="nav-cta">Agendar una demo →</a>
      </nav>

      <section className="hero">
        <div className="hero-left">
          <div className="hero-eyebrow">Auditoría laboral preventiva</div>
          <h1 className="hero-h1 serif">
            Saber si tu empresa <em>cumple</em> la ley antes de que <span className="underline-word">llegue</span> la multa.
          </h1>
          <p className="hero-sub">
            Normvia monitorea en tiempo real si tu empresa cumple la Ley Karin, la Ley de 40 Horas, y todas las obligaciones laborales vigentes en Chile.
          </p>
          <div className="hero-actions">
            <a href="#contacto" className="btn-hero">Agendar una demo →</a>
            <a href="#modulos" className="btn-demo">Ver qué incluye ↓</a>
          </div>
          <div className="hero-stats">
            <div><div className="hs-num">60 UTM</div><div className="hs-lbl">Multa máxima DT por infracción</div></div>
            <div><div className="hs-num">40%</div><div className="hs-lbl">Finiquitos con errores en Chile</div></div>
            <div><div className="hs-num">0</div><div className="hs-lbl">Soluciones integrales laboral + societario para pymes</div></div>
          </div>
        </div>

        <div className="hero-right">
          <div className="platform-label">Panel de cumplimiento en tiempo real</div>
          <div className="alert-card"><div className="ac-icon ic-r">⚠️</div><div className="ac-body"><div className="ac-title">Protocolo Ley Karin no implementado</div><div className="ac-desc">Obligatorio desde agosto 2024. Riesgo de multa y responsabilidad directa.</div></div><span className="ac-badge b-r">Crítico</span></div>
          <div className="alert-card"><div className="ac-icon ic-a">🕐</div><div className="ac-body"><div className="ac-title">12 contratos con jornada desactualizada</div><div className="ac-desc">La jornada máxima es 42h desde abril 2026. Actualizar urgente.</div></div><span className="ac-badge b-a">Atención</span></div>
          <div className="alert-card"><div className="ac-icon ic-r">📋</div><div className="ac-body"><div className="ac-title">F30 de Constructora Norte vencido</div><div className="ac-desc">La empresa es responsable solidaria. Solicitar renovación hoy.</div></div><span className="ac-badge b-r">Crítico</span></div>
          <div className="alert-card"><div className="ac-icon ic-v">✅</div><div className="ac-body"><div className="ac-title">Finiquito Juan Pérez: sin errores detectados</div><div className="ac-desc">Cotizaciones al día. Causal correcta. Listo para firma.</div></div><span className="ac-badge b-v">OK</span></div>
        </div>
      </section>

      <section className="section" id="problema">
        <div className="section-inner">
          <div className="section-tag reveal">El problema</div>
          <h2 className="section-h2 reveal">La mayoría de las pymes no sabe<br/>si está <em>incumpliendo</em> la ley.</h2>
          <p className="section-lead reveal">No es mala intención. Es que no existe un lugar simple donde una empresa mediana pueda saber exactamente qué obligaciones tiene y si las está cumpliendo.</p>
          <div className="problemas-grid reveal">
            <div className="problema-item"><div className="prob-num">01</div><div className="prob-title">Se enteran tarde</div><div className="prob-desc">Las empresas descubren sus brechas cuando llega la Dirección del Trabajo o cuando reciben una demanda. Para entonces, el costo es 10 veces mayor.</div></div>
            <div className="problema-item"><div className="prob-num">02</div><div className="prob-title">Todo está disperso</div><div className="prob-desc">Contratos en Drive, liquidaciones en el contador, finiquitos en papel. Nadie tiene la foto completa del cumplimiento en un solo lugar.</div></div>
            <div className="problema-item"><div className="prob-num">03</div><div className="prob-title">Las auditorías son carísimas</div><div className="prob-desc">Una auditoría laboral con un estudio de abogados cuesta entre $5.000.000 y $20.000.000 CLP. Y es manual, esporádica y lenta.</div></div>
          </div>
        </div>
      </section>

      <section className="leyes-section">
        <div className="leyes-inner">
          <div className="leyes-header">
            <div className="leyes-tag reveal">Contexto regulatorio</div>
            <h2 className="leyes-h2 reveal">Las leyes que están<br/>cambiando <em>todo</em> ahora.</h2>
          </div>
          <div className="leyes-grid reveal">
            <div className="ley-card">
              <div className="ley-header"><div><div className="ley-name">Ley Karin</div><div className="ley-numero">Ley N° 21.643</div></div><span className="ley-vigencia">● Vigente desde ago. 2024</span></div>
              <div className="ley-desc">Prevención, investigación y sanción del acoso laboral y sexual. Aplica a todas las empresas de Chile sin excepción de tamaño.</div>
              <div className="ley-items">
                <div className="ley-item">Protocolo de prevención obligatorio y comunicado</div>
                <div className="ley-item">Canal de denuncia formal y confidencial</div>
                <div className="ley-item">Investigar denuncias en máximo 30 días hábiles</div>
                <div className="ley-item">Comunicación semestral a todos los trabajadores</div>
              </div>
              <div className="ley-multa">Incumplimiento: <strong>multas + tutela laboral + daño reputacional</strong></div>
            </div>
            <div className="ley-card">
              <div className="ley-header"><div><div className="ley-name">Ley 40 Horas</div><div className="ley-numero">Ley N° 21.561</div></div><span className="ley-vigencia">● 42h desde abril 2026</span></div>
              <div className="ley-desc">Reducción gradual de la jornada laboral máxima de 45 a 40 horas semanales. Ya está en implementación.</div>
              <div className="ley-items">
                <div className="ley-item">Abril 2026: jornada máxima 42 horas</div>
                <div className="ley-item">Todos los contratos deben actualizarse con anexo</div>
                <div className="ley-item">Recalcular horas extraordinarias con nueva base</div>
                <div className="ley-item">2028: llegará a 40 horas semanales</div>
              </div>
              <div className="ley-multa">Contrato desactualizado: <strong>infracción directa por cada trabajador</strong></div>
            </div>
            <div className="ley-card">
              <div className="ley-header"><div><div className="ley-name">Finiquitos</div><div className="ley-numero">Código del Trabajo</div></div><span className="ley-vigencia">● Error en 30-40% de casos</span></div>
              <div className="ley-desc">El proceso de desvinculación sigue siendo la principal fuente de litigios laborales en Chile.</div>
              <div className="ley-items">
                <div className="ley-item">Causales de término mal aplicadas</div>
                <div className="ley-item">Cálculo incorrecto de indemnizaciones</div>
                <div className="ley-item">Cotizaciones impagas invalidan el finiquito (Ley Bustos)</div>
                <div className="ley-item">Sin ministro de fe: sin efecto liberatorio</div>
              </div>
              <div className="ley-multa">Finiquito inválido: <strong>el trabajador puede demandar diferencias</strong></div>
            </div>
            <div className="ley-card">
              <div className="ley-header"><div><div className="ley-name">Subcontratación</div><div className="ley-numero">Ley N° 20.123</div></div><span className="ley-vigencia">● Responsabilidad solidaria</span></div>
              <div className="ley-desc">La empresa principal responde por las deudas laborales de sus contratistas si no verifica su cumplimiento.</div>
              <div className="ley-items">
                <div className="ley-item">Certificado F30 y F30-1 vigentes para cada contratista</div>
                <div className="ley-item">Verificación mensual de vencimientos</div>
                <div className="ley-item">Responsabilidad solidaria ante trabajadores</div>
                <div className="ley-item">Registro centralizado de todos los contratistas</div>
              </div>
              <div className="ley-multa">F30 vencido: <strong>empresa expuesta a demandas de los trabajadores del contratista</strong></div>
            </div>
          </div>
        </div>
      </section>

      <section className="modulos-section" id="modulos">
        <div className="modulos-inner">
          <div className="section-tag reveal">La plataforma</div>
          <h2 className="section-h2 reveal">Todo lo que necesitas para <em>cumplir</em>,<br/>en un solo lugar.</h2>
          <p className="section-lead reveal">Normvia no es una consultoría. Es un sistema que trabaja monitoreando tu cumplimiento y alertándote antes de que llegue el problema.</p>
          <div className="modulos-grid reveal">
            <div className="modulo-card"><span className="mod-icon">⚖️</span><div className="mod-name">Módulo Ley Karin</div><div className="mod-desc">Verifica que tu empresa cumpla cada obligación de la Ley Karin con trazabilidad completa.</div><div className="mod-features"><div className="mod-feature">Diagnóstico del protocolo vigente</div><div className="mod-feature">Auditoría del canal de denuncia</div><div className="mod-feature">Alertas de comunicación semestral</div><div className="mod-feature">Registro de capacitaciones</div></div></div>
            <div className="modulo-card"><span className="mod-icon">🕐</span><div className="mod-name">Módulo 40 Horas</div><div className="mod-desc">Detecta contratos desactualizados y calcula correctamente la jornada con la nueva normativa.</div><div className="mod-features"><div className="mod-feature">Revisión de contratos por jornada</div><div className="mod-feature">Generador de anexos actualizados</div><div className="mod-feature">Cálculo de horas extraordinarias</div><div className="mod-feature">Alerta por cambio de jornada</div></div></div>
            <div className="modulo-card"><span className="mod-icon">📄</span><div className="mod-name">Módulo Finiquitos</div><div className="mod-desc">Valida cada finiquito antes de la firma y calcula los montos correctos según la causal.</div><div className="mod-features"><div className="mod-feature">Validación pre-firma completa</div><div className="mod-feature">Simulador de indemnizaciones</div><div className="mod-feature">Verificación Ley Bustos</div><div className="mod-feature">Historial auditado de finiquitos</div></div></div>
            <div className="modulo-card"><span className="mod-icon">🤝</span><div className="mod-name">Subcontratación</div><div className="mod-desc">Monitorea los certificados F30 de tus contratistas y te avisa antes de que venzan.</div><div className="mod-features"><div className="mod-feature">Registro de contratistas activos</div><div className="mod-feature">Alerta de vencimiento F30/F30-1</div><div className="mod-feature">Control de responsabilidad solidaria</div><div className="mod-feature">Verificación en dt.gob.cl</div></div></div>
            <div className="modulo-card"><span className="mod-icon">🗂️</span><div className="mod-name">Documentación</div><div className="mod-desc">Centraliza contratos, anexos y reglamento interno con trazabilidad de entrega.</div><div className="mod-features"><div className="mod-feature">Checklist por trabajador</div><div className="mod-feature">Alertas de documentos vencidos</div><div className="mod-feature">Reglamento interno actualizado</div><div className="mod-feature">Firma electrónica integrada</div></div></div>
            <div className="modulo-card"><span className="mod-icon">🏛️</span><div className="mod-name">Sociedades</div><div className="mod-desc">Gestiona todo lo societario sin papel: accionistas, asambleas con actas y estatutos actualizados en un solo lugar.</div><div className="mod-features"><div className="mod-feature">Libro de accionistas con gráfico de capital</div><div className="mod-feature">Asambleas con actas imprimibles</div><div className="mod-feature">Estatutos editables con historial</div><div className="mod-feature">Cálculo automático de quórum</div></div></div>
            <div className="modulo-card"><span className="mod-icon">💬</span><div className="mod-name">Asistente Jurídico</div><div className="mod-desc">Chat inteligente especializado en derecho laboral y societario chileno, con derivación a abogados.</div><div className="mod-features"><div className="mod-feature">IA especializada en Código del Trabajo</div><div className="mod-feature">Respuestas con referencias legales</div><div className="mod-feature">Derivación a especialistas humanos</div><div className="mod-feature">Disponible en todos los módulos</div></div></div>
          </div>
        </div>
      </section>

      <section className="precios-section" id="precios">
        <div className="precios-inner">
          <div className="section-tag reveal">Precios</div>
          <h2 className="section-h2 reveal">Una multa de la DT cuesta<br/><em>más</em> que un año de Normvia.</h2>
          <p className="section-lead reveal">Sin contratos a largo plazo. Cancela cuando quieras. Agenda una demo para ver el plan que mejor se ajusta a tu empresa.</p>
          <div className="precios-grid reveal">
            <div className="precio-card">
              <div className="plan-name">Starter</div><div className="plan-price">$150.000</div><div className="plan-period">CLP / mes · facturación mensual</div>
              <div className="plan-workers">1 a 50 trabajadores</div>
              <div className="plan-features"><div className="pf">Módulo Ley Karin</div><div className="pf">Módulo 40 Horas</div><div className="pf">Módulo Finiquitos</div><div className="pf">Dashboard básico</div><div className="pf">Asistente jurídico IA</div></div>
              <button className="plan-btn" onClick={() => document.getElementById('contacto')?.scrollIntoView({behavior:'smooth'})}>Agendar una demo →</button>
            </div>
            <div className="precio-card featured">
              <div className="featured-label">⭐ MÁS POPULAR</div>
              <div className="plan-name">Professional</div><div className="plan-price">$300.000</div><div className="plan-period">CLP / mes · facturación mensual</div>
              <div className="plan-workers">51 a 200 trabajadores</div>
              <div className="plan-features"><div className="pf">Todo lo del plan Starter</div><div className="pf">Módulo Subcontratación</div><div className="pf">Módulo Documentación</div><div className="pf">Alertas de vencimiento</div><div className="pf">Reportes para la DT</div><div className="pf">Derivación a abogados</div></div>
              <button className="plan-btn" onClick={() => document.getElementById('contacto')?.scrollIntoView({behavior:'smooth'})}>Agendar una demo →</button>
            </div>
            <div className="precio-card">
              <div className="plan-name">Enterprise</div><div className="plan-price">A medida</div><div className="plan-period">según dotación y requerimientos</div>
              <div className="plan-workers">200+ trabajadores</div>
              <div className="plan-features"><div className="pf">Todo lo del plan Professional</div><div className="pf">Integraciones API (Buk, Talana)</div><div className="pf">Soporte prioritario dedicado</div><div className="pf">Reportes personalizados</div><div className="pf">Onboarding con abogado</div></div>
              <button className="plan-btn" onClick={() => document.getElementById('contacto')?.scrollIntoView({behavior:'smooth'})}>Solicitar cotización →</button>
            </div>
          </div>
        </div>
      </section>

      <section className="trust-section">
        <div className="trust-inner">
          <div className="trust-grid reveal">
            <div>
              <div className="roi-box">
                <div className="roi-box-inner">
                  <div className="roi-tag">Retorno de inversión</div>
                  <div className="roi-title">El plan Professional<br/>se paga con <em>una</em><br/>multa evitada.</div>
                  <div className="roi-desc">Una empresa mediana que invierte $300.000 mensuales en Normvia obtiene:</div>
                  <div className="roi-numbers">
                    <div className="roi-row"><span className="roi-label">Ahorro en auditorías externas</span><span className="roi-val">$15M – $30M / año</span></div>
                    <div className="roi-row"><span className="roi-label">Multa DT evitada</span><span className="roi-val">$4M – $10M c/u</span></div>
                    <div className="roi-row"><span className="roi-label">Demanda laboral evitada</span><span className="roi-val">$2M – $8M c/u</span></div>
                    <div className="roi-row"><span className="roi-label">Payback estimado</span><span className="roi-val">2 a 4 meses</span></div>
                  </div>
                </div>
              </div>
            </div>
            <div className="trust-right">
              <div className="trust-card"><div className="tc-label">Respaldo jurídico</div><div className="tc-title">Equipo con visión en sociedades y derecho laboral</div><div className="tc-desc">Cada módulo de Normvia fue diseñado considerando criterios reales de cumplimiento laboral y societario.</div></div>
              <div className="trust-card"><div className="tc-label">Actualización permanente</div><div className="tc-title">Siempre al día con la normativa</div><div className="tc-desc">Cuando cambia la ley, Normvia se actualiza. Tus alertas y diagnósticos reflejan la normativa vigente.</div></div>
              <div className="trust-card"><div className="tc-label">Sin fricción técnica</div><div className="tc-title">No necesitas saber de tecnología</div><div className="tc-desc">Diseñado para encargados de RRHH y administradores, no para abogados ni ingenieros. Fácil desde el primer día.</div></div>
              <div className="trust-card"><div className="tc-label">Derivación garantizada</div><div className="tc-title">Casos complejos con abogados reales</div><div className="tc-desc">Cuando el asistente IA detecta un caso que requiere criterio humano, te conecta con un especialista.</div></div>
            </div>
          </div>
        </div>
      </section>

      <section className="cta-section" id="contacto">
        <div className="cta-inner">
          <span className="cta-eyebrow">Conversemos</span>
          <h2 className="cta-h2 reveal">Agenda una demo<br/><em>sin compromiso.</em></h2>
          <p className="cta-sub reveal">Te mostramos la plataforma funcionando con un caso real de tu rubro, y vemos juntos si tiene sentido para tu empresa.</p>
          <form className="lead-form reveal" onSubmit={(e) => {
            e.preventDefault()
            const email = (document.getElementById('lead-email') as HTMLInputElement).value
            window.location.href = `mailto:contacto@normvia.cl?subject=Quiero agendar una demo&body=Mi correo de contacto es: ${email}`
          }}>
            <input className="lead-inp" id="lead-email" type="email" placeholder="tucorreo@empresa.cl" required />
            <button className="lead-btn" type="submit">Agendar demo →</button>
          </form>
          <div className="cta-disclaimer">Te contactamos en menos de 24 horas hábiles para coordinar.</div>
        </div>
      </section>

      <footer>
        <div className="footer-logo">norm<em>via</em></div>
        <div className="footer-links">
          <a href="#problema">El problema</a>
          <a href="#modulos">Módulos</a>
          <a href="#precios">Precios</a>
          <a href="mailto:contacto@normvia.cl">contacto@normvia.cl</a>
        </div>
        <div className="footer-copy">© 2026 Normvia · Auditoría laboral preventiva · Chile</div>
      </footer>
    </>
  )
}
