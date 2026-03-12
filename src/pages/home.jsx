import Navbar from "../components/navbar";
import "../style/home.css";
import PageTransition from "../components/PageTransition";
import { supabase } from "../lib/supabase";
import {
  Search,
  MapPin,
  Briefcase,
  Calendar,
  CheckCircle,
  Users,
  Mail,
  Phone,
  Clock,
  Send,
  ArrowRight,
  Zap,
  Globe,
} from "lucide-react";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { toast } from "../components/ui/sonner";
import { useNavigate } from "react-router-dom";
import Footer from "../components/footer.jsx";
import { contactService } from "../lib/contactService";

// ── Particle Network Canvas ────────────────────────────────────────────────────
const ParticleNetwork = () => {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animId;
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize();
    window.addEventListener("resize", resize);
    const particles = Array.from({ length: 55 }, () => ({
      x: Math.random() * canvas.width, y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.35, vy: (Math.random() - 0.5) * 0.35,
      radius: Math.random() * 1.8 + 0.8,
    }));
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(99,179,237,0.75)";
        ctx.fill();
      });
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 130) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(99,179,237,${0.3 * (1 - dist / 130)})`;
            ctx.lineWidth = 0.7;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={canvasRef} className="particle-canvas" />;
};

// ── Orbiting Community Visualization ─────────────────────────────────────────
const CommunityOrbit = () => {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animId, angle = 0;
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize();
    window.addEventListener("resize", resize);
    const onMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = { x: (e.clientX - rect.left - canvas.width / 2) / canvas.width, y: (e.clientY - rect.top - canvas.height / 2) / canvas.height };
    };
    canvas.addEventListener("mousemove", onMouseMove);
    const AVATARS = [
      { orbit: 80, speed: 0.008, color: "#63b3ed", size: 22, offset: 0 },
      { orbit: 135, speed: -0.005, color: "#9f7aea", size: 18, offset: 1 },
      { orbit: 108, speed: 0.006, color: "#68d391", size: 20, offset: 2.5 },
      { orbit: 58, speed: -0.012, color: "#fbd38d", size: 15, offset: 4 },
      { orbit: 155, speed: 0.007, color: "#fc8181", size: 18, offset: 1.8 },
      { orbit: 93, speed: -0.009, color: "#76e4f7", size: 14, offset: 3.2 },
    ];
    const draw = () => {
      const cx = canvas.width / 2 + mouseRef.current.x * 18;
      const cy = canvas.height / 2 + mouseRef.current.y * 18;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const disc = ctx.createRadialGradient(cx, cy + 20, 10, cx, cy + 20, 85);
      disc.addColorStop(0, "rgba(99,179,237,0.22)"); disc.addColorStop(1, "rgba(99,179,237,0)");
      ctx.beginPath(); ctx.ellipse(cx, cy + 20, 85, 26, 0, 0, Math.PI * 2); ctx.fillStyle = disc; ctx.fill();
      angle += 0.005;
      AVATARS.forEach((av) => {
        const a = angle * (av.speed / 0.005) + av.offset;
        const x = cx + Math.cos(a) * av.orbit;
        const y = cy + Math.sin(a) * av.orbit * 0.35;
        ctx.beginPath(); ctx.strokeStyle = "rgba(99,179,237,0.12)"; ctx.lineWidth = 1; ctx.moveTo(cx, cy); ctx.lineTo(x, y); ctx.stroke();
        const glow = ctx.createRadialGradient(x, y, 0, x, y, av.size * 2);
        glow.addColorStop(0, av.color + "44"); glow.addColorStop(1, "transparent");
        ctx.beginPath(); ctx.arc(x, y, av.size * 2, 0, Math.PI * 2); ctx.fillStyle = glow; ctx.fill();
        const body = ctx.createRadialGradient(x - 3, y - 3, 2, x, y, av.size);
        body.addColorStop(0, av.color); body.addColorStop(1, av.color + "88");
        ctx.beginPath(); ctx.arc(x, y, av.size, 0, Math.PI * 2); ctx.fillStyle = body; ctx.fill();
        ctx.beginPath(); ctx.arc(x, y - 3, av.size * 0.38, 0, Math.PI * 2); ctx.fillStyle = "rgba(255,255,255,0.55)"; ctx.fill();
      });
      const cg = ctx.createRadialGradient(cx, cy, 0, cx, cy, 38);
      cg.addColorStop(0, "rgba(99,179,237,0.55)"); cg.addColorStop(1, "transparent");
      ctx.beginPath(); ctx.arc(cx, cy, 38, 0, Math.PI * 2); ctx.fillStyle = cg; ctx.fill();
      ctx.beginPath(); ctx.arc(cx, cy, 17, 0, Math.PI * 2); ctx.fillStyle = "#63b3ed"; ctx.fill();
      ctx.beginPath(); ctx.arc(cx, cy, 9, 0, Math.PI * 2); ctx.fillStyle = "white"; ctx.fill();
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", resize); canvas.removeEventListener("mousemove", onMouseMove); };
  }, []);
  return <canvas ref={canvasRef} className="orbit-canvas" />;
};

// ── Main Component ─────────────────────────────────────────────────────────────
export default function Home() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [user, setUser] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [formData, setFormData] = useState({ fullName: "", email: "", phoneNumber: "", message: "" });

  const shapesRef = useRef([]);
  const cursorRef = useRef(null);
  const cursorTrailRef = useRef(null);
  const progressRef = useRef(null);
  const searchPanelRef = useRef(null);
  const ctaRef = useRef(null);
  const orgCardRef = useRef(null);

  // Auth
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => setUser(session?.user ?? null));
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user?.email) setFormData((p) => ({ ...p, email: user.email, fullName: user.user_metadata?.full_name || p.fullName }));
  }, [user]);

  // Custom cursor
  useEffect(() => {
    document.body.classList.add('hide-default-cursor');
    const cursor = cursorRef.current;
    const trail = cursorTrailRef.current;
    if (!cursor || !trail) return () => document.body.classList.remove('hide-default-cursor');
    let trailX = 0, trailY = 0, cx = 0, cy = 0, animId;
    const move = (e) => {
      cx = e.clientX; cy = e.clientY;
      cursor.style.transform = `translate(${cx - 10}px, ${cy - 10}px)`;
    };
    const loop = () => {
      trailX += (cx - trailX) * 0.12; trailY += (cy - trailY) * 0.12;
      trail.style.transform = `translate(${trailX - 20}px, ${trailY - 20}px)`;
      animId = requestAnimationFrame(loop);
    };
    loop();
    const expand = () => cursor.classList.add("cursor-expand");
    const contract = () => cursor.classList.remove("cursor-expand");
    window.addEventListener("mousemove", move);
    document.querySelectorAll("a, button, input, select, textarea, [data-interactive]")
      .forEach((el) => { el.addEventListener("mouseenter", expand); el.addEventListener("mouseleave", contract); });
    return () => { 
      cancelAnimationFrame(animId); 
      window.removeEventListener("mousemove", move); 
      document.body.classList.remove('hide-default-cursor');
    };
  }, []);

  // Progress bar
  useEffect(() => {
    const bar = progressRef.current;
    if (!bar) return;
    const onScroll = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.width = `${(window.scrollY / total) * 100}%`;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Scroll reveal (pure IntersectionObserver, no GSAP)
  useEffect(() => {
    const targets = document.querySelectorAll(".reveal");
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("revealed");
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -60px 0px" });
    targets.forEach((t) => obs.observe(t));
    return () => obs.disconnect();
  }, []);

  // Mouse parallax shapes
  useEffect(() => {
    const handle = (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      shapesRef.current.forEach((s, i) => {
        if (!s) return;
        const d = (i + 1) * 9;
        s.style.transform = `translate(${x * d}px, ${y * d}px)`;
      });
    };
    window.addEventListener("mousemove", handle, { passive: true });
    return () => window.removeEventListener("mousemove", handle);
  }, []);

  // Magnetic CTA
  useEffect(() => {
    const btn = ctaRef.current;
    if (!btn) return;
    const RADIUS = 90;
    const onMove = (e) => {
      const r = btn.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < RADIUS) {
        const f = (RADIUS - dist) / RADIUS;
        btn.style.transform = `translate(${dx * f * 0.35}px, ${dy * f * 0.35}px)`;
      } else {
        btn.style.transform = "";
      }
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  // 3D tilt cards
  const addTilt = useCallback((el) => {
    if (!el) return;
    const enter = () => {
      const rect = el.getBoundingClientRect();
      const onMove = (e) => {
        const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
        const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
        el.style.transform = `perspective(800px) rotateY(${x * 12}deg) rotateX(${-y * 8}deg) translateZ(28px)`;
      };
      el.addEventListener("mousemove", onMove);
      el._cleanup = () => el.removeEventListener("mousemove", onMove);
    };
    const leave = () => { el._cleanup?.(); el.style.transform = ""; };
    el.addEventListener("mouseenter", enter);
    el.addEventListener("mouseleave", leave);
    return () => { el.removeEventListener("mouseenter", enter); el.removeEventListener("mouseleave", leave); };
  }, []);

  // Search panel tilt
  useEffect(() => {
    const p = searchPanelRef.current;
    if (!p) return;
    const m = (e) => {
      const r = p.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width - 0.5) * 2;
      const y = ((e.clientY - r.top) / r.height - 0.5) * 2;
      p.style.transform = `perspective(1000px) rotateY(${x * 2.5}deg) rotateX(${-y * 1.5}deg)`;
    };
    const l = () => { p.style.transform = ""; };
    p.addEventListener("mousemove", m);
    p.addEventListener("mouseleave", l);
    return () => { p.removeEventListener("mousemove", m); p.removeEventListener("mouseleave", l); };
  }, []);

  // Org card tilt
  useEffect(() => { if (orgCardRef.current) addTilt(orgCardRef.current); }, [addTilt]);

  // Ripple
  const handleRipple = (e) => {
    const btn = e.currentTarget;
    const circle = document.createElement("span");
    const rect = btn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    circle.className = "ripple-wave";
    circle.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX - rect.left - size / 2}px;top:${e.clientY - rect.top - size / 2}px`;
    btn.appendChild(circle);
    setTimeout(() => circle.remove(), 700);
  };

  // Form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.fullName.trim() || !formData.email.trim() || !formData.message.trim()) {
      toast.error("Please fill in all required fields (Name, Email, and Message)."); return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast.error("Please enter a valid email address."); return;
    }
    setIsSubmitting(true);
    try {
      const result = await contactService.submitContactForm(formData);
      if (result.success) {
        setSubmitSuccess(true);
        toast.success("Thank you for your message! We'll get back to you soon.");
        setFormData({ fullName: user?.user_metadata?.full_name || "", email: user?.email || "", phoneNumber: "", message: "" });
        setTimeout(() => setSubmitSuccess(false), 3000);
      } else { toast.error(result.error || "Failed to submit contact form"); }
    } catch { toast.error("An unexpected error occurred. Please try again."); }
    finally { setIsSubmitting(false); }
  };

  const handleExploreClick = () => navigate("/internships");

  return (
    <PageTransition>
      {/* Custom Cursor */}
      <div ref={cursorRef} id="custom-cursor" />
      <div ref={cursorTrailRef} id="cursor-trail" />
      {/* Reading Progress */}
      <div ref={progressRef} id="reading-progress" />

      <Navbar />

      {/* ═══════════════════ HERO ═══════════════════ */}
      <div className="hero-container">
        <div className="hero-bg-gradient" />
        <div className="hero-shapes-layer">
          {[...Array(6)].map((_, i) => (
            <div key={i} className={`hero-shape hero-shape-${i + 1}`} ref={(el) => (shapesRef.current[i] = el)} />
          ))}
        </div>
        <ParticleNetwork />

        <div className="content-container">
          <div className="hero-text">
            <h1 className="hero-title hero-title-3d">
              Find your next internship faster.
            </h1>
            <p className="hero-subtitle">
              Discover thousands of opportunities and use our AI tools to land your dream role.
            </p>
          </div>

          <div className="hero-search">
            <div className="search-form glass-panel" ref={searchPanelRef}>
              <div className="search-grid">
                <div className="input-group">
                  <Search className="input-icon" />
                  <input type="text" placeholder="Role or Keyword" className="form-input" aria-label="Search role or keyword" />
                </div>
                <div className="input-group">
                  <MapPin className="input-icon" />
                  <input type="text" placeholder="Location" className="form-input" aria-label="Location" />
                </div>
                <div className="input-group">
                  <Briefcase className="input-icon" />
                  <select className="form-select" aria-label="Internship type">
                    <option value="" disabled defaultValue="">Type</option>
                    <option value="remote">Remote</option>
                    <option value="onsite">On-site</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                  <div className="select-arrow"><svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg></div>
                </div>
                <div className="input-group">
                  <Calendar className="input-icon" />
                  <select className="form-select" aria-label="Duration">
                    <option value="" disabled defaultValue="">Duration</option>
                    <option value="3-months">3 months</option>
                    <option value="6-months">6 months</option>
                    <option value="12-months">12 months</option>
                  </select>
                  <div className="select-arrow"><svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg></div>
                </div>
              </div>
              <div className="button-container">
                <button ref={ctaRef} className="explore-button" onClick={handleExploreClick} onMouseDown={handleRipple} data-interactive>
                  <span className="btn-shimmer" />
                  <ArrowRight className="btn-icon" size={18} />
                  EXPLORE INTERNSHIPS
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════ WHY INTERNSHIPS ═══════════════════ */}
      <section className="why-internship-section" id="why-internship">
        <div className="section-container">
          <div className="section-header-home reveal reveal-up">
            <div className="section-badge"><Zap size={13} /><span>Why It Matters</span></div>
            <h2 className="section-title-1">Why Internships are Important</h2>
            <p className="section-subtitle">Internships are the bridge between academic learning and professional success, providing invaluable real-world experience.</p>
          </div>
          <div className="benefits-grid">
            {[
              { icon: <CheckCircle className="icon" />, color: "#3b82f6", title: "Practical Experience", desc: "Internships bridge the gap between classroom learning and real-world practice. They allow students and young professionals to apply theoretical knowledge to real projects, gain hands-on skills, and understand how industries actually operate.", delay: "0s" },
              { icon: <Search className="icon" />, color: "#8b5cf6", title: "Career Exploration", desc: "An internship is an opportunity to explore different career paths without long-term commitment. It helps individuals discover their interests, strengths, and areas for growth, guiding them toward the right career choice.", delay: "0.15s", elevated: true },
              { icon: <Users className="icon" />, color: "#10b981", title: "Networking Opportunities", desc: "Internships provide direct access to professionals, mentors, and peers in the industry. Building these relationships can open doors to future job opportunities, collaborations, and valuable guidance.", delay: "0.3s" },
            ].map((card, i) => (
              <div key={i} className={`benefit-card glass-card reveal reveal-flip${card.elevated ? " card-elevated" : ""}`}
                style={{ "--anim-delay": card.delay, "--card-color": card.color }}
                ref={(el) => el && addTilt(el)}>
                <div className="benefit-icon-sphere">{card.icon}</div>
                <h3 className="benefit-title">{card.title}</h3>
                <p className="benefit-description">{card.desc}</p>
                <div className="card-glow" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ WHO CAN APPLY ═══════════════════ */}
      <section className="who-can-apply-section" id="who-can-apply">
        <div className="section-container">
          <div className="who-apply-content">
            <div className="who-apply-text reveal reveal-left">
              <div className="section-badge dark-badge"><Globe size={13} /><span>Eligibility</span></div>
              <h2 className="section-title-1">Who Can Apply</h2>
              <p className="who-apply-description">We welcome applications from enthusiastic undergraduate students who are eager to learn, grow, and gain hands-on industry experience. This program is specially tailored for undergraduates looking to bridge the gap between classroom knowledge and real-world practice.</p>
              <div className="requirements-list">
                {["Current undergraduate students", "Eager to learn and grow professionally", "Ready for hands-on industry experience", "Committed to bridging theory and practice"].map((text, i) => (
                  <div key={i} className="requirement-item" style={{ "--item-delay": `${i * 0.12}s` }}>
                    <CheckCircle className="requirement-icon" />
                    <span>{text}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="who-apply-visual reveal reveal-right">
              <div className="community-3d-scene">
                <CommunityOrbit />
                <div className="community-label">
                  <h3>Join Our Community</h3>
                  <p>Connect with ambitious students nationwide</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════ HOW TO APPLY ═══════════════════ */}
      <section className="how-to-apply-section" id="how-to-apply">
        <div className="section-container">
          <div className="section-header-home reveal reveal-up">
            <div className="section-badge"><ArrowRight size={13} /><span>The Process</span></div>
            <h2 className="section-title-1">How to Apply</h2>
            <p className="section-subtitle">Getting started is simple. Follow these easy steps to begin your internship journey.</p>
          </div>
          <div className="steps-grid">
            {[
              { num: "01", icon: <Users size={22} />, title: "Create Your Account", desc: "Sign up with your Gmail to get started and access our comprehensive platform with all available opportunities.", delay: "0s" },
              { num: "02", icon: <Globe size={22} />, title: "Access Your Dashboard", desc: "Navigate to your personalized dashboard and explore available internship opportunities tailored to your profile.", delay: "0.15s" },
              { num: "03", icon: <Search size={22} />, title: "Search & Discover", desc: "Use our advanced search filters to find internships in your field of interest and discover the perfect match.", delay: "0.3s" },
              { num: "04", icon: <CheckCircle size={22} />, title: "Apply & Track", desc: "Submit your applications with ease and track your progress through our notification system and application dashboard.", delay: "0.45s" },
            ].map((step, i) => (
              <div key={i} className="step-card pillar-card reveal reveal-up" style={{ "--anim-delay": step.delay }}>
                <div className="pillar-orb">
                  <div className="pillar-orb-inner">{step.icon}</div>
                  <div className="pillar-orb-ring" />
                </div>
                <div className="step-number-3d">{step.num}</div>
                <div className="step-content">
                  <h3 className="step-title">{step.title}</h3>
                  <p className="step-description">{step.desc}</p>
                </div>
                <div className="pillar-glow" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ ORGANIZATION ═══════════════════ */}
      <section className="organization-section" id="for-organizations">
        <div className="section-container">
          <div className="section-header-home reveal reveal-up">
            <div className="section-badge"><Briefcase size={13} /><span>For Organizations</span></div>
            <h2 className="section-title-1">Are You an Organization?</h2>
            <p className="section-subtitle">Looking to recruit talented interns? Partner with Intern Connect to find the perfect candidates.</p>
          </div>
          <div className="organization-content">
            <div className="organization-steps reveal reveal-left">
              {[
                { num: "01", title: "Create Your Organization Account", desc: "Sign up and complete your organization profile with company details, industry information, and your company's mission." },
                { num: "02", title: "Complete Onboarding", desc: "Navigate to your profile page and complete the onboarding process to verify your organization details and set up your recruitment preferences." },
                { num: "03", title: "Wait for Approval", desc: "Our team will review your organization profile to ensure authenticity and quality. This typically takes 1-2 business days." },
                { num: "04", title: "Start Posting Internships", desc: "Once approved, you can begin posting internship opportunities, manage applications, and connect with talented candidates." },
              ].map((step, i) => (
                <div key={i} className="org-step">
                  <div className="org-step-orb">
                    <span>{step.num}</span>
                    <div className="orb-ring" />
                  </div>
                  {i < 3 && <div className="step-connector-vert" />}
                  <div className="org-step-content">
                    <h3>{step.title}</h3>
                    <p>{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="org-cta-container glass-cta-card reveal reveal-right" ref={orgCardRef}>
              <div className="cta-card-glow" />
              <div className="cta-card-grid" />
              <div className="org-cta-content">
                <div className="cta-icon-ring"><Briefcase size={30} /></div>
                <h3 className="org-cta-title">Ready to Find Your Next Intern?</h3>
                <p className="org-cta-description">Join hundreds of organizations already recruiting on InternConnect. Start your recruitment journey today.</p>
                <button className="org-signup-btn" onClick={() => navigate("/organization-signup")} onMouseDown={handleRipple} data-interactive>
                  <span className="btn-shimmer" />
                  Sign Up as Organization
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════ CONTACT ═══════════════════ */}
      <section className="contact-section" id="contact">
        <div className="section-container">
          <div className="section-header-home reveal reveal-up">
            <div className="section-badge"><Mail size={13} /><span>Get In Touch</span></div>
            <h2 className="section-title-1">Contact Us</h2>
            <p className="section-subtitle">Get in touch with our team for personalized assistance and support on your internship journey.</p>
          </div>
          <div className="contact-content">
            <div className="contact-form-container glass-form-slab reveal reveal-left">
              <form className="contact-form" onSubmit={handleSubmit}>
                {[
                  { label: "Full Name", id: "fullName", type: "text", placeholder: "Enter your full name" },
                  { label: "Email Address", id: "email", type: "email", placeholder: "your.email@example.com" },
                  { label: "Phone Number", id: "phoneNumber", type: "tel", placeholder: "+234 123 456 7890" },
                ].map((field) => (
                  <div key={field.id} className="form-group">
                    <label htmlFor={field.id} className="form-label">{field.label}</label>
                    <div className="input-3d-channel">
                      <input type={field.type} id={field.id} name={field.id} value={formData[field.id]} onChange={handleInputChange} className="contact-input" placeholder={field.placeholder} required={field.id !== "phoneNumber"} data-interactive />
                    </div>
                  </div>
                ))}
                <div className="form-group">
                  <label htmlFor="message" className="form-label">Message</label>
                  <div className="input-3d-channel textarea-channel">
                    <textarea id="message" name="message" value={formData.message} onChange={handleInputChange} className="contact-textarea" placeholder="How can we help you? Tell us about your internship goals..." rows="4" required data-interactive />
                  </div>
                </div>
                <button type="submit" className={`contact-submit-btn${submitSuccess ? " success-state" : ""}`} disabled={isSubmitting} onMouseDown={handleRipple} data-interactive>
                  <span className="btn-shimmer" />
                  {submitSuccess ? <CheckCircle size={18} /> : <Send size={16} />}
                  {isSubmitting ? "Sending..." : submitSuccess ? "Message Sent!" : "Send Message"}
                </button>
              </form>
            </div>
            <div className="contact-info">
              {[
                { icon: <Mail className="contact-icon" />, title: "Email Address", lines: ["info@d-internconnect.com"], color: "#3b82f6", delay: "0s" },
                { icon: <Phone className="contact-icon" />, title: "Phone Number", lines: ["+234 913 580 4703", "+234 810 777 3828"], color: "#8b5cf6", delay: "0.1s" },
                { icon: <Clock className="contact-icon" />, title: "Business Hours", lines: ["Mon – Fri: 8:00 AM – 6:00 PM", "Saturday: 10:00 AM – 4:00 PM", "Sunday: Closed"], color: "#10b981", delay: "0.2s" },
              ].map((card, i) => (
                <div key={i} className="contact-info-float-card reveal reveal-right" style={{ "--card-color": card.color, "--anim-delay": card.delay }}>
                  <div className="float-card-icon" style={{ background: card.color }}>{card.icon}</div>
                  <div className="contact-text">
                    <h4>{card.title}</h4>
                    {card.lines.map((l, j) => <p key={j}>{l}</p>)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </PageTransition>
  );
}
