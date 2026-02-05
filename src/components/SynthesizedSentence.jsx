import React from 'react';

const SynthesizedSentence = ({ hand, colors }) => {
    // Helper to get text content safely
    const getText = (category) => {
        const card = hand[category];
        if (!card) return '...';

        // For Arc, we use the 'type' (e.g. Growth, Collapse)
        // For others, we use the 'content' string
        if (category === 'Arc') {
            return card.type;
        }
        return card.content;
    };

    const renderSpan = (category, prefix = '', suffix = '') => {
        const text = getText(category);
        const color = colors[category];

        return (
            <span key={`${category}-${text}`} className="sentence-highlight" style={{ color: color }}>
                {text}
            </span>
        );
    };

    return (
        <div className="synthesized-sentence-container">
            <p className="synthesized-sentence">
                In a {renderSpan('Arc')} future there is an {renderSpan('Object')} related to {renderSpan('Terrain')} that inspires {renderSpan('Mood')}.
                <br />
                <span className="sentence-prompt">What is it?</span>
            </p>
        </div>
    );
};

export default SynthesizedSentence;
