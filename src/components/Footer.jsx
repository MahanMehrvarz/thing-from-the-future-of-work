import React from 'react';

const Footer = ({ onDownloadDeck }) => {
    return (
        <footer className="site-footer">
            <div className="footer-content">
                {/* 0. Global Download Button */}
                {onDownloadDeck && (
                    <div className="footer-section download">
                        <button
                            onClick={onDownloadDeck}
                            style={{
                                padding: '0.8rem 1.5rem',
                                backgroundColor: 'white',
                                color: '#111',
                                border: '1px solid #333',
                                borderRadius: '100px',
                                cursor: 'pointer',
                                fontWeight: 700,
                                fontSize: '0.9rem',
                                marginBottom: '1.5rem'
                            }}
                        >
                            Download Card Deck
                        </button>
                    </div>
                )}

                {/* 1. Source Attribution */}
                <div className="footer-section attribution">
                    <p>
                        Based on <a href="https://www.researchgate.net/publication/364677670_The_Thing_From_The_Future_Print-and-Play_Edition" target="_blank" rel="noopener noreferrer">The Thing From The Future</a> by Situation Lab.
                    </p>
                </div>

                {/* 2. Contact */}
                <div className="footer-section contact">
                    <p>For question and inquiry please contact:</p>
                    <a href="mailto:mahan.mehrvarz@hotmail.com">mahan.mehrvarz@hotmail.com</a>
                </div>


            </div>
        </footer>
    );
};

export default Footer;
