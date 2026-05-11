import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { userService } from "@zoplanner/api";
import "./index.css";
import { RecievedMessagesPage } from "@zoplanner/recieved-messages";
import { SentMessagesPage } from "@zoplanner/sent-messages";
import { SendMessagePopup } from "../sendMessage";
import { FaPenAlt, FaPenSquare } from "react-icons/fa";
import "react-icons/fa6";
import { Navbar } from "@zoplanner/navbar";
import { MessagesSidebar } from "../../../components/messages-sidebar/ui";
import { ChatSidebar } from "../../../components/messages-chatSidebar/ui";
import { Chat } from "../chat/ui";
import { ConfirmModal } from "./confirmModal";

function MessagesPage({ user: initialUser }) {
  const [status, setStatus] = useState("recieved");
  const [show, setShow] = useState(false);
  const { id } = useParams();
  const [user, setUser] = useState(initialUser || null);
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingConsultant, setPendingConsultant] = useState(null);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [pendingDeleteChatId, setPendingDeleteChatId] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Demo chats data
  const demoChats = [
    {
      chatId: 1,
      name: "Anna Svensson",
      username: "konsult1",
      lastMessage: "Vi ses på mötet imorgon klockan 10 då!",
      messages: [
        {
          id: 1,
          text: "Hej Anna! Hur går det med projektet?",
          timestamp: "09:30",
          isOwn: true,
        },
        {
          id: 2,
          text: "Hej! Det går väldigt bra, vi är ungefär 80% färdiga med fas 1.",
          timestamp: "09:32",
          isOwn: false,
        },
        {
          id: 3,
          text: "Wow, det är snabbare än förväntat! Vilka utmaningar har ni stött på?",
          timestamp: "09:35",
          isOwn: true,
        },
        {
          id: 4,
          text: "Framför allt databasen. Vi behövde optimera några queries som var långsamma.",
          timestamp: "09:37",
          isOwn: false,
        },
        {
          id: 5,
          text: "Har ni löst det nu?",
          timestamp: "09:38",
          isOwn: true,
        },
        {
          id: 6,
          text: "Ja, vi implementerade indexering och nu är det mycket snabbare. Vi bör kunna starta fas 2 nästa vecka.",
          timestamp: "09:40",
          isOwn: false,
        },
        {
          id: 7,
          text: "Perfekt! Kan vi ha ett möte för att diskutera detaljer för nästa fas?",
          timestamp: "09:42",
          isOwn: true,
        },
        {
          id: 8,
          text: "Absolut! Imorgon klockan 10 passar mig bra.",
          timestamp: "09:44",
          isOwn: false,
        },
        {
          id: 9,
          text: "Excellent! Jag skickar ut inbjudan nu. Vi ses på mötet imorgon klockan 10 då!",
          timestamp: "09:46",
          isOwn: true,
        },
      ],
    },
    {
      chatId: 2,
      name: "Erik Andersson",
      username: "konsult2",
      lastMessage: "Låter bra! Jag implementerar de sista ändringarna nu.",
      messages: [
        {
          id: 1,
          text: "Erik, har du fått tillgång till det nya API:et?",
          timestamp: "10:00",
          isOwn: true,
        },
        {
          id: 2,
          text: "Ja, fick det denna morgon! Mycket snabbare än det gamla.",
          timestamp: "10:02",
          isOwn: false,
        },
        {
          id: 3,
          text: "Bra! Kan du uppdatera integrationskoden?",
          timestamp: "10:03",
          isOwn: true,
        },
        {
          id: 4,
          text: "Redan på gång. Jag gjorde lite testning och allt ser ut att fungera perfekt.",
          timestamp: "10:05",
          isOwn: false,
        },
        {
          id: 5,
          text: "Vilka ändringar behöver vi göra i frontend?",
          timestamp: "10:07",
          isOwn: true,
        },
        {
          id: 6,
          text: "Egentligen inte så mycket. API:et har samma structure, bara snabbare respons.",
          timestamp: "10:08",
          isOwn: false,
        },
        {
          id: 7,
          text: "Det låter optimalt! Vilka test behöver vi köra innan release?",
          timestamp: "10:10",
          isOwn: true,
        },
        {
          id: 8,
          text: "Vi bör köra load-tester för att se hur det hanterar många förfrågningar samtidigt.",
          timestamp: "10:12",
          isOwn: false,
        },
        {
          id: 9,
          text: "Bra idé! Kan du köra det idag?",
          timestamp: "10:14",
          isOwn: true,
        },
        {
          id: 10,
          text: "Låter bra! Jag implementerar de sista ändringarna nu.",
          timestamp: "10:16",
          isOwn: false,
        },
      ],
    },
    {
      chatId: 3,
      name: "Maria Bergström",
      username: "konsult3",
      lastMessage:
        "Tack så mycket! Detta behövs verkligen för att förbättra användarupplevelsen.",
      messages: [
        {
          id: 1,
          text: "Hej Maria! Jag kollade på designförslaget du skickade. Det ser mycket bra ut!",
          timestamp: "11:00",
          isOwn: true,
        },
        {
          id: 2,
          text: "Tack! Jag spenderade mycket tid på att perfektionera det. Vad tycker du?",
          timestamp: "11:02",
          isOwn: false,
        },
        {
          id: 3,
          text: "Jag älskar färgschemat och layouten. En liten fråga: varför valde du den fonten?",
          timestamp: "11:04",
          isOwn: true,
        },
        {
          id: 4,
          text: "Den är väldigt läsbar och modern. Plus så matchar den våra andra gränssnitt bra.",
          timestamp: "11:06",
          isOwn: false,
        },
        {
          id: 5,
          text: "Perfekt! Jag håller helt med. Kan vi implementera det denna vecka?",
          timestamp: "11:08",
          isOwn: true,
        },
        {
          id: 6,
          text: "Ja, definitivt! Jag kan börja på implementeringen imorgon.",
          timestamp: "11:10",
          isOwn: false,
        },
        {
          id: 7,
          text: "Fantastiskt! Detta kommer förbättra användarupplevelsen enormt.",
          timestamp: "11:12",
          isOwn: true,
        },
        {
          id: 8,
          text: "Det är målet! Jag är glad att du gillar det.",
          timestamp: "11:14",
          isOwn: false,
        },
        {
          id: 9,
          text: "Tack så mycket! Detta behövs verkligen för att förbättra användarupplevelsen.",
          timestamp: "11:16",
          isOwn: true,
        },
      ],
    },
    {
      chatId: 4,
      name: "Johan Nilsson",
      username: "konsult4",
      lastMessage: "Jag fixar det imorgon. Vi pratar mer sedan!",
      messages: [
        {
          id: 1,
          text: "Johan, behöver vi uppdatera dokumentationen för den nya features?",
          timestamp: "13:00",
          isOwn: true,
        },
        {
          id: 2,
          text: "Ja, absolut. Jag kan skriva en komplett guide för det.",
          timestamp: "13:02",
          isOwn: false,
        },
        {
          id: 3,
          text: "När kan du börja?",
          timestamp: "13:03",
          isOwn: true,
        },
        {
          id: 4,
          text: "Jag slutar med något annat projekt idag och kan börja imorgon.",
          timestamp: "13:05",
          isOwn: false,
        },
        {
          id: 5,
          text: "Bra! Hur lång tid tror du det tar?",
          timestamp: "13:07",
          isOwn: true,
        },
        {
          id: 6,
          text: "Ungefär 2-3 dagar för en komplett guide med exempel och screenshots.",
          timestamp: "13:09",
          isOwn: false,
        },
        {
          id: 7,
          text: "Det låter rimligt. Vi behöver det innan vi releasar nästa vecka.",
          timestamp: "13:10",
          isOwn: true,
        },
        {
          id: 8,
          text: "Jag fixar det imorgon. Vi pratar mer sedan!",
          timestamp: "13:12",
          isOwn: false,
        },
      ],
    },
    {
      chatId: 5,
      name: "Lisa Eklund",
      username: "konsult5",
      lastMessage: "Super, vi hörs av imorgon då!",
      messages: [
        {
          id: 1,
          text: "Lisa, hur går säkerhetstestningen?",
          timestamp: "14:30",
          isOwn: true,
        },
        {
          id: 2,
          text: "Väldigt bra! Jag har hittat och fixat några mindre säkerhetsproblem.",
          timestamp: "14:32",
          isOwn: false,
        },
        {
          id: 3,
          text: "Allvarliga?",
          timestamp: "14:33",
          isOwn: true,
        },
        {
          id: 4,
          text: "Nej, ingenting kritiskt. Mest input-validering och SQL-injection scenarier.",
          timestamp: "14:35",
          isOwn: false,
        },
        {
          id: 5,
          text: "Bra att ha fixat det. Behöver vi ytterligare tester?",
          timestamp: "14:37",
          isOwn: true,
        },
        {
          id: 6,
          text: "Jag rekommenderar penetrationtester innan release. Jag kan kontakta ett externt team.",
          timestamp: "14:39",
          isOwn: false,
        },
        {
          id: 7,
          text: "Bra idé! Kan du göra det?",
          timestamp: "14:40",
          isOwn: true,
        },
        {
          id: 8,
          text: "Ja, jag ringer dem imorgon. Vi hörs av senare!",
          timestamp: "14:42",
          isOwn: false,
        },
        {
          id: 9,
          text: "Super, vi hörs av imorgon då!",
          timestamp: "14:44",
          isOwn: true,
        },
      ],
    },
  ];

  // Initialize localStorage with demo chats on first visit
  useEffect(() => {
    const hasInitialized = localStorage.getItem("messagesChatsInitialized");

    if (!hasInitialized) {
      console.log("First visit - initializing localStorage with demo chats");
      localStorage.setItem("messagesChats", JSON.stringify(demoChats));
      localStorage.setItem("messagesChatsInitialized", "true");
      setChats(demoChats);
      setIsInitialized(true);
    } else {
      // Load existing chats from localStorage
      const storedChats = localStorage.getItem("messagesChats");
      if (storedChats) {
        try {
          const parsedChats = JSON.parse(storedChats);
          console.log("Loaded", parsedChats.length, "chats from localStorage");
          setChats(parsedChats);
        } catch (error) {
          console.error("Failed to parse chats:", error);
          setChats(demoChats);
        }
      } else {
        setChats(demoChats);
      }
      setIsInitialized(true);
    }
  }, []);

  // Save chats to localStorage whenever they change (only if initialized)
  useEffect(() => {
    if (isInitialized) {
      console.log("Saving", chats.length, "chats to localStorage");
      localStorage.setItem("messagesChats", JSON.stringify(chats));
    }
  }, [chats, isInitialized]);

  useEffect(() => {
    if (initialUser || !id) return;

    const fetchUser = async () => {
      try {
        const data = await userService.getById(id);
        setUser(data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchUser();
  }, [id, initialUser]);

  const handleConsultantClick = (consultant) => {
    // Check if chat already exists
    const existingChat = chats.find(
      (chat) => chat.username === consultant.username,
    );

    if (existingChat) {
      // If chat exists, directly open it
      setSelectedChat(existingChat);
    } else {
      // If chat doesn't exist, show confirmation modal
      setPendingConsultant(consultant);
      setShowConfirmModal(true);
    }
  };

  const handleConfirmChat = () => {
    if (pendingConsultant) {
      // Check if chat already exists
      const existingChat = chats.find(
        (chat) => chat.username === pendingConsultant.username,
      );

      if (existingChat) {
        setSelectedChat(existingChat);
      } else {
        // Create new chat
        const newChat = {
          chatId: Date.now(),
          name: pendingConsultant.name,
          username: pendingConsultant.username,
          lastMessage: "Starten av en ny chatt",
          messages: [],
        };
        const updatedChats = [...chats, newChat];
        setChats(updatedChats);
        setSelectedChat(newChat);
      }
    }
    setShowConfirmModal(false);
    setPendingConsultant(null);
  };

  const handleChatSelect = (chat) => {
    setSelectedChat(chat);
  };

  const handleChatDeleteRequest = (chatId) => {
    setPendingDeleteChatId(chatId);
    setShowDeleteConfirmModal(true);
  };

  const handleConfirmChatDelete = () => {
    if (!pendingDeleteChatId) return;
    const updatedChats = chats.filter(
      (chat) => chat.chatId !== pendingDeleteChatId,
    );
    setChats(updatedChats);
    if (selectedChat?.chatId === pendingDeleteChatId) {
      setSelectedChat(updatedChats[0] || null);
    }
    setPendingDeleteChatId(null);
    setShowDeleteConfirmModal(false);
  };

  const handleCancelChatDelete = () => {
    setPendingDeleteChatId(null);
    setShowDeleteConfirmModal(false);
  };

  const pendingDeleteChat = chats.find(
    (chat) => chat.chatId === pendingDeleteChatId,
  );

  const handleMessageSend = (messageData) => {
    if (!selectedChat) return;

    const newMessage = {
      id: Date.now(),
      text: messageData.text,
      timestamp: messageData.timestamp,
      isOwn: true,
    };

    // Update the selected chat with new message
    const updatedChat = {
      ...selectedChat,
      messages: [...(selectedChat.messages || []), newMessage],
      lastMessage: messageData.text,
    };

    // Update chats array
    const updatedChats = chats.map((chat) =>
      chat.chatId === selectedChat.chatId ? updatedChat : chat,
    );

    setChats(updatedChats);
    setSelectedChat(updatedChat);
  };

  if (!user) {
    return <div>Laddar användare...</div>;
  }

  localStorage.setItem("currentPage", status);
  const currentStatus = localStorage.getItem("currentPage");

  return (
    <>
      <Navbar activePage={"messages"} user={user} />
      <ConfirmModal
        isOpen={showConfirmModal}
        message={`Vill du börja chatta med ${pendingConsultant?.name}?`}
        confirmText="Ja, starta chatt"
        cancelText="Avbryt"
        onConfirm={handleConfirmChat}
        onCancel={() => setShowConfirmModal(false)}
      />
      <ConfirmModal
        isOpen={showDeleteConfirmModal}
        message={`Är du säker på att du vill ta bort chatten med ${pendingDeleteChat?.name || "denna användare"}?`}
        confirmText="Ja, ta bort"
        cancelText="Avbryt"
        onConfirm={handleConfirmChatDelete}
        onCancel={handleCancelChatDelete}
      />
      <div className="messages-page__container">
        <div className="messages-page__dashboard">
          <ChatSidebar
            chats={chats}
            selectedChat={selectedChat}
            onChatSelect={handleChatSelect}
            onChatDelete={handleChatDeleteRequest}
          />
          <Chat selectedChat={selectedChat} onMessageSend={handleMessageSend} />
          <MessagesSidebar
            user={user}
            onConsultantClick={handleConsultantClick}
          />
        </div>
      </div>
    </>
  );
}

export { MessagesPage };
