import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';

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

const shake = keyframes`
  0% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  50% { transform: translateX(5px); }
  75% { transform: translateX(-5px); }
  100% { transform: translateX(0); }
`;

// Stil bileşenleri
const GameContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
`;

const Header = styled.h2`
  color: #fff;
  font-size: 2.2rem;
  text-align: center;
  margin-bottom: 1rem;
  text-shadow: 0 2px 10px rgba(0,0,0,0.2);
`;

const ScoreBoard = styled.div`
  display: flex;
  justify-content: center;
  gap: 24px;
  margin: 1rem 0 2rem;
  padding: 12px 20px;
  border-radius: 12px;
  background: rgba(255,255,255,0.1);
  animation: ${fadeIn} 0.5s ease-out;
`;

const PlayerScore = styled.div<{ color: string, active: boolean }>`
  color: ${props => props.color};
  font-size: 1.5rem;
  font-weight: bold;
  padding: 8px 15px;
  border-radius: 8px;
  border: 2px solid ${props => props.color};
  background: ${props => props.active ? `${props.color}22` : 'transparent'};
  animation: ${props => props.active ? pulse : 'none'} 1s infinite;
`;

const MathProblem = styled.div`
  font-size: 3.5rem;
  font-weight: bold;
  margin: 2rem 0;
  color: white;
  text-shadow: 0 2px 10px rgba(0,0,0,0.3);
  padding: 20px 40px;
  border-radius: 15px;
  background: linear-gradient(45deg, #3498db, #9b59b6);
  box-shadow: 0 5px 15px rgba(0,0,0,0.2);
  animation: ${pulse} 1.5s infinite;
`;

const AnswerGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  max-width: 500px;
  margin: 2rem auto;
`;

const AnswerButton = styled.button<{ wrong?: boolean }>`
  background: linear-gradient(45deg, #2ecc71, #1abc9c);
  color: white;
  font-size: 2rem;
  font-weight: bold;
  padding: 15px 30px;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
  animation: ${props => props.wrong ? shake : 'none'} 0.5s;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 20px rgba(0,0,0,0.15);
  }
`;

const InfoText = styled.div`
  font-size: 1.8rem;
  font-weight: bold;
  text-align: center;
  margin: 1.5rem 0;
  color: white;
  background: linear-gradient(45deg, #3498db, #1abc9c);
  padding: 15px 30px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
`;

const Timer = styled.div<{ urgent?: boolean }>`
  font-size: 1.5rem;
  font-weight: bold;
  color: white;
  margin: 1rem 0;
  padding: 10px 20px;
  border-radius: 10px;
  background: ${props => props.urgent ? '#e74c3c' : '#3498db'};
  animation: ${props => props.urgent ? pulse : 'none'} 0.5s infinite;
`;

const NextButton = styled.button`
  background: linear-gradient(45deg, #2ecc71, #27ae60);
  color: white;
  font-size: 1.3rem;
  font-weight: bold;
  padding: 12px 40px;
  border: none;
  border-radius: 8px;
  margin-top: 2rem;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 15px rgba(0,0,0,0.2);
  }
`;

// Sabitler
const PLAYER_COLORS = ['#e74c3c', '#3498db', '#2ecc71', '#f1c40f'];
const ROUNDS_PER_PLAYER = 3;
const TIME_LIMIT = 5; // Saniye cinsinden (10'dan 5'e düşürüldü)

interface Player {
  id: number;
  score: number;
}

interface MathQuestion {
  question: string;
  correctAnswer: number;
  options: number[];
}

const generateMathQuestion = (difficulty: number): MathQuestion => {
  // Zorluk seviyesine göre sayı aralığını belirle
  const max = difficulty === 1 ? 20 : (difficulty === 2 ? 50 : 100);
  
  // İşlem türünü belirle (0: toplama, 1: çıkarma, 2: çarpma, 3: özel zorlu)
  const operationType = Math.floor(Math.random() * (difficulty > 1 ? 4 : 3));
  
  let firstNumber: number, secondNumber: number, correctAnswer: number, question: string;
  
  switch (operationType) {
    case 0: // Toplama
      firstNumber = Math.floor(Math.random() * max) + 1;
      secondNumber = Math.floor(Math.random() * max) + 1;
      correctAnswer = firstNumber + secondNumber;
      question = `${firstNumber} + ${secondNumber} = ?`;
      break;
    case 1: // Çıkarma
      firstNumber = Math.floor(Math.random() * max) + 30;
      secondNumber = Math.floor(Math.random() * (firstNumber - 1)) + 1;
      correctAnswer = firstNumber - secondNumber;
      question = `${firstNumber} - ${secondNumber} = ?`;
      break;
    case 2: // Çarpma
      // Zorluğa göre çarpma zorluğunu ayarla
      if (difficulty === 1) {
        firstNumber = Math.floor(Math.random() * 10) + 1;
        secondNumber = Math.floor(Math.random() * 10) + 1;
      } else if (difficulty === 2) {
        firstNumber = Math.floor(Math.random() * 15) + 5;
        secondNumber = Math.floor(Math.random() * 10) + 1;
      } else {
        firstNumber = Math.floor(Math.random() * 20) + 10;
        secondNumber = Math.floor(Math.random() * 15) + 5;
      }
      correctAnswer = firstNumber * secondNumber;
      question = `${firstNumber} × ${secondNumber} = ?`;
      break;
    case 3: // Özel zorlu işlemler
      // Zorluğa göre özel işlemler ekle
      const specialType = Math.floor(Math.random() * 3);
      
      if (specialType === 0) {
        // İki basamaklı sayı çarpma
        firstNumber = Math.floor(Math.random() * 90) + 10;
        secondNumber = Math.floor(Math.random() * 90) + 10;
        correctAnswer = firstNumber * secondNumber;
        question = `${firstNumber} × ${secondNumber} = ?`;
      } else if (specialType === 1) {
        // Kare alma
        firstNumber = Math.floor(Math.random() * 20) + 5;
        correctAnswer = firstNumber * firstNumber;
        question = `${firstNumber}² = ?`;
      } else {
        // İki toplamın çarpımı
        firstNumber = Math.floor(Math.random() * 10) + 5;
        secondNumber = Math.floor(Math.random() * 10) + 5;
        const thirdNumber = Math.floor(Math.random() * 10) + 5;
        const fourthNumber = Math.floor(Math.random() * 10) + 5;
        correctAnswer = (firstNumber + secondNumber) * (thirdNumber + fourthNumber);
        question = `(${firstNumber} + ${secondNumber}) × (${thirdNumber} + ${fourthNumber}) = ?`;
      }
      break;
    default:
      firstNumber = Math.floor(Math.random() * max) + 1;
      secondNumber = Math.floor(Math.random() * max) + 1;
      correctAnswer = firstNumber + secondNumber;
      question = `${firstNumber} + ${secondNumber} = ?`;
  }
  
  // Cevap seçenekleri oluştur
  const options = [correctAnswer];
  
  // Yakın ama yanlış cevaplar ekle
  while (options.length < 4) {
    // Daha geniş bir hata aralığı belirle (zor sorularda yakın cevaplar olsun)
    const maxOffset = Math.max(5, Math.floor(correctAnswer * 0.2)); // Cevabın %20'si kadar sapma olabilir
    const offset = Math.floor(Math.random() * maxOffset) + 1;
    const sign = Math.random() > 0.5 ? 1 : -1;
    const wrongAnswer = correctAnswer + (offset * sign);
    
    // Negatif sayılar ve tekrarlar olmasın
    if (wrongAnswer > 0 && !options.includes(wrongAnswer)) {
      options.push(wrongAnswer);
    }
  }
  
  // Seçenekleri karıştır
  return {
    question,
    correctAnswer,
    options: options.sort(() => Math.random() - 0.5)
  };
};

const QuickMathDuel: React.FC<{ playerCount: number }> = ({ playerCount }) => {
  const [players, setPlayers] = useState<Player[]>(
    Array.from({ length: playerCount }, (_, i) => ({ id: i, score: 0 }))
  );
  const [activePlayer, setActivePlayer] = useState(0);
  const [phase, setPhase] = useState<'ready' | 'question' | 'result' | 'end'>('ready');
  const [currentQuestion, setCurrentQuestion] = useState<MathQuestion | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);
  const [round, setRound] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const [timerActive, setTimerActive] = useState(false);
  const [difficulty, setDifficulty] = useState(1);
  
  // Toplam tur sayısı
  const totalRounds = playerCount * ROUNDS_PER_PLAYER;
  
  // Zamanlayıcı
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (timerActive && timeLeft > 0) {
      timer = setTimeout(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timerActive && timeLeft === 0) {
      // Süre doldu
      handleAnswer(null);
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [timerActive, timeLeft]);
  
  // Yeni soru hazırla
  const prepareQuestion = () => {
    // Oyuncu ilerledikçe zorluğu artır
    let currentDifficulty = 1;
    if (round > totalRounds / 3) currentDifficulty = 2;
    if (round > (totalRounds * 2) / 3) currentDifficulty = 3;
    
    setDifficulty(currentDifficulty);
    const question = generateMathQuestion(currentDifficulty);
    setCurrentQuestion(question);
    setSelectedAnswer(null);
    setTimeLeft(TIME_LIMIT);
    setTimerActive(true);
    setPhase('question');
  };
  
  // Cevap kontrolü
  const handleAnswer = (answer: number | null) => {
    setTimerActive(false);
    
    if (answer === null) {
      // Süre doldu, cevap vermedi
      setIsCorrect(false);
      setPlayers(prev => prev.map((p, i) => {
        if (i === activePlayer) {
          return { ...p, score: Math.max(0, p.score - 5) }; // Minimum 0 puan
        }
        return p;
      }));
    } else {
      setSelectedAnswer(answer);
      const correct = answer === currentQuestion?.correctAnswer;
      setIsCorrect(correct);
      
      // Skoru güncelle
      setPlayers(prev => prev.map((p, i) => {
        if (i === activePlayer) {
          const scoreChange = correct ? 10 : -5;
          return { ...p, score: Math.max(0, p.score + scoreChange) }; // Minimum 0 puan
        }
        return p;
      }));
    }
    
    setPhase('result');
    
    // 2 saniye sonra sonucu göster ve sonraki tura geç
    setTimeout(() => {
      const newRound = round + 1;
      setRound(newRound);
      
      if (newRound >= totalRounds) {
        setPhase('end');
      } else {
        setActivePlayer((activePlayer + 1) % playerCount);
        setPhase('ready');
      }
    }, 2000);
  };
  
  // Kazananı bul
  const winner = players.reduce(
    (max, p) => p.score > max.score ? p : max, 
    players[0]
  );
  
  // Beraberlik durumu
  const isTie = players.filter(p => p.score === winner.score).length > 1;
  
  return (
    <GameContainer>
      <Header>Hızlı Matematik Düellosu</Header>
      
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
          <NextButton onClick={prepareQuestion}>Hazırım</NextButton>
        </>
      )}
      
      {phase === 'question' && currentQuestion && (
        <>
          <InfoText>Doğru cevabı seç!</InfoText>
          <Timer urgent={timeLeft <= 3}>Kalan Süre: {timeLeft} sn</Timer>
          <MathProblem>{currentQuestion.question}</MathProblem>
          
          <AnswerGrid>
            {currentQuestion.options.map((option, index) => (
              <AnswerButton 
                key={index} 
                onClick={() => handleAnswer(option)}
              >
                {option}
              </AnswerButton>
            ))}
          </AnswerGrid>
        </>
      )}
      
      {phase === 'result' && (
        <InfoText>
          {selectedAnswer === null 
            ? '⏱️ Süre Doldu!' 
            : isCorrect 
              ? '✅ Doğru Cevap!' 
              : '❌ Yanlış Cevap!'
          }
        </InfoText>
      )}
      
      {phase === 'end' && (
        <>
          <InfoText>
            {isTie 
              ? 'Oyun Bitti! Beraberlik!' 
              : `Oyun Bitti! Kazanan: Oyuncu ${winner.id + 1}`
            }
          </InfoText>
          <ScoreBoard>
            {players.map((player, index) => (
              <PlayerScore 
                key={player.id} 
                color={PLAYER_COLORS[index]}
                active={player.id === winner.id && !isTie}
              >
                Oyuncu {index + 1}: {player.score}
              </PlayerScore>
            ))}
          </ScoreBoard>
          <NextButton onClick={() => window.location.reload()}>
            Tekrar Oyna
          </NextButton>
        </>
      )}
    </GameContainer>
  );
};

export default QuickMathDuel; 