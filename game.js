// 游戏配置
const GAME_CONFIG = {
    TOTAL_ROUNDS: 5,
    CARDS_PER_HAND: 9,
    SCORE_RULES: {
        1: 1, // 1-3轮得1分
        2: 1,
        3: 1,
        4: 2, // 4-5轮得2分
        5: 2
    }
};

// 卡牌类型定义
const ANIMAL_TYPES = ['狗', '鸟', '猫'];
const COLOR_TYPES = ['red', 'green', 'blue'];
const NUMBER_VALUES = [1, 2, 3, 4, 5];

// 游戏状态
const gameState = {
    currentRound: 1,
    playerCount: 3,
    players: [],
    animalQueue: [],
    solutions: {},
    scores: {},
    selectedAnimal: null,
    selectedColor: null,
    selectedNumber: null,
    playerName: '玩家1',
    isGameStarted: false
}

// DOM元素
const elements = {
    publicModule: document.getElementById('public-module'),
    playerModule: document.getElementById('player-module'),
    playerConfigModule: document.getElementById('player-config'),
    publicModeBtn: document.getElementById('public-mode-btn'),
    playerModeBtn: document.getElementById('player-mode-btn'),
    currentRound: document.getElementById('current-round'),
    playerCountInput: document.getElementById('player-count'),
    playerCountDisplay: document.getElementById('player-count-display'),
    confirmPlayersBtn: document.getElementById('confirm-players-btn'),
    animalQueue: document.getElementById('animal-queue'),
    startGameBtn: document.getElementById('start-game-btn'),
    scoreControlBtn: document.getElementById('score-control-btn'),
    scoreBonusArea: document.getElementById('score-bonus-area'),
    playersScoreButtons: document.getElementById('players-score-buttons'),
    scoreboard: document.getElementById('scores-container'),
    animalSelection: document.getElementById('animal-selection'),
    colorSelection: document.getElementById('color-selection'),
    numberSelection: document.getElementById('number-selection'),
    previewCard: document.getElementById('preview-card'),
    submitCardBtn: document.getElementById('submit-card-btn'),
    resetSelectionBtn: document.getElementById('reset-selection-btn'),
    fullscreenDisplay: document.getElementById('fullscreen-display'),
    fullscreenCard: document.getElementById('fullscreen-card'),
    gameEndArea: document.getElementById('game-end-area'),
    finalRanking: document.getElementById('final-ranking'),
    backToMenuBtn: document.getElementById('back-to-menu-btn'),
    backToMenuPublicBtn: document.getElementById('back-to-menu-public-btn'),
    backToMenuPlayerBtn: document.getElementById('back-to-menu-player-btn'),
    modeSelector: document.querySelector('.mode-selector'),
    // 新增元素
    playerCountButtons: document.querySelectorAll('.count-btn'),
    playerNamesConfig: document.getElementById('player-names-config'),
    playersNamesList: document.getElementById('players-names-list'),
    backToCountBtn: document.getElementById('back-to-count-btn'),
    // 模态框元素
    customConfirmModal: document.getElementById('custom-confirm-modal'),
    modalTitle: document.getElementById('modal-title'),
    modalMessage: document.getElementById('modal-message'),
    modalConfirm: document.getElementById('modal-confirm'),
    modalCancel: document.getElementById('modal-cancel')
};

// 全局变量用于存储自定义确认模态框的回调函数
let currentConfirmCallback = null;

// 自定义确认模态框函数
function customConfirm(title, message, confirmCallback) {
    // 设置模态框内容
    if (elements.modalTitle) elements.modalTitle.textContent = title;
    if (elements.modalMessage) elements.modalMessage.textContent = message;
    
    // 显示模态框
    if (elements.customConfirmModal) {
        elements.customConfirmModal.classList.remove('hidden');
    }
    
    // 保存当前的回调函数
    currentConfirmCallback = confirmCallback;
}

// 绑定模态框按钮事件
function bindModalEvents() {
    // 确认按钮
    if (elements.modalConfirm) {
        elements.modalConfirm.addEventListener('click', () => {
            // 隐藏模态框
            if (elements.customConfirmModal) {
                elements.customConfirmModal.classList.add('hidden');
            }
            
            // 执行确认回调
            if (currentConfirmCallback) {
                currentConfirmCallback(true);
                currentConfirmCallback = null;
            }
        });
    }
    
    // 取消按钮
    if (elements.modalCancel) {
        elements.modalCancel.addEventListener('click', () => {
            // 隐藏模态框
            if (elements.customConfirmModal) {
                elements.customConfirmModal.classList.add('hidden');
            }
            
            // 执行取消回调（如果有）
            if (currentConfirmCallback) {
                currentConfirmCallback(false);
                currentConfirmCallback = null;
            }
        });
    }
}

// 处理ResizeObserver循环错误
function handleResizeObserverError() {
    // 检查是否支持ResizeObserver
    if ('ResizeObserver' in window) {
        // 保存原始ResizeObserver
        const originalResizeObserver = window.ResizeObserver;
        
        // 重写ResizeObserver以捕获错误
        window.ResizeObserver = class extends originalResizeObserver {
            constructor(callback) {
                super((entries, observer) => {
                    try {
                        callback(entries, observer);
                    } catch (err) {
                        // 忽略ResizeObserver循环错误
                        console.warn('ResizeObserver错误已处理:', err);
                    }
                });
            }
        };
    }
}

// 初始化游戏
function initGame() {
    // 处理ResizeObserver错误
    handleResizeObserverError();
    
    // 初始化全局回调变量
    currentConfirmCallback = null;
    
    // 确保模态框在页面加载时是隐藏的
    if (elements.customConfirmModal) {
        elements.customConfirmModal.classList.add('hidden');
    }
    
    // 绑定模态框事件
    bindModalEvents();
    // 绑定事件监听器
    bindEventListeners();
}

// 绑定事件监听器
function bindEventListeners() {
    // 模式切换按钮
    if (elements.publicModeBtn) {
        elements.publicModeBtn.addEventListener('click', () => {
            elements.publicModule.classList.add('hidden');
            elements.playerModule.classList.add('hidden');
            elements.playerConfigModule.classList.remove('hidden');
            elements.modeSelector.classList.add('hidden');
        });
    }
    
    if (elements.playerModeBtn) {
        elements.playerModeBtn.addEventListener('click', () => {
            elements.publicModule.classList.add('hidden');
            elements.playerModule.classList.remove('hidden');
            elements.playerConfigModule.classList.add('hidden');
            elements.modeSelector.classList.add('hidden');
        });
    }
    
    // 玩家人数按钮事件监听
    if (elements.playerCountButtons) {
        elements.playerCountButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                // 移除所有按钮的选中状态
                elements.playerCountButtons.forEach(b => b.classList.remove('selected'));
                // 添加当前按钮的选中状态
                btn.classList.add('selected');
                
                gameState.playerCount = parseInt(btn.dataset.count);
                elements.playerCountDisplay.textContent = gameState.playerCount;
                
                // 生成玩家昵称输入框
                renderPlayerNameInputs();
                
                // 显示昵称配置区域
                document.querySelector('.player-count-buttons').classList.add('hidden');
                elements.playerNamesConfig.classList.remove('hidden');
                elements.backToCountBtn.classList.remove('hidden');
                
                // 启用确认按钮
                if (elements.confirmPlayersBtn) {
                    elements.confirmPlayersBtn.disabled = false;
                    elements.confirmPlayersBtn.classList.remove('disabled');
                }
            });
        });
    }
    
    // 返回主菜单按钮 - 选择人数页面
    if (elements.backToCountBtn) {
        elements.backToCountBtn.addEventListener('click', () => {
            customConfirm('确认操作', '确定要返回主菜单吗？当前配置将丢失。', (confirmed) => {
                if (confirmed) {
                    elements.playerConfigModule.classList.add('hidden');
                    elements.modeSelector.classList.remove('hidden');
                    document.querySelector('.player-count-buttons').classList.remove('hidden');
                    elements.playerNamesConfig.classList.add('hidden');
                    elements.backToCountBtn.classList.add('hidden');
                }
            });
        });
    }
    
    // 返回主菜单按钮 - 公共模块
    if (elements.backToMenuPublicBtn) {
        elements.backToMenuPublicBtn.addEventListener('click', () => {
            customConfirm('确认操作', '确定要返回主菜单吗？当前游戏进度将丢失。', (confirmed) => {
                if (confirmed) {
                    resetGame();
                }
            });
        });
    }
    
    // 返回主菜单按钮 - 玩家模块
    if (elements.backToMenuPlayerBtn) {
        elements.backToMenuPlayerBtn.addEventListener('click', () => {
            customConfirm('确认操作', '确定要返回主菜单吗？当前游戏进度将丢失。', (confirmed) => {
                if (confirmed) {
                    resetGame();
                }
            });
        });
    }
    
    // 注意：随机生成昵称按钮已移至每个输入框后，使用🎲图标
    
    // 确认玩家配置按钮
    if (elements.confirmPlayersBtn) {
        // 初始禁用确认按钮
        elements.confirmPlayersBtn.disabled = true;
        elements.confirmPlayersBtn.classList.add('disabled');
        
        elements.confirmPlayersBtn.addEventListener('click', () => {
            // 获取所有输入框的值
            const nameInputs = document.querySelectorAll('.player-name-input');
            const playerNames = Array.from(nameInputs).map(input => input.value.trim() || input.placeholder);
            
            // 保存玩家昵称
            gameState.playerNames = playerNames;
            
            // 初始化玩家
            initPlayers();
            
            // 切换到公共模块
            elements.playerConfigModule.classList.add('hidden');
            elements.publicModule.classList.remove('hidden');
        });
    }
    
    // 公共模块按钮
    if (elements.startGameBtn) {
        elements.startGameBtn.addEventListener('click', startGame);
    }
    
    if (elements.scoreControlBtn) {
        elements.scoreControlBtn.addEventListener('click', startScoreBonusPhase);
    }
    
    if (elements.backToMenuBtn) {
        elements.backToMenuBtn.addEventListener('click', resetGame);
    }
    
    // 玩家模块按钮
    // 为预览卡片添加点击事件，实现点击全屏展示
    if (elements.previewCard) {
        elements.previewCard.addEventListener('click', () => {
            if (gameState.selectedAnimal && gameState.selectedColor && gameState.selectedNumber) {
                // 创建玩家解决方案
                const solution = {
                    animal: gameState.selectedAnimal,
                    color: gameState.selectedColor,
                    number: gameState.selectedNumber,
                    player: gameState.playerName
                };
                
                // 存储解决方案
                gameState.solutions[gameState.playerName] = solution;
                
                // 显示全屏卡片
                showFullscreenCard({
                    animal: gameState.selectedAnimal,
                    color: gameState.selectedColor,
                    number: gameState.selectedNumber
                });
            } else {
                alert('请先选择动物、颜色和数字！');
            }
        });
    }
    
    // 动物选择按钮
    if (elements.animalSelection) {
        Array.from(elements.animalSelection.children).forEach(btn => {
            btn.addEventListener('click', (e) => {
                selectAnimal(e.target.dataset.animal);
            });
        });
    }
    
    // 颜色选择按钮
    if (elements.colorSelection) {
        Array.from(elements.colorSelection.children).forEach(btn => {
            btn.addEventListener('click', (e) => {
                selectColor(e.target.dataset.color);
            });
        });
    }
    
    // 数字选择按钮
    if (elements.numberSelection) {
        Array.from(elements.numberSelection.children).forEach(btn => {
            btn.addEventListener('click', (e) => {
                selectNumber(parseInt(e.target.dataset.number));
            });
        });
    }
    
    // 全屏展示点击事件
    if (elements.fullscreenDisplay) {
        elements.fullscreenDisplay.addEventListener('click', () => {
            hideFullscreenDisplay();
        });
    }
    
    // 注意：已移除阻止全屏卡片点击事件冒泡的代码，现在点击任意处（包括卡面本身）都能关闭全屏显示
}

// 生成玩家昵称输入框
function renderPlayerNameInputs() {
    elements.playersNamesList.innerHTML = '';
    
    for (let i = 1; i <= gameState.playerCount; i++) {
        const playerInputContainer = document.createElement('div');
        playerInputContainer.className = 'player-name-input-container';
        
        playerInputContainer.innerHTML = `
            <label for="player-${i}-name">玩家 ${i} 昵称:</label>
            <div class="input-with-dice">
                <input type="text" id="player-${i}-name" class="player-name-input" placeholder="玩家 ${i}">
                <button class="dice-btn" data-player-index="${i-1}">🎲</button>
            </div>
        `;
        
        elements.playersNamesList.appendChild(playerInputContainer);
    }
    
    // 添加骰子按钮事件监听
    document.querySelectorAll('.dice-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const playerIndex = parseInt(e.target.dataset.playerIndex);
            generateRandomNicknameForPlayer(playerIndex);
        });
    });
}

// 为指定玩家生成随机昵称
function generateRandomNicknameForPlayer(playerIndex) {
    // 预设一些有趣的昵称
    const adjectives = ['快乐的', '聪明的', '勇敢的', '可爱的', '强壮的', '敏捷的', '友善的', '机灵的'];
    const nouns = ['狮子', '老虎', '大象', '猴子', '熊猫', '长颈鹿', '斑马', '河马', '企鹅', '考拉'];
    
    const randomAdj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
    
    // 获取对应玩家的输入框
    const inputElement = document.querySelector(`#player-${playerIndex+1}-name`);
    if (inputElement) {
        inputElement.value = randomAdj + randomNoun;
    }
}

// 随机生成所有玩家昵称
function generateRandomNicknames() {
    // 为所有玩家生成随机昵称
    for (let i = 0; i < gameState.playerCount; i++) {
        generateRandomNicknameForPlayer(i);
    }
}

// 初始化玩家列表
function initPlayers() {
    gameState.players = [];
    gameState.scores = {};
    
    if (gameState.playerNames && gameState.playerNames.length === gameState.playerCount) {
        // 使用自定义昵称
        gameState.players = gameState.playerNames;
        gameState.playerNames.forEach(playerName => {
            gameState.scores[playerName] = 0;
        });
    } else {
        // 回退到默认昵称
        for (let i = 1; i <= gameState.playerCount; i++) {
            const playerName = `玩家${i}`;
            gameState.players.push(playerName);
            gameState.scores[playerName] = 0;
        }
    }
    
    updateScoreboard();
}

// 开始游戏
function startGame() {
    if (!gameState.isGameStarted) {
        gameState.isGameStarted = true;
        gameState.currentRound = 1;
    } else {
        // 下一轮
        gameState.currentRound++;
    }
    
    // 清空队列
    elements.animalQueue.innerHTML = '';
    gameState.animalQueue = [];
    
    // 隐藏开始按钮，显示结算按钮
    elements.startGameBtn.classList.add('hidden');
    elements.scoreControlBtn.classList.remove('hidden');
    
    // 隐藏加分区域和游戏结束区域
    elements.scoreBonusArea.classList.add('hidden');
    elements.gameEndArea.classList.add('hidden');
    
    // 更新轮次显示
    elements.currentRound.textContent = gameState.currentRound;
    
    // 生成新的动物队列（5张规律卡+1张问号卡，共6张）
    generateAnimalQueue();
}

// 生成新的动物队列（公共模块）
function generateAnimalQueue() {
    // 创建一个包含问号卡的队列
    const queue = [];
    
    // 生成5张规律卡
    const regularCards = [];
    for (let i = 0; i < 5; i++) {
       regularCards.push(generateRandomCard());
    }
    
    // 添加一张问号卡
    const questionCard = {
        type: 'question',
        color: 'grey',
        number: '?',
        animal: '?'
    };
    
    // 混合所有卡片
    const allCards = [...regularCards, questionCard];
    
    // 随机排序
    for (let i = allCards.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [allCards[i], allCards[j]] = [allCards[j], allCards[i]];
    }
    
    // 显示卡片（一行显示6张）
    allCards.forEach(card => {
        renderCard(card, elements.animalQueue, false);
        gameState.animalQueue.push(card);
    });
}

// 开始加分阶段
function startScoreBonusPhase() {
    // 隐藏结算按钮，显示加分区域
    elements.scoreControlBtn.classList.add('hidden');
    elements.scoreBonusArea.classList.remove('hidden');
    
    // 清空并创建玩家加分按钮
    elements.playersScoreButtons.innerHTML = '';
    
    const currentRoundScore = GAME_CONFIG.SCORE_RULES[gameState.currentRound];
    
    gameState.players.forEach(player => {
        const playerScoreContainer = document.createElement('div');
        playerScoreContainer.className = 'player-score-container';
        
        playerScoreContainer.innerHTML = `
            <span class="player-name">${player}:</span>
            <span class="player-score">${gameState.scores[player]}分</span>
            <button class="bonus-btn" data-player="${player}">+${currentRoundScore}分</button>
        `;
        
        elements.playersScoreButtons.appendChild(playerScoreContainer);
    });
    
    // 添加完成按钮
    const finishBonusBtn = document.createElement('button');
    finishBonusBtn.className = 'control-btn';
    finishBonusBtn.textContent = '完成加分';
    finishBonusBtn.addEventListener('click', finishScoreBonusPhase);
    elements.playersScoreButtons.appendChild(finishBonusBtn);
    
    // 为所有加分按钮添加事件监听器
    document.querySelectorAll('.bonus-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const player = e.target.dataset.player;
            const scoreToAdd = GAME_CONFIG.SCORE_RULES[gameState.currentRound];
            gameState.scores[player] += scoreToAdd;
            
            // 更新显示
            const scoreElement = e.target.parentElement.querySelector('.player-score');
            scoreElement.textContent = `${gameState.scores[player]}分`;
            
            // 更新得分榜
            updateScoreboard();
        });
    });
}

// 完成加分阶段
function finishScoreBonusPhase() {
    // 隐藏加分区域
    elements.scoreBonusArea.classList.add('hidden');
    
    // 检查是否游戏结束
    if (gameState.currentRound >= GAME_CONFIG.TOTAL_ROUNDS) {
        // 显示游戏结束界面
        showGameEndScreen();
    } else {
        // 显示开始游戏按钮，进入下一轮
        elements.startGameBtn.textContent = '下一轮';
        elements.startGameBtn.classList.remove('hidden');
    }
}

// 显示游戏结束界面
function showGameEndScreen() {
    // 按分数排序玩家
    const sortedPlayers = Object.entries(gameState.scores)
        .sort((a, b) => b[1] - a[1]);
    
    // 清空并创建最终排名
    elements.finalRanking.innerHTML = '';
    
    sortedPlayers.forEach(([player, score], index) => {
        const rankItem = document.createElement('div');
        rankItem.className = `ranking-item rank-${index + 1}`;
        
        let medal = '';
        if (index === 0) medal = '🥇';
        else if (index === 1) medal = '🥈';
        else if (index === 2) medal = '🥉';
        
        rankItem.textContent = `${medal} 第${index + 1}名: ${player} - ${score}分`;
        elements.finalRanking.appendChild(rankItem);
    });
    
    // 显示游戏结束区域
    elements.gameEndArea.classList.remove('hidden');
}

// 重置游戏
function resetGame() {
    // 重置游戏状态
    gameState.currentRound = 1;
    gameState.playerCount = 3;
    gameState.players = [];
    gameState.animalQueue = [];
    gameState.solutions = {};
    gameState.scores = {};
    gameState.isGameStarted = false;
    
    // 重置DOM元素
    elements.currentRound.textContent = 1;
    elements.playerCountDisplay.textContent = '3';
    elements.animalQueue.innerHTML = '';
    elements.scoreboard.innerHTML = '';
    
    // 隐藏所有模块，显示模式选择
    elements.publicModule.classList.add('hidden');
    elements.playerModule.classList.add('hidden');
    elements.playerConfigModule.classList.add('hidden');
    elements.scoreBonusArea.classList.add('hidden');
    elements.gameEndArea.classList.add('hidden');
    
    // 重置按钮状态
    elements.startGameBtn.textContent = '开始游戏';
    elements.startGameBtn.classList.remove('hidden');
    elements.scoreControlBtn.classList.add('hidden');
    
    // 显示模式选择
    elements.modeSelector.classList.remove('hidden');
}

// 生成随机卡片
function generateRandomCard() {
    return {
        type: 'regular',
        animal: ANIMAL_TYPES[Math.floor(Math.random() * ANIMAL_TYPES.length)],
        color: COLOR_TYPES[Math.floor(Math.random() * COLOR_TYPES.length)],
        number: NUMBER_VALUES[Math.floor(Math.random() * NUMBER_VALUES.length)]
    };
}

// 显示全屏卡片
function showFullscreenCard(card) {
    // 设置全屏卡片内容和样式
    elements.fullscreenCard.className = `fullscreen-card ${card.color}`;
    const numberElement = elements.fullscreenCard.querySelector('div:first-child');
    const animalElement = elements.fullscreenCard.querySelector('div:last-child');
    
    numberElement.textContent = card.number;
    animalElement.textContent = card.animal;
    
    // 显示全屏容器
    elements.fullscreenDisplay.classList.remove('hidden');
    elements.fullscreenDisplay.classList.add('fullscreen-display');
}

// 隐藏全屏卡片
function hideFullscreenDisplay() {
    elements.fullscreenDisplay.classList.remove('fullscreen-display');
    elements.fullscreenDisplay.classList.add('hidden');
    
    // 重置选择
    resetPlayerSelection();
}

// 选择动物
function selectAnimal(animal) {
    // 移除之前选择的动物样式
    Array.from(elements.animalSelection.children).forEach(btn => {
        btn.classList.remove('selected');
    });
    
    // 标记当前选择的动物
    const selectedBtn = Array.from(elements.animalSelection.children).find(btn => {
        return btn.dataset.animal === animal;
    });
    
    if (selectedBtn) {
        selectedBtn.classList.add('selected');
        gameState.selectedAnimal = animal;
        updatePreviewCard();
    }
}

// 选择颜色
function selectColor(color) {
    // 移除之前选择的颜色样式
    Array.from(elements.colorSelection.children).forEach(btn => {
        btn.classList.remove('selected');
    });
    
    // 标记当前选择的颜色
    const selectedBtn = Array.from(elements.colorSelection.children).find(btn => {
        return btn.dataset.color === color;
    });
    
    if (selectedBtn) {
        selectedBtn.classList.add('selected');
        gameState.selectedColor = color;
        updatePreviewCard();
    }
}

// 选择数字
function selectNumber(number) {
    // 移除之前选择的数字样式
    Array.from(elements.numberSelection.children).forEach(btn => {
        btn.classList.remove('selected');
    });
    
    // 标记当前选择的数字
    const selectedBtn = Array.from(elements.numberSelection.children).find(btn => {
        return parseInt(btn.dataset.number) === number;
    });
    
    if (selectedBtn) {
        selectedBtn.classList.add('selected');
        gameState.selectedNumber = number;
        updatePreviewCard();
    }
}

// 渲染卡片到指定容器
function renderCard(card, container, isPreview = false) {
    const cardElement = document.createElement('div');
    cardElement.className = `animal-card ${card.color} ${isPreview ? 'preview' : ''}`;
    
    // 设置卡片内容
    cardElement.innerHTML = `
        <div style="font-size: 1.5rem;">${card.number}</div>
        <div style="font-size: 1.2rem;">${card.animal}</div>
    `;
    
    // 添加到容器
    container.appendChild(cardElement);
}

// 更新预览卡片
function updatePreviewCard() {
    const number = gameState.selectedNumber || '?';
    const animal = gameState.selectedAnimal || '?';
    const color = gameState.selectedColor || '';
    
    // 清空之前的内容
    elements.previewCard.innerHTML = '';
    
    // 设置新的预览卡片样式和内容
    elements.previewCard.className = `preview-card ${color}`;
    elements.previewCard.innerHTML = `
        <div style="font-size: 2rem;">${number}</div>
        <div style="font-size: 1.5rem;">${animal}</div>
    `;
}

// 注意：确认选择、重新选择功能已移除，改为直接点击预览卡片全屏展示

// 开始新一轮
function startNewRound() {
    if (gameState.currentRound > GAME_CONFIG.TOTAL_ROUNDS) {
        alert('游戏已结束！');
        return;
    }
    
    // 生成新的动物队列
    generateAnimalQueue();
    
    // 重置解决方案
    gameState.solutions = {};
    
    // 更新轮次显示
    gameState.currentRound = gameState.currentRound || 1;
    elements.currentRound.textContent = gameState.currentRound;
    
    // 启用揭示按钮
    elements.revealSolutionsBtn.disabled = false;
    
    // 禁用开始按钮直到揭示完成
    elements.startRoundBtn.disabled = true;
}

// 揭示解决方案并计算得分
function revealSolutions() {
    // 这里仅做模拟，实际游戏中应该有更多玩家参与
    // 为了演示，我们创建一些模拟玩家的解决方案
    if (Object.keys(gameState.solutions).length === 0) {
        // 模拟一些玩家解决方案
        const mockPlayers = ['玩家1', '玩家2', '玩家3'];
        mockPlayers.forEach(player => {
            gameState.solutions[player] = {
                animal: ANIMAL_TYPES[Math.floor(Math.random() * ANIMAL_TYPES.length)],
                color: COLOR_TYPES[Math.floor(Math.random() * COLOR_TYPES.length)],
                number: NUMBER_VALUES[Math.floor(Math.random() * NUMBER_VALUES.length)],
                player: player
            };
        });
    }
    
    // 计算得分
    calculateScores();
    
    // 显示得分榜
    updateScoreboard();
    
    // 检查游戏是否结束
    if (gameState.currentRound >= GAME_CONFIG.TOTAL_ROUNDS) {
        alert('游戏结束！');
        elements.startRoundBtn.disabled = true;
        elements.revealSolutionsBtn.disabled = true;
    } else {
        // 准备下一轮
        gameState.currentRound++;
        elements.startRoundBtn.disabled = false;
        elements.revealSolutionsBtn.disabled = true;
    }
}

// 计算得分
function calculateScores() {
    const solutionList = Object.values(gameState.solutions);
    
    // 按解决方案分组
    const solutionGroups = {};
    solutionList.forEach(solution => {
        const key = `${solution.animal}-${solution.color}-${solution.number}`;
        if (!solutionGroups[key]) {
            solutionGroups[key] = [];
        }
        solutionGroups[key].push(solution.player);
    });
    
    // 为每组中人数大于1的玩家加分
    const roundScore = GAME_CONFIG.SCORE_RULES[gameState.currentRound];
    Object.values(solutionGroups).forEach(group => {
        if (group.length > 1) {
            group.forEach(player => {
                if (!gameState.scores[player]) {
                    gameState.scores[player] = 0;
                }
                gameState.scores[player] += roundScore;
            });
        }
    });
}

// 更新得分榜
function updateScoreboard() {
    elements.scoreboard.innerHTML = '';
    
    // 按分数排序玩家
    const sortedPlayers = Object.entries(gameState.scores)
        .sort((a, b) => b[1] - a[1]);
    
    // 显示得分
    sortedPlayers.forEach(([player, score]) => {
        const scoreItem = document.createElement('div');
        scoreItem.className = 'score-item';
        scoreItem.textContent = `${player}: ${score}分`;
        elements.scoreboard.appendChild(scoreItem);
    });
}

// 更新玩家模块的轮次显示
function updatePlayerRound() {
    // 此函数已不再需要，因为我们移除了playerRound元素
    // 如果需要在未来重新添加此功能，可以在此处添加代码
}

// 当页面加载完成后初始化游戏
window.addEventListener('DOMContentLoaded', initGame);