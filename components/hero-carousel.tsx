'use client';

import { useEffect, useState } from 'react';

const slides = [
  {
    image: '/hero/ful_carru_sintex1.png',
    eyebrow: 'GETZEMANI',
    label: 'Beauty · Wellness · Home',
    title: 'Care, at the pace of a garden.',
    description:
      'Thoughtfully chosen essentials for beauty, everyday wellness, and a calmer way of living.',
    cta: 'Shop now',
    href: '#shop',
  },

  {
    image: '/hero/ful_carru_sintex2.png',
    eyebrow: 'SKIN',
    label: 'Simple care, everyday',
    title: 'Make space for your skin.',
    description:
      'Discover gentle beauty essentials designed to make your everyday routine feel a little more intentional.',
    cta: 'Shop skin',
    href: '#skin',
  },

  {
    image: '/hero/ful_carru_sintex3.png',
    eyebrow: 'BODY',
    label: 'Everyday self-care',
    title: 'Feel better in your body.',
    description:
      'Practical essentials for personal care, comfort, and the small rituals that help you slow down.',
    cta: 'Shop body',
    href: '#body',
  },

  {
    image: '/hero/ful_carru_sintex4.png',
    eyebrow: 'HOME',
    label: 'Create your calm',
    title: 'A calmer home, a softer rhythm.',
    description:
      'Bring comfort and intention into your space with simple essentials made for everyday living.',
    cta: 'Shop home',
    href: '#home',
  },

  {
    image: '/hero/ful_carru_sintex5.png',
    eyebrow: 'WELLNESS',
    label: 'Small rituals matter',
    title: 'Feel better. Do less.',
    description:
      'Explore thoughtful essentials that fit naturally into your routine — without adding more noise.',
    cta: 'Explore wellness',
    href: '#wellness',
  },

  {
    image: '/hero/ful_carru_sintex6.png',
    eyebrow: 'THE GETZEMANI EDIT',
    label: 'Less, but considered',
    title: 'Everyday essentials, thoughtfully chosen.',
    description:
      'Beauty, body, and home pieces selected to help you create a routine that feels more like your own.',
    cta: 'Explore the collection',
    href: '#shop',
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
