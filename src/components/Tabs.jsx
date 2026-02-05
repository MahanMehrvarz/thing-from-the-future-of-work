import React from 'react';

const tabs = [
    { id: 'Arc', label: 'Arc' },
    { id: 'Object', label: 'Object' },
    { id: 'Terrain', label: 'Terrain' },
    { id: 'Mood', label: 'Mood' },
    { id: 'Make Futures', label: 'Make Futures' }
];

const Tabs = ({ activeTab, onTabChange, colors }) => {
    return (
        <div className="tabs">
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
                    onClick={() => onTabChange(tab.id)}
                    style={{
                        backgroundColor: activeTab === tab.id ? colors[tab.id] : 'white',
                        borderColor: colors[tab.id],
                        color: activeTab === tab.id ? 'white' : colors[tab.id]
                    }}
                >
                    {tab.label}
                </button>
            ))}
        </div>
    );
};

export default Tabs;
