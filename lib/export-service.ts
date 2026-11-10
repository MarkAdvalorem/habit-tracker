import { Habit, Language } from './types';
import { calculateStreaks } from './streak-utils';

function formatDate(date: number): string {
  return new Date(date).toLocaleDateString('en-CA');
}

function escapeHTML(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

function escapeCSV(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n') || value.includes('\r')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function exportToCSV(habits: Habit[], language: Language = 'en'): string {
  const headers = [
    language === 'fr' ? 'Nom' : 'Name',
    language === 'fr' ? 'Description' : 'Description',
    language === 'fr' ? 'Catégorie' : 'Category',
    language === 'fr' ? 'Fréquence' : 'Frequency',
    language === 'fr' ? 'Couleur' : 'Color',
    language === 'fr' ? 'Icône' : 'Icon',
    language === 'fr' ? 'Streak actuel' : 'Current Streak',
    language === 'fr' ? 'Meilleur streak' : 'Best Streak',
    language === 'fr' ? 'Total complété' : 'Total Completed',
    language === 'fr' ? 'Date de création' : 'Created Date',
  ].join(',');

  const rows = habits.map((habit) => {
    const sortedDates = [...habit.completedDates].sort((a, b) => a - b);
    const { currentStreak, bestStreak } = calculateStreaks(sortedDates);

    return [
      escapeCSV(habit.name),
      escapeCSV(habit.description || ''),
      habit.category,
      habit.frequency,
      habit.color,
      habit.icon || '',
      currentStreak,
      bestStreak,
      habit.completedDates.length,
      formatDate(habit.createdAt),
    ].join(',');
  });

  return [headers, ...rows].join('\n');
}

export function exportToHTML(habits: Habit[], language: Language = 'en'): string {
  const title = language === 'fr' ? 'Rapport Habit Tracker' : 'Habit Tracker Report';
  const localeMap: Record<string, string> = { fr: 'fr-FR', en: 'en-US', it: 'it-IT', de: 'de-DE', ru: 'ru-RU', es: 'es-ES' };
  const date = new Date().toLocaleDateString(localeMap[language] || 'en-US', { day: 'numeric', month: 'long', year: 'numeric' });

  const sortedHabits = habits.map((habit) => {
    const sortedDates = [...habit.completedDates].sort((a, b) => a - b);
    const { currentStreak, bestStreak } = calculateStreaks(sortedDates);

    return { ...habit, currentStreak, bestStreak };
  });

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${title}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; padding: 24px; color: #111827; }
    h1 { color: #0A7EA4; margin-bottom: 4px; }
    .date { color: #6B7280; font-size: 14px; margin-bottom: 24px; }
    .summary { display: flex; gap: 16px; margin-bottom: 24px; }
    .summary-card { background: #F3F4F6; padding: 12px 16px; border-radius: 8px; }
    .summary-card .value { font-size: 24px; font-weight: bold; color: #0A7EA4; }
    .summary-card .label { font-size: 12px; color: #6B7280; }
    table { width: 100%; border-collapse: collapse; margin-top: 16px; }
    th { background: #0A7EA4; color: white; padding: 10px; text-align: left; font-size: 13px; }
    td { padding: 8px 10px; border-bottom: 1px solid #E5E7EB; font-size: 13px; }
    tr:nth-child(even) { background: #F9FAFB; }
    .color-dot { display: inline-block; width: 12px; height: 12px; border-radius: 50%; vertical-align: middle; margin-right: 6px; }
    @media print { body { padding: 0; } .summary-card { border: 1px solid #E5E7EB; } }
  </style>
</head>
<body>
  <h1>${title}</h1>
  <p class="date">${date}</p>

  <div class="summary">
    <div class="summary-card">
      <div class="value">${habits.length}</div>
      <div class="label">${language === 'fr' ? 'Total habitudes' : 'Total Habits'}</div>
    </div>
    <div class="summary-card">
      <div class="value">${habits.reduce((sum, h) => sum + h.completedDates.length, 0)}</div>
      <div class="label">${language === 'fr' ? 'Complétions totales' : 'Total Completions'}</div>
    </div>
    <div class="summary-card">
      <div class="value">${Math.max(...sortedHabits.map(h => h.bestStreak), 0)}</div>
      <div class="label">${language === 'fr' ? 'Meilleur streak' : 'Best Streak'}</div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>${language === 'fr' ? 'Nom' : 'Name'}</th>
        <th>${language === 'fr' ? 'Catégorie' : 'Category'}</th>
        <th>${language === 'fr' ? 'Fréquence' : 'Frequency'}</th>
        <th>${language === 'fr' ? 'Streak' : 'Streak'}</th>
        <th>${language === 'fr' ? 'Total' : 'Total'}</th>
        <th>${language === 'fr' ? 'Créé le' : 'Created'}</th>
      </tr>
    </thead>
    <tbody>
      ${sortedHabits.map((h) => `
      <tr>
        <td><span class="color-dot" style="background:${h.color}"></span>${escapeHTML(h.name)}${h.description ? `<br><small style="color:#6B7280">${escapeHTML(h.description)}</small>` : ''}</td>
        <td>${h.category}</td>
        <td>${h.frequency}</td>
        <td>${h.currentStreak} / ${h.bestStreak}</td>
        <td>${h.completedDates.length}</td>
        <td>${formatDate(h.createdAt)}</td>
      </tr>
      `).join('\n')}
    </tbody>
  </table>
</body>
</html>
  `.trim();
}
