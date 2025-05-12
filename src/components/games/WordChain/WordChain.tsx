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

// Oyuncu renkleri
const PLAYER_COLORS = ['#e74c3c', '#3498db', '#2ecc71', '#f1c40f'];

interface Player {
  id: number;
  score: number;
  wordsUsed: string[];
  eliminated: boolean;
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
      eliminated: false
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
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // İlk turu başlat
  const startGame = () => {
    // Rastgele bir harf seç
    const alphabet = 'abcçdefgğhıijklmnoöprsştuüvyz';
    const randomLetter = alphabet[Math.floor(Math.random() * alphabet.length)];
    
    setLastLetter(randomLetter);
    generateHints(randomLetter);
    setPhase('playing');
    startTimer();
  };
  
  // İpucu oluştur
  const generateHints = (letter: string) => {
    if (letter && SAMPLE_WORDS_BY_LETTER[letter]) {
      // Henüz kullanılmamış kelimelerden seçim yap
      const availableWords = SAMPLE_WORDS_BY_LETTER[letter].filter(
        word => !usedWords.includes(word)
      );
      
      // 5 rastgele kelime seç veya daha az varsa hepsini göster
      const randomHints = availableWords.length <= 5 
        ? availableWords 
        : availableWords
            .sort(() => Math.random() - 0.5)
            .slice(0, 5);
            
      setHints(randomHints);
    } else {
      setHints([]);
    }
  };
  
  // Zamanlayıcıyı başlat
  const startTimer = () => {
    setTimeLeft(20);
    
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
    
    // Kelimeyi zincire ekle
    setChain(prev => [...prev, { playerId: activePlayer, word }]);
    
    // Kelimeyi kullanılmış olarak işaretle
    setUsedWords(prev => [...prev, word]);
    
    // Son harfi güncelle
    const newLastLetter = word.charAt(word.length - 1);
    setLastLetter(newLastLetter);
    
    // Oyuncunun kullandığı kelimeleri güncelle
    setPlayers(prev => prev.map((p, i) => {
      if (i === activePlayer) {
        return { 
          ...p, 
          wordsUsed: [...p.wordsUsed, word],
          score: p.score + word.length // Kelime uzunluğu kadar puan ver
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
          <NextButton onClick={startGame}>Oyunu Başlat</NextButton>
        </>
      )}
      
      {phase === 'playing' && (
        <>
          <InfoText>
            Sıra: Oyuncu {activePlayer + 1}
            <div style={{ fontSize: '1rem', marginTop: '5px' }}>
              {lastLetter && (
                <>
                  <HighlightedLetter>{lastLetter.toUpperCase()}</HighlightedLetter> 
                  harfi ile başlayan bir kelime söyleyin
                </>
              )}
            </div>
          </InfoText>
          
          <Timer warning={timeLeft <= 5}>
            {timeLeft}
          </Timer>
          
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
                <div>
                  {player.score} puan 
                  <span style={{ fontSize: '0.8rem', marginLeft: '8px', opacity: 0.8 }}>
                    ({player.wordsUsed.length} kelime)
                  </span>
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