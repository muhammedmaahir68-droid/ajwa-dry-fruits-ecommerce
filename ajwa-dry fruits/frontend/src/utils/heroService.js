// Hero Slides Service — manages hero slides in localStorage with live sync

const STORAGE_KEY = 'ajwa_hero_slides_v2';

export const getHeroSlides = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Error reading hero slides:', err);
    return [];
  }
};

export const saveHeroSlide = (newSlide) => {
  const slides = getHeroSlides();
  const slideWithId = {
    ...newSlide,
    id: newSlide.id || Date.now().toString(),
    status: newSlide.status || 'Active',
    createdAt: new Date().toISOString()
  };
  const updated = [...slides, slideWithId];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  notifyHeroUpdate();
  return slideWithId;
};

export const updateHeroSlide = (id, updatedFields) => {
  const slides = getHeroSlides();
  const updated = slides.map(slide => slide.id === id ? { ...slide, ...updatedFields } : slide);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  notifyHeroUpdate();
  return updated;
};

export const deleteHeroSlide = (id) => {
  const slides = getHeroSlides();
  const updated = slides.filter(slide => slide.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  notifyHeroUpdate();
  return updated;
};

export const clearAllHeroSlides = () => {
  localStorage.removeItem(STORAGE_KEY);
  notifyHeroUpdate();
};

const notifyHeroUpdate = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('ajwa_hero_update'));
  }
};
