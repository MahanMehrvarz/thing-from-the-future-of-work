import React, { useState } from 'react';
import './App.css';
import Tabs from './components/Tabs';
import CardGrid from './components/CardGrid';
import { ARC, TERRAIN, OBJECT, MOOD } from './data/cards';

// Helper to pick random item
const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

const COLORS = {
  Arc: '#E53935',
  Terrain: '#43A047',
  Object: '#1E88E5',
  Mood: '#FB8C00',
  'Make Futures': '#222'
};

const DATA = {
  Arc: ARC,
  Terrain: TERRAIN,
  Object: OBJECT,
  Mood: MOOD
};

function App() {
  const [activeTab, setActiveTab] = useState('Arc');
  const [flipTrigger, setFlipTrigger] = useState({ action: null, timestamp: 0 });

  // State for the Mixed Hand
  const [hand, setHand] = useState({
    Arc: null,
    Terrain: null,
    Object: null,
    Mood: null
  });

  // Initialize hand once on mount
  React.useEffect(() => {
    setHand({
      Arc: getRandom(ARC),
      Terrain: getRandom(TERRAIN),
      Object: getRandom(OBJECT),
      Mood: getRandom(MOOD)
    });
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
          Terrain: getRandom(TERRAIN),
          Object: getRandom(OBJECT),
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

  return (
    <div className="app-container">
      <header>
        <div className="header-row">
          <h1>Thing from the future of work</h1>
          <div className="controls-container">
            <Tabs
              activeTab={activeTab}
              onTabChange={setActiveTab}
              colors={COLORS}
            />
            {/* Global Download Button - Static Download */}
            <button
              className="tab-button"
              onClick={handleDownloadDeck}
              style={{
                whiteSpace: 'nowrap',
                marginLeft: '1rem',
                borderColor: '#333',
                color: '#333',
                cursor: 'pointer',
                fontWeight: 700
              }}
            >
              Download Card Deck
            </button>
          </div >
        </div >
      </header >

      <div className="control-bar">
        {activeTab === 'Make Futures' ? (
          <>
            <button className="control-btn primary" onClick={handleShuffleMix}>Shuffle Mix</button>
            <div style={{ width: '20px' }}></div>
            <button className="control-btn" onClick={handleDownloadMix}>Download Mix</button>
          </>
        ) : (
          <>
            {/* Legacy buttons removed. Master Card controls flipping now. */}
            <div style={{ color: '#999', fontSize: '0.9rem', fontStyle: 'italic' }}>
              Click the Master Card (first card) to flip all cards.
            </div>
          </>
        )}
      </div>

      <main>
        {activeTab === 'Make Futures' ? (
          <div className="mix-grid">
            {['Arc', 'Terrain', 'Object', 'Mood'].map(cat => (
              hand[cat] && (
                <div key={cat} className="mix-card-wrapper">
                  {/* Pass onShuffle to enable click-to-shuffle-animation */}
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
            hasMasterCard={true} // Enable Master Card
            onShuffle={handleMasterToggle} // Master Card click handler
          />
        )}
      </main>

      {/* Footer removed as requested */}
    </div >
  );
}

export default App;
