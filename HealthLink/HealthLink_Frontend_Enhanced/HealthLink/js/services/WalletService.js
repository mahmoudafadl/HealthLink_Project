/* ============================================================
   HEALTHLINK — WALLET SERVICE
   Business logic for wallet top-ups and deductions.
============================================================ */

const WalletService = (() => {

  /**
   * Top up the patient wallet.
   * @param {number} amount - Amount in EGP.
   */
  function topUp(amount) {
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    Database.wallet.balance += amount;

    Database.walletTransactions.unshift({
      type: 'topup',
      desc: 'Bank Transfer Top-up',
      amount,
      date: '13 Apr 2026'
    });

    Database.activityLogs.unshift({
      type: 'payment',
      user: 'Sarah Mohamed',
      action: `Wallet top-up: EGP ${amount} via bank transfer`,
      time: now,
      date: '13 Apr 2026'
    });

    return { success: true, message: `EGP ${amount} added to your wallet! 💰` };
  }

  /**
   * Deduct an amount from wallet (e.g. for nurse services).
   * @param {number} amount
   * @param {string} description
   */
  function deduct(amount, description) {
    Database.wallet.balance -= amount;
    Database.walletTransactions.unshift({
      type: 'deduct',
      desc: description,
      amount,
      date: '13 Apr 2026'
    });
  }

  function getBalance() {
    return Database.wallet.balance;
  }

  return { topUp, deduct, getBalance };
})();

export default WalletService;
window.WalletService = WalletService;
