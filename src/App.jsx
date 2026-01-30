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

  const handleDownload = async () => {
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

    const cardElements = Array.from(document.querySelectorAll('.card-inner'));
    // console.log("Capturing " + cardElements.length + " cards");

    for (let i = 0; i < cardElements.length; i++) {
      const originalCardInner = cardElements[i];
      const isFlipped = originalCardInner.parentElement.classList.contains('flipped');

      // In Make Futures, we default to Face Up (not flipped).
      // If the user just clicked shuffle, it flips back then front.
      // Assuming download happens when cards are stable.

      const selector = isFlipped ? '.card-back-rotated' : '.card-front-default';
      const faceToCapture = originalCardInner.querySelector(selector);

      if (faceToCapture) {
        const clone = faceToCapture.cloneNode(true);
        Object.assign(clone.style, {
          width: '219px', height: '332px', transform: 'none', position: 'static', boxSizing: 'border-box'
        });

        // Force Desktop Styles on Children to avoid mobile scaling
        // 1. Padding
        if (clone.classList.contains('card-front-default') || clone.classList.contains('card-back-rotated')) {
          clone.style.padding = '1.5rem';
        }

        // 2. Font Sizes & Spacing
        const quote = clone.querySelector('.card-content-quote');
        if (quote) {
          quote.style.fontSize = '2.1rem'; // Updated to match new CSS
          quote.style.lineHeight = '1.1';
        }

        const titleBack = clone.querySelector('.card-title-back');
        if (titleBack) {
          titleBack.style.fontSize = '2rem';
        }

        const typeLabel = clone.querySelector('.card-type');
        if (typeLabel) {
          typeLabel.style.fontSize = '1.2rem';
        }

        const catLabel = clone.querySelector('.card-category-small');
        if (catLabel) {
          catLabel.style.fontSize = '0.8rem';
        }

        const circlesGrid = clone.querySelector('.circles-grid');
        if (circlesGrid) {
          circlesGrid.style.gap = '8px';
        }

        const circles = clone.querySelectorAll('.circle');
        circles.forEach(c => c.style.borderWidth = '4px');

        captureContainer.appendChild(clone);
        try {
          const canvas = await html2canvas(clone, { scale: 2, backgroundColor: null, useCORS: true });
          const blob = await new Promise(resolve => canvas.toBlob(resolve));
          const fileName = `${activeTab}_card_${i + 1}.png`;
          zip.file(fileName, blob);
        } catch (err) {
          console.error("Error capturing card " + i, err);
        }
        captureContainer.removeChild(clone);
      }
    }
    document.body.removeChild(captureContainer);
    const content = await zip.generateAsync({ type: "blob" });
    saveAs(content, `${activeTab}_Deck.zip`);
  };

  return (
    <div className="app-container">
      <header>
        <div className="header-row">
          <h1>Thing from the future of work</h1>
          <Tabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            colors={COLORS}
          />
        </div>
      </header>

      <div className="control-bar">
        {activeTab === 'Make Futures' ? (
          <>
            <button className="control-btn primary" onClick={handleShuffleMix}>Shuffle Mix</button>
            <div style={{ width: '20px' }}></div>
            <button className="control-btn" onClick={handleDownload}>Download Mix</button>
          </>
        ) : (
          <>
            <button className="control-btn" onClick={() => handleFlipAll('front')}>Show All Content</button>
            <button className="control-btn" onClick={() => handleFlipAll('back')}>Show All Backs</button>
            <div style={{ width: '20px' }}></div>
            <button className="control-btn primary" onClick={handleDownload}>Download {activeTab}</button>
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
          />
        )}
      </main>

      {/* Footer removed as requested */}
    </div>
  );
}

export default App;
