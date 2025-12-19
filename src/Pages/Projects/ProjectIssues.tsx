import {
    addDoc,
    collection,
    doc,
    onSnapshot,
    serverTimestamp,
    updateDoc,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { auth, db } from "../../service/Firebase";


export default function Issues() {
  const { id } = useParams();
  const [issues, setIssues] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "Open_Projects", id!, "issues"), (snap) => {
      setIssues(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [id]);

  const addIssue = async () => {
    const user = auth.currentUser;
    if (!title) return;
    await addDoc(collection(db, "Open_Projects", id!, "issues"), {
      title,
      description: desc,
      status: "Open",
      createdBy: user?.email,
      createdAt: serverTimestamp(),
    });
    setTitle("");
    setDesc("");
  };

  const updateStatus = async (issueId: string, newStatus: string) => {
    await updateDoc(doc(db, "projects", id!, "issues", issueId), {
      status: newStatus,
    });
  };

  return (
    <div className="mt-6 border rounded p-4 bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
      <h2 className="font-semibold mb-2 text-gray-900 dark:text-white">Issues</h2>
      <ul>
        {issues.map((iss) => (
          <li key={iss.id} className="mb-2 border-b dark:border-gray-700 pb-2">
            <p className="font-bold text-gray-900 dark:text-white">{iss.title}</p>
            <p className="text-sm text-gray-700 dark:text-gray-300">{iss.description}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Status: {iss.status}</p>
            <div className="flex gap-2 mt-1">
              <button
                onClick={() => updateStatus(iss.id, "In Progress")}
                className="px-2 py-1 bg-yellow-400 text-white rounded"
              >
                In Progress
              </button>
              <button
                onClick={() => updateStatus(iss.id, "Resolved")}
                className="px-2 py-1 bg-green-500 text-white rounded"
              >
                Resolved
              </button>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-4">
        <input
          className="border rounded px-2 py-1 mb-2 w-full bg-white dark:bg-gray-900 dark:border-gray-600 text-gray-900 dark:text-white"
          placeholder="Issue Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          className="border rounded px-2 py-1 mb-2 w-full bg-white dark:bg-gray-900 dark:border-gray-600 text-gray-900 dark:text-white"
          placeholder="Description"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
        />
        <button
          onClick={addIssue}
          className="bg-red-500 text-white px-3 py-1 rounded"
        >
          Add Issue
        </button>
      </div>
    </div>
  );
}
