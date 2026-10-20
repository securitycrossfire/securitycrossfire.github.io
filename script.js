// Yashon Ochieng portfolio — premium animations
(function(){
  const isMobile = window.matchMedia('(max-width:768px)').matches;

  // ---- Loader ----
  window.addEventListener('load',()=>{
    setTimeout(()=>{
      const l=document.querySelector('.loader');
      if(l){gsap.to(l,{opacity:0,duration:.6,onComplete:()=>l.remove()});}
      animateHero();
      initScroll();
    },1500);
  });

  // ---- Lenis smooth scroll ----
  let lenis;
  if(typeof Lenis!=='undefined' && !isMobile){
    lenis = new Lenis({duration:1.15,easing:t=>Math.min(1,1.001-Math.pow(2,-10*t)),smoothWheel:true});
    function raf(t){lenis.raf(t);requestAnimationFrame(raf);}
    requestAnimationFrame(raf);
  }

  // ---- Custom cursor ----
  const cursor=document.querySelector('.cursor');
  const ring=document.querySelector('.cursor-ring');
  let mx=0,my=0,rx=0,ry=0;
  window.addEventListener('mousemove',e=>{
    mx=e.clientX;my=e.clientY;
    if(cursor){cursor.style.left=mx+'px';cursor.style.top=my+'px';}
  });
  function followRing(){
    rx+=(mx-rx)*.18;ry+=(my-ry)*.18;
    if(ring){ring.style.left=rx+'px';ring.style.top=ry+'px';}
    requestAnimationFrame(followRing);
  }
  followRing();
  document.querySelectorAll('a,button,.proj,.bot-card,.stat,.stack-cell').forEach(el=>{
    el.addEventListener('mouseenter',()=>cursor&&cursor.classList.add('hover'));
    el.addEventListener('mouseleave',()=>cursor&&cursor.classList.remove('hover'));
  });

  // ---- Nav scroll state ----
  const nav=document.querySelector('.nav');
  window.addEventListener('scroll',()=>{
    nav&&nav.classList.toggle('scrolled',window.scrollY>20);
    // Scroll progress
    const sp=document.querySelector('.scroll-progress-bar');
    if(sp){
      const h=document.documentElement.scrollHeight-window.innerHeight;
      sp.style.width=(window.scrollY/h*100)+'%';
    }
  });

  // ---- Nav links smooth scroll ----
  document.querySelectorAll('a[href^="#"]').forEach(a=>{
    a.addEventListener('click',e=>{
      const id=a.getAttribute('href');
      if(id.length<2)return;
      const t=document.querySelector(id);
      if(!t)return;
      e.preventDefault();
      if(lenis){lenis.scrollTo(t,{offset:-20,duration:1.4});}
      else{t.scrollIntoView({behavior:'smooth'});}
    });
  });

  // ---- Reveal fallback ----
  const io=new IntersectionObserver(es=>{
    es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}});
  },{threshold:.12});
  document.querySelectorAll('.reveal').forEach(el=>io.observe(el));

  // ---- Split section titles into words (not chars — chars break kerning) ----
  function splitTitleWords(el){
    const walk=(node,parent)=>{
      if(node.nodeType===3){
        const parts=node.textContent.split(/( +)/);
        parts.forEach(part=>{
          if(!part)return;
          if(part.trim()===''){parent.appendChild(document.createTextNode(part));return;}
          const s=document.createElement('span');
          s.className='word';s.textContent=part;
          parent.appendChild(s);
        });
      }else if(node.nodeType===1){
        const clone=node.cloneNode(false);
        parent.appendChild(clone);
        node.childNodes.forEach(ch=>walk(ch,clone));
      }
    };
    const frag=document.createElement('span');
    el.childNodes.forEach(ch=>walk(ch,frag));
    el.innerHTML='';
    while(frag.firstChild)el.appendChild(frag.firstChild);
  }
  document.querySelectorAll('.section-title').forEach(splitTitleWords);

  // ---- Hero anim ----
  function animateHero(){
    if(typeof gsap==='undefined')return;
    gsap.to('.hero-title .line > span',{y:0,duration:1.2,stagger:.1,ease:'expo.out'});
    gsap.from('.hero-meta',{opacity:0,y:20,duration:.8,delay:.3,ease:'power3.out'});
    gsap.from('.hero-sub',{opacity:0,y:30,duration:1,delay:.9,ease:'power3.out'});
    gsap.from('.hero-actions',{opacity:0,y:30,duration:1,delay:1.1,ease:'power3.out'});
    gsap.from('.hero-stats',{opacity:0,y:30,duration:1,delay:1.25,ease:'power3.out'});
    gsap.from('.hero-side .hs-card',{opacity:0,x:40,duration:.9,stagger:.15,delay:1.4,ease:'expo.out'});
    gsap.from('.hero-scroll',{opacity:0,duration:1,delay:1.5});
  }

  // ---- ScrollTrigger choreography ----
  function initScroll(){
    if(typeof gsap==='undefined'||typeof ScrollTrigger==='undefined')return;
    gsap.registerPlugin(ScrollTrigger);

    // Sync Lenis with ScrollTrigger
    if(lenis){
      lenis.on('scroll',ScrollTrigger.update);
      gsap.ticker.add(t=>lenis.raf(t*1000));
      gsap.ticker.lagSmoothing(0);
    }

    // Section titles word reveal
    document.querySelectorAll('.section-title').forEach(el=>{
      const words=el.querySelectorAll('.word');
      gsap.to(words,{
        opacity:1,y:0,rotateX:0,duration:.9,stagger:.06,ease:'expo.out',
        scrollTrigger:{trigger:el,start:'top 82%',once:true}
      });
    });

    // Section labels
    gsap.utils.toArray('.section-label').forEach(el=>{
      gsap.from(el,{opacity:0,x:-20,duration:.8,ease:'power3.out',
        scrollTrigger:{trigger:el,start:'top 88%',once:true}});
    });

    // Counters
    document.querySelectorAll('.count').forEach(el=>{
      const target=parseFloat(el.dataset.to);
      const obj={v:0};
      ScrollTrigger.create({trigger:el,start:'top 85%',once:true,onEnter:()=>{
        gsap.to(obj,{v:target,duration:1.8,ease:'power2.out',onUpdate:()=>{
          el.textContent=Number.isInteger(target)?Math.round(obj.v):obj.v.toFixed(1);
        }});
      }});
    });

    // Stat cards staggered
    gsap.from('.stat',{opacity:0,y:40,duration:.9,stagger:.1,ease:'power3.out',
      scrollTrigger:{trigger:'.stats',start:'top 80%',once:true}});

    // Stack grid stagger
    gsap.from('.stack-cell',{opacity:0,y:50,duration:.8,stagger:{amount:.6,from:'random'},ease:'power3.out',
      scrollTrigger:{trigger:'.stack-grid',start:'top 75%',once:true}});

    // Project rows slide
    gsap.utils.toArray('.proj').forEach((row,i)=>{
      gsap.from(row,{opacity:0,x:i%2?60:-60,duration:1,ease:'expo.out',
        scrollTrigger:{trigger:row,start:'top 88%',once:true}});
    });

    // Bot cards 3D entry
    gsap.from('.bot-card',{opacity:0,y:80,rotateX:15,duration:1,stagger:.12,ease:'expo.out',
      scrollTrigger:{trigger:'.bots-grid',start:'top 75%',once:true}});

    // Process steps
    gsap.from('.process-step',{opacity:0,y:40,duration:.9,stagger:.12,ease:'power3.out',
      scrollTrigger:{trigger:'.process',start:'top 80%',once:true}});

    // Testimonials
    gsap.from('.testi',{opacity:0,y:50,duration:1,stagger:.15,ease:'expo.out',
      scrollTrigger:{trigger:'.testi-grid',start:'top 80%',once:true}});

    // CTA pop
    gsap.from('.cta',{opacity:0,scale:.94,duration:1.2,ease:'expo.out',
      scrollTrigger:{trigger:'.cta',start:'top 80%',once:true}});

    // Section number watermark parallax
    gsap.utils.toArray('.sec-num').forEach(el=>{
      gsap.fromTo(el,{y:80},{y:-80,ease:'none',
        scrollTrigger:{trigger:el.parentElement,start:'top bottom',end:'bottom top',scrub:1}});
    });

    // Marquee scroll speed
    const mt=document.querySelector('.marquee-track');
    if(mt){
      let direction=1;
      const tween=gsap.to(mt,{xPercent:-50,ease:'none',duration:30,repeat:-1});
      ScrollTrigger.create({onUpdate:self=>{
        const v=self.getVelocity()/-300;
        gsap.to(tween,{timeScale:Math.min(Math.max(Math.abs(v),1),4)*direction,duration:.4,overwrite:true});
      }});
    }

    // Hero parallax on scroll
    gsap.to('.hero-title',{y:120,opacity:.4,ease:'none',
      scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:true}});

    // Footer reveal
    gsap.from('.foot > *',{opacity:0,y:30,duration:.8,stagger:.1,ease:'power3.out',
      scrollTrigger:{trigger:'.foot',start:'top 85%',once:true}});
  }

  // ---- Magnetic buttons ----
  document.querySelectorAll('.btn,.nav-cta').forEach(btn=>{
    btn.addEventListener('mousemove',e=>{
      const r=btn.getBoundingClientRect();
      const x=e.clientX-r.left-r.width/2;
      const y=e.clientY-r.top-r.height/2;
      btn.style.transform=`translate(${x*.18}px,${y*.28}px)`;
    });
    btn.addEventListener('mouseleave',()=>{btn.style.transform='';});
  });

  // ---- Bot card 3D tilt ----
  document.querySelectorAll('.bot-card').forEach(card=>{
    card.addEventListener('mousemove',e=>{
      const r=card.getBoundingClientRect();
      const x=(e.clientX-r.left)/r.width-.5;
      const y=(e.clientY-r.top)/r.height-.5;
      card.style.transform=`perspective(900px) rotateY(${x*8}deg) rotateX(${-y*8}deg) translateY(-8px)`;
    });
    card.addEventListener('mouseleave',()=>{card.style.transform='';});
  });

  // ---- Project hover preview follow cursor ----
  document.querySelectorAll('.proj').forEach(row=>{
    const pv=row.querySelector('.preview');
    if(!pv)return;
    row.addEventListener('mouseenter',()=>row.classList.add('is-hover'));
    row.addEventListener('mouseleave',()=>row.classList.remove('is-hover'));
    row.addEventListener('mousemove',e=>{
      pv.style.left=(e.clientX+24)+'px';
      pv.style.top=(e.clientY+24)+'px';
    });
  });

  // ---- Stack cell shine on hover ----
  document.querySelectorAll('.stack-cell').forEach(c=>{
    c.addEventListener('mouseenter',()=>gsap.to(c,{scale:1.02,duration:.4,ease:'power2.out'}));
    c.addEventListener('mouseleave',()=>gsap.to(c,{scale:1,duration:.4,ease:'power2.out'}));
  });

  // ---- GitHub-style activity grid ----
  (function buildActivity(){
    const grid=document.getElementById('actGrid');
    if(!grid)return;
    // 52 weeks * 7 days = 364 cells
    const total=52*7;
    // Pseudo-random but deterministic-ish weighting
    const weights=[0,0,0,0,0,1,1,1,2,2,3,4];
    let html='';
    for(let i=0;i<total;i++){
      // simulate higher density in middle and recent weeks
      const week=Math.floor(i/7);
      const recent=week>40?1.5:(week>30?1.3:1);
      const r=Math.random()*recent;
      let lvl=0;
      if(r>.7)lvl=1;
      if(r>.85)lvl=2;
      if(r>.93)lvl=3;
      if(r>.97)lvl=4;
      // burst clusters
      if(week===12||week===24||week===38||week===48){if(Math.random()>.4)lvl=Math.max(lvl,3);}
      html+=`<div class="cell${lvl?' l'+lvl:''}"></div>`;
    }
    grid.innerHTML=html;
  })();

})();
