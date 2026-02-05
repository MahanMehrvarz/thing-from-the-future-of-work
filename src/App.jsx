import React, { useState, useEffect } from 'react';
import './App.css';
import Tabs from './components/Tabs';
import CardGrid from './components/CardGrid';
import Footer from './components/Footer';
import { ARC, TERRAIN, OBJECT, MOOD } from './data/cards';

// Helper to pick random item
const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

const COLORS = {
  Arc: '#E53935',
  Object: '#1E88E5',
  Terrain: '#43A047',
  Mood: '#FB8C00',
  'Make Futures': '#222'
};

const DATA = {
  Arc: ARC,
  Object: OBJECT,
  Terrain: TERRAIN,
  Mood: MOOD
};

function App() {
  const [activeTab, setActiveTab] = useState('Arc');
  const [flipTrigger, setFlipTrigger] = useState({ action: null, timestamp: 0 });
  const [isDownloadingDeck, setIsDownloadingDeck] = useState(false);
  const [downloadStatus, setDownloadStatus] = useState(null);

  // State for the Mixed Hand
  const [hand, setHand] = useState({
    Arc: null,
    Terrain: null,
    Object: null,
    Mood: null
  });

  // Initialize hand once on mount
  useEffect(() => {
    setHand({
      Arc: getRandom(ARC),
      Object: getRandom(OBJECT),
      Terrain: getRandom(TERRAIN),
      Mood: getRandom(MOOD)
    });

    // Check for hidden route to trigger dynamic generation
    if (window.location.pathname === '/generatedownload') {
      console.log('Hidden route detected. Initiating dynamic deck generation...');
      generateDynamicDeck();
    }
  }, []);

  const handleFlipAll = (side) => {
    setFlipTrigger({ action: side, target: 'all', timestamp: Date.now() });
  };

  const handleMasterToggle = (category) => {
    setFlipTrigger(prev => {
      const isSameCat = prev.target === category || prev.target === 'all';
      // Toggle based on last known state or default. 
      // Strategy: If last action was front, go back. 
      const nextAction = (isSameCat && prev.action === 'front') ? 'back' : 'front';
      return { action: nextAction, target: category, timestamp: Date.now() };
    });
  };

  const handleShuffleWithAnimation = (categoryOrAll) => {
    // 1. Flip to Back
    const target = categoryOrAll === 'mix' ? 'all' : categoryOrAll;
    // Trigger back flip
    setFlipTrigger({ action: 'back', target: target, timestamp: Date.now() });

    // 2. Wait for flip (e.g. 600ms), then change data, then flip back
    setTimeout(() => {
      if (categoryOrAll === 'mix') {
        setHand({
          Arc: getRandom(ARC),
          Object: getRandom(OBJECT),
          Terrain: getRandom(TERRAIN),
          Mood: getRandom(MOOD)
        });
      } else {
        setHand(prev => ({
          ...prev,
          [categoryOrAll]: getRandom(DATA[categoryOrAll])
        }));
      }

      // 3. Flip to Front
      // Small delay to ensure state update propagates while back is visible
      setTimeout(() => {
        setFlipTrigger({ action: 'front', target: target, timestamp: Date.now() });
      }, 100);
    }, 600);
  };

  const handleShuffleMix = () => {
    handleShuffleWithAnimation('mix');
  };

  const handleDownloadMix = async () => {
    const { default: html2canvas } = await import('html2canvas');
    const { default: JSZip } = await import('jszip');
    const { saveAs } = await import('file-saver');

    const zip = new JSZip();
    // Container for capturing
    const captureContainer = document.createElement('div');
    Object.assign(captureContainer.style, {
      position: 'fixed', left: '-9999px', top: '0'
    });
    document.body.appendChild(captureContainer);

    // Only capture mix grid cards
    const cardElements = Array.from(document.querySelectorAll('.app-container .mix-grid .card-inner'));

    for (let i = 0; i < cardElements.length; i++) {
      const originalCardInner = cardElements[i];
      // For mix, we just capture what is there, usually front in this context
      const frontFace = originalCardInner.querySelector('.card-front-default');

      if (frontFace) {
        const clone = frontFace.cloneNode(true);
        Object.assign(clone.style, {
          width: '219px', height: '332px', transform: 'none', position: 'static', boxSizing: 'border-box'
        });

        captureContainer.appendChild(clone);
        try {
          const canvas = await html2canvas(clone, { scale: 5, backgroundColor: null, useCORS: true });
          const blob = await new Promise(resolve => canvas.toBlob(resolve));
          const fileName = `Mix_Card_${i + 1}.png`;
          zip.file(fileName, blob);
        } catch (err) {
          console.error("Error capturing mix card " + i, err);
        }
        captureContainer.removeChild(clone);
      }
    }

    document.body.removeChild(captureContainer);
    const content = await zip.generateAsync({ type: "blob" });
    saveAs(content, `Make_Futures_Hand_Print.zip`);
  };

  /* 
     Simplified Download: Static File
     User requested to just download the pre-generated zip file.
  */
  const handleDownloadDeck = () => {
    const link = document.createElement('a');
    link.href = '/Thing_From_Future_Full_Deck.zip';
    link.download = 'Thing_From_Future_Full_Deck.zip';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  /* 
     Dynamic Generation Logic (Hidden Route)
     Triggered ONLY when visiting /generatedownload
     Restored from robust direct-capture version.
  */
  const generateDynamicDeck = async () => {
    if (isDownloadingDeck) return;
    setIsDownloadingDeck(true);
    const initialTab = 'Arc'; // Default, we'll cycle through

    try {
      const { default: html2canvas } = await import('html2canvas');
      const { default: JSZip } = await import('jszip');
      const { saveAs } = await import('file-saver');

      const zip = new JSZip();
      const categories = ['Arc', 'Object', 'Terrain', 'Mood'];

      // Create a hidden container for cloning and capturing
      const captureContainer = document.createElement('div');
      Object.assign(captureContainer.style, {
        position: 'fixed',
        left: '-9999px',
        top: '0',
        width: 'auto',
        height: 'auto',
        zIndex: '-1',
        visibility: 'visible'
      });
      document.body.appendChild(captureContainer);

      for (const cat of categories) {
        setDownloadStatus(`Switching to ${cat}...`);
        setActiveTab(cat);
        // Wait for render
        await new Promise(r => setTimeout(r, 2000));

        const folder = zip.folder(cat);

        // Capture Back (Logo Side)
        setDownloadStatus(`Capturing ${cat} Back (Logo)...`);
        const anyCardContainer = document.querySelector('.card-container:not(.master-card)');

        if (anyCardContainer) {
          const backFace = anyCardContainer.querySelector('.card-back-rotated');
          if (backFace) {
            try {
              const clone = backFace.cloneNode(true);
              Object.assign(clone.style, {
                transform: 'none',
                position: 'relative',
                width: '219px',
                height: '332px',
                display: 'flex'
              });

              const rect = backFace.getBoundingClientRect();
              if (rect.width > 0) {
                clone.style.width = `${rect.width}px`;
                clone.style.height = `${rect.height}px`;
              }

              captureContainer.appendChild(clone);
              const canvas = await html2canvas(clone, { scale: 3, backgroundColor: null, useCORS: true });
              const blob = await new Promise(r => canvas.toBlob(r));
              folder.file('00_Back.png', blob);
              captureContainer.removeChild(clone);
            } catch (e) {
              console.error(`Failed back capture ${cat}`, e);
            }
          }
        }

        // Capture Fronts (Content Side)
        setDownloadStatus(`Capturing ${cat} Content...`);
        const contentCards = Array.from(document.querySelectorAll('.card-container:not(.master-card)'));

        for (let i = 0; i < contentCards.length; i++) {
          setDownloadStatus(`Capturing ${cat} Card ${i + 1}/${contentCards.length}...`);
          await new Promise(r => setTimeout(r, 20));

          const frontFace = contentCards[i].querySelector('.card-front-default');
          if (frontFace) {
            try {
              const clone = frontFace.cloneNode(true);
              Object.assign(clone.style, {
                transform: 'none',
                position: 'relative',
                display: 'flex'
              });

              const rect = frontFace.getBoundingClientRect();
              if (rect.width > 0) {
                clone.style.width = `${rect.width}px`;
                clone.style.height = `${rect.height}px`;
              }

              captureContainer.appendChild(clone);
              const canvas = await html2canvas(clone, { scale: 3, backgroundColor: null, useCORS: true });
              const blob = await new Promise(r => canvas.toBlob(r));
              folder.file(`Card_${i + 1}.png`, blob);
              captureContainer.removeChild(clone);
            } catch (e) {
              console.error(`Failed card capture ${cat} ${i}`, e);
            }
          }
        }
      }

      document.body.removeChild(captureContainer);
      setDownloadStatus('Zipping...');
      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, 'Thing_From_Future_Full_Deck.zip');

    } catch (error) {
      console.error("Failed to generate deck:", error);
      alert("Error generating deck: " + error.message);
    } finally {
      setIsDownloadingDeck(false);
      setDownloadStatus(null);
      // Optional: Redirect back to home after generation?
      // window.location.href = '/'; 
    }
  };

  return (
    <div className="app-container">
      <header>
        <div className="header-row">
          <h1>Thing From The Future of Work</h1>
          <div className="header-controls">
            <Tabs
              activeTab={activeTab}
              onTabChange={setActiveTab}
              colors={COLORS}
            />
          </div >
        </div >

        {/* Control Bar - Sticky below header logic */}
        {activeTab === 'Make Futures' && (
          <div className="control-bar">
            <button className="control-btn primary" onClick={handleShuffleMix}>Shuffle Mix</button>
            <div style={{ width: '20px' }}></div>
            <button className="control-btn" onClick={handleDownloadMix}>Download Mix</button>
          </div>
        )}
      </header >

      <main>
        {activeTab === 'Make Futures' ? (
          <div className="mix-grid">
            {['Arc', 'Object', 'Terrain', 'Mood'].map(cat => (
              hand[cat] && (
                <div key={cat} className="mix-card-wrapper">
                  <CardGrid
                    cards={[hand[cat]]}
                    category={cat}
                    color={COLORS[cat]}
                    flipTrigger={flipTrigger}
                    initialFlipped={false}
                    onShuffle={handleShuffleWithAnimation}
                  />
                </div>
              )
            ))}
          </div>
        ) : (
          <CardGrid
            cards={DATA[activeTab]}
            category={activeTab}
            color={COLORS[activeTab]}
            flipTrigger={flipTrigger}
            initialFlipped={true}
            hasMasterCard={true}
            onShuffle={handleMasterToggle}
          />
        )}
      </main>

      <Footer onDownloadDeck={handleDownloadDeck} />

      {/* Progress Overlay - Only visible during dynamic generation */}
      {downloadStatus && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, width: '100%', height: '100%',
          backgroundColor: 'rgba(0,0,0,0.9)',
          zIndex: 10000,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          color: 'white',
          fontSize: '1.5rem',
          fontFamily: 'Inter, sans-serif',
          pointerEvents: 'all'
        }}>
          <div style={{ marginBottom: '1rem' }}>Generating Deck...</div>
          <div style={{
            fontSize: '1rem',
            opacity: 1,
            fontFamily: 'monospace',
            backgroundColor: '#222',
            padding: '8px 16px',
            borderRadius: '6px',
            border: '1px solid #444',
            boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
          }}>
            {downloadStatus}
          </div>
          <div style={{ marginTop: '2rem', fontSize: '0.9rem', color: '#888', maxWidth: '400px', textAlign: 'center' }}>
            Please do not close this tab or resize the window.
          </div>
        </div>
      )}
    </div >
  );
}

export default App;
