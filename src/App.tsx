import { useEffect, useMemo, useState } from 'react'
import { motion } from 'motion/react'
import { ArrowRight, Bell, Check, ChevronDown, Clapperboard, Facebook, Film, Instagram, Menu, Play, Search, Youtube, X } from 'lucide-react'
import { getVideos, youtubeEmbedUrl, youtubeWatchUrl, type PublicVideo } from './lib/youtube'\nimport AuthControls from './components/AuthControls'

type Language = 'EN' | 'አማ'
type Video = { id: number; youtubeId?: string; title: string; category: string; views: string; age: string; image: string; duration: string; featured?: boolean }

const videos: Video[] = [
  { id: 1, title: 'The funniest moments you missed 😂', category: 'Comedy', views: '24K', age: '2 days ago', image: 'https://images.unsplash.com/photo-1524368535928-5b5e00ddc76f?auto=format&fit=crop&w=900&q=85', duration: '12:48', featured: true },
  { id: 2, title: 'Our reaction to the unexpected ending', category: 'Reactions', views: '18K', age: '5 days ago', image: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=900&q=85', duration: '09:32' },
  { id: 3, title: 'Ethiopian music moments that hit different', category: 'Entertainment', views: '31K', age: '1 week ago', image: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=900&q=85', duration: '15:06' },
  { id: 4, title: 'Trying not to laugh challenge — impossible!', category: 'Comedy', views: '12K', age: '1 week ago', image: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=900&q=85', duration: '08:17' },
]

const copy = {
  EN: { home: 'Home', videos: 'Videos', shorts: 'Shorts', about: 'About', contact: 'Contact', heroTag: 'ETHIOPIAN ENTERTAINMENT • REAL REACTIONS', heroTitle: 'GOOD VIBES. REAL\nREACTIONS.', heroText: 'Your home for laughter, entertainment and unforgettable moments. Join the ALE TUBE family.', explore: 'Explore videos', subscribe: 'Subscribe on YouTube', latest: 'Latest videos', latestSub: 'Fresh reactions and entertainment, all in one place.', viewAll: 'View all videos', featured: 'FEATURED VIDEO', shortsTitle: 'Shorts that hit different', shortsSub: 'Quick laughs. Big reactions. Endless vibes.', aboutTitle: 'More than just reactions.', aboutText: 'ALE TUBE REACTIONS brings people together through humor, culture and the moments we love to share. From unexpected clips to conversations that make you think, there is always something new to enjoy.', join: 'Be part of the family', follow: 'Follow the channel for new videos, shorts and good energy.', footer: 'Made for the love of entertainment.', search: 'Search videos...', all: 'All', comedy: 'Comedy', reactions: 'Reactions', entertainment: 'Entertainment' },
  'አማ': { home: 'መነሻ', videos: 'ቪዲዮዎች', shorts: 'ሾርትስ', about: 'ስለ እኛ', contact: 'ያግኙን', heroTag: 'የኢትዮጵያ መዝናኛ • እውነተኛ ምላሾች', heroTitle: 'መልካም ጊዜ። እውነተኛ\nምላሾች።', heroText: 'ለሳቅ፣ ለመዝናኛ እና ለማይረሱ ትዝታዎች የእርስዎ ቦታ። የALE TUBE ቤተሰብ ይሁኑ።', explore: 'ቪዲዮዎችን ይመልከቱ', subscribe: 'በYouTube ይከተሉን', latest: 'የቅርብ ጊዜ ቪዲዮዎች', latestSub: 'አዳዲስ ምላሾች እና መዝናኛዎች በአንድ ቦታ።', viewAll: 'ሁሉንም ይመልከቱ', featured: 'ተመራጭ ቪዲዮ', shortsTitle: 'አጭር እና አስደሳች', shortsSub: 'ፈጣን ሳቅ። ትልቅ ምላሽ። ያልተገደበ ደስታ።', aboutTitle: 'ከምላሽ በላይ።', aboutText: 'ALE TUBE REACTIONS ሰዎችን በቀልድ፣ በባህል እና በምንወዳቸው አፍታዎች ያገናኛል። ሁልጊዜ አዲስ የሚዝናኑበት ነገር አለ።', join: 'የቤተሰቡ አካል ይሁኑ', follow: 'ለአዳዲስ ቪዲዮዎች፣ ሾርትስ እና መልካም ስሜት ይከተሉን።', footer: 'ለመዝናኛ ፍቅር ተሰርቷል።', search: 'ቪዲዮ ፈልግ...', all: 'ሁሉም', comedy: 'ቀልድ', reactions: 'ምላሾች', entertainment: 'መዝናኛ' },
}

function formatDuration(totalSeconds: number): string {
  const seconds = Math.max(0, Math.floor(totalSeconds || 0))
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainder = seconds % 60
  return hours ? hours + ':' + String(minutes).padStart(2, '0') + ':' + String(remainder).padStart(2, '0') : minutes + ':' + String(remainder).padStart(2, '0')
}

function App() {
  const [language, setLanguage] = useState<Language>('EN')
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All')
  const [subscribed, setSubscribed] = useState(false)
  const [liveVideos, setLiveVideos] = useState<Video[] | null>(null)
  const [catalogueError, setCatalogueError] = useState('')
  const [playingVideo, setPlayingVideo] = useState<string | null>(null)
  const t = copy[language]

  useEffect(() => {
    let active = true
    getVideos({ limit: 12, type: 'videos' })
      .then((page) => {
        if (!active) return
        const mapped = page.items.map((item: PublicVideo, index: number) => ({
          id: index + 1, youtubeId: item.youtubeId, title: item.title, category: 'YouTube',
          views: new Intl.NumberFormat('en', { notation: 'compact' }).format(item.viewCount || 0),
          age: item.publishedAt ? new Date(typeof item.publishedAt === 'string' ? item.publishedAt : item.publishedAt._seconds * 1000).toLocaleDateString() : '',
          image: item.thumbnailUrl, duration: formatDuration(item.durationSeconds),
        }))
        setLiveVideos(mapped)
      })
      .catch((error: unknown) => {
        if (active) setCatalogueError(error instanceof Error ? error.message : 'Could not load channel videos.')
      })
    return () => { active = false }
  }, [])
  const categories = ['All', 'Comedy', 'Reactions', 'Entertainment']
  const sourceVideos = liveVideos ?? videos
  const filteredVideos = useMemo(() => sourceVideos.filter(video => (category === 'All' || video.category === category || video.category === 'YouTube') && video.title.toLowerCase().includes(query.toLowerCase())), [sourceVideos, category, query])

  const nav = [{ label: t.home, href: '#home' }, { label: t.videos, href: '#videos' }, { label: t.shorts, href: '#shorts' }, { label: t.about, href: '#about' }, { label: t.contact, href: '#contact' }]

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#home" aria-label="ALE TUBE home"><span className="brand-mark"><Play size={18} fill="currentColor" /></span><span>ALE<span className="brand-red">TUBE</span><small>REACTIONS</small></span></a>
        <nav className={menuOpen ? 'nav-links open' : 'nav-links'}>{nav.map(item => <a key={item.href} href={item.href} onClick={() => setMenuOpen(false)}>{item.label}</a>)}</nav>
        <div className="header-actions">\n          <AuthControls />
          <button className="icon-btn" aria-label="Search" onClick={() => setSearchOpen(!searchOpen)}><Search size={19} /></button>
          <button className="language-btn" onClick={() => setLanguage(language === 'EN' ? 'አማ' : 'EN')}>{language === 'EN' ? 'አማ' : 'EN'} <ChevronDown size={14} /></button>
          <a className="header-subscribe" href="https://www.youtube.com/@Aletubereactions" target="_blank" rel="noreferrer"><Youtube size={16} /> Subscribe</a>
          <button className="mobile-menu icon-btn" aria-label="Toggle menu" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X /> : <Menu />}</button>
        </div>
      </header>

      {searchOpen && <div className="search-panel"><Search size={18} /><input autoFocus placeholder={t.search} value={query} onChange={e => { setQuery(e.target.value); document.getElementById('videos')?.scrollIntoView({ behavior: 'smooth' }) }} /><button className="icon-btn" onClick={() => { setSearchOpen(false); setQuery('') }}><X size={18} /></button></div>}

      <main>
        <section className="hero" id="home">
          <div className="hero-backdrop" />
          <div className="hero-content">
            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .6 }}>
              <div className="eyebrow"><span /> {t.heroTag}</div>
              <h1>{t.heroTitle.split('\n').map((line, i) => <span key={i}>{line}{i === 0 && <br />}</span>)}</h1>
              <p>{t.heroText}</p>
              <div className="hero-buttons"><a className="btn-primary" href="#videos"><Play size={17} fill="currentColor" /> {t.explore}</a><a className="btn-outline" href="https://www.youtube.com/@Aletubereactions" target="_blank" rel="noreferrer"><Youtube size={18} /> {t.subscribe}</a></div>
              <div className="hero-social-proof"><div className="avatar-stack"><span>A</span><span>L</span><span>E</span></div><span>Join the ALE TUBE community</span></div>
            </motion.div>
          </div>
          <div className="hero-side-label">ENTERTAINMENT WITHOUT LIMITS</div>
          <div className="hero-bottom"><span>01 / 03</span><span className="hero-line" /><span>SCROLL TO EXPLORE ↓</span></div>
        </section>

        <section className="video-section section-wrap" id="videos">
          <div className="section-heading"><div><div className="eyebrow"><span /> WATCH SOMETHING GOOD</div><h2>{t.latest}</h2><p>{t.latestSub}</p></div><a className="text-link" href="https://www.youtube.com/@Aletubereactions/videos" target="_blank" rel="noreferrer">{t.viewAll} <ArrowRight size={17} /></a></div>
          <div className="filter-row">{categories.map((item, i) => <button key={item} className={category === item ? 'filter-chip active' : 'filter-chip'} onClick={() => setCategory(item)}>{i === 0 ? t.all : i === 1 ? t.comedy : i === 2 ? t.reactions : t.entertainment}</button>)}</div>
          {catalogueError && <p className="catalogue-note">Showing preview videos. Live YouTube feed is not connected yet: {catalogueError}</p>}
          <div className="video-grid">{filteredVideos.map((video, i) => <motion.article className="video-card" key={video.id} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * .08 }}><button type="button" onClick={() => video.youtubeId ? setPlayingVideo(video.youtubeId) : window.open("https://www.youtube.com/@Aletubereactions/videos", "_blank", "noopener,noreferrer")} className="thumb-wrap"><img src={video.image} alt="" /><span className="duration">{video.duration}</span><span className="play-overlay"><Play fill="currentColor" size={22} /></span></button><div className="video-meta"><span className="video-category">{video.category}</span><span>{video.age}</span></div><h3>{video.title}</h3><div className="video-views"><Film size={14} /> {video.views} views</div></motion.article>)}</div>
          {filteredVideos.length === 0 && <div className="empty-state">No videos match your search. Try another keyword.</div>}
        </section>

        {playingVideo && <div className="player-modal" role="dialog" aria-modal="true" aria-label="YouTube video player"><button className="player-close" onClick={() => setPlayingVideo(null)} aria-label="Close player"><X /></button><div className="player-frame"><iframe src={youtubeEmbedUrl(playingVideo)} title="ALE TUBE YouTube video player" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen /></div><a className="player-watch-link" href={youtubeWatchUrl(playingVideo)} target="_blank" rel="noreferrer">Open on YouTube ↗</a></div>}
        <section className="shorts-section" id="shorts"><div className="shorts-inner section-wrap"><div className="shorts-copy"><div className="eyebrow"><span /> QUICK ENTERTAINMENT</div><h2>{t.shortsTitle}</h2><p>{t.shortsSub}</p><a className="btn-primary" href="https://www.youtube.com/@Aletubereactions/shorts" target="_blank" rel="noreferrer"><Play size={16} fill="currentColor" /> Watch Shorts <ArrowRight size={16} /></a></div><div className="shorts-visual"><div className="short-card short-card-back"><img src="https://images.unsplash.com/photo-1533929736458-ca588d08c8be?auto=format&fit=crop&w=500&q=80" alt="" /></div><div className="short-card short-card-front"><img src="https://images.unsplash.com/photo-1524368535928-5b5e00ddc76f?auto=format&fit=crop&w=500&q=80" alt="" /><span className="short-play"><Play fill="currentColor" /></span><span className="shorts-label">ALE TUBE SHORTS</span></div><div className="shorts-stamp">FUN<br />EVERY<br />DAY</div></div></div></section>

        <section className="about-section section-wrap" id="about"><div className="about-image"><img src="https://images.unsplash.com/photo-1524368535928-5b5e00ddc76f?auto=format&fit=crop&w=1000&q=85" alt="Live entertainment crowd" /><div className="image-caption"><Clapperboard size={20} /><span>GOOD MOMENTS. GREAT MEMORIES.</span></div></div><div className="about-copy"><div className="eyebrow"><span /> WHO WE ARE</div><h2>{t.aboutTitle}</h2><p>{t.aboutText}</p><div className="about-stats"><div><strong>100%</strong><span>GOOD ENERGY</span></div><div><strong>24/7</strong><span>ENTERTAINMENT</span></div><div><strong>1</strong><span>COMMUNITY</span></div></div></div></section>

        <section className="cta-section" id="contact"><div className="cta-glow" /><div className="cta-content"><div className="eyebrow"><span /> STAY CONNECTED</div><h2>{t.join}</h2><p>{t.follow}</p><button className="btn-primary" onClick={() => setSubscribed(true)}>{subscribed ? <><Check size={17} /> YouTube is ready</> : <><Bell size={17} /> Subscribe to ALE TUBE</>}</button>{subscribed && <small className="subscribe-note">Open YouTube to complete your subscription.</small>}</div></section>
      </main>

      <footer className="footer"><div className="footer-main"><a className="brand" href="#home"><span className="brand-mark"><Play size={18} fill="currentColor" /></span><span>ALE<span className="brand-red">TUBE</span><small>REACTIONS</small></span></a><p>{t.footer}</p><div className="footer-social"><a href="https://www.youtube.com/@Aletubereactions" aria-label="YouTube"><Youtube /></a><a href="#" aria-label="Instagram"><Instagram /></a><a href="#" aria-label="Facebook"><Facebook /></a></div></div><div className="footer-bottom"><span>© {new Date().getFullYear()} ALE TUBE REACTIONS. All rights reserved.</span><div><a href="#about">About</a><a href="#contact">Contact</a><a href="#home">Back to top ↑</a></div></div></footer>
    </div>
  )
}

export default App