import React, { useState, useCallback } from "react";
import { MessageSquare, Send, Trash2, Edit2, CornerDownRight, X, Check } from "lucide-react";

// --- Types & Interfaces ---
export interface CommentNode {
  id: string;
  author: string;
  text: string;
  timestamp: string;
  replies: CommentNode[];
}

export interface UseCommentsParams {
  initialComments: CommentNode[];
}

// DFS Recursive Helpers (operating on deep clones to maintain pure state updates)
function addReplyDFS(nodes: CommentNode[], parentId: string, reply: CommentNode): boolean {
  for (let i = 0; i < nodes.length; i++) {
    if (nodes[i].id === parentId) {
      nodes[i].replies = [reply, ...nodes[i].replies]; // Insert at the top of replies
      return true;
    }
    if (nodes[i].replies.length > 0) {
      const found = addReplyDFS(nodes[i].replies, parentId, reply);
      if (found) return true;
    }
  }
  return false;
}

function editCommentDFS(nodes: CommentNode[], targetId: string, text: string): boolean {
  for (let i = 0; i < nodes.length; i++) {
    if (nodes[i].id === targetId) {
      nodes[i].text = text;
      return true;
    }
    if (nodes[i].replies.length > 0) {
      const found = editCommentDFS(nodes[i].replies, targetId, text);
      if (found) return true;
    }
  }
  return false;
}

function deleteCommentDFS(nodes: CommentNode[], targetId: string): boolean {
  for (let i = 0; i < nodes.length; i++) {
    if (nodes[i].id === targetId) {
      nodes.splice(i, 1);
      return true;
    }
    if (nodes[i].replies.length > 0) {
      const found = deleteCommentDFS(nodes[i].replies, targetId);
      if (found) return true;
    }
  }
  return false;
}

// --- Data Layer: Custom Hook ---
export function useCommentsLogic({ initialComments }: UseCommentsParams) {
  const [comments, setComments] = useState<CommentNode[]>(initialComments);

  // Action Dispatchers
  const postRootComment = useCallback((text: string, author = "Anonymous User") => {
    const clean = text.trim();
    if (!clean) return;

    const newComment: CommentNode = {
      id: `c-${Math.random().toString(36).substring(2, 9)}`,
      author,
      text: clean,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      replies: [],
    };

    setComments((prev) => [newComment, ...prev]);
  }, []);

  const replyToComment = useCallback(
    (parentId: string, text: string, author = "Anonymous User") => {
      const clean = text.trim();
      if (!clean) return;

      const newReply: CommentNode = {
        id: `c-${Math.random().toString(36).substring(2, 9)}`,
        author,
        text: clean,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        replies: [],
      };

      setComments((prev) => {
        const clone = JSON.parse(JSON.stringify(prev));
        addReplyDFS(clone, parentId, newReply);
        return clone;
      });
    },
    []
  );

  const editComment = useCallback(
    (id: string, text: string) => {
      const clean = text.trim();
      if (!clean) return;

      setComments((prev) => {
        const clone = JSON.parse(JSON.stringify(prev));
        editCommentDFS(clone, id, clean);
        return clone;
      });
    },
    []
  );

  const deleteComment = useCallback(
    (id: string) => {
      setComments((prev) => {
        const clone = JSON.parse(JSON.stringify(prev));
        deleteCommentDFS(clone, id);
        return clone;
      });
    },
    []
  );

  return {
    comments,
    postRootComment,
    replyToComment,
    editComment,
    deleteComment,
  };
}

// --- Recursive Comment Node component ---
interface CommentItemProps {
  comment: CommentNode;
  depth: number;
  onReply: (parentId: string, text: string) => void;
  onEdit: (id: string, text: string) => void;
  onDelete: (id: string) => void;
}

const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  depth,
  onReply,
  onEdit,
  onDelete,
}) => {
  const [isReplying, setIsReplying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [replyInput, setReplyInput] = useState("");
  const [editInput, setEditInput] = useState(comment.text);

  const handleReplySubmit = () => {
    if (replyInput.trim()) {
      onReply(comment.id, replyInput);
      setReplyInput("");
      setIsReplying(false);
    }
  };

  const handleEditSubmit = () => {
    if (editInput.trim()) {
      onEdit(comment.id, editInput);
      setIsEditing(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        marginTop: "12px",
        position: "relative",
      }}
    >
      {/* Outer Card */}
      <div
        style={{
          border: "1px solid var(--border)",
          borderRadius: "var(--border-radius)",
          background: "var(--card-bg)",
          padding: "14px",
          position: "relative",
          marginLeft: depth > 0 ? "16px" : "0px",
        }}
      >
        {/* Thread connecting indicator lines */}
        {depth > 0 && (
          <div
            style={{
              position: "absolute",
              left: "-12px",
              top: "-8px",
              width: "12px",
              height: "28px",
              borderLeft: "2px solid var(--border)",
              borderBottom: "2px solid var(--border)",
              borderBottomLeftRadius: "6px",
            }}
          />
        )}

        {/* Comment Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
          <div>
            <strong style={{ color: "var(--text-h)", fontSize: "0.9rem" }}>{comment.author}</strong>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginLeft: "8px" }}>
              {comment.timestamp}
            </span>
          </div>
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", padding: "1px 6px", background: "var(--input-bg)", borderRadius: "4px" }}>
            Depth {depth}
          </span>
        </div>

        {/* Comment Text or Editor */}
        {isEditing ? (
          <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
            <input
              type="text"
              value={editInput}
              onChange={(e) => setEditInput(e.target.value)}
              className="text-input"
              style={{ flexGrow: 1 }}
            />
            <button className="btn btn-primary" onClick={handleEditSubmit} style={{ padding: "6px 12px" }}>
              <Check size={14} />
            </button>
            <button className="btn btn-secondary" onClick={() => setIsEditing(false)} style={{ padding: "6px 12px" }}>
              <X size={14} />
            </button>
          </div>
        ) : (
          <p style={{ margin: 0, fontSize: "0.95rem", color: "var(--text)", lineHeight: 1.5 }}>
            {comment.text}
          </p>
        )}

        {/* Action Toolbar */}
        {!isEditing && (
          <div style={{ display: "flex", gap: "14px", marginTop: "10px", fontSize: "0.8rem", color: "var(--text-muted)" }}>
            <button
              onClick={() => setIsReplying(!isReplying)}
              style={{ background: "transparent", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px", color: "inherit", padding: 0 }}
            >
              <CornerDownRight size={13} /> Reply
            </button>

            <button
              onClick={() => {
                setEditInput(comment.text);
                setIsEditing(true);
              }}
              style={{ background: "transparent", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px", color: "inherit", padding: 0 }}
            >
              <Edit2 size={13} /> Edit
            </button>

            <button
              onClick={() => onDelete(comment.id)}
              style={{ background: "transparent", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px", color: "var(--danger)", padding: 0 }}
            >
              <Trash2 size={13} /> Delete
            </button>
          </div>
        )}

        {/* Nested Reply Input */}
        {isReplying && (
          <div style={{ display: "flex", gap: "8px", marginTop: "12px", borderTop: "1px dashed var(--border)", paddingTop: "12px" }}>
            <input
              type="text"
              placeholder="Write a response..."
              value={replyInput}
              onChange={(e) => setReplyInput(e.target.value)}
              className="text-input"
              style={{ flexGrow: 1 }}
              onKeyDown={(e) => { if (e.key === "Enter") handleReplySubmit(); }}
            />
            <button className="btn btn-primary" onClick={handleReplySubmit} style={{ padding: "6px 12px" }}>
              Submit
            </button>
            <button className="btn btn-secondary" onClick={() => setIsReplying(false)} style={{ padding: "6px 12px" }}>
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Recursive Render Child Replies */}
      {comment.replies.length > 0 && (
        <div style={{ paddingLeft: "8px", borderLeft: "2px solid var(--border)", marginLeft: "14px" }}>
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              depth={depth + 1}
              onReply={onReply}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// --- Initial Hierarchical Seed Data ---
const COMMENT_SEED_DATA: CommentNode[] = [
  {
    id: "c-1",
    author: "Alice Davidson",
    text: "Can someone explain why DFS is preferred over BFS for commenting systems? Wouldn't it be easier to fetch level-by-level?",
    timestamp: "10:14 AM",
    replies: [
      {
        id: "c-2",
        author: "Bob Miller",
        text: "Comment sections are structured like trees, where reading is chronological down a single thread (top-to-bottom). Representing threads as a DFS traversal preserves conversational flow rather than mixing sibling threads together.",
        timestamp: "10:20 AM",
        replies: [
          {
            id: "c-3",
            author: "Charlie",
            text: "Spot on! That makes perfect sense. Plus, recursion maps directly to standard DFS visual nesting in HTML render trees.",
            timestamp: "10:35 AM",
            replies: [],
          },
        ],
      },
    ],
  },
  {
    id: "c-4",
    author: "System Architect",
    text: "Always deep-clone state when updating nested object properties in React. Mutating nested child references directly causes render misses because shallow array/object identity is preserved.",
    timestamp: "09:50 AM",
    replies: [],
  },
];

// --- UI Layer: Presentation Component ---
export const NestedComments: React.FC = () => {
  const { comments, postRootComment, replyToComment, editComment, deleteComment } = useCommentsLogic({
    initialComments: COMMENT_SEED_DATA,
  });

  const [newCommentVal, setNewCommentVal] = useState("");

  const handlePostRoot = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCommentVal.trim()) {
      postRootComment(newCommentVal);
      setNewCommentVal("");
    }
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="todos-card-header">
        <div className="todos-header-title">
          <MessageSquare className="todos-title-icon" style={{ color: "var(--text-h)" }} />
          <h3>Hierarchical Thread Comments</h3>
        </div>
      </div>

      {/* Main Comment Box */}
      <div style={{ border: "1px solid var(--border)", borderRadius: "var(--border-radius)", background: "var(--card-bg)", padding: "18px" }}>
        <form onSubmit={handlePostRoot} style={{ display: "flex", gap: "10px" }}>
          <input
            type="text"
            placeholder="Share your thoughts on LLD designs..."
            value={newCommentVal}
            onChange={(e) => setNewCommentVal(e.target.value)}
            className="text-input"
            style={{ flexGrow: 1 }}
          />
          <button type="submit" className="btn btn-primary" style={{ display: "flex", gap: "6px" }}>
            <Send size={15} /> Post Comment
          </button>
        </form>
      </div>

      {/* Recursive Comments Thread List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {comments.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "48px",
              border: "1px dashed var(--border)",
              borderRadius: "var(--border-radius)",
              color: "var(--text-muted)",
            }}
          >
            Thread is currently empty. Be the first to start the conversation!
          </div>
        ) : (
          comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              depth={0}
              onReply={replyToComment}
              onEdit={editComment}
              onDelete={deleteComment}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default NestedComments;
