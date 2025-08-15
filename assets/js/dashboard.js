document.addEventListener('DOMContentLoaded', async () => {
    // --- Element Selections ---
    const openModalBtn = document.getElementById('open-modal-btn');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const modal = document.getElementById('strategy-modal');
    const activateStrategyBtn = document.querySelector('.modal-action-btn');
    const strategiesSection = document.querySelector('.strategies-section');
    const emptyState = document.querySelector('.empty-state');


    // --- Contract Information ---
    const factoryAddress = "0xc342129C33b1090091B21c022e59b071937D51Ae";
    const factoryABI = [
        {"inputs":[],"name":"createProxyWallet","outputs":[],"stateMutability":"nonpayable","type":"function"},
        {"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"wallets","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"}
    ];

    let provider, signer, factoryContract, userAddress, userProxyAddress;

    // --- Main Functions ---
    const displayStrategies = (strategies) => {
        // Clear previous content but keep the title and the empty state div
        const existingGrid = strategiesSection.querySelector('.strategy-grid');
        if (existingGrid) {
            existingGrid.remove();
        }

        if (strategies.length === 0) {
            emptyState.style.display = 'block';
        } else {
            emptyState.style.display = 'none';
            const strategyGrid = document.createElement('div');
            strategyGrid.className = 'strategy-grid';

            strategies.forEach(strategy => {
                const card = document.createElement('div');
                card.className = 'card strategy-card';
                
                card.innerHTML = `
                    <div class="strategy-card-header">
                        <span class="strategy-type">${strategy.strategy_type.replace('_', ' ')}</span>
                        <span class="status ${strategy.is_active ? 'active' : ''}">${strategy.is_active ? 'Active' : 'Paused'}</span>
                    </div>
                    <div class="strategy-card-body">
                        Spending ${strategy.amount_in} USDC every ${strategy.frequency_hours / (24*7)} week(s) to buy WETH.
                    </div>
                    <div class="strategy-card-footer">
                        <button class="card-button">Details</button>
                        <button class="card-button pause">Pause</button>
                    </div>
                `;
                strategyGrid.appendChild(card);
            });
            strategiesSection.appendChild(strategyGrid);
        }
    };
    
    const fetchStrategies = async () => {
        if (!userAddress) return;
        try {
            const
