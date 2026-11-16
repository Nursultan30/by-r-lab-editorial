/* A short brand introduction, followed by scroll-driven garment storytelling. */
(() => {
  'use strict';
  const intro = document.querySelector('#stitch-intro');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  window.BYRLAB_INTRO_PENDING = document.documentElement.classList.contains('intro-pending') && !reduced.matches;
  let finished = false;
  function finishIntro(immediate = false) {
    if (finished) return;
    finished = true;
    try { sessionStorage.setItem('byrlab-intro-v1', 'seen'); } catch {}
    intro?.classList.add('is-leaving');
    const complete = () => {
      document.documentElement.classList.remove('intro-pending');
      if (intro) intro.hidden = true;
      window.BYRLAB_INTRO_PENDING = false;
      dispatchEvent(new Event('byrlab:intro-complete'));
    };
    if (immediate || reduced.matches) complete();
    else setTimeout(complete, 650);
  }
  document.querySelector('#skip-intro')?.addEventListener('click', () => finishIntro(true));
  document.addEventListener('keydown', event => { if (event.key === 'Escape') finishIntro(true); });
  if (window.BYRLAB_INTRO_PENDING) setTimeout(() => finishIntro(), 1750);
  else finishIntro(true);
  reduced.addEventListener('change', event => { if (event.matches) finishIntro(true); });

  const storyImages = [...document.querySelectorAll('.story-image img')];
  const warmStory = () => storyImages.forEach(image => { image.loading = 'eager'; });
  const storyElement = document.querySelector('.collection-story');
  if (storyElement && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) { warmStory(); observer.disconnect(); }
    }, { rootMargin: '1000px 0px' });
    observer.observe(storyElement);
  } else warmStory();

  if (!window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);
  const media = gsap.matchMedia();
  media.add('(min-width: 901px) and (prefers-reduced-motion: no-preference)', () => {
    const story = document.querySelector('.collection-story');
    const stage = story?.querySelector('.story-stage');
    const chapters = gsap.utils.toArray('.story-chapter');
    const labels = [...document.querySelectorAll('.story-track span')];
    if (!story || !stage || chapters.length !== 4) return;
    story.classList.add('story-enhanced');
    story.classList.add('story-stack');
    gsap.set(chapters, { autoAlpha: 1, yPercent: i => i ? 115 : 0, zIndex: i => i + 1, transformOrigin: '50% 0', transformPerspective: 1100 });
    const syncChapter = () => {
      let current = 0;
      chapters.forEach((chapter, i) => { if (Number(gsap.getProperty(chapter, 'yPercent')) < 55) current = i; });
      labels.forEach((label, i) => label.classList.toggle('is-active', i === current));
    };
    const timeline = gsap.timeline({
      defaults: { ease: 'power2.inOut' }, onUpdate: syncChapter,
      scrollTrigger: {
        trigger: stage, start: 'top 108px', end: () => '+=' + Math.min(innerHeight * 2.4, 2400),
        pin: true, scrub: .65, anticipatePin: 1, invalidateOnRefresh: true,
      },
    });
    // A new sheet folds over the previous ones; earlier cards keep their visible edges.
    chapters.slice(1).forEach((chapter, offset) => {
      const at = .8 + offset * 1.25;
      timeline.fromTo(chapter, { yPercent: 115, rotationX: -8 }, {
        yPercent: 0, rotationX: 0, duration: .95, immediateRender: false,
      }, at).to(chapters.slice(0, offset + 1), {
        scale: i => 1 - .014 * (offset + 1 - i), rotationX: 2, duration: .95,
      }, at);
    });
    timeline.to({}, { duration: .7 });
    syncChapter();
    return () => {
      story.classList.remove('story-enhanced', 'story-stack');
      labels.forEach(label => label.classList.remove('is-active'));
    };
  });
  media.add('(max-width: 900px) and (prefers-reduced-motion: no-preference)', () => {
    const story = document.querySelector('.collection-story');
    story?.classList.add('story-stack-mobile');
    return () => story?.classList.remove('story-stack-mobile');
  });
  media.add('(prefers-reduced-motion: no-preference)', () => {
    const desktop = innerWidth > 900;
    const material = document.querySelector('.craft-picture img');
    if (material && desktop) {
      gsap.fromTo(material, { scale: 1.14 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: '.craft-scene', start: 'top bottom', end: 'bottom top', scrub: 1 } });
      gsap.fromTo('.craft-picture', { clipPath: 'inset(6% 4%)' }, { clipPath: 'inset(0%)', ease: 'none', scrollTrigger: { trigger: '.craft-scene', start: 'top 85%', end: 'top 25%', scrub: .8 } });
    }
    gsap.utils.toArray('.craft-notes p').forEach((note, i) => gsap.from(note, {
      y: desktop ? 20 : 8, opacity: .25, duration: .65, delay: i * .13,
      clearProps: 'transform,opacity', scrollTrigger: { trigger: note, start: 'top 93%', once: true },
    }));
    if (desktop) gsap.fromTo('.final-image--cinematic', { scale: 1.13, opacity: .48 }, {
      scale: 1, opacity: .18, ease: 'none', scrollTrigger: { trigger: '.final--cinematic', start: 'top bottom', end: 'top 10%', scrub: 1 },
    });
  });
  window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
  document.fonts?.ready.then(() => ScrollTrigger.refresh());
})();
