import React, { useState, useEffect, useRef } from 'react';
import styled, { keyframes, css } from 'styled-components';

// Animasyonlar
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const blink = keyframes`
  0% { opacity: 1; }
  50% { opacity: 0.5; }
  100% { opacity: 1; }
`;

// Stil bileşenleri
const GameContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  max-width: 800px;
  width: 100%;
  margin: 0 auto;
  padding: 20px;
`;

const Header = styled.h2`
  color: #fff;
  font-size: 2.2rem;
  text-align: center;
  margin-top: 0;
  margin-bottom: 1rem;
  text-shadow: 0 2px 10px rgba(0,0,0,0.2);
`;

const ScoreBoard = styled.div`
  display: flex;
  justify-content: center;
  gap: 24px;
  margin: 1rem 0;
  padding: 12px 20px;
  border-radius: 12px;
  background: rgba(255,255,255,0.1);
  animation: ${fadeIn} 0.5s ease-out;
`;

const PlayerScore = styled.div<{ color: string, active: boolean, eliminated?: boolean }>`
  color: ${props => props.color};
  font-size: 1.2rem;
  font-weight: bold;
  padding: 8px 15px;
  border-radius: 8px;
  border: 2px solid ${props => props.color};
  background: ${props => props.active ? `${props.color}22` : 'transparent'};
  animation: ${props => props.active ? pulse : 'none'} 1s infinite;
  position: relative;
  
  ${props => props.eliminated && css`
    opacity: 0.5;
    text-decoration: line-through;
  `}
`;

const ChainContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  margin: 2rem 0;
  background: rgba(255,255,255,0.05);
  border-radius: 10px;
  padding: 15px;
  max-height: 300px;
  overflow-y: auto;
`;

const ChainItem = styled.div<{ color: string }>`
  display: flex;
  justify-content: space-between;
  padding: 10px;
  border-bottom: 1px solid rgba(255,255,255,0.1);
  
  & > span:first-child {
    color: ${props => props.color};
    font-weight: bold;
  }
  
  & > span:last-child {
    color: white;
    font-size: 1.1rem;
  }
`;

const InputContainer = styled.div`
  display: flex;
  width: 100%;
  max-width: 500px;
  margin: 1rem 0;
  position: relative;
`;

const WordInput = styled.input`
  width: 100%;
  padding: 15px 20px;
  border-radius: 10px;
  border: 2px solid rgba(255,255,255,0.2);
  background: rgba(255,255,255,0.1);
  color: white;
  font-size: 1.2rem;
  outline: none;
  
  &:focus {
    border-color: #3498db;
  }
  
  &::placeholder {
    color: rgba(255,255,255,0.5);
  }
`;

const SubmitButton = styled.button`
  position: absolute;
  right: 5px;
  top: 5px;
  bottom: 5px;
  padding: 0 20px;
  border: none;
  border-radius: 8px;
  background: linear-gradient(45deg, #3498db, #2980b9);
  color: white;
  font-weight: bold;
  cursor: pointer;
  
  &:hover {
    background: linear-gradient(45deg, #2980b9, #3498db);
  }
  
  &:disabled {
    background: rgba(255,255,255,0.2);
    cursor: not-allowed;
  }
`;

const InfoText = styled.div`
  font-size: 1.4rem;
  font-weight: bold;
  text-align: center;
  margin: 1rem 0;
  color: white;
  background: linear-gradient(45deg, #3498db, #1abc9c);
  padding: 10px 25px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
`;

const NextButton = styled.button`
  background: linear-gradient(45deg, #2ecc71, #27ae60);
  color: white;
  font-size: 1.3rem;
  font-weight: bold;
  padding: 12px 40px;
  border: none;
  border-radius: 8px;
  margin-top: 1rem;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 15px rgba(0,0,0,0.2);
  }
`;

const Timer = styled.div<{ warning: boolean }>`
  font-size: 2rem;
  font-weight: bold;
  color: ${props => props.warning ? '#e74c3c' : 'white'};
  margin: 1rem 0;
  text-align: center;
  
  ${props => props.warning && css`
    animation: ${blink} 0.5s infinite;
  `}
`;

const HighlightedLetter = styled.span`
  display: inline-block;
  padding: 5px 10px;
  margin: 0 5px;
  background: rgba(255,255,255,0.1);
  border-radius: 5px;
  font-weight: bold;
  color: #3498db;
`;

const HintList = styled.div`
  margin-top: 1rem;
  padding: 10px;
  background: rgba(255,255,255,0.05);
  border-radius: 8px;
  max-width: 500px;
  text-align: center;
`;

const HintItem = styled.span`
  display: inline-block;
  margin: 5px;
  padding: 5px 10px;
  background: rgba(255,255,255,0.1);
  border-radius: 5px;
  color: white;
  font-size: 0.9rem;
`;

// Örnek Türkçe kelime listesi (kısa liste)
const SAMPLE_WORDS = [
  "anne", "baba", "araba", "elma", "armut", "kalem", "defter", "kitap", "okul", "sınıf",
  "masa", "sandalye", "kapı", "pencere", "duvar", "tavan", "zemin", "bulut", "yağmur", "güneş",
  "ay", "yıldız", "deniz", "nehir", "göl", "dağ", "tepe", "vadi", "orman", "ağaç",
  "çiçek", "böcek", "kuş", "balık", "kedi", "köpek", "fare", "aslan", "kaplan", "fil",
  "zürafa", "maymun", "tavşan", "kaplumbağa", "yılan", "kertenkele", "timsah", "penguen", "ayı", "kurt",
  "insan", "çocuk", "bebek", "genç", "yaşlı", "kadın", "erkek", "öğrenci", "öğretmen", "doktor",
  "hemşire", "mühendis", "avukat", "pilot", "şoför", "aşçı", "garson", "temizlikçi", "bekçi", "polis",
  "asker", "itfaiyeci", "çiftçi", "balıkçı", "terzi", "ressam", "müzisyen", "oyuncu", "yazar", "şair"
];

// Harflere göre örnek kelimeler
const SAMPLE_WORDS_BY_LETTER: {[key: string]: string[]} = {
  'a': ["anne", "araba", "armut", "aslan", "ateş", "at", "abla", "ayna", "altın", "av"],
  'b': ["baba", "balık", "bebek", "biber", "bal", "buz", "bilgi", "bayrak", "bulut", "beyin"],
  'c': ["cam", "ceviz", "cadde", "ceket", "cüzdan", "cennet", "cuma", "ceylan", "canlı", "cilt"],
  'ç': ["çiçek", "çocuk", "çorap", "çanta", "çatal", "çay", "çadır", "çelik", "çınar", "çimen"],
  'd': ["defter", "deniz", "doktor", "duvar", "dil", "diş", "damla", "dost", "dağ", "dünya"],
  'e': ["elma", "erkek", "ev", "el", "ekmek", "etek", "eşya", "eşek", "erik", "enerji"],
  'f': ["fare", "fil", "fırın", "fındık", "fırtına", "fikir", "film", "fırça", "fidan", "fabrika"],
  'g': ["gül", "göl", "güneş", "gece", "gemi", "gök", "göz", "gelin", "geyik", "gurur"],
  'h': ["hava", "harita", "hasta", "halı", "hediye", "heykel", "hırsız", "horoz", "hücre", "hoca"],
  'ı': ["ışık", "ırmak", "ısı", "ıslak", "ıslık", "ısırgan", "ıspanak", "ıhlamur"],
  'i': ["ip", "inek", "ilaç", "inci", "ilgi", "isim", "iman", "ise", "iğne", "ikram"],
  'j': ["jaguar", "jet", "jelatin", "jeton", "jest", "jilet", "jüri", "judo", "jeoloji", "jöle"],
  'k': ["kalem", "kedi", "kitap", "kapı", "kuş", "kağıt", "kanat", "kalp", "kale", "kurt"],
  'l': ["limon", "lamba", "leylak", "leke", "liste", "lale", "leylek", "lokum", "lahana", "lif"],
  'm': ["masa", "mektup", "makas", "muz", "mavi", "mor", "masa", "mendil", "merak", "meyve"],
  'n': ["nehir", "nar", "ney", "nal", "nane", "nefes", "nişan", "nine", "nokta", "nimet"],
  'o': ["okul", "orman", "oyun", "otobüs", "odun", "okyanus", "oda", "ocak", "olmak", "ova"],
  'ö': ["öğrenci", "ödül", "öküz", "öfke", "örnek", "örgü", "ördek", "öpücük", "örtü", "özgür"],
  'p': ["perde", "pencere", "para", "portakal", "peynir", "pazar", "paket", "parfüm", "pas", "patates"],
  'r': ["resim", "roman", "renk", "rüzgar", "radyo", "ruh", "rakam", "resmi", "reçel", "rüya"],
  's': ["su", "saat", "sabah", "sınıf", "sevgi", "sağlık", "sabun", "salça", "sanat", "sayfa"],
  'ş': ["şeker", "şapka", "şehir", "şarkı", "şans", "şiir", "şişe", "şemsiye", "şoför", "şeftali"],
  't': ["tuz", "tavuk", "taş", "tren", "tarak", "tablo", "tahta", "tatil", "tiyatro", "top"],
  'u': ["uçak", "uyku", "uzay", "un", "usta", "ufuk", "umut", "uydu", "ütü", "uzun"],
  'ü': ["üzüm", "ülke", "ünlü", "üçgen", "ürün", "ütü", "üye", "ümit", "ünlem", "üstün"],
  'v': ["vazo", "vatan", "vali", "var", "veda", "veri", "vezir", "vida", "vergi", "vicdan"],
  'y': ["yol", "yıldız", "yemek", "yatak", "yağmur", "yüzük", "yüz", "yaprak", "yazı", "yastık"],
  'z': ["zaman", "zemin", "zeytin", "zil", "zengin", "zar", "zincir", "zurna", "zorluk", "zambak"]
};

// Kategorilere göre kelimeler
const CATEGORIES = {
  GENERAL: 'Genel',
  SCIENCE: 'Bilim',
  HISTORY: 'Tarih',
  GEOGRAPHY: 'Coğrafya',
  LITERATURE: 'Edebiyat'
};

// Kategorilere göre örnek kelimeler
const SAMPLE_WORDS_BY_CATEGORY: {[key: string]: string[]} = {
  [CATEGORIES.SCIENCE]: [
    "atom", "bakteri", "canlı", "devre", "element", "fizik", "gen", "hücre", "ışık", "kimya",
    "laboratuvar", "manyetik", "nöron", "organik", "periyodik", "radyasyon", "sıcaklık", "termodinamik", "uzay", "virüs"
  ],
  [CATEGORIES.HISTORY]: [
    "antlaşma", "belge", "cumhuriyet", "devlet", "egemenlik", "fetih", "göç", "hanedanlık", "imparatorluk", "kronoloji",
    "lider", "medeniyet", "neolitik", "osmanlı", "padişah", "reform", "savaş", "tarih", "uygarlık", "vatan"
  ],
  [CATEGORIES.GEOGRAPHY]: [
    "akarsu", "bozkır", "coğrafya", "delta", "enlem", "fay", "göl", "harita", "iklim", "jeoloji",
    "kıta", "liman", "meridyen", "nehir", "okyanus", "plato", "rüzgar", "sıradağ", "taşkın", "volkan"
  ],
  [CATEGORIES.LITERATURE]: [
    "anlatıcı", "beyit", "cümle", "deyim", "edebi", "fabl", "gazel", "hikaye", "imge", "kahraman",
    "lirik", "metafor", "nesir", "olay", "paragraf", "roman", "şiir", "tema", "üslup", "vezin"
  ]
};

// Zorluk seviyeleri
const DIFFICULTY_LEVELS = {
  EASY: {
    name: 'Kolay',
    timeLimit: 25,
    scoreMultiplier: 1
  },
  MEDIUM: {
    name: 'Orta',
    timeLimit: 20,
    scoreMultiplier: 1.5
  },
  HARD: {
    name: 'Zor',
    timeLimit: 15,
    scoreMultiplier: 2
  }
};

// Oyuncu renkleri
const PLAYER_COLORS = ['#e74c3c', '#3498db', '#2ecc71', '#f1c40f'];

interface Player {
  id: number;
  score: number;
  wordsUsed: string[];
  eliminated: boolean;
  streak: number; // Arka arkaya doğru kelime zinciri
  maxStreak: number; // En uzun kelime zinciri
  wordLengthTotal: number; // Toplam kelime uzunluğu
}

interface ChainWord {
  playerId: number;
  word: string;
}

const WordChain: React.FC<{ playerCount: number }> = ({ playerCount }) => {
  // Oyuncu durumları
  const [players, setPlayers] = useState<Player[]>(
    Array.from({ length: playerCount }, (_, i) => ({
      id: i,
      score: 0,
      wordsUsed: [],
      eliminated: false,
      streak: 0,
      maxStreak: 0,
      wordLengthTotal: 0
    }))
  );
  const [activePlayer, setActivePlayer] = useState(0);
  
  // Oyun durumları
  const [phase, setPhase] = useState<'initial' | 'playing' | 'end'>('initial');
  const [chain, setChain] = useState<ChainWord[]>([]);
  const [currentWord, setCurrentWord] = useState('');
  const [lastLetter, setLastLetter] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(20);
  const [usedWords, setUsedWords] = useState<string[]>([]);
  const [showHints, setShowHints] = useState(false);
  const [hints, setHints] = useState<string[]>([]);
  const [difficulty, setDifficulty] = useState(DIFFICULTY_LEVELS.MEDIUM);
  const [category, setCategory] = useState(CATEGORIES.GENERAL);
  const [round, setRound] = useState(1);
  const [totalRounds, setTotalRounds] = useState(playerCount * 3); // Her oyuncu için 3 tur varsayılan
  const [specialLetters, setSpecialLetters] = useState<string[]>([]); // Bonus veya zorluk veren harfler
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Zorluk seviyesini belirle
  const changeDifficulty = (newDifficulty: typeof DIFFICULTY_LEVELS.EASY | 
                                         typeof DIFFICULTY_LEVELS.MEDIUM | 
                                         typeof DIFFICULTY_LEVELS.HARD) => {
    setDifficulty(newDifficulty);
  };
  
  // Kategori belirle
  const changeCategory = (newCategory: string) => {
    setCategory(newCategory);
  };
  
  // Özel harfleri belirle (her 3 turda bir)
  const generateSpecialLetters = () => {
    const alphabet = 'abcçdefgğhıijklmnoöprsştuüvyz';
    
    // 3 bonus harf (daha yüksek puan)
    const bonusLetters = Array.from({length: 3}, () => {
      return alphabet[Math.floor(Math.random() * alphabet.length)];
    });
    
    // 3 zorlu harf (daha düşük süre)
    const challengeLetters = Array.from({length: 3}, () => {
      let letter;
      do {
        letter = alphabet[Math.floor(Math.random() * alphabet.length)];
      } while (bonusLetters.includes(letter));
      return letter;
    });
    
    setSpecialLetters([...bonusLetters, ...challengeLetters]);
  };

  // İlk turu başlat
  const startGame = () => {
    // Rastgele bir harf seç
    const alphabet = 'abcçdefgğhıijklmnoöprsştuüvyz';
    const randomLetter = alphabet[Math.floor(Math.random() * alphabet.length)];
    
    setLastLetter(randomLetter);
    generateHints(randomLetter);
    generateSpecialLetters();
    setTimeLeft(difficulty.timeLimit);
    setPhase('playing');
    startTimer();
  };
  
  // İpucu oluştur - hem normal kelimeler hem de kategori kelimelerinden
  const generateHints = (letter: string) => {
    if (!letter) return;
    
    let availableWords: string[] = [];
    
    // Genel kelimeler
    if (SAMPLE_WORDS_BY_LETTER[letter]) {
      availableWords = SAMPLE_WORDS_BY_LETTER[letter].filter(
        word => !usedWords.includes(word)
      );
    }
    
    // Kategori kelimeleri (Genel kategorisi değilse)
    if (category !== CATEGORIES.GENERAL) {
      const categoryWords = SAMPLE_WORDS_BY_CATEGORY[category].filter(
        word => word.charAt(0) === letter && !usedWords.includes(word)
      );
      availableWords = [...availableWords, ...categoryWords];
    }
    
    // 5 rastgele kelime seç veya daha az varsa hepsini göster
    const randomHints = availableWords.length <= 5 
      ? availableWords 
      : availableWords
          .sort(() => Math.random() - 0.5)
          .slice(0, 5);
          
    setHints(randomHints);
  };
  
  // Zamanlayıcıyı başlat
  const startTimer = () => {
    const initialTime = difficulty.timeLimit;
    
    // Eğer özel harfse ve zorluk harflerinden biriyse, süreyi azalt
    if (lastLetter && specialLetters.slice(3).includes(lastLetter)) {
      setTimeLeft(initialTime - 5); // Zorluk harflerinde 5 saniye daha az
    } else {
      setTimeLeft(initialTime);
    }
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          // Süre doldu, oyuncuyu elenmiş olarak işaretle
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };
  
  // Temizlik işlemleri
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);
  
  // Kelime girişi kontrolü
  const handleWordSubmit = () => {
    const word = currentWord.trim().toLowerCase();
    
    // Boş kelime kontrolü
    if (!word) return;
    
    // Doğru harfle başlıyor mu?
    if (lastLetter && word.charAt(0) !== lastLetter) {
      // Hata: Kelime doğru harfle başlamıyor
      alert(`Kelime "${lastLetter}" harfi ile başlamalı!`);
      return;
    }
    
    // Daha önce kullanılmış mı?
    if (usedWords.includes(word)) {
      // Hata: Kelime zaten kullanılmış
      alert('Bu kelime zaten kullanılmış!');
      return;
    }
    
    // En az 3 harfli olmalı
    if (word.length < 3) {
      alert('Kelime en az 3 harfli olmalı!');
      return;
    }
    
    // Kelimeyi zincire ekle
    setChain(prev => [...prev, { playerId: activePlayer, word }]);
    
    // Kelimeyi kullanılmış olarak işaretle
    setUsedWords(prev => [...prev, word]);
    
    // Son harfi güncelle
    const newLastLetter = word.charAt(word.length - 1);
    setLastLetter(newLastLetter);
    
    // Puanlamayı hesapla
    const isSpecialBonusLetter = lastLetter && specialLetters.slice(0, 3).includes(lastLetter);
    const wordLengthScore = word.length;
    const timeBonusScore = Math.ceil(timeLeft / 5); // Kalan süreye göre bonus
    let totalScore = (wordLengthScore + timeBonusScore) * difficulty.scoreMultiplier;
    
    // Özel bonus harf kullanıldıysa ekstra puan
    if (isSpecialBonusLetter) {
      totalScore *= 1.5; // %50 bonus
    }
    
    // Oyuncunun streak'ini (kelime zincirini) kontrol et
    let newStreak = 0;
    
    // Oyuncunun kullandığı kelimeleri güncelle
    setPlayers(prev => prev.map((p, i) => {
      if (i === activePlayer) {
        newStreak = p.streak + 1;
        const streakBonus = p.streak >= 2 ? p.streak : 0; // 3 ve üzeri zincir için bonus
        
        return { 
          ...p, 
          wordsUsed: [...p.wordsUsed, word],
          score: p.score + Math.floor(totalScore + streakBonus),
          streak: newStreak,
          maxStreak: Math.max(p.maxStreak, newStreak),
          wordLengthTotal: p.wordLengthTotal + word.length
        };
      }
      return p;
    }));
    
    // Girişi temizle
    setCurrentWord('');
    
    // Sıradaki oyuncuya geç
    nextTurn();
  };
  
  // Zaman dolduğunda
  const handleTimeout = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    // Oyuncuyu elendi olarak işaretle
    setPlayers(prev => prev.map((p, i) => {
      if (i === activePlayer) {
        return { ...p, eliminated: true };
      }
      return p;
    }));
    
    // Bir sonraki turu başlat
    nextTurn();
  };
  
  // Sonraki tura geç
  const nextTurn = () => {
    // Turu artır
    setRound(prev => prev + 1);
    
    // Bir sonraki aktif (elenmemiş) oyuncuyu bul
    let nextPlayer = (activePlayer + 1) % playerCount;
    let loopCount = 0;
    
    while (loopCount < playerCount) {
      if (!players[nextPlayer].eliminated) {
        break;
      }
      nextPlayer = (nextPlayer + 1) % playerCount;
      loopCount++;
    }
    
    // Oyunda sadece bir kişi kaldıysa, oyunu bitir
    const activePlayers = players.filter(p => !p.eliminated);
    if (activePlayers.length <= 1) {
      setPhase('end');
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      return;
    }
    
    // Her 3 turda bir özel harfleri yenile
    if (round % 3 === 0) {
      generateSpecialLetters();
    }
    
    // Sıradaki oyuncuya geç
    setActivePlayer(nextPlayer);
    
    // İpuçlarını güncelle
    if (lastLetter) {
      generateHints(lastLetter);
    }
    
    // Zamanlayıcıyı yeniden başlat
    startTimer();
    
    // Input'a odaklan
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 100);
  };
  
  // Kazananı bul
  const getWinner = () => {
    const activePlayers = players.filter(p => !p.eliminated);
    if (activePlayers.length === 1) {
      return activePlayers[0];
    }
    
    // Herkes elendiyse en çok puan alan kazanır
    return players.reduce((highest, player) => 
      player.score > highest.score ? player : highest, players[0]);
  };
  
  // Klavye girişi
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && phase === 'playing') {
        handleWordSubmit();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentWord, lastLetter, activePlayer, usedWords, phase]);
  
  return (
    <GameContainer>
      <Header>Kelime Zinciri</Header>
      
      <ScoreBoard>
        {players.map((player, index) => (
          <PlayerScore 
            key={player.id} 
            color={PLAYER_COLORS[index]} 
            active={activePlayer === index && phase === 'playing'}
            eliminated={player.eliminated}
          >
            Oyuncu {index + 1}: {player.score}
          </PlayerScore>
        ))}
      </ScoreBoard>
      
      {phase === 'initial' && (
        <>
          <InfoText>Kelime Zinciri Oyunu</InfoText>
          <p style={{ color: 'white', textAlign: 'center', maxWidth: 600 }}>
            Her oyuncu sırayla verilen harfle başlayan bir kelime söyler ve zincir oluşturur. 
            Bir sonraki oyuncu, önceki kelimenin son harfi ile başlayan yeni bir kelime söylemelidir.
            Süre dolduğunda ya da kurallara uygun kelime söyleyemediğinde elenirsiniz.
            En son kalan oyuncu kazanır!
          </p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 400, margin: '20px auto' }}>
            <div>
              <h3 style={{ color: 'white', marginBottom: 5 }}>Zorluk Seviyesi:</h3>
              <div style={{ display: 'flex', gap: 10 }}>
                {Object.values(DIFFICULTY_LEVELS).map(level => (
                  <button
                    key={level.name}
                    onClick={() => changeDifficulty(level)}
                    style={{
                      padding: '8px 16px',
                      background: difficulty.name === level.name ? 'rgba(52, 152, 219, 0.7)' : 'rgba(255, 255, 255, 0.1)',
                      border: 'none',
                      borderRadius: 8,
                      color: 'white',
                      fontWeight: difficulty.name === level.name ? 'bold' : 'normal',
                      cursor: 'pointer'
                    }}
                  >
                    {level.name}
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <h3 style={{ color: 'white', marginBottom: 5 }}>Kategori:</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                {Object.values(CATEGORIES).map(cat => (
                  <button
                    key={cat}
                    onClick={() => changeCategory(cat)}
                    style={{
                      padding: '8px 16px',
                      background: category === cat ? 'rgba(46, 204, 113, 0.7)' : 'rgba(255, 255, 255, 0.1)',
                      border: 'none',
                      borderRadius: 8,
                      color: 'white',
                      fontWeight: category === cat ? 'bold' : 'normal',
                      cursor: 'pointer'
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          <NextButton onClick={startGame}>Oyunu Başlat</NextButton>
        </>
      )}
      
      {phase === 'playing' && (
        <>
          <InfoText>
            <div>Sıra: Oyuncu {activePlayer + 1}</div>
            <div style={{ fontSize: '1rem', marginTop: '5px' }}>
              {lastLetter && (
                <>
                  <HighlightedLetter 
                    style={{ 
                      color: specialLetters.slice(0, 3).includes(lastLetter) ? '#f39c12' : 
                              specialLetters.slice(3).includes(lastLetter) ? '#e74c3c' : '#3498db',
                      fontWeight: 'bold',
                      borderColor: specialLetters.slice(0, 3).includes(lastLetter) ? '#f39c12' : 
                                  specialLetters.slice(3).includes(lastLetter) ? '#e74c3c' : 'transparent'
                    }}
                  >
                    {lastLetter.toUpperCase()}
                  </HighlightedLetter> 
                  harfi ile başlayan bir kelime söyleyin
                  {specialLetters.slice(0, 3).includes(lastLetter) ? ' (Bonus Harf!)' : 
                   specialLetters.slice(3).includes(lastLetter) ? ' (Zorlu Harf!)' : ''}
                </>
              )}
            </div>
            <div style={{ fontSize: '0.8rem', marginTop: '5px' }}>
              Kategori: {category} | Zorluk: {difficulty.name} | Tur: {round}/{totalRounds}
            </div>
          </InfoText>
          
          <Timer warning={timeLeft <= 5}>
            {timeLeft}
          </Timer>
          
          {players[activePlayer].streak >= 2 && (
            <div style={{ 
              color: 'white', 
              textAlign: 'center', 
              fontSize: '0.9rem',
              background: 'rgba(52, 152, 219, 0.2)',
              padding: '5px 10px',
              borderRadius: '5px',
              marginBottom: '10px'
            }}>
              🔥 Kelime Zinciri: {players[activePlayer].streak}
            </div>
          )}
          
          <InputContainer>
            <WordInput 
              ref={inputRef}
              type="text" 
              value={currentWord}
              onChange={(e) => setCurrentWord(e.target.value)}
              placeholder={`${lastLetter?.toUpperCase() || ''} ile başlayan bir kelime...`}
              autoFocus
            />
            <SubmitButton onClick={handleWordSubmit}>
              Gönder
            </SubmitButton>
          </InputContainer>
          
          <button 
            onClick={() => setShowHints(!showHints)}
            style={{
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              color: 'white',
              padding: '8px 15px',
              borderRadius: '5px',
              cursor: 'pointer',
              marginTop: '10px'
            }}
          >
            {showHints ? 'İpuçlarını Gizle' : 'İpuçlarını Göster'}
          </button>
          
          {showHints && hints.length > 0 && (
            <HintList>
              {hints.map((hint, index) => (
                <HintItem key={index}>{hint}</HintItem>
              ))}
            </HintList>
          )}
          
          <div style={{ 
            margin: '10px 0',
            padding: '8px',
            background: 'rgba(255,255,255,0.05)',
            borderRadius: '8px',
            fontSize: '0.8rem',
            color: 'white'
          }}>
            <div>🔶 Bonus Harfler: 
              <span style={{ color: '#f39c12', fontWeight: 'bold', marginLeft: '5px' }}>
                {specialLetters.slice(0, 3).map(l => l.toUpperCase()).join(', ')}
              </span>
            </div>
            <div>⚠️ Zorlu Harfler: 
              <span style={{ color: '#e74c3c', fontWeight: 'bold', marginLeft: '5px' }}>
                {specialLetters.slice(3).map(l => l.toUpperCase()).join(', ')}
              </span>
            </div>
          </div>
          
          {chain.length > 0 && (
            <ChainContainer>
              {chain.map((item, index) => (
                <ChainItem key={index} color={PLAYER_COLORS[item.playerId]}>
                  <span>Oyuncu {item.playerId + 1}:</span>
                  <span>{item.word}</span>
                </ChainItem>
              ))}
            </ChainContainer>
          )}
        </>
      )}
      
      {phase === 'end' && (
        <>
          <InfoText>
            Oyun Bitti! Kazanan: Oyuncu {getWinner().id + 1}
          </InfoText>
          
          <div style={{ maxWidth: '600px', margin: '2rem auto' }}>
            <h3 style={{ color: 'white', textAlign: 'center' }}>Puan Tablosu</h3>
            {players.map((player, index) => (
              <div key={player.id} 
                style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  margin: '1rem 0', 
                  padding: '10px',
                  background: player.id === getWinner().id 
                    ? 'rgba(255,255,255,0.1)' 
                    : 'transparent',
                  borderRadius: '8px',
                  color: player.eliminated ? 'rgba(255,255,255,0.5)' : 'white'
                }}>
                <div style={{ color: PLAYER_COLORS[index] }}>
                  Oyuncu {player.id + 1}
                  {player.eliminated && ' (Elendi)'}
                </div>
                <div style={{ display: 'flex', gap: '15px' }}>
                  <div>{player.score} puan</div>
                  <div>
                    <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>
                      {player.wordsUsed.length} kelime
                    </span>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>
                      En uzun zincir: {player.maxStreak}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div style={{ 
            maxWidth: '600px', 
            margin: '1rem auto',
            display: 'flex',
            justifyContent: 'space-around',
            gap: '10px'
          }}>
            {players.map((player, index) => (
              <div key={`stats-${player.id}`} style={{
                background: 'rgba(255,255,255,0.05)',
                borderRadius: '8px',
                padding: '10px',
                width: '100%',
                borderTop: `3px solid ${PLAYER_COLORS[index]}`
              }}>
                <div style={{ textAlign: 'center', color: PLAYER_COLORS[index], fontWeight: 'bold', marginBottom: '5px' }}>
                  Oyuncu {player.id + 1}
                </div>
                <div style={{ fontSize: '0.9rem', color: 'white', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Kelime sayısı:</span>
                    <span>{player.wordsUsed.length}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Ort. kelime uzunluğu:</span>
                    <span>{player.wordsUsed.length > 0 ? (player.wordLengthTotal / player.wordsUsed.length).toFixed(1) : '0'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>En uzun zincir:</span>
                    <span>{player.maxStreak}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {chain.length > 0 && (
            <>
              <h3 style={{ color: 'white', textAlign: 'center' }}>Oluşan Kelime Zinciri</h3>
              <ChainContainer>
                {chain.map((item, index) => (
                  <ChainItem key={index} color={PLAYER_COLORS[item.playerId]}>
                    <span>Oyuncu {item.playerId + 1}:</span>
                    <span>{item.word}</span>
                  </ChainItem>
                ))}
              </ChainContainer>
            </>
          )}
          
          <NextButton onClick={() => window.location.reload()}>
            Tekrar Oyna
          </NextButton>
        </>
      )}
    </GameContainer>
  );
};

export default WordChain; 