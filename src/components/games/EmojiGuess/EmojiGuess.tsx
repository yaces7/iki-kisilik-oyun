import React, { useState, useEffect } from 'react';
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

const rotate = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
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

const PlayerScore = styled.div<{ color: string, active: boolean }>`
  color: ${props => props.color};
  font-size: 1.2rem;
  font-weight: bold;
  padding: 8px 15px;
  border-radius: 8px;
  border: 2px solid ${props => props.color};
  background: ${props => props.active ? `${props.color}22` : 'transparent'};
  animation: ${props => props.active ? pulse : 'none'} 1s infinite;
`;

const EmojiCard = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 200px;
  height: 200px;
  background: rgba(255,255,255,0.1);
  border-radius: 20px;
  margin: 2rem auto;
  font-size: 8rem;
  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
`;

const OptionsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
  width: 100%;
  max-width: 600px;
  margin: 1rem auto;
`;

const OptionButton = styled.button<{ selected?: boolean, correct?: boolean, wrong?: boolean }>`
  padding: 15px 20px;
  background: rgba(255,255,255,0.1);
  border: 2px solid rgba(255,255,255,0.2);
  border-radius: 10px;
  font-size: 1.1rem;
  color: white;
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;
  
  ${props => props.selected && !props.wrong && !props.correct && css`
    background: rgba(52, 152, 219, 0.3);
    border-color: #3498db;
  `}
  
  ${props => props.correct && css`
    background: rgba(46, 204, 113, 0.3);
    border-color: #2ecc71;
  `}
  
  ${props => props.wrong && css`
    background: rgba(231, 76, 60, 0.3);
    border-color: #e74c3c;
  `}
  
  &:hover {
    transform: translateY(-3px);
    background: rgba(255,255,255,0.2);
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

const FeedbackText = styled.div<{ correct: boolean }>`
  font-size: 1.6rem;
  font-weight: bold;
  color: ${props => props.correct ? '#2ecc71' : '#e74c3c'};
  text-align: center;
  margin: 1rem 0;
  text-shadow: 0 2px 10px rgba(0,0,0,0.2);
`;

const Timer = styled.div<{ urgent: boolean }>`
  font-size: 1.5rem;
  font-weight: bold;
  color: ${props => props.urgent ? '#e74c3c' : 'white'};
  text-align: center;
  margin: 0.5rem 0;
  padding: 8px 15px;
  border-radius: 10px;
  background: rgba(0, 0, 0, 0.2);
  transition: color 0.3s ease;
`;

const DifficultySelector = styled.div`
  display: flex;
  gap: 10px;
  margin: 1rem 0;
`;

const DifficultyButton = styled.button<{ selected: boolean }>`
  padding: 8px 16px;
  background: ${props => props.selected ? 'rgba(46, 204, 113, 0.3)' : 'rgba(255, 255, 255, 0.1)'};
  border: 2px solid ${props => props.selected ? '#2ecc71' : 'rgba(255, 255, 255, 0.2)'};
  border-radius: 8px;
  color: white;
  font-weight: ${props => props.selected ? 'bold' : 'normal'};
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
`;

const StreakIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  margin: 0.5rem 0;
  padding: 5px 15px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 20px;
`;

const StreakIcon = styled.div<{ active: boolean }>`
  width: 15px;
  height: 15px;
  border-radius: 50%;
  background: ${props => props.active ? '#f39c12' : 'rgba(255, 255, 255, 0.2)'};
  transition: background 0.3s ease;
`;

const EmojiCombo = styled.div<{ size: number }>`
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${props => props.size > 1 ? '3rem' : '8rem'};
  margin: 1rem auto;
`;

const Spinner = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid rgba(255,255,255,0.2);
  border-top: 4px solid #fff;
  border-radius: 50%;
  animation: ${rotate} 1s linear infinite;
  margin: 2rem auto;
`;

// Emoji veritabanı
const EMOJI_DATA = [
  { emoji: '😀', meaning: 'Gülümseme', options: ['Gülümseme', 'Kahkaha', 'Sevinç', 'Mutluluk'] },
  { emoji: '😂', meaning: 'Kahkaha', options: ['Ağlama', 'Kahkaha', 'Gülme Krizi', 'Neşe'] },
  { emoji: '😍', meaning: 'Aşık Olmuş', options: ['Sevgi', 'Aşık Olmuş', 'Hayranlık', 'Beğenme'] },
  { emoji: '😎', meaning: 'Havalı', options: ['Güneşli', 'Serin', 'Havalı', 'Rahat'] },
  { emoji: '🤔', meaning: 'Düşünceli', options: ['Şüpheli', 'Meraklı', 'Düşünceli', 'Endişeli'] },
  { emoji: '😭', meaning: 'Hüngür Hüngür Ağlama', options: ['Üzgün', 'Keder', 'Hüngür Hüngür Ağlama', 'Acı'] },
  { emoji: '😡', meaning: 'Kızgın', options: ['Öfkeli', 'Kızgın', 'Sinirli', 'Rahatsız'] },
  { emoji: '🥰', meaning: 'Sevgi Dolu', options: ['Tutkulu', 'Sevgi Dolu', 'Aşık', 'Sarılma İsteği'] },
  { emoji: '🤡', meaning: 'Palyaço', options: ['Palyaço', 'Komik', 'Sirk', 'Eğlence'] },
  { emoji: '🥳', meaning: 'Kutlama', options: ['Parti', 'Kutlama', 'Eğlence', 'Doğum Günü'] },
  { emoji: '🤑', meaning: 'Para Sever', options: ['Zengin', 'Para Sever', 'Kumar', 'Hırslı'] },
  { emoji: '😴', meaning: 'Uykulu', options: ['Yorgun', 'Uykulu', 'Uyuyan', 'Dinlenme'] },
  { emoji: '🤯', meaning: 'Beyin Patlaması', options: ['Şok', 'Beyin Patlaması', 'Şaşkınlık', 'Tepki'] },
  { emoji: '👻', meaning: 'Hayalet', options: ['Korku', 'Hayalet', 'Ruh', 'Ürkütücü'] },
  { emoji: '👽', meaning: 'Uzaylı', options: ['Uzay', 'Uzaylı', 'Yabancı', 'UFO'] },
  { emoji: '🤖', meaning: 'Robot', options: ['Makine', 'Robot', 'Teknoloji', 'Yapay Zeka'] },
  { emoji: '👨‍💻', meaning: 'Yazılımcı', options: ['Bilgisayar', 'Yazılımcı', 'Kod Yazarı', 'Teknoloji Uzmanı'] },
  { emoji: '🦸‍♂️', meaning: 'Süper Kahraman', options: ['Kahraman', 'Süper Kahraman', 'Güçlü', 'Kurtarıcı'] },
  { emoji: '🧠', meaning: 'Beyin', options: ['Akıl', 'Beyin', 'Zeka', 'Düşünce'] },
  { emoji: '❤️', meaning: 'Aşk', options: ['Sevgi', 'Aşk', 'Tutku', 'Romantizm'] },
  { emoji: '🔥', meaning: 'Ateş', options: ['Sıcak', 'Ateş', 'Yanma', 'Popüler'] },
  { emoji: '🎮', meaning: 'Video Oyunu', options: ['Oyun', 'Video Oyunu', 'Eğlence', 'Konsol'] },
  { emoji: '🍕', meaning: 'Pizza', options: ['İtalyan Yemeği', 'Pizza', 'Fast Food', 'Atıştırmalık'] },
  { emoji: '🏆', meaning: 'Kupa', options: ['Zafer', 'Kupa', 'Başarı', 'Ödül'] },
  { emoji: '🎯', meaning: 'Hedef', options: ['Nişan', 'Hedef', 'Doğruluk', 'Amaç'] },
  { emoji: '🎁', meaning: 'Hediye', options: ['Paket', 'Hediye', 'Sürpriz', 'Kutlama'] },
  { emoji: '🧩', meaning: 'Yapboz Parçası', options: ['Bulmaca', 'Yapboz Parçası', 'Oyun', 'Zorluk'] },
  { emoji: '⏰', meaning: 'Çalar Saat', options: ['Zaman', 'Çalar Saat', 'Alarm', 'Kronometraj'] },
  { emoji: '🌈', meaning: 'Gökkuşağı', options: ['Renkler', 'Gökkuşağı', 'Hava Durumu', 'Güzellik'] },
  { emoji: '🚀', meaning: 'Roket', options: ['Fırlatma', 'Roket', 'Uzay', 'Hız'] },
];

// Oyuncu renkleri
const PLAYER_COLORS = ['#e74c3c', '#3498db', '#2ecc71', '#f1c40f'];

// Zorluk seviyeleri
const DIFFICULTY_LEVELS = {
  EASY: 'Kolay',
  MEDIUM: 'Orta',
  HARD: 'Zor'
};

interface Player {
  id: number;
  score: number;
  correctAnswers: number;
  totalAnswers: number;
  streak: number; // Arka arkaya doğru cevap
  maxStreak: number; // En yüksek streak
}

interface Question {
  emoji: string;
  correctAnswer: string;
  options: string[];
  difficulty?: string;
  emojis?: string[]; // Birden fazla emoji gösterme
  timeLimit?: number; // Saniye cinsinden zaman sınırı
}

const EmojiGuess: React.FC<{ playerCount: number }> = ({ playerCount }) => {
  // Oyuncu durumları
  const [players, setPlayers] = useState<Player[]>(
    Array.from({ length: playerCount }, (_, i) => ({
      id: i,
      score: 0,
      correctAnswers: 0,
      totalAnswers: 0,
      streak: 0,
      maxStreak: 0
    }))
  );
  const [activePlayer, setActivePlayer] = useState(0);
  
  // Oyun durumları
  const [phase, setPhase] = useState<'ready' | 'question' | 'result' | 'end'>('ready');
  const [round, setRound] = useState(1);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [usedEmojis, setUsedEmojis] = useState<string[]>([]);
  const [difficulty, setDifficulty] = useState(DIFFICULTY_LEVELS.MEDIUM);
  const [timeLeft, setTimeLeft] = useState<number>(15);
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);
  
  const totalRounds = playerCount * 5; // Her oyuncu 5 soru cevaplasın
  
  // Zaman sınırını ayarla
  const getTimeLimit = (difficulty: string): number => {
    switch(difficulty) {
      case DIFFICULTY_LEVELS.EASY: return 20;
      case DIFFICULTY_LEVELS.MEDIUM: return 15;
      case DIFFICULTY_LEVELS.HARD: return 10;
      default: return 15;
    }
  };
  
  // Zorluk seviyesine göre puan
  const getPointValue = (difficulty: string): number => {
    switch(difficulty) {
      case DIFFICULTY_LEVELS.EASY: return 5;
      case DIFFICULTY_LEVELS.MEDIUM: return 10;
      case DIFFICULTY_LEVELS.HARD: return 15;
      default: return 10;
    }
  };
  
  // Yeni bir soru oluştur
  const generateQuestion = (): void => {
    // Kullanılmamış bir emoji seç
    const availableEmojis = EMOJI_DATA.filter(item => !usedEmojis.includes(item.emoji));
    
    // Tüm emojiler kullanıldıysa, listeyi sıfırla
    if (availableEmojis.length === 0) {
      setUsedEmojis([]);
      return generateQuestion();
    }
    
    // Rastgele emoji seç
    const randomIndex = Math.floor(Math.random() * availableEmojis.length);
    const emojiData = availableEmojis[randomIndex];
    
    // Seçilen emojiyi kullanılmış olarak işaretle
    setUsedEmojis(prev => [...prev, emojiData.emoji]);
    
    // Zorluk seviyesine göre oyun mekanikleri değişsin
    let options = [...emojiData.options];
    let emojis: string[] = [emojiData.emoji];
    
    if (difficulty === DIFFICULTY_LEVELS.HARD) {
      // Zor modda diğer emojilerden de ekle
      const otherEmojis = EMOJI_DATA.filter(e => e.emoji !== emojiData.emoji)
                          .sort(() => Math.random() - 0.5)
                          .slice(0, 2)
                          .map(e => e.emoji);
      
      emojis = [emojiData.emoji, ...otherEmojis].sort(() => Math.random() - 0.5);
      
      // Daha fazla yanıltıcı şık ekleyelim
      const additionalOptions = EMOJI_DATA.filter(e => 
        e.emoji !== emojiData.emoji && 
        !options.includes(e.meaning)
      )
      .map(e => e.meaning)
      .sort(() => Math.random() - 0.5)
      .slice(0, 2);
      
      options = [...options, ...additionalOptions].sort(() => Math.random() - 0.5).slice(0, 4);
    } else {
      // Seçenekleri karıştır
      options = options.sort(() => Math.random() - 0.5);
    }
    
    // Zaman sınırını ayarla
    const timeLimit = getTimeLimit(difficulty);
    setTimeLeft(timeLimit);
    
    setCurrentQuestion({
      emoji: emojiData.emoji,
      correctAnswer: emojiData.meaning,
      options,
      difficulty,
      emojis,
      timeLimit
    });
    
    setSelectedOption(null);
    setIsCorrect(null);
  };
  
  // Soru başlat
  const startQuestion = () => {
    generateQuestion();
    setPhase('question');
    
    // Zaman sayacını başlat
    if (timer) clearInterval(timer);
    const newTimer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          // Süre bitti, yanlış cevap olarak işaretle
          if (!selectedOption) handleOptionSelect('', true);
          clearInterval(newTimer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    setTimer(newTimer);
  };
  
  // Zorluk seviyesini değiştir
  const changeDifficulty = (newDifficulty: string) => {
    setDifficulty(newDifficulty);
  };
  
  // Seçenek seçildiğinde
  const handleOptionSelect = (option: string, timeout: boolean = false) => {
    if (selectedOption || !currentQuestion) return;
    
    // Zamanlayıcıyı durdur
    if (timer) clearInterval(timer);
    
    setSelectedOption(option);
    const correct = option === currentQuestion.correctAnswer && !timeout;
    setIsCorrect(correct);
    
    // Oyuncu puanını güncelle
    setPlayers(prev => prev.map((p, i) => {
      if (i === activePlayer) {
        // Streak sistemini uygula
        const newStreak = correct ? p.streak + 1 : 0;
        const streakBonus = newStreak >= 3 ? Math.min(newStreak - 2, 5) : 0;
        
        // Zorluk seviyesine göre puan
        const basePoints = getPointValue(difficulty);
        const totalPoints = correct ? basePoints + streakBonus : 0;
        
        return { 
          ...p, 
          score: p.score + totalPoints,
          correctAnswers: p.correctAnswers + (correct ? 1 : 0),
          totalAnswers: p.totalAnswers + 1,
          streak: newStreak,
          maxStreak: Math.max(p.maxStreak, newStreak)
        };
      }
      return p;
    }));
    
    // Sonuç aşamasına geç
    setTimeout(() => {
      setPhase('result');
    }, 1500);
  };
  
  // Sonraki aşamaya geç
  const nextStep = () => {
    const newRound = round + 1;
    setRound(newRound);
    
    if (newRound > totalRounds) {
      // Oyun bitti
      setPhase('end');
    } else {
      // Sıradaki oyuncuya geç
      setActivePlayer((activePlayer + 1) % playerCount);
      setPhase('ready');
    }
  };
  
  // Temizlik işlemleri
  useEffect(() => {
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [timer]);
  
  // Kazananı bul
  const getWinner = () => {
    return players.reduce((highest, player) => 
      player.score > highest.score ? player : highest, players[0]);
  };
  
  // Beraberlik kontrolü
  const isTie = () => {
    const winner = getWinner();
    return players.filter(p => p.score === winner.score).length > 1;
  };
  
  // Doğruluk oranı hesapla
  const getAccuracy = (player: Player) => {
    if (player.totalAnswers === 0) return 0;
    return Math.round((player.correctAnswers / player.totalAnswers) * 100);
  };
  
  // En iyi streak sahbini bul
  const getBestStreakPlayer = () => {
    return players.reduce((highest, player) => 
      player.maxStreak > highest.maxStreak ? player : highest, players[0]);
  };
  
  return (
    <GameContainer>
      <Header>Emoji Tahmini</Header>
      
      <ScoreBoard>
        {players.map((player, index) => (
          <PlayerScore 
            key={player.id} 
            color={PLAYER_COLORS[index]} 
            active={activePlayer === index && phase !== 'end'}
          >
            Oyuncu {index + 1}: {player.score}
          </PlayerScore>
        ))}
      </ScoreBoard>
      
      {phase === 'ready' && (
        <>
          <InfoText>Sıra: Oyuncu {activePlayer + 1}</InfoText>
          <p style={{ color: 'white', textAlign: 'center' }}>
            Emoji gösterilecek, doğru anlamı seçmen gerekiyor.
            Zorluk seviyesi arttıkça puan da artar!
          </p>
          
          <DifficultySelector>
            <DifficultyButton 
              selected={difficulty === DIFFICULTY_LEVELS.EASY}
              onClick={() => changeDifficulty(DIFFICULTY_LEVELS.EASY)}
            >
              Kolay (5 puan)
            </DifficultyButton>
            <DifficultyButton 
              selected={difficulty === DIFFICULTY_LEVELS.MEDIUM}
              onClick={() => changeDifficulty(DIFFICULTY_LEVELS.MEDIUM)}
            >
              Orta (10 puan)
            </DifficultyButton>
            <DifficultyButton 
              selected={difficulty === DIFFICULTY_LEVELS.HARD}
              onClick={() => changeDifficulty(DIFFICULTY_LEVELS.HARD)}
            >
              Zor (15 puan)
            </DifficultyButton>
          </DifficultySelector>
          
          <NextButton onClick={startQuestion}>Hazırım</NextButton>
        </>
      )}
      
      {phase === 'question' && currentQuestion && (
        <>
          <InfoText>{difficulty} Seviye</InfoText>
          
          <Timer urgent={timeLeft <= 5}>
            Süre: {timeLeft} saniye
          </Timer>
          
          {players[activePlayer].streak >= 2 && (
            <StreakIndicator>
              Seri: {players[activePlayer].streak}x
              {Array.from({ length: Math.min(players[activePlayer].streak, 5) }).map((_, i) => (
                <StreakIcon key={i} active={i < players[activePlayer].streak} />
              ))}
            </StreakIndicator>
          )}
          
          {difficulty === DIFFICULTY_LEVELS.HARD ? (
            <EmojiCombo size={currentQuestion.emojis?.length || 1}>
              {currentQuestion.emojis?.map((emoji, i) => (
                <span key={i} style={{ margin: '0 5px' }}>{emoji}</span>
              ))}
            </EmojiCombo>
          ) : (
            <EmojiCard>
              {currentQuestion.emoji}
            </EmojiCard>
          )}
          
          <OptionsContainer>
            {currentQuestion.options.map((option, index) => (
              <OptionButton 
                key={index}
                onClick={() => handleOptionSelect(option)}
                selected={selectedOption === option}
                correct={selectedOption === option && isCorrect === true}
                wrong={selectedOption === option && isCorrect === false}
                disabled={selectedOption !== null}
              >
                {option}
              </OptionButton>
            ))}
          </OptionsContainer>
          
          {selectedOption && (
            <FeedbackText correct={isCorrect || false}>
              {isCorrect ? '✓ Doğru!' : '✗ Yanlış!'}
              {isCorrect && players[activePlayer].streak >= 3 ? ` (+${Math.min(players[activePlayer].streak - 2, 5)} seri bonusu)` : ''}
            </FeedbackText>
          )}
        </>
      )}
      
      {phase === 'result' && (
        <>
          <InfoText>
            {isCorrect 
              ? `Tebrikler! Doğru cevap: ${currentQuestion?.correctAnswer}`
              : `Yanlış! Doğru cevap: ${currentQuestion?.correctAnswer}`
            }
          </InfoText>
          
          <p style={{ color: 'white', textAlign: 'center' }}>
            {isCorrect 
              ? `${getPointValue(difficulty || DIFFICULTY_LEVELS.MEDIUM)} puan kazandın!`
              : 'Maalesef puan kazanamadın.'
            }
            {isCorrect && players[activePlayer].streak >= 3 
              ? ` +${Math.min(players[activePlayer].streak - 2, 5)} bonus (${players[activePlayer].streak}x seri)` 
              : ''
            }
          </p>
          
          <NextButton onClick={nextStep}>
            {round < totalRounds ? 'Sonraki Soru' : 'Sonuçları Gör'}
          </NextButton>
        </>
      )}
      
      {phase === 'end' && (
        <>
          <InfoText>
            {isTie() 
              ? 'Oyun Bitti! Beraberlik!' 
              : `Oyun Bitti! Kazanan: Oyuncu ${getWinner().id + 1}`
            }
          </InfoText>
          
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1rem',
            margin: '1rem 0'
          }}>
            {players.map((player, index) => (
              <div key={player.id} style={{
                display: 'flex',
                flexDirection: 'column',
                width: '100%',
                maxWidth: '500px',
                background: player.id === getWinner().id && !isTie() 
                  ? 'rgba(255,255,255,0.15)' 
                  : 'rgba(255,255,255,0.05)',
                padding: '15px',
                borderRadius: '10px'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  borderBottom: '1px solid rgba(255,255,255,0.1)',
                  paddingBottom: '10px',
                  marginBottom: '10px'
                }}>
                  <span style={{ color: PLAYER_COLORS[index], fontWeight: 'bold' }}>
                    Oyuncu {player.id + 1}
                  </span>
                  <span style={{ color: 'white', fontWeight: 'bold' }}>
                    {player.score} puan
                  </span>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'rgba(255,255,255,0.7)' }}>Doğru Cevaplar</span>
                  <span style={{ color: 'white' }}>
                    {player.correctAnswers}/{player.totalAnswers}
                  </span>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'rgba(255,255,255,0.7)' }}>Doğruluk Oranı</span>
                  <span style={{ color: 'white' }}>
                    {getAccuracy(player)}%
                  </span>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'rgba(255,255,255,0.7)' }}>En Uzun Seri</span>
                  <span style={{ 
                    color: player.maxStreak === getBestStreakPlayer().maxStreak && getBestStreakPlayer().maxStreak > 1
                      ? '#f1c40f' 
                      : 'white'
                  }}>
                    {player.maxStreak}x
                  </span>
                </div>
              </div>
            ))}
          </div>
          
          <NextButton onClick={() => window.location.reload()}>
            Ana Menüye Dön
          </NextButton>
        </>
      )}
    </GameContainer>
  );
};

export default EmojiGuess; 