document.addEventListener('DOMContentLoaded', () => {
    const hamburgerBtn = document.getElementById('hamburger-menu');
    const portfolioList = document.getElementById('portfolio-list');

    let provider, userAddress;

    hamburgerBtn.addEventListener('click', () => {
        document.body.classList.toggle('sidebar-open');
    });

    const fetchPortfolio = async () => {
        if (!userAddress) return;
        portfolioList.innerHTML = `<div class="loading-state"><p>Loading your tokens...</p></div>`;

        try {
            // Step 1: Fetch token balances from our Alchemy API
            const balanceRes = await fetch(`/api/portfolio/balances?address=${userAddress}`);
            if (!balanceRes.ok) throw new Error('Failed to fetch balances');
            const balanceData = await balanceRes.json();

            // Filter out tokens with zero balance and get contract addresses
            const tokensWithBalance = balanceData.tokenBalances.filter(token => 
                token.tokenBalance !== "0x0000000000000000000000000000000000000000000000000000000000000000"
            );
            const tokenContracts = tokensWithBalance.map(token => token.contractAddress).join(',');

            if (!tokenContracts) {
                portfolioList.innerHTML = `<div class="loading-state"><p>No tokens with a balance found.</p></div>`;
                return;
            }

            // Step 2: Fetch prices for those tokens from our CoinGecko API
            const priceRes = await fetch(`/api/portfolio/prices?addresses=${tokenContracts}`);
            if (!priceRes.ok) throw new Error('Failed to fetch prices');
            const priceData = await priceRes.json();

            // Step 3: Combine and display the data
            const portfolio = tokensWithBalance.map(token => {
                const priceInfo = priceData[token.contractAddress.toLowerCase()];
                const price = priceInfo ? priceInfo.usd : 0;
                
                // We need token metadata (symbol, decimals) for accurate formatting
                // For this demo, we'll make some assumptions
                const balance = parseFloat(ethers.utils.formatUnits(token.tokenBalance, 18)).toFixed(4);
                const value = (parseFloat(balance) * price).toFixed(2);

                return {
                    symbol: 'TOKEN', // Replace with actual symbol later
                    address: token.contractAddress,
                    balance: balance,
                    value: value,
                    icon: `https://via.placeholder.com/32`
                };
            }).filter(token => token.value > 1.00); // Filter out dust balances

             portfolioList.innerHTML = ''; // Clear loading state
            if (portfolio.length === 0) {
                 portfolioList.innerHTML = `<div class="loading-state"><p>No valuable tokens found.</p></div>`;
                 return;
            }

            portfolio.forEach(token => {
                const row = document.createElement('div');
                row.className = 'token-row';
                row.innerHTML = `
                    <div class="token-name-cell">
                        <img src="${token.icon}" alt="${token.symbol}" class="token-icon">
                        <span class="token-symbol">${token.symbol}</span>
                    </div>
                    <div class="token-balance">${token.balance}</div>
                    <div class="token-value">$${token.value}</div>
                `;
                portfolioList.appendChild(row);
            });

        } catch (error) {
            console.error("Failed to fetch portfolio:", error);
            portfolioList.innerHTML = `<div class="loading-state"><p>Could not load portfolio. Please try again.</p></div>`;
        }
    };

    async function init() {
        if (typeof window.ethereum !== 'undefined') {
            try {
                provider = new ethers.providers.Web3Provider(window.ethereum);
                const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                if (accounts.length > 0) {
                    userAddress = accounts[0];
                    await fetchPortfolio();
                } else {
                    window.location.href = '/'; 
                }
            } catch (error) {
                window.location.href = '/';
            }
        } else {
            window.location.href = '/';
        }
    }

    init();
});
