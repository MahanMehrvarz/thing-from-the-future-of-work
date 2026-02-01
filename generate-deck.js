
import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import JSZip from 'jszip';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Hardcode absolute path to ensure no relative path confusion
const PUBLIC_DIR = '/Users/mmehrvarz/Library/CloudStorage/OneDrive-DelftUniversityofTechnology/00-CODE/things from the future of work/public';
const OUTPUT_ZIP = path.join(PUBLIC_DIR, 'Thing_From_Future_Full_Deck.zip');

console.log(`Writing ZIP to: ${OUTPUT_ZIP}`);

// Ensure public dir exists
if (!fs.existsSync(PUBLIC_DIR)) {
    fs.mkdirSync(PUBLIC_DIR, { recursive: true });
}

// Categories to capture
const CATEGORIES = ['Arc', 'Terrain', 'Object', 'Mood'];

(async () => {
    console.log('Launching browser...');
    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        defaultViewport: { width: 1920, height: 1080 }
    });

    // Create Zip instance
    const zip = new JSZip();

    try {
        const page = await browser.newPage();

        // Listen to console logs
        page.on('console', msg => console.log('BROWSER LOG:', msg.text()));


        // Navigate to running app. Change port if needed.
        // Navigate to running app with capture param to force render
        const url = 'http://localhost:5173/?capture=true';
        console.log(`Navigating to ${url}...`);
        await page.goto(url, { waitUntil: 'networkidle0' });

        // Trigger deck render is handled by App.jsx useEffect via URL param.
        // We just need to wait for the container.

        console.log('Waiting for deck rendering...');
        try {
            // Wait for the hidden container to appear
            await page.waitForSelector('#full-deck-capture-container', { hidden: false, visible: false, timeout: 55000 });
        } catch (e) {
            console.error("Timeout waiting for #full-deck-capture-container");
            const html = await page.content();
            console.log("PAGE HTML DUMP:", html.substring(0, 2000) + "..."); // Log first 2000 chars
            throw e;
        }
        // Give it a moment to fully render
        await new Promise(r => setTimeout(r, 2000));

        console.log('Capturing cards...');

        // Helper to screenshot an element
        const captureElement = async (selector, filename) => {
            const element = await page.$(selector);
            if (element) {
                // Ensure element is visible/renderable for screenshot regardless of visibility: hidden check.
                // Since it's fixed off-screen (-9999px), Puppeteer might complain or capture blank.
                // We need to move it into view or clone it.
                // Actually, just capturing the element handle usually works even if off-screen, 
                // BUT better to ensure it's "visible" in the viewport or styled such that screenshot works.
                // The current style has it at -9999px. 

                // Let's modify the element style to be visible for the screenshot moment?
                // Or better: Clone node to body, screenshot, remove.

                const buffer = await element.screenshot({ omitBackground: true });
                return buffer;
            }
            return null;
        };

        // We will iterate through categories
        for (const cat of CATEGORIES) {
            const folder = zip.folder(cat);
            console.log(`Processing ${cat}...`);

            // 1. Back
            // Selector from App.jsx: .capture-back-{cat} .card-back-rotated
            // BUT: The container is off-screen. Puppeteer screenshot might fail if not in viewport.
            // WORKAROUND: We will iterate elements, clone them to a visible lightbox area, screenshot, then delete.

            await page.evaluate((category) => {
                window.currentCategory = category;
            }, cat);

            // Get count of fronts
            const frontCount = await page.evaluate((c) => {
                return document.querySelectorAll(`.capture-front-${c}`).length;
            }, cat);

            // Capture Back
            const backBuffer = await elementScreenshot(page, `.capture-back-${cat} .card-back-rotated`);
            if (backBuffer) {
                folder.file('00_Back.png', backBuffer);
            }

            // Capture Fronts
            for (let i = 0; i < frontCount; i++) {
                // The selector is a bit complex since we are iterating. 
                // Let's find the specific element.
                // The structure is .capture-front-{cat} (which is a wrapper) -> .card-front-default
                // But there are multiple .capture-front-{cat} divs.

                // We passed index in render: key={`front-${cat}-${idx}`} 
                // But keys aren't in DOM.
                // We can use querySelectorAll's index.

                const frontBuffer = await elementScreenshot(page, `.capture-front-${cat}:nth-of-type(${i + 1}) .card-front-default`);
                if (frontBuffer) {
                    folder.file(`Card_${i + 1}.png`, frontBuffer);
                }
            }
        }

        console.log('Generating ZIP...');
        const content = await zip.generateAsync({ type: 'nodebuffer' });
        fs.writeFileSync(OUTPUT_ZIP, content);
        console.log(`Success! Zip saved to ${OUTPUT_ZIP}`);

    } catch (e) {
        console.error('Error:', e);
    } finally {
        await browser.close();
    }
})();

// Improved screenshot helper that clones element to viewport
async function elementScreenshot(page, originalSelector) {
    return await page.evaluate(async (selector) => {
        const el = document.querySelector(selector);
        if (!el) return null;

        // Clone
        const clone = el.cloneNode(true);
        // Style to be isolated and visible
        Object.assign(clone.style, {
            position: 'fixed',
            top: '0',
            left: '0',
            zIndex: '10000',
            transform: 'none', // Remove any rotation if needed for flat capture, or keep it. 
            // The originals might have transforms.
            // If we want "flat" image:
            // For decks, we usually want the card image as printed.
            // Our current CSS uses 3D transforms. 
            // If we remove transform, we might lose the "back" rotation if it relied on it?
            // Actually, Card Back has `rotateY(180deg)` usually. 
            // If we want the *image* of the back, we need it to be face up for the camera.
            // Removing transform `rotateY` from back might show the front?
            // Wait, existing logic in handleDownloadDeck removed transforms.
            // Let's replicate that:
            // "transform: 'none'"
            width: '219px',
            height: '332px'
        });

        // If it's the "back" face, it's naturally 180deg rotated in CSS. 
        // If we set transform: none, does it show the back texture?
        // In `Card.jsx`, `card-back-rotated` has `transform: rotateY(180deg)`.
        // If we remove that, it faces "Front" direction. 
        // BUT the content IS the back content. So yes, we want transform: none to see it flat on screen.

        document.body.appendChild(clone);

        // Wait a frame
        await new Promise(r => requestAnimationFrame(r));

        // Return null here, we just need to return the FACT that we prepared it.
        // Actually we need to screenshot it from node side.
        // So we assign an ID to capture
        clone.id = 'temp-capture-target';

        return true; // Signal ready
    }, originalSelector).then(async (ready) => {
        if (!ready) return null;

        const target = await page.$('#temp-capture-target');
        const buffer = await target.screenshot({ omitBackground: true });

        // Cleanup
        await page.evaluate(() => {
            const el = document.getElementById('temp-capture-target');
            if (el) el.remove();
        });

        return buffer;
    });
}
