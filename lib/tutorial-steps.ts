export interface TutorialStep {
  id: string;
  screen: string;
  messageKey: string;
  anchor: 'top-right' | 'center' | 'bottom-center' | 'bottom-left' | 'bottom-tabs';
}

export const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: 'add-habit',
    screen: 'index',
    messageKey: 'tutorial.step1',
    anchor: 'top-right',
  },
  {
    id: 'view-habit',
    screen: 'index',
    messageKey: 'tutorial.step2',
    anchor: 'center',
  },
  {
    id: 'mark-complete',
    screen: 'habit-detail',
    messageKey: 'tutorial.step3',
    anchor: 'center',
  },
  {
    id: 'statistics-tab',
    screen: 'index',
    messageKey: 'tutorial.step4',
    anchor: 'bottom-tabs',
  },
  {
    id: 'charts',
    screen: 'statistics',
    messageKey: 'tutorial.step5',
    anchor: 'center',
  },
  {
    id: 'badges-tab',
    screen: 'index',
    messageKey: 'tutorial.step6',
    anchor: 'bottom-tabs',
  },
  {
    id: 'done',
    screen: 'badges',
    messageKey: 'tutorial.step7',
    anchor: 'center',
  },
];
