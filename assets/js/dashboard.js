document.addEventListener('DOMContentLoaded', () => {
    // --- Element Selections (Guaranteed to exist now) ---
    const strategiesSection = document.querySelector('.strategies-section');
    const modal = document.getElementById('strategy-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const activateStrategyBtn = document.querySelector('.modal-action-btn');
    const totalValueAmount = document.querySelector('.card-amount');

    // --- Contract & Config Information ---
    const factoryAddress = "0xc342129C33b1090091B21c022e59b071937D51Ae";
    const factoryABI = [
        {"inputs":[],"name":"createProxyWallet","outputs":[],"stateMutability":"nonpayable","type":"function"},
        {"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"wallets","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"}
    ];
    const BASE_SEPOLIA_CHAIN_ID = 84532;

    let provider, signer, factoryContract, userAddress, userProxyAddress;

    // --- Main Functions ---
    const displayStrategies = (strategies) => {
        const emptyState = strategiesSection.querySelector('.empty-state');
        let strategyGrid = strategiesSection.querySelector('.strategy-grid');

        if (!strategyGrid) {
            strategyGrid = document.createElement('div');
            strategyGrid.className = 'strategy-grid';
            strategiesSection.appendChild(strategyGrid);
        }
        
        strategyGrid.innerHTML = ''; 

        if (!strategies || strategies.length === 0) {
            emptyState.style.display = 'block';
            strategyGrid.style.display = 'none';
        } else {
            emptyState.style.display = 'none';
            strategyGrid.style.display = 'grid';
            strategies.forEach(strategy => {
                const card = document.createElement('div');
                card.className = 'card strategy-card';
                card.innerHTML = `
                    <div class="strategy-card-header">
                        <span class="strategy-type">${strategy.strategy_type.replace('_', ' ')}</span>
                        <span class="status ${strategy.is_active ? 'active' : ''}">${strategy.is_active ? 'Active' : 'Paused'}</span>
                    </div>
                    <div class="strategy-card-body">Spending ${strategy.amount_in} USDC every week to buy WETH.</div>
                    <div class="strategy-card-footer">
                        <button class="card-button">Details</button>
                        <button class="card-button pause">Pause</button>
                    </div>`;
                strategyGrid.appendChild(card);
            });
        }
    };
    
    const fetchStrategies = async () => { /* ... (This function remains the same) ... */ };
    const createProxyWallet = async () => { /* ... (This function remains the same) ... */ };
    const handleActivateStrategy = async (event) => { /* ... (This function remains the same) ... */ };

    const checkUserProxyWallet = async () => {
        const openModalBtn = strategiesSection.querySelector('.cta-button');
        console.log("Checking for Strato Wallet...");
        userProxyAddress = await factoryContract.wallets(userAddress);

        if (userProxyAddress && userProxyAddress !== ethers.constants.AddressZero) {
            openModalBtn.textContent = "+ Create New Strategy";
            openModalBtn.onclick = () => modal.classList.remove('hidden');
        } else {
            openModalBtn.textContent = "Create Your Strato Wallet";
            openModalBtn.onclick = createProxyWallet;
        }
    };
    
    async function init() {
        if (typeof window.ethereum === 'undefined') { alert("MetaMask is not installed."); return; }
        try {
            provider = new ethers.providers.Web3Provider(window.ethereum);
            const network = await provider.getNetwork();
            if (network.chainId !== BASE_SEPOLIA_CHAIN_ID) {
                document.body.innerHTML = `<h1 style="color:white; text-align:center; margin-top: 50px;">Please switch to Base Sepolia and refresh.</h1>`;
                return;
            }
            signer = provider.getSigner();
            userAddress = await signer.getAddress();
            if (!factoryAddress || factoryAddress === "YOUR_STRATO_FACTORY_CONTRACT_ADDRESS") throw new Error("Factory address is not set.");
            
            factoryContract = new ethers.Contract(factoryAddress, factoryABI, signer);
            
            await checkUserProxyWallet();
            await fetchStrategies();
            
            closeModalBtn.addEventListener('click', () => modal.classList.add('hidden'));
            modal.addEventListener('click', (event) => { if (event.target === modal) modal.classList.add('hidden'); });
            activateStrategyBtn.addEventListener('click', handleActivateStrategy);

        } catch (error) {
            console.error("Critical initialization error:", error);
            document.body.innerHTML = `<h1 style="color:red; text-align:center; margin-top: 50px;">Error: ${error.message}</h1>`;
        }
    }
    init();
});
