export const memberMarkup = () => `
<dialog id="memberDialog" class="member-dialog" aria-labelledby="memberTitle">
  <button class="dialog-close" data-member-close aria-label="Chiudi accesso">×</button>
  <span class="eyebrow">IL TUO ACCOUNT SHIFT FLOW</span>
  <h2 id="memberTitle">Il metodo.<br><em>Anche all’ascolto.</em></h2>
  <p>Accedi qui, senza un’area separata. Il codice riportato nel libro sblocca quattro guide e il 25% su un solo kit PDF, una volta per account. Il bundle e gli acquisti su Amazon sono esclusi.</p>
  <p id="memberStatus" class="form-status" role="status" aria-live="polite">Verifica dell’accesso…</p>
  <form id="memberEmailForm" hidden><label for="memberEmail">La tua email</label><input id="memberEmail" type="email" autocomplete="email" maxlength="254" required/><p class="form-note">Riceverai un codice di accesso. La registrazione non ti iscrive a una newsletter e non verifica un acquisto su Amazon.</p><button class="button primary wide" type="submit">Invia il codice di accesso</button></form>
  <form id="memberOtpForm" hidden><label for="memberOtp">Codice ricevuto via email</label><input id="memberOtp" inputmode="numeric" autocomplete="one-time-code" pattern="[0-9]{6,10}" minlength="6" maxlength="10" required/><button class="button primary wide" type="submit">Conferma e accedi</button><button type="button" class="text-link" id="changeMemberEmail">Cambia email</button></form>
  <section id="memberAccount" hidden><p id="memberEmailLabel"></p><form id="bookCodeForm"><label for="bookCode">Il codice stampato nel libro</label><input id="bookCode" type="text" maxlength="40" autocomplete="off" spellcheck="false" required/><button class="button primary wide" type="submit">Sblocca i contenuti del libro</button></form><p id="memberBenefits" class="member-benefits"></p><h3>I tuoi acquisti</h3><div id="memberOrders"></div><button id="memberLogout" class="text-link" type="button">Esci dall’account</button></section>
</dialog>`;
