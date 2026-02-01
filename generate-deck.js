import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function generateDeck() {
    console.log('Launching browser...');
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    // Set download behavior
    const client = await page.createCDPSession();
    const downloadPath = path.resolve(__dirname, 'temp_downloads');
    if (!fs.existsSync(downloadPath)) {
        fs.mkdirSync(downloadPath);
    }

    await client.send('Page.setDownloadBehavior', {
        behavior: 'allow',
        downloadPath: downloadPath,
    });

    console.log('Navigating to generation route...');
    // Ensure we wait long enough for generation
    try {
        await page.goto('http://localhost:5173/generatedownload', { waitUntil: 'networkidle0', timeout: 60000 });
    } catch (e) {
        console.log('Navigation timeout or error, continuing to wait for download...');
    }

    console.log('Waiting for download...');
    // Wait for file to appear
    const filename = 'Thing_From_Future_Full_Deck.zip';
    const filePath = path.join(downloadPath, filename);

    // Poll for file existence
    let retries = 60; // 60 seconds
    while (retries > 0) {
        if (fs.existsSync(filePath)) {
            // Check if size is stable (download finished)
            const size1 = fs.statSync(filePath).size;
            await new Promise(r => setTimeout(r, 1000));
            const size2 = fs.statSync(filePath).size;

            if (size1 === size2 && size1 > 0) {
                console.log(`Download complete! Size: ${size1} bytes`);
                break;
            }
        } else {
            await new Promise(r => setTimeout(r, 1000));
            retries--;
            if (retries % 5 === 0) process.stdout.write('.');
        }
    }

    if (fs.existsSync(filePath)) {
        const publicPath = path.resolve(__dirname, 'public', filename);
        console.log(`Moving file to ${publicPath}...`);
        fs.copyFileSync(filePath, publicPath);
        console.log('Success: Static asset updated.');
    } else {
        console.error('Error: File download timed out.');
        process.exit(1);
    }

    await browser.close();
    // Cleanup temp
    fs.rmSync(downloadPath, { recursive: true, force: true });
}

generateDeck();
