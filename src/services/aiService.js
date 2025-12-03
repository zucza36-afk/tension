const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions'

class AIService {
  constructor() {
    this.conversationHistory = []
    this.gameContext = null
    this.personality = 'funny' // funny, serious, flirty
    this.cardHistory = [] // History of played cards
    this.playerMoods = {} // { playerId: mood }
  }
  
  setPersonality(personality) {
    this.personality = personality
  }
  
  addCardToHistory(card) {
    this.cardHistory.push({
      cardId: card.id,
      cardTitle: card.title,
      intensity: card.intensity,
      type: card.type,
      timestamp: Date.now()
    })
    // Keep only last 20 cards
    if (this.cardHistory.length > 20) {
      this.cardHistory = this.cardHistory.slice(-20)
    }
  }
  
  updatePlayerMood(playerId, mood) {
    this.playerMoods[playerId] = {
      mood,
      timestamp: Date.now()
    }
  }
  
  analyzePlayerMood() {
    // Analyze recent game events to determine overall mood
    const recentCards = this.cardHistory.slice(-5)
    const avgIntensity = recentCards.reduce((sum, c) => sum + (c.intensity || 3), 0) / recentCards.length
    
    if (avgIntensity >= 4) return 'excited'
    if (avgIntensity <= 2) return 'relaxed'
    return 'engaged'
  }
  
  getPersonalityPrompt() {
    const personalities = {
      funny: 'Jesteś bardzo zabawnym i dowcipnym botem. Używaj humoru, żartów i lekkich komentarzy. Bądź wesoły i pozytywny.',
      serious: 'Jesteś poważnym i profesjonalnym botem. Komentuj w sposób zrównoważony i merytoryczny. Bądź pomocny i wspierający.',
      flirty: 'Jesteś flirciarskim i uwodzicielskim botem. Używaj subtelnych, ale zabawowych komentarzy. Bądź elegancki i pełen wdzięku.'
    }
    return personalities[this.personality] || personalities.funny
  }

  // Ustaw kontekst gry
  setGameContext(context) {
    this.gameContext = {
      players: context.players,
      currentCard: context.currentCard,
      currentRound: context.currentRound,
      gamePhase: context.gamePhase,
      playerScores: context.playerScores
    }
  }

  // Dodaj wiadomość do historii
  addToHistory(role, content) {
    this.conversationHistory.push({ role, content })
    // Ogranicz historię do ostatnich 20 wiadomości
    if (this.conversationHistory.length > 20) {
      this.conversationHistory = this.conversationHistory.slice(-20)
    }
  }

  // Generuj komentarz do gry
  async generateGameComment(event) {
    if (!OPENAI_API_KEY) {
      return 'Bot AI jest wyłączony. Dodaj VITE_OPENAI_API_KEY do zmiennych środowiskowych.'
    }

    const playersList = this.gameContext?.players?.map(p => p.nickname).join(', ') || 'Nieznani'
    const mood = this.analyzePlayerMood()
    const personalityPrompt = this.getPersonalityPrompt()
    
    const systemPrompt = `${personalityPrompt}
    Twoim zadaniem jest komentować wydarzenia w grze w sposób odpowiedni do twojego stylu.
    Bądź pozytywny i zachęcający. Komentarze powinny być krótkie (max 2 zdania).
    Odpowiadaj po polsku.
    
    Kontekst gry:
    - Gracze: ${playersList}
    - Runda: ${this.gameContext?.currentRound || 0}
    - Faza: ${this.gameContext?.gamePhase || 'draw'}
    - Aktualna karta: ${this.gameContext?.currentCard?.title || 'Brak'}
    - Nastrój gry: ${mood}
    - Ostatnie karty: ${this.cardHistory.slice(-3).map(c => c.cardTitle).join(', ') || 'Brak'}
    
    Wydarzenie: ${event}`

    return await this.callOpenAI(systemPrompt, 'user', `Skomentuj to wydarzenie w stylu ${this.personality}: ${event}`)
  }
  
  // Sugeruj kartę na podstawie historii
  async suggestCard() {
    if (!OPENAI_API_KEY) {
      return null
    }
    
    const recentCards = this.cardHistory.slice(-5)
    const avgIntensity = recentCards.reduce((sum, c) => sum + (c.intensity || 3), 0) / recentCards.length
    const mood = this.analyzePlayerMood()
    
    const systemPrompt = `Jesteś ekspertem w grach towarzyskich. Na podstawie historii rozgrywki, zasugeruj jaki typ karty byłby teraz odpowiedni.
    Odpowiedz tylko typem karty (Truth, Dare, Vote, Icebreaker) i intensywnością (1-5).
    Format: "typ:intensywność"
    
    Kontekst:
    - Średnia intensywność ostatnich kart: ${avgIntensity.toFixed(1)}
    - Nastrój gry: ${mood}
    - Ostatnie karty: ${recentCards.map(c => `${c.type}(${c.intensity})`).join(', ')}`
    
    return await this.callOpenAI(systemPrompt, 'user', 'Jaka karta byłaby teraz odpowiednia?')
  }
  
  // Generuj strategiczną podpowiedź
  async generateStrategicHint(card, playerScores) {
    if (!OPENAI_API_KEY) {
      return null
    }
    
    const topPlayer = Object.entries(playerScores || {})
      .sort(([,a], [,b]) => b - a)[0]
    const personalityPrompt = this.getPersonalityPrompt()
    
    const systemPrompt = `${personalityPrompt}
    Jesteś strategicznym doradcą w grze. Daj podpowiedź, która pomoże graczowi, ale nie zdradzi odpowiedzi.
    Podpowiedź powinna być delikatna i strategiczna (max 1 zdanie).
    Odpowiadaj po polsku.
    
    Kontekst:
    - Karta: ${card.title}
    - Typ: ${card.type}
    - Lider: ${topPlayer ? topPlayer[0] : 'Brak'}
    - Twoje punkty vs lider: ${playerScores ? 'Porównaj sytuację' : 'Nieznane'}`
    
    return await this.callOpenAI(systemPrompt, 'user', `Daj strategiczną podpowiedź do karty: ${card.title}`)
  }

  // Poproś o podpowiedź
  async requestHint(question, playerName) {
    if (!OPENAI_API_KEY) {
      return 'Bot AI jest wyłączony. Dodaj VITE_OPENAI_API_KEY do zmiennych środowiskowych.'
    }

    const systemPrompt = `Jesteś pomocnym botem w grze. Gracz ${playerName} prosi o podpowiedź do pytania.
    Pamiętaj: jeśli dasz podpowiedź, gracz straci 2 punkty, a przeciwnik zostanie powiadomiony.
    Daj delikatną, nieoczywistą podpowiedź (max 1 zdanie), która pomoże, ale nie zdradzi odpowiedzi.
    Odpowiadaj po polsku.`

    const hint = await this.callOpenAI(
      systemPrompt,
      'user',
      `Pytanie: "${question}". Daj delikatną podpowiedź.`
    )

    return hint
  }

  // Wywołanie API OpenAI
  async callOpenAI(systemPrompt, role, userMessage) {
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY nie jest ustawiony')
    }

    const messages = [
      { role: 'system', content: systemPrompt },
      ...this.conversationHistory,
      { role: role || 'user', content: userMessage }
    ]

    try {
      const response = await fetch(OPENAI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: messages,
          temperature: 0.7,
          max_tokens: 150
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(`OpenAI API error: ${response.statusText} - ${JSON.stringify(errorData)}`)
      }

      const data = await response.json()
      const aiMessage = data.choices[0].message.content

      // Zapisz w historii
      this.addToHistory('user', userMessage)
      this.addToHistory('assistant', aiMessage)

      return aiMessage
    } catch (error) {
      console.error('OpenAI API error:', error)
      throw error
    }
  }

  // Reset historii
  resetHistory() {
    this.conversationHistory = []
  }
}

export default new AIService()

