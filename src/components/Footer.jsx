import React from 'react';

const Footer = () => {
    return (
        <footer className="site-footer">
            <div className="footer-content">
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
