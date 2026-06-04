import React, { useEffect, useState, useCallback } from "react";
import { useAppState } from "@statelab/state-engines";
import { translate } from "@statelab/theme";
import { Image as ImageIcon, RefreshCw } from "lucide-react";

interface Meme {
  id: string;
  name: string;
  url: string;
}

export const Memes: React.FC = () => {
  const { language } = useAppState();
  const [memes, setMemes] = useState<Meme[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMemes = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("https://api.imgflip.com/get_memes");
      if (!response.ok) throw new Error("Failed to load memes");
      const data = await response.json();
      const allMemes = data.data?.memes || [];
      // Select the first 5 memes
      setMemes(allMemes.slice(0, 5));
    } catch {
      setError(translate(language, "fetchMemesError"));
    } finally {
      setIsLoading(false);
    }
  }, [language]);

  useEffect(() => {
    fetchMemes();
  }, [fetchMemes]);

  return (
    <div className="page-container memes-page">
      <div className="todos-card-header">
        <div className="todos-header-title">
          <ImageIcon className="todos-title-icon" />
          <h3>{translate(language, "navMemes")}</h3>
        </div>
        <button
          onClick={fetchMemes}
          className="btn btn-secondary fetch-btn"
          disabled={isLoading}
        >
          <RefreshCw className={`fetch-icon ${isLoading ? "spinning" : ""}`} size={16} />
          <span className="btn-text">Re-fetch API Data</span>
        </button>
      </div>

      {isLoading ? (
        <div className="loading-state">
          <RefreshCw className="loading-spinner spinning" size={32} />
          <p>{translate(language, "loading")}</p>
        </div>
      ) : error ? (
        <div className="empty-state">
          <p className="danger-text">{error}</p>
        </div>
      ) : (
        <div className="memes-list-wrapper">
          {memes.length === 0 ? (
            <div className="empty-state">
              <p>No memes available.</p>
            </div>
          ) : (
            <div className="memes-grid">
              {memes.map((meme) => (
                <div key={meme.id} className="meme-card">
                  <h4 className="meme-title">{meme.name}</h4>
                  <div className="meme-image-container">
                    <img src={meme.url} alt={meme.name} className="meme-image" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
