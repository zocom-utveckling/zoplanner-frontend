# zoplanner
Frontend för ZoPlanner


## 1. Installationsguide - kontribuering

### Du behöver ha:
- Node.js v24.11.1 (LTS) | [ladda ner](https://nodejs.org/en/download)
- NPM eller en annan package manager (npm ingår i installationen av Node.js om man inte väljer bort det)



### Installation
1. Klona repo:t
```bash
git clone https://github.com/zocom-utveckling/zoplanner-frontend.git
```
2. Navigera in till projektet
```bash
cd zoplanner-frontend
```
3. Installera dependencies
```bash
npm install
```

4. Klar! Om allt har gått som det ska borde du kunna starta applikationen med följande kommando
```bash
npm run dev
```

## 2. Installationsguide - Docker

### Du behöver ha:
- Docker Desktop

### Installation
1. Klona repo:t
```bash
git clone https://github.com/zocom-utveckling/zoplanner-frontend.git
```
2. Navigera in till projektet
```bash
cd zoplanner-frontend
```
3. Bygg docker image:n
```bash
docker build . -t "zoplanner-frontend"
```

4. För att starta applikationen i Docker skriver du följande kommando i din dators terminal:
```bash
docker run -p 3000:3000 zoplanner-frontend
```
<sup>*Detta kommer att starta en webbserver på port 3000*.</sup>

5. För att se att allting funkar som det ska så kan du besöka http://localhost:3000 i din webbläsare
