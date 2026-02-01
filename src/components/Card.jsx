import React, { useState, useEffect } from 'react';

const Card = ({ category, content, color, flipTrigger, initialFlipped = true, onShuffle, isMaster, isCapture }) => {
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
        if (isMaster && onShuffle) {
            // Master card click triggers the "Mass Flip" or "Shuffle" logic passed down
            onShuffle(category);
            return;
        }

        if (onShuffle && !isMaster) {
            onShuffle(category);
        } else {
            setIsFlipped(!isFlipped);
        }
    };

    const cardStyle = {
        backgroundColor: color,
    };

    // Simplified Static Render for Capture (No state, no effects, no events)
    if (isCapture) {
        let fText = "";
        let sText = "";
        if (category === "Arc") {
            fText = content?.time || "";
            sText = content?.type || "";
        } else {
            fText = content?.content || "";
        }

        // Visual Logic
        const style = { backgroundColor: color };

        // Return ONLY the visible face based on initialFlipped
        // If initialFlipped is true, we want the BACK face.
        // If false, we want the FRONT face.

        if (initialFlipped) {
            // Back
            return (
                <div className="card-container flipped" style={{ pointerEvents: 'none' }}>
                    <div className="card-inner">
                        <div className="card-face card-back-rotated" style={style}>
                            <div className="circles-grid">
                                {[...Array(12)].map((_, i) => <div key={i} className="circle"></div>)}
                            </div>
                            <div className="card-title-back">
                                THING<br />FROM<br />THE FUTURE<br />OF WORK
                            </div>
                        </div>
                    </div>
                </div>
            );
        } else {
            // Front
            return (
                <div className="card-container" style={{ pointerEvents: 'none' }}>
                    <div className="card-inner">
                        <div className="card-face card-front-default" style={style}>
                            <div className="quote-icon">❝</div>
                            <div className="card-content-quote">
                                {category === "Arc" ? (
                                    <>
                                        <span style={{ opacity: 0.8, fontSize: '0.8em', display: 'block', marginBottom: '10px' }}>{sText}</span>
                                        {fText}
                                    </>
                                ) : (
                                    fText
                                )}
                            </div>
                            <div className="card-footer">
                                <div className="card-type">{category} card</div>
                                <div className="card-category-small">AI Futures Lab</div>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }
    }

    // Master Card Specific Visuals
    if (isMaster) {
        return (
            <div className="card-container master-card" onClick={handleClick}>
                <div className="card-inner">
                    <div className="card-face" style={{
                        ...cardStyle,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        border: '4px solid white', // distinctive border
                        boxSizing: 'border-box'
                    }}>
                        <div style={{ color: 'white', fontSize: '2rem', fontWeight: '900', textTransform: 'uppercase', textAlign: 'center', lineHeight: '1.1', letterSpacing: '0.05em' }}>
                            {category}<br /><span style={{ fontSize: '1.5rem', fontWeight: '700' }}>MASTER</span>
                        </div>
                        <div style={{ position: 'absolute', bottom: '1.5rem', color: 'rgba(255,255,255,0.8)', fontSize: '0.8rem', fontStyle: 'italic', textTransform: 'none' }}>
                            (tap to flip all cards)
                        </div>
                    </div>
                </div>
            </div>
        );
    }

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
