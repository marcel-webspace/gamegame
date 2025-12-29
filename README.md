# 🎉 Bachelor Silvester Pro

Das ultimative Multiplayer Trinkspiel für Silvester!

## Features

- 🎮 **Multiplayer Lobby** - Erstelle Räume und spiele mit Freunden
- 📱 **Mobile-First** - Optimiert für Smartphones mit Vibration
- 🥏 **10 Minigames** - Frisbee Fangen + 9 weitere (coming soon)
- 🍺 **Betrunkenen-freundlich** - Große Buttons, warme Farben

## 🚀 Deployment auf Vercel

### Option 1: Ein-Klick Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/DEIN-USERNAME/bachelor-silvester-pro)

### Option 2: Manuelles Setup

1. **Repository auf GitHub erstellen:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/DEIN-USERNAME/bachelor-silvester-pro.git
   git push -u origin main
   ```

2. **Mit Vercel verbinden:**
   - Gehe zu [vercel.com](https://vercel.com)
   - Klicke "Add New Project"
   - Importiere dein GitHub Repository
   - Klicke "Deploy"

3. **Fertig!** 🎊
   - Deine App ist jetzt live unter `https://bachelor-silvester-pro.vercel.app`

## 🎮 Spielanleitung

1. **Raum erstellen:** Gib deinen Namen ein und erstelle einen Raum
2. **Code teilen:** Teile den 6-stelligen Code mit deinen Freunden
3. **Beitreten:** Freunde geben den Code ein und treten bei
4. **Spielen:** Host wählt ein Minigame aus - alle Handys in die Mitte!

## 🥏 Frisbee Fangen

- Legt eure Handys nebeneinander auf den Tisch
- Swipe nach oben um das Frisbee zu werfen
- Das Frisbee fliegt zum nächsten Spieler
- Wer nicht fängt, trinkt! 🍺

## 📱 Lokale Entwicklung

```bash
# Dependencies installieren
npm install

# Development Server starten
npm run dev

# Öffne http://localhost:3000
```

## 🔧 Technologie

- **Next.js 14** - React Framework
- **BroadcastChannel API** - Same-origin Multiplayer
- **CSS Modules** - Styling
- **Vibration API** - Haptisches Feedback

## ⚠️ Hinweis

Multiplayer funktioniert nur wenn alle Spieler:
- Die **gleiche URL** verwenden (z.B. `bachelor-silvester-pro.vercel.app`)
- Im **gleichen Browser-Tab/Fenster** sind (oder mehrere Tabs auf einem Gerät zum Testen)

Für echtes Cross-Device Multiplayer wäre ein WebSocket-Server nötig.

---

🍾 Prost und guten Rutsch! 🥂
