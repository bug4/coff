import React, { useState, useRef } from 'react';
import { Download, Twitter, Share2, Scroll, Sparkles, Flame, X, Users } from 'lucide-react';
import { supabase, type Confession } from './lib/supabase';

function App() {
  const [currentStep, setCurrentStep] = useState<'landing' | 'confess' | 'certificate' | 'gallery'>('landing');
  const [name, setName] = useState('');
  const [confession, setConfession] = useState('');
  const [severity, setSeverity] = useState('Minor');
  const [mode, setMode] = useState<'heaven' | 'hell'>('heaven');
  const [currentCertificate, setCurrentCertificate] = useState<Confession | null>(null);
  const [confessions, setConfessions] = useState<Confession[]>([]);
  const [loading, setLoading] = useState(false);
  const certificateRef = useRef<HTMLDivElement>(null);

  // Load confessions from Supabase
  const loadConfessions = async () => {
    try {
      const { data, error } = await supabase
        .from('confessions')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setConfessions(data || []);
    } catch (error) {
      console.error('Error loading confessions:', error);
    }
  };

  // Load confessions when component mounts or when viewing gallery
  React.useEffect(() => {
    if (currentStep === 'gallery') {
      loadConfessions();
    }
  }, [currentStep]);

  const handleConfession = async () => {
    if (!name.trim() || !confession.trim() || !severity.trim()) return;
    
    setLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('confessions')
        .insert([
          {
            name: name.trim(),
            confession: confession.trim(),
            severity: severity.trim(),
            mode,
          }
        ])
        .select()
        .single();
      
      if (error) throw error;
      
      const newConfession: Confession = data;
      setCurrentCertificate(newConfession);
      setCurrentStep('certificate');
      setName('');
      setConfession('');
      setSeverity('Minor');
    } catch (error) {
      console.error('Error creating confession:', error);
      alert('Failed to create confession. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const downloadCertificate = async () => {
    if (!certificateRef.current || !currentCertificate) return;
    
    try {
      // Use html2canvas-like approach by converting the DOM element to canvas
      const element = certificateRef.current;
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) return;
      
      // Set canvas size to match the certificate
      canvas.width = 1200;
      canvas.height = 800;
      
      // Create background
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      if (mode === 'heaven') {
        gradient.addColorStop(0, '#fffbeb');
        gradient.addColorStop(0.5, '#fef3c7');
        gradient.addColorStop(1, '#fed7aa');
      } else {
        gradient.addColorStop(0, '#450a0a');
        gradient.addColorStop(0.5, '#7f1d1d');
        gradient.addColorStop(1, '#991b1b');
      }
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Add decorative border
      ctx.strokeStyle = mode === 'heaven' ? '#facc15' : '#dc2626';
      ctx.lineWidth = 8;
      ctx.strokeRect(40, 40, canvas.width - 80, canvas.height - 80);
      ctx.strokeRect(60, 60, canvas.width - 120, canvas.height - 120);
      
      // Set text properties
      ctx.textAlign = 'center';
      ctx.fillStyle = mode === 'heaven' ? '#78350f' : '#fecaca';
      
      // Title
      ctx.font = 'bold 48px serif';
      ctx.fillText('Certificate of Forgiveness', canvas.width / 2, 150);
      
      // Divider line
      ctx.fillStyle = mode === 'heaven' ? '#facc15' : '#dc2626';
      ctx.fillRect(canvas.width / 2 - 100, 170, 200, 4);
      
      // "This certifies that" text
      ctx.fillStyle = mode === 'heaven' ? '#92400e' : '#fca5a5';
      ctx.font = '24px serif';
      ctx.fillText('This certifies that', canvas.width / 2, 220);
      
      // Name
      ctx.fillStyle = mode === 'heaven' ? '#78350f' : '#fecaca';
      ctx.font = 'bold 36px serif';
      ctx.fillText(currentCertificate.name, canvas.width / 2, 280);
      
      // Confession box background
      ctx.fillStyle = mode === 'heaven' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)';
      ctx.fillRect(150, 320, canvas.width - 300, 120);
      ctx.strokeStyle = mode === 'heaven' ? '#fcd34d' : '#dc2626';
      ctx.lineWidth = 2;
      ctx.strokeRect(150, 320, canvas.width - 300, 120);
      
      // Confession text
      ctx.fillStyle = mode === 'heaven' ? '#92400e' : '#fca5a5';
      ctx.font = 'italic 20px serif';
      const confessionWords = currentCertificate.confession.split(' ');
      let line = '';
      let y = 360;
      
      for (let n = 0; n < confessionWords.length; n++) {
        const testLine = line + confessionWords[n] + ' ';
        const metrics = ctx.measureText(testLine);
        if (metrics.width > 800 && n > 0) {
          ctx.fillText(`"${line.trim()}"`, canvas.width / 2, y);
          line = confessionWords[n] + ' ';
          y += 30;
        } else {
          line = testLine;
        }
      }
      if (line.trim()) {
        ctx.fillText(`"${line.trim()}"`, canvas.width / 2, y);
      }
      
      // Severity
      ctx.font = '18px serif';
      ctx.fillText(`Severity: ${currentCertificate.severity}`, canvas.width / 2, 480);
      
      // Forgiveness text
      ctx.font = '24px serif';
      ctx.fillText('This soul is hereby forgiven by Heaven.xyz', canvas.width / 2, 530);
      
      // Approval stamp
      ctx.fillStyle = mode === 'heaven' ? '#facc15' : '#dc2626';
      ctx.fillRect(canvas.width / 2 - 120, 550, 240, 40);
      ctx.fillStyle = mode === 'heaven' ? '#78350f' : '#ffffff';
      ctx.font = 'bold 18px serif';
      ctx.fillText(mode === 'heaven' ? '✅ Archangel Approved' : '✅ Reluctantly Forgiven', canvas.width / 2, 575);
      
      // Serial and date
      ctx.fillStyle = mode === 'heaven' ? '#a16207' : '#f87171';
      ctx.font = '14px serif';
      ctx.fillText(`Serial: ${currentCertificate.id} | Date: ${currentCertificate.date}`, canvas.width / 2, 720);
      
      // Convert to blob and download
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `forgiveness-certificate-${currentCertificate.id}.png`;
          a.click();
          URL.revokeObjectURL(url);
        }
      });
    } catch (error) {
      console.error('Error generating certificate:', error);
    }
  };

  const shareOnTwitter = () => {
    const text = `I just received my Certificate of Forgiveness for: "${currentCertificate?.confession}" 🙏✨ Get yours at Heaven.xyz`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
  };

  const likeConfession = async (id: string) => {
    try {
      // Get current confession to increment likes
      const confession = confessions.find(c => c.id === id);
      if (!confession) return;
      
      const { error } = await supabase
        .from('confessions')
        .update({ likes: confession.likes + 1 })
        .eq('id', id);
      
      if (error) throw error;
      
      // Update local state
      setConfessions(prev => 
        prev.map(c => c.id === id ? { ...c, likes: c.likes + 1 } : c)
      );
    } catch (error) {
      console.error('Error liking confession:', error);
    }
  };

  const handleCertificateClick = () => {
    // Go to confession form to create a new certificate
    setCurrentStep('confess');
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Video */}
      <div className="fixed inset-0">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover"
        >
          <source src="/video.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
      </div>

      {/* Top Navigation */}
      <div className="fixed top-6 left-6 right-6 z-50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => window.open('https://x.com/ForgivenessCert', '_blank')}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-black text-white hover:bg-gray-800 transition-all"
          >
            <X size={16} />
            Follow Us
          </button>
          <button
            onClick={() => window.open('https://x.com/i/communities/1960103139304251405', '_blank')}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-all"
          >
            <Users size={16} />
            Community
          </button>
        </div>
        <div className="flex items-center gap-3">
        <button
          onClick={() => setMode('heaven')}
          className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
            mode === 'heaven' 
              ? 'bg-yellow-400 text-yellow-900 shadow-lg shadow-yellow-400/50' 
              : 'bg-white/20 backdrop-blur-sm text-white hover:bg-white/30'
          }`}
        >
          <Sparkles size={16} />
          Heaven
        </button>
        <button
          onClick={() => setMode('hell')}
          className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
            mode === 'hell' 
              ? 'bg-red-600 text-white shadow-lg shadow-red-600/50' 
              : 'bg-white/20 backdrop-blur-sm text-white hover:bg-white/30'
          }`}
        >
          <Flame size={16} />
          Hell
        </button>
        </div>
      </div>

      {/* Landing Page */}
      {currentStep === 'landing' && (
        <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-6">
          {/* Main Title */}
          <div className="text-center mb-16">
            <h1 className="text-6xl md:text-8xl font-graphik-light text-white mb-4 tracking-wider">
              Certificate of Forgiveness
            </h1>
            <p className="text-xl md:text-2xl text-white/80 font-graphik-light">
              Unburden your soul and receive divine forgiveness
            </p>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl w-full mb-12">
            {/* Confess Card */}
            <div className="group relative bg-black/60 backdrop-blur-md rounded-2xl p-8 border border-white/10 hover:bg-black/70 transition-all duration-300 cursor-pointer"
                 onClick={() => setCurrentStep('confess')}>
              <div className="text-center">
                <div className={`w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center ${
                  mode === 'heaven' ? 'bg-yellow-400/20' : 'bg-red-400/20'
                }`}>
                  <Scroll className={`${
                    mode === 'heaven' ? 'text-yellow-400' : 'text-red-400'
                  }`} size={32} />
                </div>
                <h3 className="text-2xl font-graphik text-white mb-3">CONFESS</h3>
                <p className="text-white/70 font-graphik-light mb-6">
                  Share your sins and seek forgiveness
                </p>
                <div className="text-sm text-white/50 font-graphik-light">
                  Start your journey →
                </div>
              </div>
            </div>

            {/* Gallery Card */}
            <div className="group relative bg-black/60 backdrop-blur-md rounded-2xl p-8 border border-white/10 hover:bg-black/70 transition-all duration-300 cursor-pointer"
                 onClick={() => setCurrentStep('gallery')}>
              <div className="text-center">
                <div className={`w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center ${
                  mode === 'heaven' ? 'bg-yellow-400/20' : 'bg-red-400/20'
                }`}>
                  <Users className={`${
                    mode === 'heaven' ? 'text-yellow-400' : 'text-red-400'
                  }`} size={32} />
                </div>
                <h3 className="text-2xl font-graphik text-white mb-3">GALLERY</h3>
                <p className="text-white/70 font-graphik-light mb-6">
                  View public confessions from others
                </p>
                <div className="text-sm text-white/50 font-graphik-light">
                  {confessions.length} confessions
                </div>
              </div>
            </div>

            {/* Certificate Card */}
            <div className="group relative bg-black/60 backdrop-blur-md rounded-2xl p-8 border border-white/10 hover:bg-black/70 transition-all duration-300 cursor-pointer"
                 onClick={handleCertificateClick}>
              <div className="text-center">
                <div className={`w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center ${
                  mode === 'heaven' ? 'bg-yellow-400/20' : 'bg-red-400/20'
                }`}>
                  <Download className={`${
                    mode === 'heaven' ? 'text-yellow-400' : 'text-red-400'
                  }`} size={32} />
                </div>
                <h3 className="text-2xl font-graphik text-white mb-3">CERTIFICATE</h3>
                <p className="text-white/70 font-graphik-light mb-6">
                  Create your certificate of forgiveness
                </p>
                <div className="text-sm text-white/50 font-graphik-light">
                  Get started →
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              onClick={() => setCurrentStep('confess')}
              className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white rounded-full border border-white/20 hover:bg-white/20 transition-all duration-300 font-graphik"
            >
              + Begin Confession
            </button>
            <button
              onClick={() => setCurrentStep('gallery')}
              className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white rounded-full border border-white/20 hover:bg-white/20 transition-all duration-300 font-graphik"
            >
              📋 View All Confessions
            </button>
          </div>
        </div>
      )}

      {/* Confession Form */}
      {currentStep === 'confess' && (
        <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
          <div className={`w-full max-w-2xl bg-gradient-to-br ${
            mode === 'heaven' 
              ? 'from-yellow-50 to-amber-100 border-yellow-300' 
              : 'from-red-950 to-red-900 border-red-700'
          } border-2 rounded-3xl p-8 shadow-2xl transform transition-all duration-500`}>
            <h2 className={`text-4xl font-bold text-center mb-8 ${
              mode === 'heaven' ? 'text-yellow-900' : 'text-red-100'
            } font-serif`}>
              Confess Your Sins
            </h2>
            
            <div className="space-y-6">
              <div>
                <label className={`block text-lg font-medium mb-2 ${
                  mode === 'heaven' ? 'text-yellow-800' : 'text-red-200'
                }`}>
                  Your Name (or @handle)
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your Name or X @handle"
                  className={`w-full p-4 rounded-xl border-2 text-lg transition-all ${
                    mode === 'heaven'
                      ? 'border-yellow-300 focus:border-yellow-500 bg-white/80 text-yellow-900'
                      : 'border-red-700 focus:border-red-500 bg-red-950/50 text-red-100 placeholder-red-400'
                  } focus:outline-none focus:ring-2 focus:ring-opacity-50`}
                />
              </div>
              
              <div>
                <label className={`block text-lg font-medium mb-2 ${
                  mode === 'heaven' ? 'text-yellow-800' : 'text-red-200'
                }`}>
                  Severity Level
                </label>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value)}
                  className={`w-full p-4 rounded-xl border-2 text-lg transition-all ${
                    mode === 'heaven'
                      ? 'border-yellow-300 focus:border-yellow-500 bg-white/80 text-yellow-900'
                      : 'border-red-700 focus:border-red-500 bg-red-950/50 text-red-100'
                  } focus:outline-none focus:ring-2 focus:ring-opacity-50`}
                >
                  <option value="Minor">Minor Sin</option>
                  <option value="Moderate">Moderate Sin</option>
                  <option value="Major">Major Sin</option>
                  <option value="Unforgivable">Just Take Me To Hell</option>
                </select>
              </div>
              
              <div>
                <label className={`block text-lg font-medium mb-2 ${
                  mode === 'heaven' ? 'text-yellow-800' : 'text-red-200'
                }`}>
                  Your Confession (max 200 characters)
                </label>
                <textarea
                  value={confession}
                  onChange={(e) => setConfession(e.target.value.slice(0, 200))}
                  placeholder="I think i was born black, what do i do?"
                  rows={4}
                  className={`w-full p-4 rounded-xl border-2 text-lg transition-all resize-none ${
                    mode === 'heaven'
                      ? 'border-yellow-300 focus:border-yellow-500 bg-white/80 text-yellow-900'
                      : 'border-red-700 focus:border-red-500 bg-red-950/50 text-red-100 placeholder-red-400'
                  } focus:outline-none focus:ring-2 focus:ring-opacity-50`}
                />
                <p className={`text-sm mt-1 ${
                  mode === 'heaven' ? 'text-yellow-700' : 'text-red-300'
                }`}>
                  {confession.length}/200 characters
                </p>
              </div>
            </div>
            
            <div className="flex justify-center gap-4 mt-8">
              <button
                onClick={() => setCurrentStep('landing')}
                className={`px-6 py-3 rounded-xl transition-all ${
                  mode === 'heaven'
                    ? 'bg-white/50 text-yellow-900 hover:bg-white/70'
                    : 'bg-red-900/50 text-red-200 hover:bg-red-900/70'
                }`}
              >
                Back
              </button>
              <button
                onClick={handleConfession}
                disabled={!name.trim() || !confession.trim() || !severity.trim() || loading}
                className={`px-8 py-3 text-xl font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                  mode === 'heaven'
                    ? 'bg-gradient-to-r from-yellow-400 to-amber-500 text-yellow-900 hover:from-yellow-300 hover:to-amber-400 shadow-lg shadow-yellow-400/50'
                    : 'bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-500 hover:to-red-600 shadow-lg shadow-red-600/50'
                } transform hover:scale-105 hover:-translate-y-1`}
              >
                {loading ? 'Creating...' : 'Forgive Me'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Certificate Display */}
      {currentStep === 'certificate' && currentCertificate && (
        <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
          <div className="w-full max-w-4xl">
            <div 
              ref={certificateRef}
              className={`relative mx-auto w-full max-w-3xl bg-gradient-to-br ${
                mode === 'heaven' 
                  ? 'from-yellow-50 via-amber-50 to-orange-100' 
                  : 'from-red-950 via-red-900 to-red-800'
              } rounded-3xl p-12 shadow-2xl transform transition-all duration-500 hover:scale-105`}
              style={{
                backgroundImage: mode === 'heaven' 
                  ? `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h100v100H0z' fill='%23f7f3e8'/%3E%3Cpath d='M0 0h100v100H0z' fill='url(%23a)' opacity='.1'/%3E%3Cdefs%3E%3Cpattern id='a' width='20' height='20' patternUnits='userSpaceOnUse'%3E%3Cpath d='M0 0h20v20H0z' fill='%23d97706'/%3E%3C/pattern%3E%3C/defs%3E%3C/svg%3E")`
                  : `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h100v100H0z' fill='%23451a03'/%3E%3Cpath d='M0 0h100v100H0z' fill='url(%23a)' opacity='.1'/%3E%3Cdefs%3E%3Cpattern id='a' width='20' height='20' patternUnits='userSpaceOnUse'%3E%3Cpath d='M0 0h20v20H0z' fill='%23dc2626'/%3E%3C/pattern%3E%3C/defs%3E%3C/svg%3E")`
              }}
            >
              {/* Decorative Border */}
              <div className={`absolute inset-4 border-4 rounded-2xl ${
                mode === 'heaven' ? 'border-yellow-400' : 'border-red-600'
              } border-double`}></div>
              
              <div className="relative z-10 text-center">
                <h1 className={`text-5xl md:text-6xl font-bold mb-6 ${
                  mode === 'heaven' ? 'text-yellow-900' : 'text-red-100'
                } font-serif tracking-wide`}>
                  Certificate of Forgiveness
                </h1>
                
                <div className={`w-32 h-1 mx-auto mb-8 ${
                  mode === 'heaven' ? 'bg-yellow-400' : 'bg-red-600'
                }`}></div>
                
                <p className={`text-2xl mb-4 ${
                  mode === 'heaven' ? 'text-yellow-800' : 'text-red-200'
                }`}>
                  This certifies that
                </p>
                
                <h2 className={`text-4xl md:text-5xl font-bold mb-8 ${
                  mode === 'heaven' ? 'text-yellow-900' : 'text-red-100'
                } font-serif`}>
                  {currentCertificate.name}
                </h2>
                
                <div className={`flex justify-center mb-6 text-lg ${
                  mode === 'heaven' ? 'text-yellow-700' : 'text-red-300'
                }`}>
                  <span className="font-medium">
                    Severity: <span className="font-bold">{currentCertificate.severity}</span>
                  </span>
                </div>
                
                <div className={`bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-8 border ${
                  mode === 'heaven' ? 'border-yellow-300' : 'border-red-600'
                }`}>
                  <p className={`text-xl italic ${
                    mode === 'heaven' ? 'text-yellow-800' : 'text-red-200'
                  }`}>
                    "{currentCertificate.confession}"
                  </p>
                </div>
                
                <p className={`text-2xl mb-6 ${
                  mode === 'heaven' ? 'text-yellow-800' : 'text-red-200'
                }`}>
                  This soul is hereby forgiven by Heaven.xyz
                </p>
                
                <div className={`inline-flex items-center gap-3 px-6 py-3 rounded-full ${
                  mode === 'heaven' 
                    ? 'bg-yellow-400 text-yellow-900' 
                    : 'bg-red-600 text-white'
                } font-bold text-lg shadow-lg animate-pulse`}>
                  ✅ {mode === 'heaven' ? 'Archangel Approved' : 'Reluctantly Forgiven'}
                </div>
                
                <div className={`mt-8 text-sm ${
                  mode === 'heaven' ? 'text-yellow-700' : 'text-red-300'
                }`}>
                  Serial: {currentCertificate.id} | Date: {new Date(currentCertificate.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>
            
            <div className="flex justify-center gap-4 mt-8">
              <button
                onClick={downloadCertificate}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all ${
                  mode === 'heaven'
                    ? 'bg-yellow-400 text-yellow-900 hover:bg-yellow-300'
                    : 'bg-red-600 text-white hover:bg-red-500'
                } shadow-lg transform hover:scale-105`}
              >
                <Download size={20} />
                Save Your Forgiveness
              </button>
              <button
                onClick={shareOnTwitter}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all ${
                  mode === 'heaven'
                    ? 'bg-blue-500 text-white hover:bg-blue-400'
                    : 'bg-blue-600 text-white hover:bg-blue-500'
                } shadow-lg transform hover:scale-105`}
              >
                <Twitter size={20} />
                Confess on Twitter
              </button>
              <button
                onClick={() => setCurrentStep('gallery')}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all ${
                  mode === 'heaven'
                    ? 'bg-white/50 text-yellow-900 hover:bg-white/70'
                    : 'bg-red-900/50 text-red-200 hover:bg-red-900/70'
                }`}
              >
                <Share2 size={20} />
                View Gallery
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Gallery */}
      {currentStep === 'gallery' && (
        <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-6">
          <div className="w-full max-w-6xl">
            {/* Header */}
            <div className="text-center mb-16">
              <h1 className="text-6xl md:text-8xl font-graphik-light text-white mb-4 tracking-wider">
                Hall of Forgiveness
              </h1>
              <p className="text-xl md:text-2xl text-white/80 font-graphik-light">
                9o1daP8w7ax6aYQMFKsQYaanNZmADiafc1EvMerUr777
              </p>
            </div>
            
            {/* Confession Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {confessions
                .sort((a, b) => b.likes - a.likes)
                .map((conf) => (
                <div
                  key={conf.id}
                  className="group relative bg-black/60 backdrop-blur-md rounded-2xl p-6 border border-white/10 hover:bg-black/70 transition-all duration-300 cursor-pointer transform hover:scale-105"
                >
                  {/* Header with name and mode indicator */}
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-graphik text-white text-lg font-medium">
                      {conf.name}
                    </h3>
                    <span className={`text-sm px-3 py-1 rounded-full ${
                      conf.mode === 'heaven' 
                        ? 'bg-yellow-400/20 text-yellow-400' 
                        : 'bg-red-400/20 text-red-400'
                    }`}>
                      {conf.mode === 'heaven' ? '😇' : '😈'}
                    </span>
                  </div>
                  
                  {/* Confession text */}
                  <p className="text-white/80 font-graphik-light italic mb-4 leading-relaxed">
                    "{conf.confession}"
                  </p>
                  
                  {/* Category and Severity */}
                  <div className="flex justify-center text-sm mb-4 text-white/60 font-graphik-light">
                    <span>Severity: <span className="text-white/80">{conf.severity}</span></span>
                  </div>
                  
                  {/* Footer with date and likes */}
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-white/50 font-graphik-light">
                      {new Date(conf.created_at).toLocaleDateString()}
                    </span>
                    <button
                      onClick={() => likeConfession(conf.id)}
                      className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white/80 hover:bg-white/20 transition-all font-graphik-light"
                    >
                      ❤️ {conf.likes}
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Action Buttons */}
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setCurrentStep('landing')}
                className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white rounded-full border border-white/20 hover:bg-white/20 transition-all duration-300 font-graphik"
              >
                ← Back to Home
              </button>
              <button
                onClick={() => setCurrentStep('confess')}
                className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white rounded-full border border-white/20 hover:bg-white/20 transition-all duration-300 font-graphik"
              >
                + Add Your Confession
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;