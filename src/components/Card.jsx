import React, { useState, useEffect } from 'react';

const Card = ({ category, content, color, flipTrigger, initialFlipped = true, onShuffle }) => {
    const [isFlipped, setIsFlipped] = useState(initialFlipped);

    useEffect(() => {
        if (flipTrigger && flipTrigger.action) {
            // Check target: if 'all' or matches this card's category
            const isTarget = !flipTrigger.target || flipTrigger.target === 'all' || flipTrigger.target === category;

            if (isTarget) {
                if (flipTrigger.action === 'front') {
                    setIsFlipped(false);
                } else if (flipTrigger.action === 'back') {
                    setIsFlipped(true);
                }
            }
        }
    }, [flipTrigger, category]);

    const handleClick = () => {
        if (onShuffle) {
            onShuffle(category);
        } else {
            setIsFlipped(!isFlipped);
        }
    };

    const cardStyle = {
        backgroundColor: color,
    };

    // Content formatting
    let frontText = "";
    let subText = "";

    if (category === "Arc") {
        frontText = content.time;
        subText = content.type;
    } else {
        frontText = content.content;
    }

    return (
        <div
            className={`card-container ${isFlipped ? 'flipped' : ''}`}
            onClick={handleClick}
        >
            <div className="card-inner">
                {/* FRONT FACE (Default visible): Content Side */}
                <div className="card-face card-front-default" style={cardStyle}>
                    <div className="quote-icon">❝</div>
                    <div className="card-content-quote">
                        {category === "Arc" ? (
                            <>
                                <span style={{ opacity: 0.8, fontSize: '0.8em', display: 'block', marginBottom: '10px' }}>{subText}</span>
                                {frontText}
                            </>
                        ) : (
                            frontText
                        )}
                    </div>

                    <div className="card-footer">
                        <div className="card-type">{category} card</div>
                        <div className="card-category-small">AI Futures Lab</div>
                    </div>
                </div>

                {/* BACK FACE (Hidden initially): Deck Design / Circles */}
                <div className="card-face card-back-rotated" style={cardStyle}>
                    <div className="circles-grid">
                        {[...Array(12)].map((_, i) => (
                            <div key={i} className="circle"></div>
                        ))}
                    </div>
                    <div className="card-title-back">
                        THING<br />FROM<br />THE FUTURE<br />OF WORK
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Card;
