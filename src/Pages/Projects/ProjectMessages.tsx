import {
    addDoc,
    collection,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { auth, db } from "../../service/Firebase";

export default function Messages() {
  const { id } = useParams();
  const [messages, setMessages] = useState<any[]>([]);
  const [newMsg, setNewMsg] = useState("");

  useEffect(() => {
    const q = query(
      collection(db, "Open_Projects", id!, "messages"),
      orderBy("createdAt", "asc")
    );
    const unsub = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [id]);

  const sendMessage = async () => {
    if (!newMsg.trim()) return;
    const user = auth.currentUser;
    await addDoc(collection(db, "projects", id!, "messages"), {
      sender: user?.email,
      text: newMsg,
      createdAt: serverTimestamp(),
    });
    setNewMsg("");
  };

  return (
    <div className="mt-4 sm:mt-6 border rounded-lg sm:rounded-xl p-3 sm:p-4 bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
      <h2 className="text-base sm:text-lg font-semibold mb-2 text-gray-900 dark:text-white">Messages</h2>
      <div className="h-32 sm:h-40 overflow-y-auto border dark:border-gray-700 p-2 bg-white dark:bg-gray-900 mb-2 rounded">
        {messages.map((m) => (
          <p key={m.id} className="mb-1 text-xs sm:text-sm text-gray-900 dark:text-gray-100">
            <span className="font-bold text-cyan-600 dark:text-cyan-400">{m.sender}: </span>{m.text}
          </p>
        ))}
      </div>
      <div className="flex gap-1.5 sm:gap-2">
        <input
          className="flex-1 border rounded px-2 py-1 text-sm sm:text-base bg-white dark:bg-gray-900 dark:border-gray-600 text-gray-900 dark:text-white"
          value={newMsg}
          onChange={(e) => setNewMsg(e.target.value)}
          placeholder="Type message..."
        />
        <button
          onClick={sendMessage}
          className="bg-blue-500 text-white px-3 py-1 text-sm sm:text-base rounded"
        >
          Send
        </button>
      </div>
    </div>
  );
}
