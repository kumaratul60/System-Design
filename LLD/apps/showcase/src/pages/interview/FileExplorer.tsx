import React, { useState, useMemo } from "react";
import { translate } from "@statelab/theme";
import { Folder, File, ChevronRight, ChevronDown, Trash2, Edit, Search, FolderPlus, FilePlus, Code} from "lucide-react";

// ----------------------------------------------------
// --- Interfaces & Mock Filesystem Structure --------
// ----------------------------------------------------
interface FSNode {
  id: string;
  name: string;
  isFolder: boolean;
  children?: FSNode[];
}

const INITIAL_FS: FSNode = {
  id: "root",
  name: "project-root",
  isFolder: true,
  children: [
    {
      id: "node_src",
      name: "src",
      isFolder: true,
      children: [
        {
          id: "node_components",
          name: "components",
          isFolder: true,
          children: [
            { id: "node_button", name: "Button.tsx", isFolder: false },
            { id: "node_dropdown", name: "Dropdown.tsx", isFolder: false },
          ]},
        { id: "node_app", name: "App.tsx", isFolder: false },
        { id: "node_main", name: "main.tsx", isFolder: false },
      ]},
    {
      id: "node_public",
      name: "public",
      isFolder: true,
      children: [
        { id: "node_logo", name: "favicon.ico", isFolder: false },
        { id: "node_index", name: "index.html", isFolder: false },
      ]},
    { id: "node_package", name: "package.json", isFolder: false },
    { id: "node_tsconfig", name: "tsconfig.json", isFolder: false },
  ]};

export const FileExplorer: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"basic" | "mid" | "advance">("basic");

  // State representing filesystem tree
  const [fs, setFs] = useState<FSNode>(INITIAL_FS);

  // States for folder expansions
  const [expandedFolderIds, setExpandedFolderIds] = useState<Record<string, boolean>>({
    root: true,
    node_src: true,
    node_components: false,
    node_public: false});

  // Toggle Folder expansion helper
  const toggleFolder = (id: string) => {
    setExpandedFolderIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // ----------------------------------------------------
  // --- MUTATIVE ACTIONS (Mid / Advance) ---------------
  // ----------------------------------------------------
  // 1. Recursive helper to insert node
  const insertNode = (tree: FSNode, parentId: string, name: string, isFolder: boolean): FSNode => {
    if (tree.id === parentId) {
      const newNode: FSNode = {
        id: `node_${Date.now()}`,
        name,
        isFolder,
        children: isFolder ? [] : undefined};
      return {
        ...tree,
        children: [...(tree.children || []), newNode]};
    }

    if (tree.children) {
      return {
        ...tree,
        children: tree.children.map((child) => insertNode(child, parentId, name, isFolder))};
    }
    return tree;
  };

  // 2. Recursive helper to delete node
  const deleteNode = (tree: FSNode, targetId: string): FSNode | null => {
    if (tree.id === targetId) return null;

    if (tree.children) {
      return {
        ...tree,
        children: tree.children
          .map((child) => deleteNode(child, targetId))
          .filter((child): child is FSNode => child !== null)};
    }
    return tree;
  };

  // 3. Recursive helper to rename node
  const renameNode = (tree: FSNode, targetId: string, newName: string): FSNode => {
    if (tree.id === targetId) {
      return { ...tree, name: newName };
    }

    if (tree.children) {
      return {
        ...tree,
        children: tree.children.map((child) => renameNode(child, targetId, newName))};
    }
    return tree;
  };

  // State management functions triggered from children callbacks
  const handleCreateNode = (parentId: string, name: string, isFolder: boolean) => {
    if (!name.trim()) return;
    setFs((prev) => insertNode(prev, parentId, name, isFolder));
    // Auto expand parent
    setExpandedFolderIds((prev) => ({ ...prev, [parentId]: true }));
  };

  const handleDeleteNode = (id: string) => {
    setFs((prev) => {
      const updated = deleteNode(prev, id);
      return updated || prev; // Ensure we don't delete root
    });
  };

  const handleRenameNode = (id: string, newName: string) => {
    if (!newName.trim()) return;
    setFs((prev) => renameNode(prev, id, newName));
  };

  // ----------------------------------------------------
  // --- SEARCH & FILTER (Advance) ----------------------
  // ----------------------------------------------------
  const [searchQuery, setSearchQuery] = useState("");

  // Memoized filtered node tree mapping matching nodes
  const filterTree = (node: FSNode, query: string): FSNode | null => {
    const matches = node.name.toLowerCase().includes(query.toLowerCase());
    
    if (node.children) {
      const filteredChildren = node.children
        .map((child) => filterTree(child, query))
        .filter((child): child is FSNode => child !== null);

      if (filteredChildren.length > 0 || matches) {
        return {
          ...node,
          children: filteredChildren};
      }
    } else if (matches) {
      return node;
    }
    return null;
  };

  const filteredFs = useMemo(() => {
    if (!searchQuery.trim()) return fs;
    return filterTree(fs, searchQuery) || { id: "empty", name: "No matches", isFolder: true, children: [] };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fs, searchQuery]);

  // Expand all folders matching query automatically when searching
  useMemo(() => {
    if (!searchQuery.trim()) return;
    const expandMatching = (node: FSNode) => {
      if (node.isFolder) {
        setExpandedFolderIds((prev) => ({ ...prev, [node.id]: true }));
        node.children?.forEach(expandMatching);
      }
    };
    expandMatching(fs);
  }, [searchQuery, fs]);

  // ----------------------------------------------------
  // --- SUB-COMPONENT: Recursive Node Renderer --------
  // ----------------------------------------------------
  interface NodeProps {
    node: FSNode;
    depth: number;
    allowMutations: boolean;
    allowPathTrace: boolean;
  }

  const RenderNode: React.FC<NodeProps> = ({ node, depth, allowMutations, allowPathTrace }) => {
    const isExpanded = expandedFolderIds[node.id] || false;
    const [isAdding, setIsAdding] = useState<"folder" | "file" | null>(null);
    const [newItemName, setNewItemName] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState(node.name);

    const handleCreateSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (newItemName.trim() && isAdding) {
        handleCreateNode(node.id, newItemName, isAdding === "folder");
        setNewItemName("");
        setIsAdding(null);
      }
    };

    const handleEditSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (editName.trim()) {
        handleRenameNode(node.id, editName);
        setIsEditing(false);
      }
    };

    return (
      <div style={{ marginLeft: `${depth * 16}px`, marginTop: "4px" }}>
        <div
          className="fs-row"
          style={{
            display: "flex",
            alignItems: "center",
            padding: "6px 8px",
            borderRadius: "6px",
            cursor: "pointer",
            background: "transparent",
            justifyContent: "space-between",
            transition: "background-color 0.2s"}}
          onClick={() => node.isFolder && toggleFolder(node.id)}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: 1 }}>
            {node.isFolder ? (
              <>
                {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                <Folder size={18} style={{ color: "var(--primary)", fill: "rgba(59, 130, 246, 0.1)" }} />
              </>
            ) : (
              <>
                <span style={{ width: "16px" }} />
                <File size={18} style={{ color: "var(--text-muted)" }} />
              </>
            )}

            {isEditing ? (
              <form onSubmit={handleEditSubmit} onClick={(e) => e.stopPropagation()} style={{ display: "flex", gap: "6px" }}>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="select-input"
                  style={{ padding: "2px 6px", fontSize: "0.85rem", height: "24px", width: "140px" }}
                  autoFocus
                />
                <button type="submit" className="btn btn-primary" style={{ padding: "0 8px", height: "24px", fontSize: "0.75rem" }}>OK</button>
              </form>
            ) : (
              <span
                style={{
                  fontSize: "0.9rem",
                  color: "var(--text-h)",
                  fontWeight: node.isFolder ? "bold" : "normal"}}
                title={allowPathTrace ? `ID: ${node.id}` : undefined}
              >
                {node.name}
              </span>
            )}
          </div>

          {/* Mutation Action Tools */}
          {allowMutations && node.id !== "root" && !isEditing && (
            <div className="fs-actions" onClick={(e) => e.stopPropagation()} style={{ display: "flex", gap: "6px" }}>
              {node.isFolder && (
                <>
                  <button
                    onClick={() => setIsAdding("file")}
                    title="Add File"
                    style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: "2px" }}
                  >
                    <FilePlus size={14} />
                  </button>
                  <button
                    onClick={() => setIsAdding("folder")}
                    title="Add Folder"
                    style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: "2px" }}
                  >
                    <FolderPlus size={14} />
                  </button>
                </>
              )}
              <button
                onClick={() => setIsEditing(true)}
                title="Rename"
                style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: "2px" }}
              >
                <Edit size={14} />
              </button>
              <button
                onClick={() => handleDeleteNode(node.id)}
                title="Delete"
                style={{ background: "none", border: "none", color: "red", cursor: "pointer", padding: "2px" }}
              >
                <Trash2 size={14} />
              </button>
            </div>
          )}

          {/* Root-specific folder addition */}
          {allowMutations && node.id === "root" && (
            <div className="fs-actions" onClick={(e) => e.stopPropagation()} style={{ display: "flex", gap: "6px" }}>
              <button
                onClick={() => setIsAdding("file")}
                title="Add File to Root"
                style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: "2px" }}
              >
                <FilePlus size={14} />
              </button>
              <button
                onClick={() => setIsAdding("folder")}
                title="Add Folder to Root"
                style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: "2px" }}
              >
                <FolderPlus size={14} />
              </button>
            </div>
          )}
        </div>

        {/* Dynamic add item form */}
        {isAdding && (
          <div style={{ marginLeft: "24px", marginTop: "4px", marginBottom: "4px" }}>
            <form onSubmit={handleCreateSubmit} style={{ display: "flex", gap: "6px", alignItems: "center" }}>
              {isAdding === "folder" ? <Folder size={14} style={{ color: "var(--primary)" }} /> : <File size={14} style={{ color: "var(--text-muted)" }} />}
              <input
                type="text"
                placeholder={isAdding === "folder" ? "folder name..." : "file name..."}
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                className="select-input"
                style={{ padding: "2px 6px", fontSize: "0.8rem", height: "24px", width: "120px" }}
                autoFocus
              />
              <button type="submit" className="btn btn-primary" style={{ padding: "0 8px", height: "24px", fontSize: "0.75rem" }}>Add</button>
              <button onClick={() => setIsAdding(null)} className="btn btn-secondary" style={{ padding: "0 8px", height: "24px", fontSize: "0.75rem" }}>Cancel</button>
            </form>
          </div>
        )}

        {/* Child recursive loops */}
        {node.isFolder && isExpanded && node.children && (
          <div style={{ borderLeft: "1px solid var(--border)", marginLeft: "8px", paddingLeft: "4px" }}>
            {node.children.map((child) => (
              <RenderNode
                key={child.id}
                node={child}
                depth={depth} // don't accumulate indentation inside folder container
                allowMutations={allowMutations}
                allowPathTrace={allowPathTrace}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="todos-card-header" style={{ marginBottom: "20px" }}>
        <div className="todos-header-title">
          <Folder className="todos-title-icon" style={{ color: "var(--text-h)" }} />
          <h3>Recursive File Explorer</h3>
                    <a
            href={`https://github.com/kumaratul60/System-Design/blob/main/LLD/apps/showcase/src/pages/interview/FileExplorer.tsx`}
            target="_blank"
            rel="noopener noreferrer"
            title={translate("viewSource")}
            className="challenge-code-link-header"
            style={{ marginLeft: "auto", color: "var(--text-muted)", display: "flex", alignItems: "center", transition: "color 0.2s" }}
          >
            <Code size={20} />
          </a>
        </div>
      </div>

      {/* Tabs Menu */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px", borderBottom: "1px solid var(--border)", paddingBottom: "10px" }}>
        <button
          className={`btn ${activeTab === "basic" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => setActiveTab("basic")}
        >
          Basic (Expand/Collapse Tree)
        </button>
        <button
          className={`btn ${activeTab === "mid" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => setActiveTab("mid")}
        >
          Mid (Create, Rename & Delete)
        </button>
        <button
          className={`btn ${activeTab === "advance" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => setActiveTab("advance")}
        >
          Advance (Dynamic Node Query Filter)
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.7fr 1.3fr", gap: "24px", alignItems: "start" }}>
        {/* Left Side: Tree Grid */}
        <div style={{ border: "1px solid var(--border)", borderRadius: "var(--border-radius)", background: "var(--card-bg)", padding: "24px" }}>
          
          {/* Search Box in Advance */}
          {activeTab === "advance" && (
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px", background: "var(--input-bg)", padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--border)" }}>
              <Search size={16} style={{ color: "var(--text-muted)" }} />
              <input
                type="text"
                placeholder="Search files/folders across all nested directories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ background: "transparent", border: "none", width: "100%", color: "var(--text-h)", outline: "none" }}
              />
            </div>
          )}

          {/* Render files tree */}
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <RenderNode
              node={activeTab === "advance" ? filteredFs : fs}
              depth={0}
              allowMutations={activeTab === "mid" || activeTab === "advance"}
              allowPathTrace={activeTab === "advance"}
            />
          </div>
        </div>

        {/* Right Side: Architecture Info */}
        <div style={{ border: "1px solid var(--border)", borderRadius: "var(--border-radius)", background: "var(--card-bg)", padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
          <h4>Recursive Folder Architecture</h4>
          
          <div style={{ fontSize: "0.8rem", fontFamily: "var(--font-mono)", display: "flex", flexDirection: "column", gap: "12px" }}>
            <div>
              <strong style={{ color: "var(--text-h)" }}>Tree Recursion Model</strong>
              <p style={{ color: "var(--text-muted)", marginTop: "4px" }}>
                Components call themselves recursively to render folder child children sub-trees:
                <br />
                <code>&lt;RenderNode node={"{child}"} /&gt;</code>.
              </p>
            </div>
            
            <div style={{ borderTop: "1px solid var(--border)", paddingTop: "8px" }}>
              <strong style={{ color: "var(--text-h)" }}>Immutability Operations</strong>
              <p style={{ color: "var(--text-muted)", marginTop: "4px" }}>
                Adding, renaming, and deleting items require deeply traversing the nested children arrays and returning brand new copy references to trigger React state updates cleanly.
              </p>
            </div>

            <div style={{ borderTop: "1px solid var(--border)", paddingTop: "8px" }}>
              <strong style={{ color: "var(--text-h)" }}>Search Filtering Query</strong>
              <p style={{ color: "var(--text-muted)", marginTop: "4px" }}>
                The search filters folders by returning a sub-tree copy where folder nodes are retained only if they contain matches or their children have match items.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileExplorer;
