import { Challenge, CheckIn } from '../types/challenge';

const generateMockChallenge = (numCheckIns: number): Challenge => {
  const checkIns: CheckIn[] = [];
  const baseDate = new Date();
  for (let i = 0; i < numCheckIns; i++) {
    const d = new Date(baseDate);
    d.setDate(d.getDate() - i);
    checkIns.push({
      id: `ci-${i}`,
      date: d.toISOString().split('T')[0],
      notes: i % 2 === 0 ? 'Notes' : undefined,
      link: i % 3 === 0 ? 'Link' : undefined,
      createdAt: new Date().toISOString(),
    });
  }

  return {
    id: 'c1',
    name: 'Test Challenge',
    category: 'coding',
    difficulty: 'medium',
    visibility: 'private',
    startDate: new Date().toISOString(),
    status: 'active',
    checkIns,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
};

const runBenchmark = () => {
  const challenge = generateMockChallenge(1000); // 1000 check-ins
  const weeks = 12;
  const days = weeks * 7;

  // Baseline (current implementation)
  console.time('Baseline');
  const checkedInDates = new Set(challenge.checkIns.map(ci => ci.date));
  const getCheckInBase = (dateStr: string) => {
    return challenge.checkIns.find(ci => ci.date === dateStr);
  };
  let dummy1 = 0;
  for (let i = 0; i < 1000; i++) { // Render 1000 times
      for (let d = 0; d < days; d++) {
        const dateStr = challenge.checkIns[d % 1000]?.date || '2023-01-01';
        if (checkedInDates.has(dateStr)) {
          const ci = getCheckInBase(dateStr);
          if (ci) dummy1++;
        }
      }
  }
  console.timeEnd('Baseline');

  // Optimized (Map implementation)
  console.time('Optimized');
  const checkInsMap = new Map(challenge.checkIns.map(ci => [ci.date, ci]));
  const getCheckInOpt = (dateStr: string) => {
    return checkInsMap.get(dateStr);
  };
  let dummy2 = 0;
  for (let i = 0; i < 1000; i++) { // Render 1000 times
      for (let d = 0; d < days; d++) {
        const dateStr = challenge.checkIns[d % 1000]?.date || '2023-01-01';
        if (checkInsMap.has(dateStr)) {
          const ci = getCheckInOpt(dateStr);
          if (ci) dummy2++;
        }
      }
  }
  console.timeEnd('Optimized');
};

runBenchmark();
