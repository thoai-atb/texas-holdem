import { capitalize, getAlignedTable, monetary } from "../utils.js";
import chalk from "chalk";

class GameState {
  constructor() {
    this.printedState = "";
    this.heroIndex = undefined;
    this.message = ""; // message to display
    this.colorful = true; // cards have color?
    this.earlyFold = false; // hero wants to fold before his turn?
    this.earlyReady = false; // hero wants to ready before round end?
  }

  updateState(gameState) {
    this.deck = gameState.deck;
    this.players = gameState.players;
    this.bets = gameState.bets;
    this.betTypes = gameState.betTypes;
    this.playersRanking = gameState.playersRanking;
    this.board = gameState.board;
    this.turnIndex = gameState.turnIndex;
    this.buttonIndex = gameState.buttonIndex;
    this.isPlaying = gameState.playing;
    this.currentBetSize = gameState.currentBetSize;
    this.pot = gameState.pot;
    this.showDown = gameState.showDown;
    this.availableActions = gameState.availableActions;
    this.bigblindSize = gameState.bigblindSize;
    this.winners = gameState.winners;
    this.completeActionSeat = gameState.completeActionSeat;
    this.allPlayersAllIn = gameState.allPlayersAllIn;
  }

  updateHeroIndex(heroIndex) {
    this.heroIndex = heroIndex; // index of the player who is playing
  }

  updateMessage(message) {
    this.message = message;
    setTimeout(() => {
      if (this.message === message) this.message = "";
    }, 3000);
  }

  updatePrintedState() {
    const printedState = this.getPrintedState();
    if (this.printedState === printedState) return false;
    this.printedState = printedState;
    return true;
  }

  getAvailableAction(...actionTypes) {
    return this.availableActions.find(action => actionTypes.includes(action.type));
  }

  isHeroTurn() {
    return this.heroIndex === this.turnIndex;
  }

  isHeroPlaying() {
    const hero = this.getHero();
    return hero.cards.length > 0 && !hero.folded;
  }

  getHero() {
    return this.players[this.heroIndex];
  }

  getHeroBet() {
    return this.bets[this.heroIndex];
  }

  getPrintedAction(idx) {
    if (this.turnIndex === idx) return "Pending";
    if (this.players[idx].folded) return "";
    if (this.betTypes[idx]) return capitalize(this.betTypes[idx]);
    return "";
  }

  getPrintedAmount(idx) {
    if (this.bets[idx]) return `${monetary(this.bets[idx])}`;
    return "";
  }

  getPrintedPlayerHand(idx) {
    if (this.players[idx].folded) return "";
    if (this.showDown || this.heroIndex === idx || this.allPlayersAllIn) {
      return this.getPrintedCards(this.players[idx].cards);
    }
    if (this.players[idx].cards.length) return "XX XX";
    return "";
  }

  getPrintedCards(cards) {
    return cards
      .map((card) => {
        let cardStr = card.value + card.suit;
        if (this.colorful) {
          if (["♥", "♦"].includes(card.suit)) cardStr = chalk.red(cardStr);
          else cardStr = chalk.green(cardStr);
        }
        return cardStr;
      })
      .join(" ");
  }

  getPrintedOptions() {
    const actions = [];
    this.availableActions.forEach((action) => {
      if (action.type === "raise" || action.type === "bet") {
        const minSize = action.minSize + this.currentBetSize;
        const maxSize = action.maxSize + this.currentBetSize;
        if (minSize === maxSize) actions.push(`${action.type} ${monetary(minSize)}`);
        else actions.push(`${action.type} ${monetary(minSize)} - ${monetary(maxSize)}`);
      } else if (action.type === "call") {
        const toCall = Math.min(this.currentBetSize, this.getHero().stack + this.getHeroBet());
        actions.push(`${action.type} ${monetary(toCall)} (Enter)`);
      } else if (action.type === "check") {
        actions.push(`${action.type} (Enter)`);
      } else {
        actions.push(`${action.type}`);
      }
    });
    return actions.map(action => `${action}`).join(" / ");
  }

  getPrintedState() {
    if (!this.players) return "";
    if (!this.board) return "";

    // Get list of players rotated with Hero at the bottom
    const playersToDisplayHeroAndBefore = [];
    const playersToDisplayAfterHero = [];
    let heroFound = false;
    this.players.forEach((player) => {
      if (!player) return;
      const idx = player.seatIndex;
      const playerData = {
        name: player.name,
        hand: this.getPrintedPlayerHand(idx),
      };
      if (!this.isPlaying) {
        playerData.action = player.ready ? "Ready" : "";
      } else if (this.showDown) {
        const result = this.winners.find((winner) => winner.index === idx);
        if (result) {
          playerData.action =
            result.type.toUpperCase() +
            " " +
            this.getPrintedCards(result.cards);
          playerData.amount = `+${monetary(Math.round(this.pot / this.winners.length))}`;
        } else {
          playerData.action = "";
          playerData.amount = "";
        }
      } else {
        playerData.action = this.getPrintedAction(idx);
        playerData.amount = this.getPrintedAmount(idx);
      }
      playerData.stack = `${monetary(player.stack)}`;
      playerData.rank = this.playersRanking[idx] || "";

      if (heroFound) playersToDisplayAfterHero.push(playerData);
      else {
        if (idx === this.heroIndex) heroFound = true;
        playersToDisplayHeroAndBefore.push(playerData);
      }
    });
    const playersToDisplay = [
      ...playersToDisplayAfterHero,
      ...playersToDisplayHeroAndBefore,
    ];
    const playerTable = getAlignedTable(playersToDisplay);
    const board = this.board.length ? this.getPrintedCards(this.board) : "-";
    const blind = `${monetary(this.bigblindSize / 2)} / ${monetary(this.bigblindSize)}`;
    const pot = monetary(this.pot);
    const optionsIfExist = this.isHeroTurn() ? `Options: ${this.getPrintedOptions()}` : "";
    const pressEnterToReady = !this.isPlaying && !this.getHero()?.ready ? "Press Enter to ready" : "";
    return `${playerTable}\n\nBoard: ${board}\nPot: ${pot}\nBlind: ${blind}\nMessage: ${this.message || "-"}\n${optionsIfExist}${pressEnterToReady}`;
  }
}

export default GameState;
