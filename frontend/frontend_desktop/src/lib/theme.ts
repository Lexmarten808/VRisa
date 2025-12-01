// Simple institution theming via CSS variables
// Call applyInstitutionTheme with a palette to update the UI look

export type InstitutionPalette = {
  name?: string;
  brand: string; // primary brand color
  accent: string; // secondary/accent color
  bg: string; // background base color
  text?: string; // optional text color
};

const VARS = {
  brand: '--inst-brand',
  accent: '--inst-accent',
  bg: '--inst-bg',
  text: '--inst-text',
};

export function applyInstitutionTheme(palette: InstitutionPalette) {
  const root = document.documentElement;
  root.style.setProperty(VARS.brand, palette.brand);
  root.style.setProperty(VARS.accent, palette.accent);
  root.style.setProperty(VARS.bg, palette.bg);
  root.style.setProperty(VARS.text, palette.text ?? '#0f172a');
  localStorage.setItem('vrisa_institution_theme', JSON.stringify(palette));
}

export function clearInstitutionTheme() {
  const root = document.documentElement;
  root.style.removeProperty(VARS.brand);
  root.style.removeProperty(VARS.accent);
  root.style.removeProperty(VARS.bg);
  root.style.removeProperty(VARS.text);
  localStorage.removeItem('vrisa_institution_theme');
}

export function loadInstitutionThemeFromStorage() {
  try {
    const raw = localStorage.getItem('vrisa_institution_theme');
    if (!raw) return null;
    const palette = JSON.parse(raw) as InstitutionPalette;
    applyInstitutionTheme(palette);
    return palette;
  } catch {
    return null;
  }
}

// Map a string color_set from DB to a palette
export function paletteFromColorSet(colorSet?: string): InstitutionPalette | null {
  const key = (colorSet || '').toLowerCase();
  switch (key) {
    case 'red-white':
      return { name: 'red-white', brand: '#dc2626', accent: '#ef4444', bg: '#ffffff', text: '#111827' };
    case 'green-white':
      return { name: 'green-white', brand: '#16a34a', accent: '#22c55e', bg: '#ffffff', text: '#0b1021' };
    case 'blue-gray':
      return { name: 'blue-gray', brand: '#2563eb', accent: '#64748b', bg: '#f8fafc', text: '#0f172a' };
    case 'teal-white':
      return { name: 'teal-white', brand: '#0d9488', accent: '#14b8a6', bg: '#ffffff', text: '#0b1021' };
    case 'navy-white':
      return { name: 'navy-white', brand: '#1e3a8a', accent: '#3b82f6', bg: '#ffffff', text: '#0f172a' };
    case 'orange-white':
      return { name: 'orange-white', brand: '#ea580c', accent: '#f97316', bg: '#ffffff', text: '#0f172a' };
    case 'green-gray':
      return { name: 'green-gray', brand: '#22c55e', accent: '#64748b', bg: '#f8fafc', text: '#0f172a' };
    case 'purple-white':
      return { name: 'purple-white', brand: '#7c3aed', accent: '#a78bfa', bg: '#ffffff', text: '#0f172a' };
    case 'yellow-black':
      return { name: 'yellow-black', brand: '#f59e0b', accent: '#fbbf24', bg: '#0b1021', text: '#f9fafb' };
    case 'cyan-white':
      return { name: 'cyan-white', brand: '#06b6d4', accent: '#22d3ee', bg: '#ffffff', text: '#0f172a' };
    default:
      return null;
  }
}
