import React from 'react';
import Card from './Card';

const CardGrid = ({ cards, category, color, flipTrigger, initialFlipped = true, onShuffle, hasMasterCard = false }) => {
    return (
        <div className="card-grid">
            {/* Optional Master Card */}
            {hasMasterCard && (
                <Card
                    key="master"
                    category={category}
                    content={{}} // Master doesn't need content
                    color={color}
                    isMaster={true} // New prop
                    onShuffle={onShuffle} // Triggers mass flip
                    flipTrigger={{}} // Master doesn't listen to generic flip triggers usually, or it stays static
                    initialFlipped={false}
                />
            )}

            {cards.map((card, index) => (
                <Card
                    key={index}
                    category={category}
                    content={card} // Used for targeting
                    color={color}
                    flipTrigger={flipTrigger}
                    initialFlipped={initialFlipped}
                    onShuffle={hasMasterCard ? undefined : onShuffle}
                />
            ))}
        </div>
    );
};

export default CardGrid;
