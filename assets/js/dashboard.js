document.addEventListener('DOMContentLoaded', async () => {
    // --- Element Selections ---
    const openModalBtn = document.getElementById('open-modal-btn');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const modal = document.getElementById('strategy-modal');
    const activateStrategyBtn = document.querySelector('.modal-action-btn');

    // --- Contract Information ---
    const factoryAddress = "0xc342129C33b1090091B21c022e59b071937D51Ae";
    const factoryABI = [
        {"inputs":[],"name":"createProxyWallet","outputs":[],"stateMutability":"nonpayable","type":"function"},
        {"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"wallets","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"}
    ];

    let provider, signer, factoryContract, userAddress, userProxyAddress;

    // --- Initialization ---
    async function init() {
        if (typeof window.ethereum === 'undefined') {
            alert("MetaMask is not installed.");
            return window.location.href = '/';
        }

        provider = new ethers.providers.Web3Provider(window.ethereum);
        signer = provider.getSigner();
        
        try {
            const accounts = await provider.listAccounts();
            if (accounts.length > 0) {
                userAddress = accounts[0];
                factoryContract = new ethers.Contract(factoryAddress, factoryABI, signer);
                await checkUserProxyWallet();
            } else {
                window.location.href = '/';
            }
        } catch (error) {
            console.error("Initialization error:", error);
            window.location.href = '/';
        }
    }

    // --- Main Functions ---
    const checkUserProxyWallet = async () => {
        console.log("Checking for existing Strato Wallet...");
        userProxyAddress = await factoryContract.wallets(userAddress);

        if (userProxyAddress !== ethers.constants.AddressZero) {
            console.log("Strato Wallet found at:", userProxyAddress);
            openModalBtn.textContent = "+ Create New Strategy";
            openModalBtn.onclick = () => modal.classList.remove('hidden');
        } else {
            console.log("No Strato Wallet found for this user.");
            openModalBtn.textContent = "Create Your Strato Wallet";
            openModalBtn.onclick = createProxyWallet;
        }
    };

    const createProxyWallet = async () => {
        // ... (this function remains the same)
    };
    
    // --- NEW: Function to handle strategy activation ---
    const handleActivateStrategy = async (event) => {
        event.preventDefault(); // Prevent form from submitting normally
        console.log("Activating strategy...");
        activateStrategyBtn.textContent = "Activating...";
        activateStrategyBtn.disabled = true;

        // In a real app, you would get these from the form
        const strategyData = {
            owner_address: userAddress,
            proxy_address: userProxyAddress,
            token_in_address: "0xAddressOfUSDC", // Placeholder
            token_out_address: "0xAddressOfWETH", // Placeholder
            amount_in: document.getElementById('spend-amount').value,
            frequency_hours: 24 * 7, // Placeholder for 'weekly'
        };

        try {
            const response = await fetch('/api/strategies/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(strategyData),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Failed to create strategy.');
            }

            console.log("API Response:", result);
            alert("Strategy created and saved successfully!");
            modal.classList.add('hidden');
            // Here, you would ideally refresh the dashboard to show the new strategy
            
        } catch (error) {
            console.error("Error activating strategy:", error);
            alert(`Error: ${error.message}`);
        } finally {
            activateStrategyBtn.textContent = "Activate Strategy";
            activateStrategyBtn.disabled = false;
        }
    };

    // --- Event Listeners ---
    closeModalBtn.addEventListener('click', () => modal.classList.add('hidden'));
    modal.addEventListener('click', (event) => {
        if (event.target === modal) modal.classList.add('hidden');
    });
    activateStrategyBtn.addEventListener('click', handleActivateStrategy);

    // --- Start the app ---
    init();
});
