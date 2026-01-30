import React from 'react';
import Card from './Card';

const CardGrid = ({ cards, category, color, flipTrigger, initialFlipped = true, onShuffle }) => {
    return (
        <div className="card-grid">
            {cards.map((card, index) => (
                <Card
                    key={index}
                    category={category} // Used for targeting
                    content={card}
                    color={color}
                    flipTrigger={flipTrigger}
                    initialFlipped={initialFlipped}
                    onShuffle={onShuffle}
                />
            ))}
        </div>
    );
};

export default CardGrid;
