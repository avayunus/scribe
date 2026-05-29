import { ItemView, Notice, Plugin, WorkspaceLeaf } from "obsidian";

const VIEW_TYPE_TIMER_BAR = "timer-bar-view";

export default class TimerBarPlugin extends Plugin {
	async onload() {
		console.log("Timer Bar plugin loaded");

		this.registerView(
			VIEW_TYPE_TIMER_BAR,
			(leaf) => new TimerBarView(leaf)
		);

		this.addCommand({
			id: "open-timer-bar",
			name: "Open timer bar",
			callback: () => {
				this.activateView();
			},
		});

		this.addRibbonIcon("timer", "Open timer bar", () => {
			this.activateView();
		});

		await this.activateView();
	}

	onunload() {
		console.log("Timer Bar plugin unloaded");
	}

	async activateView() {
		const existingLeaves = this.app.workspace.getLeavesOfType(VIEW_TYPE_TIMER_BAR);

		const existingLeaf = existingLeaves[0];

		if (existingLeaf) {
			this.app.workspace.revealLeaf(existingLeaf);
			return;
		}
		
		const leaf = this.app.workspace.getRightLeaf(false);

		if (!leaf) {
			new Notice("Could not open timer bar.");
			return;
		}

		await leaf.setViewState({
			type: VIEW_TYPE_TIMER_BAR,
			active: true,
		});

		this.app.workspace.revealLeaf(leaf);
	}
}

class TimerBarView extends ItemView {
	private statusText!: HTMLElement;
	private timerInterval: number | null = null;
	private seconds = 0;
	private isPaused = false;

	constructor(leaf: WorkspaceLeaf) {
		super(leaf);
	}

	getViewType() {
		return VIEW_TYPE_TIMER_BAR;
	}

	getDisplayText() {
		return "Timer Bar";
	}

	getIcon() {
		return "timer";
	}

	async onOpen() {
		const container = this.contentEl;
		container.empty();

		const wrapper = container.createDiv({
			cls: "timer-bar-wrapper",
		});

		wrapper.createEl("h3", {
			text: "Timer",
		});

		this.statusText = wrapper.createEl("div", {
			cls: "timer-bar-status",
			text: "00:00",
		});

		const buttonContainer = wrapper.createDiv({
			cls: "timer-bar-buttons",
		});

		const startButton = buttonContainer.createEl("button", {
			text: "Start",
			cls: "timer-bar-button",
		});

		const pauseButton = buttonContainer.createEl("button", {
			text: "Pause",
			cls: "timer-bar-button",
		});

		const stopButton = buttonContainer.createEl("button", {
			text: "Stop",
			cls: "timer-bar-button",
		});

		startButton.addEventListener("click", () => {
			this.startTimer();
		});

		pauseButton.addEventListener("click", () => {
			this.pauseTimer();
		});

		stopButton.addEventListener("click", () => {
			this.stopTimer();
		});
	}

	async onClose() {
		this.clearTimer();
	}

	private startTimer() {
		if (this.timerInterval !== null) {
			return;
		}

		this.isPaused = false;

		this.timerInterval = window.setInterval(() => {
			this.seconds++;
			this.updateDisplay();
		}, 1000);

		new Notice("Timer started");
	}

	private pauseTimer() {
		if (this.timerInterval === null) {
			return;
		}

		this.clearTimer();
		this.isPaused = true;

		new Notice("Timer paused");
	}

	private stopTimer() {
		this.clearTimer();

		this.seconds = 0;
		this.isPaused = false;

		this.updateDisplay();

		new Notice("Timer stopped");
	}

	private clearTimer() {
		if (this.timerInterval !== null) {
			window.clearInterval(this.timerInterval);
			this.timerInterval = null;
		}
	}

	private updateDisplay() {
		const minutes = Math.floor(this.seconds / 60);
		const remainingSeconds = this.seconds % 60;

		const formattedTime = `${minutes.toString().padStart(2, "0")}:${remainingSeconds
			.toString()
			.padStart(2, "0")}`;

		this.statusText.setText(formattedTime);
	}
}