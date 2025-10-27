import React, { useState } from 'react';
import { Network, Radio, Wifi, Settings, TrendingUp, Shield, Users, Zap, CheckCircle, ArrowRight, Signal, Antenna, Award, Target, Lightbulb, Clock } from 'lucide-react';
 
export default function Demo() {
  const [activeTab, setActiveTab] = useState(0);
 
  const services = [
    {
      title: 'Network Planning & Design',
      icon: Network,
      items: ['RF planning & propagation modeling', 'Backhaul and transport design', 'Capacity forecasting & traffic modeling', 'IBS, small cells, DAS solutions'],
      description: 'Laying the groundwork for a flawless network with meticulous planning and advanced tools.'
    },
    {
      title: 'Network Optimization',
      icon: TrendingUp,
      items: ['Drive test & benchmark audits', 'Neighbor optimization & handover tuning', 'Parameter tuning & KPI analytics', 'Root cause analysis'],
      description: 'Ensuring maximum network uptime and performance with continuous optimization.'
    },
    {
      title: 'Deployment & Integration',
      icon: Zap,
      items: ['Site installation & commissioning', 'Hardware integration (radios, antennas)', 'Civil & structural services', 'Fiber, microwave integration'],
      description: 'Building your network from the ground up with precision and speed.'
    },
    {
      title: 'Managed Services & O&M',
      icon: Settings,
      items: ['Proactive monitoring & fault management', 'Spare parts & site audits', '24×7 operations center', 'Multi-circle field operations'],
      description: 'Comprehensive maintenance to keep your network operating at peak efficiency.'
    },
    {
      title: 'Consulting & Advisory',
      icon: Lightbulb,
      items: ['Technology roadmap (4G→5G→beyond)', 'Spectrum planning & optimization', 'Network sharing models', 'Process audits & cost optimization'],
      description: 'Strategic guidance for technology evolution and business transformation.'
    },
    {
      title: 'Emerging Technologies',
      icon: Signal,
      items: ['IoT enablement & LPWAN design', 'Edge computing & MEC', 'AI/ML fault prediction', 'Automation & orchestration'],
      description: 'Deploying the networks of the future with cutting-edge technologies.'
    }
  ];
 
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section with Background Image */}
      <div className="relative bg-gradient-to-br from-blue-900 via-blue-700 to-blue-500 overflow-hidden">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30"
          style={{
            backgroundImage: 'url(https://png.pngtree.com/thumb_back/fw800/background/20250830/pngtree-blue-world-map-information-network-image_18675915.webp)'
          }}
        ></div>
 
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/80 via-blue-800/70 to-blue-600/60"></div>
 
        <div className="relative max-w-7xl mx-auto px-6 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="text-white z-10">
              <div className="text-sm mb-4 opacity-90 flex items-center gap-2">
                <span>Home</span>
                <ArrowRight className="w-4 h-4" />
                <span className="text-[#c2d8f6]">Telecom Solutions</span>
              </div>
              
              <h1 className="text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                Blue Data<br/>
                <span className="text-[#c2d8f6]">Consulting</span>
              </h1>
              
              <h2 className="text-2xl lg:text-3xl mb-6 font-light text-blue-100">
                Transforming Connectivity,<br/>Empowering Networks
              </h2>
              
              <p className="text-lg text-blue-100 mb-8 leading-relaxed">
                Building the infrastructure that powers tomorrow's communication with deep domain expertise in cellular and telecom network solutions.
              </p>
              
              <div className="flex flex-wrap gap-4">
                <button className="bg-[#c2d8f6] text-blue-900 px-8 py-4 rounded-lg font-bold hover:bg-white transition shadow-xl flex items-center gap-2">
                  Get in Touch <ArrowRight className="w-5 h-5" />
                </button>
                <button className="border-2 border-[#c2d8f6] text-[#c2d8f6] px-8 py-4 rounded-lg font-bold hover:bg-[#c2d8f6] hover:text-blue-900 transition">
                  Our Services
                </button>
              </div>
            </div>
 
            {/* Right Visual Area */}
            <div className="relative hidden lg:flex items-center justify-center">
              {/* Animated Circles */}
              <div className="relative w-96 h-96">
                {/* Outer Circle */}
                <div className="absolute inset-0 rounded-full border-4 border-[#c2d8f6] border-opacity-30 animate-pulse"></div>
                
                {/* Middle Circle */}
                <div className="absolute inset-8 rounded-full border-4 border-[#c2d8f6] border-opacity-50"></div>
                
                {/* Inner Circle */}
                <div className="absolute inset-16 rounded-full bg-gradient-to-br from-[#c2d8f6] to-blue-400 flex items-center justify-center shadow-2xl">
                  <div className="text-center text-white p-8">
                    <Network className="w-20 h-20 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold mb-2">End-to-End</h3>
                    <p className="text-sm">Telecom Solutions</p>
                  </div>
                </div>
 
                {/* Floating Icons */}
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-4">
                  <div className="bg-white bg-opacity-20 backdrop-blur-lg rounded-full p-4 shadow-xl border border-white border-opacity-30">
                    <Signal className="w-8 h-8 text-white" />
                  </div>
                </div>
                
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-4">
                  <div className="bg-white bg-opacity-20 backdrop-blur-lg rounded-full p-4 shadow-xl border border-white border-opacity-30">
                    <Settings className="w-8 h-8 text-white" />
                  </div>
                </div>
                
                <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-4">
                  <div className="bg-white bg-opacity-20 backdrop-blur-lg rounded-full p-4 shadow-xl border border-white border-opacity-30">
                    <Antenna className="w-8 h-8 text-white" />
                  </div>
                </div>
                
                <div className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-4">
                  <div className="bg-white bg-opacity-20 backdrop-blur-lg rounded-full p-4 shadow-xl border border-white border-opacity-30">
                    <Radio className="w-8 h-8 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
 
        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white"/>
          </svg>
        </div>
      </div>
 
      {/* Stats Bar */}
      <div className="relative -mt-16 z-10">
        <div className="max-w-6xl mx-auto px-6">
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">500+</div>
                <div className="text-gray-600 text-sm">Projects Delivered</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">24/7</div>
                <div className="text-gray-600 text-sm">Support Available</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">98%</div>
                <div className="text-gray-600 text-sm">Client Satisfaction</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">15+</div>
                <div className="text-gray-600 text-sm">Years Experience</div>
              </div>
            </div>
          </div>
        </div>
      </div>
 
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        {/* Introduction */}
        <div className="text-center mb-20">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Building the <span className="text-blue-600">Future of Telecom</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            We empower businesses, operators, and communities through next-generation telecom infrastructure and managed services with decades of industry experience.
          </p>
        </div>
 
        {/* Core Services Grid */}
        <div className="mb-24">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Our Core Services</h3>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-600 to-[#c2d8f6] mx-auto rounded-full"></div>
          </div>
 
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: Network, title: 'Network Planning & Design', desc: 'RF expertise, site surveys, and optimal coverage design for greenfield and expansion projects.' },
              { icon: Zap, title: 'End-to-End Deployment', desc: 'Turnkey infrastructure rollout from towers to small cells, delivered quickly and safely.' },
              { icon: Wifi, title: 'FTTH & FTTx Solutions', desc: 'High-quality fiber networks with pole-to-pole, underground, and last-mile connectivity.' },
              { icon: Radio, title: 'In-Building Solutions', desc: 'Superior indoor coverage for enterprises, malls, hospitals, and metro stations.' },
              { icon: TrendingUp, title: 'Network Optimization', desc: 'Drive testing, benchmarking, and RF optimization to enhance performance.' },
              { icon: Settings, title: 'Project Management', desc: 'Complete oversight from planning to execution with experienced professionals.' },
              { icon: Shield, title: 'Managed Services & AMC', desc: 'Preventive maintenance, remote monitoring, and 24/7 support for all equipment.' },
              { icon: Users, title: 'Training & Development', desc: 'Upskilling programs for emerging telecom standards and technologies.' },
              { icon: Signal, title: 'Emerging Technologies', desc: 'IoT, 5G, AI/ML solutions for future-ready network infrastructure.' }
            ].map((service, i) => (
              <div key={i} className="group relative bg-gradient-to-br from-white to-blue-50 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-blue-100 hover:border-[#c2d8f6]">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#c2d8f6] to-transparent opacity-20 rounded-bl-full"></div>
                <div className="relative">
                  <div className="bg-gradient-to-br from-blue-600 to-blue-400 w-16 h-16 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                    <service.icon className="w-8 h-8 text-white" />
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 mb-3">{service.title}</h4>
                  <p className="text-gray-600 leading-relaxed">{service.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
 
        {/* Comprehensive Service Portfolio with Tabs */}
        <div className="mb-24">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Comprehensive Service Portfolio</h3>
            <p className="text-gray-600">Complete lifecycle support across all telecom operations</p>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-600 to-[#c2d8f6] mx-auto rounded-full mt-4"></div>
          </div>
 
          {/* Tab Navigation */}
          <div className="bg-white rounded-2xl shadow-lg p-4 mb-8">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {services.map((service, index) => {
                const IconComponent = service.icon;
                return (
                  <button
                    key={index}
                    onClick={() => setActiveTab(index)}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl transition-all duration-300 ${
                      activeTab === index
                        ? 'bg-gradient-to-br from-blue-600 to-blue-400 text-white shadow-lg scale-105'
                        : 'bg-gray-50 text-gray-600 hover:bg-[#c2d8f6] hover:text-blue-900'
                    }`}
                  >
                    <IconComponent className="w-6 h-6" />
                    <span className="text-xs font-semibold text-center leading-tight">{service.title}</span>
                  </button>
                );
              })}
            </div>
          </div>
 
          {/* Tab Content */}
          <div className="bg-gradient-to-br from-blue-50 to-white rounded-2xl p-8 md:p-12 shadow-xl">
            <div className="grid md:grid-cols-2 gap-8 items-start">
              <div>
                <div className="flex items-center gap-4 mb-6">
                  {React.createElement(services[activeTab].icon, {
                    className: "w-12 h-12 text-blue-600"
                  })}
                  <h4 className="text-3xl font-bold text-gray-900">{services[activeTab].title}</h4>
                </div>
                <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                  {services[activeTab].description}
                </p>
                <div className="bg-white rounded-xl p-6 shadow-md border-l-4 border-blue-600">
                  <h5 className="font-bold text-gray-900 mb-4 text-lg">Key Offerings:</h5>
                  <ul className="space-y-3">
                    {services[activeTab].items.map((item, j) => (
                      <li key={j} className="flex items-start gap-3 text-gray-700">
                        <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="relative h-full min-h-[400px] hidden md:block">
                <div className="absolute inset-0 bg-gradient-to-br from-[#c2d8f6] to-blue-200 rounded-2xl opacity-20"></div>
                <div className="relative h-full flex items-center justify-center p-8">
                  {React.createElement(services[activeTab].icon, {
                    className: "w-64 h-64 text-blue-600 opacity-10"
                  })}
                </div>
              </div>
            </div>
          </div>
 
          <div className="mt-10 bg-gradient-to-r from-blue-600 to-blue-400 rounded-2xl p-8 text-center text-white shadow-xl">
            <p className="text-lg font-semibold">
              Our Approach: Assessment → Design → Pilot → Rollout → Optimization → Sustain
            </p>
          </div>
        </div>
 
        {/* Why Choose Section - Blue Theme Only */}
        <div className="mb-24">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Blue Data?</h3>
            <p className="text-gray-600">Your strategic partner for telecom transformation</p>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-600 to-[#c2d8f6] mx-auto rounded-full mt-4"></div>
          </div>
 
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {[
              {
                icon: Network,
                title: 'End-to-End Capability',
                desc: 'Single partner for planning, deployment, optimization & operations',
                stat: '360°'
              },
              {
                icon: Award,
                title: 'Technical Excellence',
                desc: 'Engineers with hands-on RF, transport, data expertise',
                stat: '15+ Years'
              },
              {
                icon: Target,
                title: 'Scalable Footprint',
                desc: 'Multi-circle, multi-city rollout capabilities',
                stat: 'Pan-India'
              },
              {
                icon: Shield,
                title: 'Quality & Accountability',
                desc: 'Industry best practices, SLAs, KPIs, audits',
                stat: '98% SLA'
              },
              {
                icon: Lightbulb,
                title: 'Innovation Driven',
                desc: 'AI/automation adoption, reduced OPEX',
                stat: '30% Savings'
              },
              {
                icon: Users,
                title: 'Client-Centric',
                desc: 'Custom solutions, not one-size-fits-all',
                stat: '100+ Clients'
              }
            ].map((item, i) => {
              const IconComponent = item.icon;
              return (
                <div key={i} className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-blue-100">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#c2d8f6] to-blue-200 opacity-20 rounded-bl-full transition-all group-hover:scale-150"></div>
                  <div className="relative">
                    <div className="bg-gradient-to-br from-blue-600 to-blue-400 w-16 h-16 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg">
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>
                    <div className="text-3xl font-bold text-[#c2d8f6] mb-3">{item.stat}</div>
                    <h4 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h4>
                    <p className="text-gray-600">{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
 
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-[#c2d8f6] to-blue-100 rounded-2xl p-8 shadow-lg">
              <h4 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <Clock className="w-8 h-8 text-blue-600" />
                Our Commitment
              </h4>
              <div className="space-y-4">
                {[
                  'Proven expertise & innovative vision',
                  'Partnerships with leading OEMs',
                  '24/7 support & nationwide presence',
                  'Quality, compliance & sustainable growth'
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-400 rounded-lg flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-gray-700 font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="relative overflow-hidden rounded-2xl shadow-lg">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-900 to-blue-600"></div>
              <div className="absolute inset-0 opacity-10">
                <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <pattern id="commitment-pattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                      <circle cx="20" cy="20" r="1.5" fill="white"/>
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#commitment-pattern)"/>
                </svg>
              </div>
              <div className="relative p-8 text-white">
                <Target className="w-12 h-12 mb-4 text-[#c2d8f6]" />
                <h4 className="text-2xl font-bold mb-4">Strategic Partnership</h4>
                <p className="text-blue-100 leading-relaxed text-lg">
                  We're not just a vendor—we're your strategic partner helping you reduce costs, improve performance, and adapt to change in the dynamic telecom landscape.
                </p>
              </div>
            </div>
          </div>
        </div>
 
        {/* Partners & Clients Section */}
        <div className="mb-24">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Our Clients & Partners</h3>
            <p className="text-gray-600">Trusted by leading telecom operators and technology providers</p>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-600 to-[#c2d8f6] mx-auto rounded-full mt-4"></div>
          </div>
 
          <div className="bg-gradient-to-br from-blue-50 to-white rounded-3xl p-12 shadow-lg">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
              {[
                { name: 'Telecom Operator', type: 'Major Operator' },
                { name: 'Equipment Vendor', type: 'Radio & Transport' },
                { name: 'Technology Provider', type: 'AI/ML & IoT' },
                { name: 'Infrastructure Partner', type: 'Civil & Power' },
                { name: 'OEM Partner', type: 'Network Equipment' },
                { name: 'Enterprise Client', type: 'Corporate Solutions' },
                { name: 'Government Project', type: 'Public Infrastructure' },
                { name: 'System Integrator', type: 'Technology Partner' }
              ].map((partner, i) => (
                <div key={i} className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-shadow text-center group">
                  <div className="w-full h-24 bg-gradient-to-br from-[#c2d8f6] to-blue-100 rounded-lg mb-4 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <div className="text-4xl font-bold text-blue-600 opacity-50">
                      {partner.name.charAt(0)}
                    </div>
                  </div>
                  <h5 className="font-bold text-gray-900 text-sm mb-1">{partner.name}</h5>
                  <p className="text-xs text-gray-500">{partner.type}</p>
                </div>
              ))}
            </div>
 
            <div className="bg-gradient-to-r from-blue-600 to-blue-400 rounded-2xl p-8 text-center text-white">
              <p className="text-xl font-semibold mb-2">
                Serving 100+ Clients Across India
              </p>
              <p className="text-blue-100">
                From tier-1 operators to emerging technology providers
              </p>
            </div>
          </div>
        </div>
 
        {/* Case Studies */}
        <div className="mb-24">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Success Stories</h3>
            <p className="text-gray-600 mb-6">Delivering excellence across the nation</p>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-600 to-[#c2d8f6] mx-auto rounded-full"></div>
          </div>
 
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: 'City-wide LTE Rollout', subtitle: 'Tier-2 Region', desc: 'Complete network deployment with optimized coverage', tag: 'Case Study A' },
              { title: 'KPI Improvement', subtitle: 'Optimization Project', desc: 'Enhanced performance for existing infrastructure', tag: 'Case Study B' },
              { title: 'IoT Network Deployment', subtitle: 'Smart Infrastructure', desc: 'Connected city solutions implementation', tag: 'Case Study C' }
            ].map((study, i) => (
              <div key={i} className="group relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300">
                <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-600 to-[#c2d8f6]"></div>
                <div className="p-8">
                  <div className="inline-block bg-gradient-to-r from-blue-600 to-blue-400 text-white text-sm font-bold px-4 py-2 rounded-full mb-4">
                    {study.tag}
                  </div>
                  <h4 className="text-2xl font-bold text-gray-900 mb-2">{study.title}</h4>
                  <p className="text-blue-600 font-semibold mb-4">{study.subtitle}</p>
                  <p className="text-gray-600 mb-6">{study.desc}</p>
                  <button className="flex items-center gap-2 text-blue-600 font-semibold group-hover:gap-3 transition-all">
                    View Details <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
 
        {/* CTA Section */}
        <div className="relative rounded-3xl overflow-hidden shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900 via-blue-700 to-blue-600"></div>
          <div className="absolute inset-0 opacity-10">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="cta-pattern" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
                  <circle cx="30" cy="30" r="2" fill="white"/>
                  <line x1="15" y1="15" x2="30" y2="30" stroke="white" strokeWidth="0.5"/>
                  <line x1="30" y1="30" x2="45" y2="45" stroke="white" strokeWidth="0.5"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#cta-pattern)"/>
            </svg>
          </div>
          <div className="relative px-12 py-20 text-center text-white">
            <h3 className="text-4xl lg:text-5xl font-bold mb-6">Ready to Transform Your Network?</h3>
            <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
              Partner with us to build, enhance, and manage world-class telecom infrastructure
            </p>
            <div className="text-2xl font-light mb-10 text-[#c2d8f6]">
              Empower Connectivity · Enable Progress · Choose Blue Data
            </div>
            <button className="bg-[#c2d8f6] text-blue-900 px-12 py-5 rounded-xl font-bold text-lg hover:bg-white transition shadow-2xl inline-flex items-center gap-3 group">
              Get Started Today
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
 
      
    </div>
  );
}
 