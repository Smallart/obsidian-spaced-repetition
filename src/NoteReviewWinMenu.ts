import { App, ButtonComponent, MarkdownView, TFile, Notice } from "obsidian";
import { NoteReviewWin } from "./NoteReviewWin";
import SRPlugin from "./main";
import { ReviewResponse } from "./scheduling";

export class WinMenu {
    app: App;
    doc: Document;
    winObj: NoteReviewWin;
    plugin: SRPlugin;
    constructor(app: App, document: Document, winObj: NoteReviewWin, plugin: SRPlugin) {
        this.app = app;
        this.doc = document;
        this.winObj = winObj;
        this.plugin = plugin;
        this.init();
    }

    init() {
        const markdownn = this.app.workspace.getActiveViewOfType(MarkdownView);
        if (markdownn) {
            const menu = this.doc.getElementById("menuModalBar");
            if (menu) return;
            this.generateMenu();
        } else {
            this.selfDesctory();
        }
    }

    generateMenu() {
        const menu = createDiv();
        if (menu) {
            menu.setAttribute("style", "position: absolute; left: calc(50% - calc( 200px / 2));bottom:1em;height:30px;z-index:1;width:200px");
        }

        
        const easeButton = new ButtonComponent(menu);
        easeButton.setButtonText("简单").onClick(() => {
            this.gradeNote(ReviewResponse.Easy);
        });
        const goodButton = new ButtonComponent(menu);
        goodButton.setButtonText("良好").onClick(() => {
            // const openFile: TFile | null = this.app.workspace.getActiveFile();
            //调用其它的方法可以，但是自己注册的不行
            // app.commands.executecommandById("SR:srs-note-review-easy");
            this.gradeNote(ReviewResponse.Good);
        });
        const hardButton = new ButtonComponent(menu);
        hardButton.setButtonText("困难").onClick(() => {
            this.gradeNote(ReviewResponse.Hard);
        });
        const skipButtnon = new ButtonComponent(menu);
        skipButtnon.setButtonText("skip").onClick(() => {
            this.winObj.next();
        });
        menu.setAttribute("id", "menuModalBar");
        // 插入文档中
        this.doc.body.querySelector(".mod-vertical.mod-root")?.insertAdjacentElement("afterbegin", menu);
    }

    selfDesctory() {
        const menuBar = this.doc.getElementById("menuModalBar");
        if (menuBar) {
            menuBar.remove();
        }
    }

    async gradeNote(reviewResponse: ReviewResponse) {
        if (this.winObj.currentNoteIndex > this.winObj.wholeNoteNumber) {
            new Notice("复习完毕");
            return;
        }
        const openFile: TFile | null = this.app.workspace.getActiveFile();
        if (openFile && openFile.extension === "md") {
            await this.plugin.saveReviewResponse(openFile, reviewResponse);
        }
        this.winObj.next();
    }
}