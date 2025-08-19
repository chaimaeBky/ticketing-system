import React, { useState, useRef, useEffect } from "react";
// Questions suggérées avec réponses directesimport React, { useState, useRef, useEffect } from "react";
import { ChevronDown, ChevronUp, MessageCircle, Send } from "lucide-react";

const ChatBot = () => {
  const [messages, setMessages] = useState([
    { from: "bot", text: "Bonjour ! Je suis votre assistant virtuel." }
  ]);
  const [input, setInput] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const scrollRef = useRef(null);

  // Base de connaissances locale (étendue)
  const localKnowledge = {
    "bonjour": "Bonjour ! Comment puis-je vous aider aujourd'hui ?",
    "salut": "Salut ! Que puis-je faire pour vous ?",
    "bonsoir": "Bonsoir ! Comment puis-je vous assister ce soir ?",
    "problème paiement": "Pour les questions de paiement ou facturation, créez un ticket de type 'Facturation' avec les détails de votre demande.",
    "paiement": "Pour les questions de paiement ou facturation, créez un ticket de type 'Facturation' avec les détails de votre demande.",
    "facturation": "Pour les questions de facturation ou abonnement, créez un ticket de type 'Facturation' avec les détails de votre demande.",
    "problème technique": "Je comprends que vous avez un problème technique. Pouvez-vous me donner plus de détails ? Par exemple, s'agit-il d'un problème de connexion, d'application, ou autre chose ?",
    "connexion": "Si vous avez des problèmes de connexion, vérifiez vos identifiants et votre connexion internet. Si le problème persiste, créez un ticket de support.",
    "mot de passe": "Pour réinitialiser votre mot de passe, utilisez l'option 'Mot de passe oublié' sur la page de connexion ou contactez notre support.",
    "ticket": "Pour gérer vos tickets, vous pouvez : créer un nouveau ticket depuis votre dashboard, consulter vos tickets existants, ou suivre le statut de vos demandes.",
    "urgence": "Pour les problèmes urgents, créez un ticket en précisant le niveau de priorité 'Urgent'. Notre équipe traitera votre demande en priorité.",
    "délai": "Nos délais de réponse varient selon la priorité : tickets urgents (2-4h), normaux (24-48h), faible priorité (72h).",
    "support": "Pour contacter le support, créez un ticket détaillé via votre dashboard. Notre équipe vous répondra selon les délais de priorité.",
    "bug": "Si vous avez trouvé un bug, merci de créer un ticket en décrivant : les étapes pour reproduire le problème, votre navigateur/système, et des captures d'écran si possible.",
    "lent": "Si le système est lent, essayez de vider votre cache navigateur, redémarrer votre connexion, ou créez un ticket si le problème persiste.",
    "merci": "Avec plaisir ! 😊 N'hésitez pas si vous avez d'autres questions.",
    "au revoir": "Au revoir ! Passez une bonne journée et n'hésitez pas à revenir si vous avez besoin d'aide."
  };

  // Fonction pour rechercher dans la base locale
  const findLocalAnswer = (message) => {
    const lowerMessage = message.toLowerCase().trim();
    
    // Recherche exacte
    if (localKnowledge[lowerMessage]) {
      return localKnowledge[lowerMessage];
    }
    
    // Recherche par mots-clés
    for (const [key, answer] of Object.entries(localKnowledge)) {
      if (lowerMessage.includes(key) || key.includes(lowerMessage)) {
        return answer;
      }
    }
    
    return null;
  };
  const suggestedQuestions = [
    {
      question: "Comment créer un nouveau ticket ?",
      answer: "Pour créer un nouveau ticket, cliquez sur le bouton 'Créer nouveau ticket' dans votre dashboard ou naviguez vers la section création de tickets."
    },
    {
      question: "Quel est le statut de mon ticket ?",
      answer: "Vous pouvez vérifier le statut de vos tickets directement depuis votre dashboard. Chaque ticket affiche son statut actuel : ouvert, en cours, ou résolu."
    },
    {
      question: "J'ai un problème technique",
      answer: "Pour un problème technique, veuillez préciser votre souci (connexion, application, bug, etc.) afin que notre équipe puisse vous assister efficacement."
    },
    {
      question: "Comment réinitialiser mon mot de passe ?",
      answer: "Pour réinitialiser votre mot de passe, utilisez l'option 'Mot de passe oublié' sur la page de connexion ou contactez notre support."
    },
    {
      question: "Quels sont vos délais de réponse ?",
      answer: "Nos délais de réponse varient selon la priorité : tickets urgents (2-4h), normaux (24-48h), faible priorité (72h)."
    },
    {
      question: "Comment contacter le support ?",
      answer: "Pour contacter le support, créez un ticket détaillé via votre dashboard. Notre équipe vous répondra selon les délais de priorité."
    }
  ];

  // Scroll automatique vers le bas
  useEffect(() => {
    if (isOpen) {
      scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const handleSend = async (messageText = null) => {
    const textToSend = messageText || input;
    if (!textToSend.trim()) return;

    const userMessage = { from: "user", text: textToSend };
    setMessages(prev => [...prev, userMessage]);
    setShowSuggestions(false);

    // D'abord, chercher dans la base locale
    const localAnswer = findLocalAnswer(textToSend);
    
    if (localAnswer) {
      // Réponse trouvée localement
      setMessages(prev => [...prev, { from: "bot", text: localAnswer }]);
      setInput("");
      return;
    }

    // Si pas de réponse locale, interroger le serveur
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const token = user.token || localStorage.getItem('token');

      const response = await fetch("http://localhost:5000/chatbot", {
        method: "POST",
        credentials: "include",
        headers: { 
          "Content-Type": "application/json",
          ...(token && { "Authorization": `Bearer ${token}` })
        },
        body: JSON.stringify({ message: textToSend })
      });

      if (response.status === 401) {
        setMessages(prev => [...prev, { from: "bot", text: "Session expirée. Veuillez vous reconnecter." }]);
        setInput("");
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setMessages(prev => [...prev, { from: "bot", text: data.reply }]);
    } catch (error) {
      console.error('Erreur chatbot:', error);
      setMessages(prev => [...prev, { 
        from: "bot", 
        text: "Désolé, je ne trouve pas de réponse à votre question. Pouvez-vous créer un ticket pour obtenir une aide personnalisée ?" 
      }]);
    }

    setInput("");
  };

  // Fonction pour cliquer sur une suggestion
  const handleSuggestionClick = (suggestionObj) => {
    const userMessage = { from: "user", text: suggestionObj.question };
    const botMessage = { from: "bot", text: suggestionObj.answer };
    
    setMessages(prev => [...prev, userMessage, botMessage]);
    setShowSuggestions(false);
    setInput("");
  };

  // Fonction pour basculer l'état ouvert/fermé
  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={`fixed bottom-4 right-4 z-50 flex flex-col border-0 border-red-800 rounded-xl bg-gray-50 shadow-xl transition-all duration-300 ${
      isOpen ? "w-80 h-[500px]" : "w-80 h-12"
    }`}>
      {/* Header avec bouton toggle */}
      <div 
        onClick={toggleChat}
        className="flex justify-between items-center p-3 border-b border-gray-300 bg-red-800 rounded-t-xl cursor-pointer hover:bg-red-700 transition-colors"
      >
        <div className="flex items-center space-x-2">
          <MessageCircle size={18} className="text-white" />
          <h3 className="text-white font-semibold text-sm">Assistant Chat</h3>
        </div>
        <div className="text-white">
          {isOpen ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
        </div>
      </div>

      {/* Contenu du chat (visible seulement si ouvert) */}
      {isOpen && (
        <>
          {/* Chat window */}
          <div className="flex-1 p-4 overflow-y-auto space-y-2">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`px-4 py-2 rounded-2xl max-w-[80%] break-words ${
                  msg.from === "user"
                    ? "bg-red-800 text-white self-end ml-auto"
                    : "bg-gray-200 text-gray-800 self-start"
                }`}
              >
                {msg.text}
              </div>
            ))}

            {/* Questions suggérées */}
            {showSuggestions && messages.length === 1 && (
              <div className="mt-4 space-y-2">
                <p className="text-sm text-gray-600 font-medium">Questions fréquentes :</p>
                <div className="grid gap-2">
                  {suggestedQuestions.map((suggestionObj, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSuggestionClick(suggestionObj)}
                      className="text-left px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-red-50 hover:border-red-300 transition-colors"
                    >
                      {suggestionObj.question}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div ref={scrollRef} />
          </div>

          {/* Input area */}
          <div className="flex border-t border-gray-300">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSend()}
              placeholder="Écrivez votre message..."
              className="flex-1 px-4 py-2 outline-none rounded-bl-xl"
            />
            <button
              onClick={() => handleSend()}
              className="px-4 py-2 bg-red-800 text-white rounded-br-xl hover:bg-red-900 transition-colors flex items-center gap-1"
            >
              <Send size={16} />
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ChatBot;