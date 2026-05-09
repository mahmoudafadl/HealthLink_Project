/* ============================================================
   HEALTHLINK — WALLET MODEL
   Defines the shape of wallet and transaction entities.

   Wallet {
     balance: number   // EGP
   }

   WalletTransaction {
     type:   'topup' | 'deduct',
     desc:   string,
     amount: number,
     date:   string
   }
============================================================ */
