/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  User, 
  ChevronRight, 
  SkipForward, 
  Printer, 
  RotateCcw,
  Brain,
  Globe,
  Calculator,
  Smile,
  Info
} from 'lucide-react';

// --- Types ---

type QuestionType = 'mcq' | 'recall' | 'psy';

interface Question {
  type: QuestionType;
  q: string;
  opts?: string[];
  correct?: number;
  pts: number;
  note?: string;
  hint?: string;
  trait?: string;
  direction?: 'high' | 'low';
}

interface Section {
  id: string;
  name: string;
  short: string;
  desc: string;
  color: string;
  bgColor: string;
  maxPts: number;
  qs: Question[];
}

interface Answer {
  selected: number | null;
  correct: boolean;
  skipped: boolean;
  earned: number;
  scaleVal: number | null;
}

// --- Data ---

const MEMORY_WORDS = [
  { jp: 'はい', rom: 'HAI', eng: 'Yes' },
  { jp: 'ありがとう', rom: 'ARIGATOU', eng: 'Thank you' },
  { jp: 'すみません', rom: 'SUMIMASEN', eng: 'Excuse me / Sorry' },
];

const SECTIONS: Section[] = [
  {
    id: "japanese",
    name: "Japanese Language & Culture",
    short: "Japanese",
    color: "#C0392B",
    bgColor: "#FEF0EF",
    maxPts: 35,
    desc: "Basic and advanced workplace vocabulary and professional etiquette in Japan.",
    qs: [
      {
        type: "mcq",
        q: "In Japan, arriving to your shift exactly on time (not early) is often seen as:",
        opts: [
          "Perfectly acceptable",
          "Slightly late — being 5-10 minutes early is preferred",
          "A sign of great leadership",
          "Unnecessary in modern workplaces"
        ],
        correct: 1,
        pts: 4,
        note: "Punctuality is a core value. Arriving early shows you are ready to work."
      },
      {
        type: "mcq",
        q: "When a supervisor is giving you instructions, you should:",
        opts: [
          "Look away to show you are thinking",
          "Nod and say 'Hai' (Yes) to show you are listening",
          "Interrupt if you have a better idea",
          "Start doing the task while they are still talking"
        ],
        correct: 1,
        pts: 4,
        note: "Active listening and confirmation are essential in Japanese communication."
      },
      {
        type: "mcq",
        q: "When handing an object to a senior colleague, you should use:",
        opts: [
          "Your right hand only",
          "Your left hand only",
          "Both hands",
          "Whichever hand is free"
        ],
        correct: 2,
        pts: 4,
        note: "Using both hands is a sign of respect when giving or receiving items."
      },
      {
        type: "mcq",
        q: "The Japanese workplace concept 'Hou-Ren-Sou' stands for:",
        opts: [
          "Speed, Quality, and Safety",
          "Report, Contact, and Consult",
          "Cleaning, Organizing, and Polishing",
          "Punctuality, Respect, and Silence"
        ],
        correct: 1,
        pts: 5,
        note: "Hou-Ren-Sou (Hokoku, Renraku, Sodan) is the foundation of Japanese teamwork."
      },
      {
        type: "mcq",
        q: "If a schedule says '月曜日' (Getsuyoubi), which day of the week is it?",
        opts: [
          "Sunday",
          "Monday",
          "Tuesday",
          "Friday"
        ],
        correct: 1,
        pts: 5,
        note: "月 (Moon) represents Monday in the Japanese calendar."
      },
      {
        type: "recall",
        q: "Recall: Which Japanese word means 'Yes'?",
        opts: ["Sumimasen", "Arigatou", "Hai", "Ohayou"],
        correct: 2,
        pts: 4,
      },
      {
        type: "recall",
        q: "Recall: Which Japanese word means 'Thank you'?",
        opts: ["Wakarimashita", "Arigatou", "Hai", "Sumimasen"],
        correct: 1,
        pts: 5,
      }
    ]
  },
  {
    id: "aptitude",
    name: "General Aptitude",
    short: "Aptitude",
    color: "#1A4A7A",
    bgColor: "#EAF2F8",
    maxPts: 44,
    desc: "Logical reasoning and practical arithmetic for daily workplace tasks.",
    qs: [
      {
        type: "mcq",
        q: "If your shift starts at 8:00 AM and lasts 8 hours, what time do you finish?",
        opts: ["3:00 PM", "4:00 PM", "5:00 PM", "6:00 PM"],
        correct: 1,
        pts: 5,
      },
      {
        type: "mcq",
        q: "A box holds 10 items. You need to pack 50 items. How many boxes do you need?",
        opts: ["4 boxes", "5 boxes", "6 boxes", "10 boxes"],
        correct: 1,
        pts: 5,
      },
      {
        type: "mcq",
        q: "If a shift starts at 10:00 PM and ends at 6:00 AM the next day, how many hours is the shift?",
        opts: ["6 hours", "7 hours", "8 hours", "9 hours"],
        correct: 2,
        pts: 6,
      },
      {
        type: "mcq",
        q: "A product costs ¥1,000. If there is a 10% tax, what is the final price?",
        opts: ["¥1,010", "¥1,100", "¥1,050", "¥1,200"],
        correct: 1,
        pts: 6,
      },
      {
        type: "mcq",
        q: "If 1 kilogram is 1,000 grams, how many grams are in 2.5 kilograms?",
        opts: ["250g", "2,000g", "2,500g", "25,000g"],
        correct: 2,
        pts: 6,
      },
      {
        type: "mcq",
        q: "Complete the pattern: 2, 4, 6, 8, ___",
        opts: ["9", "10", "11", "12"],
        correct: 1,
        pts: 5,
      },
      {
        type: "mcq",
        q: "Complete the pattern: 1, 4, 9, 16, ___",
        opts: ["20", "24", "25", "30"],
        correct: 2,
        pts: 6,
      },
      {
        type: "mcq",
        q: "If you earn ¥1,000 per hour and work for 5 hours, how much do you earn?",
        opts: ["¥4,000", "¥5,000", "¥6,000", "¥10,000"],
        correct: 1,
        pts: 5,
      }
    ]
  },
  {
    id: "psychometric",
    name: "Psychometric Assessment",
    short: "Psycho",
    color: "#5B2C8D",
    bgColor: "#F4EEF9",
    maxPts: 0,
    desc: "Measures discipline, teamwork, and adaptability. Answer honestly.",
    qs: [
      {
        type: "psy",
        trait: "discipline",
        direction: "high",
        q: "I always follow safety rules, even when no one is watching me.",
        pts: 0,
      },
      {
        type: "psy",
        trait: "teamwork",
        direction: "high",
        q: "I enjoy helping my coworkers if they are struggling with their work.",
        pts: 0,
      },
      {
        type: "psy",
        trait: "adaptability",
        direction: "high",
        q: "I am willing to learn new ways of doing things, even if I have experience.",
        pts: 0,
      },
      {
        type: "psy",
        trait: "resilience",
        direction: "high",
        q: "When a task is difficult, I keep trying until I get it right.",
        pts: 0,
      }
    ]
  },
  {
    id: "awareness",
    name: "General Awareness",
    short: "Awareness",
    color: "#8E6000",
    bgColor: "#FEF5E4",
    maxPts: 25,
    desc: "Basic and advanced knowledge about working in Japan.",
    qs: [
      {
        type: "mcq",
        q: "What is the capital city of Japan?",
        opts: ["Osaka", "Kyoto", "Tokyo", "Hiroshima"],
        correct: 2,
        pts: 3,
      },
      {
        type: "mcq",
        q: "What is the name of the currency used in Japan?",
        opts: ["Dollar", "Yen", "Rupee", "Yuan"],
        correct: 1,
        pts: 3,
      },
      {
        type: "mcq",
        q: "In Japan, which side of the road do vehicles drive on?",
        opts: ["Right side", "Left side", "Middle", "Depends on the city"],
        correct: 1,
        pts: 4,
      },
      {
        type: "mcq",
        q: "What is the main difference between SSW1 and SSW2 visas?",
        opts: [
          "SSW2 is for lower skilled workers",
          "SSW2 allows for family stays and indefinite renewals",
          "SSW1 pays more than SSW2",
          "There is no difference"
        ],
        correct: 1,
        pts: 5,
      },
      {
        type: "mcq",
        q: "Which of these is NOT one of the four main islands of Japan?",
        opts: ["Honshu", "Hokkaido", "Kyushu", "Taiwan"],
        correct: 3,
        pts: 5,
      },
      {
        type: "mcq",
        q: "When using public transport in Japan, it is considered polite to:",
        opts: [
          "Talk loudly on your phone",
          "Eat a full meal while sitting",
          "Keep your phone on silent and avoid talking",
          "Play music without headphones"
        ],
        correct: 2,
        pts: 5,
      }
    ]
  }
];

const TRAITS: Record<string, { label: string; color: string }> = {
  discipline: { label: "Discipline", color: "#C0392B" },
  teamwork: { label: "Teamwork", color: "#1A7A40" },
  adaptability: { label: "Adaptability", color: "#1A4A7A" },
  resilience: { label: "Resilience", color: "#5B2C8D" },
};

// Flatten all questions
const allQuestions = SECTIONS.flatMap((sec, sIdx) => 
  sec.qs.map((q, qIdx) => ({ ...q, sectionIdx: sIdx, qIdxInSec: qIdx }))
);

// --- Main App Component ---

export default function App() {
  const [screen, setScreen] = useState<'setup' | 'memory-study' | 'section-break' | 'question' | 'result'>('setup');
  const [candidate, setCandidate] = useState({ name: '', sector: '', interviewer: '' });
  const [currentQIdx, setCurrentQIdx] = useState(0);
  const [currentSecIdx, setCurrentSecIdx] = useState(-1);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [memoryTimer, setMemoryTimer] = useState(60);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const memoryTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (screen === 'setup') {
      setAnswers(allQuestions.map(() => ({ selected: null, correct: false, skipped: false, earned: 0, scaleVal: null })));
    }
  }, [screen]);

  // Memory Study Timer
  useEffect(() => {
    if (screen === 'memory-study') {
      memoryTimerRef.current = setInterval(() => {
        setMemoryTimer((prev) => {
          if (prev <= 1) {
            clearInterval(memoryTimerRef.current!);
            startInterviewFlow();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (memoryTimerRef.current) clearInterval(memoryTimerRef.current);
    };
  }, [screen]);

  // Question Timer
  useEffect(() => {
    if (isTimerActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            handleSkip();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerActive, timeLeft]);

  const startInterviewFlow = () => {
    setCurrentQIdx(0);
    setCurrentSecIdx(-1);
    goToNext(0);
  };

  const goToNext = (idx: number) => {
    const nextQ = allQuestions[idx];
    if (!nextQ) {
      setScreen('result');
      return;
    }

    if (nextQ.sectionIdx !== currentSecIdx) {
      setCurrentSecIdx(nextQ.sectionIdx);
      setScreen('section-break');
    } else {
      startQuestion(idx);
    }
  };

  const startQuestion = (idx: number) => {
    const q = allQuestions[idx];
    if (!q) return;
    const duration = q.type === 'psy' ? 45 : 30;
    setTimeLeft(duration);
    setIsTimerActive(true);
    setSelectedOpt(null);
    setScreen('question');
  };

  const handleNext = () => {
    if (selectedOpt === null) return;
    setIsTimerActive(false);
    
    const q = allQuestions[currentQIdx];
    const newAnswers = [...answers];
    
    if (q.type === 'psy') {
      const effective = q.direction === 'low' ? (6 - selectedOpt) : selectedOpt;
      newAnswers[currentQIdx] = {
        selected: selectedOpt,
        correct: false,
        skipped: false,
        earned: 0,
        scaleVal: effective
      };
    } else {
      const isCorrect = selectedOpt === q.correct;
      newAnswers[currentQIdx] = {
        selected: selectedOpt,
        correct: isCorrect,
        skipped: false,
        earned: isCorrect ? q.pts : 0,
        scaleVal: null
      };
    }
    
    setAnswers(newAnswers);
    
    // Small delay for feedback if MCQ
    if (q.type !== 'psy') {
      setTimeout(() => {
        const nextIdx = currentQIdx + 1;
        setCurrentQIdx(nextIdx);
        goToNext(nextIdx);
      }, 800);
    } else {
      const nextIdx = currentQIdx + 1;
      setCurrentQIdx(nextIdx);
      goToNext(nextIdx);
    }
  };

  const handleSkip = () => {
    setIsTimerActive(false);
    const newAnswers = [...answers];
    newAnswers[currentQIdx] = {
      selected: null,
      correct: false,
      skipped: true,
      earned: 0,
      scaleVal: null
    };
    setAnswers(newAnswers);
    const nextIdx = currentQIdx + 1;
    setCurrentQIdx(nextIdx);
    goToNext(nextIdx);
  };

  const totalScore = answers.reduce((acc, curr) => acc + curr.earned, 0);
  const maxScore = allQuestions.reduce((acc, q) => acc + (q.pts || 0), 0);
  const scorePct = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;

  const getTraitScores = () => {
    const traitMap: Record<string, number[]> = {};
    Object.keys(TRAITS).forEach(t => traitMap[t] = []);
    
    allQuestions.forEach((q, i) => {
      if (q.type === 'psy' && q.trait && answers[i]?.scaleVal !== null) {
        traitMap[q.trait].push(answers[i].scaleVal!);
      }
    });
    
    return Object.entries(traitMap).map(([key, vals]) => {
      const avg = vals.length ? Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10 : 0;
      return { key, avg, ...TRAITS[key] };
    });
  };

  // --- Render Helpers ---

  if (screen === 'setup') {
    return (
      <div className="min-h-screen bg-[#1C2833] flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-sm p-10 w-full max-w-lg shadow-2xl"
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="w-1.5 h-12 bg-[#C0392B]" />
            <div>
              <h1 className="font-serif text-2xl text-[#1C2833]">Zenro</h1>
              <p className="text-[10px] tracking-[2.5px] uppercase text-gray-500">Japan Career Program</p>
            </div>
          </div>
          
          <h2 className="font-serif text-3xl mb-2">Candidate Interview</h2>
          <p className="text-sm text-gray-500 mb-8">Streamlined assessment for skilled workers.</p>
          
          <div className="space-y-4 mb-8">
            <div>
              <label className="block text-[10px] font-bold tracking-widest uppercase text-gray-400 mb-1">Candidate Name</label>
              <input 
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-sm focus:border-[#C0392B] outline-none transition-colors"
                placeholder="e.g. Rahul Sharma"
                value={candidate.name}
                onChange={e => setCandidate({...candidate, name: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold tracking-widest uppercase text-gray-400 mb-1">Sector</label>
              <select 
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-sm focus:border-[#C0392B] outline-none transition-colors appearance-none"
                value={candidate.sector}
                onChange={e => setCandidate({...candidate, sector: e.target.value})}
              >
                <option value="">Select Sector</option>
                <option>Driving</option>
                <option>Construction</option>
                <option>Caregiving</option>
                <option>Hospitality</option>
                <option>Manufacturing</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold tracking-widest uppercase text-gray-400 mb-1">Interviewer</label>
              <input 
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-sm focus:border-[#C0392B] outline-none transition-colors"
                placeholder="Your Name"
                value={candidate.interviewer}
                onChange={e => setCandidate({...candidate, interviewer: e.target.value})}
              />
            </div>
          </div>
          
          <button 
            disabled={!candidate.name || !candidate.sector || !candidate.interviewer}
            onClick={() => setScreen('memory-study')}
            className="w-full py-4 bg-[#C0392B] text-white font-bold rounded-sm hover:bg-[#96281B] transition-colors disabled:opacity-50"
          >
            Begin Interview Session
          </button>
          
          <div className="flex flex-wrap gap-2 mt-6 pt-6 border-t border-gray-100">
            {['4 Sections', '16 Questions', 'Auto-scored'].map(tag => (
              <span key={tag} className="px-3 py-1 bg-gray-50 rounded-full text-[11px] font-medium text-gray-400">
                {tag}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  if (screen === 'memory-study') {
    return (
      <div className="min-h-screen bg-[#1C2833] flex flex-col items-center justify-center p-8 text-center">
        <div className="px-4 py-1 border border-[#C0392B]/50 rounded-full text-[11px] text-[#C0392B] tracking-widest uppercase font-bold mb-6">
          Memory Test — Study Phase
        </div>
        <h2 className="font-serif text-4xl text-white mb-4">Memorize These 3 Words</h2>
        <p className="text-gray-400 max-w-xl mb-10 leading-relaxed">
          Study these Japanese words and their meanings. You will be tested on them at the end of the interview.
        </p>
        
        <div className="relative w-24 h-24 mb-12">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="5" />
            <motion.circle 
              cx="50" cy="50" r="45" fill="none" stroke="#C0392B" strokeWidth="5" strokeLinecap="round"
              initial={{ pathLength: 1 }}
              animate={{ pathLength: memoryTimer / 60 }}
              transition={{ duration: 1, ease: "linear" }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center font-mono text-2xl text-white font-bold">
            {memoryTimer}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl mb-8">
          {MEMORY_WORDS.map(w => (
            <div key={w.rom} className="bg-white/10 border border-white/10 rounded-sm p-8">
              <div className="text-4xl text-white mb-2 tracking-widest">{w.jp}</div>
              <div className="font-mono text-xs text-gray-400 tracking-widest mb-4">{w.rom}</div>
              <div className="h-px w-8 bg-white/20 mx-auto mb-4" />
              <div className="text-lg text-[#C0392B] font-bold">{w.eng}</div>
            </div>
          ))}
        </div>
        
        <button 
          onClick={() => { clearInterval(memoryTimerRef.current!); startInterviewFlow(); }}
          className="text-white/50 hover:text-white text-sm underline underline-offset-4"
        >
          Skip timer and start
        </button>
      </div>
    );
  }

  if (screen === 'section-break') {
    const sec = SECTIONS[currentSecIdx];
    if (!sec) return null;
    return (
      <div className="min-h-screen bg-[#1C2833] flex flex-col items-center justify-center p-8 text-center">
        <div className="font-mono text-[120px] font-bold text-white/5 leading-none mb-[-40px]">
          0{currentSecIdx + 1}
        </div>
        <h2 className="font-serif text-4xl text-white mb-4">{sec.name}</h2>
        <p className="text-gray-400 max-w-md mb-8 leading-relaxed">{sec.desc}</p>
        <div className="font-mono text-xs text-[#C0392B] tracking-widest mb-10">
          {sec.qs.length} QUESTIONS · {sec.maxPts > 0 ? `${sec.maxPts} POINTS` : 'TRAIT PROFILING'}
        </div>
        <button 
          onClick={() => startQuestion(currentQIdx)}
          className="px-12 py-4 bg-[#C0392B] text-white font-bold rounded-sm hover:bg-[#96281B] transition-colors"
        >
          Begin Section
        </button>
      </div>
    );
  }

  if (screen === 'question') {
    const q = allQuestions[currentQIdx];
    if (!q) return null;
    const sec = SECTIONS[q.sectionIdx];
    const ans = answers[currentQIdx];
    const isLocked = !isTimerActive || ans?.selected !== null;

    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Top Bar */}
        <div className="bg-[#1C2833] h-16 px-8 flex items-center justify-between sticky top-0 z-50">
          <div className="text-gray-300 text-sm">Candidate: <span className="text-white font-bold">{candidate.name}</span></div>
          <div className="flex-1 mx-12 flex items-center gap-4">
            <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
              <div 
                className="h-full bg-[#C0392B] transition-all duration-500" 
                style={{ width: `${(currentQIdx / allQuestions.length) * 100}%` }}
              />
            </div>
            <div className="font-mono text-[10px] text-gray-500 whitespace-nowrap">
              {currentQIdx + 1} / {allQuestions.length}
            </div>
          </div>
          <div className={`font-mono text-2xl font-bold ${timeLeft <= 10 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
            {timeLeft}s
          </div>
        </div>

        {/* Section Strip */}
        <div className="bg-white border-b border-gray-200 px-8 py-3 flex items-center gap-4">
          <div className="text-[10px] font-bold tracking-widest uppercase text-[#1C2833]">
            Section {q.sectionIdx + 1}: {sec.name}
          </div>
          <div 
            className="px-2 py-0.5 rounded-sm text-[9px] font-bold tracking-widest uppercase"
            style={{ backgroundColor: sec.bgColor, color: sec.color }}
          >
            {sec.short}
          </div>
          <div className="ml-auto font-mono text-[11px] text-gray-400">
            {q.type === 'psy' ? 'Trait Assessment' : `${q.pts} Points`}
          </div>
        </div>

        {/* Question Body */}
        <div className="flex-1 max-w-3xl mx-auto w-full p-8 py-12">
          {q.note && (
            <div className="bg-[#1C2833] text-gray-300 text-xs p-3 rounded-sm border-l-4 border-[#C0392B] mb-6">
              <span className="font-bold text-white">Interviewer:</span> {q.note}
            </div>
          )}
          
          <div className="font-mono text-[10px] text-gray-400 tracking-[3px] uppercase mb-4">
            Question {currentQIdx + 1}
          </div>
          <h3 className="font-serif text-3xl text-[#1C2833] leading-tight mb-10">
            {q.q}
          </h3>

          {q.type === 'mcq' || q.type === 'recall' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
              {q.opts?.map((opt, i) => {
                const isCorrect = i === q.correct;
                const isSelected = selectedOpt === i;
                const showResult = !isTimerActive && selectedOpt !== null;
                
                let btnClass = "p-5 bg-white border-2 border-gray-200 rounded-sm text-left transition-all flex items-start gap-4 ";
                if (isSelected && isTimerActive) btnClass += "border-[#1C2833] bg-[#1C2833] text-white ";
                if (showResult) {
                  if (isCorrect) btnClass += "border-green-500 bg-green-50 text-green-700 ";
                  else if (isSelected) btnClass += "border-red-500 bg-red-50 text-red-700 ";
                } else if (!isLocked) {
                  btnClass += "hover:border-gray-400 hover:shadow-sm";
                }

                return (
                  <button 
                    key={i}
                    disabled={isLocked}
                    onClick={() => setSelectedOpt(i)}
                    className={btnClass}
                  >
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center font-mono text-[11px] font-bold flex-shrink-0 ${isSelected ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-400'}`}>
                      {String.fromCharCode(65 + i)}
                    </div>
                    <div className="leading-tight pt-1">{opt}</div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="mb-12">
              <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">
                <span>Strongly Disagree</span>
                <span>Strongly Agree</span>
              </div>
              <div className="flex gap-3">
                {[1, 2, 3, 4, 5].map(v => (
                  <button 
                    key={v}
                    onClick={() => setSelectedOpt(v)}
                    className={`flex-1 aspect-square rounded-sm border-2 font-mono text-xl font-bold transition-all flex items-center justify-center
                      ${selectedOpt === v 
                        ? 'bg-[#5B2C8D] border-[#5B2C8D] text-white' 
                        : 'bg-white border-gray-200 text-gray-300 hover:border-gray-400 hover:text-gray-500'}`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Nav */}
          <div className="flex items-center justify-between pt-8 border-t border-gray-200">
            <button onClick={handleSkip} className="text-gray-400 hover:text-gray-600 text-sm">
              Skip Question
            </button>
            <div className="flex items-center gap-6">
              <span className="text-xs text-gray-400">
                {selectedOpt !== null ? 'Answer selected' : 'No selection'}
              </span>
              <button 
                disabled={selectedOpt === null}
                onClick={handleNext}
                className="px-10 py-3 bg-[#1C2833] text-white font-bold rounded-sm hover:bg-gray-800 transition-colors disabled:opacity-30"
              >
                Next →
              </button>
            </div>
          </div>
        </div>

        {/* Live Bar */}
        <div className="bg-white border-t border-gray-200 h-16 px-8 flex items-center gap-12">
          <div className="flex flex-col">
            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Score</span>
            <span className="font-mono text-xl font-bold text-[#1C2833]">{totalScore}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Correct</span>
            <span className="font-mono text-xl font-bold text-green-600">{answers.filter(a => a.correct).length}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Skipped</span>
            <span className="font-mono text-xl font-bold text-gray-400">{answers.filter(a => a.skipped).length}</span>
          </div>
          <div className="ml-auto text-[11px] text-gray-400 italic">
            Interviewer selects answers on candidate's behalf
          </div>
        </div>
      </div>
    );
  }

  if (screen === 'result') {
    const traitScores = getTraitScores();
    const verdict = scorePct >= 70 ? { color: 'text-green-600', bg: 'bg-green-50', text: 'Strong Candidate — Proceed', detail: 'Demonstrated strong performance across all core areas. Recommend for immediate enrollment.' } :
                    scorePct >= 50 ? { color: 'text-yellow-700', bg: 'bg-yellow-50', text: 'Borderline — Review Required', detail: 'Shows potential but has gaps. Follow-up discussion recommended before final decision.' } :
                    { color: 'text-red-600', bg: 'bg-red-50', text: 'Not Ready — Re-evaluate', detail: 'Does not meet minimum threshold. Suggest 2 weeks of preparation before re-interview.' };

    return (
      <div className="min-h-screen bg-gray-50">
        {/* Result Hero */}
        <div className="bg-white border-b border-gray-200 p-12 flex flex-col md:flex-row items-start gap-12">
          <div className="relative w-40 h-40 flex-shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" fill="none" stroke="#F3F4F6" strokeWidth="6" />
              <motion.circle 
                cx="50" cy="50" r="45" fill="none" stroke={scorePct >= 70 ? '#16A34A' : scorePct >= 50 ? '#D97706' : '#DC2626'} strokeWidth="6" strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: scorePct / 100 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="font-serif text-5xl leading-none">{totalScore}</div>
              <div className="font-mono text-[10px] text-gray-400 mt-1">/ {maxScore}</div>
            </div>
          </div>
          
          <div className="flex-1">
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Interview Result</div>
            <h2 className="font-serif text-4xl text-[#1C2833] mb-4">{candidate.name}</h2>
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-sm font-bold text-sm mb-4 ${verdict.bg} ${verdict.color}`}>
              <div className="w-2 h-2 rounded-full bg-current" />
              {verdict.text}
            </div>
            <p className="text-gray-500 text-sm leading-relaxed max-w-xl">{verdict.detail}</p>
            
            <div className="flex flex-wrap gap-6 mt-6 pt-6 border-t border-gray-100">
              <div className="text-xs text-gray-400">Sector: <span className="text-[#1C2833] font-bold">{candidate.sector}</span></div>
              <div className="text-xs text-gray-400">Interviewer: <span className="text-[#1C2833] font-bold">{candidate.interviewer}</span></div>
              <div className="text-xs text-gray-400">Date: <span className="text-[#1C2833] font-bold">{new Date().toLocaleDateString()}</span></div>
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto p-12">
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-6">Section Breakdown</div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
            {SECTIONS.filter(s => s.maxPts > 0).map((sec, i) => {
              const secQs = allQuestions.filter(q => q.sectionIdx === SECTIONS.indexOf(sec));
              const earned = secQs.reduce((acc, q) => acc + (answers[allQuestions.indexOf(q)]?.earned || 0), 0);
              const pct = Math.round((earned / sec.maxPts) * 100);
              return (
                <div key={sec.id} className="bg-white p-6 border border-gray-200 rounded-sm">
                  <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-2">{sec.name}</div>
                  <div className="flex items-baseline gap-1 mb-3">
                    <span className="font-serif text-3xl" style={{ color: sec.color }}>{earned}</span>
                    <span className="font-mono text-xs text-gray-400">/ {sec.maxPts}</span>
                  </div>
                  <div className="h-1 bg-gray-100 rounded-full overflow-hidden mb-2">
                    <div className="h-full" style={{ width: `${pct}%`, backgroundColor: sec.color }} />
                  </div>
                  <div className="text-[10px] text-gray-400 font-mono">{pct}% Accuracy</div>
                </div>
              );
            })}
          </div>

          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-6">Psychometric Profile</div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
            {traitScores.map(t => {
              const pct = Math.round((t.avg / 5) * 100);
              const label = t.avg >= 4 ? 'Strong' : t.avg >= 3 ? 'Moderate' : 'Needs Work';
              return (
                <div key={t.key} className="bg-white p-5 border border-gray-200 rounded-sm">
                  <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-3">{t.label}</div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-mono text-xl font-bold" style={{ color: t.color }}>{t.avg}</span>
                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full" style={{ width: `${pct}%`, backgroundColor: t.color }} />
                    </div>
                  </div>
                  <div className="text-[10px] font-bold" style={{ color: t.color }}>{label}</div>
                </div>
              );
            })}
          </div>

          <div className="flex gap-4 pt-8 border-t border-gray-200">
            <button onClick={() => window.print()} className="px-8 py-3 bg-[#C0392B] text-white font-bold rounded-sm flex items-center gap-2">
              <Printer size={16} /> Print Report
            </button>
            <button onClick={() => setScreen('setup')} className="px-8 py-3 border-2 border-gray-200 text-[#1C2833] font-bold rounded-sm flex items-center gap-2">
              <RotateCcw size={16} /> New Interview
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
