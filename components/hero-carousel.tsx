'use client';

import { useEffect, useState } from 'react';

const slides = [
  {
    image: '/hero/ful_carru_sintex1.png',
    eyebrow: 'The Getzemani Edit',
    label: 'Daily rituals, refined',
    title: 'Beauty, body, and calm in one considered ritual.',
    description:
      'Curated essentials for skin, self-care, and slower living — elevated to fit naturally into real life.',
    cta: 'Shop the collection',
    href: '#shop',
  },
  {
    image: '/hero/ful_carru_sintex2.png',
    eyebrow: 'Wellness rituals',
    label: 'Made to linger',
    title: 'Slow down beautifully with essentials that feel like home.',
    description:
      'Thoughtful body care and everyday objects designed to reset your rhythm, soften your space, and bring intention back in.',
    cta: 'Explore rituals',
    href: '#rituals',
  },
  {
    image: '/hero/ful_carru_sintex3.png',
    eyebrow: 'A softer philosophy',
    label: 'Less, but better',
    title: 'Minimal rituals for a more grounded life.',
    description:
      'Created for people who want less noise, more presence, and beauty that supports the way they actually live.',
    cta: 'Discover the philosophy',
    href: '#philosophy',
  },
  {
    image: '/hero/ful_carru_sintex4.png',
    eyebrow: 'A softer philosophy',
    label: 'Less, but better',
    title: 'Minimal rituals for a more grounded life.',
    description:
      'Created for people who want less noise, more presence, and beauty that supports the way they actually live.',
    cta: 'Discover the philosophy',
    href: '#philosophy',
  },
  {
    image: '/hero/ful_carru_sintex5.png',
    eyebrow: 'A softer philosophy',
    label: 'Less, but better',
    title: 'Minimal rituals for a more grounded life.',
    description:
      'Created for people who want less noise, more presence, and beauty that supports the way they actually live.',
    cta: 'Discover the philosophy',
    href: '#philosophy',
  },
  {
    image: '/hero/ful_carru_sintex6.png',
    eyebrow: 'A softer philosophy',
    label: 'Less, but better',
    title: 'Minimal rituals for a more grounded life.',
    description:
      'Created for people who want less noise, more presence, and beauty that supports the way they actually live.',
    cta: 'Discover the philosophy',
    href: '#philosophy',
  },
];

export function HeroCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveIndex((current: number) => (current + 1) % slides.length);
    }, 5000);

    return () => window.clearInterval(timer);
  }, []);

  const goToSlide = (index: number) => {
    setActiveIndex(index);
  };

  const previousSlide = () => {
    setActiveIndex((current: number) => (current - 1 + slides.length) % slides.length);
  };

  const nextSlide = () => {
    setActiveIndex((current: number) => (current + 1) % slides.length);
  };

  const currentSlide = slides[activeIndex];

  return (
    <section
      className="site-hero"
      aria-label="Featured campaign carousel"
    >
      {slides.map((slide, index) => (
        <div
          key={slide.title}
          className={`hero-slide ${index === activeIndex ? 'is-active' : ''}`}
          aria-hidden={index !== activeIndex}
        >
          <img src={slide.image} alt={slide.title} />
        </div>
      ))}

      <div aria-hidden className="hero-veil" />

      <div className="hero-rise hero-content">
        <div className="hero-copy">
          <p className="hero-eyebrow">{currentSlide.eyebrow}</p>
          <span className="hero-label">{currentSlide.label}</span>
          <h1>{currentSlide.title}</h1>
          <p className="hero-description">{currentSlide.description}</p>
          <div className="hero-actions">
            <a href={currentSlide.href} className="hero-primary-action">
              {currentSlide.cta}
            </a>
            <a href="#rituals" className="underline-grow hero-secondary-action">
              Find your ritual
            </a>
          </div>
        </div>

        <div className="hero-aside" aria-label="Editorial details">
          <div className="hero-aside-inner">
            <span className="hero-aside-label">Crafted for slower living</span>
            <p>Skin, body, and space with a quieter point of view.</p>
          </div>
        </div>
      </div>

      <div className="hero-controls">
        <button type="button" aria-label="Previous slide" onClick={previousSlide}>
          ←
        </button>
        <button type="button" aria-label="Next slide" onClick={nextSlide}>
          →
        </button>
      </div>

      <div className="hero-dots" aria-label="Select slide">
        {slides.map((slide, index) => (
          <button
            key={slide.title}
            type="button"
            aria-label={`Go to slide ${index + 1}`}
            onClick={() => goToSlide(index)}
            className={index === activeIndex ? 'is-active' : ''}
          />
        ))}
      </div>
    </section>
  );
}
