# Setting up your wedding website

This guide gets three things working:

- **Part A:** RSVPs saved into a Google Sheet.
- **Part B:** putting the site online for free with Netlify.
- **Part C:** filling in your details.

You don't need any coding knowledge. Set aside about 20 minutes.

## What's in the folder

| File | What it is |
|---|---|
| `index.html` | The whole website. Your settings (the `CONFIG` section) are near the bottom of this file. |
| `img/groom.png`, `img/bride.png` | Your two characters. |
| `img/bg.jpg`, `img/bg-desktop.jpg` | The painted meadow backgrounds behind the whole site (compressed): the tall one for phones, the wide one for screens wider than 900px. |
| `img/dress-capybara.png`, `img/dress-leopard.png`, `img/dress-flamingo.png`, `img/dress-zebra.png` | The four dress code examples in "What should I wear?". |
| `img/champagne-tower.png` | The champagne pour in "Wedding programme" (compressed; the original is in `img/originals/`). |
| `img/icon-cocktail.png`, `icon-chair.png`, `icon-rings.png`, `icon-cutlery.png`, `icon-moon.png` | The watercolour icons beside each time in "Wedding programme". |
| `img/banner.webp` / `.png` | The watercolour ribbon behind every section heading (the heading text shrinks to fit it). |
| `img/heart-frames.webp` / `.png`, `img/heart-knot.png` | The two heart frames in "Our story" (and the little string heart that pulses). |
| `img/childhood-joshua.jpg`, `img/childhood-rochelle.jpg` | *(you add these)* Your childhood photos, shown inside the two hearts. Square or portrait, faces centred, under 250KB. A missing photo shows a soft cream fill. |
| `img/icon-resort.png` | *(optional)* A watercolour illustration of the resort, shown above the venue name in "The venue" (about 120px wide). Nothing shows there until you add it. |
| `img/boy-kneel.png`, `img/girl-heart.png` | The proposal scene at the top of the invite (he kneels with the ring, she holds a heart). |
| `img/boy-kneel-closed.png` | *(optional)* The kneeling drawing with the ring box **closed**. If you add it, the box opening becomes a crossfade between your two drawings instead of the drawn-on lid. |
| `img/card-*.webp` / `.png` | The illustrated playing-card artwork for "Our story" (J giraffe, Q red panda, K leopard, A flamingo, and the card back). WebP is used; the PNGs are a fallback for very old browsers. Originals are in `img/originals/`. |
| `img/story-1.jpg` … `img/story-6.jpg` | *(you add these)* Photos that show through each card's window. See Part D. |
| `img/originals/` | Full-quality copies of the artwork (backgrounds, cards, banner, heart frames, icons), kept as a backup. |
| `og-image.png` | The picture people see when you share the link on WhatsApp. |
| `apps-script/Code.gs` | The small Google script that saves RSVPs into your Sheet. |
| `SETUP.md` | This guide. |

**How to edit `index.html`:** open it in a plain text editor. On Mac use **TextEdit** (first go to *Format → Make Plain Text*). On Windows use **Notepad**. You can also use the free [VS Code](https://code.visualstudio.com/). Don't use Word, because it adds hidden formatting. To find the settings, press **Ctrl+F** (Windows) or **Cmd+F** (Mac) and search for `const CONFIG`.

---

## Part A: Save RSVPs to a Google Sheet

### 1. Create the Sheet
1. Go to [sheets.google.com](https://sheets.google.com) and click **Blank spreadsheet** (the big **+**).
2. Click "Untitled spreadsheet" at the top left and rename it, e.g. **Wedding RSVPs**.

### 2. Add the script
1. In the Sheet's top menu, click **Extensions → Apps Script**. A new tab opens with a code editor.
2. You'll see a file called `Code.gs` containing `function myFunction() { }`. Click inside it, press **Ctrl+A** (Mac: **Cmd+A**), and delete everything.
3. Open `apps-script/Code.gs` from this folder in your text editor. Select all of it, copy it, and paste it into the Apps Script editor.
4. Click the **💾 Save** icon (or press Ctrl+S / Cmd+S).
5. Optional: click "Untitled project" at the top and name it **Wedding RSVP**.

### 3. Run setup once (this creates the tabs and asks for permission)
1. In the toolbar, there's a dropdown next to **▷ Run** and **Debug**. Pick **setup** from it.
2. Click **▷ Run**.
3. A box says **"Authorisation required"**. Click **Review permissions**, then choose your Google account.
4. You'll probably see **"Google hasn't verified this app"**. That's normal, because it's your own script. Click **Advanced**, then **Go to Wedding RSVP (unsafe)**.
5. Click **Allow**.
6. Go back to your Sheet tab. You should now see two new tabs at the bottom, **RSVPs** (with a green header row) and **Summary**.

### 4. Publish it as a web app
1. Back in the Apps Script tab, click the blue **Deploy** button (top right), then **New deployment**.
2. Next to "Select type", click the **⚙️ gear** icon and choose **Web app**.
3. Fill in:
   - **Description:** `RSVP form`
   - **Execute as:** **Me** (your email)
   - **Who has access:** **Anyone** ← important, or guests' RSVPs will fail
4. Click **Deploy**. If it asks you to authorise again, repeat step 3.3 to 3.5.
5. Copy the **Web app URL**. It looks like `https://script.google.com/macros/s/AKfy.../exec`.
6. Optional test: paste that URL into a new browser tab. You should see `{"ok":true,"message":"RSVP endpoint is working"}`.

### 5. Connect it to the website
1. Open `index.html` in your text editor and search for `sheetUrl`.
2. Paste the URL between the quotes, like this:
   ```js
   sheetUrl: "https://script.google.com/macros/s/AKfy.../exec",
   ```
3. Save the file.

### 6. If you ever change the script later (redeploy, same URL)
Whenever `apps-script/Code.gs` changes, paste the new code in and update the **existing** deployment. That way the URL stays the same and you don't have to change the website.
1. In Apps Script, select everything in `Code.gs`, delete it, paste in the new `apps-script/Code.gs`, and click **💾 Save**.
2. Click **Deploy → Manage deployments**.
3. Select your "RSVP form" deployment and click the **✏️ pencil (Edit)** icon.
4. Under **Version**, choose **New version**.
5. Click **Deploy**.

(If you click "New deployment" instead, you'll get a *new* URL and would have to paste it into `index.html` again.)

> **If you set up the Sheet before 18 Nov 2026:** paste in the latest `apps-script/Code.gs` and redeploy (the 5 steps above). It saves the song request, and saves the RSVP stay choice as text ("No thanks", "Resort room" or "Glamping tent") instead of Yes/No. If your RSVPs tab already has a header row, a **Song request** column is added at the far right, so older rows stay exactly as they are. If you haven't set up the Sheet yet, just use the latest file and there's nothing extra to do.

### Reading your RSVPs
- **RSVPs tab:** one row per reply, newest at the bottom, with the time in Singapore time.
- **Summary tab:** a live count of people attending, plus ones, children, the **total guests** figure, how many want a resort room and how many a glamping tent, how many singles opted in, and a list of everyone's dietary needs.
- If someone RSVPs twice (for example to change their answer), you'll see two rows. Just use the latest one and delete the older row.

---

## Part B: Put the site online with Netlify (free)

### First time
1. Make sure your folder contains `index.html`, `og-image.png` and the `img` folder, side by side.
2. Go to [app.netlify.com/drop](https://app.netlify.com/drop).
3. Drag the **whole folder** (not just `index.html`) onto the page. After a few seconds you'll get a random address like `jolly-cupcake-12345.netlify.app`.
4. To keep the site (otherwise it expires after about an hour), sign up for a free Netlify account. "Sign up with Google" is easiest. Follow the prompt to claim the site.
5. Rename the address: in Netlify, open your site and go to **Site configuration → Site details → Change site name**. Type `joshua-rochelle` and save. Your site is now at **https://joshua-rochelle.netlify.app**.
   - If that name is taken, pick another, e.g. `joshua-and-rochelle`. Then open `index.html`, search for `joshua-rochelle.netlify.app`, and change **both** places to your new address, so the WhatsApp preview picture works. Re-upload afterwards (see below).

### Updating the site later
1. Make your changes to the files on your computer.
2. In Netlify, open your site and click the **Deploys** tab.
3. Drag the whole folder onto the box that says **"Drag and drop your project folder here"**.
4. Within a few seconds the live site updates. The address stays the same.

### Checking the WhatsApp preview
Send the link to yourself on WhatsApp. You should see the couple picture, "Joshua & Rochelle · 17.07.2027" and "You're invited! Tap to open our invitation". WhatsApp remembers previews, so if you shared the link *before* the picture was set up, add `?v=2` to the end of the link to get a fresh preview.

### Optional: your own domain (e.g. joshuaandrochelle.com)
1. Buy the domain from any registrar (Namecheap, GoDaddy, Cloudflare, or directly in Netlify).
2. In Netlify go to **Domain management → Add a domain** and follow the steps. Netlify tells you exactly which DNS records to add at your registrar, or you can buy the domain through Netlify and it's automatic.
3. HTTPS (the padlock) is set up for free automatically.
4. Change the two `joshua-rochelle.netlify.app` addresses in `index.html` to your new domain and re-upload.

---

## Part C: Your to-do checklist

Open `index.html`, search for `const CONFIG`, and fill in or check each line. Keep the quotes `"..."` around every value.

- [ ] **`sheetUrl`**: your Google Apps Script web app URL (Part A, step 4).
- [ ] **`whatsapp`**: the number for the backup "Send on WhatsApp" button, country code first with no + or spaces, e.g. `"6591234567"`.
- [ ] **`rsvpBy`**: your RSVP deadline (currently `"17 March 2027"`). It shows above the form and in the FAQ.
- [ ] **`dressCode`**: the animal-themed dress code line above the four example characters.
- [ ] **`contactPerson`** (and optionally **`contactNumber`**): who guests should message with questions or changes.
- [ ] **`kids`**: your children policy.
- [ ] **`photos`** and **`hashtag`**: your photo wording and wedding hashtag, e.g. `"#AbsoLEEwed"`.
- [ ] **`parkingNote`** (optional): e.g. whether you'll validate parking.
- [ ] **`venueRoom`**: the ballroom name and level, e.g. `"Meranti Ballroom"` (shown in bold under "The venue").
- [ ] **`stay`**: who guests contact about resort rooms (Joshua) and glamping (Rochelle). Add a WhatsApp number to either and the name becomes a chat link.
- [ ] Re-check the **bus timings** in the "Getting there" section closer to the day.

- [ ] Add the four **story photos**, and write the story card text in **`CONFIG.story`** (Part D).

Then do a final test on your phone:
1. Open the live link from WhatsApp.
2. Solve the maze.
3. Send a test RSVP and check that it appears in your Sheet.
4. Delete the test row before you send the link to guests.

---

## Part D: Your photos and story cards

Until you add photos, the site shows soft cream placeholders, so nothing looks broken.

**"Our story" flip cards**

| Card | Photo | Title | Frame |
|---|---|---|---|
| 1 | `img/story-1.jpg` | first few dates | J giraffe |
| 2 | `img/story-2.jpg` | officially dating | Q red panda |
| 3 | `img/story-3.jpg` | first overseas trip | J giraffe |
| 4 | `img/story-4.jpg` | first Disneyland trip | Q red panda |
| 5 | `img/story-5.jpg` | the proposal | K leopard |
| 6 | `img/story-6.jpg` | pre-wedding shoot | A flamingo |

- Portrait photos work best (the card window is slightly taller than wide). Faces in the upper-middle look best. On iPhone: Photos → Edit → Crop → the aspect icon → **4:5**.
- Keep each photo under **250KB** so the page loads fast on mobile data. Easiest: send them to me and I'll crop and compress them. Or use [squoosh.app](https://squoosh.app) (MozJPEG, quality about 75).
- The words on the back of each card live in `index.html`: search for `story:` inside `CONFIG`. For each card, change `date` (e.g. `"2019"`) and `text` (one or two short lines, around 20 words, so it fits on the small cards on computers). Remove the `[square-bracket]` placeholder notes. You can change `title` too.
- Each card's artwork is set by `frame` (e.g. `"card-j-giraffe"`), so you can swap frames later. The back shows up to **4 lines** of story, so keep each `text` to about 15 words; longer text is cut off with "…" on phones.

Re-upload the folder to Netlify afterwards (Part B, "Updating the site later").
