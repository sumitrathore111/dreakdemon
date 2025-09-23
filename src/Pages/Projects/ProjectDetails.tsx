// src/components/ProjectDetail.tsx
import  { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import {
  doc,

  onSnapshot,
  collection,
  query,
  orderBy,
  addDoc,
  updateDoc,
  serverTimestamp,
  // runTransaction,
} from "firebase/firestore";
import type { DocumentData } from "firebase/firestore";
import { Edit2, MessageCircle, UserPlus,  Plus, Send } from "lucide-react";
import { db } from "../../service/Firebase";
import { useAuth } from "../../Context/AuthContext";
import { IssueModal } from "../../Component/ProjectComponent/Modal/IssueModal";
import CreateNewPost from "../../Component/ProjectComponent/Modal/CreateNewPost";
// import { useDataContext } from "../../Context/UserDataContext";
import ApplyModal from "../../Component/ProjectComponent/Modal/ApplyModal";

type Role = "Creator" | "Contributor" | "Viewer" | "Guest" | "HR";
type ModalType = "issue" | "message" | "update" | "apply" | "addMember" | null;

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<DocumentData | null>(null);

  const [members, setMembers] = useState<DocumentData[]>([]);
  const [issues, setIssues] = useState<DocumentData[]>([]);
  const [messages, setMessages] = useState<DocumentData[]>([]);
  const [applications, setApplications] = useState<DocumentData[]>([]);
  const [modalType, setModalType] = useState<ModalType>(null);
  // Context 
  const { user } = useAuth()
  // const { addObjectToUserArray } = useDataContext()

  const [role, setRole] = useState<Role>('Creator');

  // UI states
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [newMessageText, setNewMessageText] = useState("");
  const [loadingAction, setLoadingAction] = useState(false);

  const messagesRefEl = useRef<HTMLDivElement | null>(null);


  const handleCloseModal = () => setModalType(null);

  // ---------- Project doc realtime ----------
  useEffect(() => {
    if (!id) return;
    const projectRef = doc(db, "Open_Projects", id);
    const unsub = onSnapshot(projectRef, (snap) => {
      if (snap.exists()) {
        setProject({ id: snap.id, ...snap.data() });
        setEditTitle((snap.data() as any).title || "");
        setEditDesc((snap.data() as any).description || "");
      } else {
        setProject(null);
      }
    });
    return () => unsub();
  }, [id]);


  // ---------- Subcollections realtime: members, issues, messages ----------
  useEffect(() => {
    if (!id) return;

    const membersRef = collection(db, "Open_Projects", id, "members");
    const unsubM = onSnapshot(membersRef, (snap) =>
      setMembers(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );

    const issuesQ = query(
      collection(db, "Open_Projects", id, "issues"),
      orderBy("createdAt", "desc")
    );
    const unsubI = onSnapshot(issuesQ, (snap) =>
      setIssues(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );

    const msgsQ = query(
      collection(db, "Open_Projects", id, "messages"),
      orderBy("createdAt", "asc")
    );
    const unsubMsg = onSnapshot(msgsQ, (snap) =>
      setMessages(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );

    const appsRef = collection(db, "Open_Projects", id, "applications");
    const unsubApps = onSnapshot(appsRef, (snap) =>
      setApplications(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );

    return () => {
      unsubM();
      unsubI();
      unsubMsg();
      unsubApps();
    };
  }, [id]);

  // ---------- Determine role ----------
  useEffect(() => {
    if (!project) {
      setRole("Guest");
      return;
    }
    if (!user) {
      setRole("Viewer");
      return;
    }
    if (user.uid === project.creatorId) {
      setRole("Creator");
      return;
    }
    const found = members.find((m) => m.userId === user.uid);
    if (found) {
      setRole("Contributor");
      return;
    }
    setRole("Viewer");
  }, [project, user, members]);

  // ---------- Scroll messages to bottom on new message ----------
  useEffect(() => {
    if (!messagesRefEl.current) return;
    messagesRefEl.current.scrollTop = messagesRefEl.current.scrollHeight;
  }, [messages]);

  // ---------- Handlers ----------

  // Edit project (Creator only)
  const handleSaveProject = async () => {
    if (!id || !project) return;
    setLoadingAction(true);
    try {
      const projectRef = doc(db, "Open_Projects", id);
      await updateDoc(projectRef, {
        title: editTitle,
        description: editDesc,
        updatedAt: serverTimestamp(),
      });
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      alert("Error saving project");
    } finally {
      setLoadingAction(false);
    }
  };

  // Add member (Creator: adds a vacant role)
  const handleAddMember = async (role: string, discription: string, techStack: Array<String>) => {
    if (!id || !role) return alert("Enter role name");
    setLoadingAction(true);
    try {
      await addDoc(collection(db, "Open_Projects", id, "members"), {
        userId: null,
        name: null,
        role: role,
        status: "Vacant",
        createdAt: serverTimestamp(),
        discription,
        techStack
      });
    } catch (err) {
      console.error(err);
      alert("Error adding member");
    } finally {
      setLoadingAction(false);
    }
  };

  // Apply Application

  // const applyApplication = async (
  //   projectId: string,
  //   des: string,
  //   role: string,
   
  // ) => {
  //   if (!user) return alert("Please log in to apply");
  //   if (!projectId) return alert("Invalid project ID");
  //   try {
  //     const updateProfile = {
  //       project_id: id,
  //       appliedAt: serverTimestamp(),
  //       role: role,
  //       status: 'Pending'
  //     }
  //     const newApp = {
  //       userId: user.uid,
  //       name: user.displayName || user.email || "Anonymous",
  //       description: des,
  //       role: role,
  //       status: "Pending",
  //       appliedAt: serverTimestamp(),

  //     };
  //     addObjectToUserArray(user?.uid, 'applied_project_list', updateProfile)
  //     await addDoc(collection(db, "Open_Projects", id as string, "applications"), newApp);

  //   } catch (err: any) {
  //     console.error("Application error:", err);
  //     alert(err.message || "Failed to apply");
  //   }
  // };

  // Apply for a vacant member slot (transaction safe)
  // const acceptContributer = async (postid: string, userUId: string, UserName: String, userEmail: string) => {
  //   if (!user) return alert("Please login to apply");
  //   if (!id) return;
  //   setLoadingAction(true);
  //   const memberRef = doc(db, "Open_Projects", id, "members", postid);
  //   try {
  //     await runTransaction(db, async (tx) => {
  //       const mSnap = await tx.get(memberRef);
  //       if (!mSnap.exists()) throw new Error("Member slot not found");
  //       const data = mSnap.data() as any;
  //       if (data.userId) throw new Error("Slot already taken");
  //       tx.update(memberRef, {
  //         userId: userUId,
  //         name: UserName,
  //         email: userEmail,
  //         status: "Occupied",
  //       });
  //     });

  //   } catch (err: any) {
  //     console.error(err);
  //     alert(err.message || "Could not apply");
  //   } finally {
  //     setLoadingAction(false);
  //   }
  // };

  // Add issue (Creator & Contributor)
  const handleAddIssue = async (title: String, description: String) => {
    if (!id || !title) return alert("Provide issue title");
    if (!user) return alert("Login required");
    setLoadingAction(true);
    try {
      await addDoc(collection(db, "Open_Projects", id, "issues"), {
        title: title,
        description: description || "",
        status: "Open",
        creatorId: user.uid,
        assignedTo: null,
        createdAt: serverTimestamp(),
      });
    } catch (err) {
      console.error(err);
      alert("Error creating issue");
    } finally {
      setLoadingAction(false);
    }
  };

  // Toggle issue status (Open <-> Resolved)
  const toggleIssueStatus = async (issueId: string, currentStatus: string) => {
    if (!id) return;
    if (!user) return alert("Login required");
    setLoadingAction(true);
    try {
      const issueRef = doc(db, "Open_Projects", id, "issues", issueId);
      const newStatus = currentStatus === "Open" ? "Resolved" : "Open";
      await updateDoc(issueRef, { status: newStatus });
    } catch (err) {
      console.error(err);
      alert("Error updating issue");
    } finally {
      setLoadingAction(false);
    }
  };

  // Send message (Contributor & Creator)
  const handleSendMessage = async () => {
    if (!id) return;
    if (!user) return alert("Login required to send messages");
    if (!newMessageText.trim()) return;
    setLoadingAction(true);
    try {
      await addDoc(collection(db, "Open_Projects", id, "messages"), {
        senderId: user.uid,
        senderName: user.displayName || user.email || "Unknown",
        text: newMessageText.trim(),
        createdAt: serverTimestamp(),
      });
      setNewMessageText("");
    } catch (err) {
      console.error(err);
      alert("Error sending message");
    } finally {
      setLoadingAction(false);
    }
  };

  if (!project) {
    return (
      <div className="p-6">
        <p className="text-gray-600">Project not found or loading...</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl shadow mb-6 flex justify-between items-start gap-4">
        <div className="flex-1">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">{project.title}</h1>
              <p className="text-sm text-gray-500 mt-1">
                {project.description}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {(project.techStack || []).map((t: string, idx: number) => (
                  <span key={idx} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                    {t}
                  </span>
                ))}
              </div>
            </div>

            <div className="text-right">
              <div className="text-sm text-gray-500">Role</div>
              <div className="mt-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-semibold">
                {role}
              </div>
              {role === "Creator" && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="mt-3 inline-flex items-center gap-2 px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                >
                  <Edit2 size={16} /> Edit Project
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Members column */}
        <div className="bg-white p-5 rounded-xl shadow">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">👥 Members</h2>
            {role === "Creator" && (
              <div style={{ flexDirection: 'row' }}>
                <button
                  onClick={() => setModalType('addMember')}
                  className={`flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 shadow hover:shadow-md transition-all text-sm font-medium ${loadingAction ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  disabled={loadingAction}
                >
                  <UserPlus size={16} />
                  Add Member
                </button>
              </div>
            )}
          </div>

          {/* Scrollable container */}
          <div className="mt-4 max-h-64 overflow-y-scroll scrollbar-hide space-y-3">
            {members.length === 0 ? (
              <p className="text-sm text-gray-500">No member roles defined yet.</p>
            ) : (
              members.map((m) => (
                <div key={m.id} className="flex justify-between items-center p-3 rounded bg-gray-50">
                  <div>
                    <div className="font-medium">{m.role}</div>
                    <div className="text-sm text-gray-500">
                      {m.status === "Vacant" ? "Vacant" : `${m.name}`}
                    </div>
                  </div>
                  <div>
                    {m.status === "Vacant" ? (

                      <button
                        onClick={() => setModalType('apply')}
                        disabled={!user || loadingAction || role == 'Creator' || role == 'HR'}
                        className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                        title={user ? "Apply for this role" : "Login to apply"}

                      >
                        {role == 'Creator' || role == 'HR' ? 'Open' : ' Apply'}
                      </button>
                    ) : (
                      <span className="text-sm text-gray-600">Assigned</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>


        {/* Issues column */}
        <div className="bg-white p-5 rounded-xl shadow h-[400px]">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">🐞 Issues</h2>
            {(role === "Creator" || role === "Contributor") && (
              <div className="mt-4">

                <button
                  onClick={() => setModalType('issue')}
                  className={`flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-lg hover:from-red-700 hover:to-red-600 shadow-sm hover:shadow-md transition-all text-sm font-medium ${loadingAction ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  disabled={loadingAction}
                >
                  <Plus size={16} />
                  Add Issue
                </button>

              </div>
            )}
          </div>

          <div className="mt-4 space-y-3">
            {issues.length === 0 ? (
              <p className="text-sm text-gray-500">No issues reported.</p>
            ) : (
              issues.map((iss) => (
                <div key={iss.id} className="p-3 rounded border bg-red-50 border-red-100">
                  <div className="flex justify-between items-start gap-3">
                    <div>
                      <div className="font-medium text-red-700">{iss.title}</div>
                      <div className="text-sm text-gray-600">{iss.description}</div>
                      <div className="text-xs mt-2 text-gray-500">By: {iss.creatorId || "unknown"}</div>
                    </div>

                    <div className="space-y-2 text-right">
                      <div className={`px-2 py-1 rounded text-xs ${iss.status === "Open" ? "bg-red-200 text-red-800" : "bg-green-200 text-green-800"}`}>
                        {iss.status}
                      </div>

                      {(role === "Creator" || role === "Contributor") && (
                        <button
                          onClick={() => toggleIssueStatus(iss.id, iss.status)}
                          className="px-3 py-1 bg-yellow-500 text-white rounded text-sm hover:bg-yellow-600"
                          disabled={loadingAction}
                        >
                          Toggle
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* add issue form */}

        </div>

        {/* Messages column */}
        <div className="bg-white p-5 rounded-xl shadow flex flex-col h-[400px]">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center gap-2"><MessageCircle /> Notice</h2>
            <div className="text-sm text-gray-500">{messages.length} Notice</div>
          </div>

          <div
            ref={messagesRefEl}
            className="mt-4 overflow-y-auto flex-1 space-y-3 pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
          >
            {messages.length === 0 ? (
              <p className="text-sm text-gray-500">No notice yet — start a conversation.</p>
            ) : (
              messages.map((m) => (
                <div
                  key={m.id}
                  className={`p-3 rounded-lg border ${m.senderId === user?.uid ? "self-end bg-blue-50 border-blue-200 text-blue-800" : "bg-gray-50 border-gray-200 text-gray-700"}`}
                  style={{ maxWidth: "90%" }}
                >
                  <div className="text-sm">{m.text}</div>
                  <div className="text-xs text-gray-400 mt-2">— {m.senderName}</div>
                </div>
              ))
            )}
          </div>
          {role == 'Contributor' || role == 'Creator' && (

            <div className="mt-4 flex gap-2">
              <input
                className="flex-1 px-3 py-2 border rounded"
                placeholder={user ? "Write a notice..." : "Login to send messages"}
                value={newMessageText}
                onChange={(e) => setNewMessageText(e.target.value)}
                disabled={!user}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
              <button
                onClick={handleSendMessage}
                disabled={!user || !newMessageText.trim() || loadingAction}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"
                title={user ? "Send" : "Login to send"}
              >
                <Send size={14} /> Send
              </button>
            </div>
          )}
        </div>

        {/*Application Section */}
        {
          role == 'HR' || role == 'Creator' && (<div className="mt-6 bg-white p-5 rounded-xl shadow">
            <h2 className="text-lg font-semibold">📋 Applications</h2>
            {applications.length === 0 ? (
              <p className="text-sm text-gray-500 mt-2">
                No applications submitted yet.
              </p>
            ) : (
              <ul className="mt-3 space-y-2">
                {applications.map((app) => (
                  <li
                    key={app.id}
                    className="p-3 rounded border bg-gray-50 border-gray-200"
                  >
                    <div className="font-medium">{app.applicantName}</div>
                    <div className="text-sm text-gray-500">
                      {app.coverLetter || "No details provided"}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>)
        }

      </div>

      {/* Edit project modal */}
      {isEditing && role === "Creator" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white w-full max-w-2xl p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-3">Edit Project</h3>
            <input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              placeholder="Project title"
              className="w-full px-3 py-2 border rounded mb-3"
            />
            <textarea
              value={editDesc}
              onChange={(e) => setEditDesc(e.target.value)}
              placeholder="Project description"
              className="w-full px-3 py-2 border rounded mb-3"
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setIsEditing(false)} className="px-4 py-2 bg-gray-300 rounded">Cancel</button>
              <button onClick={handleSaveProject} className="px-4 py-2 bg-yellow-500 text-white rounded" disabled={loadingAction}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {modalType === "addMember" && <CreateNewPost onClose={handleCloseModal} onSubmit={(data) => handleAddMember(data.jobRole, data.description, data.techstack)} />}
      {modalType === 'issue' && <IssueModal onClose={handleCloseModal} onSubmit={(data) => handleAddIssue(data.issueTitle, data.issueDescription)} />}
      {modalType === 'apply' && <ApplyModal onClose={handleCloseModal} />}
    </div>
  );
}
