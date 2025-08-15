document.addEventListener('DOMContentLoaded', async () => {
    const openModalBtn = document.getElementById('open-modal-btn');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const modal = document.getElementById('strategy-modal');

    // --- Contract Information ---
    // !!! IMPORTANT: Replace with your deployed StratoFactory address
    const factoryAddress = "0xc342129C33b1090091B21c022e59b071937D51Ae"; 
    const factoryABI = [
        {"inputs":[],"name":"createProxyWallet","outputs":[],"stateMutability":"nonpayable","type":"function"},
        {"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"wallets","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"}
    ];

    let provider;
    let signer;
    let factoryContract;
    let userAddress;

    if (typeof window.ethereum !== 'undefined') {
        // Connect to the blockchain
        provider = new ethers.providers.Web3Provider(window.ethereum);
        signer = provider.getSigner();
        factoryContract = new ethers.Contract(factoryAddress, factoryABI, signer);
        
        try {
            const accounts = await provider.listAccounts();
            if (accounts.length > 0) {
                userAddress = accounts[0];
                console.log("User is connected:", userAddress);
                await checkUserProxyWallet();
            } else {
                console.log("User is not connected.");
                window.location.href = '/'; 
            }
        } catch (error) {
            console.error("Error checking connection:", error);
            window.location.href = '/';
        }
    } else {
        console.log("MetaMask is not installed.");
        window.location.href = '/';
    }

    // --- Main Functions ---
    const checkUserProxyWallet = async () => {
        console.log("Checking for existing Strato Wallet...");
        try {
            const proxyAddress = await factoryContract.wallets(userAddress);
            if (proxyAddress !== ethers.constants.AddressZero) {
                console.log("Strato Wallet found at:", proxyAddress);
                openModalBtn.textContent = "+ Create New Strategy";
                openModalBtn.onclick = () => modal.classList.remove('hidden');
            } else {
                console.log("No Strato Wallet found for this user.");
                openModalBtn.textContent = "Create Your Strato Wallet";
                openModalBtn.onclick = createProxyWallet;
            }
        } catch (error) {
            console.error("Could not check for wallet:", error);
            alert("Error checking for your Strato Wallet. Make sure you are on the Base Sepolia network.");
        }
    };

    const createProxyWallet = async () => {
        console.log("Creating Strato Wallet...");
        openModalBtn.textContent = "Creating... (Check Wallet)";
        openModalBtn.disabled = true;
        try {
            const tx = await factoryContract.createProxyWallet();
            console.log("Transaction sent:", tx.hash);
            await tx.wait(); // Wait for transaction to be mined
            console.log("Transaction confirmed!");
            alert("Your personal Strato Smart Wallet has been created successfully!");
            await checkUserProxyWallet(); // Re-check to update the button
        } catch (error) {
            console.error("Error creating Strato Wallet:", error);
            alert("Failed to create Strato Wallet. See console for details.");
        } finally {
            openModalBtn.disabled = false;
        }
    };

    // --- Event Listeners for Modal ---
    closeModalBtn.addEventListener('click', () => modal.classList.add('hidden'));
    modal.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.classList.add('hidden');
        }
    });
});
