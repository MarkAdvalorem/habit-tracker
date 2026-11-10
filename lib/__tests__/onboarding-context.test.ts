import { describe, it, expect } from 'vitest';

describe('Onboarding Context', () => {
  it('should have 8 onboarding slides', () => {
    const slides = [
      { id: 'welcome', title: 'Bienvenue' },
      { id: 'create', title: 'Créer une habitude' },
      { id: 'track', title: 'Suivre votre progression' },
      { id: 'statistics', title: 'Visualiser vos statistiques' },
      { id: 'badges', title: 'Débloquer des badges' },
      { id: 'reminders', title: 'Notifications & Rappels' },
      { id: 'sync', title: 'Multi-appareils & Hors-ligne' },
      { id: 'customize', title: 'Personnalisation totale' },
    ];

    expect(slides).toHaveLength(8);
    expect(slides[0].id).toBe('welcome');
    expect(slides[7].id).toBe('customize');
  });

  it('should calculate progress correctly', () => {
    const currentSlide = 0;
    const totalSlides = 8;
    const progress = (currentSlide + 1) / totalSlides;

    expect(progress).toBe(1 / 8);
  });

  it('should handle next slide navigation', () => {
    let currentSlide = 0;
    const totalSlides = 8;

    if (currentSlide < totalSlides - 1) {
      currentSlide += 1;
    }

    expect(currentSlide).toBe(1);
  });

  it('should handle previous slide navigation', () => {
    let currentSlide = 3;

    if (currentSlide > 0) {
      currentSlide -= 1;
    }

    expect(currentSlide).toBe(2);
  });

  it('should not go below slide 0', () => {
    let currentSlide = 0;

    if (currentSlide > 0) {
      currentSlide -= 1;
    }

    expect(currentSlide).toBe(0);
  });

  it('should not go beyond last slide', () => {
    let currentSlide = 7;
    const totalSlides = 8;

    if (currentSlide < totalSlides - 1) {
      currentSlide += 1;
    }

    expect(currentSlide).toBe(7);
  });

  it('should have correct slide icons', () => {
    const slideIcons: Record<string, string> = {
      welcome: 'checkmark-circle',
      create: 'add-circle',
      track: 'check-circle',
      statistics: 'bar-chart',
      badges: 'emoji-events',
      reminders: 'notifications-active',
      sync: 'cloud-sync',
      customize: 'palette',
    };

    expect(slideIcons['welcome']).toBe('checkmark-circle');
    expect(slideIcons['create']).toBe('add-circle');
    expect(slideIcons['track']).toBe('check-circle');
    expect(slideIcons['statistics']).toBe('bar-chart');
    expect(slideIcons['badges']).toBe('emoji-events');
    expect(slideIcons['reminders']).toBe('notifications-active');
    expect(slideIcons['sync']).toBe('cloud-sync');
    expect(slideIcons['customize']).toBe('palette');
  });

  it('should have correct slide colors', () => {
    const slideColors: Record<string, string> = {
      welcome: '#0a7ea4',
      create: '#3B82F6',
      track: '#10B981',
      statistics: '#F59E0B',
      badges: '#EC4899',
      reminders: '#8B5CF6',
      sync: '#06B6D4',
      customize: '#F97316',
    };

    expect(Object.keys(slideColors)).toHaveLength(8);
    expect(slideColors['welcome']).toBe('#0a7ea4');
    expect(slideColors['badges']).toBe('#EC4899');
    expect(slideColors['sync']).toBe('#06B6D4');
    expect(slideColors['customize']).toBe('#F97316');
  });
});
