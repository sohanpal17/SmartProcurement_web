import React, { useState } from "react";
import { ArrowRight, Search, Phone, Mail, CheckCircle2, ChevronRight, UserCheck } from "lucide-react";

export const LandingPage = ({ onOpenLogin, onEnterDashboard, authUser }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredCentres, setFilteredCentres] = useState([
    {
      id: "01",
      name: "Bhavani Grain Procurement Centre",
      address: "Bhavani Main Road, Erode · Open today",
      distance: "6.2 km",
    },
    {
      id: "02",
      name: "Perundurai Regulated Market",
      address: "Market Yard, Perundurai · Open today",
      distance: "14.8 km",
    },
    {
      id: "03",
      name: "Kodumudi Procurement Yard",
      address: "Karur Road, Kodumudi · Closes at 5:00 PM",
      distance: "28.4 km",
    },
  ]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const q = searchQuery.toLowerCase();
    const results = [
      {
        id: "01",
        name: `${searchQuery} Main Procurement Yard`,
        address: `${searchQuery} Central Mandi · Open today`,
        distance: "3.5 km",
      },
      {
        id: "02",
        name: `${searchQuery} Regulated Market Yard`,
        address: `Station Road, ${searchQuery} · Open today`,
        distance: "8.1 km",
      },
      {
        id: "03",
        name: "Regional Grain Storage Yard",
        address: "Highway Hub · Closes at 6:00 PM",
        distance: "15.2 km",
      },
    ];
    setFilteredCentres(results);
  };

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F3EF] text-[#0F284A] font-sans antialiased selection:bg-[#DFB15B] selection:text-[#0A1F3E]">
      {/* 1. TOP UTILITY HEADER BAR */}
      <div className="bg-[#091B36]/90 backdrop-blur-md text-white/80 text-xs py-2 px-4 sm:px-8 border-b border-white/10 flex flex-wrap items-center justify-between gap-3 sticky top-0 z-50">
        <div className="font-medium tracking-wide text-white/90">
          Department of Food & Public Distribution
        </div>

        <div className="flex items-center gap-4 sm:gap-6 font-medium">
          <a href="#main-content" className="hover:text-white transition-colors hidden md:inline">
            Skip to main content
          </a>
          <span className="text-white/30 hidden md:inline">|</span>
          <button onClick={onOpenLogin} className="hover:text-[#DFB15B] cursor-pointer transition-colors">
            Centre administration
          </button>
          <span className="text-white/30">|</span>
          <span className="hover:text-white cursor-pointer transition-colors">English</span>
          <span className="text-white/30">|</span>
          <span className="text-[#DFB15B] font-semibold flex items-center gap-1.5">
            Helpline: <strong className="text-white font-bold">1800 180 1551</strong>
          </span>
          <span className="text-white/30">|</span>
          {authUser ? (
            <button
              onClick={onEnterDashboard}
              className="bg-[#DFB15B] hover:bg-[#CFA14B] text-[#0A1F3E] px-3 py-1 rounded font-bold text-xs transition-all flex items-center gap-1 cursor-pointer shadow-xs"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Go to Admin Dashboard</span>
            </button>
          ) : (
            <button
              onClick={onOpenLogin}
              className="bg-[#DFB15B] hover:bg-[#CFA14B] text-[#0A1F3E] px-3 py-1 rounded font-bold text-xs transition-all flex items-center gap-1 cursor-pointer shadow-xs"
            >
              <span>Officer Portal Login</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* HERO CONTAINER WITH BACKGROUND IMAGE & NAVIGATION */}
      <div className="relative min-h-[640px] lg:min-h-[720px] flex flex-col justify-between bg-[#071830] overflow-hidden">
        {/* Background Image: Farmer in wheat field */}
        <img
          src="https://images.pexels.com/photos/2301903/pexels-photo-2301903.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1100&w=1900"
          alt="Farmer Procurement Service - Harvest Field"
          className="absolute inset-0 w-full h-full object-cover object-center scale-105 brightness-110 contrast-[1.02]"
        />

        {/* Exact Hero Shade Gradient Overlay matching design */}
        <div className="hero-shade absolute inset-0 pointer-events-none"></div>

        {/* MAIN NAVIGATION BAR */}
        <header className="relative z-10 max-w-7xl w-full mx-auto px-4 sm:px-8 py-6 flex items-center justify-between gap-6">
          {/* Brand Logo */}
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-full border-2 border-white flex items-center justify-center bg-white shrink-0 shadow-md overflow-hidden">
              <img src="/Weblogo.png" alt="SAMARTH Logo" className="w-full h-full object-cover rounded-full" />
            </div>
            <div>
              <div className="font-serif text-2xl font-bold tracking-tight text-white leading-none drop-shadow-md">
                SAMARTH
              </div>
              <div className="text-[10px] font-bold tracking-wider text-[#DFB15B] uppercase mt-1 drop-shadow-sm">
                Smart Agricultural Management & Resource Tracking Hub
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center gap-8 text-sm font-semibold text-white drop-shadow-sm">
            <button onClick={() => scrollToSection("journey")} className="hover:text-[#DFB15B] transition-colors cursor-pointer">
              Procurement process
            </button>
            <button onClick={() => scrollToSection("locator")} className="hover:text-[#DFB15B] transition-colors cursor-pointer">
              Find a centre
            </button>
            <button onClick={() => scrollToSection("standards")} className="hover:text-[#DFB15B] transition-colors cursor-pointer">
              Quality standards
            </button>
            <button onClick={() => scrollToSection("help")} className="hover:text-[#DFB15B] transition-colors cursor-pointer">
              Farmer help
            </button>
          </nav>

          {/* Officer Dashboard Trigger */}
          <div className="flex items-center gap-3">
            {authUser ? (
              <button
                onClick={onEnterDashboard}
                className="hidden sm:flex items-center gap-2 bg-[#DFB15B] hover:bg-[#CFA14B] text-[#0A1F3E] px-5 py-2.5 rounded-full font-bold text-xs tracking-wider uppercase transition-all cursor-pointer shadow-lg"
              >
                <span>Enter Workstation ({authUser.role})</span>
              </button>
            ) : (
              <button
                onClick={onOpenLogin}
                className="hidden sm:flex items-center gap-2 border border-white/80 hover:border-white bg-black/25 hover:bg-black/40 backdrop-blur-md text-white px-5 py-2.5 rounded-full font-bold text-xs tracking-wider uppercase transition-all cursor-pointer drop-shadow-md"
              >
                <span>Staff Portal</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </header>

        {/* HERO CONTENT */}
        <div id="main-content" className="relative z-10 max-w-7xl w-full mx-auto px-4 sm:px-8 pt-12 pb-20 flex-1 flex flex-col justify-center">
          <div className="max-w-3xl space-y-6">
            {/* Gold Eyebrow */}
            <div className="flex items-center gap-3">
              <span className="w-8 h-[2px] bg-[#DFB15B]"></span>
              <span className="text-xs sm:text-sm font-bold tracking-[0.25em] text-[#DFB15B] uppercase">
                FROM FARM GATE TO FAIR PAYMENT
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl font-normal text-white leading-[1.08] tracking-tight">
              A dependable place for every harvest.
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-slate-200/90 font-normal max-w-2xl leading-relaxed">
              Transparent weighment, assured prices and timely payment at your nearest procurement centre.
            </p>

            {/* CTA Buttons */}
            <div className="pt-4 flex flex-wrap items-center gap-4">
              <button
                onClick={() => scrollToSection("locator")}
                className="bg-[#DEC181] hover:bg-[#DFB15B] text-[#0A1F3E] px-7 py-3.5 rounded font-bold text-sm tracking-wide transition-all cursor-pointer flex items-center gap-2 shadow-xl hover:translate-x-0.5"
              >
                <span>Find your centre</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => scrollToSection("journey")}
                className="border border-white/60 hover:border-white text-white hover:bg-white/10 px-7 py-3.5 rounded font-bold text-sm tracking-wide transition-all cursor-pointer backdrop-blur-xs"
              >
                Know the process
              </button>
            </div>
          </div>
        </div>

        {/* Scroll Prompt Banner */}
        <div className="relative z-10 max-w-7xl w-full mx-auto px-4 sm:px-8 pb-6 flex justify-end">
          <button
            onClick={() => scrollToSection("season-update")}
            className="text-[11px] font-bold tracking-[0.25em] text-white/70 hover:text-[#DFB15B] uppercase transition-colors flex items-center gap-2 cursor-pointer"
          >
            <span>— SCROLL TO LEARN</span>
          </button>
        </div>
      </div>

      {/* 2. SEASON UPDATE BANNER */}
      <div id="season-update" className="bg-[#F4F3EF] border-b border-[#E5E2D8] py-4 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4 text-xs sm:text-sm">
          <div className="flex items-center gap-3 flex-1 min-w-[280px]">
            <span className="font-bold tracking-wider text-[#DFB15B] uppercase shrink-0">
              | SEASON UPDATE
            </span>
            <p className="text-[#1B2B42] font-medium leading-normal">
              Kharif procurement is now open. Farmers are advised to carry their registration ID, bank passbook and land record.
            </p>
          </div>

          <button
            onClick={() => scrollToSection("journey")}
            className="text-[#10325B] hover:text-[#0A1F3E] font-bold flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer"
          >
            <span>View advisory</span>
            <ArrowRight className="w-4 h-4 text-[#DFB15B]" />
          </button>
        </div>
      </div>

      {/* 3. YOUR JOURNEY AT THE CENTRE */}
      <section id="journey" className="py-16 sm:py-24 px-4 sm:px-8 bg-[#F4F3EF]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          {/* Left Column Description */}
          <div className="lg:col-span-5 space-y-6">
            <div className="text-xs font-bold tracking-[0.2em] text-[#DFB15B] uppercase">
              SIMPLE AND ACCOUNTABLE
            </div>

            <h2 className="font-serif text-4xl sm:text-5xl font-normal text-[#0F284A] leading-tight">
              Your journey at the centre
            </h2>

            <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
              Every step is recorded and completed in your presence. Keep the receipt issued at the centre until payment is received.
            </p>
          </div>

          {/* Right Column Numbered Process Steps */}
          <div className="lg:col-span-7 space-y-8">
            <div className="border-t border-[#E3E0D5] pt-6 grid grid-cols-1 sm:grid-cols-12 gap-4 items-start">
              <div className="sm:col-span-2 font-serif text-2xl font-bold text-[#DFB15B]">01</div>
              <div className="sm:col-span-5 font-serif text-xl font-medium text-[#0F284A]">
                Register your arrival
              </div>
              <div className="sm:col-span-5 text-sm text-slate-600 leading-relaxed">
                Bring your farmer ID and crop details to the reception counter.
              </div>
            </div>

            <div className="border-t border-[#E3E0D5] pt-6 grid grid-cols-1 sm:grid-cols-12 gap-4 items-start">
              <div className="sm:col-span-2 font-serif text-2xl font-bold text-[#DFB15B]">02</div>
              <div className="sm:col-span-5 font-serif text-xl font-medium text-[#0F284A]">
                Quality assessment
              </div>
              <div className="sm:col-span-5 text-sm text-slate-600 leading-relaxed">
                The lot is sampled and graded in your presence using standard parameters.
              </div>
            </div>

            <div className="border-t border-[#E3E0D5] pt-6 grid grid-cols-1 sm:grid-cols-12 gap-4 items-start">
              <div className="sm:col-span-2 font-serif text-2xl font-bold text-[#DFB15B]">03</div>
              <div className="sm:col-span-5 font-serif text-xl font-medium text-[#0F284A]">
                Weighment & receipt
              </div>
              <div className="sm:col-span-5 text-sm text-slate-600 leading-relaxed">
                Produce is weighed on a certified scale and a digital receipt is issued.
              </div>
            </div>

            <div className="border-t border-[#E3E0D5] pt-6 grid grid-cols-1 sm:grid-cols-12 gap-4 items-start">
              <div className="sm:col-span-2 font-serif text-2xl font-bold text-[#DFB15B]">04</div>
              <div className="sm:col-span-5 font-serif text-xl font-medium text-[#0F284A]">
                Direct payment
              </div>
              <div className="sm:col-span-5 text-sm text-slate-600 leading-relaxed">
                The approved amount is transferred directly to your registered bank account.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. CENTRE LOCATOR SECTION */}
      <section id="locator" className="py-12 px-4 sm:px-8 bg-[#F4F3EF]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 overflow-hidden rounded-none shadow-xl border border-[#E3E0D5]">
          {/* Left Dark Navy Search Panel */}
          <div className="lg:col-span-6 bg-[#10325B] text-white p-8 sm:p-12 flex flex-col justify-between space-y-8">
            <div className="space-y-6">
              <div className="text-xs font-bold tracking-[0.2em] text-[#DFB15B] uppercase">
                CENTRE LOCATOR
              </div>

              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal leading-tight">
                Find where to bring your produce
              </h2>

              <p className="text-slate-200 text-sm sm:text-base leading-relaxed">
                Search by PIN code or village name to see the nearest active procurement centres and opening hours.
              </p>
            </div>

            {/* Interactive Search Bar */}
            <form onSubmit={handleSearch} className="space-y-3">
              <div className="flex items-center border-b border-[#244F84] pb-2 focus-within:border-[#DFB15B] transition-colors">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Enter PIN code or village"
                  className="w-full bg-transparent text-white placeholder-slate-300 text-sm focus:outline-none"
                />
                <button
                  type="submit"
                  className="bg-[#DEC181] hover:bg-[#DFB15B] text-[#0A1F3E] px-5 py-2.5 rounded font-bold text-xs tracking-wider uppercase shrink-0 transition-colors cursor-pointer flex items-center gap-1"
                >
                  <span>Search</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-[11px] text-slate-300">Location services are not required.</p>
            </form>
          </div>

          {/* Right Light Sand List Panel */}
          <div className="lg:col-span-6 bg-[#EEF0F2] p-8 sm:p-12 flex flex-col justify-between space-y-6">
            <div>
              <div className="flex items-center justify-between text-xs pb-3 border-b border-[#D5D8DC]">
                <div>
                  <span className="font-bold tracking-widest text-[#DFB15B] uppercase block text-[10px]">
                    NEARBY CENTRES
                  </span>
                  <h3 className="font-serif text-2xl font-normal text-[#0F284A] mt-0.5">
                    Erode district
                  </h3>
                </div>
                <span className="text-slate-500 font-medium text-xs">Updated today</span>
              </div>

              {/* List items */}
              <div className="divide-y divide-[#D5D8DC]">
                {filteredCentres.map((centre) => (
                  <div key={centre.id} className="py-5 flex items-start justify-between gap-4 group">
                    <div className="flex items-start gap-4">
                      <span className="font-serif text-lg font-bold text-[#DFB15B]">{centre.id}</span>
                      <div>
                        <h4 className="font-serif text-lg font-medium text-[#0F284A] group-hover:text-[#10325B] transition-colors">
                          {centre.name}
                        </h4>
                        <p className="text-xs text-slate-600 mt-1">{centre.address}</p>
                      </div>
                    </div>
                    <span className="font-bold text-xs text-[#0F284A] shrink-0 pt-1">{centre.distance}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. QUALITY STANDARDS / BEFORE YOU ARRIVE */}
      <section id="standards" className="py-16 sm:py-24 px-4 sm:px-8 bg-[#F4F3EF]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Image: Grain holding hands over yellow sack */}
          <div className="lg:col-span-6 rounded-none overflow-hidden shadow-2xl border border-[#E3E0D5]">
            <img
              src="https://images.pexels.com/photos/9854639/pexels-photo-9854639.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=900&w=1000"
              alt="Wheat Produce Quality Assessment"
              className="w-full h-[400px] sm:h-[500px] object-cover hover:scale-103 transition-transform duration-500"
            />
          </div>

          {/* Right Quality Standards Specs */}
          <div className="lg:col-span-6 space-y-6">
            <div className="text-xs font-bold tracking-[0.2em] text-[#DFB15B] uppercase">
              BEFORE YOU ARRIVE
            </div>

            <h2 className="font-serif text-3xl sm:text-5xl font-normal text-[#0F284A] leading-tight">
              Prepare your produce for acceptance
            </h2>

            <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
              Clean and properly dried produce receives faster assessment. Quality is checked against notified Fair Average Quality standards.
            </p>

            <div className="space-y-4 pt-2">
              <div className="border-t border-[#E3E0D5] pt-4 grid grid-cols-1 sm:grid-cols-12 gap-2 text-sm">
                <div className="sm:col-span-4 font-bold text-[#10325B]">Moisture</div>
                <div className="sm:col-span-8 text-slate-700">Within the notified limit for the crop</div>
              </div>

              <div className="border-t border-[#E3E0D5] pt-4 grid grid-cols-1 sm:grid-cols-12 gap-2 text-sm">
                <div className="sm:col-span-4 font-bold text-[#10325B]">Foreign matter</div>
                <div className="sm:col-span-8 text-slate-700">Produce should be clean and free of debris</div>
              </div>

              <div className="border-t border-[#E3E0D5] pt-4 grid grid-cols-1 sm:grid-cols-12 gap-2 text-sm">
                <div className="sm:col-span-4 font-bold text-[#10325B]">Packing</div>
                <div className="sm:col-span-8 text-slate-700">Use clean, dry and serviceable bags</div>
              </div>
            </div>

            <div className="pt-4">
              <button
                onClick={() => alert("Redirecting to notified Fair Average Quality (FAQ) standards documentation.")}
                className="text-[#10325B] hover:text-[#0A1F3E] font-bold text-sm flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>Read crop-wise standards</span>
                <ArrowRight className="w-4 h-4 text-[#DFB15B]" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 6. FARMER ASSISTANCE SECTION */}
      <section id="help" className="py-16 sm:py-20 px-4 sm:px-8 bg-[#EDE8DF] border-t border-b border-[#DFDAD0]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-6 space-y-4">
            <div className="text-xs font-bold tracking-[0.2em] text-[#DFB15B] uppercase">
              FARMER ASSISTANCE
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-normal text-[#0F284A]">
              Need help at any stage?
            </h2>
            <p className="text-slate-600 text-sm sm:text-base">
              Our support desk is available Monday to Saturday, 8:00 AM to 8:00 PM.
            </p>
          </div>

          <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                TOLL-FREE HELPLINE
              </span>
              <span className="font-serif text-2xl sm:text-3xl font-bold text-[#0F284A] block mt-1">
                1800 180 1551
              </span>
            </div>

            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                WRITE TO US
              </span>
              <span className="font-serif text-xl sm:text-2xl font-bold text-[#0F284A] block mt-1">
                help@smartprocure.gov.in
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 7. FOOTER BAR */}
      <footer className="bg-[#0A1F3E] text-slate-300 py-12 px-4 sm:px-8 border-t border-[#183963]">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex flex-wrap items-center justify-between gap-6 pb-8 border-b border-[#183963]">
            {/* Footer Brand Logo */}
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-full border border-white/60 flex items-center justify-center bg-white/10 shrink-0">
                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2v20M12 6c-3.5 0-6 2.5-6 6M12 12c3.5 0 6-2.5 6-6M12 18c-3.5 0-6-2.5-6-6" />
                </svg>
              </div>
              <div>
                <div className="font-serif text-xl font-bold tracking-tight text-white leading-none">
                  SmartProcure
                </div>
                <div className="text-[9px] font-bold tracking-[0.25em] text-[#DFB15B] uppercase mt-1">
                  FARMER PROCUREMENT SERVICE
                </div>
              </div>
            </div>

            {/* Footer Links */}
            <div className="flex flex-wrap items-center gap-6 text-xs font-medium text-slate-300">
              <a href="#accessibility" className="hover:text-white transition-colors">Accessibility</a>
              <a href="#policies" className="hover:text-white transition-colors">Website policies</a>
              <a href="#terms" className="hover:text-white transition-colors">Terms of use</a>
              <a href="#contact" className="hover:text-white transition-colors">Contact directory</a>
              {authUser ? (
                <button onClick={onEnterDashboard} className="text-[#DFB15B] hover:underline font-bold cursor-pointer">
                  Officer Dashboard
                </button>
              ) : (
                <button onClick={onOpenLogin} className="text-[#DFB15B] hover:underline font-bold cursor-pointer">
                  Officer Login
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400 font-medium">
            <div>Managed by the Department of Food & Public Distribution</div>
            <div>Last updated: 18 February 2026</div>
          </div>
        </div>
      </footer>
    </div>
  );
};
