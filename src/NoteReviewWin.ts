import { TFile, WorkspaceLeaf,Notice} from "obsidian";
import { ReviewDeck } from "./ReviewDeck";
import { t } from "src/lang/helpers";
import {WinMenu} from "./NoteReviewWinMenu";
import SRPlugin from "./main";

export class NoteReviewWin {
    plugin:SRPlugin;
    currentLeaf: WorkspaceLeaf;
    win: Window;
    doc: Document;
    notes: Array<TFile>;
    wholeNoteNumber: number;
    currentNoteIndex: number;
    constructor(win: Window, doc: Document, leaf: WorkspaceLeaf, deck: ReviewDeck,plugin:SRPlugin) {
        this.win = win;
        this.doc = doc;
        this.currentLeaf = leaf;
        this.plugin = plugin;
        this.loadNodesInfo(deck);
        this.initWin();
        this.changeStyle();
        this.loadFile();
    }

    async initWin() {
        const curWin = this.win.window.require("electron").remote.getCurrentWindow();
        // 设置大小
        curWin.setSize(800, 600);
        // 居中
        curWin.center();
        // focus
        // curWin.focus();
        //最上层
        curWin.setAlwaysOnTop(true);
    }

    changeStyle() {
        const newTabHTML = this.doc.querySelector(".workspace-tab-header-new-tab");
        const tabHeader = this.doc.querySelector(".workspace-tab-header-container-inner");
        newTabHTML.detach();
        tabHeader.detach();
    }

    loadNodesInfo(deck: ReviewDeck) {
        const noteArr = new Array<TFile>();
        
        for(let i=0;i<deck.dueNotesCount;i++){
            noteArr.push(deck.scheduledNotes[i++].note);
        }
        this.notes = noteArr.concat(deck.newNotes);
        this.wholeNoteNumber = deck.dueNotesCount + deck.newNotes.length;
        this.currentNoteIndex = 0;
    }

    async loadFile() {
        if (this.currentNoteIndex >= this.wholeNoteNumber) {
            new Notice(t("ALL_CAUGHT_UP"));
        }
        const file = this.notes[this.currentNoteIndex++];
        await this.currentLeaf.openFile(file);
        await this.currentLeaf.setViewState({type:"markdown",state:{mode:"preview"}});
        new WinMenu(this.currentLeaf.view.app,this.doc,this,this.plugin);
    }

    async next(){
        if (this.currentNoteIndex >= this.wholeNoteNumber) {
            new Notice(t("ALL_CAUGHT_UP"));
            // 拦阻下一次
            this.currentNoteIndex++;
            return;
        }
        const file = this.notes[this.currentNoteIndex++];
        await this.currentLeaf.openFile(file);
    }
}