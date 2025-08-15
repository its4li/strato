document.addEventListener('DOMContentLoaded', () => {
    // --- Element Selections ---
    const strategiesSection = document.querySelector('.strategies-section');
    // Note: Modal elements are selected after they are confirmed to exist.

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
        // This function dynamically builds the strategy display area
        strategiesSection.innerHTML = `
            <h2 class="section-title">Active Strategies</h2>
            <div class="empty-state">
                <p>Your automated strategies will appear here.</p>
                <button class="cta-button" id="open-modal-btn">+ Create New Strategy</button>
            </div>
            <div class="strategy-grid"></div>
        `;

        const emptyState = strategiesSection.querySelector('.empty-state');
        const strategyGrid = strategiesSection.querySelector('.strategy-grid');
        const openModalBtn = document.getElementById('open-modal-btn'); // Re-select button after creation

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
        
        // Always make sure the button can open the modal if a proxy exists
        if (userProxyAddress && userProxyAddress !== ethers.constants.AddressZero) {
            openModalBtn.textContent = "+ Create New Strategy";
            openModalBtn.onclick = () => document.getElementById('strategy-modal').classList.remove('hidden');
        } else {
            openModalBtn.textContent = "Create Your Strato Wallet";
            openModalBtn.onclick = createProxyWallet;
        }
    };
    
    const fetchStrategies = async () => {
        if (!userAddress) return;
        try {
            console.log(`Fetching strategies for: ${userAddress}`);
            const response = await fetch(`/api/strategies/list?owner_address=${userAddress}`);
            if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
            const strategies = await response.json();
            console.log("Found strategies:", strategies);
            displayStrategies(strategies);
        } catch (error) {
            console.error("Failed to fetch strategies:", error);
            displayStrategies([]); // Display empty state on failure
        }
    };
    
    const checkUserProxyWallet = async () => {
        console.log("Checking for Strato Wallet...");
        userProxyAddress = await factoryContract.wallets(userAddress);
    };

    const createProxyWallet = async () => {
        const createBtn = document.getElementById('open-modal-btn');
        createBtn.textContent = "Creating... (Check Wallet)";
        createBtn.disabled = true;
        try {
            const tx = await factoryContract.createProxyWallet();
            await tx.wait();
            alert("Your Strato Smart Wallet created successfully!");
            await init(); // Re-initialize the dashboard
        } catch (error) {
            console.error("Error creating Strato Wallet:", error);
            alert("Failed to create Strato Wallet.");
        } finally {
            createBtn.disabled = false;
        }
    };

    const handleActivateStrategy = async (event) => {
        event.preventDefault();
        const activateStrategyBtn = event.target;
        activateStrategyBtn.textContent = "Activating...";
        activateStrategyBtn.disabled = true;

        const strategyData = {
            owner_address: userAddress, proxy_address: userProxyAddress,
            token_in_address: "0xAddressOfUSDC_Testnet", token_out_address: "0xAddressOfWETH_Testnet",
            amount_in: document.getElementById('spend-amount').value, frequency_hours: 24 * 7,
        };
        console.log("Sending data to API:", strategyData);

        try {
            if (!strategyData.proxy_address || strategyData.proxy_address === ethers.constants.AddressZero) throw new Error("Proxy address is missing.");
            const response = await fetch('/api/strategies/create', {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(strategyData),
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.error || 'API request failed.');
            alert("Strategy created successfully!");
            document.getElementById('strategy-modal').classList.add('hidden');
            await fetchStrategies();
        } catch (error) {
            console.error("Error activating strategy:", error);
            alert(`Error: ${error.message}`);
        } finally {
            activateStrategyBtn.textContent = "Activate Strategy";
            activateStrategyBtn.disabled = false;
        }
    };

    async function init() {
        console.log("Initializing Dashboard...");
        if (typeof window.ethereum === 'undefined') {
            alert("MetaMask is not installed.");
            return;
        }

        try {
            provider = new ethers.providers.Web3Provider(window.ethereum);
            const network = await provider.getNetwork();
            if (network.chainId !== BASE_SEPOLIA_CHAIN_ID) {
                 document.body.innerHTML = `<h1 style="color:white; text-align:center; margin-top: 50px;">Please switch to Base Sepolia and refresh.</h1>`;
                 return;
            }
            
            signer = provider.getSigner();
            userAddress = await signer.getAddress();
            console.log("User account:", userAddress);
            
            if (!factoryAddress || factoryAddress === "YOUR_STRATO_FACTORY_CONTRACT_ADDRESS") throw new Error("Factory address is not set.");
            
            factoryContract = new ethers.Contract(factoryAddress, factoryABI, signer);
            console.log("Factory contract initialized.");
            
            await checkUserProxyWallet();
            await fetchStrategies();
            
            // --- Setup Event Listeners after elements are confirmed to exist ---
            const modal = document.getElementById('strategy-modal');
            const closeModalBtn = document.getElementById('close-modal-btn');
            const activateStrategyBtn = document.querySelector('.modal-action-btn');
            
            closeModalBtn.addEventListener('click', () => modal.classList.add('hidden'));
            modal.addEventListener('click', (event) => {
                if (event.target === modal) modal.classList.add('hidden');
            });
            activateStrategyBtn.addEventListener('click', handleActivateStrategy);

        } catch (error) {
            console.error("Critical initialization error:", error);
            document.body.innerHTML = `<h1 style="color:red; text-align:center; margin-top: 50px;">Error: ${error.message}</h1>`;
        }
    }
    
    init();
});
