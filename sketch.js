<!DOCTYPE html>
<html lang="zh-TW">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>p5.js 精靈角色動畫控制器 (Sprite Controller)</title>
  
  <!-- p5.js 核心庫 -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.9.0/p5.min.js"></script>
  <!-- Tailwind CSS 樣式庫 -->
  <script src="https://cdn.tailwindcss.com"></script>
  <!-- FontAwesome 圖示庫 -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  
  <style>
    /* 防止流動裝置選擇文字與捲動 */
    body, html {
      margin: 0;
      padding: 0;
      width: 100%;
      height: 100%;
      overflow: hidden;
      background-color: #0f172a;
      font-family: 'PingFang TC', 'Microsoft JhengHei', sans-serif;
      user-select: none;
      -webkit-user-select: none;
      touch-action: manipulation;
    }
    
    /* 畫布容器樣式 */
    #canvas-container {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 1;
    }

    /* 街機光暈效果 */
    .arcade-glow {
      box-shadow: 0 0 20px rgba(144, 224, 239, 0.3), inset 0 0 15px rgba(144, 224, 239, 0.15);
    }
    
    .btn-arcade {
      background: linear-gradient(145deg, #1e293b, #0f172a);
      border: 2px solid #38bdf8;
      box-shadow: 0 4px 0 #0284c7, 0 0 12px rgba(56, 189, 248, 0.3);
      transition: all 0.08s ease;
    }
    
    .btn-arcade:active, .btn-arcade.active {
      transform: translateY(3px);
      box-shadow: 0 1px 0 #0284c7, 0 0 18px rgba(56, 189, 248, 0.7);
      background: #0284c7;
      color: #ffffff;
    }

    /* 程式碼檢視視窗動畫 */
    .drawer-transition {
      transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    /* 自訂捲軸 */
    ::-webkit-scrollbar {
      width: 8px;
      height: 8px;
    }
    ::-webkit-scrollbar-track {
      background: #0f172a;
    }
    ::-webkit-scrollbar-thumb {
      background: #334155;
      border-radius: 4px;
    }
    ::-webkit-scrollbar-thumb:hover {
      background: #0284c7;
    }
  </style>
</head>
<body class="relative w-full h-full text-white">

  <!-- p5.js 畫布容器 -->
  <div id="canvas-container"></div>

  <!-- 頂部控制面板與狀態欄 -->
  <div class="relative z-10 flex flex-col justify-between h-full p-3 sm:p-5 pointer-events-none">
    
    <!-- Header 儀表板 -->
    <header class="flex flex-wrap justify-between items-center bg-slate-900/85 backdrop-blur-md p-3 px-4 rounded-2xl border border-cyan-500/30 arcade-glow pointer-events-auto max-w-5xl mx-auto w-full gap-2">
      <div class="flex items-center space-x-3">
        <div class="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400/60 flex items-center justify-center text-cyan-300 shadow-inner">
          <i class="fa-solid fa-wand-magic-sparkles text-lg animate-pulse"></i>
        </div>
        <div>
          <h1 class="text-base sm:text-lg font-bold bg-gradient-to-r from-cyan-300 via-sky-200 to-blue-400 bg-clip-text text-transparent tracking-wide">
            p5.js 精靈角色動畫控制器
          </h1>
          <p class="text-xs text-slate-400 hidden sm:block">包含魔法粒子軌跡與完整中文註解</p>
        </div>
      </div>

      <!-- 控制選單按鈕群 -->
      <div class="flex items-center space-x-2">
        <button id="toggle-settings-btn" class="bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-600/60 px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition">
          <i class="fa-solid fa-sliders"></i>
          <span class="hidden sm:inline">參數設定</span>
        </button>
        <button id="toggle-code-btn" class="bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-200 border border-cyan-400/50 px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition">
          <i class="fa-solid fa-code"></i>
          <span>查看程式碼</span>
        </button>
        <button id="fullscreen-btn" class="bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-600/60 px-2.5 py-1.5 rounded-xl text-xs transition">
          <i class="fa-solid fa-expand"></i>
        </button>
      </div>
    </header>

    <!-- 可調式的微調控制面板 (抽屜) -->
    <div id="settings-panel" class="hidden pointer-events-auto max-w-5xl mx-auto w-full bg-slate-900/90 backdrop-blur-md border border-cyan-500/30 p-4 rounded-2xl arcade-glow mt-2 transition-all">
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        <!-- 移動速度調節 -->
        <div class="flex flex-col space-y-1">
          <div class="flex justify-between text-slate-300">
            <span>角色移動速度</span>
            <span id="val-speed" class="text-cyan-400 font-mono">6 px/f</span>
          </div>
          <input type="range" id="slider-speed" min="1" max="15" value="6" class="accent-cyan-400 cursor-pointer">
        </div>
        <!-- 畫格播放速度調節 -->
        <div class="flex flex-col space-y-1">
          <div class="flex justify-between text-slate-300">
            <span>動畫播放幀率</span>
            <span id="val-fps" class="text-cyan-400 font-mono">0.25</span>
          </div>
          <input type="range" id="slider-fps" min="0.05" max="0.6" step="0.05" value="0.25" class="accent-cyan-400 cursor-pointer">
        </div>
        <!-- 角色縮放比例 -->
        <div class="flex flex-col space-y-1">
          <div class="flex justify-between text-slate-300">
            <span>角色放大倍率</span>
            <span id="val-scale" class="text-cyan-400 font-mono">1.2x</span>
          </div>
          <input type="range" id="slider-scale" min="0.5" max="2.5" step="0.1" value="1.2" class="accent-cyan-400 cursor-pointer">
        </div>
      </div>
    </div>

    <!-- 底部實體/觸控控制器 UI -->
    <div class="flex justify-between items-end w-full max-w-5xl mx-auto pb-2 pointer-events-none">
      <!-- 左移動按鈕 -->
      <div class="pointer-events-auto">
        <button id="btn-left" class="btn-arcade w-20 h-20 sm:w-24 sm:h-24 rounded-2xl flex flex-col items-center justify-center text-cyan-300 active:text-white select-none">
          <i class="fa-solid fa-arrow-left text-2xl sm:text-3xl mb-1"></i>
          <span class="text-[10px] font-bold tracking-wider uppercase">向左移動</span>
        </button>
      </div>

      <!-- 操作狀態說明指示卡 -->
      <div class="hidden sm:flex flex-col items-center bg-slate-900/80 backdrop-blur-md border border-slate-700/60 px-5 py-2.5 rounded-xl text-center shadow-lg pointer-events-auto">
        <div class="flex items-center space-x-2 text-xs text-slate-300 mb-1">
          <span class="bg-slate-800 border border-slate-600 px-2 py-0.5 rounded text-cyan-300 font-mono">A / ←</span>
          <span>向左</span>
          <span class="text-slate-500">|</span>
          <span class="bg-slate-800 border border-slate-600 px-2 py-0.5 rounded text-cyan-300 font-mono">D / →</span>
          <span>向右</span>
        </div>
        <span id="status-badge" class="text-xs text-cyan-400 font-bold tracking-widest uppercase">狀態：靜止中 (IDLE)</span>
      </div>

      <!-- 右移動按鈕 -->
      <div class="pointer-events-auto">
        <button id="btn-right" class="btn-arcade w-20 h-20 sm:w-24 sm:h-24 rounded-2xl flex flex-col items-center justify-center text-cyan-300 active:text-white select-none">
          <i class="fa-solid fa-arrow-right text-2xl sm:text-3xl mb-1"></i>
          <span class="text-[10px] font-bold tracking-wider uppercase">向右移動</span>
        </button>
      </div>
    </div>
  </div>

  <!-- 帶註解程式碼檢視抽屜/彈窗 (Code Viewer Modal) -->
  <div id="code-drawer" class="fixed inset-y-0 right-0 w-full sm:w-2/3 lg:w-1/2 bg-slate-950/95 backdrop-blur-xl border-l border-cyan-500/30 z-50 transform translate-x-full drawer-transition flex flex-col shadow-2xl">
    <!-- 抽屜標題列 -->
    <div class="flex justify-between items-center p-4 border-b border-slate-800 bg-slate-900/80">
      <div class="flex items-center space-x-2">
        <i class="fa-solid fa-code text-cyan-400"></i>
        <h2 class="font-bold text-sm sm:text-base text-slate-200">sketch.js 完整程式碼（附中文註解）</h2>
      </div>
      <button id="close-code-btn" class="text-slate-400 hover:text-white p-2 rounded-lg transition">
        <i class="fa-solid fa-xmark text-lg"></i>
      </button>
    </div>
    
    <!-- 程式碼展示區塊 -->
    <div class="flex-1 overflow-y-auto p-4 font-mono text-xs text-slate-300 leading-relaxed bg-slate-950">
      <pre><code id="code-display" class="language-javascript"></code></pre>
    </div>

    <!-- 底部複製按鈕 -->
    <div class="p-3 border-t border-slate-800 bg-slate-900/80 flex justify-end">
      <button id="copy-code-btn" class="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs flex items-center space-x-2 transition">
        <i class="fa-solid fa-copy"></i>
        <span>複製完整程式碼</span>
      </button>
    </div>
  </div>

  <!-- ========================================================= -->
  <!-- p5.js 互動邏輯與精靈圖檔渲染程式碼 -->
  <!-- ========================================================= -->
  <script>
    // ---------------------------------------------------------
    // 1. 動態建立包含完整 8 影格精靈圖案的 Canvas/Image
    // ---------------------------------------------------------
    let spriteSheet;            // 儲存動態生成的精靈圖片
    const totalFrames = 8;      // 圖檔中包含的總動作影格數
    let frameWidth = 126;       // 單一影格寬度
    let frameHeight = 120;      // 單一影格高度
    
    let currentFrame = 0;       // 目前播放的影格索引
    let xPos, yPos;             // 角色的畫布 X, Y 座標
    let moveSpeed = 6;          // 角色的水平移動速度
    let animSpeed = 0.25;       // 動畫幀率
    let scaleFactor = 1.2;      // 角色的顯示放大倍率
    let facingRight = true;     // 角色的朝向狀態 (true = 朝右, false = 朝左)
    
    let particles = [];         // 魔法粒子特效陣列
    let isMovingLeft = false;   // 觸控/鍵盤之向左移動狀態
    let isMovingRight = false;  // 觸控/鍵盤之向右移動狀態

    // 建立獨立的精靈圖庫（確保不發生字串截斷導致的 SyntaxError）
    function generateSpriteSheetImage() {
      const g = createGraphics(1011, 120);
      g.clear();
      
      const fw = 1011 / 8;
      const angles = [0, 45, 90, 135, 180, 225, 270, 315];

      for (let i = 0; i < 8; i++) {
        g.push();
        g.translate(i * fw + fw / 2, 60);

        // 畫精靈周圍魔法光效弧線
        g.noFill();
        g.stroke(56, 189, 248, 200);
        g.strokeWeight(3);
        g.arc(0, 0, 80, 80, radians(angles[i]), radians(angles[i] + 160));

        g.rotate(radians(angles[i]));

        // 藍色雙馬尾 / 帽沿
        g.noStroke();
        g.fill(30, 58, 138); // 深藍
        g.triangle(-15, -10, -45, -35, -20, 5);
        g.triangle(15, -10, 45, -35, 20, 5);

        // 身體 (白色衣服)
        g.fill(241, 245, 249);
        g.ellipse(0, 10, 28, 38);

        // 頭部與臉部
        g.fill(254, 215, 170); // 膚色
        g.ellipse(0, -12, 24, 24);

        // 咖啡色頭髮
        g.fill(120, 53, 15);
        g.arc(0, -14, 26, 20, PI, TWO_PI);

        // 眼睛
        g.fill(16, 185, 129);
        g.ellipse(-4, -12, 4, 6);
        g.ellipse(4, -12, 4, 6);

        // 魔法手杖 (槓桿與兩端紅黃寶石)
        g.stroke(187, 247, 208);
        g.strokeWeight(4);
        g.line(-45, -5, 45, 5);

        g.noStroke();
        g.fill(234, 179, 8); // 黃金頭
        g.ellipse(-45, -5, 10, 10);
        g.ellipse(45, 5, 10, 10);

        g.fill(239, 68, 68); // 紅寶石核心
        g.ellipse(-45, -5, 5, 5);
        g.ellipse(45, 5, 5, 5);

        g.pop();
      }

      return g.get();
    }

    // ---------------------------------------------------------
    // 3. 預載入與初始化
    // ---------------------------------------------------------
    function setup() {
      // 建立滿版全螢幕畫布
      let canvas = createCanvas(windowWidth, windowHeight);
      canvas.parent('canvas-container');
      
      // 生成精靈圖集
      spriteSheet = generateSpriteSheetImage();

      // 設定圖片與形狀繪製模式為中心點對齊
      imageMode(CENTER);
      
      // 初始化角色位置於畫布正中央
      xPos = width / 2;
      yPos = height / 2;

      // 綁定 UI 控制按鈕與滑桿
      setupUIControls();
      
      // 初始化展示程式碼於抽屜面板中
      document.getElementById('code-display').innerText = document.getElementById('p5-code-template').innerText.trim();
    }

    // ---------------------------------------------------------
    // 4. 主要繪製與更新迴圈 (Draw - 每秒約 60 幀)
    // ---------------------------------------------------------
    function draw() {
      // 1. 清除背景並設定為指定顏色 #90e0ef
      background('#90e0ef');
      
      // 繪製背景網格
      drawSubtleGrid();

      // 2. 檢測鍵盤輸入與觸控按鈕狀態
      let keyLeft = keyIsDown(LEFT_ARROW) || keyIsDown(65) || isMovingLeft;  // 65 = 'A'
      let keyRight = keyIsDown(RIGHT_ARROW) || keyIsDown(68) || isMovingRight; // 68 = 'D'
      let isMoving = false;

      // 3. 處理移動邏輯與邊界限制
      if (keyRight && !keyLeft) {
        xPos += moveSpeed;
        facingRight = true;
        isMoving = true;
      } else if (keyLeft && !keyRight) {
        xPos -= moveSpeed;
        facingRight = false;
        isMoving = true;
      }

      // 將角色控制在畫布視野範圍之內
      let halfW = (frameWidth * scaleFactor) / 2;
      xPos = constrain(xPos, halfW, width - halfW);

      // 更新狀態標籤
      updateStatusBadge(isMoving);

      // 4. 計算動畫幀與播放邏輯
      if (isMoving) {
        currentFrame += animSpeed;
        currentFrame %= totalFrames;
        
        // 移動時產生魔法火花粒子
        spawnMagicParticle(xPos, yPos);
      } else {
        currentFrame = 0;
      }

      // 5. 更新並繪製魔法粒子陣列
      updateAndDrawParticles();

      // 6. 計算當前影格在精靈圖中的 X 軸裁切點
      let sourceX = Math.floor(currentFrame) * (1011 / totalFrames);

      // 7. 繪製角色影子與精靈圖片
      push();
      translate(xPos, yPos);

      // 繪製腳底橢圓陰影
      fill(0, 0, 0, 35);
      noStroke();
      ellipse(0, (frameHeight * scaleFactor) / 2 - 8, 55 * scaleFactor, 14 * scaleFactor);

      // 若角色向左，進行 X 軸水平鏡射翻轉
      if (!facingRight) {
        scale(-1, 1);
      }

      // 繪製裁切後的精靈圖片
      image(
        spriteSheet,
        0, 0,
        frameWidth * scaleFactor, frameHeight * scaleFactor,
        sourceX, 0,
        1011 / totalFrames, frameHeight
      );

      pop();
    }

    // ---------------------------------------------------------
    // 5. 魔法火花粒子系統 (Particle Trail Effect)
    // ---------------------------------------------------------
    function spawnMagicParticle(px, py) {
      if (random() < 0.6) {
        particles.push({
          x: px + random(-20, 20),
          y: py + random(-10, 30),
          vx: random(-1.5, 1.5),
          vy: random(-2, 0.5),
          size: random(4, 9),
          alpha: 255,
          color: random() > 0.4 ? color(224, 242, 254) : color(253, 224, 71)
        });
      }
    }

    function updateAndDrawParticles() {
      for (let i = particles.length - 1; i >= 0; i--) {
        let p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= 8;
        p.size *= 0.95;

        if (p.alpha <= 0 || p.size < 0.5) {
          particles.splice(i, 1);
          continue;
        }

        push();
        noStroke();
        fill(red(p.color), green(p.color), blue(p.color), p.alpha);
        ellipse(p.x, p.y, p.size, p.size);
        pop();
      }
    }

    // ---------------------------------------------------------
    // 6. 畫布視窗尺寸調整 (Responsive Resize)
    // ---------------------------------------------------------
    function windowResized() {
      resizeCanvas(windowWidth, windowHeight);
      yPos = height / 2;
    }

    // ---------------------------------------------------------
    // 7. 裝飾性背景網格
    // ---------------------------------------------------------
    function drawSubtleGrid() {
      stroke(255, 255, 255, 30);
      strokeWeight(1);
      let step = 50;
      for (let x = 0; x < width; x += step) {
        line(x, 0, x, height);
      }
      for (let y = 0; y < height; y += step) {
        line(0, y, width, y);
      }
    }

    // ---------------------------------------------------------
    // 8. UI 事件與狀態綁定
    // ---------------------------------------------------------
    function setupUIControls() {
      // 移動按鈕事件（向左）
      const btnLeft = document.getElementById('btn-left');
      const startLeft = (e) => { e.preventDefault(); isMovingLeft = true; btnLeft.classList.add('active'); };
      const endLeft = (e) => { e.preventDefault(); isMovingLeft = false; btnLeft.classList.remove('active'); };
      btnLeft.addEventListener('mousedown', startLeft);
      btnLeft.addEventListener('mouseup', endLeft);
      btnLeft.addEventListener('touchstart', startLeft);
      btnLeft.addEventListener('touchend', endLeft);

      // 移動按鈕事件（向右）
      const btnRight = document.getElementById('btn-right');
      const startRight = (e) => { e.preventDefault(); isMovingRight = true; btnRight.classList.add('active'); };
      const endRight = (e) => { e.preventDefault(); isMovingRight = false; btnRight.classList.remove('active'); };
      btnRight.addEventListener('mousedown', startRight);
      btnRight.addEventListener('mouseup', endRight);
      btnRight.addEventListener('touchstart', startRight);
      btnRight.addEventListener('touchend', endRight);

      // 滑桿數值綁定
      document.getElementById('slider-speed').addEventListener('input', (e) => {
        moveSpeed = parseFloat(e.target.value);
        document.getElementById('val-speed').innerText = moveSpeed + " px/f";
      });
      document.getElementById('slider-fps').addEventListener('input', (e) => {
        animSpeed = parseFloat(e.target.value);
        document.getElementById('val-fps').innerText = animSpeed;
      });
      document.getElementById('slider-scale').addEventListener('input', (e) => {
        scaleFactor = parseFloat(e.target.value);
        document.getElementById('val-scale').innerText = scaleFactor + "x";
      });

      // 設定面板開關
      document.getElementById('toggle-settings-btn').addEventListener('click', () => {
        const panel = document.getElementById('settings-panel');
        panel.classList.toggle('hidden');
      });

      // 程式碼檢視抽屜開關
      const codeDrawer = document.getElementById('code-drawer');
      document.getElementById('toggle-code-btn').addEventListener('click', () => {
        codeDrawer.classList.remove('translate-x-full');
      });
      document.getElementById('close-code-btn').addEventListener('click', () => {
        codeDrawer.classList.add('translate-x-full');
      });

      // 複製程式碼按鈕
      document.getElementById('copy-code-btn').addEventListener('click', () => {
        const codeText = document.getElementById('code-display').innerText;
        const textarea = document.createElement('textarea');
        textarea.value = codeText;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        
        const copyBtn = document.getElementById('copy-code-btn');
        copyBtn.innerHTML = '<i class="fa-solid fa-check"></i><span>已複製到剪貼簿！</span>';
        setTimeout(() => {
          copyBtn.innerHTML = '<i class="fa-solid fa-copy"></i><span>複製完整程式碼</span>';
        }, 2000);
      });

      // 全螢幕切換
      document.getElementById('fullscreen-btn').addEventListener('click', () => {
        let fs = fullscreen();
        fullscreen(!fs);
      });
    }

    function updateStatusBadge(isMoving) {
      const badge = document.getElementById('status-badge');
      if (badge) {
        if (isMoving) {
          badge.innerText = facingRight ? "狀態：向右翻轉移動中" : "狀態：向左翻轉移動中";
          badge.className = "text-xs text-amber-300 font-bold tracking-widest uppercase animate-pulse";
        } else {
          badge.innerText = "狀態：靜止中 (IDLE)";
          badge.className = "text-xs text-cyan-400 font-bold tracking-widest uppercase";
        }
      }
    }
  </script>

  <!-- ========================================================= -->
  <!-- 方便使用者複製與閱讀的註解版 sketch.js 範本區塊 -->
  <!-- ========================================================= -->
  <script id="p5-code-template" type="text/plain">
// =========================================================
// p5.js 精靈角色動畫與互動控制器 - sketch.js
// 背景顏色：#90e0ef | 動作影格：8 幀循環旋轉 | 水平鏡射移動
// =========================================================

let spriteSheet;            // 儲存精靈圖檔 (12.png)
const totalFrames = 8;      // 圖檔包含 8 個連續動作影格
let frameWidth = 126;       // 單一影格寬度 (約 126px)
let frameHeight = 120;      // 單一影格高度 (120px)

let currentFrame = 0;       // 目前播放的動作影格索引 (0 ~ 7)
let xPos, yPos;             // 角色的畫布 X, Y 座標
let moveSpeed = 6;          // 角色的水平移動速度
let animSpeed = 0.25;       // 動畫播放幀率
let scaleFactor = 1.2;      // 角色的顯示放大倍率
let facingRight = true;     // 角色的朝向狀態 (true = 朝右, false = 朝左)

// 預載入函式：載入 12.png 精靈圖片
function preload() {
  spriteSheet = loadImage('12.png'); // 或使用 Base64 Data URI
}

// 初始化設定
function setup() {
  // 建立滿版全螢幕畫布
  createCanvas(windowWidth, windowHeight);
  
  // 設定圖片繪製基準點為中心點，方便進行水平翻轉與繪製
  imageMode(CENTER);
  
  // 初始化角色位置於畫布正中央
  xPos = width / 2;
  yPos = height / 2;
}

// 主要繪製與更新迴圈（每秒約 60 幀）
function draw() {
  // 1. 設定畫布背景顏色為 #90e0ef
  background('#90e0ef');
  
  // 2. 檢測按鍵與移動狀態
  let isMovingLeft = keyIsDown(LEFT_ARROW) || keyIsDown(65);  // 左方向鍵 或 A 鍵
  let isMovingRight = keyIsDown(RIGHT_ARROW) || keyIsDown(68); // 右方向鍵 或 D 鍵
  let isMoving = false;

  // 3. 處理移動邏輯與面向切換
  if (isMovingRight && !isMovingLeft) {
    xPos += moveSpeed;     // 角色向右移動
    facingRight = true;    // 設定朝向為右
    isMoving = true;       // 標記為移動中
  } else if (isMovingLeft && !isMovingRight) {
    xPos -= moveSpeed;     // 角色向左移動
    facingRight = false;   // 設定朝向為左（圖片將水平翻轉）
    isMoving = true;       // 標記為移動中
  }

  // 限制角色不超出畫布邊界
  let halfWidth = (frameWidth * scaleFactor) / 2;
  xPos = constrain(xPos, halfWidth, width - halfWidth);

  // 4. 計算動畫畫格
  if (isMoving) {
    // 正在移動：播放動畫，畫格索引遞增
    currentFrame += animSpeed;
    currentFrame %= totalFrames; // 0 ~ 7 幀循環播放
  } else {
    // 靜止狀態：固定在第 0 幀（站立姿態）
    currentFrame = 0;
  }

  // 5. 計算精靈圖裁切區域 (X 軸起始點)
  let sourceX = Math.floor(currentFrame) * (1011 / totalFrames);

  // 6. 繪製角色與鏡射翻轉
  push();
  translate(xPos, yPos); // 將座標原點平移至角色中心

  // 若角色向左移動，進行水平鏡射翻轉
  if (!facingRight) {
    scale(-1, 1);
  }

  // 繪製裁切後的角色精靈圖片
  // image(圖檔, X, Y, 顯示寬, 顯示高, 裁切X, 裁切Y, 裁切寬, 裁切高)
  image(
    spriteSheet,
    0, 0,
    frameWidth * scaleFactor, frameHeight * scaleFactor,
    sourceX, 0,
    1011 / totalFrames, frameHeight
  );

  pop();
}

// 視窗尺寸改變時自動調整畫布大小
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  yPos = height / 2; // 維持垂直置中
}
  </script>
</body>
</html>